import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { getHospitalRegistrationNumber, clearHospitalRegistrationNumber, maskRegistrationNumber } from '../utils/kioskDevice';
import { loginHospital } from '../services/hospitalApi';
import { translations } from '../utils/translations';

export const KioskHeader = () => {
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const currentLang = sessionData?.language || 'EN';
  const t = translations[currentLang] || translations['EN'];

  const [hospitalRegNum, setHospitalRegNum] = useState(() => getHospitalRegistrationNumber());
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [hospUsername, setHospUsername] = useState('');
  const [hospPassword, setHospPassword] = useState('');
  const [discLoading, setDiscLoading] = useState(false);
  const [discError, setDiscError] = useState('');

  useEffect(() => {
    const handleDeviceChange = () => {
      setHospitalRegNum(getHospitalRegistrationNumber());
    };
    window.addEventListener('kiosk_device_changed', handleDeviceChange);
    return () => {
      window.removeEventListener('kiosk_device_changed', handleDeviceChange);
    };
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    updateSession({ language: newLang });
  };

  const handleOpenDisconnectModal = () => {
    setHospUsername('');
    setHospPassword('');
    setDiscError('');
    setShowDisconnectModal(true);
  };

  const handleDisconnectSubmit = async (e) => {
    e.preventDefault();
    setDiscError('');

    if (!hospUsername.trim()) {
      setDiscError('Hospital Username is required.');
      return;
    }
    if (!hospPassword.trim()) {
      setDiscError('Hospital Password is required.');
      return;
    }

    setDiscLoading(true);
    try {
      // Verify hospital credentials via POST /hospital/login
      await loginHospital({
        username: hospUsername.trim(),
        password: hospPassword,
      });

      // Clear stored kiosk registration number and notify listeners
      clearHospitalRegistrationNumber();
      setHospitalRegNum(null);
      setShowDisconnectModal(false);
    } catch (err) {
      console.error('Disconnect verification failed:', err);
      setDiscError(err.message || 'Invalid Hospital Username or Password.');
    } finally {
      setDiscLoading(false);
    }
  };

  const maskedDisplay = hospitalRegNum ? maskRegistrationNumber(hospitalRegNum) : '';

  return (
    <>
      <header className="kiosk-header">
        <div className="kiosk-brand">
          <div className="kiosk-logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="#0ea5e9"/>
              <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
              <path d="M25 11C25 11 29 13.5 29 17.5C29 21.5 25 24 25 24" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="kiosk-brand-text">
            <h1 className="kiosk-brand-title">MediKiosk</h1>
            <p className="kiosk-brand-tagline">
              {hospitalRegNum
                ? `${t.connectedKiosk || 'Connected Kiosk'} (${maskedDisplay})`
                : (t.tagline || 'Your Health, Our Priority')}
            </p>
          </div>
        </div>

        <div className="kiosk-header-right">
          {hospitalRegNum ? (
            <button
              type="button"
              onClick={handleOpenDisconnectModal}
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fca5a5',
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Disconnect Kiosk Device"
            >
              <span>🔌</span> Disconnect
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/patient/account')}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Patient Account Portal"
              >
                <span>👤</span> {t.patientAccount || 'Patient Account'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/staff')}
                style={{
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Hospital Staff Portal"
              >
                <span>🔐</span> {t.staff || 'Staff'}
              </button>
            </>
          )}

          <div className="kiosk-lang-selector">
            <span className="kiosk-lang-icon" aria-hidden="true">🌐</span>
            <select 
              value={currentLang} 
              onChange={handleLanguageChange}
              className="kiosk-lang-select"
              aria-label="Select Language"
            >
              <option value="EN">EN</option>
              <option value="HI">HI (हिंदी)</option>
            </select>
          </div>
        </div>
      </header>

      {/* DISCONNECT KIOSK MODAL */}
      {showDisconnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔌</span> Disconnect Kiosk Device
              </h2>
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Please enter your <strong>Hospital Username</strong> and <strong>Password</strong> to authorize disconnecting this kiosk device.
            </p>

            {discError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '1.25rem',
                fontWeight: 500
              }}>
                ⚠️ {discError}
              </div>
            )}

            <form onSubmit={handleDisconnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Hospital Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Hospital Username"
                  value={hospUsername}
                  onChange={(e) => setHospUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Hospital Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Hospital Password"
                  value={hospPassword}
                  onChange={(e) => setHospPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDisconnectModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#475569',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={discLoading}
                  style={{
                    flex: 1.5,
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: discLoading ? 0.7 : 1
                  }}
                >
                  {discLoading ? 'Verifying...' : 'Disconnect Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
