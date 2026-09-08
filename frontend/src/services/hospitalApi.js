import { apiFetch, refreshAccessToken } from './apiClient';

const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080';

/**
 * Main Admin: Create Hospital Account
 * POST /hospital/create
 * Body: { hospitalName, password, address, city, state, phoneNumber }
 */
export const createHospital = async (hospitalData) => {
  const response = await fetch(`${SPRING_API_URL}/hospital/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hospitalName: hospitalData.hospitalName,
      password: hospitalData.password,
      address: hospitalData.address,
      city: hospitalData.city,
      state: hospitalData.state,
      phoneNumber: hospitalData.phoneNumber,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to create hospital account.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return { success: true, message: 'Hospital created successfully.' };
  }
};

/**
 * Hospital Admin: Login
 * POST /hospital/login
 * Body: { username, password } (Note: "Hospital Name" input mapped to "username")
 */
export const loginHospital = async (credentials) => {
  // Try POST request first per prompt requirement, fallback to GET if needed
  let response = await fetch(`${SPRING_API_URL}/hospital/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Receive refresh token cookie
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (response.status === 405) {
    // If backend only accepts GET for /hospital/login, retry via GET
    response = await fetch(`${SPRING_API_URL}/hospital/login`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  if (!response.ok) {
    let errorMsg = 'Hospital login failed. Please check credentials.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  // Attempt to acquire access token via refresh token cookie
  let token = null;
  try {
    token = await refreshAccessToken();
  } catch (err) {
    console.warn('Refresh token retrieval fallback after hospital login:', err);
  }

  return { success: true, accessToken: token, username: credentials.username };
};

/**
 * Doctor: Login
 * POST /doctor/login
 * Body: { username, password }
 */
export const loginDoctor = async (credentials) => {
  let response = await fetch(`${SPRING_API_URL}/doctor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Doctor login failed. Please check credentials.';
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
  } catch (err) {
    console.warn('Refresh token retrieval fallback after doctor login:', err);
  }

  return { success: true, accessToken: token, username: credentials.username };
};

/**
 * Hospital Admin: Add New Doctor
 * POST /doctor/create
 * Body: { username, password, licenseNumber, specialization, qualification }
 * Validation: licenseNumber must be between 4 and 10 characters inclusive!
 */
export const createDoctor = async (doctorData) => {
  const licenseNum = doctorData.licenseNumber ? String(doctorData.licenseNumber).trim() : '';

  if (licenseNum.length < 4 || licenseNum.length > 10) {
    throw new Error('License Number must be between 4 and 10 characters inclusive.');
  }

  const response = await apiFetch('/doctor/create', {
    method: 'POST',
    body: JSON.stringify({
      username: doctorData.username.trim(),
      password: doctorData.password,
      licenseNumber: licenseNum,
      specialization: doctorData.specialization ? doctorData.specialization.trim() : '',
      qualification: doctorData.qualification ? doctorData.qualification.trim() : '',
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to create doctor.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return { success: true, message: 'Doctor created successfully.' };
  }
};

/**
 * Hospital Admin: Get Device Registration Number
 * GET /hospital/registrationNumber/
 * Response: { registrationNumber: "string" }
 */
export const fetchHospitalRegistrationNumber = async () => {
  let response = await apiFetch('/hospital/registrationNumber/');
  
  if (!response.ok) {
    // Retry without trailing slash if needed
    response = await apiFetch('/hospital/registrationNumber');
  }

  if (!response.ok) {
    let errorMsg = 'Failed to retrieve hospital registration number.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (!data.registrationNumber) {
    throw new Error('Registration number not found in server response.');
  }

  return data.registrationNumber;
};

/**
 * Isolated API call for fetching doctors list.
 * If backend adds a GET endpoint in the future, it will be called here.
 */
export const fetchDoctors = async () => {
  try {
    const response = await apiFetch('/doctor/all', { method: 'GET' });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.info('No GET doctors endpoint available currently, returning isolated list structure.');
  }
  return [];
};
