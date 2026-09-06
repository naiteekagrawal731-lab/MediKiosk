import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';

export const LanguagePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { updateSession } = useSession();
  const { speak } = useSpeechSynthesis();

  // For language selection, we default to English text
  const t = translations.EN;

  useEffect(() => {
    // Optionally read the language question aloud on mount
    speak(t.languageQuestion, 'EN');
  }, [speak, t.languageQuestion]);

  const handleLanguageSelect = (langCode) => {
    updateSession({ language: langCode, sessionId });
    navigate(`/session/${sessionId}/consent`);
  };

  return (
    <PageContainer>
      <ProgressIndicator step={1} total={4} />
      
      <SpeakerButton onClick={() => speak(t.languageQuestion, 'EN')} />
      <h2 className="kiosk-question">{t.languageQuestion}</h2>

      <div className="kiosk-button-grid">
        <Button onClick={() => handleLanguageSelect('EN')} variant="primary">
          English
        </Button>
        <Button onClick={() => handleLanguageSelect('HI')} variant="primary">
          हिंदी (Hindi)
        </Button>
      </div>
    </PageContainer>
  );
};
