/**
 * TanStack Query — Configuration globale du client de cache
 *
 * Stratégie de cache par type de données :
 * - Produits catalogue : staleTime 5 min (données peu volatiles)
 * - Solde wallet : staleTime 30 sec (données sensibles en temps réel)
 * - Pages statiques : staleTime 1 heure (ISR-like)
 * - Données utilisateur : staleTime 2 min
 *
 * @module lib/queryClient
 */

import { QueryClient } from "@tanstack/react-query";

/** Durées de cache constantes (en millisecondes) */
export const CACHE_TIMES = {
  /** Produits et catalogue — 5 minutes */
  PRODUCTS: 5 * 60 * 1000,
  /** Solde wallet — 30 secondes */
  WALLET: 30 * 1000,
  /** Données utilisateur — 2 minutes */
  USER: 2 * 60 * 1000,
  /** Pages statiques — 1 heure */
  STATIC: 60 * 60 * 1000,
  /** Commandes — 1 minute */
  ORDERS: 60 * 1000,
  /** Notifications — 30 secondes */
  NOTIFICATIONS: 30 * 1000,
} as const;

/**
 * Crée une nouvelle instance de QueryClient avec les paramètres par défaut.
 *
 * @returns Instance QueryClient configurée
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_TIMES.PRODUCTS,
        gcTime: 10 * 60 * 1000, // Garbage collection après 10 min
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/** Singleton QueryClient pour l'application */
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Récupère le QueryClient (crée une nouvelle instance côté serveur,
 * réutilise le singleton côté navigateur).
 *
 * @returns QueryClient singleton
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Côté serveur : toujours créer un nouveau client
    return makeQueryClient();
  }
  // Côté client : réutiliser le singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
