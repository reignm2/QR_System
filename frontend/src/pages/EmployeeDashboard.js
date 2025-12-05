import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import API from '../api';
import { QRCodeCanvas } from 'qrcode.react';

function EmployeeDashboard() {
  const [profile, setProfile] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, totalHours: 0 });
  const [codeValue, setCodeValue] = useState('');
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [qrCountdown, setQrCountdown] = useState(0);
  const [loadingQR, setLoadingQR] = useState(false);
  const [showFullQR, setShowFullQR] = useState(false);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState('Not Checked In');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch profile
        const profileRes = await API.get('/employees/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // Fetch attendance
        const attendanceRes = await API.get('/attendance/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(attendanceRes.data.records);

        // Calculate stats for the employee
        let present = 0, late = 0, absent = 0, totalHours = 0;
        attendanceRes.data.records.forEach(r => {
          if (r.status && r.status.toLowerCase() === 'present') present++;
          if (r.status && r.status.toLowerCase() === 'late') late++;
          if (r.status && r.status.toLowerCase() === 'absent') absent++;
          if (r.time_in && r.time_out) {
            const inDate = new Date(r.time_in);
            const outDate = new Date(r.time_out);
            const diff = (outDate - inDate) / (1000 * 60 * 60);
            if (diff > 0) totalHours += diff;
          }
        });
        setStats({
          present,
          late,
          absent,
          totalHours: totalHours.toFixed(2)
        });

        // Fetch latest QR code
        const qrRes = await API.get('/employees/latest-qr', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (qrRes.data.codeValue && qrRes.data.expiresAt) {
          setCodeValue(qrRes.data.codeValue);
          setQrExpiresAt(qrRes.data.expiresAt);
          setQrCountdown(Math.max(0, Math.floor((qrRes.data.expiresAt - Date.now()) / 1000)));
          localStorage.setItem('codeValue', qrRes.data.codeValue);
          localStorage.setItem('qrExpiresAt', qrRes.data.expiresAt);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer;
    if (qrExpiresAt) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((qrExpiresAt - Date.now()) / 1000));
        setQrCountdown(remaining);
        if (remaining === 0) {
          setCodeValue('');
          setQrExpiresAt(null);
          localStorage.removeItem('codeValue');
          localStorage.removeItem('qrExpiresAt');
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [qrExpiresAt]);

  useEffect(() => {
    if (attendance.length) {
      const today = new Date().toLocaleDateString('en-CA');
      const todayRecord = attendance.find(a => {
        const recordDate = a.date ? new Date(a.date).toLocaleDateString('en-CA') : '';
        return recordDate === today;
      });
      if (todayRecord) {
        if (todayRecord.time_in && !todayRecord.time_out) setCheckInStatus('Timed In');
        else if (todayRecord.time_in && todayRecord.time_out) setCheckInStatus('Timed Out');
        else setCheckInStatus('Not Checked In');
      } else {
        setCheckInStatus('Not Checked In');
      }
    }
  }, [attendance]);

  const generateQR = async () => {
    setLoadingQR(true);
    const token = localStorage.getItem('token');
    try {
      const res = await API.get('/employees/generate-qr', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.codeValue && res.data.expiresAt) {
        setCodeValue(res.data.codeValue);
        setQrExpiresAt(res.data.expiresAt);
        setQrCountdown(Math.max(0, Math.floor((res.data.expiresAt - Date.now()) / 1000)));
        localStorage.setItem('codeValue', res.data.codeValue);
        localStorage.setItem('qrExpiresAt', res.data.expiresAt);
      }
    } catch (err) {
      alert('Failed to generate QR code');
    }
    setLoadingQR(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleTimeIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.post('/attendance/time-in', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert('Time in recorded!');
        setCheckInStatus('Timed In');
        // Refresh attendance data
        const attendanceRes = await API.get('/attendance/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(attendanceRes.data.records);
      } else {
        alert(res.data.error || 'Failed to time in');
      }
    } catch (err) {
      alert('Error during time in');
    }
  };

  const handleTimeOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.post('/attendance/time-out', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert('Time out recorded!');
        setCheckInStatus('Timed Out');
        // Refresh attendance data
        const attendanceRes = await API.get('/attendance/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(attendanceRes.data.records);
      } else {
        alert(res.data.error || 'Failed to time out');
      }
    } catch (err) {
      alert('Error during time out');
    }
  };

  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  if (loading) return <div className="container py-4">Loading...</div>;

  return (
    <div style={{ background: "#fafafa", minHeight: "90vh" }}>
      {/* Top Bar */}
      <div
        style={{
          width: "100%",
          background: "#fff",
          boxShadow: "0 2px 8px #0001",
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 25,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 26 }}>
            {profile.first_name} {profile.last_name}
          </div>
          <div style={{ color: "#888", fontSize: 16 }}>{profile.position}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15 }}>{dateStr}</div>
          <div style={{ fontSize: 15 }}>{timeStr}</div>
          <Button
            variant="outline-dark"
            size="sm"
            style={{ fontWeight: 600, marginTop: 8 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <Card className="mb-4 p-4" style={{ borderRadius: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Profile Information</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: 6, fontWeight: 600, width: 160 }}>Full Name:</td>
                  <td style={{ padding: 6 }}>{profile.first_name} {profile.last_name}</td>
                  <td style={{ padding: 6, fontWeight: 600, width: 160 }}>Employee ID:</td>
                  <td style={{ padding: 6 }}>{profile.employeeID}</td>
                </tr>
                <tr>
                  <td style={{ padding: 6, fontWeight: 600 }}>Department:</td>
                  <td style={{ padding: 6 }}>{profile.department_name}</td>
                  <td style={{ padding: 6, fontWeight: 600 }}>Position:</td>
                  <td style={{ padding: 6 }}>{profile.position}</td>
                </tr>
                <tr>
                  <td style={{ padding: 6, fontWeight: 600 }}>Email:</td>
                  <td style={{ padding: 6 }}>{profile.email}</td>
                  <td style={{ padding: 6, fontWeight: 600 }}>Status:</td>
                  <td style={{ padding: 6 }}>
                    <span style={{ color: "green", fontWeight: 600 }}>{profile.status}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Attendance History</div>
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((row, idx) => {
                const date = row.date
                  ? new Date(row.date).toLocaleDateString('en-CA')
                  : '-';
                const timeIn = row.time_in
                  ? new Date(row.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '-';
                const timeOut = row.time_out
                  ? new Date(row.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '-';

                let hours = row.hours;
                if (!hours && row.time_in && row.time_out) {
                  const inDate = new Date(row.time_in);
                  const outDate = new Date(row.time_out);
                  const diff = (outDate - inDate) / (1000 * 60 * 60);
                  hours = diff >= 0 ? diff.toFixed(2) : '-';
                }
                if (!hours) hours = '-';

                return (
                  <tr key={idx}>
                    <td>{date}</td>
                    <td>{timeIn}</td>
                    <td>{timeOut}</td>
                    <td>{hours}</td>
                    <td>
                      {row.status === "Present" && <Badge bg="dark">Present</Badge>}
                      {row.status === "Late" && <Badge bg="danger">Late</Badge>}
                      {row.status === "Absent" && <Badge bg="secondary">Absent</Badge>}
                      {!["Present", "Late", "Absent"].includes(row.status) && row.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="p-4" style={{ borderRadius: 18, minHeight: 260 }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Check In</div>
              <div style={{ color: "#888", marginBottom: 10 }}>Scan your QR code to time in and out</div>
              <div className="mb-2">
                <span style={{ fontWeight: 600, background: "#eee", borderRadius: 12, padding: "4px 16px" }}>
                  Status: {checkInStatus}
                </span>
              </div>
              <div className="d-flex gap-2 mt-2">
                <Button variant="dark" style={{ flex: 1, borderRadius: 20 }} onClick={handleTimeIn}>Time In</Button>
                <Button variant="dark" style={{ flex: 1, borderRadius: 20 }} onClick={handleTimeOut}>Time Out</Button>
              </div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-4 text-center" style={{ borderRadius: 18, minHeight: 260 }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Your QR Code</div>
              {codeValue && qrExpiresAt && qrCountdown > 0 ? (
                <>
                  <QRCodeCanvas
                    value={codeValue}
                    size={200}
                    style={{ marginBottom: 10, display: "block", marginLeft: "auto", marginRight: "auto", cursor: "pointer" }}
                    onClick={() => setShowFullQR(true)}
                  />
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
                    Expires in {Math.floor(qrCountdown / 60)}:{String(qrCountdown % 60).padStart(2, '0')} min
                  </div>
                  <Button variant="outline-dark" size="sm" className="mt-2" onClick={() => setShowFullQR(true)}>
                    View Full Size
                  </Button>
                  {showFullQR && (
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                      }}
                      onClick={() => setShowFullQR(false)}
                    >
                      <QRCodeCanvas value={codeValue} size={400} />
                    </div>
                  )}
                </>
              ) : (
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="mt-2"
                  onClick={generateQR}
                  disabled={loadingQR}
                >
                  {loadingQR ? 'Generating...' : 'Generate QR'}
                </Button>
              )}
            </Card>
          </Col>
          <Col md={4}>
            <Row>
              <Col xs={6}>
                <Card className="p-3 text-center mb-3" style={{ borderRadius: 18 }}>
                  <div style={{ color: "#1a1a1a", fontWeight: 600 }}>Present</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.present}</div>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="p-3 text-center mb-3" style={{ borderRadius: 18 }}>
                  <div style={{ color: "#1a1a1a", fontWeight: 600 }}>Late</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.late}</div>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="p-3 text-center" style={{ borderRadius: 18 }}>
                  <div style={{ color: "#1a1a1a", fontWeight: 600 }}>Absent</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.absent}</div>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="p-3 text-center" style={{ borderRadius: 18 }}>
                  <div style={{ color: "#1a1a1a", fontWeight: 600 }}>Total Hour</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalHours}</div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default EmployeeDashboard;