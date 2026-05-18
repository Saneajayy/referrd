const express = require('express');
const router = express.Router();
const { getEmployees, verifyEmployee, getStats } = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/employees', verifyAdminToken, getEmployees);
router.patch('/employees/:id/verify', verifyAdminToken, verifyEmployee);
router.get('/stats', verifyAdminToken, getStats);

module.exports = router;
