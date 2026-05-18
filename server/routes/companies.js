const express = require('express');
const router = express.Router();
const { getCompanies, createCompany } = require('../controllers/companyController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', getCompanies);
router.post('/', verifyAdminToken, createCompany);

module.exports = router;
