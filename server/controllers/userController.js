const pool = require('../config/db');
const cloudinary = require('../utils/cloudinary');

const getProfile = async (req, res) => {
  try {
    const user = await pool.query('SELECT id, name, email, college, resume_url, linkedin_url FROM users WHERE id = $1', [req.user]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { name, college, linkedin_url } = req.body;
  try {
    const updatedUser = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), college = COALESCE($2, college), linkedin_url = COALESCE($3, linkedin_url) WHERE id = $4 RETURNING id, name, email, college, resume_url, linkedin_url',
      [name, college, linkedin_url, req.user]
    );
    res.json({ success: true, data: updatedUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    // Convert buffer to base64 string
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'referrd_resumes',
    });

    const updatedUser = await pool.query(
      'UPDATE users SET resume_url = $1 WHERE id = $2 RETURNING id, name, email, college, resume_url, linkedin_url',
      [cldRes.secure_url, req.user]
    );

    res.json({ success: true, data: updatedUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error uploading resume' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
};
