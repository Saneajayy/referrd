const pool = require('../config/db');

const getCompanies = async (req, res) => {
  try {
    const companies = await pool.query('SELECT id, name, domain, logo_url FROM companies ORDER BY name ASC');
    res.json({ success: true, data: companies.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createCompany = async (req, res) => {
  const { name, domain, logo_url } = req.body;
  try {
    const newCompany = await pool.query(
      'INSERT INTO companies (name, domain, logo_url) VALUES ($1, $2, $3) RETURNING *',
      [name, domain, logo_url]
    );
    res.status(201).json({ success: true, data: newCompany.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getCompanies,
  createCompany,
};
