/**
 * UI Store — État global de l'interface (Zustand)
 *
 * Gère les états UI transversaux :
 * 1. Sidebar admin (ouvert/fermé)
 * 2. Modal de recherche
 * 3. Barre de notification offline
 * 4. Theme preference
 *
 * @module store/uiStore
 */

import { create } from "zustand";

/** Shape du store UI */
interface UIState {
  /** Sidebar admin est-elle ouverte ? */
  isSidebarOpen: boolean;
  /** Modal de recherche ouvert ? */
  isSearchExpanded: boolean;
  /** Notification panel ouvert ? */
  isNotificationPanelOpen: boolean;
  /** User profile panel ouvert ? */
  isUserProfileOpen: boolean;
  /** Notification mobile menu ouvert ? */
  isMobileMenuOpen: boolean;
  /** L'application est-elle connectée à Internet ? */
  isOnline: boolean;
  /** Thème actuel */
  theme: string;

  /* --- Actions --- */
  toggleSidebar: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
  toggleNotificationPanel: (open?: boolean) => void;
  toggleUserProfile: (open?: boolean) => void;
  toggleMobileMenu: (open?: boolean) => void;
  closeAllModals: () => void;
  setOnline: (online: boolean) => void;
  setTheme: (theme: string) => void;
}

/**
 * Store Zustand pour l'état UI global.
 */
export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  isSearchExpanded: false,
  isNotificationPanelOpen: false,
  isUserProfileOpen: false,
  isMobileMenuOpen: false,
  isOnline: true,
  theme: "system",

  toggleSidebar: (open) =>
    set((state) => ({
      isSidebarOpen: open !== undefined ? open : !state.isSidebarOpen,
    })),

  toggleSearch: (open) =>
    set((state) => ({
      isSearchExpanded: open !== undefined ? open : !state.isSearchExpanded,
    })),

  toggleNotificationPanel: (open) =>
    set((state) => ({
      isNotificationPanelOpen: open !== undefined ? open : !state.isNotificationPanelOpen,
    })),

  toggleUserProfile: (open) =>
    set((state) => ({
      isUserProfileOpen: open !== undefined ? open : !state.isUserProfileOpen,
    })),

  toggleMobileMenu: (open) =>
    set((state) => ({
      isMobileMenuOpen: open !== undefined ? open : !state.isMobileMenuOpen,
    })),

  closeAllModals: () =>
    set({
      isSearchExpanded: false,
      isNotificationPanelOpen: false,
      isUserProfileOpen: false,
      isMobileMenuOpen: false,
    }),

  setOnline: (online) => set({ isOnline: online }),

  setTheme: (theme) => set({ theme }),
}));
