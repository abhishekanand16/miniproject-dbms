import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('username') || '';
    setUser(storedUser);
  }, []);

  const updateUsername = useCallback((name) => {
    setUser(name);
    localStorage.setItem('username', name);
  }, []);

  const updateProfilePicture = useCallback((dataUrl) => {
    if (!user) return;
    localStorage.setItem(`profile_picture_${user}`, dataUrl);
  }, [user]);

  const logout = useCallback(() => {
    // Clear auth-like keys while keeping profile picture for other usernames
    localStorage.removeItem('username');
    setUser('');
    // clear cookies if any (best-effort)
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    }
  }, []);

  const value = useMemo(() => ({ user, updateUsername, updateProfilePicture, logout }), [user, updateUsername, updateProfilePicture, logout]);

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}



