const pool = require('../config/db');

const submitRequest = async (req, res) => {
  const { job_id, employee_ids, ai_score } = req.body;
  try {
    if (!employee_ids || employee_ids.length === 0 || employee_ids.length > 3) {
      return res.status(400).json({ success: false, message: 'You can select up to 3 employees' });
    }

    // Check if user already sent requests for this job
    const existingReq = await pool.query('SELECT id FROM referral_requests WHERE job_id = $1 AND user_id = $2', [job_id, req.user]);
    if (existingReq.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already sent referral requests for this job' });
    }

    // Check that all employees belong to the same company as the job
    const jobRes = await pool.query('SELECT company_id FROM jobs WHERE id = $1', [job_id]);
    const company_id = jobRes.rows[0].company_id;

    for (const emp_id of employee_ids) {
      const empRes = await pool.query('SELECT company_id FROM employees WHERE id = $1', [emp_id]);
      if (empRes.rows[0].company_id !== company_id) {
        return res.status(400).json({ success: false, message: 'All selected employees must belong to the same company as the job' });
      }
    }

    // Insert
    const insertValues = employee_ids.map(emp_id => `('${job_id}', '${req.user}', '${emp_id}', ${ai_score})`).join(',');
    const newRequests = await pool.query(`
      INSERT INTO referral_requests (job_id, user_id, employee_id, ai_score)
      VALUES ${insertValues} RETURNING *
    `);

    res.status(201).json({ success: true, data: newRequests.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const requests = await pool.query(`
      SELECT r.id, r.ai_score, r.status, r.created_at, j.role_title, c.name as company_name, e.name as employee_name, e.designation
      FROM referral_requests r
      JOIN jobs j ON r.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      JOIN employees e ON r.employee_id = e.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [req.user]);
    res.json({ success: true, data: requests.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getEmployeeRequests = async (req, res) => {
  try {
    const requests = await pool.query(`
      SELECT r.id, r.ai_score, r.created_at, u.name as candidate_name, u.email as candidate_email, u.resume_url, j.role_title
      FROM referral_requests r
      JOIN users u ON r.user_id = u.id
      JOIN jobs j ON r.job_id = j.id
      WHERE r.employee_id = $1 AND r.status = 'pending'
      ORDER BY r.ai_score DESC
    `, [req.employee]);

    const data = requests.rows.map((row, index) => ({
      ...row,
      is_top_5: index < 5
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'referred' or 'declined'
  try {
    const reqRes = await pool.query('SELECT employee_id FROM referral_requests WHERE id = $1', [id]);
    if (reqRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });
    
    if (reqRes.rows[0].employee_id !== req.employee) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await pool.query(
      'UPDATE referral_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (status === 'referred') {
      await pool.query('UPDATE employees SET points = points + 10 WHERE id = $1', [req.employee]);
    }

    res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  submitRequest,
  getUserRequests,
  getEmployeeRequests,
  updateRequestStatus
};
