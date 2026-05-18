const express = require('express');
const router = express.Router();
const {
  userRegister,
  userLogin,
  employeeRegister,
  employeeVerifyEmail,
  employeeLogin,
  adminLogin
} = require('../controllers/authController');

router.post('/user/register', userRegister);
router.post('/user/login', userLogin);

router.post('/employee/register', employeeRegister);
router.post('/employee/verify-email', employeeVerifyEmail);
router.post('/employee/login', employeeLogin);

router.post('/admin/login', adminLogin);

module.exports = router;
