import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { createSession } from '../services/springApi';
import { useSession } from '../context/SessionContext';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { updateSession, clearSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async () => {
    setErrorMsg('');
    setLoading(true);
    // Clear any old session data first
    clearSession();
    
    try {
      const { session_id } = await createSession();
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
      <div style={{ marginBottom: '4rem' }}>
        <h1 className="kiosk-title">MediKiosk</h1>
        <p className="kiosk-subtitle">Your Digital Health History Assistant</p>
      </div>
      
      <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '600px' }}>
        This system helps collect your medical history before your consultation to save time and provide better care.
      </p>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Button onClick={handleStart} disabled={loading}>
          {loading ? 'Starting...' : 'Start'}
        </Button>
      </div>

      {errorMsg && (
        <p className="kiosk-message">{errorMsg}</p>
      )}
    </PageContainer>
  );
};
