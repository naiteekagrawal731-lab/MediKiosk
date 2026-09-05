import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerButton } from '../components/SpeakerButton';
import { registerGuestPatient } from '../services/springApi';

export const RegisterPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionData, updateSession } = useSession();
  const { speak } = useSpeechSynthesis();
  
  const [view, setView] = useState('choice'); // 'choice', 'existing', 'guest'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    dob: '',
    bloodGroup: ''
  });

  const lang = sessionData.language || 'EN';
  const t = translations[lang];

  useEffect(() => {
    if (view === 'choice') {
      speak(t.existingPatientQuestion, lang);
    }
  }, [speak, t.existingPatientQuestion, lang, view]);

  const handleChoice = (selectedView) => {
    setView(selectedView);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const result = await registerGuestPatient(formData);
      updateSession({ 
        patientRegistration: { type: 'guest', ...formData, id: result.patient_id },
        sessionId 
      });
      navigate(`/session/${sessionId}/treatment`);
    } catch (error) {
      console.error('Registration failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExistingSubmit = () => {
    // Mock existing patient flow
    updateSession({ 
      patientRegistration: { type: 'existing', id: 'MOCK-EXISTING-123' },
      sessionId 
    });
    navigate(`/session/${sessionId}/treatment`);
  };

  if (view === 'existing') {
    return (
      <PageContainer>
        <ProgressIndicator step={3} total={5} />
        <h2 className="kiosk-question">Existing patient login will be connected to the Spring Boot patient account system.</h2>
        <div className="kiosk-button-grid">
          <Button onClick={handleExistingSubmit} variant="primary">
            {t.continueBtn}
          </Button>
          <Button onClick={() => setView('choice')} variant="outline">
            Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (view === 'guest') {
    return (
      <PageContainer>
        <ProgressIndicator step={3} total={5} />
        <h2 className="kiosk-question" style={{ marginBottom: '1.5rem' }}>{t.guest}</h2>
        
        <form onSubmit={handleGuestSubmit} className="kiosk-form">
          <div className="kiosk-form-group">
            <label className="kiosk-label">{t.nameLabel} *</label>
            <input 
              type="text" 
              name="name"
              required 
              value={formData.name}
              onChange={handleInputChange}
              className="kiosk-input" 
            />
          </div>
          
          <div className="kiosk-form-group">
            <label className="kiosk-label">{t.ageLabel}</label>
            <input 
              type="number" 
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="kiosk-input" 
            />
          </div>

          <div className="kiosk-form-group">
            <label className="kiosk-label">{t.mobileLabel}</label>
            <input 
              type="tel" 
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="kiosk-input" 
            />
          </div>

          <div className="kiosk-form-group">
            <label className="kiosk-label">{t.dobLabel}</label>
            <input 
              type="date" 
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="kiosk-input" 
            />
          </div>

          <div className="kiosk-form-group">
            <label className="kiosk-label">{t.bloodGroupLabel}</label>
            <select 
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              className="kiosk-input"
            >
              <option value=""></option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div className="kiosk-button-row" style={{ marginTop: '2rem' }}>
            <Button onClick={() => setView('choice')} variant="outline" type="button">
              Back
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || loading} variant="primary">
              {loading ? '...' : t.continueBtn}
            </Button>
          </div>
        </form>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProgressIndicator step={3} total={5} />
      
      <SpeakerButton onClick={() => speak(t.existingPatientQuestion, lang)} />
      <h2 className="kiosk-question">{t.existingPatientQuestion}</h2>

      <div className="kiosk-button-grid">
        <Button onClick={() => handleChoice('existing')} variant="primary">
          {t.existingPatient}
        </Button>
        <Button onClick={() => handleChoice('guest')} variant="secondary">
          {t.guest}
        </Button>
      </div>
    </PageContainer>
  );
};
