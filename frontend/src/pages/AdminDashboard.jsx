import React, { useEffect, useState } from 'react';
import QrScanner from '../components/QrScanner';
import AttendanceTable from '../components/AttendanceTable';
import AdminLayout from '../components/AdminLayout';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

function AdminDashboard() {
  const [scanResult, setScanResult] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [lateToday, setLateToday] = useState(0);
  const [trendData, setTrendData] = useState({ labels: [], data: [] });
  const [pieData, setPieData] = useState({ labels: [], data: [] });
  const [scannedEmployee, setScannedEmployee] = useState(null);
  const [scanError, setScanError] = useState('');

  // Auto-activate camera when modal opens
  useEffect(() => {
    if (showScanner && window.activateQrCamera) {
      window.activateQrCamera();
    }
  }, [showScanner]);

  const handleScan = async (codeValue) => {
    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ codeValue })
      });
      if (res.ok) {
        const data = await res.json();
        setScannedEmployee(data.employee);
        setScanError('');
        setScanResult('Scan successful!');
      } else {
        const data = await res.json();
        setScannedEmployee(null);
        setScanError(data.error || 'Invalid or expired QR code');
        setScanResult('Scan failed!');
      }
    } catch (err) {
      setScannedEmployee(null);
      setScanError('Network error');
      setScanResult('Scan failed!');
    }
    setShowScanner(false); // <-- Always close scanner after scan
  };

  const fetchAttendance = async () => {
    try {
      // Today's attendance
      const res = await fetch('/api/attendance/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      let todayData = [];
      if (res.ok) {
        todayData = await res.json();
        setAttendance(todayData);
        setPresentToday(todayData.filter(r => r.status && r.status.toLowerCase() === 'present').length);
        setLateToday(todayData.filter(r => r.status && r.status.toLowerCase() === 'late').length);
        setAbsentToday(todayData.filter(r => r.status && r.status.toLowerCase() === 'absent').length);
      }

      // Attendance trends (last 7 days)
      const trendRes = await fetch('/api/attendance/trends', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (trendRes.ok) {
        const trend = await trendRes.json();
        setTrendData({
          labels: trend.map(d => d.date),
          data: trend.map(d => d.present)
        });
      }

      // Monthly summary for pie chart
      const pieRes = await fetch('/api/attendance/monthly-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (pieRes.ok) {
        const pie = await pieRes.json();
        setPieData({
          labels: ['Present', 'Late', 'Absent'],
          data: [pie.present, pie.late, pie.absent]
        });
      }
    } catch {
      setAttendance([]);
      setPresentToday(0);
      setLateToday(0);
      setAbsentToday(0);
      setTrendData({ labels: [], data: [] });
      setPieData({ labels: [], data: [] });
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      activeMenu="dashboard"
      actionButton={
        <button
          onClick={() => setShowScanner(true)}
          style={{
            background: '#2b2b2bff',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            width: 48,
            height: 48,
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px #0002',
            cursor: 'pointer',
            position: 'absolute',
            top: 24,
            right: 24,
            zIndex: 10
          }}
          title="Scan QR"
        >
          {/* QR code SVG icon */}
          <span style={{ marginBottom: 10 }} role="img" aria-label="Scan QR">📷</span>
        </button>
      }
    >
      {/* Modal for QR Scanner */}
      {showScanner && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowScanner(false)}
        >
          <div
            style={{
              background: 'transparent',
              padding: 0,
              borderRadius: 20,
              minWidth: 400,
              minHeight: 480,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >

            {/* QR Frame */}
            <div style={{
              width: 500,
              height: 370,
              marginTop: 40,
              marginBottom: 40,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111',
              borderRadius: 16,
              boxShadow: '0 0 0 4px #222'
            }}>

              {/* QR Scanner Camera View ONLY */}
              <div style={{
                width: 500,
                height: 370,
                marginTop: 40,
                marginBottom: 40,
                overflow: 'hidden',
                borderRadius: 16,
                background: '#222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <QrScanner onScan={handleScan} autoStart={showScanner} />
              </div>
            </div>
            {/* Instruction */}
            <div style={{ color: '#11d338ff', fontSize: 20, marginBottom: 24, textAlign: 'center' }}>
              Align QR Code within<br />frame to scan
            </div>
          </div>
        </div>
      )}

      {/* Centered Attendance Table */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
        <h4>Today's Attendance</h4>
        <div style={{ minWidth: 500, maxWidth: 800, width: '100%' }}>
          <AttendanceTable records={attendance} />
        </div>
        {scanResult && (
          <div style={{ margin: '16px 0', fontWeight: 'bold', color: scanResult === 'Scan successful!' ? 'green' : 'red' }}>
            {scanResult}
          </div>
        )}
              {scannedEmployee && (
        <div style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24,
          margin: '24px auto', maxWidth: 400, textAlign: 'center'
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
            {scannedEmployee.first_name} {scannedEmployee.last_name}
          </div>
          <div style={{ color: '#888', marginBottom: 8 }}>
            {scannedEmployee.position}
          </div>
          <div style={{ color: '#888', marginBottom: 8 }}>
            Department: {scannedEmployee.department_name}
          </div>
          <div style={{ color: '#888', marginBottom: 8 }}>
            Email: {scannedEmployee.email}
          </div>
          <div style={{ color: '#888', marginBottom: 8 }}>
            Status: {scannedEmployee.status}
          </div>
        </div>
      )}
      </div>

      <div style={{ display: 'flex', gap: 24, margin: '32px 0', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 180 }}>
          <div style={{ color: '#888' }}>Total Records</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{attendance.length}</div>
          <div style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>Today</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 180 }}>
          <div style={{ color: '#888' }}>Present</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1bbf3aff' }}>{presentToday}</div>
          <div style={{ color: '#1bbf3aff', fontSize: 13, marginTop: 8 }}>↑ {attendance.length ? Math.round((presentToday/attendance.length)*100) : 0}%</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 180 }}>
          <div style={{ color: '#888' }}>Late</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ff9800' }}>{lateToday}</div>
          <div style={{ color: '#ff9800', fontSize: 13, marginTop: 8 }}>↑ {attendance.length ? Math.round((lateToday/attendance.length)*100) : 0}%</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 180 }}>
          <div style={{ color: '#888' }}>Absent</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#f44336' }}>{absentToday}</div>
          <div style={{ color: '#f44336', fontSize: 13, marginTop: 8 }}>↑ {attendance.length ? Math.round((absentToday/attendance.length)*100) : 0}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 400 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Attendance Trends (Last 7 Days)</div>
          <Line
            data={{
              labels: trendData.labels,
              datasets: [{
                label: 'Present',
                data: trendData.data,
                borderColor: '#1bbf3aff',
                backgroundColor: '#1bbf3a22',
                tension: 0.3,
                fill: true
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } }
            }}
            height={180}
          />
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, minWidth: 300 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Monthly Attendance</div>
          <Pie
            data={{
              labels: pieData.labels,
              datasets: [{
                data: pieData.data,
                backgroundColor: ['#1bbf3aff', '#ff9800', '#f44336']
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }}
            height={180}
          />
        </div>
      </div>

      {scanError && (
        <div style={{ color: 'red', marginTop: 10 }}>{scanError}</div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
