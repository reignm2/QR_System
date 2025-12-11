import React, { useState } from 'react';
import API from '../api';

function Login() {
  const [role, setRole] = useState('employee');
  const [employeeID, setEmployeeID] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setEmployeeID('');
    setUsername('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (role === 'employee') {
        res = await API.post('https://qrdb-backend.up.railway.app/api/auth/employee/login', { employeeID, password });
      } else {
        res = await API.post('https://qrdb-backend.up.railway.app/api/auth/admin/login', { username, password });
      }
      // Save token and redirect (example)
      localStorage.setItem('token', res.data.token);
      if (role === 'employee') {
        window.location.href = '/employee';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'url("/bg.jpg") center center / cover no-repeat', // Add this line
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: '#ffffffff',
          borderRadius: 5,
          padding: '32px 32px 24px 32px',
          boxShadow: '0 2px 16px #0001',
          minWidth: 400,
          maxWidth: 480,
        }}
      >
        <img src="/logo.jpg" alt="Logo" style={{ width: 445, display: 'block'}} />
        <h2 style={{ fontSize: 25, fontWeight: 600, marginBottom: 20}}>Login</h2>
        <div style={{ display: 'flex', background: '#eee', borderRadius: 20, marginBottom: 24 }}>
          <button
            type="button"
            style={{
              flex: 1,
              border: '1px solid #eee',
              background: role === 'employee' ? '#fff' : 'transparent',
              fontWeight: role === 'employee' ? 700 : 400,
              padding: 8,
              borderRadius: 18,
              cursor: 'pointer',
            }}
            onClick={() => handleRoleChange('employee')}
          >
            <span role="img" aria-label="employee">👤</span> Employee
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              border: '1px solid #eee',
              background: role === 'admin' ? '#fff' : 'transparent',
              fontWeight: role === 'admin' ? 700 : 400,
              padding: 8,
              borderRadius: 20,
              cursor: 'pointer',
            }}
            onClick={() => handleRoleChange('admin')}
          >
            <span role="img" aria-label="admin">🛡️</span> Admin
          </button>
        </div>

        {role === 'employee' ? (
          <>
            <label htmlFor="employeeID" style={{ fontWeight: 600, marginBottom: 8 }}>Employee ID</label>
            <input
              type="text"
              id="employeeID"
              name="employeeID"
              placeholder="Enter your employee ID"
              value={employeeID}
              onChange={e => setEmployeeID(e.target.value)}
              style={{
                width: '100%',
                marginBottom: 16,
                padding: 10,
                borderRadius: 16,
                border: '1px solid #ddd',
                outline: 'none',
              }}
              required
            />
          </>
        ) : (
          <>
            <label htmlFor="username" style={{ fontWeight: 600, marginBottom: 8 }}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%',
                marginBottom: 16,
                padding: 10,
                borderRadius: 18,
                border: '1px solid #ddd',
                outline: 'none',
              }}
              required
            />
          </>
        )}

        <label htmlFor="password" style={{ fontWeight: 600, marginBottom: 8 }}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: 24,
            padding: 10,
            borderRadius: 18,
            border: '1px solid #ddd',
            outline: 'none',
          }}
          required
        />

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        <button
          type="submit"
          style={{
            width: '100%',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 18,
            padding: 12,
            fontWeight: 700,
            fontSize: 16,
            marginTop: 30,
            marginBottom: 15,
            cursor: 'pointer',
          }}
        >
          {role === 'employee' ? 'Login as Employee' : 'Login as Admin'}
        </button>
      </form>
    </div>
  );
}

export default Login;
