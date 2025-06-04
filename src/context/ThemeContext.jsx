import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

/**
 * Obalovací komponenta, která zajišťuje:
 *  - Stav `theme` ('light' | 'dark'),
 *  - Funkce `setLight` a `setDark`,
 *  - Při změně témy se na <body> přidá odpovídající třída `theme-light` nebo `theme-dark`.
 *  - Ukládá téma do localStorage.
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
