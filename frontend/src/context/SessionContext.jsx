import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    language: 'EN', // Default fallback
    consentGiven: false,
    patientRegistration: null,
    treatmentType: null,
  });

  const updateSession = (data) => {
    setSessionData((prev) => ({ ...prev, ...data }));
  };

  const clearSession = () => {
    setSessionData({
      sessionId: null,
      language: 'EN',
      consentGiven: false,
      patientRegistration: null,
      treatmentType: null,
    });
  };

  return (
    <SessionContext.Provider value={{ sessionData, updateSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};
