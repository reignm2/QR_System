import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function QrCodesPage() {
  const [codes, setCodes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    qr_id: '',
    employee_id: ''
  });
  const [editId, setEditId] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');

  // Fetch QR codes and employees
  useEffect(() => {
    fetchCodes();
    fetchEmployees();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/qr', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setCodes(await res.json());
      }
    } catch {
      setCodes([]);
    }
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
      qr_id: '',
      employee_id: ''
    });
    setEditId(null);
    setGeneratedCode('');
    setGeneratedQR('');
    setShowForm(true);
  };

  const handleEdit = code => {
    setForm({
      qr_id: code.qr_id,
      employee_id: code.employee_id,
      code_value: code.code_value
    });
    setEditId(code.qr_id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this QR code?')) return;
    await fetch(`/api/qr/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCodes();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/qr/${editId}` : '/api/qr';
    // Only send employee_id for POST
    const payload = editId ? form : { employee_id: form.employee_id };
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (!editId && data.code_value) {
        setGeneratedCode(data.code_value);
        setGeneratedQR(data.qrDataURL);
        fetchCodes();
        return; // Don't close modal immediately, show code
      }
      setShowForm(false);
      fetchCodes();
    }
  };

  return (
    <AdminLayout
      title="QR Codes"
      activeMenu="qr"
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
          <span style={{ fontSize: 20, fontWeight: 700 }}>＋</span> New QR Code
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
              <th style={{ padding: '16px 12px' }}>Code Value</th>
              <th style={{ padding: '16px 12px' }}>Date Generated</th>
              <th style={{ padding: '16px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                  No QR codes found.
                </td>
              </tr>
            ) : (
              codes.map((code, idx) => (
                <tr key={code.qr_id || idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '14px 12px' }}>{code.qr_id}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{code.employee_name}</td>
                  <td style={{ padding: '14px 12px' }}>{code.code_value}</td>
                  <td style={{ padding: '14px 12px' }}>{code.date_generated}</td>
                  <td style={{ padding: '14px 12px', display: 'flex', gap: 12 }}>
                    <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleEdit(code)}>✏️</button>
                    <button title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(code.qr_id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit QR Code Modal */}
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
            <h3 style={{ margin: 0 }}>{editId ? 'Edit QR Code' : 'Add QR Code'}</h3>
            <select
              name="employee_id"
              value={form.employee_id}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
              disabled={!!editId}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.employeeID} value={emp.employeeID}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
            {/* Only show code value for edit */}
            {editId && (
              <input
                name="code_value"
                type="text"
                placeholder="Code Value"
                value={form.code_value}
                onChange={handleInput}
                required
                style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
              />
            )}
            {/* Show generated code after adding */}
            {!editId && generatedCode && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <div><b>Generated Code:</b> {generatedCode}</div>
                {generatedQR && (
                  <div>
                    <img src={generatedQR} alt="QR" style={{ marginTop: 10, width: 120, height: 120 }} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setGeneratedCode(''); setGeneratedQR(''); }}
                  style={{
                    marginTop: 16,
                    background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            )}
            {!generatedCode && (
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
            )}
          </form>
        </div>
      )}
    </AdminLayout>
  );
}