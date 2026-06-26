import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('habitflow-theme');
      if (saved) return saved === 'dark';
    } catch { /* localStorage may be unavailable in private browsing */ }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      try {
        localStorage.setItem('habitflow-theme', 'dark');
      } catch { /* localStorage may be unavailable */ }
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      try {
        localStorage.setItem('habitflow-theme', 'light');
      } catch { /* localStorage may be unavailable */ }
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
}
