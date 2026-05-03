// contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    // 초기값: 로컬스토리지 확인 혹은 시스템 설정 확인
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement; // <html> 태그
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
