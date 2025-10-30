import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useStyle } from '../../context/StyleProvider';
import { useAuth } from '../../context/AuthContext';
import { useFinancialData } from '../../context/FinancialDataContext';
import { User as UserIcon, Palette, Upload, Settings as SettingsIcon, Moon, Sun, Monitor, LogOut, Trash2 } from 'lucide-react';
import './settings-standalone.css';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { style, setStyle } = useStyle();
  const { user, setUser, logout } = useAuth();
  const { currency, setCurrency, salaryAmount, setSalaryAmount, monthlyExpenseAmount, setMonthlyExpenseAmount, clearUserData } = useFinancialData();

  const [activeTab, setActiveTab] = useState('profile');
  const isGlass = style === 'glass';

  const [username, setUsername] = useState(() => (user?.name || ''));
  useEffect(() => { setUsername(user?.name || ''); }, [user]);
  const profileKey = useMemo(() => `profile_picture_${username || user?.email || 'demo'}`, [username, user]);
  const [profileSrc, setProfileSrc] = useState('');
  useEffect(() => {
    try { setProfileSrc(localStorage.getItem(profileKey) || ''); } catch {}
  }, [profileKey]);

  const [tempSalaryAmount, setTempSalaryAmount] = useState(() => String(salaryAmount || 0));
  const [tempExpenseAmount, setTempExpenseAmount] = useState(() => String(monthlyExpenseAmount || 0));

  const currencyOptions = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  ];

  const handleProfileUpdate = useCallback(() => {
    const next = { ...(user || {}), name: (username || '').trim() };
    setUser(next);
    try { localStorage.setItem('user', JSON.stringify(next)); } catch {}
  }, [setUser, user, username]);

  const handleFinancialUpdate = useCallback(() => {
    const salary = parseFloat(tempSalaryAmount) || 0;
    const expense = parseFloat(tempExpenseAmount) || 0;
    setSalaryAmount(salary);
    setMonthlyExpenseAmount(expense);
  }, [tempSalaryAmount, tempExpenseAmount, setSalaryAmount, setMonthlyExpenseAmount]);

  const handleProfilePictureUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        try { localStorage.setItem(profileKey, result); } catch {}
        setProfileSrc(result);
      };
      reader.readAsDataURL(file);
    }
  }, [profileKey]);

  const handleClearData = useCallback(() => {
    const ok = window.confirm('This action cannot be undone. Clear demo settings and profile?');
    if (!ok) return;
    try {
      localStorage.removeItem('financial_data');
      localStorage.removeItem('ui_style');
      localStorage.removeItem('themePreference');
      localStorage.removeItem('username');
      localStorage.removeItem(profileKey);
    } catch {}
    setUser({ ...(user || {}), name: '' });
    setUsername('');
    setCurrency('INR');
    setSalaryAmount(0);
    setMonthlyExpenseAmount(0);
    setTempSalaryAmount('0');
    setTempExpenseAmount('0');
    setProfileSrc('');
    if (clearUserData) clearUserData();
    window.location.reload();
  }, [profileKey, setCurrency, setMonthlyExpenseAmount, setSalaryAmount, setUser, user, clearUserData]);

  const handleLogout = useCallback(() => {
    const ok = window.confirm('Logout and clear demo profile picture?');
    if (!ok) return;
    try { localStorage.removeItem(profileKey); } catch {}
    logout();
    navigate('/');
  }, [logout, navigate, profileKey]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0' }}>
      <div className={isGlass ? 'settings-container glass-card' : 'settings-container'} style={{ margin: '0', padding: '24px' }}>
        <div className="settings-title" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Settings</h1>
          <p style={{ fontSize: '14px' }}>Manage your profile, financial preferences, and app appearance.</p>
        </div>

        <div className="tabs-list" style={{ marginBottom: '24px' }}>
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <UserIcon className="icon" />
            Profile
          </button>
          <button className={`tab ${activeTab === 'ui' ? 'active' : ''}`} onClick={() => setActiveTab('ui')}>
            <Palette className="icon" />
            UI Settings
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="stack-gap">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <UserIcon className="icon" />
                  Profile Information
                </div>
                <div className="card-desc">Update your username and profile picture.</div>
              </div>
              <div className="card-content">
                <div className="avatar-row">
                  <div className="avatar">
                    {profileSrc ? (
                      <img src={profileSrc} alt="" />
                    ) : (
                      <div className="avatar-fallback">{(username || user?.email || 'U').charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="avatar-actions">
                    <label className="label">Profile Picture</label>
                    <div className="row">
                      <button className="btn btn-outline" onClick={() => document.getElementById('profile-picture')?.click()}>
                        <Upload className="icon" />
                        Upload Image
                      </button>
                      <input id="profile-picture" type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                    </div>
                  </div>
                </div>

                <div className="separator" />

                <div className="form-group">
                  <label className="label" htmlFor="username">Username</label>
                  <div className="row">
                    <input id="username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
                    <button className="btn btn-default" onClick={handleProfileUpdate}>Update</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card danger">
              <div className="card-header">
                <div className="card-title red">
                  <SettingsIcon className="icon" />
                  Account Actions
                </div>
                <div className="card-desc">Clear your data or logout from your account.</div>
              </div>
              <div className="card-content">
                <div className="row wrap">
                  <button className="btn btn-destructive" onClick={handleClearData}>
                    <Trash2 className="icon" />
                    Clear Data
                  </button>
                  <button className="btn btn-outline red" onClick={handleLogout}>
                    <LogOut className="icon" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        

        {activeTab === 'ui' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Palette className="icon" />
                Appearance
              </div>
              <div className="card-desc">Customize the app's appearance and theme.</div>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label className="label">Theme</label>
                <div className="grid-3">
                  <button className={`btn ${theme === 'light' ? 'btn-default' : 'btn-outline'} col`} onClick={() => setTheme('light')}>
                    <Sun className="icon" />
                    <span>Light</span>
                  </button>
                  <button className={`btn ${theme === 'dark' ? 'btn-default' : 'btn-outline'} col`} onClick={() => setTheme('dark')}>
                    <Moon className="icon" />
                    <span>Dark</span>
                  </button>
                  <button className={`btn ${theme === 'system' ? 'btn-default' : 'btn-outline'} col`} onClick={() => setTheme('system')}>
                    <Monitor className="icon" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Style</label>
                <div className="grid-2">
                  <button className={`btn ${style === 'normal' ? 'btn-default' : 'btn-outline'} col`} onClick={() => setStyle('normal')}>
                    <span className="style-dot normal" />
                    <span>Normal</span>
                  </button>
                  <button className={`btn ${style === 'glass' ? 'btn-default' : 'btn-outline'} col glass-option`} onClick={() => setStyle('glass')}>
                    <span className="style-dot glass" />
                    <span className="glass-text">Glass</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
