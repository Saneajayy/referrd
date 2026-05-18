const pool = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const emps = await pool.query(`
      SELECT e.id, e.name, e.work_email, e.is_verified, c.name as company_name 
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      ORDER BY e.created_at DESC
    `);
    res.json({ success: true, data: emps.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const verifyEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await pool.query('UPDATE employees SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE id = $1 RETURNING *', [id]);
    if (updated.rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const employeesCount = await pool.query('SELECT COUNT(*) FROM employees');
    const jobsCount = await pool.query('SELECT COUNT(*) FROM jobs WHERE is_active = TRUE');
    const requestsSent = await pool.query('SELECT COUNT(*) FROM referral_requests');
    const referralsGiven = await pool.query("SELECT COUNT(*) FROM referral_requests WHERE status = 'referred'");

    res.json({
      success: true,
      data: {
        total_users: parseInt(usersCount.rows[0].count),
        total_employees: parseInt(employeesCount.rows[0].count),
        total_active_jobs: parseInt(jobsCount.rows[0].count),
        total_referral_requests_sent: parseInt(requestsSent.rows[0].count),
        total_referrals_given: parseInt(referralsGiven.rows[0].count),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  verifyEmployee,
  getStats,
};
