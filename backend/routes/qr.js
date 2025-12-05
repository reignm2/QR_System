const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const QRCode = require('qrcode'); // Make sure you have this installed

// List all QR codes (with employee name)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.qr_id, q.employee_id, q.code_value, q.date_generated,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name
         FROM qr_code q
         LEFT JOIN Employee e ON q.employee_id = e.employeeID
         ORDER BY q.date_generated DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add QR code (automated generation)
router.post('/', auth, async (req, res) => {
  const { employee_id } = req.body;
  if (!employee_id) {
    return res.status(400).json({ error: 'Missing employee_id' });
  }
  try {
    // Generate a unique code value (e.g., QR-EMPLOYEEID-TIMESTAMP)
    const code_value = `QR${employee_id}-${Date.now()}`;
    // Optionally generate a QR image (Data URL)
    const qrDataURL = await QRCode.toDataURL(code_value);

    const [result] = await db.query(
      `INSERT INTO qr_code (employee_id, code_value, date_generated)
       VALUES (?, ?, NOW())`,
      [employee_id, code_value]
    );
    res.json({ success: true, qr_id: result.insertId, code_value, qrDataURL });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Edit QR code
router.put('/:id', auth, async (req, res) => {
  const { employee_id, code_value } = req.body;
  if (!employee_id || !code_value) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await db.query(
      `UPDATE qr_code SET employee_id=?, code_value=? WHERE qr_id=?`,
      [employee_id, code_value, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete QR code
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM qr_code WHERE qr_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;