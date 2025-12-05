const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// List all admins
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT admin_id, name, username, role FROM admin');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/admins error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add admin
router.post('/', auth, async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !role || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await db.query(
      'INSERT INTO admin (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, password, role]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/admins error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Edit admin
router.put('/:id', auth, async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    if (password) {
      await db.query(
        'UPDATE admin SET name=?, username=?, password=?, role=? WHERE admin_id=?',
        [name, username, password, role, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE admin SET name=?, username=?, role=? WHERE admin_id=?',
        [name, username, role, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/admins/:id error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM admin WHERE admin_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admins/:id error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;