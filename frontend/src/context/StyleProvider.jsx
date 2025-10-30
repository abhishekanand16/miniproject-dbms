import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const StyleContext = createContext(null);

export function StyleProvider({ children }) {
  const [style, setStyle] = useState('normal');

  useEffect(() => {
    const stored = localStorage.getItem('ui_style');
    if (stored) setStyle(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('ui_style', style);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-style', style);
    }
  }, [style]);

  const value = useMemo(() => ({ style, setStyle }), [style]);

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>;
}

export function useStyle() {
  const ctx = useContext(StyleContext);
  if (!ctx) throw new Error('useStyle must be used within StyleProvider');
  return ctx;
}



