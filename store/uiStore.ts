/**
 * UI Store — État global de l'interface (Zustand)
 *
 * Gère les états UI transversaux :
 * 1. Sidebar admin (ouvert/fermé)
 * 2. Modal de recherche
 * 3. Barre de notification offline
 * 4. Theme preference
 * 5. [PAYMENT] Référence commande courante (pour récupération post-PayDunya)
 * 6. [PAYMENT] Flag inCommandFlow (recharge wallet depuis tunnel commande)
 *
 * @module store/uiStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  /** ID du produit actuellement sélectionné pour optimiser le chargement de la page détail */
  activeProductId: string | null;

  /**
   * [PAYMENT] Référence de la commande en cours de paiement via PayDunya.
   * Stockée avant la redirection PayDunya afin de la récupérer sur la page
   * de succès/échec lorsque PayDunya ne transmet pas la référence en paramètre.
   * Doit être nettoyée après utilisation pour éviter les rémanences.
   */
  paymentOrderRef: string | null;

  /**
   * [PAYMENT] Indique que la recharge wallet a été initiée depuis le tunnel
   * de commande (solde insuffisant). Permet à la page wallet/success de
   * rediriger automatiquement vers /commandes plutôt que vers /customer/wallet.
   */
  inCommandFlow: boolean;

  /* --- Actions --- */
  toggleSidebar: (open?: boolean) => void;
  toggleSearch: (open?: boolean) => void;
  toggleNotificationPanel: (open?: boolean) => void;
  toggleUserProfile: (open?: boolean) => void;
  toggleMobileMenu: (open?: boolean) => void;
  closeAllModals: () => void;
  setOnline: (online: boolean) => void;
  setTheme: (theme: string) => void;
  setActiveProductId: (id: string | null) => void;

  /** Stocke la référence commande avant redirection PayDunya */
  setPaymentOrderRef: (ref: string | null) => void;

  /** Active/désactive le flag de recharge depuis le tunnel commande */
  setInCommandFlow: (value: boolean) => void;
}

/**
 * Store Zustand pour l'état UI global.
 * Persisté en localStorage pour survivre aux redirections PayDunya
 * (clés payment uniquement).
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isSearchExpanded: false,
      isNotificationPanelOpen: false,
      isUserProfileOpen: false,
      isMobileMenuOpen: false,
      isOnline: true,
      theme: "light",
      activeProductId: null,
      paymentOrderRef: null,
      inCommandFlow: false,

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

      setActiveProductId: (id) => set({ activeProductId: id }),

      setPaymentOrderRef: (ref) => set({ paymentOrderRef: ref }),

      setInCommandFlow: (value) => set({ inCommandFlow: value }),
    }),
    {
      name: "ui-store",
      // On ne persiste que les champs liés au paiement, pas les états UI volatils
      partialize: (state) => ({
        paymentOrderRef: state.paymentOrderRef,
        inCommandFlow: state.inCommandFlow,
      }),
    }
  )
);
