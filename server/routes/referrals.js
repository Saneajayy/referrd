import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

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

// ── POST /api/referrals  ──────────────────────────────────────────────────────
// Creates a new referral request (Candidate side)
router.post('/', requireAuth, async (req, res) => {
  const { job_title, company, ai_score, referrer_ids } = req.body;
  if (!job_title || !company) return res.status(400).json({ message: 'job_title and company are required.' });
  
  try {
    if (!referrer_ids || !Array.isArray(referrer_ids) || referrer_ids.length === 0) {
      // Fallback for broadcast request
      const { rows } = await pool.query(
        `INSERT INTO referral_requests (seeker_id, job_title, company, ai_score)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.user.id, job_title, company, ai_score || null]
      );
      return res.status(201).json({ request: rows[0] });
    }

    // Insert for specific referrers
    const promises = referrer_ids.map(rid => 
      pool.query(
        `INSERT INTO referral_requests (seeker_id, job_title, company, ai_score, referrer_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.id, job_title, company, ai_score || null, rid]
      )
    );
    const results = await Promise.all(promises);
    return res.status(201).json({ requests: results.map(r => r.rows[0]) });
  } catch (err) {
    console.error('[referrals/create]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/referrals/employees/:company ─────────────────────────────────────
router.get('/employees/:company', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, designation, linkedin FROM users WHERE role = 'referrer' AND company = $1`,
      [req.params.company]
    );
    return res.json({ employees: rows });
  } catch (err) {
    console.error('[referrals/employees]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

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
         u.role      AS referrer_role,
         u.linkedin  AS referrer_linkedin,
         u.designation AS referrer_designation
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

// ── GET /api/referrals/company  ───────────────────────────────────────────────
// Returns all pending referral requests for the logged-in employee's company
router.get('/company', requireAuth, async (req, res) => {
  if (req.user.role !== 'referrer') return res.status(403).json({ message: 'Forbidden' });

  // Make sure we have the company from the DB, not just the token, just in case
  try {
    const userRes = await pool.query('SELECT company FROM users WHERE id = $1', [req.user.id]);
    if (!userRes.rows.length || !userRes.rows[0].company) {
      return res.status(400).json({ message: 'Employee has no company assigned.' });
    }
    const company = userRes.rows[0].company;

    const { rows } = await pool.query(
      `SELECT
         rr.id,
         rr.job_title,
         rr.company,
         rr.status,
         rr.created_at,
         rr.updated_at,
         rr.ai_score,
         rr.referrer_id,
         u.name      AS seeker_name,
         u.email     AS seeker_email,
         u.college   AS seeker_college
       FROM referral_requests rr
       JOIN users u ON rr.seeker_id = u.id
       WHERE rr.company = $1 AND (rr.status = 'pending' OR rr.referrer_id = $2)
       ORDER BY rr.ai_score DESC NULLS LAST, rr.created_at DESC`,
      [company, req.user.id]
    );

    // Auto-expire
    const now = Date.now();
    const toExpire = rows
      .filter(r => r.status === 'pending' && now - new Date(r.created_at).getTime() > 3 * 24 * 60 * 60 * 1000)
      .map(r => r.id);

    if (toExpire.length) {
      await pool.query(`UPDATE referral_requests SET status = 'expired', updated_at = NOW() WHERE id = ANY($1)`, [toExpire]);
    }
    
    // For the UI, we just mark them as expired so they move out of pending
    const validRequests = rows.map(r => toExpire.includes(r.id) ? { ...r, status: 'expired' } : r);
    return res.json({ requests: validRequests });
  } catch (err) {
    console.error('[referrals/company]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PATCH /api/referrals/:id/action  ─────────────────────────────────────────
// Accept or decline a referral request (Employee side)
router.patch('/:id/action', requireAuth, async (req, res) => {
  if (req.user.role !== 'referrer') return res.status(403).json({ message: 'Forbidden' });
  const { action, note } = req.body;
  if (!['pending_verification', 'declined'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });

  try {
    // Verify the request exists and is pending, and matches the employee's company
    const userRes = await pool.query('SELECT company FROM users WHERE id = $1', [req.user.id]);
    const company = userRes.rows[0]?.company;

    const { rows } = await pool.query(
      `UPDATE referral_requests
       SET status = $1, referrer_id = $2, note = $3, updated_at = NOW()
       WHERE id = $4 AND status = 'pending' AND company = $5
       RETURNING *`,
      [action, req.user.id, note || null, req.params.id, company]
    );

    if (!rows.length) return res.status(404).json({ message: 'Request not found, already processed, or not for your company.' });
    return res.json({ request: rows[0] });
  } catch (err) {
    console.error('[referrals/action]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/referrals/referrer/:id  ─────────────────────────────────────────
// Public-ish profile of a referrer (only name, company, role — no email)
router.get('/referrer/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, company, role, linkedin, created_at FROM users WHERE id = $1`,
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

// ── PATCH /api/referrals/:id/verify  ─────────────────────────────────────────
// Confirm or deny a referral by candidate
router.patch('/:id/verify', requireAuth, async (req, res) => {
  const { action } = req.body; // 'confirm' or 'deny'
  if (!['confirm', 'deny'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });

  try {
    const newStatus = action === 'confirm' ? 'referred' : 'disputed';
    const { rows } = await pool.query(
      `UPDATE referral_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND seeker_id = $3 AND status = 'pending_verification'
       RETURNING *`,
      [newStatus, req.params.id, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Request not found or not awaiting verification.' });
    
    // Add points to referrer if confirmed
    if (newStatus === 'referred' && rows[0].referrer_id) {
      await pool.query(
        `UPDATE users SET points = COALESCE(points, 0) + 10 WHERE id = $1`,
        [rows[0].referrer_id]
      );
    }
    
    return res.json({ request: rows[0] });
  } catch (err) {
    console.error('[referrals/verify]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/referrals/seed-demo  (DEV ONLY) ────────────────────────────────
// Seed a few demo requests for the logged-in user so the dashboard looks alive.
router.post('/seed-demo', requireAuth, async (req, res) => {
  try {
    const demoData = [
      { job_title: 'Senior Frontend Engineer', company: 'Google', status: 'pending',  note: 'Resume looks strong — will submit this week.', ai_score: 92 },
      { job_title: 'Software Engineer II',      company: 'Microsoft', status: 'referred', note: 'Referral submitted via internal portal.', ai_score: 85 },
      { job_title: 'Product Designer',          company: 'Spotify', status: 'declined', note: 'Role was paused by HR.', ai_score: 45 },
    ];
    for (const d of demoData) {
      await pool.query(
        `INSERT INTO referral_requests (seeker_id, job_title, company, status, note, ai_score)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [req.user.id, d.job_title, d.company, d.status, d.note, d.ai_score]
      );
    }
    return res.json({ message: 'Demo data seeded.' });
  } catch (err) {
    console.error('[referrals/seed-demo]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
