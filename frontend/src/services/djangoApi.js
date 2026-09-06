const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

export const createDjangoSession = async (sessionId) => {
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/clinical/session/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Django API Error (createDjangoSession):', error);
    throw new Error('Unable to connect to the server to create session in Django. Please try again.');
  }
};

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

export const getNextQuestion = async (sessionId, answerData = null) => {
  try {
    // If we have an answer with audio, we use FormData
    let body;
    let headers = {};

    if (answerData && answerData.input_type === 'VOICE' && answerData.audioBlob) {
      const formData = new FormData();
      formData.append('question_key', answerData.question_key || '');
      formData.append('question_text', answerData.question_text || '');
      formData.append('input_type', answerData.input_type);
      formData.append('audio', answerData.audioBlob, 'answer.webm');
      body = formData;
      // Do not set Content-Type for FormData, browser sets it with boundary
    } else if (answerData) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        question_key: answerData.question_key || '',
        question_text: answerData.question_text || '',
        user_response: answerData.answer_text || '',
        input_type: answerData.input_type || 'TEXT'
      });
    }
    // } else {
    //   // First question fetch (no previous answer)
    //   headers['Content-Type'] = 'application/json';
    //   body = JSON.stringify({});
    // }

    // Endpoint requested: session/<str:session_id>/next-question/
    // Assuming it's part of the same /api/clinical/ base, but we will use exactly what is given.
    // The prompt says "session/<str:session_id>/next-question/"
    // I'll construct it from DJANGO_API_URL, possibly with /api/ prefix if it matches startClinicalSession,
    // but let's just use /api/clinical/session/... or whatever is standard.
    // Wait, the instructions say "The Django endpoint for each question/answer step is: session/<str:session_id>/next-question/"
    // Let's use `${DJANGO_API_URL}/api/clinical/session/${sessionId}/next-question/` to be consistent with start.
    const url = `${DJANGO_API_URL}/api/clinical/session/${sessionId}/next-question/`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Django API Error (getNextQuestion):', error);
    throw new Error('Unable to connect to the server. Please try again.');
  }
};

export const finishQuestions = async (sessionId) => {
  try {
    const url = `${DJANGO_API_URL}/api/clinical/session/${sessionId}/questions-done/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Django API Error (finishQuestions):', error);
    throw new Error('Unable to finish the session. Please try again.');
  }
};
