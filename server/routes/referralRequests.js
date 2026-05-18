const express = require('express');
const router = express.Router();
const { submitRequest, getUserRequests, getEmployeeRequests, updateRequestStatus } = require('../controllers/referralController');
const { verifyUserToken, verifyEmployeeToken } = require('../middleware/authMiddleware');

router.post('/', verifyUserToken, submitRequest);
router.get('/user', verifyUserToken, getUserRequests);
router.get('/employee', verifyEmployeeToken, getEmployeeRequests);
router.patch('/:id', verifyEmployeeToken, updateRequestStatus);

module.exports = router;
