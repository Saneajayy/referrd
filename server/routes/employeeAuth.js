import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory OTP store: { email: { otp, expiresAt, company } }
const otpStore = new Map();

// ── Nodemailer transporter ────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /api/employee-auth/send-otp ─────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { email, company, domain } = req.body;

  if (!email || !company || !domain) {
    return res.status(400).json({ message: 'email, company, and domain are required.' });
  }

  // Validate work email domain
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (!emailDomain || emailDomain !== domain.toLowerCase()) {
    return res.status(400).json({
      message: `Please use your ${company} work email ending in @${domain}`,
    });
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email.toLowerCase(), { otp, expiresAt, company, domain });

  const isDevMode =
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'your-email@gmail.com' ||
    process.env.SMTP_USER.trim() === '';

  // In dev mode — skip SMTP, return OTP directly
  if (isDevMode) {
    console.log(`\n✉️  [DEV MODE] OTP for ${email}: ${otp}\n`);
    return res.json({
      message: 'OTP sent (dev mode — check server console).',
      devOtp: otp,
    });
  }

  // Send real email
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Referr'd" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Referr'd Work Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Verify your work email</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">Enter this code to verify your ${company} work email on Referr'd.</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; letter-spacing: 12px; font-size: 36px; font-weight: 700; color: #111827;">
            ${otp}
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 20px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });
    return res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[send-otp] email error:', err.message);
    // Fallback: log OTP to console so dev is never fully blocked
    console.log(`\n✉️  [FALLBACK] OTP for ${email}: ${otp}\n`);
    return res.status(500).json({ message: 'Failed to send OTP email. Check server console for OTP (dev only).' });
  }
});

// ── POST /api/employee-auth/verify-otp ────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'email and otp are required.' });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }

  // Mark as verified (don't delete yet — needed for signup)
  record.verified = true;
  otpStore.set(email.toLowerCase(), record);

  return res.json({ message: 'Email verified successfully.' });
});

// ── POST /api/employee-auth/signup ────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password, company, domain, designation, linkedin } = req.body;

  if (!name || !email || !password || !company || !domain) {
    return res.status(400).json({ message: 'name, email, password, company, and domain are required.' });
  }

  // Verify email was OTP-verified
  const record = otpStore.get(email.toLowerCase());
  if (!record || !record.verified) {
    return res.status(403).json({ message: 'Work email must be verified via OTP before signup.' });
  }

  try {
    // Check duplicate
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, company, designation, linkedin)
       VALUES ($1, $2, $3, 'referrer', $4, $5, $6)
       RETURNING *`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashed,
        company,
        designation || null,
        linkedin || null,
      ]
    );

    const user = result.rows[0];
    const token = makeToken(user);

    // Clean up OTP
    otpStore.delete(email.toLowerCase());

    return res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    console.error('[employee-signup]', err);
    // Handle missing columns gracefully
    if (err.code === '42703') {
      // column doesn't exist — try without optional columns
      try {
        const hashed = await bcrypt.hash(password, 12);
        const result = await pool.query(
          `INSERT INTO users (name, email, password, role)
           VALUES ($1, $2, $3, 'referrer')
           RETURNING *`,
          [name.trim(), email.toLowerCase().trim(), hashed]
        );
        const user = result.rows[0];
        const token = makeToken(user);
        otpStore.delete(email.toLowerCase());
        return res.status(201).json({ token, user: sanitize(user) });
      } catch (innerErr) {
        console.error('[employee-signup fallback]', innerErr);
        return res.status(500).json({ message: 'Server error. Please try again.' });
      }
    }
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── POST /api/employee-auth/login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase().trim(), 'referrer']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials or not an employee account.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = makeToken(user);
    return res.json({ token, user: sanitize(user) });
  } catch (err) {
    console.error('[employee-login]', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

export default router;
