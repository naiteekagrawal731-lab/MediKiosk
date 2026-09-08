import React from 'react';
import { useSession } from '../context/SessionContext';

export const KioskHeader = () => {
  const { sessionData, updateSession } = useSession();
  const currentLang = sessionData?.language || 'EN';

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
          <p className="kiosk-brand-tagline">Your Health, Our Priority</p>
        </div>
      </div>

      <div className="kiosk-header-right">
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
