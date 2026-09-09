import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const extractSessionIdFromQr = (qrText) => {
  if (!qrText) return null;
  const clean = String(qrText).trim();

  // Match /doctor/session/<sessionId> in URL
  const urlMatch = clean.match(/\/doctor\/session\/([a-zA-Z0-9_-]{4,64})\/?$/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Fallback: match direct session ID string if scanned directly
  if (/^[a-zA-Z0-9_-]{4,64}$/.test(clean)) {
    return clean;
  }

  return null;
};

export const QrScannerModal = ({ onClose, onScanSuccess }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef(null);
  const elementId = 'qr-camera-reader';

  useEffect(() => {
    let isMounted = true;
    const html5QrCode = new Html5Qrcode(elementId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 240, height: 240 },
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (isMounted) {
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Scanner frame error - safe to ignore
        }
      )
      .catch((err) => {
        console.error('Camera initialization error:', err);
        if (isMounted) {
          setErrorMsg(
            'Unable to access camera. Please verify camera permissions or ensure no other app is using it.'
          );
        }
      });

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch((err) => console.error('Error stopping QR scanner:', err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.75rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Scan Patient QR Code
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.925rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Point your camera at the QR code displayed on the patient's MediKiosk Thank You screen.
        </p>

        {errorMsg ? (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              textAlign: 'left',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        ) : (
          <div
            id={elementId}
            style={{
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#000000',
              marginBottom: '1.25rem',
              minHeight: '260px',
            }}
          />
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Close Scanner
        </button>
      </div>
    </div>
  );
};
