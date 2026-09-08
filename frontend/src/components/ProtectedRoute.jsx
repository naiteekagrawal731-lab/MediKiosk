import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to staff portal if accessing staff/admin features
    return <Navigate to="/staff" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Authenticated but wrong role -> redirect to role home
    if (role === 'HOSPITAL_ADMIN') {
      return <Navigate to="/hospital/dashboard" replace />;
    } else if (role === 'MAIN_ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (role === 'PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    return <Navigate to="/staff" replace />;
  }

  return children;
};
