/**
 * Auth API Service — Repository Pattern et appels backend pour l'authentification
 *
 * @module fonctions_api/auth.api
 */

// import api from "@/lib/axios";
import { apiPublic, apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendEmailRequest,
  ResendEmailResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  PasswordChangeRequest,
  PasswordChangeResponse,
  UpdateUserRequest,
  User,
  Result,
  ApiError,
} from "@/modeles/user";

/**
 * Fonction utilitaire pour normaliser les erreurs de l'API.
 */
const handleApiError = (error: unknown): { ok: false; error: ApiError } => {
  if (error instanceof AxiosError) {
    return {
      ok: false,
      error: {
        status: error.response?.status || 500,
        message:
          error.response?.data?.detail ||
          error.message ||
          "Une erreur serveur est survenue.",
        raw: error.response?.data,
      },
    };
  }
  return {
    ok: false,
    error: {
      status: 500,
      message: error instanceof Error ? error.message : "Erreur inconnue.",
    },
  };
};




/**
 * Connecte un utilisateur.
 * @param data Informations de connexion
 */
export const login = async (
  data: LoginRequest
): Promise<Result<LoginResponse>> => {
  try {
    const response = await apiPublic.post<LoginResponse>("/api/connexion/", data);
    return { ok: true, data: response.data };

  } catch (error) {

    return handleApiError(error);

  }
};




/**
 * Déconnecte l'utilisateur actuel.
 */
export const logout = async (): Promise<Result<{ detail: string }>> => {
  try {
    const response = await apiPrivate.post<{ detail: string }>("/api/auth/logout/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Inscrit un nouvel utilisateur.
 * @param data Informations d'inscription
 */
export const register = async (
  data: RegisterRequest
): Promise<Result<RegisterResponse>> => {
  try {
    const response = await apiPublic.post<RegisterResponse>(
      "/api/auth/registration/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Vérifie l'adresse email d'un utilisateur.
 * @param data Clé de vérification
 */
export const verifyEmail = async (
  data: VerifyEmailRequest
): Promise<Result<VerifyEmailResponse>> => {
  try {
    const response = await apiPrivate.post<VerifyEmailResponse>(
      "/api/auth/registration/verify-email/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Renvoie l'email de vérification.
 * @param data Email de l'utilisateur
 */
export const resendVerificationEmail = async (
  data: ResendEmailRequest
): Promise<Result<ResendEmailResponse>> => {
  try {
    const response = await apiPublic.post<ResendEmailResponse>(
      "/api/auth/registration/force-resend-email/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Demande une réinitialisation de mot de passe.
 * @param data Email de l'utilisateur
 */
export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<Result<PasswordResetResponse>> => {
  try {
    const response = await apiPrivate.post<PasswordResetResponse>(
      "/api/auth/password/reset/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Confirme la réinitialisation de mot de passe avec le token reçu par email.
 * @param data Informations de confirmation
 */
export const confirmPasswordReset = async (
  data: PasswordResetConfirmRequest
): Promise<Result<PasswordResetConfirmResponse>> => {
  try {
    const response = await apiPublic.post<PasswordResetConfirmResponse>(
      "/api/auth/password/reset/confirm/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Change le mot de passe de l'utilisateur connecté.
 * @param data Nouveaux mots de passe
 */
export const changePassword = async (
  data: PasswordChangeRequest
): Promise<Result<PasswordChangeResponse>> => {
  try {
    const response = await apiPrivate.post<PasswordChangeResponse>(
      "/api/auth/password/change/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère le profil de l'utilisateur connecté.
 */
export const getCurrentUser = async (): Promise<Result<User>> => {
  try {
    const response = await apiPrivate.get<User>("/api/users/me/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère les détails d'un utilisateur par son ID.
 * @param id Identifiant de l'utilisateur
 */
export const getUser = async (id: number): Promise<Result<User>> => {
  try {
    const response = await apiPrivate.get<User>(`/api/users/${id}/`);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour complètement un utilisateur.
 * @param id Identifiant
 * @param data Données
 */
export const updateUser = async (
  id: number,
  data: UpdateUserRequest
): Promise<Result<User>> => {
  try {
    const response = await apiPrivate.put<User>(`/api/users/${id}/`, data);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour partiellement un utilisateur.
 * @param id Identifiant
 * @param data Données
 */
export const patchUser = async (
  id: number,
  data: UpdateUserRequest
): Promise<Result<User>> => {
  try {
    const response = await apiPrivate.patch<User>(`/api/users/${id}/`, data);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère la liste de tous les utilisateurs (admin).
 */
export const getAllUsers = async (): Promise<Result<User[]>> => {
  try {
    const response = await apiPrivate.get<User[]>("/api/users/all-users/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Active ou désactive un utilisateur via PATCH.
 * @param id Identifiant de l'utilisateur
 * @param isActive Nouvel état actif/inactif
 */
export const toggleUserActive = async (
  id: number,
  isActive: boolean
): Promise<Result<User>> => {
  try {
    const response = await apiPrivate.patch<User>(`/api/users/${id}/`, { is_active: isActive });
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

