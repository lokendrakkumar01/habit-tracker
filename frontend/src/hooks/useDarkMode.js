import { useState, useEffect } from 'react';

/**
 * Custom hook for dark/light mode toggle.
 * Reads/writes to localStorage and applies 'dark' class to <html>.
 */
export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('habitflow-theme');
    if (saved) return saved === 'dark';
    return true; // default: dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('habitflow-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('habitflow-theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
}
