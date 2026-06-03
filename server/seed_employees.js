import pool from './db.js';
import bcrypt from 'bcryptjs';

const companies = ['Google', 'Microsoft', 'Nvidia', 'Amazon', 'Netflix', 'Spotify', 'Apple'];

async function seed() {
  const hash = await bcrypt.hash('password123', 10);
  
  for (const company of companies) {
    for (let i = 1; i <= 5; i++) {
      const name = `${company} Employee ${i}`;
      const email = `employee${i}@${company.toLowerCase()}.com`;
      const designation = `Software Engineer ${i}`;
      const linkedin = `https://linkedin.com/in/${company.toLowerCase()}-employee-${i}`;
      
      try {
        await pool.query(`
          INSERT INTO users (name, email, password, role, company, designation, linkedin, points)
          VALUES ($1, $2, $3, 'employee', $4, $5, $6, $7)
          ON CONFLICT (email) DO NOTHING
        `, [name, email, hash, company, designation, linkedin, 0]);
        console.log(`Inserted ${email}`);
      } catch (err) {
        console.error(`Failed to insert ${email}:`, err.message);
      }
    }
  }
  
  console.log('Done seeding employees!');
  await pool.end();
}

seed();
