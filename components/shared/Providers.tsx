/**
 * Providers — Wrapper global pour les contextes React
 *
 * Encapsule l'application dans :
 * 1. TanStack QueryClientProvider — cache et gestion des données serveur
 * 2. Détection online/offline
 * 3. Initialisation de l'auth store
 *
 * @module components/shared/Providers
 */

"use client";

import { useState, useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

/** Props du composant Providers */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Composant de détection de la connexion réseau.
 * Affiche un bandeau quand l'utilisateur perd la connexion.
 */
function OfflineDetector() {
  const { isOnline, setOnline } = useUIStore();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Vérifier l'état initial
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-error px-4 py-2 text-sm font-medium text-white">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728" />
      </svg>
      <span>Connexion perdue — Les modifications seront synchronisées à la reconnexion</span>
    </div>
  );
}

/**
 * Composant d'initialisation de l'authentification.
 * Vérifie si un token JWT est présent au montage.
 */
function AuthInitializer() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}

/**
 * Providers — Wrapper global qui fournit les contextes nécessaires.
 *
 * @param children - Contenu de l'application
 * @returns Application enveloppée dans les providers
 */
export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <OfflineDetector />
      {children}
    </QueryClientProvider>
  );
}
