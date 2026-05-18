const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadResume } = require('../controllers/userController');
const { verifyUserToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', verifyUserToken, getProfile);
router.put('/profile', verifyUserToken, updateProfile);
router.post('/resume', verifyUserToken, upload.single('resume'), uploadResume);

module.exports = router;
