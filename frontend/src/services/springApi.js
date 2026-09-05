// MOCK MODE is ON for frontend development
const MOCK_MODE = true;

const generateMockSessionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createSession = async () => {
  if (MOCK_MODE) {
    console.log('[MOCK Spring API] Creating new session...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ session_id: generateMockSessionId() });
      }, 500);
    });
  }

  // TODO: Replace with real Spring Boot API call when ready
  // const response = await fetch('http://localhost:8080/api/session/start', { method: 'POST' });
  // return response.json();
};

export const registerGuestPatient = async (data) => {
  if (MOCK_MODE) {
    console.log('[MOCK Spring API] Registering guest patient:', data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, patient_id: 'GUEST-' + generateMockSessionId() });
      }, 500);
    });
  }

  // TODO: Replace with real Spring Boot API call when ready
  // const response = await fetch('http://localhost:8080/api/patient/register', { 
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  // return response.json();
};
