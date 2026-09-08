import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { getNextQuestion, finishQuestions } from '../services/djangoApi';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const encodeWAV = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16-bit
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  
  // write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  
  return new Blob([view], { type: 'audio/wav' });
};

const convertToWav = async (blob) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const offlineContext = new OfflineAudioContext(1, audioBuffer.duration * audioBuffer.sampleRate, audioBuffer.sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();
  const renderedBuffer = await offlineContext.startRendering();
  return encodeWAV(renderedBuffer.getChannelData(0), renderedBuffer.sampleRate);
};

export const InterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData } = useSession();

  const lang = sessionData?.language || 'EN';
  const t = translations[lang] || translations['EN'];

  // Question state
  const [questionKey, setQuestionKey] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [buttonOptions, setButtonOptions] = useState([]);
  const [questionAudio, setQuestionAudio] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);

  // Preferred input mode: VOICE (default), BUTTON, TYPE
  const [preferredInputMode, setPreferredInputMode] = useState(() => {
    return sessionStorage.getItem('medikiosk_preferred_input_mode') || 'VOICE';
  });

  // Active answer mode for current UI: VOICE, BUTTON, TYPE
  const [answerMode, setAnswerMode] = useState('VOICE');

  // UI state
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);

  // Handle Browser Back button interception in AI Phase
  useEffect(() => {
    window.history.pushState({ isAiInterview: true }, '');

    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState({ isAiInterview: true }, '');
      setShowBackModal(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleCancelBack = () => {
    setShowBackModal(false);
  };

  const handleConfirmNewTest = async () => {
    setShowBackModal(false);

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    window.speechSynthesis.cancel();

    // Clear temporary AI interview session state
    sessionStorage.removeItem(`medikiosk_current_question_${sessionId}`);
    sessionStorage.removeItem('medikiosk_preferred_input_mode');

    // Reset preferred input mode to VOICE
    setPreferredInputMode('VOICE');
    setAnswerMode('VOICE');

    // Clear current question and answer states
    setQuestionKey('');
    setQuestionText('');
    setButtonOptions([]);
    setQuestionAudio(null);
    setQuestionNumber(1);
    setTextAnswer('');
    setSelectedButton('');
    setAudioBlob(null);
    setAudioUrl('');
    setErrorMsg('');

    // Navigate to treatment selection page so user can choose treatment type and continue fresh
    navigate(`/session/${sessionId}/treatment`, { replace: true });
  };

  // Answer states
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedButton, setSelectedButton] = useState('');
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Audio Playback state
  const [volume, setVolume] = useState(() => {
    const savedVol = sessionStorage.getItem('medikiosk_audio_volume');
    return savedVol !== null ? parseFloat(savedVol) : 1;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = sessionStorage.getItem('medikiosk_audio_muted');
    return savedMute === 'true';
  });

  const audioPlayerRef = useRef(new Audio());
  const { speak } = useSpeechSynthesis();

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    sessionStorage.setItem('medikiosk_audio_volume', newVol.toString());
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = newVol;
    }
  };

  const handleMuteChange = (muted) => {
    setIsMuted(muted);
    sessionStorage.setItem('medikiosk_audio_muted', muted ? 'true' : 'false');
    if (muted) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      window.speechSynthesis.cancel();
    } else {
      playQuestionAudio();
    }
  };
  
  const initialFetchDoneRef = useRef(false);

  // Helper to persist preferred input mode during current session
  const updatePreferredMode = (mode) => {
    setPreferredInputMode(mode);
    sessionStorage.setItem('medikiosk_preferred_input_mode', mode);
  };

  const handleSelectMode = (mode) => {
    if (mode === 'BUTTON' && buttonOptions.length === 0) {
      return;
    }
    updatePreferredMode(mode);
    setAnswerMode(mode);
  };

  const fetchNextQuestion = async (answerData = null) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!answerData) {
        console.log("[Interview] Requesting initial question");
      } else {
        console.log("[Interview] Requesting next question after answer");
      }

      const response = await getNextQuestion(sessionId, answerData);
      
      if (response.question_key === 'last_question') {
        setQuestionKey('last_question');
        sessionStorage.removeItem(`medikiosk_current_question_${sessionId}`);
        await handleFinishQuestions();
        return;
      }
      
      const newBtnOpts = response.button_options || [];
      setQuestionKey(response.question_key);
      setQuestionText(response.question_text);
      setButtonOptions(newBtnOpts);
      setQuestionAudio(response.question_audio || response.audio_url || null);
      
      let nextQuestionNumber = answerData ? questionNumber + 1 : 1;
      setQuestionNumber(nextQuestionNumber);
      
      // Cache the current question
      const cacheData = {
        sessionId,
        questionNumber: nextQuestionNumber,
        questionKey: response.question_key,
        questionText: response.question_text,
        buttonOptions: newBtnOpts,
        questionAudio: response.question_audio || response.audio_url || null
      };
      sessionStorage.setItem(`medikiosk_current_question_${sessionId}`, JSON.stringify(cacheData));
      
      // Reset input fields
      setTextAnswer('');
      setSelectedButton('');
      setAudioBlob(null);
      setAudioUrl('');
      
      // Intelligently select active mode using stored preferredInputMode
      const storedPref = sessionStorage.getItem('medikiosk_preferred_input_mode') || 'VOICE';
      if (storedPref === 'BUTTON') {
        if (newBtnOpts.length > 0) {
          setAnswerMode('BUTTON');
        } else {
          setAnswerMode('VOICE');
        }
      } else if (storedPref === 'TYPE') {
        setAnswerMode('TYPE');
      } else {
        setAnswerMode('VOICE');
      }

      playQuestionAudio(response);
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error fetching next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishQuestions = async () => {
    setLoading(true);
    setIsCompleting(true);
    setErrorMsg('');
    try {
      const res = await finishQuestions(sessionId);
      sessionStorage.removeItem(`medikiosk_current_question_${sessionId}`);
      
      if (res && res.red_flag_detected === true) {
        navigate(`/session/${sessionId}/red-flag`, { replace: true });
      } else {
        navigate(`/session/${sessionId}/thank-you`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error finishing session. Please try again.');
      setLoading(false);
    }
  };

  // Initial fetch / restore from sessionStorage
  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    
    const cacheKey = `medikiosk_current_question_${sessionId}`;
    const cachedDataStr = sessionStorage.getItem(cacheKey);
    
    if (cachedDataStr) {
      try {
        const cachedData = JSON.parse(cachedDataStr);
        if (cachedData.sessionId === sessionId) {
          console.log("[Interview] Restoring current question from sessionStorage");
          setQuestionKey(cachedData.questionKey);
          setQuestionText(cachedData.questionText);
          const cachedOpts = cachedData.buttonOptions || [];
          setButtonOptions(cachedOpts);
          setQuestionAudio(cachedData.questionAudio || null);
          setQuestionNumber(cachedData.questionNumber || 1);
          
          const storedPref = sessionStorage.getItem('medikiosk_preferred_input_mode') || 'VOICE';
          if (storedPref === 'BUTTON' && cachedOpts.length > 0) {
            setAnswerMode('BUTTON');
          } else if (storedPref === 'TYPE') {
            setAnswerMode('TYPE');
          } else {
            setAnswerMode('VOICE');
          }
          
          setLoading(false);
          
          const qData = {
            question_text: cachedData.questionText,
            question_audio: cachedData.questionAudio || null
          };
          playQuestionAudio(qData);
          return;
        }
      } catch (err) {
        console.error("Failed to parse cached question data", err);
      }
    }

    fetchNextQuestion();
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Audio playback
  const playQuestionAudio = (qData = null) => {
    if (isMuted) return;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    window.speechSynthesis.cancel();

    const textToPlay = qData ? qData.question_text : questionText;
    const audioToPlay = qData
      ? (qData.question_audio || qData.audio_url)
      : questionAudio;

    const isHindi = /[\u0900-\u097F]/.test(textToPlay);
    const speechLang = isHindi ? 'HI' : lang;

    if (audioToPlay) {
      let audioSrc = audioToPlay;

      if (!audioToPlay.startsWith('http') && !audioToPlay.startsWith('data:')) {
        audioSrc = `data:audio/wav;base64,${audioToPlay}`;
      }

      const audio = new Audio(audioSrc);
      audio.volume = volume;
      audioPlayerRef.current = audio;

      audio.play().catch((e) => {
        console.error("Audio play error:", e);
        speak(textToPlay, speechLang);
      });

    } else if (textToPlay) {
      speak(textToPlay, speechLang);
    }
  };

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = volume;
      audioPlayerRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          const webmBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
          const wavBlob = await convertToWav(webmBlob);
          setAudioBlob(wavBlob);
          setAudioUrl(URL.createObjectURL(wavBlob));
        } catch (e) {
          console.error("Audio conversion failed:", e);
          const fallbackBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
          setAudioBlob(fallbackBlob);
          setAudioUrl(URL.createObjectURL(fallbackBlob));
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setErrorMsg('');
    } catch (err) {
      console.error('Mic access denied', err);
      setErrorMsg('Microphone access denied or not supported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const replaceRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    startRecording();
  };

  // Option Click in BUTTON mode
  const handleOptionClick = (opt) => {
    if (loading || isRecording) return;
    setSelectedButton(opt);
    updatePreferredMode('BUTTON');

    const answerData = {
      question_key: questionKey,
      question_text: questionText,
      input_type: 'TOUCH',
      answer_text: opt
    };

    fetchNextQuestion(answerData);
  };

  // Submit Answer
  const handleSubmit = () => {
    if (loading || isRecording) return;

    let answerData = {
      question_key: questionKey,
      question_text: questionText,
    };

    if (answerMode === 'VOICE') {
      if (!audioBlob) {
        setErrorMsg('Please record your answer before submitting.');
        return;
      }
      answerData.input_type = 'VOICE';
      answerData.audioBlob = audioBlob;
      updatePreferredMode('VOICE');

    } else if (answerMode === 'TYPE') {
      if (!textAnswer.trim()) {
        setErrorMsg('Please type your answer before submitting.');
        return;
      }
      answerData.input_type = 'TEXT';
      answerData.answer_text = textAnswer.trim();
      updatePreferredMode('TYPE');

    } else if (answerMode === 'BUTTON') {
      if (!selectedButton) {
        setErrorMsg('Please select an option before submitting.');
        return;
      }
      answerData.input_type = 'TOUCH';
      answerData.answer_text = selectedButton;
      updatePreferredMode('BUTTON');
    }

    fetchNextQuestion(answerData);
  };

  return (
    <PageContainer>
      <div className="interview-main-card">
        {/* Top Session Information */}
        <div className="interview-header-info">
          <h2 className="interview-session-id">
            Session ID: <span className="session-id-val">{sessionId ? sessionId.toUpperCase() : ''}</span>
          </h2>
          <p className="interview-session-status">Session started</p>
          <div className="interview-progress-pill-line"></div>
          
          <div className="question-badge-container">
            <span className="kiosk-question-badge">
              Question {questionNumber}
            </span>
          </div>
        </div>

        {loading && !questionKey ? (
          <div className="interview-loading-state">
            <div className="kiosk-spinner"></div>
            <h3>Loading interview...</h3>
          </div>
        ) : (
          <div className="interview-body-content">
            {/* Blue Question Container with Play Audio & Question Text Inside */}
            <div className="kiosk-question-blue-box">
              <button 
                type="button" 
                onClick={() => playQuestionAudio()} 
                className="play-audio-btn"
              >
                <span className="audio-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <span className="play-audio-text">{t.playAudio || 'Play Audio'}</span>
              </button>

              <h1 className="kiosk-question-text">
                {questionText}
              </h1>
            </div>

            {/* Inline Volume & Mute Controls Below Blue Question Box */}
            <div className="audio-controls-row">
              <div className="volume-group">
                <label htmlFor="volume-slider">{t.volumeLabel || 'Volume:'}</label>
                <input 
                  id="volume-slider"
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={volume} 
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="kiosk-slider"
                />
              </div>
              <div className="mute-group">
                <input 
                  type="checkbox" 
                  id="mute-toggle" 
                  checked={isMuted} 
                  onChange={(e) => handleMuteChange(e.target.checked)} 
                  className="kiosk-checkbox"
                />
                <label htmlFor="mute-toggle">{t.muteLabel || 'Mute'}</label>
              </div>
            </div>

            {/* Answer Mode Switcher Tabs */}
            <div className="mode-tabs-grid">
              <button 
                type="button"
                onClick={() => handleSelectMode('VOICE')} 
                className={`mode-tab-btn ${answerMode === 'VOICE' ? 'active' : ''}`}
              >
                <span className="tab-icon">🔊</span>
                <span>{t.voiceTab || 'VOICE'}</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSelectMode('BUTTON')} 
                className={`mode-tab-btn ${answerMode === 'BUTTON' ? 'active' : ''} ${buttonOptions.length === 0 ? 'disabled' : ''}`}
                disabled={buttonOptions.length === 0}
                title={buttonOptions.length === 0 ? "No button options available for this question" : ""}
              >
                <span className="tab-icon">☝️</span>
                <span>{t.buttonTab || 'BUTTON'}</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSelectMode('TYPE')} 
                className={`mode-tab-btn ${answerMode === 'TYPE' ? 'active' : ''}`}
              >
                <span className="tab-icon">⌨️</span>
                <span>{t.typeTab || 'TYPE'}</span>
              </button>
            </div>

            {/* Error Display */}
            {errorMsg && (
              <div className="interview-error-msg">
                <p>{errorMsg}</p>
                {isCompleting && (
                  <Button onClick={handleFinishQuestions} variant="primary" style={{ marginTop: '0.5rem' }}>
                    Retry Finalizing Session
                  </Button>
                )}
              </div>
            )}

            {/* Input Action Area */}
            <div className="mode-input-area">
              {answerMode === 'VOICE' && (
                <div className="voice-action-wrapper">
                  {!isRecording && !audioBlob && (
                    <button 
                      type="button"
                      onClick={startRecording} 
                      className="kiosk-primary-action-btn voice-idle-btn"
                    >
                      <span className="btn-icon">🎤</span>
                      <span>{t.tapToSpeak || 'Tap to Speak'}</span>
                    </button>
                  )}

                  {isRecording && (
                    <button 
                      type="button"
                      onClick={stopRecording} 
                      className="kiosk-primary-action-btn voice-recording-btn"
                    >
                      <span className="recording-pulse"></span>
                      <span className="btn-icon">🎤</span>
                      <span>{t.listening || 'Listening... (Tap to Stop)'}</span>
                    </button>
                  )}

                  {audioBlob && (
                    <div className="recorded-preview-container">
                      <audio src={audioUrl} controls className="preview-audio-player" />
                      <button 
                        type="button"
                        onClick={replaceRecording} 
                        className="kiosk-secondary-action-btn"
                      >
                        🎤 {t.recordAgain || 'Record Again'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {answerMode === 'BUTTON' && (
                <div className="button-options-wrapper">
                  {buttonOptions.length > 0 ? (
                    <div className="options-buttons-grid">
                      {buttonOptions.map((opt, i) => (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => handleOptionClick(opt)}
                          className={`kiosk-option-card ${selectedButton === opt ? 'selected' : ''}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="no-button-options-msg">Please use Voice or Type to answer this question.</p>
                  )}
                </div>
              )}

              {answerMode === 'TYPE' && (
                <div className="type-input-wrapper">
                  <textarea 
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder={t.typePlaceholder || "Type your answer here..."}
                    className="kiosk-large-textarea"
                  />
                </div>
              )}
            </div>

            {/* Submit / Continue Button */}
            <div className="submit-area">
              <button 
                type="button"
                onClick={handleSubmit} 
                disabled={loading || isRecording}
                className="kiosk-submit-btn"
              >
                {loading ? 'Please wait...' : (t.submitContinue || 'Submit / Continue →')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Browser Back Confirmation Modal for AI Phase */}
      {showBackModal && (
        <div className="kiosk-modal-overlay">
          <div className="kiosk-modal-card">
            <div className="kiosk-modal-icon">⚠️</div>
            <h2 className="kiosk-modal-title">{t.backWarningTitle || 'Start New Test?'}</h2>
            <p className="kiosk-modal-message">
              {t.backWarningMessage || 'Going back will start a new test and your current interview progress will be cleared. Do you want to continue?'}
            </p>
            <div className="kiosk-modal-actions">
              <button 
                type="button" 
                onClick={handleCancelBack}
                className="kiosk-secondary-action-btn"
              >
                {t.cancelBtn || 'Cancel'}
              </button>
              <button 
                type="button" 
                onClick={handleConfirmNewTest}
                className="kiosk-submit-btn danger-btn"
              >
                {t.okBtn || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
