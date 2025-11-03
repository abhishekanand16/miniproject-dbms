import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Sun, Moon, FileText, HelpCircle, LogOut, ExternalLink, Settings } from 'lucide-react';

function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.name || 'Hospital Management System';

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="app-header glass-surface">
      <div className="header-left">
        <img src="/hospital-logo.svg" alt="Hospital Logo" className="header-logo" />
        <span className="app-title">{displayName}</span>
      </div>
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="profile-wrapper" ref={menuRef}>
          <button
            className="avatar"
            title={`${user?.name || 'User'} (${user?.email || ''})`}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <User size={20} />
            <span className="status-dot" />
          </button>
          {open && (
            <div className="profile-menu glass-surface" role="menu">
              <div className="profile-menu-header">
                <div className="profile-avatar-large">
                  <User size={24} />
                  <span className="status-dot status-dot-lg" />
                </div>
                <div>
                  <div className="profile-name">{user?.name || 'Hii'}</div>
                  <div className="profile-role">{user?.role ? capitalize(user.role) : 'Prompt Engineer'}</div>
                </div>
              </div>
              <div className="profile-menu-section">
                <Link 
                  className="profile-menu-item" 
                  role="menuitem" 
                  to={user?.role ? `/${user.role === 'admin' ? 'admin' : user.role === 'doctor' ? 'doc' : user.role}/settings` : '/settings'} 
                  onClick={() => setOpen(false)}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <a className="profile-menu-item" role="menuitem" href="#" target="_blank" rel="noreferrer">
                  <FileText size={16} />
                  <span>Terms & Policies</span>
                  <ExternalLink size={16} className="item-trail" />
                </a>
                <Link className="profile-menu-item" role="menuitem" to="/help" onClick={() => setOpen(false)}>
                  <HelpCircle size={16} />
                  <span>Help</span>
                </Link>
                <button className="profile-menu-item" role="menuitem" onClick={() => { setOpen(false); handleLogout(logout, navigate); }}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
              <div className="profile-menu-footer">
                <button className="danger" onClick={() => { setOpen(false); handleLogout(logout, navigate); }}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function handleLogout(logoutFn, navigateFn) {
  if (logoutFn) {
    logoutFn();
    if (navigateFn) {
      navigateFn('/login');
    }
  } else {
    // Fallback to custom event if logout function not provided
    const evt = new CustomEvent('app:logout');
    window.dispatchEvent(evt);
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default Header;


