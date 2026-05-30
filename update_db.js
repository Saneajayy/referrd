import pool from './server/db.js';
async function run() {
  try {
    console.log('Adding columns to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN resume_text TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN resume_filename TEXT;');
    console.log('Columns added successfully.');
    process.exit(0);
  } catch (err) {
    if (err.code === '42701') {
      console.log('Columns already exist.');
      process.exit(0);
    }
    console.error(err);
    process.exit(1);
  }
}
run();
