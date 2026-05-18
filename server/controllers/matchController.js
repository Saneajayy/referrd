const pool = require('../config/db');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const matchResume = async (req, res) => {
  const { job_id } = req.body;
  try {
    // 1. Fetch user's resume_url
    const userRes = await pool.query('SELECT resume_url FROM users WHERE id = $1', [req.user]);
    const resume_url = userRes.rows[0]?.resume_url;

    if (!resume_url) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first' });
    }

    // 2. Fetch job JD
    const jobRes = await pool.query('SELECT jd FROM jobs WHERE id = $1', [job_id]);
    const jd = jobRes.rows[0]?.jd;

    if (!jd) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // 3. Download PDF
    const response = await fetch(resume_url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Extract text from PDF
    const pdfData = await pdfParse(buffer);
    const resume_text = pdfData.text;

    // 5. Send to Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a resume screener. Given the following resume text and job description, 
evaluate how well the candidate matches the role.

Return a JSON object with exactly these fields:
{
  "score": <number between 0 and 100>,
  "strengths": [<list of 2-3 matching strengths>],
  "gaps": [<list of 1-2 missing skills or gaps>],
  "verdict": "<one sentence summary>"
}

Resume:
${resume_text}

Job Description:
${jd}

Return ONLY valid JSON. No explanation, no markdown, no preamble.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const textRes = result.text;
    
    // 6. Parse JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(textRes);
    } catch (e) {
      // In case gemini wrapped it in markdown code block despite the prompt
      const jsonStr = textRes.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(jsonStr);
    }

    // 7. Return to frontend
    res.json({ success: true, data: parsedResult });

  } catch (error) {
    console.error('Match Error:', error);
    res.status(500).json({ success: false, message: 'Server error during AI matching' });
  }
};

module.exports = {
  matchResume,
};
