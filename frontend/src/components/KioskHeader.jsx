import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { getHospitalRegistrationNumber } from '../utils/kioskDevice';

export const KioskHeader = () => {
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const currentLang = sessionData?.language || 'EN';
  const hospitalRegNum = getHospitalRegistrationNumber();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    updateSession({ language: newLang });
  };

  return (
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
            {hospitalRegNum ? `Connected Kiosk (${hospitalRegNum})` : 'Your Health, Our Priority'}
          </p>
        </div>
      </div>

      <div className="kiosk-header-right">
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
          <span>👤</span> Patient Account
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
          <span>🔐</span> Staff
        </button>

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
  );
};
