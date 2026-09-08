import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useAuth } from '../context/AuthContext';
import { createDoctor, fetchDoctors, fetchHospitalRegistrationNumber } from '../services/hospitalApi';
import { setHospitalRegistrationNumber } from '../utils/kioskDevice';

export const HospitalDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logoutUser, changeUserPassword } = useAuth();

  // Active Tab: 'doctors' | 'add_doctor' | 'settings'
  const [activeTab, setActiveTab] = useState('doctors');

  // Doctors list state
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Add doctor form state
  const [doctorForm, setDoctorForm] = useState({
    username: '',
    password: '',
    licenseNumber: '',
    specialization: '',
    qualification: '',
  });
  const [docLoading, setDocLoading] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Device connection modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');

  // Load existing doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const list = await fetchDoctors();
      if (Array.isArray(list)) {
        setDoctorsList(list);
      }
    } catch (e) {
      console.warn('Failed to load doctors list:', e);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDoctorFormChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDocError('');
    setDocSuccess('');

    // Field validations
    if (!doctorForm.username.trim()) {
      setDocError('Username is required.');
      return;
    }
    if (!doctorForm.password.trim()) {
      setDocError('Password is required.');
      return;
    }
    if (!doctorForm.licenseNumber.trim()) {
      setDocError('License Number is required.');
      return;
    }

    // STRICT VALIDATION: licenseNumber MUST be between 4 and 10 characters inclusive!
    const licenseLen = doctorForm.licenseNumber.trim().length;
    if (licenseLen < 4 || licenseLen > 10) {
      setDocError('License Number MUST be between 4 and 10 characters long.');
      return;
    }

    if (!doctorForm.specialization.trim()) {
      setDocError('Specialization is required.');
      return;
    }
    if (!doctorForm.qualification.trim()) {
      setDocError('Qualification is required.');
      return;
    }

    setDocLoading(true);

    try {
      await createDoctor(doctorForm);
      setDocSuccess(`Doctor "${doctorForm.username}" created successfully!`);
      // Clear form
      setDoctorForm({
        username: '',
        password: '',
        licenseNumber: '',
        specialization: '',
        qualification: '',
      });
      // Refresh list
      loadDoctors();
    } catch (err) {
      setDocError(err.message || 'Failed to create doctor account.');
    } finally {
      setDocLoading(false);
    }
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

  // Normal logout
  const handleNormalLogout = () => {
    logoutUser();
    navigate('/staff');
  };

  // Device connection logic
  const handleConfirmConnectDevice = async () => {
    setConnectError('');
    setConnectLoading(true);

    try {
      // 1. Send request to GET /hospital/registrationNumber/
      const registrationNumber = await fetchHospitalRegistrationNumber();

      // 2. Store registrationNumber in localStorage
      setHospitalRegistrationNumber(registrationNumber);

      // 3. Remove hospital admin auth/access token and clear session state
      logoutUser();

      // 4. Redirect to MediKiosk Welcome page
      navigate('/');
    } catch (err) {
      console.error('Device connection error:', err);
      setConnectError(err.message || 'Failed to connect device to MediKiosk.');
      setConnectLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="interview-main-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          marginBottom: '2rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              Hospital Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.2rem' }}>
              Logged in as: <strong>{user?.username || 'Hospital Administrator'}</strong>
            </p>
          </div>

          {/* Action Buttons: Connect Device & Logout */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.7rem 1.2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              🖥️ Connect this device to MediKiosk
            </button>

            <button
              type="button"
              onClick={handleNormalLogout}
              className="kiosk-secondary-action-btn"
              style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', color: '#ef4444', borderColor: '#cbd5e1' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
          width: '100%'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'doctors' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'doctors' ? '#0284c7' : '#64748b',
            }}
          >
            Existing Doctors ({doctorsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add_doctor')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'add_doctor' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'add_doctor' ? '#0284c7' : '#64748b',
            }}
          >
            + Add New Doctor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'settings' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'settings' ? '#0284c7' : '#64748b',
            }}
          >
            Account Settings
          </button>
        </div>

        {/* SECTION A: Existing Doctors */}
        {activeTab === 'doctors' && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Hospital Doctors</h2>
              <button
                type="button"
                onClick={() => setActiveTab('add_doctor')}
                className="kiosk-secondary-action-btn"
                style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}
              >
                + Add Doctor
              </button>
            </div>

            {loadingDoctors ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading doctor records...</div>
            ) : doctorsList.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩺</div>
                <h3 style={{ fontSize: '1.2rem', color: '#334155', fontWeight: 700 }}>No doctors currently registered</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  Click "+ Add New Doctor" above to register physicians for your hospital.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {doctorsList.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem'
                      }}>
                        {doc.username ? doc.username.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                          Dr. {doc.username}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 600 }}>
                          {doc.specialization || 'General Practitioner'}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div>
                        <strong>License No:</strong> {doc.licenseNumber || 'N/A'}
                      </div>
                      <div>
                        <strong>Qualification:</strong> {doc.qualification || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION B: Add Doctor */}
        {activeTab === 'add_doctor' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              Add New Doctor Account
            </h2>

            {docSuccess && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600 }}>
                ✓ {docSuccess}
              </div>
            )}
            {docError && (
              <div className="interview-error-msg" style={{ width: '100%', marginBottom: '1.5rem' }}>
                {docError}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className="kiosk-registration-form" style={{ width: '100%' }}>
              <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                {/* Username */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label" htmlFor="docUsername">
                    Doctor Username *
                  </label>
                  <input
                    id="docUsername"
                    name="username"
                    type="text"
                    className="kiosk-form-input"
                    placeholder="e.g. dr_smith"
                    value={doctorForm.username}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label" htmlFor="docPassword">
                    Password *
                  </label>
                  <input
                    id="docPassword"
                    name="password"
                    type="password"
                    className="kiosk-form-input"
                    placeholder="Set doctor password"
                    value={doctorForm.password}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>

                {/* License Number (4-10 chars validation!) */}
                <div className="kiosk-field-group col-span-2">
                  <label className="kiosk-field-label" htmlFor="docLicense">
                    License Number (4 to 10 characters) *
                  </label>
                  <input
                    id="docLicense"
                    name="licenseNumber"
                    type="text"
                    className="kiosk-form-input"
                    placeholder="e.g. MED12345"
                    value={doctorForm.licenseNumber}
                    onChange={handleDoctorFormChange}
                    minLength={4}
                    maxLength={10}
                    required
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Must be between 4 and 10 characters inclusive.
                  </span>
                </div>

                {/* Specialization */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label" htmlFor="docSpec">
                    Specialization *
                  </label>
                  <input
                    id="docSpec"
                    name="specialization"
                    type="text"
                    className="kiosk-form-input"
                    placeholder="e.g. Cardiology"
                    value={doctorForm.specialization}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>

                {/* Qualification */}
                <div className="kiosk-field-group">
                  <label className="kiosk-field-label" htmlFor="docQual">
                    Qualification *
                  </label>
                  <input
                    id="docQual"
                    name="qualification"
                    type="text"
                    className="kiosk-form-input"
                    placeholder="e.g. MBBS, MD"
                    value={doctorForm.qualification}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={docLoading}
                  className="kiosk-submit-btn"
                  style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }}
                >
                  {docLoading ? 'Creating Doctor Account...' : 'Create Doctor Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION C: Account Settings & Password Change */}
        {activeTab === 'settings' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              Change Hospital Admin Password
            </h2>

            {pwdSuccess && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600 }}>
                ✓ {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div className="interview-error-msg" style={{ width: '100%', marginBottom: '1.5rem' }}>
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="kiosk-registration-form" style={{ width: '100%' }}>
              <div className="kiosk-field-group" style={{ marginBottom: '1.5rem' }}>
                <label className="kiosk-field-label" htmlFor="hospAdminNewPassword">
                  New Password *
                </label>
                <input
                  id="hospAdminNewPassword"
                  type="password"
                  className="kiosk-form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="kiosk-secondary-action-btn"
                style={{ padding: '0.95rem 1.75rem', fontSize: '1.1rem' }}
              >
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* SECTION D: Connect Device Modal Confirmation */}
        {showConnectModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2.25rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontSize: '2rem'
              }}>
                🖥️
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                Connect this device to MediKiosk?
              </h2>

              <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                After connecting, this device will be used by patients. The hospital admin account will be logged out from this device.
              </p>

              {connectError && (
                <div className="interview-error-msg" style={{ width: '100%', marginBottom: '1.25rem' }}>
                  {connectError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  disabled={connectLoading}
                  className="kiosk-secondary-action-btn"
                  style={{ flex: 1, padding: '0.9rem', fontSize: '1.1rem' }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmConnectDevice}
                  disabled={connectLoading}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  }}
                >
                  {connectLoading ? 'Connecting...' : 'Yes, Connect'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
