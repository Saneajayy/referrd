// Run once with: node server/migrate.js
import pool from './db.js';

const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    password   TEXT        NOT NULL,
    role       TEXT        NOT NULL DEFAULT 'seeker',  -- 'seeker' | 'referrer'
    points     INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

try {
  await pool.query(sql);
  console.log('✅  Migration complete — users table ready.');
} catch (err) {
  console.error('❌  Migration failed:', err.message);
} finally {
  await pool.end();
}
