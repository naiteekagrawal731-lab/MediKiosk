import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState(() => {
    const saved = sessionStorage.getItem('medikiosk_session_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse medikiosk_session_state', e);
      }
    }
    return {
      sessionId: null,
      language: 'EN', // Default fallback
      consentGiven: false,
      patientRegistration: null,
      treatmentType: null,
    };
  });

  const updateSession = (data) => {
    setSessionData((prev) => {
      const nextState = { ...prev, ...data };
      sessionStorage.setItem('medikiosk_session_state', JSON.stringify(nextState));
      return nextState;
    });
  };

  const clearSession = () => {
    setSessionData((prev) => {
      const currentLang = prev?.language || 'EN';
      const nextState = {
        sessionId: null,
        language: currentLang,
        consentGiven: false,
        patientRegistration: null,
        treatmentType: null,
      };
      sessionStorage.setItem('medikiosk_session_state', JSON.stringify(nextState));
      return nextState;
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('medikiosk_') && key !== 'medikiosk_session_state') {
        sessionStorage.removeItem(key);
      }
    });
  };

  return (
    <SessionContext.Provider value={{ sessionData, updateSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};
