import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/auth/Login';
import PatientDashboard from './components/patient/Dashboard';
import DoctorDashboard from './components/doctor/Dashboard';
import CashierDashboard from './components/cashier/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import Settings from './components/settings/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <SettingsEventBridge />
      {(!user) ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            user.role === 'patient' ? <PatientDashboard /> :
            user.role === 'doctor' ? <DoctorDashboard /> :
            user.role === 'cashier' ? <CashierDashboard /> :
            user.role === 'admin' ? <AdminDashboard /> :
            <Navigate to="/login" />
          } />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Header />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

function SettingsEventBridge() {
  const navigate = useNavigate();
  React.useEffect(() => {
    function onOpen() { navigate('/settings'); }
    window.addEventListener('app:open-settings', onOpen);
    return () => window.removeEventListener('app:open-settings', onOpen);
  }, [navigate]);
  return null;
}
