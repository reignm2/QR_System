import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan, autoStart }) {
  const scannerId = useRef(`qr-reader-${Math.random().toString(36).substr(2, 9)}`).current;
  const html5QrCodeRef = useRef(null);
  const width = 500;
  const height = 370;

  useEffect(() => {
    if (!autoStart) return;

    const oldElem = document.getElementById(scannerId);
    if (oldElem) {
      Array.from(oldElem.querySelectorAll('video,canvas')).forEach(el => el.remove());
      while (oldElem.firstChild) {
        oldElem.removeChild(oldElem.firstChild);
      }
    }

    if (html5QrCodeRef.current) {
      if (typeof html5QrCodeRef.current.clear === 'function') {
        try {
          const result = html5QrCodeRef.current.clear();
          if (result && typeof result.catch === 'function') {
            result.catch(() => {});
          }
        } catch {}
      }
      html5QrCodeRef.current = null;
    }

    html5QrCodeRef.current = new Html5Qrcode(scannerId);

    html5QrCodeRef.current
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 400, height: 400 } },
        (decodedText) => {
          if (onScan) onScan(decodedText);
          if (html5QrCodeRef.current && typeof html5QrCodeRef.current.stop === 'function') {
            const stopResult = html5QrCodeRef.current.stop();
            if (stopResult && typeof stopResult.catch === 'function') {
              stopResult.catch(() => {});
            }
          }
        },
        () => {}
      )
      .catch(() => {});

    return () => {
      if (html5QrCodeRef.current) {
        if (typeof html5QrCodeRef.current.stop === 'function') {
          try {
            const stopResult = html5QrCodeRef.current.stop();
            if (stopResult && typeof stopResult.catch === 'function') {
              stopResult.catch(() => {});
            }
          } catch {}
        }
        if (typeof html5QrCodeRef.current.clear === 'function') {
          try {
            const clearResult = html5QrCodeRef.current.clear();
            if (clearResult && typeof clearResult.catch === 'function') {
              clearResult.catch(() => {});
            }
          } catch {}
        }
        html5QrCodeRef.current = null;
      }
      const elem = document.getElementById(scannerId);
      if (elem) {
        while (elem.firstChild) {
          elem.removeChild(elem.firstChild);
        }
      }
    };
  }, [autoStart, onScan, scannerId]);

  return (
    <div
      className="qr-scanner-container"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: '#111',
        borderRadius: 16,
        overflow: 'hidden',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      {/* The video/canvas will be injected here by Html5Qrcode */}
      <div
        id={scannerId}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      {/* QR scan frame overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '310px',
          height: '310px',
          transform: 'translate(-50%, -50%)',
          border: '2px solid rgba(0, 255, 4, 1)',
          borderRadius: 8,
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
}