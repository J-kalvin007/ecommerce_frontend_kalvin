/**
 * Notes & Favoris — Modèles TypeScript synchronisés avec le backend Django DRF
 *
 * Source de vérité : documentation OpenAPI du backend « Atelier du Terroir »
 *
 * Ressources couvertes :
 *   - Favoris : GET  /api/v1/catalog/products/my-favorites/
 *               POST /api/v1/catalog/favorites-toggle/
 *               DELETE /api/v1/catalog/favorites-delete/{id}/
 *
 *   - Notes   : GET  /api/v1/catalog/notes-products/mes-notes/
 *               POST /api/v1/catalog/notes-products/
 *               DELETE /api/v1/catalog/notes-products/delete/{id}/
 *
 * @module modeles/notes-favoris
 */

// --- FAVORIS ------------------------------------------------------------------

/**
 * Produit favori tel que retourné par GET /api/v1/catalog/products/my-favorites/
 *
 * Le backend utilise un serializer allégé (FavoriteProduct) incluant les
 * informations essentielles du produit sans nested serializer complet.
 */
export interface FavoriteProduct {
  /** UUID du produit — required */
  id: string;

  /** Nom du produit — required */
  name: string;

  /** Slug URL-safe — required */
  slug: string;

  /**
   * Prix du produit — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /**
   * URL de l'image principale — readOnly (calculée backend)
   * Peut être une URL absolue ou relative selon la configuration du backend.
   */
  readonly image: string;

  /** Indique si le produit est en stock — required */
  is_in_stock: boolean;

  /**
   * Date à laquelle le produit a été ajouté aux favoris — required
   * @format date-time
   */
  favorited_at: string;

  /**
   * Nombre total de favoris pour ce produit
   * @default 0
   */
  count_favorites: number;

  /** Identifiant de la variante par défaut, si elle existe */
  default_variant_id?: string | null;
}

// --- TOGGLE FAVORIS -----------------------------------------------------------

/**
 * Payload pour POST /api/v1/catalog/favorites-toggle/
 * Ajoute ou retire atomiquement un produit des favoris.
 */
export interface ToggleFavoritePayload {
  /** UUID du produit — required */
  product_id: string;
}

/**
 * Réponse lorsque le produit est ajouté aux favoris (HTTP 201).
 * FavoriteAddedResponse
 */
export interface FavoriteAddedResponse {
  /** true = produit maintenant dans les favoris */
  favorited: true;

  /** Nouveau nombre total de favoris pour ce produit */
  count_favorites: number;

  /** UUID du produit concerné */
  product_id: string;
}

/**
 * Réponse lorsque le produit est retiré des favoris (HTTP 200).
 * FavoriteRemovedResponse
 */
export interface FavoriteRemovedResponse {
  /** false = produit retiré des favoris */
  favorited: false;

  /** Nouveau nombre total de favoris pour ce produit */
  count_favorites: number;

  /** UUID du produit concerné */
  product_id: string;
}

/**
 * Union discriminée des réponses possibles du toggle favoris.
 * Discriminant : `favorited`
 */
export type ToggleFavoriteResponse = FavoriteAddedResponse | FavoriteRemovedResponse;

// --- NOTES PRODUIT ------------------------------------------------------------

/**
 * Note d'un utilisateur pour un produit, telle que retournée par
 * GET /api/v1/catalog/notes-products/mes-notes/
 *
 * MyRatingsResponse
 */
export interface MyRating {
  /** UUID du produit noté — required */
  product_id: string;

  /**
   * Score attribué par l'utilisateur — required
   * @minimum 0
   * @maximum 5
   */
  score: number;
}

/**
 * Payload pour POST /api/v1/catalog/notes-products/
 * Crée ou modifie la note de l'utilisateur sur un produit.
 * (Contrainte d'unicité backend : un utilisateur ne peut noter
 *  qu'une seule fois le même produit — l'API met à jour si une note existe déjà.)
 */
export interface RateProductPayload {
  /** UUID du produit — required */
  product_id: string;

  /**
   * Score — required
   * @minimum 0
   * @maximum 5
   */
  score: number;
}

/**
 * Réponse de POST /api/v1/catalog/notes-products/ (HTTP 200)
 * RateProductResponse
 */
export interface RateProductResponse {
  /** true = produit noté / note mise à jour */
  rated: boolean;

  /** Score soumis par l'utilisateur */
  user_score: number;

  /**
   * Note moyenne globale du produit (recalculée backend par signal)
   * @pattern ^-?\d{0,1}(?:\.\d{0,2})?$
   */
  note_produit: string;

  /** Nombre total de notes pour ce produit (recalculé backend par signal) */
  count_ratings: number;

  /** UUID du produit noté */
  product_id: string;

  /** true si la note existait déjà et a été mise à jour, false si créée */
  updated: boolean;
}

// --- MAP UTILITAIRE -----------------------------------------------------------

/**
 * Map product_id → score pour un accès O(1) lors du rendu.
 * Construite à partir du tableau MyRating[] retourné par l'API mes-notes.
 *
 * @example
 * const map = buildUserRatingsMap(mesNotes);
 * const userScore = map.get(productId) ?? null;
 */
export type UserRatingsMap = Map<string, number>;

/**
 * Construit une Map<product_id, score> depuis la liste brute des notes utilisateur.
 *
 * @param ratings - Tableau renvoyé par GET /api/v1/catalog/notes-products/mes-notes/
 * @returns Map<string, number>
 */
export function buildUserRatingsMap(ratings: MyRating[]): UserRatingsMap {
  const map: UserRatingsMap = new Map();
  for (const r of ratings) {
    map.set(r.product_id, r.score);
  }
  return map;
}
