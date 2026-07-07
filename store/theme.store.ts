/**
 * @file store/theme.store.ts
 * @description Store Zustand pour la gestion du thème dark/light/system.
 * - Persistance dans localStorage (clé `gc-theme`)
 * - Écoute prefers-color-scheme pour le mode `system`
 * - Application automatique de `data-theme` sur <html>
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  /** Préférence explicite de l'utilisateur */
  theme: Theme;
  /** Thème effectivement appliqué (résolu depuis `system` si nécessaire) */
  resolvedTheme: ResolvedTheme;

  /** Définit le thème préféré */
  setTheme: (theme: Theme) => void;
  /** Bascule entre light et dark (ignore system) */
  toggleTheme: () => void;
  /** Met à jour resolvedTheme selon la préférence système actuelle */
  syncSystemTheme: () => void;
}

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------

function getSystemTheme(): ResolvedTheme {
  return 'light'; // Forcé en light pour la production
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return 'light'; // Forcé en light
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', 'light');
  root.classList.remove('dark');
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      resolvedTheme: 'light',

      setTheme: (theme: Theme) => {
        // Désactivé pour la production - Thème light forcé
      },

      toggleTheme: () => {
        // Désactivé pour la production - Thème light forcé
      },

      syncSystemTheme: () => {
        // Désactivé pour la production - Thème light forcé
      },
    }),
    {
      name: 'gc-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Réappliquer le thème après hydratation
        const resolved = resolveTheme(state.theme);
        applyTheme(resolved);
        state.resolvedTheme = resolved;
      },
    }
  )
);

// -----------------------------------------------------------------------------
// Écoute prefers-color-scheme côté client (Désactivé)
// -----------------------------------------------------------------------------
// if (typeof window !== 'undefined') {
//   const mq = window.matchMedia('(prefers-color-scheme: dark)');
//   mq.addEventListener('change', () => {
//     useThemeStore.getState().syncSystemTheme();
//   });
// }