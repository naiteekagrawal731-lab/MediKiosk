import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useAuth } from '../context/AuthContext';

export const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logoutUser, changeUserPassword } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleStartNewSession = () => {
    navigate('/');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!newPassword.trim()) {
      setPwdError('Please enter a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await changeUserPassword(newPassword);
      setPwdSuccess('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const profileData = user?.profile || user || {};

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'left' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Patient Portal</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
              Welcome, <strong>{user?.username || 'Patient'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleStartNewSession}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Start New Session
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '0.6rem 1.1rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
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
              cursor: 'pointer'
            }}
          >
            My Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'password' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'password' ? '#ffffff' : '#475569',
              cursor: 'pointer'
            }}
          >
            Change Password
          </button>
        </div>

        {/* TAB 1: READ-ONLY PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Patient Profile Details (Read-Only)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Username</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                  {profileData.username || user?.username || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Gender</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                  {profileData.gender || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date of Birth / Age</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                  {profileData.dateOfBirth || profileData.dob ? (
                    <>
                      {profileData.dateOfBirth || profileData.dob}
                      {(() => {
                        const dobStr = profileData.dateOfBirth || profileData.dob;
                        const dob = new Date(dobStr);
                        if (!isNaN(dob)) {
                          const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
                          return ` (${age} yrs)`;
                        }
                        return '';
                      })()}
                    </>
                  ) : '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Blood Group</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                  {profileData.bloodGroup || '—'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                  {profileData.phoneNumber || profileData.mobile || '—'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={handleStartNewSession}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Start a New Consultation Session →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                <label htmlFor="patNewPassword" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  New Password *
                </label>
                <input
                  id="patNewPassword"
                  type="password"
                  required
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

              <div>
                <label htmlFor="patConfirmPassword" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  Confirm New Password *
                </label>
                <input
                  id="patConfirmPassword"
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
        )}

      </div>
    </PageContainer>
  );
};
