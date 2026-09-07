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

  const lang = sessionData.language || 'EN';
  const t = translations[lang] || {};

  // Question state
  const [questionKey, setQuestionKey] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [buttonOptions, setButtonOptions] = useState([]);
  const [questionAudio, setQuestionAudio] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);

  // UI state
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [answerMode, setAnswerMode] = useState('VOICE'); // VOICE, BUTTON, TYPE

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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioPlayerRef = useRef(new Audio());
  const { speak } = useSpeechSynthesis();
  
  const initialFetchDoneRef = useRef(false);

  const [isCompleting, setIsCompleting] = useState(false);

  const fetchNextQuestion = async (answerData = null) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!answerData) {
        console.log("[Interview] No cached question, requesting first question");
      } else {
        console.log("[Interview] Requesting next question after answer");
      }

      const response = await getNextQuestion(sessionId, answerData);
      
      if (response.question_key === 'last_question') {
        // Complete session
        setQuestionKey('last_question');
        sessionStorage.removeItem(`medikiosk_current_question_${sessionId}`);
        await handleFinishQuestions();
        return;
      }
      
      setQuestionKey(response.question_key);
      setQuestionText(response.question_text);
      setButtonOptions(response.button_options || []);
      setQuestionAudio(response.question_audio || response.audio_url || null);
      
      let nextQuestionNumber = questionNumber;
      if (answerData) {
        // This is a next question
        nextQuestionNumber = questionNumber + 1;
      } else {
        // This is the first question
        nextQuestionNumber = 1;
      }
      
      setQuestionNumber(nextQuestionNumber);
      
      // Cache the current question
      const cacheData = {
        sessionId,
        questionNumber: nextQuestionNumber,
        questionKey: response.question_key,
        questionText: response.question_text,
        buttonOptions: response.button_options || [],
        questionAudio: response.question_audio || response.audio_url || null
      };
      sessionStorage.setItem(`medikiosk_current_question_${sessionId}`, JSON.stringify(cacheData));
      console.log("[Interview] Saved current question");
      
      // Reset answers
      setTextAnswer('');
      setSelectedButton('');
      setAudioBlob(null);
      setAudioUrl('');
      
      // Reset mode intelligently
      if (response.button_options && response.button_options.length > 0) {
        setAnswerMode('BUTTON');
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

  // Initial fetch
  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    
    // Check sessionStorage
    const cacheKey = `medikiosk_current_question_${sessionId}`;
    const cachedDataStr = sessionStorage.getItem(cacheKey);
    
    if (cachedDataStr) {
      try {
        const cachedData = JSON.parse(cachedDataStr);
        if (cachedData.sessionId === sessionId) {
          console.log("[Interview] Restoring current question from sessionStorage");
          setQuestionKey(cachedData.questionKey);
          setQuestionText(cachedData.questionText);
          setButtonOptions(cachedData.buttonOptions || []);
          setQuestionAudio(cachedData.questionAudio || null);
          setQuestionNumber(cachedData.questionNumber || 1);
          
          if (cachedData.buttonOptions && cachedData.buttonOptions.length > 0) {
            setAnswerMode('BUTTON');
          } else {
            setAnswerMode('VOICE');
          }
          
          setLoading(false);
          
          // Recreate qData format for playQuestionAudio
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
      // Cleanup
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

      // Django sends base64 audio
      if (!audioToPlay.startsWith('http') && !audioToPlay.startsWith('data:')) {
        audioSrc = `data:audio/wav;base64,${audioToPlay}`;
      }

      const audio = new Audio(audioSrc);
      audio.volume = volume;
      audioPlayerRef.current = audio;

      audio.play().catch((e) => {
        console.error("Audio play error:", e);
        speak(textToPlay, speechLang); // fallback
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
          console.log("Audio type before conversion:", webmBlob.type);
          console.log("Audio size before conversion:", webmBlob.size);
          const wavBlob = await convertToWav(webmBlob);
          console.log("Audio type after conversion:", wavBlob.type);
          console.log("Audio size after conversion:", wavBlob.size);
          setAudioBlob(wavBlob);
          setAudioUrl(URL.createObjectURL(wavBlob));
        } catch (e) {
          console.error("Audio conversion failed:", e);
          const fallbackBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
          setAudioBlob(fallbackBlob);
          setAudioUrl(URL.createObjectURL(fallbackBlob));
        }
        // Release tracks
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

  // Submit Answer
  const handleSubmit = () => {
    if (loading) return;

    let answerData = {
      question_key: questionKey,
      question_text: questionText,
    };

    if (answerMode === 'VOICE') {

      if (!audioBlob) {
        setErrorMsg('Please record an answer before submitting.');
        return;
      }

      answerData.input_type = 'VOICE';
      answerData.audioBlob = audioBlob;

    } else if (answerMode === 'TYPE') {

      if (!textAnswer.trim()) {
        setErrorMsg('Please type an answer before submitting.');
        return;
      }

      answerData.input_type = 'TEXT';
      answerData.answer_text = textAnswer.trim();

    } else if (answerMode === 'BUTTON') {

      if (!selectedButton) {
        setErrorMsg('Please select an option before submitting.');
        return;
      }

      answerData.input_type = 'TOUCH';
      answerData.answer_text = selectedButton;
    }

    console.log("Submitting answer:", answerData);

    fetchNextQuestion(answerData);
  };

  return (
    <PageContainer>
      <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
        <p style={{ margin: '0' }}>Session ID: {sessionId}</p>
        <p style={{ margin: '5px 0' }}>Session started</p>
      </div>
      
      {loading && !questionKey ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Loading...</h2>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ marginTop: '0', color: '#333' }}>Question {questionNumber}</h3>
          
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
              {questionText}
            </h2>
            
            {/* Audio Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Button onClick={() => playQuestionAudio()} variant="secondary" style={{ padding: '10px 20px' }}>
                Play Audio
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="volume">Volume:</label>
                <input 
                  id="volume"
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                  type="checkbox" 
                  id="mute" 
                  checked={isMuted} 
                  onChange={(e) => {
                    setIsMuted(e.target.checked);
                    if (e.target.checked && audioPlayerRef.current) {
                      audioPlayerRef.current.pause();
                      window.speechSynthesis.cancel();
                    }
                  }} 
                  style={{ transform: 'scale(1.5)' }}
                />
                <label htmlFor="mute">Mute</label>
              </div>
            </div>
          </div>

          {/* Answer Modes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
            <Button 
              onClick={() => setAnswerMode('VOICE')} 
              variant={answerMode === 'VOICE' ? 'primary' : 'outline'}
            >
              VOICE
            </Button>
            <Button 
              onClick={() => setAnswerMode('BUTTON')} 
              variant={answerMode === 'BUTTON' ? 'primary' : 'outline'}
              disabled={buttonOptions.length === 0}
            >
              BUTTON
            </Button>
            <Button 
              onClick={() => setAnswerMode('TYPE')} 
              variant={answerMode === 'TYPE' ? 'primary' : 'outline'}
            >
              TYPE
            </Button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '1.2rem' }}>
              {errorMsg}
              {isCompleting && (
                <div style={{ marginTop: '1rem' }}>
                  <Button onClick={handleFinishQuestions} variant="primary">
                    Retry Finalizing Session
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Answer Inputs */}
          <div style={{ marginBottom: '2rem', minHeight: '150px' }}>
            {answerMode === 'VOICE' && (
              <div>
                {!isRecording && !audioBlob && (
                  <Button onClick={startRecording} variant="primary" size="large" style={{ background: '#d32f2f', color: 'white' }}>
                    Start Recording
                  </Button>
                )}
                {isRecording && (
                  <Button onClick={stopRecording} variant="primary" size="large">
                    Stop Recording
                  </Button>
                )}
                {audioBlob && (
                  <div>
                    <audio src={audioUrl} controls style={{ marginBottom: '1rem' }} />
                    <br />
                    <Button onClick={replaceRecording} variant="secondary">
                      Replace Recording
                    </Button>
                  </div>
                )}
              </div>
            )}

            {answerMode === 'BUTTON' && (
              <div>
                {buttonOptions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {buttonOptions.map((opt, i) => (
                      <Button 
                        key={i} 
                        onClick={() => setSelectedButton(opt)}
                        variant={selectedButton === opt ? 'primary' : 'outline'}
                        size="large"
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p>Please use Voice or Type to answer this question.</p>
                )}
              </div>
            )}

            {answerMode === 'TYPE' && (
              <textarea 
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                style={{
                  width: '100%',
                  height: '150px',
                  fontSize: '1.5rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc'
                }}
              />
            )}
          </div>

          <Button onClick={handleSubmit} variant="primary" size="large" disabled={loading || isRecording} style={{ width: '100%' }}>
            {loading ? 'Please wait...' : 'Submit / Continue'}
          </Button>

        </div>
      )}
    </PageContainer>
  );
};
