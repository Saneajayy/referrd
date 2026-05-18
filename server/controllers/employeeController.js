const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const emp = await pool.query(`
      SELECT e.id, e.name, e.work_email, e.designation, e.linkedin_url, e.points, c.name as company_name 
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      WHERE e.id = $1
    `, [req.employee]);
    
    if (emp.rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: emp.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getEmployeesByCompany = async (req, res) => {
  const { company_id } = req.params;
  try {
    const emps = await pool.query(`
      SELECT id, name, designation, linkedin_url 
      FROM employees 
      WHERE company_id = $1 AND is_verified = TRUE
    `, [company_id]);
    
    res.json({ success: true, data: emps.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  getEmployeesByCompany,
};
