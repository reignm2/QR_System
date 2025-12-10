const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../db');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// --- EXISTING ENDPOINTS (keep these) ---

// GET /api/employees/me
router.get('/me', auth, async (req, res) => {
  try {
    const employeeID = req.user.employeeID || req.user.id;
    if (!employeeID) return res.status(400).json({ error: 'No employeeID in token' });

    const [rows] = await db.query(
      `SELECT e.employeeID, e.first_name, e.last_name, e.email, e.position, e.status, d.department_name
       FROM employee e
       LEFT JOIN department d ON e.department_id = d.department_id
       WHERE e.employeeID = ?`,
      [employeeID]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in /me:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/employees/generate-qr
router.get('/generate-qr', auth, async (req, res) => {
  try {
    const employeeID = req.user.employeeID || req.user.id;
    if (!employeeID) return res.status(400).json({ error: 'No employeeID in token' });

    // Generate short code value (previous format)
    const codeValue = `QR${employeeID}-${Date.now()}`;
    const expiresInSec = 5 * 60;
    const expiresAt = Date.now() + expiresInSec * 1000;

    // Generate QR image (base64 Data URL) from the short code
    const qrDataURL = await QRCode.toDataURL(codeValue);

    // Insert or update QR code for this employee
    await db.query(
      `INSERT INTO qr_code (employee_id, code_value, date_generated)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE code_value=VALUES(code_value), date_generated=NOW()`,
      [employeeID, codeValue]
    );

    res.json({ qrDataURL, codeValue, expiresAt });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// GET /api/employees/latest-qr
router.get('/latest-qr', auth, async (req, res) => {
  try {
    const employeeID = req.user.employeeID || req.user.id;
    if (!employeeID) return res.status(400).json({ error: 'No employeeID in token' });

    // Get the latest QR code for this employee
    const [rows] = await db.query(
      `SELECT code_value, date_generated
         FROM qr_code
        WHERE employee_id = ?
        ORDER BY date_generated DESC
        LIMIT 1`,
      [employeeID]
    );
    if (!rows.length) return res.status(404).json({ error: 'No QR code found' });

    // Generate QR image from code_value
    const qrDataURL = await QRCode.toDataURL(rows[0].code_value);

    // Calculate expiry (optional: set to 5 minutes after generation)
    const expiresAt = new Date(rows[0].date_generated).getTime() + 5 * 60 * 1000;

    res.json({ codeValue: rows[0].code_value, qrDataURL, expiresAt });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- ADMIN CRUD ENDPOINTS ---

// GET /api/employees (list all employees)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, e.first_name, e.last_name, e.email, e.position, e.status, d.department_name, d.department_id
       FROM employee e
       LEFT JOIN department d ON e.department_id = d.department_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST /api/employees (add employee)
router.post('/', auth, async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { first_name, last_name, email, department_id, position, password, status } = req.body;
  if (!first_name || !last_name || !email || !department_id || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO employee (first_name, last_name, email, department_id, position, password, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, department_id, position, password, status]
    );
    res.json({ success: true, employeeID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// PUT /api/employees/:id (edit employee)
router.put('/:id', auth, async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { first_name, last_name, email, department_id, position, password, status } = req.body;
  if (!first_name || !last_name || !email || !department_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // If password is provided, update it; otherwise, don't change password
    let query, params;
    if (password) {
      query = `UPDATE employee SET first_name=?, last_name=?, email=?, department_id=?, position=?, password=?, status=? WHERE employeeID=?`;
      params = [first_name, last_name, email, department_id, position, password, status, req.params.id];
    } else {
      query = `UPDATE employee SET first_name=?, last_name=?, email=?, department_id=?, position=?, status=? WHERE employeeID=?`;
      params = [first_name, last_name, email, department_id, position, status, req.params.id];
    }
    await db.query(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE /api/employees/:id (delete employee)
router.delete('/:id', auth, async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await db.query('DELETE FROM employee WHERE employeeID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
