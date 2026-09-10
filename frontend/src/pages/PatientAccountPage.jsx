import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useAuth } from '../context/AuthContext';
import { loginPatient, createPatientAccount } from '../services/springApi';

export const PatientAccountPage = () => {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  // If already logged in as patient, redirect to dashboard
  if (user && user.role === 'PATIENT') {
    navigate('/patient/dashboard', { replace: true });
  }

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'create'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Create Account form state
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    phoneNumber: '',
  });

  // 1. Handle Patient Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginForm.username.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    if (!loginForm.password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginPatient(loginForm);
      loginUser({
        role: 'PATIENT',
        username: loginForm.username.trim(),
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        profile: res.profile,
      });
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Patient portal login error:', err);
      setErrorMsg(err.message || 'Login failed. Please check username and password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Create Patient Account
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!createForm.username.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    if (!createForm.password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }
    if (!createForm.gender) {
      setErrorMsg('Please select your gender.');
      return;
    }
    if (!createForm.dateOfBirth) {
      setErrorMsg('Date of birth is required.');
      return;
    }
    if (!createForm.phoneNumber.trim()) {
      setErrorMsg('Phone number is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await createPatientAccount(createForm);
      loginUser({
        role: 'PATIENT',
        username: createForm.username.trim(),
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        profile: res.user,
      });
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Patient portal create account error:', err);
      setErrorMsg(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="welcome-icon-circle" style={{ margin: '0 auto 1rem auto' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Patient Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.35rem' }}>
            Manage your patient account and view health history
          </p>
        </div>

        {/* Tab Toggle Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'login' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'login' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            👤 Existing Patient Login
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('create'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'create' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'create' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ Create Patient Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="interview-error-msg" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="kiosk-registration-form">
            <div className="kiosk-field-group" style={{ marginBottom: '1.25rem' }}>
              <label className="kiosk-field-label">Username *</label>
              <input
                type="text"
                required
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="kiosk-form-input"
              />
            </div>

            <div className="kiosk-field-group" style={{ marginBottom: '1.5rem' }}>
              <label className="kiosk-field-label">Password *</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="kiosk-form-input"
              />
            </div>

            <div className="kiosk-button-row-duo" style={{ marginTop: '1.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="kiosk-secondary-action-btn"
              >
                ← Return to Welcome
              </button>
              <button
                type="submit"
                disabled={loading}
                className="kiosk-submit-btn"
              >
                {loading ? 'Logging in...' : 'Login & View Dashboard →'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CREATE ACCOUNT FORM */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="kiosk-registration-form">
            <div className="form-grid-2col">
              <div className="kiosk-field-group">
                <label className="kiosk-field-label">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Choose a username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="kiosk-form-input"
                />
              </div>

              <div className="kiosk-field-group">
                <label className="kiosk-field-label">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Choose a password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="kiosk-form-input"
                />
              </div>

              <div className="kiosk-field-group col-span-2">
                <label className="kiosk-field-label">Gender *</label>
                <div className="gender-selector-grid">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, gender: g })}
                      className={`gender-btn ${createForm.gender === g ? 'active' : ''}`}
                    >
                      <span>{g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'}</span>
                      <span>{g}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="kiosk-field-group">
                <label className="kiosk-field-label">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={createForm.dateOfBirth}
                  onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
                  className="kiosk-form-input"
                />
              </div>

              <div className="kiosk-field-group">
                <label className="kiosk-field-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  className="kiosk-form-input"
                />
              </div>

              <div className="kiosk-field-group col-span-2">
                <label className="kiosk-field-label">Blood Group (Optional)</label>
                <select
                  value={createForm.bloodGroup}
                  onChange={(e) => setCreateForm({ ...createForm, bloodGroup: e.target.value })}
                  className="kiosk-form-select"
                >
                  <option value="">Select Blood Group...</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="kiosk-button-row-duo" style={{ marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="kiosk-secondary-action-btn"
              >
                ← Return to Welcome
              </button>
              <button
                type="submit"
                disabled={loading}
                className="kiosk-submit-btn"
              >
                {loading ? 'Creating Account...' : 'Create Account & Open Dashboard →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageContainer>
  );
};
