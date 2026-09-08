import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AudioControlBar } from '../components/AudioControlBar';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';

export const RegisterPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { speak, cancel } = useSpeechSynthesis();
  
  const [view, setView] = useState('choice'); // 'choice', 'existing', 'guest'
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVol = sessionStorage.getItem('medikiosk_audio_volume');
    return savedVol !== null ? parseFloat(savedVol) : 1;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = sessionStorage.getItem('medikiosk_audio_muted');
    return savedMute === 'true';
  });

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    mobile: '',
    dob: '',
    bloodGroup: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const lang = sessionData.language || 'EN';
  const t = translations[lang] || translations['EN'];

  const playSpeech = (customMuted = isMuted, customVol = volume) => {
    if (customMuted) {
      cancel();
      return;
    }
    if (view === 'choice') {
      speak(t.existingPatientQuestion, lang, { volume: customVol, isMuted: customMuted });
    } else if (view === 'guest') {
      speak(t.guest, lang, { volume: customVol, isMuted: customMuted });
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
  }, [lang, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChoice = (selectedView) => {
    setView(selectedView);
    setErrorMsg('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (genderVal) => {
    setFormData(prev => ({ ...prev, gender: genderVal }));
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      updateSession({ 
        patientRegistration: { type: 'guest', ...formData },
        sessionId 
      });
      navigate(`/session/${sessionId}/treatment`);
    } catch (error) {
      console.error('Registration failed', error);
      setErrorMsg(error.message || 'Unable to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingSubmit = () => {
    updateSession({ 
      patientRegistration: { type: 'existing', id: 'PENDING-EXISTING-AUTH' },
      sessionId 
    });
    navigate(`/session/${sessionId}/treatment`);
  };

  if (view === 'existing') {
    return (
      <PageContainer>
        <div className="interview-main-card">
          <div className="interview-header-info">
            <h2 className="interview-session-id">
              Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
            </h2>
            <ProgressIndicator step={3} total={4} />
          </div>

          <div className="interview-body-content">
            <div className="kiosk-question-header-row">
              <SpeakerButton onClick={() => speak("Existing patient login", lang)} />
              <h1 className="kiosk-question-text" style={{ fontSize: '1.8rem' }}>
                Existing patient login will be connected to the Spring Boot patient account system.
              </h1>
            </div>

            <div className="kiosk-button-row-duo" style={{ marginTop: '2rem' }}>
              <button 
                type="button"
                onClick={() => setView('choice')} 
                className="kiosk-secondary-action-btn"
              >
                {t.backBtn || '← Back'}
              </button>
              <button 
                type="button"
                onClick={handleExistingSubmit} 
                className="kiosk-submit-btn"
              >
                {t.continueBtn}
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (view === 'guest') {
    return (
      <PageContainer>
        <div className="interview-main-card">
          <div className="interview-header-info">
            <h2 className="interview-session-id">
              Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
            </h2>
            <ProgressIndicator step={3} total={4} />
          </div>

          <div className="interview-body-content" style={{ width: '100%' }}>
            <div className="kiosk-question-header-row">
              <SpeakerButton onClick={() => playSpeech()} />
              <h1 className="kiosk-question-text" style={{ fontSize: '2rem' }}>
                {t.guest}
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

            <form onSubmit={handleGuestSubmit} className="kiosk-registration-form">
              <div className="form-grid-2col">
                {/* Name Field */}
                <div className="kiosk-field-group col-span-2">
                  <label className="kiosk-field-label">{t.nameLabel} *</label>
                  <input 
                    type="text" 
                    name="name"
                    required 
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="kiosk-form-input" 
                  />
                </div>

                {/* Gender Field */}
                <div className="kiosk-field-group col-span-2">
                  <label className="kiosk-field-label">{t.genderLabel || 'Gender'}</label>
                  <div className="gender-selector-grid">
                    <button 
                      type="button"
                      onClick={() => handleGenderSelect('Male')}
                      className={`gender-btn ${formData.gender === 'Male' ? 'active' : ''}`}
                    >
                      <span className="gender-icon">👨</span>
                      <span>{t.male || 'Male'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleGenderSelect('Female')}
                      className={`gender-btn ${formData.gender === 'Female' ? 'active' : ''}`}
                    >
                      <span className="gender-icon">👩</span>
                      <span>{t.female || 'Female'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleGenderSelect('Other')}
                      className={`gender-btn ${formData.gender === 'Other' ? 'active' : ''}`}
                    >
                      <span className="gender-icon">🧑</span>
                      <span>{t.otherGender || 'Other'}</span>
                    </button>
                  </div>
                </div>

                {/* Age Field */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label">{t.ageLabel}</label>
                  <input 
                    type="number" 
                    name="age"
                    placeholder="e.g. 45"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="kiosk-form-input" 
                  />
                </div>

                {/* Mobile Field */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label">{t.mobileLabel}</label>
                  <input 
                    type="tel" 
                    name="mobile"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="kiosk-form-input" 
                  />
                </div>

                {/* DOB Field */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label">{t.dobLabel}</label>
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="kiosk-form-input" 
                  />
                </div>

                {/* Blood Group Field */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label">{t.bloodGroupLabel}</label>
                  <select 
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="kiosk-form-select"
                  >
                    <option value="">Select Blood Group...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div className="interview-error-msg" style={{ marginTop: '1rem' }}>
                  {errorMsg}
                </div>
              )}

              <div className="kiosk-button-row-duo" style={{ marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => setView('choice')} 
                  className="kiosk-secondary-action-btn"
                >
                  {t.backBtn || '← Back'}
                </button>
                <button 
                  type="submit" 
                  disabled={!formData.name.trim() || loading} 
                  className="kiosk-submit-btn"
                >
                  {loading ? 'Please wait...' : t.continueBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="interview-main-card">
        <div className="interview-header-info">
          <h2 className="interview-session-id">
            Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
          </h2>
          <ProgressIndicator step={3} total={4} />
        </div>

        <div className="interview-body-content">
          <div className="kiosk-question-header-row">
            <SpeakerButton onClick={() => playSpeech(false, volume)} />
            <h1 className="kiosk-question-text">
              {t.existingPatientQuestion}
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

          <div className="options-buttons-grid" style={{ maxWidth: '540px', margin: '1rem auto' }}>
            <button 
              type="button"
              onClick={() => handleChoice('existing')} 
              className="kiosk-option-card"
              style={{ padding: '1.4rem', fontSize: '1.5rem' }}
            >
              👤 {t.existingPatient}
            </button>
            <button 
              type="button"
              onClick={() => handleChoice('guest')} 
              className="kiosk-option-card selected"
              style={{ padding: '1.4rem', fontSize: '1.5rem' }}
            >
              📝 {t.guest}
            </button>
          </div>

          <div style={{ maxWidth: '540px', margin: '1.25rem auto 0 auto' }}>
            <button 
              type="button" 
              onClick={() => navigate(`/session/${sessionId}/consent`)} 
              className="kiosk-secondary-action-btn"
              style={{ width: '100%' }}
            >
              {t.backBtn || '← Back'}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
