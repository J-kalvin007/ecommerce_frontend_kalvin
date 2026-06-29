/**
 * auth-errors.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilitaire centralisé de traduction des erreurs d'authentification.
 * Transforme les messages bruts de l'API (anglais, techniques) en messages
 * clairs, explicites et en français pour l'utilisateur final.
 *
 * Principe : aucun composant d'auth n'affiche jamais de message brut.
 * Chaque flux possède sa propre fonction dédiée.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ──────────────────────────────────────────────────────────────────────────
   Types internes
────────────────────────────────────────────────────────────────────────── */

/** Représente le payload d'erreur brut retourné par l'API */
type RawError = Record<string, unknown> | null | undefined;

/** Extrait la première chaîne d'un champ qui peut être string | string[] */
function first(value: unknown): string | undefined {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : undefined;
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

/** Collecte le premier message disponible parmi plusieurs champs API */
function pick(raw: RawError, ...fields: string[]): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  for (const field of fields) {
    const v = first((raw as Record<string, unknown>)[field]);
    if (v) return v;
  }
  return undefined;
}

/* ──────────────────────────────────────────────────────────────────────────
   Moteurs de détection — patterns communs à tous les flux
────────────────────────────────────────────────────────────────────────── */

function isNetworkError(msg: string): boolean {
  return /network|fetch|failed to fetch|connexion|erreur réseau/i.test(msg);
}

function isServerError(msg: string): boolean {
  return /500|503|server error|internal server|service unavailable/i.test(msg);
}

function isTooManyRequests(msg: string, status?: number): boolean {
  return status === 429 || /429|too many|trop de tentatives|rate limit/i.test(msg);
}

function isTokenExpired(msg: string): boolean {
  return /expired|expiré|invalid token|token invalid|invalid.*token/i.test(msg);
}

function isInvalidUid(msg: string): boolean {
  return /invalid.*uid|uid.*invalid|user.*not found/i.test(msg);
}

function isEmailNotFound(msg: string): boolean {
  return /no.*account.*email|email.*not.*found|aucun compte/i.test(msg);
}

function isNotVerified(msg: string): boolean {
  return /not verified|pas vérifié|not.*active.*verified|verify.*email/i.test(msg);
}

/* ──────────────────────────────────────────────────────────────────────────
   CONNEXION — LoginForm
────────────────────────────────────────────────────────────────────────── */

/**
 * Traduit les erreurs du flux de connexion.
 * @param raw   - Objet d'erreur brut de l'API
 * @param status - Code HTTP optionnel (ex: 400, 429, 500)
 */
export function getLoginError(raw: RawError, status?: number): string {
  const rawMsg =
    pick(raw, "detail", "non_field_errors", "email", "username", "password") ?? "";
  const lower = rawMsg.toLowerCase();

  // Trop de tentatives
  if (isTooManyRequests(lower, status)) {
    return "Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer.";
  }

  // Identifiants incorrects / compte inactif
  if (
    lower.includes("no active account") ||
    lower.includes("credentials") ||
    lower.includes("unable to log in") ||
    lower.includes("incorrect") ||
    lower.includes("invalid credentials")
  ) {
    return "Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.";
  }

  // Compte non vérifié
  if (isNotVerified(lower)) {
    return "Votre compte n'est pas encore vérifié. Consultez votre boîte mail pour activer votre compte.";
  }

  // Compte désactivé/banni
  if (lower.includes("disabled") || lower.includes("blocked") || lower.includes("banned")) {
    return "Votre compte a été désactivé. Contactez le support pour plus d'informations.";
  }

  // Erreur réseau
  if (isNetworkError(lower) || isNetworkError(rawMsg)) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.";
  }

  // Erreur serveur
  if (isServerError(lower) || status === 500 || status === 503) {
    return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
  }

  if (rawMsg) {
    return rawMsg;
  }

  // Fallback générique
  return "Connexion impossible. Vérifiez vos identifiants ou réessayez plus tard.";
}

/* ──────────────────────────────────────────────────────────────────────────
   INSCRIPTION — RegisterForm
────────────────────────────────────────────────────────────────────────── */

export type RegisterFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

/**
 * Traduit les erreurs du flux d'inscription, y compris les erreurs par champ.
 * @param raw   - Objet d'erreur brut de l'API
 * @param status - Code HTTP optionnel
 * @returns { toast, fields } — le message global et les erreurs par champ
 */
