const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, toggleJobStatus, deleteJob } = require('../controllers/jobController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/:id', getJobById);

router.post('/', verifyAdminToken, createJob);
router.patch('/:id', verifyAdminToken, toggleJobStatus);
router.delete('/:id', verifyAdminToken, deleteJob);

module.exports = router;
