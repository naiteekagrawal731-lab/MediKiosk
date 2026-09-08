import { getHospitalRegistrationNumber } from '../utils/kioskDevice';
import { apiFetch, refreshAccessToken, setAccessToken } from './apiClient';

const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080';

/**
 * Spring Boot: Create Clinical Session
 * Request: POST /patient/clinicalsession
 * Returns: { sessionId: "string" }
 */
export const createSession = async () => {
  try {
    let response = await apiFetch('/patient/clinicalsession', {
      method: 'POST',
    });

    if (!response.ok && response.status === 404) {
      // Fallback path if endpoint is nested under /api/clinical/
      response = await apiFetch('/api/clinical/patient/clinicalsession', {
        method: 'POST',
      });
    }

    if (!response.ok) {
      const resClone = response.clone();
      let errorText = '';
      try {
        const errJson = await response.json();
        errorText = errJson.message || errJson.error || '';
      } catch {
        try {
          errorText = await resClone.text();
        } catch {
          // Ignore
        }
      }
      throw new Error(errorText || `Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const sessionId = data.sessionId || data.session_id;
    if (!sessionId) {
      throw new Error('Session ID not found in server response.');
    }

    return { session_id: sessionId, sessionId };
  } catch (error) {
    console.error('Spring API Error (createSession):', error);
    throw new Error(error.message || 'Unable to connect to the server to create a session. Please try again.');
  }
};

/**
 * Spring Boot: Guest Login / Registration
 * Request: POST /guest/login
 * Body: { username, gender, dateOfBirth, bloodGroup, phoneNumber, registrationNumber }
 */
export const registerGuestPatient = async (guestData) => {
  console.log("Starting of guest")
  try {
    const hospitalRegNum = getHospitalRegistrationNumber() || '';

    console.log(5);
    console.log(hospitalRegNum);


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
      const resClone = response.clone();
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        try {
          const text = await resClone.text();
          if (text) errorMsg = text;
        } catch {
          // Ignore text reading failure
        }
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
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to create patient account.';
      const resClone = response.clone();
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        try {
          const text = await resClone.text();
          if (text) errorMsg = text;
        } catch {
          // Ignore
        }
      }
      throw new Error(errorMsg);
    }

    // Automatically call loginPatient to authenticate & receive refresh token cookie + accessToken
    const loginResult = await loginPatient({
      username: payload.username,
      password: payload.password,
    });

    return {
      success: true,
      ...loginResult,
      user: {
        username: payload.username,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        bloodGroup: payload.bloodGroup,
        phoneNumber: payload.phoneNumber,
        ...(loginResult.profile || {}),
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
      const resClone = response.clone();
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        try {
          const text = await resClone.text();
          if (text) errorMsg = text;
        } catch {
          // Ignore
        }
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

    const activeToken = token || resBody.accessToken;
    if (activeToken) {
      setAccessToken(activeToken);
    }

    return {
      success: true,
      accessToken: activeToken,
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
