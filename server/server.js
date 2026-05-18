const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const pool = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes will be imported and used here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/match', require('./routes/match'));
app.use('/api/referral-requests', require('./routes/referralRequests'));
app.use('/api/admin', require('./routes/admin'));

// Cron Job (run inside server.js)
// Use node-cron to run every hour:
// Find all referral_requests where status = 'pending' AND expires_at < NOW()
// Update their status to expired
cron.schedule('0 * * * *', async () => {
  try {
    const result = await pool.query(
      `UPDATE referral_requests SET status = 'expired' 
       WHERE status = 'pending' AND expires_at < NOW()`
    );
    if (result.rowCount > 0) {
      console.log(`Cron: Expired ${result.rowCount} pending referral requests.`);
    }
  } catch (error) {
    console.error('Cron Error checking for expired requests:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
