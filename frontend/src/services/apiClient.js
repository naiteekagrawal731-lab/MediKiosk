const SPRING_API_URL =
  import.meta.env.VITE_SPRING_API_URL || 'https://medikiosk-mmys.onrender.com';

// ==========================================
// IN-MEMORY ACCESS TOKEN
// ==========================================

let accessToken = null;

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
// REFRESH TOKEN — sessionStorage
// ==========================================

const REFRESH_TOKEN_KEY = 'medikiosk_refresh_token';

export const storeRefreshToken = (token) => {
  if (token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const getStoredRefreshToken = () => {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) || null;
};

export const clearRefreshToken = () => {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};


// ==========================================
// HANDLE AUTH FAILURE — clear all auth state
// Called when refresh token is invalid/expired
// ==========================================

const handleAuthFailure = () => {
  clearAccessToken();
  clearRefreshToken();
  sessionStorage.removeItem('medikiosk_auth_state');
};


// ==========================================
// GET ACCESS TOKEN USING STORED REFRESH TOKEN
// POST /api/auth/token  { "refresh_token": "..." }
// ==========================================

export const refreshAccessToken = async () => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    handleAuthFailure();
    throw new Error('No refresh token available — user must log in again.');
  }

  const response = await fetch(`${SPRING_API_URL}/api/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    handleAuthFailure();
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
    handleAuthFailure();
    throw new Error('Access token not found in refresh response');
  }

  // Store access token in memory only
  setAccessToken(newAccessToken);

  return newAccessToken;
};


// ==========================================
// CENTRAL API FETCH
// Adds Authorization header, handles 401 with
// one refresh attempt. Never retries recursively.
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

  // Attach access token from memory
  const currentToken = getAccessToken();
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    // NOTE: credentials: 'include' intentionally removed.
    // Refresh token is now sent manually via JSON body — no cookies required.
  };

  let response = await fetch(url, fetchOptions);


  // ==========================================
  // 401 — attempt one token refresh, then retry
  // The /api/auth/token endpoint itself is excluded
  // from this interceptor (isRetry guard prevents loops)
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
      // refreshAccessToken() already cleared all auth state.
      // Surface the error so the caller can redirect to login.
      throw error;
    }
  }

  return response;
};