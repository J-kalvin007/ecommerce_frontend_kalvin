

// lib/axios.ts
/**
 * Axios — Configuration HTTP pour le backend Django DRF
 *
 * Deux instances :
 * - apiPublic  : pour les endpoints publics (connexion, inscription, etc.)
 * - apiPrivate : pour les endpoints authentifiés (injection automatique du token)
 *
 * Gestion du token : Stocké en mémoire (Zustand/Axios), plus de localStorage.
 *
 * @module lib/axios
 */

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import CryptoJS from "crypto-js";

/** URL de base de l'API Django (variable d'environnement) */
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "https://outrage-dealer-entrap.ngrok-free.dev";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Clé d'encryption pour sécuriser les tokens côté client */
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  "atelier-du-terroir-secure-key-2026-v1";

/** Clé de stockage du token d'authentification */
const AUTH_TOKEN_KEY = "AUTH_TOKEN_KEY";

/* ============================================================
   Helpers de chiffrement / déchiffrement (Sécurité Maximale)
   ============================================================ */
const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (ciphertext: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || null;
  } catch {
    return null;
  }
};

/* ============================================================
   Gestion du token (lecture / écriture / suppression dans localStorage)
   ============================================================ */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const encrypted = localStorage.getItem(AUTH_TOKEN_KEY);
  console.log("🔐🔐🔐 Encrypted token:", encrypted);
  if (!encrypted) return null;
  const decrypted = decryptData(encrypted);
  console.log("🔓🔓🔓 Decrypted token:", decrypted);
  return decrypted;
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, encryptData(token));
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/* ============================================================
   Instance pour les API publiques (aucun token, pas d'intercepteur)
   ============================================================ */
export const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  }
});

/* ============================================================
   Instance pour les API privées (avec token automatique)
   ============================================================ */
export const apiPrivate = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/**
 * Intercepteur de requête pour apiPrivate : injection du token DRF
 * sauf pour certaines routes d'authentification explicites (optionnel).
 */
apiPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    console.log("🔓🔓🔓 Decrypted token:", token);
    // On injecte le token s'il existe (sauf si on veut absolument exclure certaines routes)
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Intercepteur de réponse pour apiPrivate :
 * - 401 Unauthorized → suppression du token + redirection vers login
 */
apiPrivate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status === 401) {
      // Exclure les routes d'authentification pour éviter des boucles
      const authRoutes = [
        "/api/connexion/",
        "/api/registration/",
        "/api/auth/login/",
        "/api/auth/logout/",
        "/api/auth/registration/",
        "/api/auth/registration/resend-email/",
        "/api/auth/registration/verify-email/",
        "/api/auth/password/change/",
        "/api/auth/password/reset/",
        "/api/auth/password/reset/confirm/",
      ];
      const isAuthRoute = authRoutes.some((route) =>
        originalRequest.url?.includes(route)
      );

      if (!isAuthRoute) {
        clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// /* ============================================================
//    Instance par défaut (pour compatibilité avec le code existant)
//    → On exporte l'instance privée par défaut, mais on recommande
//      d'utiliser explicitement apiPublic ou apiPrivate.
//    ============================================================ */
const api = apiPrivate;
export default api;