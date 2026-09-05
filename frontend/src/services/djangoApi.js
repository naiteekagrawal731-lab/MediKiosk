// MOCK MODE is ON for frontend development
const MOCK_MODE = true;

export const startClinicalSession = async (sessionId, data) => {
  if (MOCK_MODE) {
    console.log('[MOCK Django API] Starting clinical session for:', sessionId, 'with data:', data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Clinical session started." });
      }, 500);
    });
  }

  // TODO: Replace with real Django API call when ready
  // const response = await fetch('http://localhost:8000/api/clinic/start', { 
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     session_id: sessionId,
  //     language: data.language,
  //     consent_given: data.consent_given,
  //     treatment_type: data.treatment_type
  //   })
  // });
  // return response.json();
};
