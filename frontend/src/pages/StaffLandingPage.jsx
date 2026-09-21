import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useSession } from '../context/SessionContext';
import { translations } from '../utils/translations';

export const StaffLandingPage = () => {
  const navigate = useNavigate();
  const { sessionData } = useSession();
  const lang = sessionData?.language || 'EN';
  const t = translations[lang] || translations['EN'];

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        {/* Staff Header */}
        <div style={{ marginBottom: '2.5rem', width: '100%' }}>
          <div className="welcome-icon-circle" style={{ margin: '0 auto 1rem auto' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {t.hospitalStaffAccess || 'Hospital Staff Access'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.15rem', marginTop: '0.5rem', fontWeight: 500 }}>
            {t.staffPortalNotice || 'Select your portal to log in. (Not for patient use)'}
          </p>
        </div>

        {/* Staff Choice Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          {/* Choice 1: Login to Your Hospital */}
          <button
            type="button"
            onClick={() => navigate('/hospital/login')}
            className="kiosk-option-card"
            style={{
              padding: '1.6rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              border: '2px solid #cbd5e1',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {t.loginHospital || 'Login to Your Hospital'}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                {t.hospitalAdminSub || 'For Hospital Administrators & System Managers'}
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', color: '#0ea5e9' }}>→</span>
          </button>

          {/* Choice 2: Login as Doctor */}
          <button
            type="button"
            onClick={() => navigate('/doctor/login')}
            className="kiosk-option-card"
            style={{
              padding: '1.6rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              border: '2px solid #cbd5e1',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {t.loginDoctor || 'Login as Doctor'}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                {t.doctorSub || 'For Medical Practitioners & Physicians'}
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', color: '#0ea5e9' }}>→</span>
          </button>
          {/* Choice 3: Main Admin Login */}
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="kiosk-option-card"
            style={{
              padding: '1.6rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              border: '2px solid #cbd5e1',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {t.mainSystemAdmin || 'Main System Admin'}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                {t.mainAdminSub || 'For System Administrators & Platform Managers'}
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', color: '#0ea5e9' }}>→</span>
          </button>
        </div>

        {/* Back link to Kiosk Welcome */}
        <div style={{ marginTop: '2.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t.returnPatientWelcome || '← Return to Patient Welcome Screen'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
