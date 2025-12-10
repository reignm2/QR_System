const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// List all departments
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT department_id, department_name, description FROM department');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add department
router.post('/', auth, async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { department_name, description } = req.body;
  if (!department_name) {
    return res.status(400).json({ error: 'Department name is required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO department (department_name, description) VALUES (?, ?)',
      [department_name, description]
    );
    res.json({
      success: true,
      department: {
        department_id: result.insertId,
        department_name,
        description
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Edit department
router.put('/:id', auth, async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { department_name, description } = req.body;
  if (!department_name) {
    return res.status(400).json({ error: 'Department name is required' });
  }
  try {
    await db.query(
      'UPDATE department SET department_name = ?, description = ? WHERE department_id = ?',
      [department_name, description, req.params.id]
    );
    res.json({
      success: true,
      department: {
        department_id: req.params.id,
        department_name,
        description
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete department
router.delete('/:id', auth, async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await db.query('DELETE FROM department WHERE department_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;