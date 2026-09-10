import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { loginAdmin } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage = () => {
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
      const result = await loginAdmin({ username: username.trim(), password });

      loginUser({
        role: 'MAIN_ADMIN',
        username: username.trim(),
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
          <div className="welcome-icon-circle" style={{ margin: '0 auto 0.75rem auto' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            System Administration
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>
            Log in to access the main admin panel
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="interview-error-msg" style={{ width: '100%', marginBottom: '1.5rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="adminUsername" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Username *
            </label>
            <input
              id="adminUsername"
              type="text"
              className="kiosk-form-input"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="adminPassword" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Password *
            </label>
            <input
              id="adminPassword"
              type="password"
              className="kiosk-form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="kiosk-submit-btn"
            style={{ width: '100%', fontSize: '1.1rem', padding: '0.9rem' }}
          >
            {loading ? 'Logging in...' : 'Login as Admin →'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/staff')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.95rem',
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
