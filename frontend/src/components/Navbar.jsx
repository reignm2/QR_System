import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const role = localStorage.getItem('role');
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Attendance System</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {role === 'superadmin' && <li className="nav-item"><Link className="nav-link" to="/admin-management">Admin Management</Link></li>}
            {(role === 'admin' || role === 'superadmin') && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/departments">Departments</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/employees">Employees</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/reports">Reports</Link></li>
              </>
            )}
            {role === 'employee' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/employee/qr">My QR Code</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/employee">My Attendance</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}