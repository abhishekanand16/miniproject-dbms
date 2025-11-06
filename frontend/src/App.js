import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import PatientDashboard from './components/patient/Dashboard';
import DoctorDashboard from './components/doctor/Dashboard';
import CashierDashboard from './components/cashier/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import Help from './components/Help';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import { StyleProvider } from './context/StyleProvider';

// Helper function to get role-based URL prefix
function getRolePrefix(role) {
  const roleMap = {
    'admin': 'admin',
    'doctor': 'doc',
    'cashier': 'cashier',
    'patient': 'patient'
  };
  return roleMap[role] || '';
}

// Helper function to get dashboard URL for a role (defaults to overview/dashboard)
function getDashboardUrl(role) {
  const prefix = getRolePrefix(role);
  if (!prefix) return '/login';
  // Admin defaults to overview, others to dashboard
  if (role === 'admin') return `/${prefix}/overview`;
  return `/${prefix}/dashboard`;
}

// Helper function to get settings URL for a role
function getSettingsUrl(role) {
  const prefix = getRolePrefix(role);
  return prefix ? `/${prefix}/settings` : '/login';
}

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
      <Routes>
        <Route path="/help" element={<Help />} />
        {(!user) ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to={getDashboardUrl(user.role)} replace />} />
            
            {/* Admin routes - all tabs have their own routes */}
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/admin/overview" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/billing" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Doctor routes */}
            <Route path="/doc" element={<Navigate to="/doc/dashboard" replace />} />
            <Route path="/doc/dashboard" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doc/settings" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Cashier routes */}
            <Route path="/cashier" element={<Navigate to="/cashier/dashboard" replace />} />
            <Route path="/cashier/dashboard" element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <CashierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/cashier/settings" element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <CashierDashboard />
              </ProtectedRoute>
            } />
            
            {/* Patient routes */}
            <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/settings" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            
            {/* Legacy route redirects for backward compatibility */}
            <Route path="/dashboard" element={<Navigate to={getDashboardUrl(user.role)} replace />} />
            <Route path="/settings" element={<Navigate to={getSettingsUrl(user.role)} replace />} />
            
            {/* Default redirect based on role */}
            <Route path="*" element={<Navigate to={getDashboardUrl(user.role)} replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <StyleProvider>
          <AuthProvider>
            <ConditionalHeader />
            <AppRoutes />
          </AuthProvider>
        </StyleProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

function ConditionalHeader() {
  const location = useLocation();
  const { user } = useAuth();
  // Hide header on login and help pages
  if (location.pathname === '/login' || location.pathname === '/help') return null;
  // Only show header if user is logged in
  if (!user) return null;
  return <Header />;
}
