import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Sun, Moon, CreditCard, Settings, FileText, HelpCircle, LogOut, ExternalLink } from 'lucide-react';

function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
            title={user?.email || 'Profile'}
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
                <button className="profile-menu-item" role="menuitem">
                  <CreditCard size={16} />
                  <span>Subscription</span>
                  <span className="item-meta">Free Trial</span>
                </button>
                <button className="profile-menu-item" role="menuitem" onClick={() => openSettings(setOpen)}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <a className="profile-menu-item" role="menuitem" href="#" target="_blank" rel="noreferrer">
                  <FileText size={16} />
                  <span>Terms & Policies</span>
                  <ExternalLink size={16} className="item-trail" />
                </a>
                <a className="profile-menu-item" role="menuitem" href="#" target="_blank" rel="noreferrer">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </a>
                <button className="profile-menu-item" role="menuitem" onClick={() => handleLogout()}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
              <div className="profile-menu-footer">
                <button className="danger" onClick={() => handleLogout()}>Logout</button>
                <button className="warning" onClick={handleClearData}>Clear Data</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function handleClearData() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {}
  window.location.reload();
}

function handleLogout() {
  // Use a custom event to avoid importing Auth here (keeps this function pure for testing)
  const evt = new CustomEvent('app:logout');
  window.dispatchEvent(evt);
}

function openSettings(closeMenu) {
  try { if (typeof closeMenu === 'function') closeMenu(false); } catch {}
  const evt = new CustomEvent('app:open-settings');
  window.dispatchEvent(evt);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default Header;


