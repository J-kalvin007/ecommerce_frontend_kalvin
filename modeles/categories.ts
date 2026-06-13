/**
 * Category Models — Interfaces TypeScript strictement synchronisées avec le backend Django DRF
 *
 * Source de vérité absolue : schéma OpenAPI du backend "Atelier du Terroir".
 * Endpoints :
 *   - GET/POST     /api/v1/catalog/admin/categories/
 *   - GET/PUT/PATCH/DELETE /api/v1/catalog/admin/categories/{id}/
 *   - GET           /api/v1/catalog/categories/
 *   - GET           /api/v1/catalog/categories/{id}/
 *
 * Les champs `readOnly` du backend sont marqués `readonly` ici.
 *
 * @module models/categories
 */

// ─── Entité principale ────────────────────────────────────────────────────────

/**
 * Catégorie telle que retournée par le backend Django (admin + public).
 *
 * Le champ `children` est un tableau récursif de sous-catégories.
 * Conforme au schéma : GET /api/v1/catalog/admin/categories/ et GET /api/v1/catalog/categories/
 */
export interface Category {
  /** UUID unique — readOnly côté backend */
  readonly id: string;

  /** Nom de la catégorie — required, maxLength: 100 */
  name: string;

  /**
   * Slug URL-safe — nullable, maxLength: 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string | null;

  /** Description textuelle de la catégorie */
  description: string;

  /**
   * URL de l'image de la catégorie — nullable
   * @format uri
   */
  image: string | null;

  /** UUID de la catégorie parente (si c'est une sous-catégorie) */
  parent?: string | null;

  /**
   * Sous-catégories imbriquées — readOnly côté backend
   * Structure récursive : chaque enfant est aussi une Category complète.
   */
  readonly children: Category[];
}

// ─── Payloads de mutation ─────────────────────────────────────────────────────

/**
 * Payload pour créer une catégorie.
 * POST /api/v1/catalog/admin/categories/
 */
export interface CreateCategoryPayload {
  /** Nom de la catégorie — required, maxLength: 100 */
  name: string;

  /** Slug URL-safe — nullable, maxLength: 50 */
  slug?: string | null;

  /** Description textuelle */
  description?: string;

  /**
   * Image de la catégorie — nullable.
   * Peut être un objet File pour l'upload via FormData.
   */
  image?: string | File | null;

  /** UUID de la catégorie parente */
  parent?: string | null;
}

/**
 * Payload pour mettre à jour complètement une catégorie.
 * PUT /api/v1/catalog/admin/categories/{id}/
 */
export type UpdateCategoryPayload = CreateCategoryPayload;

/**
 * Payload pour mettre à jour partiellement une catégorie.
 * PATCH /api/v1/catalog/admin/categories/{id}/
 */
export type PatchCategoryPayload = Partial<CreateCategoryPayload>;
