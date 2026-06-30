/**
 * Utilitaire de résolution des URLs media du backend.
 *
 * Problème : Ngrok (utilisé en développement) intercepte les requêtes directes
 * vers les fichiers media et renvoie une page HTML d'avertissement au lieu de
 * l'image (erreur ERR_NGROK_6024 dans le navigateur).
 *
 * Solution : En développement, toutes les URLs media sont redirigées vers notre
 * proxy Next.js `/api/media?url=...` qui ajoute l'en-tête ngrok-skip-browser-warning.
 * En production, les URLs sont conservées telles quelles (ou converties en HTTPS).
 *
 * @module lib/mediaUrl
 */

const BACKEND_DOMAINS = [
  ".ngrok-free.dev",
  ".ngrok.io",
  ".ngrok-free.app",
  // Ajoutez ici d'autres domaines de développement si nécessaire
];

/**
 * Convertit une URL media brute du backend en une URL sûre pour le frontend.
 *
 * - Retourne `null` si `src` est falsy (pas d'image → le composant affichera le fallback)
 * - En développement avec Ngrok : passe par le proxy `/api/media?url=...`
 * - En production : force HTTPS et retourne l'URL directement
 *
 * @example
 * // Dans un composant React :
 * <img src={mediaUrl(product.image) ?? ''} alt={product.name} />
 * // ou avec rendu conditionnel :
 * {mediaUrl(product.image) && <img src={mediaUrl(product.image)!} />}
 */
export function mediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;

  try {
    const parsed = new URL(src);
    const isNgrok = BACKEND_DOMAINS.some((domain) =>
      parsed.hostname.endsWith(domain)
    );

    // En développement avec Ngrok, on passe par le proxy et on force HTTPS
    if (isNgrok) {
      const secureUrl = src.replace(/^http:\/\//i, "https://");
      return `/api/media?url=${encodeURIComponent(secureUrl)}`;
    }

    // Détection d'une IP locale ou de localhost
    const isLocal = 
      parsed.hostname === 'localhost' || 
      parsed.hostname === '127.0.0.1' || 
      parsed.hostname.startsWith('192.168.') || 
      parsed.hostname.startsWith('10.');

    // Pour les domaines en production (hors localhost/IPs), on force HTTPS
    if (!isLocal) {
      return src.replace(/^http:\/\//i, "https://");
    }

    // Pour le local, on garde l'URL telle quelle (http://)
    return src;
  } catch {
    // URL relative (ex: "/media/image.jpg") → la préfixer avec le backend
    if (src.startsWith("/")) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const baseUrl = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
      if (baseUrl) {
        return mediaUrl(`${baseUrl}${src}`);
      }
    }
    return src;
  }
}

/**
 * Version avec une URL de fallback garantie (jamais null).
 * Utile quand vous ne voulez pas gérer le cas null.
 */
export function mediaUrlOrFallback(
  src: string | null | undefined,
  fallback = ""
): string {
  return mediaUrl(src) ?? fallback;
}
