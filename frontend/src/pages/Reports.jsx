import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../api';
import { Modal, Button, Form } from 'react-bootstrap'; // Add this if using react-bootstrap

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [logsRange, setLogsRange] = useState({ from: '', to: '' });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [editId, setEditId] = useState(null);
  const [editRemarks, setEditRemarks] = useState('');
  const [editType, setEditType] = useState('');

  useEffect(() => {
    fetchGeneratedReports();
  }, []);

  // Auto-fetch on filter change
  useEffect(() => {
    if (reportType === 'daily' && date) fetchReport();
    if (reportType === 'monthly' && month) fetchReport();
    if (reportType === 'logs' && logsRange.from && logsRange.to) fetchReport();
    // eslint-disable-next-line
  }, [date, month, logsRange, reportType]);

  const fetchGeneratedReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/reports/generated', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneratedReports(res.data.records || []);
    } catch {
      setGeneratedReports([]);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      const token = localStorage.getItem('token');
      if (reportType === 'daily') {
        res = await API.get(`/reports/daily?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (reportType === 'monthly') {
        res = await API.get(`/reports/monthly?month=${month}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (reportType === 'logs') {
        res = await API.get(`/reports/logs?date=${logsRange.from}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setRecords(res.data.records || []);
    } catch (err) {
      alert('Failed to fetch report');
    }
    setLoading(false);
  };

  const exportReport = async () => {
    try {
      let url = '';
      if (reportType === 'daily') {
        url = `/api/reports/daily/export?date=${date}`;
      } else if (reportType === 'monthly') {
        url = `/api/reports/monthly/export?month=${month}`;
      } else if (reportType === 'logs') {
        url = `/api/reports/logs/export?from=${logsRange.from}&to=${logsRange.to}`;
      }
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download =
        reportType === 'daily'
          ? `Daily_Attendance_${date}.xlsx`
          : reportType === 'monthly'
          ? `Monthly_Summary_${month}.xlsx`
          : `Logs_${logsRange.from}_to_${logsRange.to}.xlsx`;
      link.click();
    } catch (err) {
      alert('Failed to export report');
    }
  };

  // Generate Report (save to generated reports)
  const handleGenerateReport = () => setShowModal(true);

  const handleSaveReport = async () => {
    try {
      const token = localStorage.getItem('token');
      let report_type = '';
      if (reportType === 'daily') report_type = 'Daily Attendance Records';
      if (reportType === 'monthly') report_type = 'Monthly Attendance Summary';
      if (reportType === 'logs') report_type = 'Time-In/Time-Out Logs';
      await API.post('/reports/generated', { report_type, remarks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setRemarks('');
      fetchGeneratedReports();
    } catch {
      alert('Failed to save generated report');
    }
  };

  // Edit functionality
  const handleEdit = (report) => {
    setEditId(report.report_id);
    setEditRemarks(report.remarks);
    setEditType(report.report_type);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/reports/generated/${editId}`, {
        report_type: editType,
        remarks: editRemarks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditId(null);
      setEditRemarks('');
      setEditType('');
      fetchGeneratedReports();
    } catch {
      alert('Failed to update report');
    }
  };

  // Delete functionality
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/reports/generated/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGeneratedReports();
    } catch {
      alert('Failed to delete report');
    }
  };

  return (
    <AdminLayout
      title="Reports"
      activeMenu="reports"
      actionButton={
        <button
          onClick={handleGenerateReport}
          style={{
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700 }}>＋</span> Generate Report
        </button>
      }
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Attendance Report Filter */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px #0001",
          padding: 24,
          marginBottom: 24
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Attendance Report</div>
          <div style={{ color: "#888", marginBottom: 12 }}>Select the time period for attendance report</div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            {reportType === 'daily' && (
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', width: 160 }}
              />
            )}
            {reportType === 'monthly' && (
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', width: 160 }}
              />
            )}
            {reportType === 'logs' && (
              <>
                <input
                  type="date"
                  value={logsRange.from}
                  onChange={e => setLogsRange({ from: e.target.value, to: e.target.value })}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', width: 160 }}
                  placeholder="Date"
                />
              </>
            )}
            <button
              onClick={() => setReportType('daily')}
              style={{
                background: reportType === 'daily' ? '#111' : '#eee',
                color: reportType === 'daily' ? '#fff' : '#222',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >Daily</button>
            <button
              onClick={() => setReportType('monthly')}
              style={{
                background: reportType === 'monthly' ? '#111' : '#eee',
                color: reportType === 'monthly' ? '#fff' : '#222',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >Monthly</button>
            <button
              onClick={() => setReportType('logs')}
              style={{
                background: reportType === 'logs' ? '#111' : '#eee',
                color: reportType === 'logs' ? '#fff' : '#222',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >Logs</button>
            <button
              onClick={exportReport}
              style={{
                background: '#fff',
                color: '#111',
                border: '1px solid #111',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >⇩ Export</button>
          </div>
        </div>

        {/* Daily Attendance Records Table */}
        {reportType === 'daily' && (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px #0001",
            padding: 24,
            marginBottom: 32
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              Daily Attendance Records <span style={{ color: "#888", fontWeight: 400, fontSize: 15 }}>Showing {records.length} records</span>
            </div>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                  <th>Late Minutes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name || r.employeeID || '-'}</td>
                    <td>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                    <td>{r.time_in ? new Date(r.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{r.time_out ? new Date(r.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{r.status || '-'}</td>
                    <td>{r.late_minutes !== undefined ? r.late_minutes : '-'}</td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No attendance records found for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Monthly Attendance Summary Table */}
        {reportType === 'monthly' && (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px #0001",
            padding: 24,
            marginBottom: 32
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              Monthly Attendance Summary <span style={{ color: "#888", fontWeight: 400, fontSize: 15 }}>Showing {records.length} records</span>
            </div>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Days Present</th>
                  <th>Absences</th>
                  <th>Total Late Minutes</th>
                  <th>Overtime Minutes</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name || r.employeeID || '-'}</td>
                    <td>{r.days_present || 0}</td>
                    <td>{r.absences || 0}</td>
                    <td>{r.total_late_minutes || 0}</td>
                    <td>{r.overtime_minutes || 0}</td>
                    <td>{r.total_hours || 0}</td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Time-In/Time-Out Logs Table */}
        {reportType === 'logs' && (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px #0001",
            padding: 24,
            marginBottom: 32
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              Time-In/Time-Out Logs <span style={{ color: "#888", fontWeight: 400, fontSize: 15 }}>Showing {records.length} records</span>
            </div>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name || r.employeeID || '-'}</td>
                    <td>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                    <td>{r.status || '-'}</td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Generated Reports Table */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px #0001",
          padding: 24,
          marginTop: 32
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 14 }}>Generated Reports</div>
          <table className="table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Generated By</th>
                <th>Date Generated</th>
                <th>Report Type</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {generatedReports.map((r, i) => (
                <tr key={i}>
                  <td>{r.report_id}</td>
                  <td>{r.generated_by}</td>
                  <td>{r.date_generated ? new Date(r.date_generated).toLocaleDateString() : '-'}</td>
                  <td>
                    <span style={{
                      background: '#f6f6f6',
                      borderRadius: 8,
                      padding: '2px 10px',
                      fontWeight: 600,
                      fontSize: 13
                    }}>{r.report_type}</span>
                  </td>
                  <td>{r.remarks}</td>
                  <td>
                    <span style={{ cursor: 'pointer', marginRight: 10 }} title="Edit" onClick={() => handleEdit(r)}>&#9998;</span>
                    <span style={{ cursor: 'pointer' }} title="Delete" onClick={() => handleDelete(r.report_id)}>&#128465;</span>
                  </td>
                </tr>
              ))}
              {!generatedReports.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No generated reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Save Generated Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="remarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter remarks for the report"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveReport}>
            Save Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Remarks Modal */}
      <Modal show={!!editId} onHide={() => setEditId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Report Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editRemarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editRemarks}
                onChange={e => setEditRemarks(e.target.value)}
                placeholder="Enter remarks for the report"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
}