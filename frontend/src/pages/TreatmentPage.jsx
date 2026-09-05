import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';
import { startClinicalSession } from '../services/djangoApi';

export const TreatmentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { speak } = useSpeechSynthesis();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lang = sessionData.language || 'EN';
  const t = translations[lang];

  useEffect(() => {
    speak(t.treatmentQuestion, lang);
  }, [speak, t.treatmentQuestion, lang]);

  const handleTreatmentSelect = async (treatmentType) => {
    setErrorMsg('');
    setLoading(true);
    updateSession({ treatmentType, sessionId });

    try {
      // Start Django clinical session
      await startClinicalSession(sessionId, {
        language: sessionData.language,
        consent_given: sessionData.consentGiven,
        treatment_type: treatmentType
      });
      navigate(`/session/${sessionId}/interview`);
    } catch (error) {
      console.error('Failed to start clinical session', error);
      setErrorMsg(error.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ProgressIndicator step={4} total={5} />
      
      <SpeakerButton onClick={() => speak(t.treatmentQuestion, lang)} />
      <h2 className="kiosk-question">{t.treatmentQuestion}</h2>

      <div className="kiosk-button-grid">
        <Button 
          onClick={() => handleTreatmentSelect('AYUSH')} 
          variant="primary"
          disabled={loading}
        >
          {loading ? '...' : t.ayush}
        </Button>
        <Button 
          onClick={() => handleTreatmentSelect('ALLOPATHIC')} 
          variant="secondary"
          disabled={loading}
        >
          {loading ? '...' : t.allopathic}
        </Button>
      </div>

      {errorMsg && (
        <p className="kiosk-message">{errorMsg}</p>
      )}
    </PageContainer>
  );
};
