import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../utils/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'system';
  });

  const getEffectiveTheme = (themeValue = theme) => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeValue === 'dark' ? 'dark' : 'light';
  };

  // Apply dark class to document.documentElement
  useEffect(() => {
    const root = window.document.documentElement;
    const effectiveTheme = getEffectiveTheme(theme);

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for OS system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme, saveToBackend = true) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Automatically persist theme change to backend if logged in
    if (saveToBackend) {
      authApi.updatePreferences({ theme: newTheme }).catch(() => {
        // Silent catch if user is unauthenticated or offline
      });
    }
  };

  const toggleTheme = (e) => {
    const effectiveTheme = getEffectiveTheme(theme);
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';

    const applyNewTheme = () => {
      setTheme(newTheme, true);
    };

    if (!document.startViewTransition || !e) {
      applyNewTheme();
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const maxRadius = Math.hypot(
      Math.max(x, right),
      Math.max(y, bottom)
    );

    const isDark = newTheme === 'dark';
    const root = document.documentElement;
    root.classList.add(isDark ? 'theme-transition-to-dark' : 'theme-transition-to-light');

    const transition = document.startViewTransition(() => {
      applyNewTheme();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: isDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        }
      );
    });

    transition.finished.then(() => {
      root.classList.remove('theme-transition-to-dark', 'theme-transition-to-light');
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, getEffectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
