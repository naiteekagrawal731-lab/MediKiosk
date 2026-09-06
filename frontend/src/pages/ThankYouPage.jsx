import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { useSession } from '../context/SessionContext';

export const ThankYouPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, clearSession } = useSession();
  
  const lang = sessionData.language || 'EN';
  const t = {
    EN: {
      thankYou: "Thank you for your time.",
      instruction: "Please write down your Session ID and show it to the doctor when you go inside.",
      sessionIdTitle: "Your Session ID",
      endSession: "End Session"
    },
    HI: {
      thankYou: "अपना समय देने के लिए धन्यवाद।",
      instruction: "कृपया अपना सेशन आईडी लिख लें और अंदर जाने पर डॉक्टर को दिखाएं।",
      sessionIdTitle: "आपका सेशन आईडी",
      endSession: "सेशन समाप्त करें"
    }
  };

  const texts = t[lang] || t['EN'];

  const handleEndSession = () => {
    clearSession();
    navigate('/');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleEndSession();
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageContainer>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          {texts.thankYou}
        </h1>
        <p style={{ fontSize: '1.8rem', marginBottom: '3rem' }}>
          {texts.instruction}
        </p>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '2rem', 
          borderRadius: '12px',
          display: 'inline-block',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: '#666' }}>
            {texts.sessionIdTitle}
          </h2>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', letterSpacing: '4px' }}>
            {sessionId}
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <Button onClick={handleEndSession} variant="primary">
            {texts.endSession}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
