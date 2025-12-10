// controllers/employeeController.js
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const generateEmployeeQR = async (req, res) => {
  try {
    const employeeID = req.user.employeeID || req.user.id;
    if (!employeeID) {
      return res.status(400).json({ success: false, message: 'Employee ID missing in token' });
    }

    // Set expiry to 5 minutes from now
    const expiresInSec = 5 * 60;
    const expiresAt = Date.now() + expiresInSec * 1000;

    // Create a signed JWT token that expires in 5 minutes
    const qrToken = jwt.sign(
      { employeeID },
      process.env.QR_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: expiresInSec }
    );

    // Generate QR image (base64 Data URL) from the JWT token
    const qrDataURL = await QRCode.toDataURL(qrToken);

    // Save or update QR code in DB (optional)
    await db.query(
      `
      INSERT INTO qr_code (employee_id, code_value, date_generated)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      code_value = VALUES(code_value),
      date_generated = NOW()
      `,
      [employeeID, qrToken]
    );

    // Send both the JWT token and the QR image to the frontend
    return res.json({
      success: true,
      employeeID,
      qrToken,    // <-- Send the JWT token!
      qrDataURL,  // <-- Send the QR image
      expiresAt
    });

  } catch (err) {
    console.error('QR GENERATION ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
};

module.exports = {
  generateEmployeeQR
};
