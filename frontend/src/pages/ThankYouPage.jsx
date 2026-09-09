import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { SpeakerButton } from '../components/SpeakerButton';
import { useSession } from '../context/SessionContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { translations } from '../utils/translations';

export const ThankYouPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, clearSession } = useSession();
  const { speak } = useSpeechSynthesis();
  
  const lang = sessionData.language || 'EN';
  const t = translations[lang] || translations['EN'];

  const [timeLeft, setTimeLeft] = useState(60);

  const cleanSessionId = (sessionId || '').trim();
  const qrValue = cleanSessionId ? `${window.location.origin}/doctor/session/${cleanSessionId}` : '';

  const handleEndSession = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearSession();
    navigate('/');
  };

  const handleSpeakMessage = () => {
    const speechText = `${t.thankYouMsg} ${t.sessionIdInstruction}`;
    speak(speechText, lang);
  };

  // Speak message on mount
  useEffect(() => {
    handleSpeakMessage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageContainer>
      <div style={{ textAlign: 'center', marginTop: '1rem', width: '100%', maxWidth: '700px' }}>
        <SpeakerButton onClick={handleSpeakMessage} />
        
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          {t.thankYouTitle}
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--text-main)' }}>
          {t.thankYouMsg}
        </p>

        <div style={{ 
          background: '#f8fafc', 
          border: '3px solid var(--primary-color)',
          padding: '2rem', 
          borderRadius: '20px',
          display: 'block',
          margin: '0 auto 2rem auto',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.sessionIdTitle}
          </h2>

          <div style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '4px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            {cleanSessionId ? cleanSessionId.toUpperCase() : ''}
          </div>

          {qrValue && (
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '12px',
              display: 'inline-block',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              marginBottom: '1rem'
            }}>
              <QRCodeSVG
                value={qrValue}
                size={190}
                level="H"
                includeMargin={true}
              />
            </div>
          )}

          <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--text-main)', fontWeight: '500', lineHeight: 1.5 }}>
            {t.sessionIdInstruction}
          </p>
        </div>

        <div style={{ marginBottom: '2rem', fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          {t.autoEndNotice} <span style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: '800' }}>{timeLeft}</span> {t.seconds}.
        </div>

        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <Button onClick={handleEndSession} variant="primary">
            {t.endSession}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

