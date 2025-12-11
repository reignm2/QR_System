import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ department_id: null, department_name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/departments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setDepartments(data);
    }
    setLoading(false);
  };

  const handleInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({ department_id: null, department_name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = dep => {
    setForm(dep);
    setShowForm(true);
  };

  const handleDelete = async dep => {
    if (!window.confirm(`Delete department "${dep.department_name}"?`)) return;
    const res = await fetch(`/api/departments/${dep.department_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) fetchDepartments();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.department_name.trim()) return;
    const method = form.department_id ? 'PUT' : 'POST';
    const url = form.department_id
      ? `/api/departments/${form.department_id}`
      : '/api/departments';
    const body = {
      department_name: form.department_name,
      description: form.description
    };
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setShowForm(false);
      fetchDepartments();
    }
  };

  return (
    <AdminLayout activeMenu="department">
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Heading and Add Button Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          marginTop: 24
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            letterSpacing: 0.2,
            color: '#222'
          }}>
            Department
          </h2>
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
            Add Department
          </button>
        </div>

        {/* Responsive Department Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', margin: 40 }}>Loading...</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 32,
              marginTop: 24,
              alignItems: 'stretch'
            }}
          >
            {departments.map(dep => (
              <div key={dep.department_id}
                style={{
                  background: '#fff',
                  border: '1px solid #e3e3e3',
                  borderRadius: 16,
                  padding: 28,
                  minHeight: 170,
                  height: '100%',
                  boxShadow: '0 1px 4px #0001',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start'
                }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{dep.department_name}</div>
                <div style={{ color: '#666', fontSize: 15, marginBottom: 18, minHeight: 38 }}>
                  {dep.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>none</span>}
                </div>
                <div style={{ color: '#aaa', fontSize: 13, marginBottom: 2, marginTop: 'auto' }}>ID. {dep.department_id}</div>
                <div style={{
                  position: 'absolute', top: 18, right: 18, display: 'flex', gap: 10
                }}>
                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(dep)}
                    title="Edit"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#222', fontSize: 18, padding: 4
                    }}>
                    <span role="img" aria-label="Edit">✏️</span>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(dep)}
                    title="Delete"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontSize: 18, padding: 4
                    }}>
                    <span role="img" aria-label="Delete">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Department Modal */}
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
              <h3 style={{ margin: 0 }}>{form.department_id ? 'Edit Department' : 'Add Department'}</h3>
              <input
                name="department_name"
                type="text"
                placeholder="Department Name"
                value={form.department_name}
                onChange={handleInput}
                required
                style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleInput}
                rows={3}
                style={{ padding: 10, fontSize: 15, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="submit"
                  style={{
                    background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer'
                  }}
                >
                  {form.department_id ? 'Update' : 'Add'}
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
      </div>
    </AdminLayout>
  );
}