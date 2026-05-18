const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendOTP } = require('../utils/email');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- User Auth ---

const userRegister = async (req, res) => {
  const { name, email, password, college } = req.body;
  try {
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, college) VALUES ($1, $2, $3, $4) RETURNING id, name, email, college',
      [name, email, password_hash, college]
    );

    const token = generateToken(newUser.rows[0].id, 'user');
    res.status(201).json({ success: true, data: { user: newUser.rows[0], token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user.rows[0].id, 'user');
    delete user.rows[0].password_hash;
    res.json({ success: true, data: { user: user.rows[0], token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- Employee Auth ---

const employeeRegister = async (req, res) => {
  const { name, work_email, password, designation, company_id, linkedin_url } = req.body;
  try {
    const empExists = await pool.query('SELECT id FROM employees WHERE work_email = $1', [work_email]);
    if (empExists.rows.length > 0) return res.status(400).json({ success: false, message: 'Employee already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60000); // 10 mins

    const newEmp = await pool.query(
      `INSERT INTO employees (name, work_email, password_hash, designation, company_id, linkedin_url, otp, otp_expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, work_email`,
      [name, work_email, password_hash, designation, company_id, linkedin_url, otp, otp_expires_at]
    );

    await sendOTP(work_email, otp);

    res.status(201).json({ success: true, message: 'Registration successful. Please check your email for OTP.', data: { employeeId: newEmp.rows[0].id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const employeeVerifyEmail = async (req, res) => {
  const { work_email, otp } = req.body;
  try {
    const emp = await pool.query('SELECT * FROM employees WHERE work_email = $1', [work_email]);
    if (emp.rows.length === 0) return res.status(400).json({ success: false, message: 'Employee not found' });

    const employee = emp.rows[0];
    if (employee.is_verified) return res.status(400).json({ success: false, message: 'Already verified' });
    
    if (employee.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > new Date(employee.otp_expires_at)) return res.status(400).json({ success: false, message: 'OTP expired' });

    await pool.query('UPDATE employees SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE id = $1', [employee.id]);

    const token = generateToken(employee.id, 'employee');
    delete employee.password_hash;
    employee.is_verified = true;
    res.json({ success: true, data: { employee, token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const employeeLogin = async (req, res) => {
  const { work_email, password } = req.body;
  try {
    const emp = await pool.query('SELECT * FROM employees WHERE work_email = $1', [work_email]);
    if (emp.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const employee = emp.rows[0];
    if (!employee.is_verified) return res.status(403).json({ success: false, message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, employee.password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(employee.id, 'employee');
    delete employee.password_hash;
    res.json({ success: true, data: { employee, token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --- Admin Auth ---

const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken('admin', 'admin');
    res.json({ success: true, data: { token } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
};

module.exports = {
  userRegister,
  userLogin,
  employeeRegister,
  employeeVerifyEmail,
  employeeLogin,
  adminLogin,
};
