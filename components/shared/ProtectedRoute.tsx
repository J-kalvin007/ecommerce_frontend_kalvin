/**
 * ProtectedRoute — HOC pour protéger les pages authentifiées
 *
 * Redirige vers /auth/login si l'utilisateur n'est pas connecté.
 *
 * @module components/shared/ProtectedRoute
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface Props {
  children: React.ReactNode;
  /** URL de redirection si non authentifié */
  fallback?: string;
}

/**
 * ProtectedRoute — Wrapper pour les pages nécessitant une authentification.
 */
export default function ProtectedRoute({ children, fallback = "/auth/login" }: Props) {
  const router = useRouter();
  const { status } = useAuthStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(fallback);
    }
  }, [status, router, fallback]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-border border-t-primary" />
          <p className="text-sm text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
