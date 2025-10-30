import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: (_t) => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  // preference: 'light' | 'dark' | 'system'
  const [preference, setPreference] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('themePreference') : null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  });

  // resolved theme applied to DOM: 'light' | 'dark'
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    function resolve() {
      if (preference === 'light' || preference === 'dark') return preference;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    const resolved = resolve();
    setThemeState(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    try {
      window.localStorage.setItem('themePreference', preference);
    } catch {}
  }, [preference]);

  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handler = () => {
      if (preference === 'system') {
        const resolved = mq && mq.matches ? 'dark' : 'light';
        setThemeState(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      }
    };
    if (mq && mq.addEventListener) mq.addEventListener('change', handler);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', handler);
    };
  }, [preference]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next) => setPreference(next),
      toggleTheme: () => setPreference((p) => (p === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}


