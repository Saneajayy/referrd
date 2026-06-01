import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pool from '../db.js';
import multer from 'multer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-new');

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory OTP store for regular users
const otpStore = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitize(user) {
  const { password, resume_text, ...safe } = user;
  return safe;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const isDevMode = () =>
  !process.env.SMTP_USER ||
  process.env.SMTP_USER === 'your-email@gmail.com' ||
  process.env.SMTP_USER.trim() === '';

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email is required.' });

  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min
  otpStore.set(email.toLowerCase(), { otp, expiresAt, verified: false });

  if (isDevMode()) {
    console.log(`\n✉️  [DEV MODE] OTP for ${email}: ${otp}\n`);
    return res.json({ message: 'OTP sent (dev mode — check server console).', devOtp: otp });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Referr'd" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Referr'd Verification Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="font-size:24px;font-weight:600;margin-bottom:8px;">Verify your email</h2>
          <p style="color:#6b7280;margin-bottom:24px;">Enter this code to complete your Referr'd signup.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;color:#111827;">
            ${otp}
          </div>
          <p style="color:#9ca3af;font-size:13px;margin-top:20px;">Expires in 10 minutes. Do not share this code.</p>
        </div>`,
    });
    return res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[auth/send-otp]', err.message);
    console.log(`\n✉️  [FALLBACK] OTP for ${email}: ${otp}\n`);
    return res.status(500).json({ message: 'Failed to send OTP email. Check server console for OTP (dev only).' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'email and otp are required.' });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp.trim()) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

  record.verified = true;
  otpStore.set(email.toLowerCase(), record);
  return res.json({ message: 'Email verified successfully.' });
});

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'seeker' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required.' });
  }
  if (!['seeker', 'referrer'].includes(role)) {
    return res.status(400).json({ message: 'role must be "seeker" or "referrer".' });
  }

  // Require OTP verification
  const record = otpStore.get(email.toLowerCase());
  if (!record || !record.verified) {
    return res.status(403).json({ message: 'Email must be verified via OTP before signup.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), hashed, role]
    );

    const user = result.rows[0];
    const token = makeToken(user);
    otpStore.delete(email.toLowerCase());

    return res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});


// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = makeToken(user);
    return res.json({ token, user: sanitize(user) });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── GET /api/auth/me (verify token) ──────────────────────────────────────────

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: sanitize(result.rows[0]) });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// ── Auth middleware helper ────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided.' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ── PATCH /api/auth/change-password ──────────────────────────────────────────
router.patch('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'currentPassword and newPassword are required.' });
  if (newPassword.length < 8)
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[change-password]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  const { name, college, linkedin } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required.' });

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, college = $2, linkedin = $3 WHERE id = $4 RETURNING *',
      [name.trim(), college?.trim() || null, linkedin?.trim() || null, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const user = result.rows[0];
    const token = makeToken(user);

    return res.json({ message: 'Profile updated successfully.', user: sanitize(user), token });
  } catch (err) {
    console.error('[update-profile]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/resume ─────────────────────────────────────────────────────
router.post('/resume', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No resume file uploaded.' });

    let resumeText = '';
    try {
      const parsed = await pdfParse(file.buffer);
      resumeText = parsed.text?.trim();
    } catch (err) {
      console.error('[auth/resume] pdf-parse error:', err);
      return res.status(422).json({ message: 'Could not parse the PDF. Please upload a valid resume.' });
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(422).json({ message: 'Resume appears to be empty or unreadable. Please upload a text-based PDF.' });
    }

    await pool.query(
      'UPDATE users SET resume_text = $1, resume_filename = $2 WHERE id = $3',
      [resumeText, file.originalname, req.user.id]
    );

    res.json({ message: 'Resume uploaded successfully.', resume_filename: file.originalname });
  } catch (err) {
    console.error('[auth/resume] error:', err);
    res.status(500).json({ message: 'Server error during resume upload.' });
  }
});

// ── DELETE /api/auth/delete-account ──────────────────────────────────────────
router.delete('/delete-account', requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ message: 'password is required to delete your account.' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ message: 'Incorrect password.' });

    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    return res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('[delete-account]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

export default router;

