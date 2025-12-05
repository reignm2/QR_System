import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ admin_id: '', name: '', username: '', role: '', password: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const res = await fetch('/api/admins', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) setAdmins(await res.json());
  };

  const handleInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({ admin_id: '', name: '', username: '', role: '', password: '' });
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = admin => {
    setForm({ ...admin, password: '' });
    setEditId(admin.admin_id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this administrator?')) return;
    await fetch(`/api/admins/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchAdmins();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/admins/${editId}` : '/api/admins';
    const payload = { ...form };
    if (!editId) {
      if (!payload.password) return; // Password required for new admin
    } else if (!payload.password) {
      delete payload.password; // Don't send password if not changing
    }
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
      fetchAdmins();
    }
  };

  return (
    <AdminLayout
      title="Administrators"
      activeMenu="admin"
      actionButton={
        <button style={{
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
        onClick={handleAdd}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>+</span> Add Administrator
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
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              background: '#fafafa',
              fontWeight: 600
            }}>
              <th style={{ padding: '16px 12px' }}>ID</th>
              <th style={{ padding: '16px 12px' }}>Name</th>
              <th style={{ padding: '16px 12px' }}>Username</th>
              <th style={{ padding: '16px 12px' }}>Role</th>
              <th style={{ padding: '16px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.admin_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '14px 12px' }}>{admin.admin_id}</td>
                <td style={{ padding: '14px 12px' }}>{admin.name}</td>
                <td style={{ padding: '14px 12px' }}>{admin.username}</td>
                <td style={{ padding: '14px 12px' }}>{admin.role}</td>
                <td style={{ padding: '14px 12px', display: 'flex', gap: 12 }}>
                  <button title="Edit" style={{
                    background: 'none', border: 'none', cursor: 'pointer'
                  }} onClick={() => handleEdit(admin)}>✏️</button>
                  <button title="Delete" style={{
                    background: 'none', border: 'none', cursor: 'pointer'
                  }} onClick={() => handleDelete(admin.admin_id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Admin Modal */}
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
            <h3 style={{ margin: 0 }}>{editId ? 'Edit Administrator' : 'Add Administrator'}</h3>
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="role"
              type="text"
              placeholder="Role"
              value={form.role}
              onChange={handleInput}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              name="password"
              type="password"
              placeholder={editId ? "New Password (leave blank to keep current)" : "Password"}
              value={form.password}
              onChange={handleInput}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
              required={!editId}
            />
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