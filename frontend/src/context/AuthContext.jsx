import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  storeRefreshToken,
  clearRefreshToken,
  apiFetch,
} from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const saved = sessionStorage.getItem('medikiosk_auth_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.accessToken) {
          setAccessToken(parsed.accessToken);
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved auth state:', e);
      }
    }
    return {
      isAuthenticated: false,
      user: null,
      role: null,
      accessToken: null,
    };
  });

  const [loading, setLoading] = useState(false);

  // Sync access token to apiClient state on init or update
  useEffect(() => {
    if (authState.accessToken) {
      setAccessToken(authState.accessToken);
    }
  }, [authState.accessToken]);

  /**
   * Call after a successful login.
   * Stores refresh token in sessionStorage and access token in memory + sessionStorage.
   *
   * @param {{ role: string, username: string, accessToken: string, refreshToken?: string }} param
   */
  const loginUser = ({ role, username, accessToken, refreshToken }) => {
    // Store the refresh token in sessionStorage for future access-token requests
    if (refreshToken) {
      storeRefreshToken(refreshToken);
    }

    const resolvedToken = accessToken || getAccessToken();

    const nextState = {
      isAuthenticated: true,
      user: { username },
      role,
      accessToken: resolvedToken,
    };

    setAccessToken(resolvedToken);
    setAuthState(nextState);
    sessionStorage.setItem('medikiosk_auth_state', JSON.stringify(nextState));
  };

  /**
   * Clears all authentication state.
   * Does NOT touch localStorage (device registration number is preserved).
   */
  const logoutUser = () => {
    clearAccessToken();
    clearRefreshToken();
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
      accessToken: null,
    });
    sessionStorage.removeItem('medikiosk_auth_state');
  };

  const changeUserPassword = async (newPassword) => {
    if (!newPassword || !newPassword.trim()) {
      throw new Error('New password cannot be empty.');
    }

    const response = await apiFetch('/api/changepassword', {
      method: 'POST',
      body: JSON.stringify({ newPassword: newPassword.trim() }),
    });

    if (!response.ok) {
      let errMsg = 'Failed to change password.';
      try {
        const errData = await response.json();
        errMsg = errData.message || errData.error || errMsg;
      } catch {
        const text = await response.text();
        if (text) errMsg = text;
      }
      throw new Error(errMsg);
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        role: authState.role,
        accessToken: authState.accessToken,
        loginUser,
        logoutUser,
        changeUserPassword,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
