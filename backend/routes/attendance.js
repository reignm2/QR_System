const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Time In
router.post('/time-in', auth, async (req, res) => {
  try {
    const employeeID = req.body.employeeID || req.user.employeeID || req.user.id;
    if (!employeeID) return res.status(400).json({ error: 'No employeeID provided' });

    // Check if already timed in today
    const [rows] = await db.query(
      'SELECT * FROM Attendance WHERE employeeID = ? AND date = CURDATE()',
      [employeeID]
    );
    if (rows.length > 0 && rows[0].time_in) {
      return res.status(400).json({ error: 'Already timed in today' });
    }

    // Get current time
    const now = new Date();
    const shiftStart = new Date(now);
    shiftStart.setHours(9, 0, 0, 0);
    const lateThreshold = new Date(now);
    lateThreshold.setHours(9, 15, 0, 0);

    // Determine status
    let status = 'Present';
    let late_minutes = 0;
    if (now > lateThreshold) {
      status = 'Late';
      late_minutes = Math.floor((now - shiftStart) / 60000); // minutes late
    }

    await db.query(
      'INSERT INTO Attendance (employeeID, time_in, date, status, late_minutes) VALUES (?, NOW(), CURDATE(), ?, ?)',
      [employeeID, status, late_minutes]
    );
    res.json({ success: true, message: `Time in recorded as ${status}` });
  } catch (err) {
    console.error('Time-in error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Time Out
router.post('/time-out', auth, async (req, res) => {
  try {
    const employeeID = req.body.employeeID || req.user.employeeID || req.user.id;
    if (!employeeID) return res.status(400).json({ error: 'No employeeID provided' });

    // Find today's attendance record
    const [rows] = await db.query(
      'SELECT * FROM Attendance WHERE employeeID = ? AND date = CURDATE()',
      [employeeID]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'No time-in record for today' });
    }
    if (rows[0].time_out) {
      return res.status(400).json({ error: 'Already timed out today' });
    }

    await db.query(
      'UPDATE Attendance SET time_out = NOW() WHERE attendanceID = ?',
      [rows[0].attendanceID]
    );
    res.json({ success: true, message: 'Time out recorded' });
  } catch (err) {
    console.error('Time-out error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Scheduled job to mark absents after 6 PM
const cron = require('node-cron');
cron.schedule('1 18 * * *', async () => {
  try {
    // Find employees with no time-in today
    const [employees] = await db.query(`
      SELECT e.employeeID
      FROM Employee e
      LEFT JOIN Attendance a ON e.employeeID = a.employeeID AND a.date = CURDATE()
      WHERE a.time_in IS NULL
    `);

    for (const emp of employees) {
      // Check if already marked absent to avoid duplicates
      const [existing] = await db.query(
        'SELECT * FROM Attendance WHERE employeeID = ? AND date = CURDATE()',
        [emp.employeeID]
      );
      if (!existing.length) {
        await db.query(
          'INSERT INTO Attendance (employeeID, date, status) VALUES (?, CURDATE(), ?)',
          [emp.employeeID, 'Absent']
        );
      }
    }
    console.log('Absent employees marked for today.');
  } catch (err) {
    console.error('Error marking absentees:', err);
  }
});

// List all attendance records (with employee name)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.attendanceID, a.employeeID, a.time_in, a.time_out, a.date, a.status,
              CONCAT(e.first_name, ' ', e.last_name) AS employee
         FROM Attendance a
         LEFT JOIN Employee e ON a.employeeID = e.employeeID
         ORDER BY a.date DESC, a.time_in DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add attendance record
router.post('/', auth, async (req, res) => {
  let { employeeID, time_in, time_out, date, status } = req.body;
  if (!employeeID || !date || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Convert empty string to null
  time_in = time_in || null;
  time_out = time_out || null;
  try {
    const [result] = await db.query(
      `INSERT INTO Attendance (employeeID, time_in, time_out, date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [employeeID, time_in, time_out, date, status]
    );
    res.json({ success: true, attendanceID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Edit attendance record
router.put('/:id', auth, async (req, res) => {
  let { employeeID, time_in, time_out, date, status } = req.body;
  if (!employeeID || !date || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Convert empty string to null
  time_in = time_in || null;
  time_out = time_out || null;
  try {
    await db.query(
      `UPDATE Attendance SET employeeID=?, time_in=?, time_out=?, date=?, status=?
       WHERE attendanceID=?`,
      [employeeID, time_in, time_out, date, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete attendance record
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM Attendance WHERE attendanceID=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get today's attendance records (with employee name)
router.get('/today', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.attendanceID, a.employeeID, a.time_in, a.time_out, a.date, a.status,
              e.first_name, e.last_name
         FROM Attendance a
         LEFT JOIN Employee e ON a.employeeID = e.employeeID
         WHERE a.date = CURDATE()
         ORDER BY a.time_in ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get attendance records for the logged-in employee
router.get('/my', auth, async (req, res) => {
  try {
    const employeeID = req.user.employeeID || req.user.id;
    if (!employeeID) return res.status(400).json({ error: 'No employee ID in token' });

    const [records] = await db.query(
      `SELECT * FROM Attendance WHERE employeeID = ? ORDER BY date DESC`,
      [employeeID]
    );
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Attendance trends for last 7 days (for dashboard graph)
router.get('/trends', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT date,
        SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present
       FROM Attendance
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY date
       ORDER BY date ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Monthly summary for pie chart (for dashboard)
router.get('/monthly-summary', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status='Late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END) as absent
       FROM Attendance
       WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())`
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Scan QR and get employee info
router.post('/scan', auth, async (req, res) => {
  const { codeValue } = req.body;
  try {
    // Find employee by codeValue
    const [rows] = await db.query(
      `SELECT e.employeeID, e.first_name, e.last_name, e.position, d.department_name, e.email, e.status
       FROM qr_code q
       JOIN Employee e ON q.employee_id = e.employeeID
       LEFT JOIN Department d ON e.department_id = d.department_id
       WHERE q.code_value = ? AND q.date_generated >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`,
      [codeValue]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired QR code' });
    res.json({ employee: rows[0], employeeID: rows[0].employeeID });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;