export function getRegisterError(
  raw: RawError,
  status?: number
): { toast: string; fields: RegisterFieldErrors } {
  const fields: RegisterFieldErrors = {};

  if (!raw || typeof raw !== "object") {
    return {
      toast: "Une erreur inattendue est survenue. Réessayez dans quelques instants.",
      fields,
    };
  }

  // ── Erreurs par champ ────────────────────────────────────────────────────
  const emailRaw = first((raw as Record<string, unknown>).email) ?? "";
  const nameRaw =
    first((raw as Record<string, unknown>).name) ??
    first((raw as Record<string, unknown>).username) ??
    "";
  const passwordRaw =
    first((raw as Record<string, unknown>).password1) ??
    first((raw as Record<string, unknown>).password) ??
    "";

  if (emailRaw) {
    fields.email = translateRegisterEmailError(emailRaw);
  }
  if (nameRaw) {
    fields.name = translateRegisterNameError(nameRaw);
  }
  if (passwordRaw) {
    fields.password = translatePasswordError(passwordRaw);
  }

  // ── Message global ───────────────────────────────────────────────────────
  const globalRaw =
    pick(raw, "detail", "non_field_errors") ??
    passwordRaw ??
    emailRaw ??
    nameRaw ??
    "";
  const lower = globalRaw.toLowerCase();

  if (isTooManyRequests(lower, status)) {
    return { toast: "Trop de tentatives. Patientez quelques minutes avant de réessayer.", fields };
  }
  if (isNetworkError(lower) || isNetworkError(globalRaw)) {
    return { toast: "Connexion au serveur impossible. Vérifiez votre réseau.", fields };
  }
  if (isServerError(lower) || status === 500 || status === 503) {
    return { toast: "Le serveur rencontre un problème. Réessayez dans quelques instants.", fields };
  }
  if (lower.includes("already exists") || lower.includes("unique") || lower.includes("existe déjà")) {
    return { toast: "Un compte existe déjà avec cette adresse e-mail.", fields };
  }
  if (fields.password) {
    return { toast: fields.password, fields };
  }
  if (fields.email) {
    return { toast: fields.email, fields };
  }
  if (fields.name) {
    return { toast: fields.name, fields };
  }

  if (globalRaw) {
    return { toast: globalRaw, fields };
  }

  return { toast: "Une erreur est survenue pendant l'inscription. Vérifiez les champs et réessayez.", fields };
}

function translateRegisterEmailError(msg: string): string {
  const l = msg.toLowerCase();
  if (l.includes("already") || l.includes("exists") || l.includes("unique")) {
    return "Cette adresse e-mail est déjà utilisée par un autre compte.";
  }
  if (l.includes("valid") || l.includes("format") || l.includes("invalid")) {
    return "L'adresse e-mail saisie n'est pas valide.";
  }
  if (l.includes("required") || l.includes("blank")) {
    return "L'adresse e-mail est obligatoire.";
  }
  return msg;
}

function translateRegisterNameError(msg: string): string {
  const l = msg.toLowerCase();
  if (l.includes("already") || l.includes("exists") || l.includes("unique")) {
    return "Ce nom d'utilisateur est déjà pris. Choisissez-en un autre.";
  }
  if (l.includes("required") || l.includes("blank")) {
    return "Le nom complet est obligatoire.";
  }
  if (l.includes("short") || l.includes("minimum")) {
    return "Le nom doit contenir au moins 2 caractères.";
  }
  return msg;
}

/* ──────────────────────────────────────────────────────────────────────────
   MOT DE PASSE — traduction commune (register + reset)
────────────────────────────────────────────────────────────────────────── */

export function translatePasswordError(msg: string): string {
  const l = msg.toLowerCase();
  if (l.includes("too short") || l.includes("at least 8") || l.includes("minimum 8")) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (l.includes("too common") || l.includes("too simple") || l.includes("commonly used")) {
    return "Ce mot de passe est trop courant. Choisissez-en un plus original.";
  }
  if (l.includes("entirely numeric") || l.includes("only numbers") || l.includes("numeric")) {
    return "Le mot de passe ne peut pas être uniquement composé de chiffres.";
  }
  if (l.includes("similar") || l.includes("personal information")) {
    return "Le mot de passe ressemble trop à vos informations personnelles.";
  }
  if (l.includes("required") || l.includes("blank")) {
    return "Le mot de passe est obligatoire.";
  }
  return msg;
}

