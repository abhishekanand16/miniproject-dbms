import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useStyle } from '../../context/StyleProvider';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, Palette, Upload, Settings as SettingsIcon, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import axios from 'axios';
import './settings-standalone.css';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { style, setStyle } = useStyle();
  const { user, setUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const isGlass = style === 'glass';

  const [username, setUsername] = useState(() => (user?.name || ''));
  useEffect(() => { setUsername(user?.name || ''); }, [user]);
  const profileKey = useMemo(() => `profile_picture_${username || user?.email || 'demo'}`, [username, user]);
  const [profileSrc, setProfileSrc] = useState('');
  useEffect(() => {
    try { setProfileSrc(localStorage.getItem(profileKey) || ''); } catch {}
  }, [profileKey]);

  const handleProfileUpdate = useCallback(async () => {
    const trimmedName = (username || '').trim();
    if (!trimmedName) {
      alert('Username cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await axios.put('http://localhost:3001/api/profile', 
        { name: trimmedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with the response
      const updatedUser = response.data.user;
      setUser(updatedUser);
      try { localStorage.setItem('user', JSON.stringify(updatedUser)); } catch {}
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
      alert(`Error: ${errorMessage}`);
    }
  }, [setUser, username]);

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
          <p style={{ fontSize: '14px' }}>Manage your profile and app appearance.</p>
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
                <div className="card-desc">Logout from your account.</div>
              </div>
              <div className="card-content">
                <div className="row wrap">
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
