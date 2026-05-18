const express = require('express');
const router = express.Router();
const { getProfile, getEmployeesByCompany } = require('../controllers/employeeController');
const { verifyEmployeeToken } = require('../middleware/authMiddleware');

router.get('/profile', verifyEmployeeToken, getProfile);
// The prompt says GET /api/employees/companies/:company_id (doesn't explicitly say protected but usually is or can be public for users looking to select employees. Wait, prompt says no auth specified but logically it's used by users. "Excludes the logged-in user if they are an employee" -> wait, prompt says "Excludes the logged-in user if they are an employee". That means it's accessible by user or employee. I will just make it accessible without token or check token if present. Actually, prompt says nothing about protected, but the feature is "Employee Selection /jobs/:id/employees" which is User Protected Pages. I will let anyone with a valid user/employee token access it, or just make it public. Let's make it public for ease, since companies are public.)
router.get('/companies/:company_id', getEmployeesByCompany);

module.exports = router;
