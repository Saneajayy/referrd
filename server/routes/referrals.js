import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_env';

// ── Auth middleware ───────────────────────────────────────────────────────────
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

// ── GET /api/referrals/my  ────────────────────────────────────────────────────
// Returns all referral requests for the logged-in seeker
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         rr.id,
         rr.job_title,
         rr.company,
         rr.status,
         rr.created_at,
         rr.updated_at,
         rr.note,
         u.id        AS referrer_id,
         u.name      AS referrer_name,
         u.email     AS referrer_email,
         u.company   AS referrer_company,
         u.role      AS referrer_role
       FROM referral_requests rr
       LEFT JOIN users u ON rr.referrer_id = u.id
       WHERE rr.seeker_id = $1
       ORDER BY rr.created_at DESC`,
      [req.user.id]
    );

    // Auto-expire pending requests older than 3 days
    const now = Date.now();
    const toExpire = rows
      .filter(r => r.status === 'pending' && now - new Date(r.created_at).getTime() > 3 * 24 * 60 * 60 * 1000)
      .map(r => r.id);

    if (toExpire.length) {
      await pool.query(
        `UPDATE referral_requests SET status = 'expired', updated_at = NOW() WHERE id = ANY($1)`,
        [toExpire]
      );
      rows.forEach(r => { if (toExpire.includes(r.id)) r.status = 'expired'; });
    }

    return res.json({ requests: rows });
  } catch (err) {
    console.error('[referrals/my]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PATCH /api/referrals/:id/withdraw  ───────────────────────────────────────
router.patch('/:id/withdraw', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE referral_requests
       SET status = 'withdrawn', updated_at = NOW()
       WHERE id = $1 AND seeker_id = $2 AND status = 'pending'
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Request not found or cannot be withdrawn.' });
    return res.json({ request: rows[0] });
  } catch (err) {
    console.error('[referrals/withdraw]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/referrals/referrer/:id  ─────────────────────────────────────────
// Public-ish profile of a referrer (only name, company, role — no email)
router.get('/referrer/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, company, role, created_at FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Referrer not found.' });
    return res.json({ referrer: rows[0] });
  } catch (err) {
    console.error('[referrals/referrer]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/referrals/seed-demo  (DEV ONLY) ────────────────────────────────
// Seed a few demo requests for the logged-in user so the dashboard looks alive.
router.post('/seed-demo', requireAuth, async (req, res) => {
  try {
    const demoData = [
      { job_title: 'Senior Frontend Engineer', company: 'Google', status: 'pending',  note: 'Resume looks strong — will submit this week.' },
      { job_title: 'Software Engineer II',      company: 'Microsoft', status: 'referred', note: 'Referral submitted via internal portal.' },
      { job_title: 'Product Designer',          company: 'Spotify', status: 'declined', note: 'Role was paused by HR.' },
    ];
    for (const d of demoData) {
      await pool.query(
        `INSERT INTO referral_requests (seeker_id, job_title, company, status, note)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [req.user.id, d.job_title, d.company, d.status, d.note]
      );
    }
    return res.json({ message: 'Demo data seeded.' });
  } catch (err) {
    console.error('[referrals/seed-demo]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
