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
    setErrorMsg('');

    // Clear residual state from other modes so previous button/text/voice selections don't interfere
    if (mode !== 'BUTTON') {
      setSelectedButton('');
    }
    if (mode !== 'TYPE') {
      setTextAnswer('');
    }
    if (mode !== 'VOICE' && !isRecording) {
      setAudioBlob(null);
      setAudioUrl('');
    }
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

  // Option Click in BUTTON mode (selects option without auto-submitting)
  const handleOptionClick = (opt) => {
    if (loading || isRecording) return;
    setSelectedButton(opt);
    setErrorMsg('');
    updatePreferredMode('BUTTON');
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
        setErrorMsg(t.recordBeforeSubmit || 'Please record your answer before submitting.');
        return;
      }
      answerData.input_type = 'VOICE';
      answerData.audioBlob = audioBlob;
      updatePreferredMode('VOICE');

    } else if (answerMode === 'TYPE') {
      if (!textAnswer.trim()) {
        setErrorMsg(t.typeBeforeSubmit || 'Please type your answer before submitting.');
        return;
      }
      answerData.input_type = 'TEXT';
      answerData.answer_text = textAnswer.trim();
      updatePreferredMode('TYPE');

    } else if (answerMode === 'BUTTON') {
      if (!selectedButton) {
        setErrorMsg(t.selectOptionBeforeSubmit || 'Please select an option before submitting.');
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
      {/* ─── INTERVIEW PANEL ─── */}
      <div className="iv-panel">

        {/* ── HEADER BANNER ── */}
        <div className="iv-header-banner">
          <div className="iv-header-left">
            <div className="iv-brand-logo" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#0369a1"/>
                <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="iv-brand-name">MediKiosk</div>
              <div className="iv-brand-sub">AI Clinical History Interview</div>
            </div>
          </div>
          <div className="iv-header-right">
            <div className="iv-session-block">
              <div className="iv-session-label">Session ID</div>
              <div className="iv-session-id">{sessionId ? sessionId.toUpperCase() : '—'}</div>
            </div>
            <div className="iv-status-pill">
              <span className="iv-status-dot" aria-hidden="true"></span>
              <span>{t.sessionInProgress || 'Session in progress'}</span>
            </div>
          </div>
        </div>

        <div className="iv-divider" aria-hidden="true"></div>

        {/* ── LOADING STATE ── */}
        {loading && !questionKey ? (
          <div className="iv-loading-state" role="status" aria-live="polite">
            <div className="iv-spinner" aria-hidden="true"></div>
            <p className="iv-loading-text">{t.loadingQuestion || 'Loading your interview question…'}</p>
            <p className="iv-loading-sub">{t.pleaseWaitMoment || 'Please wait a moment'}</p>
          </div>
        ) : (
          <div className="iv-body">

            {/* ── QUESTION SECTION ── */}
            <div className="iv-question-section">
              <div className="iv-question-number-badge" aria-label={`Question number ${String(questionNumber).padStart(2, '0')}`}>
                QUESTION {String(questionNumber).padStart(2, '0')}
              </div>

              <h1 className="iv-question-text">
                {questionText}
              </h1>

              {/* Play Audio Button */}
              <button
                type="button"
                onClick={() => playQuestionAudio()}
                className="iv-play-audio-btn"
                aria-label="Play question audio"
              >
                <span className="iv-play-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <span>{t.playAudio || 'Play question audio'}</span>
              </button>

              {/* Volume & Mute controls */}
              <div className="iv-audio-controls" role="group" aria-label="Audio controls">
                <span className="iv-vol-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <label htmlFor="iv-volume-slider" className="iv-sr-label">{t.volumeLabel || 'Volume'}</label>
                <input
                  id="iv-volume-slider"
                  type="range"
                  min="0" max="1" step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="iv-volume-slider"
                  aria-label="Volume"
                />
                <label htmlFor="iv-mute-toggle" className="iv-mute-label">
                  <input
                    type="checkbox"
                    id="iv-mute-toggle"
                    checked={isMuted}
                    onChange={(e) => handleMuteChange(e.target.checked)}
                    className="iv-mute-checkbox"
                    aria-label="Mute audio"
                  />
                  <span>{t.muteLabel || 'Mute'}</span>
                </label>
              </div>
            </div>

            <div className="iv-divider" aria-hidden="true"></div>

            {/* ── ANSWER MODE SELECTOR ── */}
            <div className="iv-mode-section">
              <p className="iv-mode-heading">{t.modeHeading || 'HOW WOULD YOU LIKE TO ANSWER?'}</p>
              <p className="iv-mode-hint">{t.modeHint || 'Choose the way you are most comfortable answering.'}</p>

              <div className="iv-mode-tabs" role="group" aria-label="Answer mode">
                <button
                  type="button"
                  id="mode-voice"
                  onClick={() => handleSelectMode('VOICE')}
                  className={`iv-mode-tab ${answerMode === 'VOICE' ? 'iv-mode-tab--active' : ''}`}
                  aria-pressed={answerMode === 'VOICE'}
                >
                  <span className="iv-mode-tab-icon" aria-hidden="true">🎙</span>
                  <span>{t.voiceTab || 'Voice'}</span>
                </button>

                <button
                  type="button"
                  id="mode-button"
                  onClick={() => handleSelectMode('BUTTON')}
                  className={`iv-mode-tab ${answerMode === 'BUTTON' ? 'iv-mode-tab--active' : ''} ${buttonOptions.length === 0 ? 'iv-mode-tab--disabled' : ''}`}
                  disabled={buttonOptions.length === 0}
                  aria-pressed={answerMode === 'BUTTON'}
                  title={buttonOptions.length === 0 ? (t.noButtonOptionsHint || 'No button options available for this question') : ''}
                >
                  <span className="iv-mode-tab-icon" aria-hidden="true">👆</span>
                  <span>{t.buttonTab || 'Choose'}</span>
                </button>

                <button
                  type="button"
                  id="mode-type"
                  onClick={() => handleSelectMode('TYPE')}
                  className={`iv-mode-tab ${answerMode === 'TYPE' ? 'iv-mode-tab--active' : ''}`}
                  aria-pressed={answerMode === 'TYPE'}
                >
                  <span className="iv-mode-tab-icon" aria-hidden="true">⌨</span>
                  <span>{t.typeTab || 'Type'}</span>
                </button>
              </div>
            </div>

            <div className="iv-divider" aria-hidden="true"></div>

            {/* ── ERROR MESSAGE ── */}
            {errorMsg && (
              <div className="iv-error-banner" role="alert" aria-live="assertive">
                <span className="iv-error-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <span>{errorMsg}</span>
                {isCompleting && (
                  <Button onClick={handleFinishQuestions} variant="primary" style={{ marginTop: '0.5rem' }}>
                    Retry Finalizing Session
                  </Button>
                )}
              </div>
            )}

            {/* ── ANSWER INPUT AREA ── */}
            <div className="iv-answer-section">
              <p className="iv-answer-heading">{t.yourAnswerLabel || 'YOUR ANSWER'}</p>

              {/* ── VOICE MODE ── */}
              {answerMode === 'VOICE' && (
                <div className="iv-voice-wrapper">
                  {!isRecording && !audioBlob && (
                    <button
                      type="button"
                      id="start-recording-btn"
                      onClick={startRecording}
                      className="iv-voice-idle-btn"
                      aria-label="Start recording your voice answer"
                    >
                      <span className="iv-mic-icon" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </span>
                      <span className="iv-voice-btn-label">{t.tapToSpeak || 'Tap to Speak'}</span>
                      <span className="iv-voice-btn-hint">Tap the button to begin recording</span>
                    </button>
                  )}

                  {isRecording && (
                    <button
                      type="button"
                      id="stop-recording-btn"
                      onClick={stopRecording}
                      className="iv-voice-recording-btn"
                      aria-label="Stop recording"
                    >
                      <span className="iv-recording-rings" aria-hidden="true">
                        <span className="iv-recording-ring iv-ring-1"></span>
                        <span className="iv-recording-ring iv-ring-2"></span>
                        <span className="iv-recording-dot"></span>
                      </span>
                      <span className="iv-voice-btn-label">{t.listening || 'Listening…'}</span>
                      <span className="iv-voice-btn-hint">Tap to stop recording</span>
                    </button>
                  )}

                  {audioBlob && (
                    <div className="iv-recorded-preview">
                      <div className="iv-recorded-ready">
                        <span className="iv-check-icon" aria-hidden="true">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                        <span>{t.recordingReady || 'Recording ready'}</span>
                      </div>
                      <audio src={audioUrl} controls className="iv-audio-preview" aria-label="Preview your recording" />
                      <button
                        type="button"
                        id="record-again-btn"
                        onClick={replaceRecording}
                        className="iv-record-again-btn"
                      >
                        <span aria-hidden="true">🎙</span>
                        <span>{t.recordAgain || 'Record Again'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── BUTTON / CHOOSE MODE ── */}
              {answerMode === 'BUTTON' && (
                <div className="iv-button-options-wrapper">
                  {buttonOptions.length > 0 ? (
                    <>
                      <p className="iv-options-label">{t.selectOptionLabel || 'SELECT AN OPTION'}</p>
                      <div className="iv-options-grid">
                        {buttonOptions.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleOptionClick(opt)}
                            className={`iv-option-btn ${selectedButton === opt ? 'iv-option-btn--selected' : ''}`}
                            aria-pressed={selectedButton === opt}
                          >
                            {selectedButton === opt && (
                              <span className="iv-option-check" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                            )}
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="iv-no-options-msg">{t.useVoiceOrTypeMsg || 'Please use Voice or Type to answer this question.'}</p>
                  )}
                </div>
              )}

              {/* ── TYPE MODE ── */}
              {answerMode === 'TYPE' && (
                <div className="iv-type-wrapper">
                  <textarea
                    id="type-answer-input"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder={t.typePlaceholder || 'Type your answer here…'}
                    className="iv-textarea"
                    aria-label="Type your answer"
                  />
                </div>
              )}
            </div>

            <div className="iv-divider" aria-hidden="true"></div>

            {/* ── SUBMIT BUTTON ── */}
            <div className="iv-submit-section">
              <button
                type="button"
                id="submit-continue-btn"
                onClick={handleSubmit}
                disabled={loading || isRecording}
                className="iv-submit-btn"
                aria-label={loading ? 'Please wait, processing' : 'Submit answer and continue to next question'}
              >
                {loading ? (
                  <>
                    <span className="iv-btn-spinner" aria-hidden="true"></span>
                    <span>{t.pleaseWait || 'Processing…'}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submitContinue || 'Submit & Continue'}</span>
                    <span className="iv-arrow-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* ── FOOTER NOTE ── */}
            <div className="iv-footer-note" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>{t.secureNotice || 'Your answers are securely processed for your clinical history.'}</span>
            </div>

          </div>
        )}
      </div>

      {/* ── BROWSER BACK WARNING MODAL ── */}
      {showBackModal && (
        <div className="kiosk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="back-modal-title">
          <div className="kiosk-modal-card">
            <div className="kiosk-modal-icon">⚠️</div>
            <h2 id="back-modal-title" className="kiosk-modal-title">{t.backWarningTitle || 'Start New Test?'}</h2>
            <p className="kiosk-modal-message">
              {t.backWarningMessage || 'Going back will start a new test and your current interview progress will be cleared. Do you want to continue?'}
            </p>
            <div className="kiosk-modal-actions">
              <button
                type="button"
                id="modal-cancel-btn"
                onClick={handleCancelBack}
                className="kiosk-secondary-action-btn"
              >
                {t.cancelBtn || 'Cancel'}
              </button>
              <button
                type="button"
                id="modal-confirm-btn"
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
