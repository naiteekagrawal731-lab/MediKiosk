import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { createSession } from '../services/springApi';
import { createDjangoSession } from '../services/djangoApi';
import { useSession } from '../context/SessionContext';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { updateSession, clearSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async () => {
    setErrorMsg('');
    setLoading(true);
    clearSession();
    
    try {
      const { session_id } = await createSession();
      await createDjangoSession(session_id);
      updateSession({ sessionId: session_id });
      navigate(`/session/${session_id}/language`);
    } catch (error) {
      console.error('Error creating session:', error);
      setErrorMsg(error.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="welcome-hero-title">Welcome to MediKiosk</h1>
          <p className="welcome-hero-subtitle">Your Digital Health History Assistant</p>
        </div>

        {/* Info & Feature Highlights Box */}
        <div className="welcome-info-box">
          <p className="welcome-main-desc">
            This kiosk helps collect your medical history before your consultation to save time and assist your doctor in providing better care.
          </p>

          <div className="welcome-features-list">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div className="feature-text">
                <strong>Saves Consultation Time</strong>
                <span>Quickly record symptoms before entering the doctor's cabin.</span>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔊</span>
              <div className="feature-text">
                <strong>Voice & Touch Friendly</strong>
                <span>Speak or tap buttons easily. Designed for all age groups.</span>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div className="feature-text">
                <strong>Safe & Confidential</strong>
                <span>Your information is encrypted and securely sent to your doctor.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="interview-error-msg" style={{ width: '100%', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="welcome-action-area" style={{ width: '100%' }}>
          <button 
            type="button"
            onClick={handleStart} 
            disabled={loading}
            className="kiosk-submit-btn"
            style={{ fontSize: '1.6rem', padding: '1.25rem' }}
          >
            {loading ? 'Starting Consultation...' : 'Start Consultation →'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
