// Example: QrScannerModal.jsx
import React, { useState } from 'react';
import QrScanner from './QrScanner';

export default function QrScannerModal({ open, onClose, ...props }) {
  const [scanned, setScanned] = useState(false);

  if (!open) return null;

  const handleScan = (value) => {
    if (props.onScan) props.onScan(value);
    setScanned(true);
    setTimeout(() => {
      onClose();
      setScanned(false);
    }, 500); // Wait 500ms before closing to let camera stop
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>
        <QrScanner {...props} onScan={handleScan} />
      </div>
    </div>
  );
}