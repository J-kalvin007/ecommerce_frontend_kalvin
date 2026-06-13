// /**
//  * Axios — Instance HTTP configurée pour le backend Django DRF
//  *
//  * Responsabilités :
//  * 1. Base URL et headers par défaut
//  * 2. Intercepteur Token Auth : injection automatique du token DRF
//  * 3. Gestion d'erreurs centralisée
//  * 4. Gestion d'erreurs centralisée
//  *
//  * @module lib/axios
//  */

// import axios, {
//   type AxiosError,
//   type InternalAxiosRequestConfig,
// } from "axios";
// import CryptoJS from "crypto-js";

// /** URL de base de l'API Django (variable d'environnement) */
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "https://shed-croak-unending.ngrok-free.dev";

// /** Clé d'encryption pour sécuriser les tokens côté client */
// const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "atelier-du-terroir-secure-key-2026-v1";

// /** Clé de stockage du token d'authentification */
// const AUTH_TOKEN_KEY = "Atelier du terroir_auth_token";

// /** Fonction utilitaire pour chiffrer une valeur */
// const encryptData = (data: string): string => {
//   return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
// };

// /** Fonction utilitaire pour déchiffrer une valeur */
// const decryptData = (ciphertext: string): string | null => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
//     const originalText = bytes.toString(CryptoJS.enc.Utf8);
//     return originalText || null;
//   } catch {
//     return null;
//   }
// };

// /**
//  * Instance Axios principale — utilisée par toutes les fonctions API.
//  *
//  * @example
//  * import api from "@/lib/axios";
//  * const { data } = await api.get("/products/");
//  */
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// /* ============================================================
//    Helpers — Gestion des tokens en localStorage
//    ============================================================ */

// /** Récupère le token depuis le localStorage */
// export function getToken(): string | null {
//   if (typeof window === "undefined") return null;
//   const encrypted = localStorage.getItem(AUTH_TOKEN_KEY);
//   if (!encrypted) return null;
//   return decryptData(encrypted);
// }

// /** Stocke le token d'authentification de manière chiffrée */
// export function setToken(token: string): void {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(AUTH_TOKEN_KEY, encryptData(token));
// }

// /** Supprime le token (logout, session expirée) */
// export function clearToken(): void {
//   if (typeof window === "undefined") return;
//   localStorage.removeItem(AUTH_TOKEN_KEY);
// }

// /* ============================================================
//    Intercepteur de requête — Injection du Token DRF
//    ==================9========================================== */

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = getToken();
//     const publicAuthRoutes = [
//       "/api/connexion/",
//       "/api/registration/",
//       "/api/auth/registration/",
//       "/api/auth/registration/resend-email/",
//       "/api/auth/registration/verify-email/",
//       "/api/auth/password/reset/",
//       "/api/auth/password/reset/confirm/",
//     ];

//     const isPublicAuthRoute = publicAuthRoutes.some((route) =>
//       config.url?.includes(route)
//     );

//     if (token && config.headers && !isPublicAuthRoute) {
//       config.headers.Authorization = `Token ${token}`;
//     }
//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig;

//     if (error.response?.status === 401) {
//       const authRoutes = [
//         "/api/connexion/",
//         "/api/registration/",
//         "/api/auth/login/",
//         "/api/auth/logout/",
//         "/api/auth/registration/",
//         "/api/auth/registration/resend-email/",
//         "/api/auth/registration/verify-email/",
//         "/api/auth/password/change/",
//         "/api/auth/password/reset/",
//         "/api/auth/password/reset/confirm/",
//       ];

//       if (!authRoutes.some((r) => originalRequest.url?.includes(r))) {
//         clearToken();
//         if (typeof window !== "undefined") {
//           window.location.href = "/auth/login";
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

































// lib/axios.ts
/**
 * Axios — Configuration HTTP pour le backend Django DRF
 *
 * Deux instances :
 * - apiPublic  : pour les endpoints publics (connexion, inscription, etc.)
 * - apiPrivate : pour les endpoints authentifiés (injection automatique du token)
 *
 * Gestion du token : chiffrement AES avant stockage dans localStorage.
 *
 * @module lib/axios
 */

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import CryptoJS from "crypto-js";

/** URL de base de l'API Django (variable d'environnement) */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shed-croak-unending.ngrok-free.dev";

/** Clé d'encryption pour sécuriser les tokens côté client */
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  "atelier-du-terroir-secure-key-2026-v1";

/** Clé de stockage du token d'authentification */
const AUTH_TOKEN_KEY = "AUTH_TOKEN_KEY";

/* ============================================================
   Helpers de chiffrement / déchiffrement
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
   Gestion du token (lecture / écriture / suppression)
   ============================================================ */
// export function getToken(): string | null {
//   if (typeof window === "undefined") return null;
//   const encrypted = localStorage.getItem(AUTH_TOKEN_KEY);
//   if (!encrypted) return null;
//   return decryptData(encrypted);
// }

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
  },
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