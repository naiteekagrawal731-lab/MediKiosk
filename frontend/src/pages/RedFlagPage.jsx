import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { SpeakerButton } from '../components/SpeakerButton';
import { useSession } from '../context/SessionContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { translations } from '../utils/translations';
import { AlertTriangle, BellRing } from 'lucide-react';

export const RedFlagPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, clearSession } = useSession();
  const { speak } = useSpeechSynthesis();

  const lang = sessionData.language || 'EN';
  const t = translations[lang] || translations['EN'];

  const [timeLeft, setTimeLeft] = useState(60);
  const audioContextRef = useRef(null);

  // Play horn sound via Web Audio API
  const playHornSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Dual-tone frequency for clear staff horn alert
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.warn('Horn audio autoplay prevented or unsupported:', err);
    }
  }, []);

  const handleEndSession = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearSession();
    navigate('/');
  };

  const handleSpeakMessage = () => {
    const speechText = `${t.redFlagMsg} ${t.sessionIdInstruction}`;
    speak(speechText, lang);
  };

  // Play horn sound & speak patient message on mount
  useEffect(() => {
    playHornSound();
    handleSpeakMessage();
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
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
      <div style={{ textAlign: 'center', marginTop: '1rem', width: '100%', maxWidth: '750px' }}>
        
        {/* Top Controls: Replay voice & Replay alert sound */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <SpeakerButton onClick={handleSpeakMessage} />
          <button 
            onClick={playHornSound}
            style={{
              background: '#fef2f2',
              border: '2px solid #ef4444',
              borderRadius: '50px',
              padding: '0.6rem 1.2rem',
              color: '#dc2626',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <BellRing size={20} />
            {t.playAlert}
          </button>
        </div>

        {/* Priority Warning Header */}
        <div style={{
          background: '#fef2f2',
          border: '2px solid #fca5a5',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={36} color="#dc2626" />
            <h1 style={{ fontSize: '2.5rem', color: '#dc2626', margin: 0, fontWeight: '800' }}>
              {t.redFlagTitle}
            </h1>
          </div>
          <p style={{ fontSize: '1.35rem', color: '#991b1b', margin: 0, fontWeight: '600', lineHeight: '1.4' }}>
            {t.redFlagMsg}
          </p>
        </div>

        {/* Session ID Box */}
        <div style={{ 
          background: '#ffffff', 
          border: '3px solid #dc2626',
          padding: '2rem', 
          borderRadius: '20px',
          display: 'block',
          margin: '0 auto 2rem auto',
          boxShadow: '0 10px 20px -5px rgba(220, 38, 38, 0.15)'
        }}>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 1rem 0', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.sessionIdTitle}
          </h2>
          <div style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '6px', color: '#dc2626' }}>
            {sessionId ? sessionId.toUpperCase() : ''}
          </div>
          <p style={{ fontSize: '1.25rem', marginTop: '1.5rem', color: 'var(--text-main)', fontWeight: '500' }}>
            {t.sessionIdInstruction}
          </p>
        </div>

        {/* Timer countdown */}
        <div style={{ marginBottom: '2rem', fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          {t.autoEndNotice} <span style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '800' }}>{timeLeft}</span> {t.seconds}.
        </div>

        {/* End Session Button */}
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <Button onClick={handleEndSession} variant="primary" style={{ background: '#dc2626', borderColor: '#b91c1c' }}>
            {t.endSession}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
