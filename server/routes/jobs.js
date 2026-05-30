import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JOBS } from '../../src/data/jobs.js';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-new');

const router = express.Router();

// In-memory storage (file never touches disk)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── POST /api/jobs/match-resume ───────────────────────────────────────────────
// Body: multipart — resume (PDF file) + jobId (string)
router.post('/match-resume', upload.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.body;
    const file = req.file;

    if (!jobId)  return res.status(400).json({ message: 'jobId is required.' });

    const job = JOBS.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    let resumeText = '';

    if (file) {
      // ── Parse resume text from PDF ───────────────────────────────────────────
      try {
        const parsed = await pdfParse(file.buffer);
        resumeText = parsed.text?.trim();
      } catch (err) {
        console.error('[jobs.js] pdf-parse error:', err);
        return res.status(422).json({ message: 'Could not parse the PDF. Please upload a valid resume.' });
      }
    } else {
      // Look up user from token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No resume file provided and no active session.' });
      }
      try {
        const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
        const result = await pool.query('SELECT resume_text FROM users WHERE id = $1', [payload.id]);
        if (result.rows.length === 0 || !result.rows[0].resume_text) {
          return res.status(404).json({ message: 'No saved resume found in your profile.' });
        }
        resumeText = result.rows[0].resume_text;
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(422).json({ message: 'Resume appears to be empty or unreadable. Please upload a text-based PDF.' });
    }

    // ── Score with Gemini ────────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a strict but fair recruiter evaluating how well a candidate's resume matches a job description.

JOB DESCRIPTION:
"""
${job.jd}
"""

CANDIDATE RESUME:
"""
${resumeText.slice(0, 6000)}
"""

Analyze the match and respond ONLY with valid JSON in this exact format (no markdown, no explanation outside the JSON):
{
  "score": <integer 0-100>,
  "strengths": [<up to 3 short strings of what matches well>],
  "gaps": [<up to 3 short strings of what is missing or weak>],
  "summary": "<one sentence overall assessment>"
}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps it
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Gemini raw response:', raw);
      return res.status(502).json({ message: 'AI returned an unexpected response. Please try again.' });
    }

    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    return res.json({
      score,
      strengths: parsed.strengths || [],
      gaps: parsed.gaps || [],
      summary: parsed.summary || '',
      jobTitle: job.title,
      company: job.company,
    });
  } catch (err) {
    console.error('match-resume error:', err);
    res.status(500).json({ message: 'Server error during resume scoring.' });
  }
});

export default router;
