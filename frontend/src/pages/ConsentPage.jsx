import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AudioControlBar } from '../components/AudioControlBar';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';

export const ConsentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { speak, cancel } = useSpeechSynthesis();
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
      speak(t.consentQuestion, lang, { volume: customVol, isMuted: customMuted });
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

  const handleConsent = (given) => {
    if (given) {
      updateSession({ consentGiven: true, sessionId });
      navigate(`/session/${sessionId}/register`);
    } else {
      setErrorMsg(t.consentRequired);
    }
  };

  const handleGoBack = () => {
    navigate(`/session/${sessionId}/language`);
  };

  return (
    <PageContainer>
      <div className="interview-main-card">
        <div className="interview-header-info">
          <h2 className="interview-session-id">
            Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
          </h2>
          <ProgressIndicator step={2} total={4} />
        </div>

        <div className="interview-body-content">
          <div className="kiosk-question-header-row">
            <SpeakerButton onClick={() => playSpeech(false, volume)} />
            <h1 className="kiosk-question-text" style={{ fontSize: '2rem' }}>
              {t.consentQuestion}
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
              onClick={() => handleConsent(true)} 
              className="kiosk-option-card selected"
              style={{ padding: '1.4rem', fontSize: '1.5rem' }}
            >
              ✅ {t.yesConsent}
            </button>
            <button 
              type="button"
              onClick={() => handleConsent(false)} 
              className="kiosk-option-card"
              style={{ padding: '1.4rem', fontSize: '1.5rem' }}
            >
              ❌ {t.noConsent}
            </button>
          </div>

          <div style={{ maxWidth: '540px', margin: '1.25rem auto 0 auto' }}>
            <button 
              type="button" 
              onClick={handleGoBack} 
              className="kiosk-secondary-action-btn"
              style={{ width: '100%' }}
            >
              {t.backBtn || '← Back'}
            </button>
          </div>

          {errorMsg && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="interview-error-msg">{errorMsg}</div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
