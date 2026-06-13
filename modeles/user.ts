/**
 * User Models — Interfaces TypeScript strictement synchronisées avec le backend Django DRF
 *
 * Source de vérité absolue : schéma OpenAPI du backend "Atelier du Terroir".
 * Les champs `readOnly` du backend sont marqués `readonly` ici.
 *
 * @module models/user
 */




// ─── Enums ────────────────────────────────────────────────────────────────────

/** Rôles possibles pour un utilisateur — union type exhaustive */
export type UserRole = 'platform_admin' | 'customer';




// ─── Entité principale ────────────────────────────────────────────────────────


/**
 * Objet `User` tel que retourné par le backend Django.
 * Conforme au schéma : GET /api/users/me/ et GET /api/users/{id}/
 */
export interface User {
  /** Identifiant unique — readOnly côté backend */
  readonly id: number;
  /** Adresse email — maxLength: 254 */
  email: string;
  /** Nom affiché — maxLength: 255 */
  name: string;
  /** Rôle utilisateur */
  role: UserRole;
  /** Numéro de téléphone — maxLength: 30 */
  phone_number: string;
  /** URL de l'image de profil (null si non définie) */
  profile_image: string | null;
  /** Compte actif */
  is_active: boolean;
  /** Email vérifié */
  is_verified: boolean;
}






// ─── Authentification ─────────────────────────────────────────────────────────



/**
 * Payload pour POST /api/connexion/
 * Accepte email OU username selon la configuration DRF.
 */

export interface LoginRequest {
  /** Email de l'utilisateur (optionnel si username fourni) */
  email?: string;
  /** Username de l'utilisateur (optionnel si email fourni) */
  username?: string;
  /** Mot de passe en clair (transmis en HTTPS uniquement) */
  password: string;
}



/**
 * Réponse de POST /api/connexion/
 * Le champ `key` est le Token DRF à stocker de manière sécurisée.
 */

export interface LoginResponse {
  /** Token d'authentification DRF (clé de session serveur) */
  key: string;
  /** Objet utilisateur complet */
  user: User;
}










// ─── Inscription ──────────────────────────────────────────────────────────────



/**
 * Payload pour POST /api/auth/registration/
 * Champs exactement conformes à l'endpoint dj-rest-auth.
 */

export interface RegisterRequest {
  /** Prénom / nom affiché — maxLength: 255 */
  name: string;
  /** Adresse email — maxLength: 254 */
  email: string;
  /** Mot de passe (première saisie) */
  password1: string;
  /** Mot de passe (confirmation) */
  password2: string;
}



/** Réponse de POST /api/auth/registration/ */
export interface RegisterResponse {
  detail: string;
}










// ─── Vérification email ───────────────────────────────────────────────────────



/** Payload pour POST /api/auth/registration/verify-email/ */
export interface VerifyEmailRequest {
  /** Clé de vérification reçue par email */
  key: string;
}



/** Réponse de POST /api/auth/registration/verify-email/ */
export interface VerifyEmailResponse {
  detail: string;
}



/** Payload pour POST /api/auth/registration/resend-email/ */
export interface ResendEmailRequest {
  email: string;
}



/** Réponse de POST /api/auth/registration/resend-email/ */
export interface ResendEmailResponse {
  detail: string;
}






// ─── Réinitialisation du mot de passe ────────────────────────────────────────


/** Payload pour POST /api/auth/password/reset/ */
export interface PasswordResetRequest {
  email: string;
}



/** Réponse de POST /api/auth/password/reset/ */
export interface PasswordResetResponse {
  detail: string;
}




/**
 * Payload pour POST /api/auth/password/reset/confirm/
 * uid et token proviennent des query params du lien reçu par email.
 */
export interface PasswordResetConfirmRequest {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}



/** Réponse de POST /api/auth/password/reset/confirm/ */
export interface PasswordResetConfirmResponse {
  detail: string;
}





// ─── Changement de mot de passe ───────────────────────────────────────────────

/** Payload pour POST /api/auth/password/change/ (utilisateur connecté) */
export interface PasswordChangeRequest {
  new_password1: string;
  new_password2: string;
}

/** Réponse de POST /api/auth/password/change/ */
export interface PasswordChangeResponse {
  detail: string;
}







// ─── Mise à jour du profil ────────────────────────────────────────────────────

/**
 * Payload pour PUT /api/users/{id}/ et PATCH /api/users/{id}/
 * Exclut les champs readOnly et non-modifiables directement.
 */
export type UpdateUserRequest = Partial<
  Omit<User, 'id' | 'is_active' | 'is_verified' | 'role'>
>;







// ─── Gestion d'erreurs API ────────────────────────────────────────────────────


/**
 * Structure d'erreur normalisée retournée par toutes les fonctions API.
 * Extrait le message le plus pertinent du payload DRF.
 */
export interface ApiError {
  /** Code de statut HTTP */
  status: number;
  /** Message lisible par l'utilisateur */
  message: string;
  /** Body brut de l'erreur backend (pour debug) */
  raw?: Record<string, string | string[]>;
}




/**
 * Type Result discriminé — pattern fonctionnel pour la gestion d'erreurs.
 *
 * @example
 * const result = await login(payload);
 * if (!result.ok) {
 *   console.error(result.error.message);
 *   return;
 * }
 * const { key, user } = result.data;
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
