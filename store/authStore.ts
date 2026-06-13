/**
 * Auth Store — État global d'authentification (Zustand)
 *
 * Gère :
 * 1. L'utilisateur connecté (ou null)
 * 2. Le statut d'authentification (loading, authenticated, guest)
 * 3. Les actions de login, logout, register
 * 4. Le refresh du profil utilisateur
 *
 * @module store/authStore
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logout as logoutApi } from "@/fonctions_api/auth.api";
import {
  setToken,
  clearToken,
  getToken,
} from "@/lib/axios";
import { User } from "@/modeles/user";

/** Statuts d'authentification possibles */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/** Shape du store auth */
interface AuthState {

  /** Utilisateur connecté (null si déconnecté) */
  user: User | null;

  /** Statut d'authentification */
  status: AuthStatus;

  /** Définit l'utilisateur après login */
  setUser: (user: User, token: string) => void;

  /** Met à jour le profil utilisateur (sans modifier le token) */
  updateProfile: (partial: Partial<User>) => void;

  /** Déconnexion complète */
  logout: () => Promise<void>;

  /** Vérifie si un token existe (initialisation) */
  checkAuth: () => void;

  /** Reset complet du store */
  reset: () => void;

}


/**
 * Store Zustand pour l'authentification.
 * Persiste l'utilisateur en localStorage pour survivre aux rechargements.
 */
export const useAuthStore = create<AuthState>()(

  persist(

    (set, get) => ({

      user: null,
      status: "loading",

      setUser: (user, token) => {
        setToken(token);
        set({ user, status: "authenticated" });
      },

      updateProfile: (partial) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...partial } });
        }
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch {
          // On nettoie le store local même si l'API de logout échoue.
        } finally {
          clearToken();
          set({ user: null, status: "unauthenticated" });
        }
      },

      checkAuth: () => {
        const token = getToken();
        const currentUser = get().user;
        if (token && currentUser) {
          set({ status: "authenticated" });
        } else {
          clearToken();
          set({ user: null, status: "unauthenticated" });
        }
      },

      reset: () => {
        clearToken();
        set({ user: null, status: "unauthenticated" });
      },

    }),

    {
      name: "PROFIL_UTILISATEUR",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }

  )

);
