'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Hook personnalisé pour gérer le thème de l'application.
 * Synchronise l'état du store avec la classe `.dark` de l'élément racine.
 * Le thème par défaut est TOUJOURS "light" sauf si l'utilisateur l'a changé.
 */
export function useTheme() {
  const { theme, setTheme } = useUIStore();

  // ── Initialisation : lit localStorage une seule fois au montage ──────────
  useEffect(() => {
    // Migration : l'ancien Header écrivait dans "theme" (sans "-preference")
    // On récupère cette valeur si elle existe, puis on nettoie la vieille clé
    const legacyTheme = localStorage.getItem('theme');
    if (legacyTheme === 'dark' || legacyTheme === 'light') {
      localStorage.setItem('theme-preference', legacyTheme);
      localStorage.removeItem('theme');
    }

    const savedTheme = localStorage.getItem('theme-preference');
    // Si rien de sauvegardé → on reste en mode clair (valeur par défaut du store)
    // Si une préférence existe → on l'applique
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else {
      // Pas de préférence sauvegardée → forcer le mode clair
      setTheme('light');
    }
  }, [setTheme]);

  // ── Synchronisation : applique le thème sur le <html> à chaque changement ─
  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      // Couvre "light" et toute valeur inconnue → retirer la classe dark
      root.classList.remove('dark');
    }

    // Sauvegarder dans localStorage pour la persistance
    if (theme === 'dark' || theme === 'light') {
      localStorage.setItem('theme-preference', theme);
    }
  }, [theme]);

  return { theme, setTheme };
}
