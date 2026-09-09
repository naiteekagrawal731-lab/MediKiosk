const SPRING_API_URL =
  import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080';

let accessToken = null;

// Store access token only in memory
export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};


// ==========================================
// GET ACCESS TOKEN USING REFRESH TOKEN COOKIE
// ==========================================
export const refreshAccessToken = async () => {
  const response = await fetch(`${SPRING_API_URL}/api/auth/token`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    clearAccessToken();
    throw new Error(
      `Token refresh failed with status ${response.status}`
    );
  }

  const data = await response.json();

  const newAccessToken =
    typeof data === 'string'
      ? data
      : data.accessToken ||
        data.access_token ||
        data.token;

  if (!newAccessToken) {
    clearAccessToken();
    throw new Error('Access token not found in refresh response');
  }

  // Store access token in memory
  setAccessToken(newAccessToken);

  console.log('Access token obtained successfully');

  return newAccessToken;
};


// ==========================================
// CENTRAL API FETCH
// ==========================================
export const apiFetch = async (
  endpoint,
  options = {},
  isRetry = false
) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${SPRING_API_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Get access token from memory
  const currentToken = getAccessToken();

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, fetchOptions);


  // ==========================================
  // ACCESS TOKEN EXPIRED
  // ==========================================
  if (response.status === 401 && !isRetry) {
    try {
      const newToken = await refreshAccessToken();

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      response = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
      });

    } catch (error) {
      console.error(
        'Unable to refresh access token:',
        error
      );
    }
  }

  return response;
};