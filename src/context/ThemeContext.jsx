import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mmmcoin_theme') || 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.background = '#060708';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.background = '#f0f2f5';
    }
    try { localStorage.setItem('mmmcoin_theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// CSS-variable helper — call this hook in each page root div
export function usePageBg() {
  const { theme } = useTheme();
  return {
    page:   theme === 'dark' ? 'bg-[#060708] text-white'         : 'bg-[#f0f2f5] text-gray-900',
    header: theme === 'dark' ? 'bg-[#060708]/90 border-white/5'  : 'bg-white/90 border-gray-200',
    card:   theme === 'dark' ? 'bg-[#0b0e11] border-white/5'     : 'bg-white border-gray-200',
    cardAlt:theme === 'dark' ? 'bg-white/[0.02] border-white/5'  : 'bg-gray-50 border-gray-200',
    input:  theme === 'dark' ? 'bg-black border-white/8 text-white placeholder-gray-600' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400',
    sub:    theme === 'dark' ? 'text-gray-500'  : 'text-gray-500',
    muted:  theme === 'dark' ? 'text-gray-600'  : 'text-gray-400',
    divider:theme === 'dark' ? 'border-white/5' : 'border-gray-200',
    nav:    theme === 'dark' ? 'bg-[#060708]/95 border-white/5'  : 'bg-white/95 border-gray-200',
    row:    theme === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50',
  };
}
