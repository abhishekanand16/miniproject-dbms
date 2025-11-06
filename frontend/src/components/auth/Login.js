import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle } from 'lucide-react';
import './Login.css';

// Helper function to get role-based URL prefix (matches App.js)
function getRolePrefix(role) {
  const roleMap = {
    'admin': 'admin',
    'doctor': 'doc',
    'cashier': 'cashier',
    'patient': 'patient'
  };
  return roleMap[role] || '';
}

// Helper function to get dashboard URL for a role
function getDashboardUrl(role) {
  const prefix = getRolePrefix(role);
  return prefix ? `/${prefix}` : '/login';
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      // Get the user from localStorage to determine the role
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        navigate(getDashboardUrl(user.role), { replace: true });
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/hospital-logo.svg" alt="Hospital Logo" className="login-logo" />
          <h1>Hospital Management System</h1>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Default Admin: admin@hospital.com / admin123</p>
          <Link to="/help" className="help-link">
            <HelpCircle size={16} />
            <span>Need Help?</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

