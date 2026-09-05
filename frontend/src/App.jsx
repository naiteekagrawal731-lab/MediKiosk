import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';

// Pages
import { WelcomePage } from './pages/WelcomePage';
import { LanguagePage } from './pages/LanguagePage';
import { ConsentPage } from './pages/ConsentPage';
import { RegisterPage } from './pages/RegisterPage';
import { TreatmentPage } from './pages/TreatmentPage';
import { InterviewPage } from './pages/InterviewPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          
          <Route path="/session/:sessionId/language" element={<LanguagePage />} />
          <Route path="/session/:sessionId/consent" element={<ConsentPage />} />
          <Route path="/session/:sessionId/register" element={<RegisterPage />} />
          <Route path="/session/:sessionId/treatment" element={<TreatmentPage />} />
          <Route path="/session/:sessionId/interview" element={<InterviewPage />} />
          
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
