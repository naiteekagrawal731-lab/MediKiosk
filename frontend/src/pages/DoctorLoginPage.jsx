import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { loginDoctor } from '../services/hospitalApi';
import { useAuth } from '../context/AuthContext';

export const DoctorLoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginDoctor({
        username: username.trim(),
        password: password,
      });

      loginUser({
        role: 'DOCTOR',
        username: username.trim(),
        accessToken: result.accessToken,
      });

      navigate('/doctor/dashboard');
    } catch (err) {
      console.error('Doctor login error:', err);
      setErrorMsg(err.message || 'Doctor login failed. Check username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'left' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
          <div className="welcome-icon-circle" style={{ margin: '0 auto 0.75rem auto' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.8 2.3A.3.3 0 0 0 4.5 2h-1a.3.3 0 0 0-.3.3v10.4a.3.3 0 0 0 .3.3h1a.3.3 0 0 0 .3-.3V2.3z"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H9v-2h2V9h2v2h2v2h-2v4z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Doctor Login</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.25rem' }}>
            Sign in to access medical history and clinical sessions
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="interview-error-msg" style={{ width: '100%', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="kiosk-registration-form" style={{ width: '100%' }}>
          <div className="kiosk-field-group" style={{ marginBottom: '1.25rem' }}>
            <label className="kiosk-field-label" htmlFor="doctorUsername">
              Username *
            </label>
            <input
              id="doctorUsername"
              type="text"
              className="kiosk-form-input"
              placeholder="Enter Doctor Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="kiosk-field-group" style={{ marginBottom: '1.75rem' }}>
            <label className="kiosk-field-label" htmlFor="doctorPassword">
              Password *
            </label>
            <input
              id="doctorPassword"
              type="password"
              className="kiosk-form-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="kiosk-submit-btn"
            style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }}
          >
            {loading ? 'Logging in...' : 'Login as Doctor →'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/staff')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ← Back to Staff Portals
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
