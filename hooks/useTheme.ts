'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Hook personnalisé pour gérer le thème de l'application.
 * Synchronise l'état du store avec l'attribut data-theme de l'élément racine.
 */
export function useTheme() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Pour Tailwind v4 / standard dark mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Pour DaisyUI ou autres systèmes utilisant data-theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Sauvegarder dans localStorage pour la persistance si nécessaire
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  // Initialisation au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  return { theme, setTheme };
}
