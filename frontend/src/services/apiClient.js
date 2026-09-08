const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080';

let tokenStore = {
  accessToken: null,
};

export const setAccessToken = (token) => {
  tokenStore.accessToken = token;
};

export const getAccessToken = () => {
  return tokenStore.accessToken;
};

export const clearAccessToken = () => {
  tokenStore.accessToken = null;
};

// Request refresh token when access token is expired or missing
export const refreshAccessToken = async () => {
  try {
    // Attempt POST first as requested in contract, with fallback to GET if 405 occurs
    let response = await fetch(`${SPRING_API_URL}/api/auth/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send HTTP refresh token cookie
    });

    if (response.status === 405) {
      // Fallback for GET mapping if backend maps GET /api/auth/token
      response = await fetch(`${SPRING_API_URL}/api/auth/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    }

    if (!response.ok) {
      throw new Error(`Token refresh failed with status ${response.status}`);
    }

    const data = await response.json();
    const newAccessToken = typeof data === 'string' ? data : (data.accessToken || data.access_token || data.token);

    if (!newAccessToken) {
      throw new Error('Access token not found in refresh response');
    }

    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    clearAccessToken();
    throw error;
  }
};

// Centralized authenticated fetch client
export const apiFetch = async (endpoint, options = {}, isRetry = false) => {
  const url = endpoint.startsWith('http') ? endpoint : `${SPRING_API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const currentToken = getAccessToken();
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are included
  };

  let response = await fetch(url, fetchOptions);

  // If unauthorized (401) and not already retrying, attempt token refresh once
  if (response.status === 401 && !isRetry) {
    try {
      const newToken = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (refreshErr) {
      console.warn('Token refresh failed during API call retry:', refreshErr);
      return response;
    }
  }

  return response;
};
