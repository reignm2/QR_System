import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function EmployeeQRGenerator() {
  const employeeId = localStorage.getItem('userId');
  const [qrToken, setQrToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQr() {
      try {
        const res = await fetch(`/api/employees/${employeeId}/generate-qr`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setQrToken(data.qrToken);
        else setError(data.error || 'Failed to generate QR');
      } catch (err) {
        setError('Network error');
      }
    }
    if (employeeId) fetchQr();
  }, [employeeId]);

  return (
    <div className="container mt-4">
      <h2>Your Attendance QR Code</h2>
      {qrToken ? (
        <QRCodeCanvas value={qrToken} size={256} />
      ) : (
        <p className="text-danger">{error || 'Loading...'}</p>
      )}
      <p className="mt-2 text-muted">QR code expires in 5 minutes.</p>
    </div>
  );
}

export default EmployeeQRGenerator;
