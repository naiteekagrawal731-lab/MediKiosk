import { useCallback } from 'react';

export function useSpeechSynthesis() {
  const speak = useCallback((text, languageCode) => {
    if (!window.speechSynthesis) {
      console.warn('Speech Synthesis API is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map our custom codes to standard language locales
    if (languageCode === 'EN') {
      utterance.lang = 'en-IN';
    } else if (languageCode === 'HI') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}
