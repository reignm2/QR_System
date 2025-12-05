// middleware/roles.js

function ensureAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}

function ensureEmployee(req, res, next) {
  if (req.user && req.user.role === 'employee') {
    return next();
  }
  return res.status(403).json({ error: 'Employee access required' });
}

module.exports = { ensureAdmin, ensureEmployee };
