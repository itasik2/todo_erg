import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { toggleTheme, isDark, isMounted } = useTheme(); // Убрали неиспользуемую переменную theme

  if (!isMounted) {
    return (
      <div className="theme-toggle-skeleton">
        <div className="theme-toggle-placeholder"></div>
      </div>
    );
  }

  return (
    <button 
      onClick={toggleTheme}
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      title={isDark ? 'Светлая тема' : 'Темная тема'}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
      <span className="theme-label">
        {isDark ? 'Темная' : 'Светлая'}
      </span>
    </button>
  );
};

export default ThemeToggle;