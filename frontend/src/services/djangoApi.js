const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

export const startClinicalSession = async (sessionId, data) => {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/clinical/session/${sessionId}/start/`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: data.language,
        consent_given: data.consent_given,
        treatment_type: data.treatment_type
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Django API Error (startClinicalSession):', error);
    throw new Error('Unable to connect to the server to start the clinical interview. Please try again.');
  }
};
