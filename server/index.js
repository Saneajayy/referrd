import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

import authRouter from './routes/auth.js';
import employeeAuthRouter from './routes/employeeAuth.js';
import jobsRouter from './routes/jobs.js';
import referralsRouter from './routes/referrals.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/employee-auth', employeeAuthRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/referrals', referralsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
