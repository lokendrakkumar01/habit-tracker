import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('habitflow-theme');
      if (saved) return saved === 'dark';
    } catch {}
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      try {
        localStorage.setItem('habitflow-theme', 'dark');
      } catch {}
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      try {
        localStorage.setItem('habitflow-theme', 'light');
      } catch {}
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
}
