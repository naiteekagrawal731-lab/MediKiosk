const DJANGO_API_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://medikiosk-7f7g.onrender.com';

export const createDjangoSession = async (sessionId) => {
  try {
    const response = await fetch(
      `${DJANGO_API_URL}/api/clinical/session/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}: ${response.statusText}`;

      try {
        const errJson = await response.json();
        errorMsg =
          errJson.detail ||
          errJson.message ||
          errJson.error ||
          errorMsg;
      } catch {
        // Keep default error message
      }

      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('Django API Error (createDjangoSession):', error);
    throw new Error(
      error.message ||
      'Unable to connect to Django server to create session.'
    );
  }
};

export const startClinicalSession = async (sessionId, data) => {
  try {
    const response = await fetch(
      `${DJANGO_API_URL}/api/clinical/session/${sessionId}/start/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: data.language || 'EN',
          consent_given: data.consent_given ?? true,
          treatment_type: data.treatment_type || 'GENERAL',
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}: ${response.statusText}`;

      try {
        const errJson = await response.json();
        errorMsg =
          errJson.detail ||
          errJson.message ||
          errJson.error ||
          errorMsg;
      } catch {
        // Keep default error message
      }

      throw new Error(errorMsg);
    }

    const result = await response.json();

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('Django API Error (startClinicalSession):', error);
    throw new Error(
      error.message ||
      'Unable to connect to server to start clinical interview.'
    );
  }
};

export const getNextQuestion = async (
  sessionId,
  answerData = null
) => {
  try {
    let body;
    let headers = {};

    if (
      answerData &&
      answerData.input_type === 'VOICE' &&
      answerData.audioBlob
    ) {
      const formData = new FormData();

      formData.append('input_type', 'VOICE');
      formData.append(
        'question_key',
        answerData.question_key || ''
      );
      formData.append(
        'question_text',
        answerData.question_text || ''
      );
      formData.append(
        'audio',
        answerData.audioBlob,
        'recording.wav'
      );

      body = formData;
    } else if (answerData) {
      headers['Content-Type'] = 'application/json';

      body = JSON.stringify({
        question_key: answerData.question_key || '',
        question_text: answerData.question_text || '',
        user_response: answerData.answer_text || '',
        input_type: answerData.input_type || 'TEXT',
      });
    }

    const response = await fetch(
      `${DJANGO_API_URL}/api/clinical/session/${sessionId}/next-question/`,
      {
        method: 'POST',
        headers,
        body,
      }
    );

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}: ${response.statusText}`;

      try {
        const errJson = await response.json();
        errorMsg =
          errJson.detail ||
          errJson.message ||
          errJson.error ||
          errorMsg;
      } catch {
        // Keep default error message
      }

      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('Django API Error (getNextQuestion):', error);
    throw new Error(
      error.message ||
      'Unable to connect to the server. Please try again.'
    );
  }
};

export const finishQuestions = async (sessionId) => {
  try {
    const response = await fetch(
      `${DJANGO_API_URL}/api/clinical/session/${sessionId}/questions-done/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}: ${response.statusText}`;

      try {
        const errJson = await response.json();
        errorMsg =
          errJson.detail ||
          errJson.message ||
          errJson.error ||
          errorMsg;
      } catch {
        // Keep default error message
      }

      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('Django API Error (finishQuestions):', error);
    throw new Error(
      error.message ||
      'Unable to finish the session. Please try again.'
    );
  }
};