/**
 * Notes & Favoris API — Fonctions d'accès aux endpoints Django DRF
 *
 * Endpoints couverts :
 *   GET    /api/v1/catalog/products/my-favorites/
 *   POST   /api/v1/catalog/favorites-toggle/
 *   DELETE /api/v1/catalog/favorites-delete/{id}/
 *
 *   GET    /api/v1/catalog/notes-products/mes-notes/
 *   POST   /api/v1/catalog/notes-products/
 *   DELETE /api/v1/catalog/notes-products/delete/{id}/
 *
 * Toutes les fonctions retournent le type discriminé `Result<T>` :
 *   - `{ ok: true,  data: T }` en cas de succès
 *   - `{ ok: false, error: ApiError }` en cas d'erreur
 *
 * @module fonctions_api/notes-favoris.api
 */

import { AxiosError } from "axios";
import { apiPrivate } from "@/lib/axios";
import type { Result, ApiError } from "@/modeles/user";
import type {
  FavoriteProduct,
  ToggleFavoritePayload,
  ToggleFavoriteResponse,
  MyRating,
  RateProductPayload,
  RateProductResponse,
} from "@/modeles/notes-favoris";

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Normalise les erreurs Axios en `ApiError` structurée.
 * Extrait le message le plus pertinent du payload DRF.
 */
const handleApiError = (error: unknown): { ok: false; error: ApiError } => {
  if (error instanceof AxiosError) {
    return {
      ok: false,
      error: {
        status: error.response?.status || 500,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
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

// ═══════════════════════════════════════════════════════════════════════════════
//  FAVORIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère la liste paginée des produits favoris de l'utilisateur connecté.
 *
 * GET /api/v1/catalog/products/my-favorites/
 * Permission: IsAuthenticated
 *
 * @returns Liste des produits favoris (FavoriteProduct[])
 *
 * @example
 * const result = await getMyFavorites();
 * if (result.ok) {
 *   result.data.forEach(p => console.log(p.name, p.price));
 * }
 */
export const getMyFavorites = async (): Promise<Result<FavoriteProduct[]>> => {
  try {
    const response = await apiPrivate.get<FavoriteProduct[]>(
      "/api/v1/catalog/products/my-favorites/"
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Ajoute ou retire atomiquement un produit des favoris (toggle).
 *
 * POST /api/v1/catalog/favorites-toggle/
 * Permission: IsAuthenticated
 *
 * - HTTP 201 → produit ajouté (favorited: true)
 * - HTTP 200 → produit retiré (favorited: false)
 *
 * @param productId - UUID du produit à toggler
 * @returns ToggleFavoriteResponse avec l'état résultant et le nouveau compteur
 *
 * @example
 * const result = await toggleFavorite("uuid-produit");
 * if (result.ok) {
 *   console.log(result.data.favorited ? "Ajouté" : "Retiré");
 * }
 */
export const toggleFavorite = async (
  productId: string
): Promise<Result<ToggleFavoriteResponse>> => {
  const payload: ToggleFavoritePayload = { product_id: productId };
  try {
    const response = await apiPrivate.post<ToggleFavoriteResponse>(
      "/api/v1/catalog/favorites-toggle/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Supprime un favori par son identifiant UUID.
 *
 * DELETE /api/v1/catalog/favorites-delete/{id}/
 * Permission: IsAuthenticated
 *
 * Retourne 204 No Content en cas de succès.
 * Retourne 404 si le favori n'existe pas.
 *
 * @param id - UUID du favori à supprimer
 * @returns void en cas de succès
 *
 * @example
 * const result = await deleteFavorite("uuid-favori");
 * if (result.ok) console.log("Favori supprimé");
 */
export const deleteFavorite = async (id: string): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/catalog/favorites-delete/${id}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTES PRODUIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère toutes les notes données par l'utilisateur connecté.
 *
 * GET /api/v1/catalog/notes-products/mes-notes/
 * Permission: IsAuthenticated
 *
 * @returns Liste de { product_id, score } pour tous les produits notés
 *
 * @example
 * const result = await getMyRatings();
 * if (result.ok) {
 *   const map = buildUserRatingsMap(result.data);
 *   const score = map.get(productId); // score de l'utilisateur pour ce produit
 * }
 */
export const getMyRatings = async (): Promise<Result<MyRating[]>> => {
  try {
    const response = await apiPrivate.get<MyRating[]>(
      "/api/v1/catalog/notes-products/mes-notes/"
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};









/**
 * Crée ou met à jour la note de l'utilisateur sur un produit.
 *
 * POST /api/v1/catalog/notes-products/
 * Permission: IsAuthenticated
 *
 * Le backend impose une contrainte d'unicité : un utilisateur ne peut avoir
 * qu'une seule note par produit. Si une note existe déjà, elle est mise à jour.
 * La réponse contient `updated: true` dans ce cas.
 *
 * @param productId - UUID du produit à noter
 * @param score     - Note entre 0 et 5 inclus
 * @returns RateProductResponse avec la nouvelle note moyenne et l'état mis à jour
 *
 * @example
 * const result = await rateProduct("uuid-produit", 4);
 * if (result.ok) {
 *   console.log("Moyenne:", result.data.note_produit);
 * }
 */
export const rateProduct = async (
  productId: string,
  score: number
): Promise<Result<RateProductResponse>> => {
  const payload: RateProductPayload = { product_id: productId, score };
  try {
    const response = await apiPrivate.post<RateProductResponse>(
      "/api/v1/catalog/notes-products/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};








/**
 * Supprime la note d'un produit par l'UUID de la note.
 *
 * DELETE /api/v1/catalog/notes-products/delete/{id}/
 * Permission: IsAuthenticated
 *
 * Retourne 204 No Content en cas de succès.
 * Retourne 404 si la note n'existe pas ou n'appartient pas à l'utilisateur.
 *
 * @param id - UUID de la note à supprimer
 * @returns void en cas de succès
 *
 * @example
 * const result = await deleteRating("uuid-note");
 * if (result.ok) console.log("Note supprimée");
 */
export const deleteRating = async (id: string): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/catalog/notes-products/delete/${id}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};
