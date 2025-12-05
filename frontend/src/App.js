import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeQRGenerator from "./pages/EmployeeQRGenerator";
import DepartmentPage from "./pages/DepartmentPage";
import EmployeePage from "./pages/EmployeePage";
import AdminManagement from "./pages/AdminManagement";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import AttendancePage from "./pages/AttendancePage";
import QrCodesPage from './pages/QrCodesPage';
import Reports from './pages/Reports';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AdminDashboard />} /> {/* <-- Fixed */}
          <Route path="/employee/qr" element={<EmployeeQRGenerator />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/admin-management" element={<AdminManagement />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/qr-codes" element={<QrCodesPage />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
