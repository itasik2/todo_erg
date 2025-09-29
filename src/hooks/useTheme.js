import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (systemPrefersDark ? 'dark' : 'light');
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    setTimeout(() => {
      document.documentElement.classList.add('theme-transition');
    }, 100);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, []);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, []);

  return {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isMounted
  };
};