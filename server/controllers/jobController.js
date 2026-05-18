const pool = require('../config/db');

const getJobs = async (req, res) => {
  const { search } = req.query;
  try {
    let query = `
      SELECT j.id, j.role_title, j.created_at, j.expires_at, j.is_active, c.name as company_name, c.logo_url 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.is_active = TRUE AND (j.expires_at IS NULL OR j.expires_at > NOW())
    `;
    const params = [];

    if (search) {
      query += ` AND j.role_title ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY j.created_at DESC`;

    const jobs = await pool.query(query, params);
    res.json({ success: true, data: jobs.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await pool.query(`
      SELECT j.*, c.name as company_name, c.logo_url, c.domain 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `, [id]);

    if (job.rows.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createJob = async (req, res) => {
  const { company_id, role_title, jd, job_link, expires_at } = req.body;
  try {
    const newJob = await pool.query(
      `INSERT INTO jobs (company_id, role_title, jd, job_link, expires_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [company_id, role_title, jd, job_link, expires_at || null]
    );
    res.status(201).json({ success: true, data: newJob.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleJobStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const updatedJob = await pool.query(
      'UPDATE jobs SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    res.json({ success: true, data: updatedJob.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  toggleJobStatus,
  deleteJob,
};
