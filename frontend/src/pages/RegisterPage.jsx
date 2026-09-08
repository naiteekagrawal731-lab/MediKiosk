import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AudioControlBar } from '../components/AudioControlBar';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';
import { registerGuestPatient, loginPatient, createSession } from '../services/springApi';
import { createDjangoSession } from '../services/djangoApi';

export const RegisterPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { loginUser } = useAuth();
  const { speak, cancel } = useSpeechSynthesis();
  
  // 'choice' | 'guest' | 'login'
  const [view, setView] = useState('choice');
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

  // Guest Registration Form Data
  const [guestForm, setGuestForm] = useState({
    username: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    phoneNumber: '',
  });

  // Existing Patient Login Form Data
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const lang = sessionData.language || 'EN';
  const t = translations[lang] || translations['EN'];

  const playSpeech = (customMuted = isMuted, customVol = volume) => {
    if (customMuted) {
      cancel();
      return;
    }
    if (view === 'choice') {
      speak(t.existingPatientQuestion || 'Please select your patient registration option.', lang, { volume: customVol, isMuted: customMuted });
    } else if (view === 'guest') {
      speak(t.guest || 'Please enter your guest registration details.', lang, { volume: customVol, isMuted: customMuted });
    } else if (view === 'login') {
      speak('Please enter your username and password to log in.', lang, { volume: customVol, isMuted: customMuted });
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

  // 1. SUBMIT GUEST REGISTRATION
  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestForm.username.trim()) {
      setErrorMsg('Name / Username is required.');
      return;
    }
    if (!guestForm.gender) {
      setErrorMsg('Please select your gender.');
      return;
    }
    if (!guestForm.dateOfBirth) {
      setErrorMsg('Date of birth is required.');
      return;
    }
    if (!guestForm.phoneNumber.trim()) {
      setErrorMsg('Phone number is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerGuestPatient(guestForm);
      const newSessionId = result.sessionId || result.session_id;
      if (!newSessionId) {
        throw new Error('Session ID not returned by the server. Please try again.');
      }

      await createDjangoSession(newSessionId);

      updateSession({
        patientRegistration: { type: 'guest', ...guestForm },
        sessionId: newSessionId,
      });
      navigate(`/session/${newSessionId}/treatment`);
    } catch (err) {
      console.error('Guest registration error:', err);
      setErrorMsg(err.message || 'Guest registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SUBMIT EXISTING PATIENT LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginForm.username.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    if (!loginForm.password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginPatient(loginForm);
      loginUser({
        role: 'PATIENT',
        username: loginForm.username.trim(),
        accessToken: res.accessToken,
        profile: res.profile,
      });

      const { session_id: newSessionId } = await createSession();

      await createDjangoSession(newSessionId);

      updateSession({
        patientRegistration: { type: 'patient', username: loginForm.username.trim() },
        sessionId: newSessionId,
      });
      navigate(`/session/${newSessionId}/treatment`);
    } catch (err) {
      console.error('Patient login error:', err);
      setErrorMsg(err.message || 'Login failed. Please check username and password.');
    } finally {
      setLoading(false);
    }
  };

  // VIEW 1: GUEST FORM
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
              <h1 className="kiosk-question-text" style={{ fontSize: '1.8rem' }}>
                {t.guest || 'Guest Registration'}
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
                <div className="kiosk-field-group col-span-2">
                  <label className="kiosk-field-label">Full Name / Username *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name"
                    value={guestForm.username}
                    onChange={(e) => setGuestForm({ ...guestForm, username: e.target.value })}
                    className="kiosk-form-input" 
                  />
                </div>

                <div className="kiosk-field-group col-span-2">
                  <label className="kiosk-field-label">Gender *</label>
                  <div className="gender-selector-grid">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button 
                        key={g}
                        type="button"
                        onClick={() => setGuestForm({ ...guestForm, gender: g })}
                        className={`gender-btn ${guestForm.gender === g ? 'active' : ''}`}
                      >
                        <span>{g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'}</span>
                        <span>{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="kiosk-field-group">
                  <label className="kiosk-field-label">Date of Birth *</label>
                  <input 
                    type="date" 
                    required
                    value={guestForm.dateOfBirth}
                    onChange={(e) => setGuestForm({ ...guestForm, dateOfBirth: e.target.value })}
                    className="kiosk-form-input" 
                  />
                </div>

                <div className="kiosk-field-group">
                  <label className="kiosk-field-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="10-digit mobile number"
                    value={guestForm.phoneNumber}
                    onChange={(e) => setGuestForm({ ...guestForm, phoneNumber: e.target.value })}
                    className="kiosk-form-input" 
                  />
                </div>

                <div className="kiosk-field-group col-span-2">
                  <label className="kiosk-field-label">Blood Group (Optional)</label>
                  <select 
                    value={guestForm.bloodGroup}
                    onChange={(e) => setGuestForm({ ...guestForm, bloodGroup: e.target.value })}
                    className="kiosk-form-select"
                  >
                    <option value="">Select Blood Group...</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div className="interview-error-msg" style={{ marginTop: '1rem' }}>
                  ⚠️ {errorMsg}
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
                  disabled={loading} 
                  className="kiosk-submit-btn"
                >
                  {loading ? 'Submitting...' : t.continueBtn || 'Continue →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    );
  }

  // VIEW 2: LOGIN FORM
  if (view === 'login') {
    return (
      <PageContainer>
        <div className="interview-main-card">
          <div className="interview-header-info">
            <h2 className="interview-session-id">
              Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
            </h2>
            <ProgressIndicator step={3} total={4} />
          </div>

          <div className="interview-body-content" style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
            <div className="kiosk-question-header-row">
              <SpeakerButton onClick={() => playSpeech()} />
              <h1 className="kiosk-question-text" style={{ fontSize: '1.8rem' }}>
                Patient Account Login
              </h1>
            </div>

            {errorMsg && (
              <div className="interview-error-msg" style={{ marginTop: '1rem', width: '100%' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="kiosk-registration-form" style={{ marginTop: '1.5rem', width: '100%' }}>
              <div className="kiosk-field-group" style={{ marginBottom: '1.25rem' }}>
                <label className="kiosk-field-label">Username *</label>
                <input 
                  type="text"
                  required
                  placeholder="Enter patient username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="kiosk-form-input"
                />
              </div>

              <div className="kiosk-field-group" style={{ marginBottom: '1.5rem' }}>
                <label className="kiosk-field-label">Password *</label>
                <input 
                  type="password"
                  required
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="kiosk-form-input"
                />
              </div>

              <div className="kiosk-button-row-duo" style={{ marginTop: '1.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setView('choice')} 
                  className="kiosk-secondary-action-btn"
                >
                  {t.backBtn || '← Back'}
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="kiosk-submit-btn"
                >
                  {loading ? 'Logging in...' : 'Login & Continue →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    );
  }

  // CHOICE VIEW (DEFAULT)
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
              {t.existingPatientQuestion || 'How would you like to proceed?'}
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

          <div className="options-buttons-grid" style={{ maxWidth: '560px', margin: '1.25rem auto' }}>
            <button 
              type="button"
              onClick={() => handleChoice('login')} 
              className="kiosk-option-card"
              style={{ padding: '1.25rem', fontSize: '1.35rem' }}
            >
              👤 Existing Patient Login
            </button>

            <button 
              type="button"
              onClick={() => handleChoice('guest')} 
              className="kiosk-option-card selected"
              style={{ padding: '1.25rem', fontSize: '1.35rem' }}
            >
              📝 Continue as Guest
            </button>
          </div>

          <div style={{ maxWidth: '560px', margin: '1.25rem auto 0 auto' }}>
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
