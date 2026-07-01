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
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
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
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: ResolvedTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next, resolvedTheme: next });
      },

      syncSystemTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          const resolved = getSystemTheme();
          applyTheme(resolved);
          set({ resolvedTheme: resolved });
        }
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
// Écoute prefers-color-scheme côté client
// -----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    useThemeStore.getState().syncSystemTheme();
  });
}