// utils/jwtQr.js
const jwt = require('jsonwebtoken');

// Use QR_JWT_SECRET first, then QR_SECRET fallback, then hardcoded fallback
const QR_SECRET = process.env.QR_JWT_SECRET || process.env.QR_SECRET || 'replace-this-secret';

function generateQrToken(employeeId, expiresIn = '5m') {
  return jwt.sign(
    { employeeId },
    QR_SECRET,
    { expiresIn }
  );
}

function verifyQrToken(token) {
  return jwt.verify(token, QR_SECRET);
}

module.exports = { generateQrToken, verifyQrToken };
