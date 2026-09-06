import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';

export const ConsentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { speak } = useSpeechSynthesis();
  const [errorMsg, setErrorMsg] = useState('');

  const lang = sessionData.language || 'EN';
  const t = translations[lang];

  useEffect(() => {
    speak(t.consentQuestion, lang);
  }, [speak, t.consentQuestion, lang]);

  const handleConsent = (given) => {
    if (given) {
      updateSession({ consentGiven: true, sessionId });
      navigate(`/session/${sessionId}/register`);
    } else {
      setErrorMsg(t.consentRequired);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <PageContainer>
      <ProgressIndicator step={2} total={4} />
      
      <SpeakerButton onClick={() => speak(t.consentQuestion, lang)} />
      <h2 className="kiosk-question">{t.consentQuestion}</h2>

      <div className="kiosk-button-grid">
        <Button onClick={() => handleConsent(true)} variant="primary">
          {t.yesConsent}
        </Button>
        <Button onClick={() => handleConsent(false)} variant="outline">
          {t.noConsent}
        </Button>
      </div>

      {errorMsg && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p className="kiosk-message">{errorMsg}</p>
          <Button onClick={handleGoBack} variant="secondary" className="w-auto px-6 py-3 text-lg">
            Start Again
          </Button>
        </div>
      )}
    </PageContainer>
  );
};
