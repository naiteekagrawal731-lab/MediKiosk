import { getHospitalRegistrationNumber } from '../utils/kioskDevice';
import { apiFetch, refreshAccessToken } from './apiClient';

const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080';

/**
 * Spring Boot: Create Clinical Session
 * Request: POST /patient/clinicalsession
 * Returns: { sessionId: "string" }
 */
export const createSession = async () => {
  try {
    let response = await fetch(`${SPRING_API_URL}/patient/clinicalsession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && response.status === 404) {
      // Fallback path if endpoint is nested under /api/clinical/
      response = await fetch(`${SPRING_API_URL}/api/clinical/patient/clinicalsession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const sessionId = data.sessionId || data.session_id;
    if (!sessionId) {
      throw new Error('Session ID not found in server response.');
    }

    return { session_id: sessionId, sessionId };
  } catch (error) {
    console.error('Spring API Error (createSession):', error);
    throw new Error('Unable to connect to the server to create a session. Please try again.');
  }
};

/**
 * Spring Boot: Guest Login / Registration
 * Request: POST /guest/login
 * Body: { username, gender, dateOfBirth, bloodGroup, phoneNumber, registrationNumber }
 */
export const registerGuestPatient = async (guestData) => {
  try {
    const hospitalRegNum = getHospitalRegistrationNumber() || '';

    const payload = {
      username: (guestData.username || guestData.name || '').trim(),
      gender: guestData.gender || '',
      dateOfBirth: guestData.dateOfBirth || guestData.dob || '',
      bloodGroup: guestData.bloodGroup ? guestData.bloodGroup.trim() : '',
      phoneNumber: guestData.phoneNumber || guestData.mobile || '',
      registrationNumber: hospitalRegNum,
    };

    const response = await fetch(`${SPRING_API_URL}/guest/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to register guest patient.';
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Spring API Error (registerGuestPatient):', error);
    throw new Error(error.message || 'Unable to register guest patient. Please try again.');
  }
};

/**
 * Spring Boot: Create Patient Account
 * Request: POST /patient/create
 * Body: { username, password, gender, dateOfBirth, bloodGroup, phoneNumber }
 */
export const createPatientAccount = async (patientData) => {
  try {
    const payload = {
      username: (patientData.username || '').trim(),
      password: patientData.password,
      gender: patientData.gender || '',
      dateOfBirth: patientData.dateOfBirth || patientData.dob || '',
      bloodGroup: patientData.bloodGroup ? patientData.bloodGroup.trim() : '',
      phoneNumber: patientData.phoneNumber || patientData.mobile || '',
    };

    const response = await fetch(`${SPRING_API_URL}/patient/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Receive refresh token cookie
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to create patient account.';
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    // Try acquiring access token via cookie refresh fallback
    let token = null;
    try {
      token = await refreshAccessToken();
    } catch (e) {
      console.warn('Token refresh fallback after patient creation:', e);
    }

    let resBody = {};
    try {
      resBody = await response.json();
    } catch {
      resBody = { success: true };
    }

    return {
      success: true,
      accessToken: token || resBody.accessToken,
      user: {
        username: payload.username,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        bloodGroup: payload.bloodGroup,
        phoneNumber: payload.phoneNumber,
      },
    };
  } catch (error) {
    console.error('Spring API Error (createPatientAccount):', error);
    throw new Error(error.message || 'Unable to create patient account.');
  }
};

/**
 * Spring Boot: Patient Login
 * Request: POST /patient/login
 * Body: { registrationNumber, username, password }
 */
export const loginPatient = async (credentials) => {
  try {
    const hospitalRegNum = getHospitalRegistrationNumber() || '';

    const payload = {
      registrationNumber: hospitalRegNum,
      username: (credentials.username || '').trim(),
      password: credentials.password,
    };

    let response = await fetch(`${SPRING_API_URL}/patient/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Receive refresh token cookie
      body: JSON.stringify(payload),
    });

    if (response.status === 405) {
      response = await fetch(`${SPRING_API_URL}/patient/login`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    }

    if (!response.ok) {
      let errorMsg = 'Patient login failed. Please check credentials.';
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    let token = null;
    try {
      token = await refreshAccessToken();
    } catch (e) {
      console.warn('Token refresh fallback after patient login:', e);
    }

    let resBody = {};
    try {
      resBody = await response.json();
    } catch {
      resBody = { success: true };
    }

    return {
      success: true,
      accessToken: token || resBody.accessToken,
      username: payload.username,
      profile: resBody.profile || resBody.patient || null,
    };
  } catch (error) {
    console.error('Spring API Error (loginPatient):', error);
    throw new Error(error.message || 'Patient login failed.');
  }
};

/**
 * Fetch Logged In Patient Profile
 */
export const fetchPatientProfile = async () => {
  try {
    const response = await apiFetch('/patient/profile');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.info('Patient profile endpoint not available, returning session profile state.', e);
  }
  return null;
};
