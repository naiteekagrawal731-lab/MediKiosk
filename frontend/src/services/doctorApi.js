import { apiFetch } from './apiClient';

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

/**
 * Fetch patient clinical session summary for Doctor
 * Request: POST /doctor/clinicalsession/
 * Body: { sessionId: "..." } or raw string as expected by backend contract
 */
export const getDoctorClinicalSession = async (sessionId) => {
  const cleanId = String(sessionId).trim();
  if (!cleanId) {
    throw new Error('Session ID is required.');
  }

  // Attempt POST /doctor/clinicalsession/ first per contract
  let response = await apiFetch('/doctor/clinicalsession/', {
    method: 'POST',
    body: JSON.stringify({ sessionId: cleanId }),
  });

  if (!response.ok && response.status === 404) {
    // Retry without trailing slash
    response = await apiFetch('/doctor/clinicalsession', {
      method: 'POST',
      body: JSON.stringify({ sessionId: cleanId }),
    });
  }

  if (!response.ok && (response.status === 405 || response.status === 400)) {
    // Fallback: send raw string body if backend expects @RequestBody String
    response = await apiFetch('/doctor/clinicalsession', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: cleanId,
    });
  }

  if (!response.ok && response.status === 405) {
    // Fallback GET request if backend mapped @GetMapping("/clinicalsession")
    response = await apiFetch(`/doctor/clinicalsession?sessionId=${encodeURIComponent(cleanId)}`, {
      method: 'GET',
    });
  }

  if (!response.ok) {
    let errorMsg = `Unable to fetch session summary (Status ${response.status}).`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  return await response.json();
};

/**
 * Isolated API function for editing patient summary.
 * If backend adds an edit endpoint later, it connects here seamlessly.
 */
export const updateClinicalSessionSummary = async (sessionId, updatedSummary) => {
  console.info('Saving updated summary locally for session:', sessionId, updatedSummary);
  try {
    const response = await apiFetch(`/doctor/clinicalsession/${sessionId}/update`, {
      method: 'PUT',
      body: JSON.stringify(updatedSummary),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.info('Backend update endpoint not active, saved in frontend state.', e);
  }
  return updatedSummary;
};

/**
 * Verify Patient Summary
 * Request ONLY goes to DJANGO backend: POST /doctor/verify/<session:id>
 */
export const verifyClinicalSessionSummary = async (sessionId) => {
  const cleanId = String(sessionId).trim();
  const url = `${DJANGO_API_URL}/doctor/verify/${cleanId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMsg = `Verification failed (Status ${response.status}).`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.detail || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return { success: true, message: 'Summary verified successfully.' };
  }
};

/**
 * Fetch Doctor Profile
 */
export const fetchDoctorProfileDetails = async () => {
  try {
    const response = await apiFetch('/doctor/profile');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.info('Using doctor profile details from context/state.');
  }
  return null;
};
