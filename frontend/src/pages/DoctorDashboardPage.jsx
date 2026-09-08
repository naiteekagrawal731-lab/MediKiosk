import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useAuth } from '../context/AuthContext';
import { getDoctorClinicalSession } from '../services/doctorApi';
import { PatientSummaryReport } from '../components/PatientSummaryReport';

export const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logoutUser, changeUserPassword } = useAuth();

  // Navigation tab state: 'session' | 'profile'
  const [activeTab, setActiveTab] = useState('session');

  // Patient Lookup State
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [activeSessionSummary, setActiveSessionSummary] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState('');

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleLogout = () => {
    logoutUser();
    navigate('/staff');
  };

  const handleGetSummary = async (e) => {
    e.preventDefault();
    setSummaryError('');

    const cleanId = sessionIdInput.trim();
    if (!cleanId) {
      setSummaryError('Please enter a valid Patient Session ID.');
      return;
    }

    setLoadingSummary(true);
    try {
      const data = await getDoctorClinicalSession(cleanId);
      setActiveSessionSummary(data);
      setActiveSessionId(cleanId);
    } catch (err) {
      console.error('Fetch summary error:', err);
      setSummaryError(err.message || 'Failed to fetch patient summary. Please check the Session ID.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleBackToLookup = () => {
    setActiveSessionSummary(null);
    setActiveSessionId('');
    setSummaryError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!newPassword.trim()) {
      setPwdError('Please enter a new password.');
      return;
    }

    setPwdLoading(true);
    try {
      await changeUserPassword(newPassword);
      setPwdSuccess('Password changed successfully.');
      setNewPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: activeSessionSummary ? '960px' : '760px', margin: '0 auto', textAlign: 'left', transition: 'max-width 0.2s ease' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Doctor Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.2rem 0 0 0' }}>
              Logged in as Dr. <strong>{user?.username || 'Practitioner'}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.1rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#ef4444',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation (Only show if not currently viewing an active report) */}
        {!activeSessionSummary && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('session')}
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'session' ? '#0284c7' : '#f1f5f9',
                color: activeTab === 'session' ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              Patient Session
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'profile' ? '#0284c7' : '#f1f5f9',
                color: activeTab === 'profile' ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              My Profile
            </button>
          </div>
        )}

        {/* TAB 1: PATIENT SESSION LOOKUP OR ACTIVE REPORT */}
        {activeTab === 'session' && (
          <div>
            {activeSessionSummary ? (
              /* ACTIVE REPORT VIEW */
              <PatientSummaryReport
                summaryData={activeSessionSummary}
                sessionId={activeSessionId}
                onBack={handleBackToLookup}
              />
            ) : (
              /* LOOKUP FORM */
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  View Patient Summary
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Enter the patient's Clinical Session ID below to load their intake record and assessment.
                </p>

                {summaryError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                    ⚠️ {summaryError}
                  </div>
                )}

                <form onSubmit={handleGetSummary} style={{ width: '100%' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="sessionIdInput" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                      Session ID *
                    </label>
                    <input
                      id="sessionIdInput"
                      type="text"
                      placeholder="e.g. SESS-1024-88A or UUID"
                      value={sessionIdInput}
                      onChange={(e) => setSessionIdInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingSummary}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    {loadingSummary ? 'Loading Clinical Summary...' : 'Get Summary →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY PROFILE & CHANGE PASSWORD */}
        {activeTab === 'profile' && !activeSessionSummary && (
          <div>
            {/* READ-ONLY PROFILE */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                My Profile (Read-Only)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Username</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{user?.username || '—'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>License Number</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{user?.licenseNumber || 'DOC-LIC-98421'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Specialization</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{user?.specialization || 'General Medicine'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Qualification</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{user?.qualification || 'MBBS, MD'}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '1.25rem', fontStyle: 'italic', margin: '1.25rem 0 0 0' }}>
                * Doctor credential fields are read-only. Contact your Hospital Administrator to request credential updates.
              </p>
            </div>

            {/* CHANGE PASSWORD */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                Change Password
              </h2>

              {pwdSuccess && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ✓ {pwdSuccess}
                </div>
              )}
              {pwdError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ⚠️ {pwdError}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '440px' }}>
                <div>
                  <label htmlFor="docNewPassword" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    New Password
                  </label>
                  <input
                    id="docNewPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      fontSize: '0.95rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '0.7rem 1.25rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {pwdLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
