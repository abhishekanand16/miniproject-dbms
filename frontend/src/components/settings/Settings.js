import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, CreditCard } from 'lucide-react';

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [tab, setTab] = useState('profile');
  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('currency') || 'INR'; } catch { return 'INR'; }
  });
  const [uiStyle, setUiStyle] = useState(() => {
    try { return localStorage.getItem('uiStyle') || 'normal'; } catch { return 'normal'; }
  });

  const userInitial = useMemo(() => (user?.name || user?.email || '?').trim()[0]?.toUpperCase() || 'U', [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { ...user, name };
    try {
      localStorage.setItem('user', JSON.stringify(updated));
    } catch {}
    setUser(updated);
  };

  const applyUiStyle = (style) => {
    setUiStyle(style);
    try { localStorage.setItem('uiStyle', style); } catch {}
    document.documentElement.setAttribute('data-style', style);
  };

  const saveCurrency = (next) => {
    setCurrency(next);
    try { localStorage.setItem('currency', next); } catch {}
  };

  return (
    <div className="content-card">
      <h2>Settings</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: 8, borderRadius: 10, border: '1px solid var(--border)', margin: '8px 0 20px' }}>
        <button className={`secondary-button ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserIcon size={16} /> Profile
        </button>
        <button className={`secondary-button ${tab === 'financial' ? 'active' : ''}`} onClick={() => setTab('financial')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={16} /> Financial
        </button>
        <button className={`secondary-button ${tab === 'ui' ? 'active' : ''}`} onClick={() => setTab('ui')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingsIcon size={16} /> UI Settings
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div style={{ display: 'grid', gap: 24 }}>
          <section className="content-card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Profile Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '9999px', background: 'var(--elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {userInitial}
              </div>
              <button className="secondary-button">Upload Image</button>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Username</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  <button type="submit" className="primary-button">Update</button>
                </div>
              </div>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <UserIcon size={16} /> <span>{user?.email}</span>
            </div>
          </section>

          <section className="content-card" style={{ padding: 20, border: '1px solid rgba(239,68,68,0.4)' }}>
            <h3 style={{ marginBottom: 12, color: '#ef4444' }}>Account Actions</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="primary-button" style={{ background: '#b91c1c' }} onClick={() => { localStorage.clear(); alert('Local data cleared'); }}>Clear Data</button>
              <button className="logout-button" onClick={logout} style={{ width: 'auto' }}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Financial Tab */}
      {tab === 'financial' && (
        <div className="content-card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Financial Preferences</h3>
          <div className="form-group">
            <label>Currency</label>
            <select className="form-input" style={{ width: 'auto' }} value={currency} onChange={(e) => saveCurrency(e.target.value)}>
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Saved locally; used across dashboards.</p>
        </div>
      )}

      {/* UI Settings Tab */}
      {tab === 'ui' && (
        <div className="content-card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Appearance</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <button className="secondary-button" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Toggle Theme
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>Current: {theme}</span>
          </div>
          <h4 style={{ margin: '8px 0' }}>Style</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`secondary-button ${uiStyle === 'normal' ? 'active' : ''}`} onClick={() => applyUiStyle('normal')}>Normal</button>
            <button className={`secondary-button ${uiStyle === 'glass' ? 'active' : ''}`} onClick={() => applyUiStyle('glass')}>Glass</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;


