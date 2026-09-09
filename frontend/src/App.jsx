import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Patient Kiosk Pages
import { WelcomePage } from './pages/WelcomePage';
import { LanguagePage } from './pages/LanguagePage';
import { ConsentPage } from './pages/ConsentPage';
import { RegisterPage } from './pages/RegisterPage';
import { TreatmentPage } from './pages/TreatmentPage';
import { InterviewPage } from './pages/InterviewPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { RedFlagPage } from './pages/RedFlagPage';
import { PatientAccountPage } from './pages/PatientAccountPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin & Staff Pages
import { MainAdminPage } from './pages/MainAdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { StaffLandingPage } from './pages/StaffLandingPage';
import { HospitalLoginPage } from './pages/HospitalLoginPage';
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            {/* Patient Kiosk Flow */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/session/:sessionId/language" element={<LanguagePage />} />
            <Route path="/session/:sessionId/consent" element={<ConsentPage />} />
            <Route path="/session/:sessionId/register" element={<RegisterPage />} />
            <Route path="/session/:sessionId/treatment" element={<TreatmentPage />} />
            <Route path="/session/:sessionId/interview" element={<InterviewPage />} />
            <Route path="/session/:sessionId/thank-you" element={<ThankYouPage />} />
            <Route path="/session/:sessionId/red-flag" element={<RedFlagPage />} />

            {/* Patient Portal */}
            <Route path="/patient/account" element={<PatientAccountPage />} />
            <Route path="/patient/login" element={<PatientAccountPage />} />
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <PatientDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Main Admin Login & Dashboard */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['MAIN_ADMIN']}>
                  <MainAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Staff Portal Landing */}
            <Route path="/staff" element={<StaffLandingPage />} />

            {/* Hospital Admin Login & Dashboard */}
            <Route path="/hospital/login" element={<HospitalLoginPage />} />
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']}>
                  <HospitalDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Doctor Login & Dashboard */}
            <Route path="/doctor/login" element={<DoctorLoginPage />} />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/session/:sessionId"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 & Fallback */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
