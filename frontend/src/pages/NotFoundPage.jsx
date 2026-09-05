import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h1 className="kiosk-title" style={{ fontSize: '4rem', color: '#ef4444' }}>404</h1>
      <h2 className="kiosk-question">Page Not Found or Invalid Session</h2>
      <p className="kiosk-subtitle">
        The session you are looking for does not exist or has expired.
      </p>

      <div style={{ width: '100%', maxWidth: '300px', marginTop: '2rem' }}>
        <Button onClick={() => navigate('/')} variant="primary">
          Return Home
        </Button>
      </div>
    </PageContainer>
  );
};
