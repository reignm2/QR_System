import React from 'react';

export default function AdminLayout({ title, actionButton, children, activeMenu }) {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    window.location.href = '/'; // Redirect to login page
  };

  // Only align heading and button for non-dashboard pages
  const isDashboard = title && title.toLowerCase().includes('dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffffff' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#ffffffff',
        borderRight: '1px solid #eee',
        padding: '32px 0 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1.4,
            marginBottom: 32,
            textAlign: 'center',
            padding: '0 10px',
            wordBreak: 'break-word'
          }}
        >
          Signstar QR-based Attendance System
        </div>
        <nav style={{ width: '100%' }}>
          {/* Admin Dashboard link at the top */}
          <div
            style={{
              padding: '10px 32px',
              background: activeMenu === 'dashboard' ? '#eaf6fa' : 'transparent',
              borderRadius: 12,
              marginBottom: 4,
              fontWeight: activeMenu === 'dashboard' ? 700 : 400,
              color: activeMenu === 'dashboard' ? '#007bff' : '#222',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
            onClick={() => window.location.href = '/dashboard'}
          >
            <span role="img" aria-label="dashboard">🏠</span>
            <span>Admin Dashboard</span>
          </div>
          {[
            {
              label: 'Department',
              icon: '📁',
              key: 'department',
              path: '/departments'
            },
            {
              label: 'Employee',
              icon: '👥',
              key: 'employee',
              path: '/employees'
            },
            {
              label: 'Attendance',
              icon: '🕒',
              key: 'attendance',
              path: '/attendance'
            },
            {
              label: 'QR Codes',
              icon: '🧾',
              key: 'qr',
              path: '/qr-codes'
            },
            {
              label: 'Administrators',
              icon: '📋',
              key: 'admin',
              path: '/admin-management'
            },
            {
              label: 'Reports',
              icon: '📊',
              key: 'reports',
              path: '/reports'
            }
          ].map(item => (
            <div
              key={item.key}
              style={{
                padding: '10px 32px',
                background: activeMenu === item.key ? '#eaf6fa' : 'transparent',
                borderRadius: 12,
                marginBottom: 4,
                fontWeight: activeMenu === item.key ? 700 : 400,
                color: activeMenu === item.key ? '#007bff' : '#222',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
              onClick={() => window.location.href = item.path}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            background: '#ffffffff', // Red background
            color: '#000000ff', // White text
            border: '1px solid #000000ff',
            borderRadius: 20, // Rounded corners
            padding: '12px 24px', // Adjust padding for better proportions
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            width: '70%', // Centered and responsive width
            marginBottom: 30, // Space at the bottom
            textAlign: 'center' // Center text
          }}
        >
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '90%', maxWidth: 1100, position: 'relative' }}>
          {/* Page Heading and Add Button */}
          {!isDashboard ? (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              {title && (
                <h2 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: 0.2,
                  color: '#222'
                }}>
                  {title}
                </h2>
              )}
              {actionButton}
            </div>
          ) : (
            // Dashboard: heading centered, but show actionButton (e.g. scan QR) at top right
            <div style={{ position: 'relative', marginBottom: 24 }}>
              {title && (
                <h2 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: 0.2,
                  color: '#222',
                  textAlign: 'center'
                }}>
                  {title}
                </h2>
              )}
              {actionButton && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0
                }}>
                  {actionButton}
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}