/* ──────────────────────────────────────────────────────────────────────────
   MOT DE PASSE OUBLIÉ — ForgotPasswordClient
────────────────────────────────────────────────────────────────────────── */

/**
 * Traduit les erreurs du flux "mot de passe oublié".
 */
export function getForgotPasswordError(raw: RawError, status?: number): string {
  const rawMsg = pick(raw, "detail", "email", "non_field_errors") ?? "";
  const lower = rawMsg.toLowerCase();

  if (isTooManyRequests(lower, status)) {
    return "Vous avez fait trop de demandes récemment. Patientez quelques minutes avant de réessayer.";
  }
  if (isEmailNotFound(lower)) {
    return "Aucun compte n'est associé à cette adresse e-mail. Vérifiez votre saisie.";
  }
  if (lower.includes("valid") || lower.includes("invalid email") || lower.includes("format")) {
    return "L'adresse e-mail saisie n'est pas valide.";
  }
  if (lower.includes("required") || lower.includes("blank")) {
    return "Veuillez saisir votre adresse e-mail.";
  }
  if (isNetworkError(lower) || isNetworkError(rawMsg)) {
    return "Impossible d'envoyer l'e-mail. Vérifiez votre connexion internet.";
  }
  if (isServerError(lower) || status === 500 || status === 503) {
    return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
  }

  return "L'envoi de l'e-mail a échoué. Vérifiez l'adresse saisie et réessayez.";
}

/* ──────────────────────────────────────────────────────────────────────────
   RÉINITIALISATION MDP — ResetPasswordConfirmClient
────────────────────────────────────────────────────────────────────────── */

/**
 * Traduit les erreurs du flux de confirmation de réinitialisation du mot de passe.
 */
export function getResetPasswordError(raw: RawError, status?: number): string {
  const rawMsg =
    pick(raw, "detail", "new_password1", "new_password2", "token", "uid", "non_field_errors") ?? "";
  const lower = rawMsg.toLowerCase();

  if (isTokenExpired(lower)) {
    return "Ce lien de réinitialisation a expiré ou n'est plus valide. Faites une nouvelle demande de réinitialisation.";
  }
  if (isInvalidUid(lower)) {
    return "Le lien de réinitialisation est incorrect. Veuillez redemander un e-mail de réinitialisation.";
  }
  if (isTooManyRequests(lower, status)) {
    return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  }

  // Erreurs de mot de passe
  const pwdFields = ["new_password1", "new_password2", "password1", "password"];
  const pwdRaw = pick(raw, ...pwdFields) ?? "";
  if (pwdRaw) {
    return translatePasswordError(pwdRaw);
  }

  if (isNetworkError(lower) || isNetworkError(rawMsg)) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
  }
  if (isServerError(lower) || status === 500 || status === 503) {
    return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
  }

  return "Impossible de réinitialiser le mot de passe. Le lien a peut-être expiré — faites une nouvelle demande.";
}

/* ──────────────────────────────────────────────────────────────────────────
   VÉRIFICATION E-MAIL — VerifyEmailClient
────────────────────────────────────────────────────────────────────────── */

/**
 * Traduit les erreurs du flux de vérification d'e-mail par code.
 */
export function getVerifyEmailError(raw: RawError, status?: number): string {
  const rawMsg = pick(raw, "detail", "key", "code", "token", "non_field_errors") ?? "";
  const lower = rawMsg.toLowerCase();

  if (isTokenExpired(lower) || lower.includes("invalid") || lower.includes("not valid")) {
    return "Le code saisi est incorrect ou a expiré. Vérifiez votre boîte mail ou demandez un nouveau code.";
  }
  if (lower.includes("already verified") || lower.includes("déjà vérifié")) {
    return "Votre adresse e-mail est déjà vérifiée. Vous pouvez vous connecter.";
  }
  if (isTooManyRequests(lower, status)) {
    return "Trop de tentatives. Attendez quelques minutes avant de réessayer.";
  }
  if (isNetworkError(lower) || isNetworkError(rawMsg)) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
  }
  if (isServerError(lower) || status === 500 || status === 503) {
    return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
  }

  return "Code invalide ou expiré. Vérifiez votre boîte mail et réessayez.";
}
