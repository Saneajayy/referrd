const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    return verified;
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token.' });
    return null;
  }
};

const verifyUserToken = (req, res, next) => {
  const verified = verifyToken(req, res, next);
  if (verified) {
    if (verified.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Access Denied. Require User role.' });
    }
    req.user = verified.id; // user id
    next();
  }
};

const verifyEmployeeToken = (req, res, next) => {
  const verified = verifyToken(req, res, next);
  if (verified) {
    if (verified.role !== 'employee') {
      return res.status(403).json({ success: false, message: 'Access Denied. Require Employee role.' });
    }
    req.employee = verified.id; // employee id
    next();
  }
};

const verifyAdminToken = (req, res, next) => {
  const verified = verifyToken(req, res, next);
  if (verified) {
    if (verified.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied. Require Admin role.' });
    }
    next();
  }
};

module.exports = {
  verifyUserToken,
  verifyEmployeeToken,
  verifyAdminToken,
};
