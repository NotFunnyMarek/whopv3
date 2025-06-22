import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

/**
 * Wrapper component that provides:
 *  - `theme` state ('light' | 'dark'),
 *  - `setLight` and `setDark` functions,
 *  - Adds the corresponding class `theme-light` or `theme-dark` to the <body> on theme change,
 *  - Persists the selected theme to localStorage.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('app-theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    window.localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setLight = () => setTheme('light');
  const setDark  = () => setTheme('dark');

  return (
    <ThemeContext.Provider value={{ theme, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
