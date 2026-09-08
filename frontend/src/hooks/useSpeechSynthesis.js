import { useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const timeoutRef = useRef(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((text, languageCode, options = {}) => {
    const { volume = 1, isMuted = false } = options;

    if (!window.speechSynthesis) {
      console.warn('Speech Synthesis API is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech and pending speech timeout
    cancel();

    if (isMuted || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.max(0, Math.min(1, volume));
    
    // Map custom codes to standard language locales
    if (languageCode === 'EN') {
      utterance.lang = 'en-IN';
    } else if (languageCode === 'HI') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    // Single timeout to allow cancel to clear properly
    timeoutRef.current = setTimeout(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      }
      timeoutRef.current = null;
    }, 40);
  }, [cancel]);

  return { speak, cancel };
}
