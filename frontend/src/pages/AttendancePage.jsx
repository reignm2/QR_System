import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    attendanceID: '',
    employeeID: '',
    time_in: '',
    time_out: '',
    date: '',
    status: 'Present'
  });
  const [editId, setEditId] = useState(null);

  // Fetch attendance and employees
  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    const res = await fetch('/api/attendance', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setRecords(await res.json());
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setEmployees(await res.json());
  };

  const handleInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({
      attendanceID: '',
      employeeID: '',
      time_in: '',
      time_out: '',
      date: '',
      status: 'Present'
    });
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = rec => {
    setForm({
      attendanceID: rec.attendanceID,
      employeeID: rec.employeeID,
      time_in: rec.time_in ? rec.time_in.slice(11,16) : '',
      time_out: rec.time_out ? rec.time_out.slice(11,16) : '',
      date: rec.date,
      status: rec.status
    });
    setEditId(rec.attendanceID);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this attendance record?')) return;
    await fetch(`/api/attendance/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchAttendance();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/attendance/${editId}` : '/api/attendance';

    // If time_in/time_out are set, combine with date to make a full datetime string
    let time_in = form.time_in
      ? `${form.date} ${form.time_in}:00`
      : null;
    let time_out = form.time_out
      ? `${form.date} ${form.time_out}:00`
      : null;

    const payload = {
      ...form,
      time_in,
      time_out,
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowForm(false);
      fetchAttendance();
    }
  };

  return (
    <AdminLayout
      title="Attendance"
      activeMenu="attendance"
      actionButton={
        <button
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
          onClick={handleAdd}
        >
          <span style={{ fontSize: 20, fontWeight: 700 }}>＋</span> New Record
        </button>
      }
    >
      <div style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 2px 8px #0001',
        padding: 0,
        marginTop: 8,
        overflow: 'hidden',
        maxWidth: 1000,
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <th style={{ padding: '16px 12px' }}>ID</th>
              <th style={{ padding: '16px 12px' }}>Employee</th>
              <th style={{ padding: '16px 12px' }}>Date</th>
              <th style={{ padding: '16px 12px' }}>Time In</th>
              <th style={{ padding: '16px 12px' }}>Time Out</th>
              <th style={{ padding: '16px 12px' }}>Status</th>
              <th style={{ padding: '16px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              records.map((rec, idx) => (
                <tr key={rec.attendanceID || idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '14px 12px' }}>{rec.attendanceID}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{rec.employee}</td>
                  <td style={{ padding: '14px 12px' }}>{rec.date}</td>
                  <td style={{ padding: '14px 12px' }}>
                    {rec.time_in ? rec.time_in.slice(11,16) : ''}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    {rec.time_out ? rec.time_out.slice(11,16) : ''}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    {rec.status && rec.status.toLowerCase() === 'present' && (
                      <span style={{
                        background: '#111',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '2px 12px',
                        fontWeight: 600
                      }}>Present</span>
                    )}
                    {rec.status && rec.status.toLowerCase() === 'late' && (
                      <span style={{
                        background: '#f66',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '2px 12px',
                        fontWeight: 600
                      }}>Late</span>
                    )}
                    {rec.status && rec.status.toLowerCase() !== 'present' && rec.status.toLowerCase() !== 'late' && (
                      <span>{rec.status}</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px', display: 'flex', gap: 12 }}>
                    <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleEdit(rec)}>✏️</button>
                    <button title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(rec.attendanceID)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Attendance Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#fff', padding: 32, borderRadius: 16, minWidth: 340, boxShadow: '0 2px 16px #0002',
              display: 'flex', flexDirection: 'column', gap: 16
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Attendance' : 'Add Attendance'}</h3>
            <select
              name="employeeID"
              value={form.employeeID}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.employeeID} value={emp.employeeID}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="time_in"
              type="time"
              value={form.time_in}
              onChange={handleInput}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="time_out"
              type="time"
              value={form.time_out}
              onChange={handleInput}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <select
              name="status"
              value={form.status}
              onChange={handleInput}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                style={{
                  background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer'
                }}
              >
                {editId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: '#eee', color: '#333', border: 'none', borderRadius: 8,
                  padding: '10px 22px', fontWeight: 500, fontSize: 16, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}