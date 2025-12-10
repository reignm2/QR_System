const express = require('express');
const router = express.Router();
const db = require('../db');
const exceljs = require('exceljs');
const auth = require('../middleware/auth');

// 1. Daily Attendance Report (JSON)
router.get('/daily', auth, async (req, res) => {
  const { date } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, CONCAT(e.first_name, ' ', e.last_name) AS name, a.date, a.time_in, a.time_out, a.status, a.late_minutes
       FROM attendance a
       JOIN employee e ON a.employeeID = e.employeeID
       WHERE DATE(a.date) = ?`,
      [date]
    );
    res.json({ records: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Daily Attendance Report (Excel)
router.get('/daily/export', auth, async (req, res) => {
  const { date } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, CONCAT(e.first_name, ' ', e.last_name) AS name, a.date, a.time_in, a.time_out, a.status, a.late_minutes
       FROM attendance a
       JOIN employee e ON a.employeeID = e.employeeID
       WHERE DATE(a.date) = ?`,
      [date]
    );
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Daily Attendance');
    sheet.columns = [
      { header: 'Employee ID', key: 'employeeID', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time In', key: 'time_in', width: 15 },
      { header: 'Time Out', key: 'time_out', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Late Minutes', key: 'late_minutes', width: 15 },
    ];
    rows.forEach(row => sheet.addRow(row));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Daily_Attendance_${date}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Monthly Attendance Summary (JSON)
router.get('/monthly', auth, async (req, res) => {
  const { month } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, CONCAT(e.first_name, ' ', e.last_name) AS name,
        SUM(a.status='Present') AS days_present,
        SUM(a.status='Absent') AS absences,
        SUM(a.late_minutes) AS total_late_minutes,
        SUM(a.overtime_minutes) AS overtime_minutes,
        SUM(a.hours) AS total_hours
       FROM attendance a
       JOIN employee e ON a.employeeID = e.employeeID
       WHERE DATE_FORMAT(a.date, '%Y-%m') = ?
       GROUP BY a.employeeID`,
      [month]
    );
    res.json({ records: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Monthly Attendance Summary (Excel)
router.get('/monthly/export', auth, async (req, res) => {
  const { month } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, CONCAT(e.first_name, ' ', e.last_name) AS name,
        SUM(a.status='Present') AS days_present,
        SUM(a.status='Absent') AS absences,
        SUM(a.late_minutes) AS total_late_minutes,
        SUM(a.overtime_minutes) AS overtime_minutes,
        SUM(a.hours) AS total_hours
       FROM attendance a
       JOIN employee e ON a.employeeID = e.employeeID
       WHERE DATE_FORMAT(a.date, '%Y-%m') = ?
       GROUP BY a.employeeID`,
      [month]
    );
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Monthly Summary');
    sheet.columns = [
      { header: 'Employee ID', key: 'employeeID', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Days Present', key: 'days_present', width: 15 },
      { header: 'Absences', key: 'absences', width: 12 },
      { header: 'Total Late Minutes', key: 'total_late_minutes', width: 18 },
      { header: 'Overtime Minutes', key: 'overtime_minutes', width: 18 },
      { header: 'Total Hours', key: 'total_hours', width: 15 },
    ];
    rows.forEach(row => sheet.addRow(row));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Monthly_Summary_${month}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Time-in/Time-out Logs Report (JSON)
router.get('/logs', auth, async (req, res) => {
  const { date } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, CONCAT(e.first_name, ' ', e.last_name) AS name, l.date, l.status
       FROM AttendanceLogs l
       JOIN employee e ON l.employeeID = e.employeeID
       WHERE DATE(l.date) = ?
       ORDER BY l.date ASC`,
      [date]
    );
    res.json({ records: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Time-in/Time-out Logs Report (Excel)
router.get('/logs/export', auth, async (req, res) => {
  const { from, to } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT e.employeeID, CONCAT(e.first_name, ' ', e.last_name) AS name, l.timestamp, l.status
       FROM AttendanceLogs l
       JOIN employee e ON l.employeeID = e.employeeID
       WHERE DATE(l.timestamp) BETWEEN ? AND ?
       ORDER BY l.timestamp ASC`,
      [from, to]
    );
    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet('Logs');
    sheet.columns = [
      { header: 'Employee ID', key: 'employeeID', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    rows.forEach(row => sheet.addRow(row));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Logs_${from}_to_${to}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get generated reports for the lower table
router.get('/generated', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.report_id, a.username AS generated_by, r.date_generated, r.report_type, r.remarks
       FROM report r
       JOIN admin a ON r.admin_id = a.admin_id
       ORDER BY r.date_generated DESC`
    );
    res.json({ records: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a generated report
router.post('/generated', auth, async (req, res) => {
  const { report_type, remarks } = req.body;
  const admin_id = req.user.admin_id;
  try {
    await db.query(
      `INSERT INTO report (admin_id, date_generated, report_type, remarks)
       VALUES (?, NOW(), ?, ?)`,
      [admin_id, report_type, remarks]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit generated report
router.put('/generated/:id', auth, async (req, res) => {
  const { report_type, remarks } = req.body;
  try {
    await db.query(
      `UPDATE report SET report_type=?, remarks=? WHERE report_id=?`,
      [report_type, remarks, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete generated report
router.delete('/generated/:id', auth, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM report WHERE report_id=?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;