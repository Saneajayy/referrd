const express = require('express');
const router = express.Router();
const { matchResume } = require('../controllers/matchController');
const { verifyUserToken } = require('../middleware/authMiddleware');

router.post('/', verifyUserToken, matchResume);

module.exports = router;
