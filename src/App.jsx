import React, { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import SearchAndFilter from './components/SearchAndFilter';
import FilterSidebar from './components/FilterSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import PharmacyDetails from './components/PharmacyDetails';

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Lazy load pages for code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ScannerPage = React.lazy(() => import('./pages/ScannerPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('./pages/UnauthorizedPage'));

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 dark:border-emerald-900 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/resetpassword/:resettoken"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scanner"
            element={
              <ProtectedRoute>
                <ScannerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all route - must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </AnimatePresence>
  );
}

function ToasterWrapper() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark
            ? 'rgba(17, 24, 39, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          color: isDark ? '#ffffff' : '#1f2937',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isDark
            ? '1px solid rgba(52, 211, 153, 0.15)'
            : '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: isDark
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(52, 211, 153, 0.1)'
            : '0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(16, 185, 129, 0.05)',
          minWidth: '340px',
          maxWidth: '500px',
          fontWeight: '500',
          fontSize: '15px',
          lineHeight: '1.6',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: isDark ? '#111827' : '#ffffff',
          },
          style: {
            background: isDark
              ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(236, 253, 245, 0.95) 100%)',
            border: isDark
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: isDark
              ? '0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.2)'
              : '0 20px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: isDark ? '#111827' : '#ffffff',
          },
          style: {
            background: isDark
              ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 242, 242, 0.95) 100%)',
            border: isDark
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: isDark
              ? '0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.2)'
              : '0 20px 25px -5px rgba(239, 68, 68, 0.25), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.1)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3B82F6',
            secondary: isDark ? '#111827' : '#ffffff',
          },
          style: {
            background: isDark
              ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(239, 246, 255, 0.95) 100%)',
            border: isDark
              ? '1px solid rgba(59, 130, 246, 0.3)'
              : '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: isDark
              ? '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)'
              : '0 20px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
          },
        },
      }}
      containerStyle={{
        top: 80,
        zIndex: 9999,
      }}
    />
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <ToasterWrapper />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;