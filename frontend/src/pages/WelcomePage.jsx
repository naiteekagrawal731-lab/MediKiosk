import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { getHospitalRegistrationNumber } from '../utils/kioskDevice';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { sessionData, clearSession } = useSession();
  const lang = sessionData?.language || 'EN';
  const t = translations[lang] || translations['EN'];

  const [hospitalRegNum, setHospitalRegNum] = useState(() => getHospitalRegistrationNumber());

  useEffect(() => {
    const handleDeviceChange = () => {
      setHospitalRegNum(getHospitalRegistrationNumber());
    };
    window.addEventListener('kiosk_device_changed', handleDeviceChange);
    return () => {
      window.removeEventListener('kiosk_device_changed', handleDeviceChange);
    };
  }, []);

  const handleStart = () => {
    // Clear any previous session state before starting a new consultation.
    clearSession();
    navigate('/session/new/language');
  };

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Welcome Icon Header */}
        <div className="welcome-hero-header">
          <div className="welcome-icon-circle">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h1 className="welcome-hero-title">{t.welcomeTitle || 'Welcome to MediKiosk'}</h1>
          <p className="welcome-hero-subtitle">
            {t.welcomeSubtitle || 'Your Digital Health History Assistant'}
          </p>
        </div>

        {/* Info & Feature Highlights Box */}
        <div className="welcome-info-box">
          <p className="welcome-main-desc">
            {t.welcomeDesc || 'This kiosk helps collect your medical history before your consultation to save time and assist your doctor in providing better care.'}
          </p>

          <div className="welcome-features-list">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div className="feature-text">
                <strong>{t.featureTimeTitle || 'Saves Consultation Time'}</strong>
                <span>{t.featureTimeDesc || "Quickly record symptoms before entering the doctor's cabin."}</span>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔊</span>
              <div className="feature-text">
                <strong>{t.featureVoiceTitle || 'Voice & Touch Friendly'}</strong>
                <span>{t.featureVoiceDesc || 'Speak or tap buttons easily. Designed for all age groups.'}</span>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div className="feature-text">
                <strong>{t.featureSafeTitle || 'Safe & Confidential'}</strong>
                <span>{t.featureSafeDesc || 'Your information is encrypted and securely sent to your doctor.'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="welcome-action-area" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            type="button"
            id="start-consultation-btn"
            onClick={handleStart}
            className="kiosk-submit-btn"
            style={{ fontSize: '1.6rem', padding: '1.25rem' }}
          >
            {t.startConsultation || 'Start Consultation →'}
          </button>

          {!hospitalRegNum && (
            <button
              type="button"
              onClick={() => navigate('/patient/account')}
              style={{
                width: '100%',
                padding: '1.1rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#f0f9ff',
                border: '2px solid #bae6fd',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span>👤</span> {t.patientAccountLoginCreate || 'Patient Account (Login / Create Account)'}
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
