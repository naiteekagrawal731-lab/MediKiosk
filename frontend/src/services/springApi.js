const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080';

export const createSession = async () => {
  try {
    // We assume the real endpoint is /patient/clinicalsession based on inspection, 
    // but could be easily changed here if the backend changes.
    const response = await fetch(`${SPRING_API_URL}/api/clinical/patient/clinicalsession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(response)

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Support either session_id or sessionId based on Spring's Jackson mapping
    const sessionId = data.sessionId || data.session_id;
    if (!sessionId) {
      throw new Error('Session ID not found in server response.');
    }

    return { session_id: sessionId };
  } catch (error) {
    console.error('Spring API Error (createSession):', error);
    throw new Error('Unable to connect to the server to create a session. Please try again.');
  }
};

export const registerGuestPatient = async (data, sessionId) => {
  try {
    // Mapping the frontend form fields to the GuestLoginRequest expected by Spring Boot
    const requestData = {
      username: data.name,
      phoneNumber: data.mobile || null,
      dateOfBirth: data.dob || null,
      bloodGroup: data.bloodGroup || null,
      registrationNumber: sessionId // Using registrationNumber to pass the session ID per GuestLoginRequest
    };

    const response = await fetch(`${SPRING_API_URL}/guest/login`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Spring API Error (registerGuestPatient):', error);
    throw new Error('Unable to register patient. Please try again.');
  }
};
