import { apiFetch, storeRefreshToken, refreshAccessToken } from './apiClient';

const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || 'https://medikiosk-mmys.onrender.com';

/**
 * Admin Login
 * POST /admin/login
 * Body: { username, password }
 * Response: { "refresh_token": "..." }
 *
 * Reads refresh_token from JSON response, stores it, then exchanges
 * it for an access token via POST /api/auth/token.
 */
export const loginAdmin = async (credentials) => {
  const response = await fetch(`${SPRING_API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Admin login failed.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  // Read the refresh token from the JSON response body
  let resData = {};
  try {
    resData = await response.json();
  } catch {
    resData = {};
  }

  const refreshToken = resData.refresh_token;

  // Store the refresh token for future access-token requests
  if (refreshToken) {
    storeRefreshToken(refreshToken);
  }

  // Exchange the stored refresh token for an access token
  let token = null;
  try {
    token = await refreshAccessToken();
  } catch (err) {
    throw new Error('Admin login succeeded but could not obtain access token: ' + err.message);
  }

  return {
    success: true,
    accessToken: token,
    refreshToken,
    username: credentials.username,
  };
};

/**
 * Create New Admin User
 * POST /admin/create
 * Body: { username, password } (AdminUserCreationDto)
 */
export const createAdminUser = async (adminData) => {
  const response = await apiFetch('/admin/create', {
    method: 'POST',
    body: JSON.stringify({
      username: adminData.username.trim(),
      password: adminData.password,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to create admin user.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return { success: true, message: 'Admin user created successfully.' };
  }
};

/**
 * Delete Admin User By ID
 * DELETE /admin/delete?id=<UUID>
 */
export const deleteAdminUser = async (id) => {
  const response = await apiFetch(`/admin/delete?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorMsg = 'Failed to delete admin user.';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return { success: true, message: 'Admin user deleted.' };
  }
};

/**
 * Fetch All Admin Users
 * GET /admin/all?username=<query>
 */
export const fetchAdminUsers = async (query = '') => {
  try {
    const response = await apiFetch(`/admin/all?username=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.content || data || [];
    }
  } catch (e) {
    console.info('Failed to fetch admin users list:', e);
  }
  return [];
};
