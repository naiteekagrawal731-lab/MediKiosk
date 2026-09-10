import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AudioControlBar } from '../components/AudioControlBar';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';
import { startClinicalSession } from '../services/djangoApi';

export const TreatmentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { speak, cancel } = useSpeechSynthesis();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [volume, setVolume] = useState(() => {
    const savedVol = sessionStorage.getItem('medikiosk_audio_volume');
    return savedVol !== null ? parseFloat(savedVol) : 1;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = sessionStorage.getItem('medikiosk_audio_muted');
    return savedMute === 'true';
  });

  const lang = sessionData.language || 'EN';
  const t = translations[lang] || translations['EN'];

  const playSpeech = (customMuted = isMuted, customVol = volume) => {
    if (!customMuted) {
      speak(t.treatmentQuestion, lang, { volume: customVol, isMuted: customMuted });
    } else {
      cancel();
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    sessionStorage.setItem('medikiosk_audio_volume', newVol.toString());
    if (!isMuted) {
      playSpeech(false, newVol);
    }
  };

  const handleMuteChange = (muted) => {
    setIsMuted(muted);
    sessionStorage.setItem('medikiosk_audio_muted', muted ? 'true' : 'false');
    if (muted) {
      cancel();
    } else {
      playSpeech(false, volume);
    }
  };

  useEffect(() => {
    playSpeech(isMuted, volume);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTreatmentSelect = async (treatmentType) => {
    setErrorMsg('');
    setLoading(true);
    updateSession({ treatmentType, sessionId });

    try {
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
      <div className="interview-main-card">
        <div className="interview-header-info">
          <h2 className="interview-session-id">
            Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
          </h2>
          <ProgressIndicator step={4} total={4} />
        </div>

        <div className="interview-body-content">
          <div className="kiosk-question-header-row">
            <SpeakerButton onClick={() => playSpeech(false, volume)} />
            <h1 className="kiosk-question-text" style={{ fontSize: '2rem' }}>
              {t.treatmentQuestion}
            </h1>
          </div>

          <AudioControlBar 
            onPlayAudio={() => playSpeech(false, volume)}
            volume={volume}
            setVolume={handleVolumeChange}
            isMuted={isMuted}
            setIsMuted={handleMuteChange}
            lang={lang}
          />

          <div className="options-buttons-grid" style={{ maxWidth: '540px', margin: '1.5rem auto 0 auto' }}>
            <button 
              type="button"
              onClick={() => handleTreatmentSelect('AYUSH')} 
              disabled={loading}
              className="kiosk-option-card selected"
              style={{ padding: '1.5rem', fontSize: '1.5rem' }}
            >
              🌿 {loading ? (t.pleaseWait || 'Please wait...') : t.ayush}
            </button>
            <button 
              type="button"
              onClick={() => handleTreatmentSelect('ALLOPATHIC')} 
              disabled={loading}
              className="kiosk-option-card"
              style={{ padding: '1.5rem', fontSize: '1.5rem' }}
            >
              💊 {loading ? (t.pleaseWait || 'Please wait...') : t.allopathic}
            </button>
          </div>

          <div style={{ maxWidth: '540px', margin: '1.25rem auto 0 auto' }}>
            <button 
              type="button" 
              onClick={() => navigate(`/session/${sessionId}/register`)} 
              disabled={loading}
              className="kiosk-secondary-action-btn"
              style={{ width: '100%' }}
            >
              {t.backBtn || '← Back'}
            </button>
          </div>

          {errorMsg && (
            <div className="interview-error-msg" style={{ marginTop: '1.5rem' }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
