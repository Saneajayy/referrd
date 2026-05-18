const pool = require('../config/db');

const initializeDB = async () => {
  const query = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      college VARCHAR(255),
      resume_url TEXT,
      linkedin_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS employees (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      work_email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      designation VARCHAR(255),
      company_id UUID REFERENCES companies(id),
      linkedin_url TEXT,
      points INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT FALSE,
      otp VARCHAR(10),
      otp_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      company_id UUID REFERENCES companies(id),
      role_title VARCHAR(255) NOT NULL,
      jd TEXT NOT NULL,
      job_link TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS referral_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES jobs(id),
      user_id UUID REFERENCES users(id),
      employee_id UUID REFERENCES employees(id),
      ai_score FLOAT,
      status VARCHAR(20) DEFAULT 'pending',
      expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '3 days'),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit();
  }
};

initializeDB();
