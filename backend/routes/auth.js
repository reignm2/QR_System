const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

/* ==========================================================
   ✅ EMPLOYEE LOGIN
   ========================================================== */
router.post('/employee/login', async (req, res) => {
  const { employeeID, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM Employee WHERE employeeID = ?', [employeeID]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Employee not found' });

    const employee = rows[0];
    if (employee.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { employeeID: employee.employeeID, role: 'employee' },
      SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, employee });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ==========================================================
   ✅ ADMIN LOGIN
   ========================================================== */
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM Admin WHERE username = ?', [username]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Admin not found' });

    const admin = rows[0];
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, role: admin.role },
      SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, admin });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
