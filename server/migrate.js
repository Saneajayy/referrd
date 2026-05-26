// Run once with: node server/migrate.js
import pool from './db.js';

const sql = `
  -- users table
  CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    password   TEXT        NOT NULL,
    role       TEXT        NOT NULL DEFAULT 'seeker',
    company    TEXT,
    college    TEXT,
    designation TEXT,
    linkedin   TEXT,
    points     INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add columns if they don't exist (idempotent)
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company') THEN
      ALTER TABLE users ADD COLUMN company TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='college') THEN
      ALTER TABLE users ADD COLUMN college TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='designation') THEN
      ALTER TABLE users ADD COLUMN designation TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='linkedin') THEN
      ALTER TABLE users ADD COLUMN linkedin TEXT;
    END IF;
  END $$;

  -- referral_requests table
  CREATE TABLE IF NOT EXISTS referral_requests (
    id          SERIAL PRIMARY KEY,
    seeker_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referrer_id INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    job_title   TEXT        NOT NULL,
    company     TEXT        NOT NULL,
    ai_score    INTEGER,
    status      TEXT        NOT NULL DEFAULT 'pending',
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_requests' AND column_name='ai_score') THEN
      ALTER TABLE referral_requests ADD COLUMN ai_score INTEGER;
    END IF;
  END $$;
`;

try {
  await pool.query(sql);
  console.log('✅  Migration complete — tables ready.');
} catch (err) {
  console.error('❌  Migration failed:', err.message);
} finally {
  await pool.end();
}
