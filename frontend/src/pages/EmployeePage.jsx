import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeID: '',
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    position: '',
    password: '',
    status: 'Active'
  });
  const [editId, setEditId] = useState(null);

  // Fetch employees and departments
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setEmployees(await res.json());
  };

  const fetchDepartments = async () => {
    const res = await fetch('/api/departments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setDepartments(await res.json());
  };

  const handleInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({
      employeeID: '',
      first_name: '',
      last_name: '',
      email: '',
      department_id: '',
      position: '',
      password: '',
      status: 'Active'
    });
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = emp => {
    setForm({
      employeeID: emp.employeeID,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      department_id: emp.department_id,
      position: emp.position,
      password: '',
      status: emp.status
    });
    setEditId(emp.employeeID);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this employee?')) return;
    await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchEmployees();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/employees/${editId}` : '/api/employees';
    // Don't send password if editing and left blank
    const payload = { ...form };
    if (editId && !payload.password) delete payload.password;
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
      fetchEmployees();
    }
  };

  return (
    <AdminLayout
      title="Employee"
      activeMenu="employee"
      actionButton={
        <button
          onClick={handleAdd}
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
          <span style={{ fontSize: 20, fontWeight: 700 }}>＋</span>
          Add Employee
        </button>
      }
    >
      <div style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 2px 8px #0001',
        padding: 0,
        marginTop: 8,
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', fontWeight: 600 }}>
              <th style={{ padding: '16px 12px' }}>ID</th>
              <th style={{ padding: '16px 12px' }}>Name</th>
              <th style={{ padding: '16px 12px' }}>Department</th>
              <th style={{ padding: '16px 12px' }}>Position</th>
              <th style={{ padding: '16px 12px' }}>Status</th>
              <th style={{ padding: '16px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.employeeID} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '14px 12px' }}>{emp.employeeID}</td>
                <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                  {emp.first_name} {emp.last_name}
                </td>
                <td style={{ padding: '14px 12px' }}>{emp.department_name}</td>
                <td style={{ padding: '14px 12px' }}>{emp.position}</td>
                <td style={{ padding: '14px 12px' }}>{emp.status}</td>
                <td style={{ padding: '14px 12px', display: 'flex', gap: 12 }}>
                  <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleEdit(emp)}>✏️</button>
                  <button title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(emp.employeeID)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Employee Modal */}
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
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Employee' : 'Add Employee'}</h3>
            <input
              name="first_name"
              type="text"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="last_name"
              type="text"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <select
              name="department_id"
              value={form.department_id}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.department_id} value={dep.department_id}>{dep.department_name}</option>
              ))}
            </select>
            <input
              name="position"
              type="text"
              placeholder="Position"
              value={form.position}
              onChange={handleInput}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            {!editId && (
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInput}
                required
                style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
              />
            )}
            <select
              name="status"
              value={form.status}
              onChange={handleInput}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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

export default EmployeePage;
