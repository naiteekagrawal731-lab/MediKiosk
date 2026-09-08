import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { createHospital } from '../services/hospitalApi';
import { createAdminUser, deleteAdminUser, fetchAdminUsers } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

export const MainAdminPage = () => {
  const navigate = useNavigate();
  const { user, logoutUser, changeUserPassword } = useAuth();

  // Active Tab: 'hospitals' | 'admins' | 'settings'
  const [activeTab, setActiveTab] = useState('hospitals');

  // Hospital creation form state
  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: '',
    password: '',
    address: '',
    city: '',
    state: '',
    phoneNumber: '',
  });
  const [hospLoading, setHospLoading] = useState(false);
  const [hospSuccess, setHospSuccess] = useState('');
  const [hospError, setHospError] = useState('');

  // Admin user management state
  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [adminCreateLoading, setAdminCreateLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleLogout = () => {
    logoutUser();
    navigate('/staff');
  };

  // Load Admin Users List
  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const list = await fetchAdminUsers(adminSearch);
      if (Array.isArray(list)) {
        setAdminsList(list);
      }
    } catch (e) {
      console.warn('Error loading admins:', e);
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admins') {
      loadAdmins();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // 1. Handle Hospital Creation (POST /hospital/create)
  const handleAddHospital = async (e) => {
    e.preventDefault();
    setHospError('');
    setHospSuccess('');

    if (!hospitalForm.hospitalName.trim()) {
      setHospError('Hospital Name is required.');
      return;
    }
    if (!hospitalForm.password.trim()) {
      setHospError('Password is required.');
      return;
    }
    if (!hospitalForm.address.trim()) {
      setHospError('Address is required.');
      return;
    }
    if (!hospitalForm.city.trim()) {
      setHospError('City is required.');
      return;
    }
    if (!hospitalForm.state.trim()) {
      setHospError('State is required.');
      return;
    }
    if (!hospitalForm.phoneNumber.trim()) {
      setHospError('Phone Number is required.');
      return;
    }

    setHospLoading(true);
    try {
      await createHospital(hospitalForm);
      setHospSuccess(`Hospital "${hospitalForm.hospitalName}" created successfully!`);
      setHospitalForm({
        hospitalName: '',
        password: '',
        address: '',
        city: '',
        state: '',
        phoneNumber: '',
      });
    } catch (err) {
      setHospError(err.message || 'Failed to create hospital account.');
    } finally {
      setHospLoading(false);
    }
  };

  // 2. Handle Create Admin User (POST /admin/create)
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (!adminForm.username.trim()) {
      setAdminError('Admin username is required.');
      return;
    }
    if (!adminForm.password.trim()) {
      setAdminError('Password is required.');
      return;
    }

    setAdminCreateLoading(true);
    try {
      await createAdminUser(adminForm);
      setAdminSuccess(`Admin user "${adminForm.username}" created successfully!`);
      setAdminForm({ username: '', password: '' });
      loadAdmins();
    } catch (err) {
      setAdminError(err.message || 'Failed to create admin user.');
    } finally {
      setAdminCreateLoading(false);
    }
  };

  // 3. Handle Delete Admin User (DELETE /admin/delete?id=...)
  const handleDeleteAdmin = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete admin "${username}"?`)) {
      return;
    }

    try {
      await deleteAdminUser(id);
      loadAdmins();
    } catch (err) {
      alert(err.message || 'Failed to delete admin user.');
    }
  };

  // 4. Handle Change Admin Password (POST /api/changepassword)
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
      <div className="interview-main-card" style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'left' }}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          width: '100%',
          marginBottom: '1.75rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Main System Administration
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.2rem 0 0 0' }}>
              Logged in as: <strong>{user?.username || 'Main Administrator'}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '0.55rem 1.1rem',
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('hospitals')}
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'hospitals' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'hospitals' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            Hospital Accounts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'admins' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'admins' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            System Admins
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'settings' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'settings' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            Account Settings
          </button>
        </div>

        {/* TAB 1: HOSPITAL CREATION */}
        {activeTab === 'hospitals' && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Add New Hospital System Account
            </h2>

            {hospSuccess && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.85rem 1.1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
                ✓ {hospSuccess}
              </div>
            )}
            {hospError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem 1.1rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600 }}>
                ⚠️ {hospError}
              </div>
            )}

            <form onSubmit={handleAddHospital} className="kiosk-registration-form" style={{ width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="hospName" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Hospital Name *
                  </label>
                  <input
                    id="hospName"
                    type="text"
                    required
                    placeholder="e.g. City General Hospital"
                    value={hospitalForm.hospitalName}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="hospPass" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Hospital Admin Password *
                  </label>
                  <input
                    id="hospPass"
                    type="password"
                    required
                    placeholder="Set admin password for this hospital"
                    value={hospitalForm.password}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, password: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="hospAddress" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Street Address *
                  </label>
                  <input
                    id="hospAddress"
                    type="text"
                    required
                    placeholder="e.g. 100 Health Way"
                    value={hospitalForm.address}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="hospCity" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    City *
                  </label>
                  <input
                    id="hospCity"
                    type="text"
                    required
                    placeholder="e.g. New York"
                    value={hospitalForm.city}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, city: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="hospState" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    State *
                  </label>
                  <input
                    id="hospState"
                    type="text"
                    required
                    placeholder="e.g. NY"
                    value={hospitalForm.state}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, state: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="hospPhone" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Phone Number *
                  </label>
                  <input
                    id="hospPhone"
                    type="tel"
                    required
                    placeholder="e.g. +1 555 123 4567"
                    value={hospitalForm.phoneNumber}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, phoneNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.75rem' }}>
                <button
                  type="submit"
                  disabled={hospLoading}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {hospLoading ? 'Creating Hospital Account...' : 'Create Hospital Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SYSTEM ADMIN USERS */}
        {activeTab === 'admins' && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              System Administrators
            </h2>

            {/* Create Admin Form */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
                + Add New Admin User
              </h3>

              {adminSuccess && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ✓ {adminSuccess}
                </div>
              )}
              {adminError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ⚠️ {adminError}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                <div>
                  <label htmlFor="newAdminUser" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                    Username *
                  </label>
                  <input
                    id="newAdminUser"
                    type="text"
                    required
                    placeholder="Enter admin username"
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="newAdminPass" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                    Password *
                  </label>
                  <input
                    id="newAdminPass"
                    type="password"
                    required
                    placeholder="Enter admin password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminCreateLoading}
                  style={{
                    padding: '0.7rem 1.25rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {adminCreateLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </form>
            </div>

            {/* List Admins */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Existing Admins ({adminsList.length})
                </h3>

                <input
                  type="text"
                  placeholder="Filter by username..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  onKeyUp={(e) => { if (e.key === 'Enter') loadAdmins(); }}
                  style={{ padding: '0.45rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>

              {adminsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading admins...</div>
              ) : adminsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  No system admin records found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {adminsList.map((adm, idx) => (
                    <div
                      key={adm.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.9rem 1.25rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                          👤 {adm.username}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Role: {adm.role || 'ADMIN'} {adm.id && `| ID: ${adm.id}`}
                        </div>
                      </div>

                      {adm.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#ef4444',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Change Main Admin Password
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
                <label htmlFor="mainAdminNewPass" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  New Password *
                </label>
                <input
                  id="mainAdminNewPass"
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
