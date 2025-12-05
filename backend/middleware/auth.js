// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id, role, name
    next();
  } catch (err) {
    console.error('AUTH ERROR:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
