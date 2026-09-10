import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { loginHospital } from '../services/hospitalApi';
import { useAuth } from '../context/AuthContext';

export const HospitalLoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [hospitalName, setHospitalName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hospitalName.trim()) {
      setErrorMsg('Hospital Name is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setLoading(true);

    try {
      // Map UI field "Hospital Name" to backend field "username"
      const result = await loginHospital({
        username: hospitalName.trim(),
        password: password,
      });

      loginUser({
        role: 'HOSPITAL_ADMIN',
        username: hospitalName.trim(),
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      navigate('/hospital/dashboard');
    } catch (err) {
      console.error('Hospital login error:', err);
      setErrorMsg(err.message || 'Login failed. Please check Hospital Name and Password.');
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Hospital Admin Login</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.25rem' }}>
            Access your hospital dashboard and doctor management
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
            <label className="kiosk-field-label" htmlFor="hospitalName">
              Hospital Name *
            </label>
            <input
              id="hospitalName"
              type="text"
              className="kiosk-form-input"
              placeholder="Enter Hospital Name"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
            />
          </div>

          <div className="kiosk-field-group" style={{ marginBottom: '1.75rem' }}>
            <label className="kiosk-field-label" htmlFor="password">
              Password *
            </label>
            <input
              id="password"
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
            {loading ? 'Logging in...' : 'Login to Hospital Dashboard →'}
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
