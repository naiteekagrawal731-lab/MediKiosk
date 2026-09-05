import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';

export const InterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, clearSession } = useSession();

  const lang = sessionData.language || 'EN';
  const t = translations[lang];

  const handleFinish = () => {
    clearSession();
    navigate('/');
  };

  return (
    <PageContainer>
      <ProgressIndicator step={5} total={5} />
      
      <h2 className="kiosk-question" style={{ color: 'var(--primary-color)' }}>
        {t.interviewPlaceholder}
      </h2>

      <p className="kiosk-subtitle">
        Session ID: <strong>{sessionId}</strong>
      </p>

      <div style={{ marginTop: '3rem', width: '100%', maxWidth: '300px' }}>
        <Button onClick={handleFinish} variant="outline">
          End Session (Test)
        </Button>
      </div>
    </PageContainer>
  );
};
