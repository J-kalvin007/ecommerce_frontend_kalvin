/**
 * Product Models — Interfaces TypeScript strictement synchronisées avec le backend Django DRF
 *
 * Source de vérité absolue : schéma OpenAPI du backend "Atelier du Terroir".
 * Couvre 3 ressources :
 *   - Produits      : /api/v1/catalog/admin/products/
 *   - Images        : /api/v1/catalog/admin/product-images/
 *   - Variantes     : /api/v1/catalog/admin/product-variants/
 *
 * Les champs `readOnly` du backend sont marqués `readonly` ici.
 *
 * @module models/produits
 */

import type { Category } from "@/modeles/categories";



// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Types de produit supportés par le backend.
 *
 * - `RAW` — Brut (matière première)
 * - `PROCESSED` — Transformé (produit fini)
 * - `EXPORT` — Export (destiné à l'export)
 */
export const PRODUCT_TYPE = {
  RAW: "RAW",
  PROCESSED: "PROCESSED",
  EXPORT: "EXPORT",
} as const;

export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];

/** Labels lisibles pour l'affichage UI */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  RAW: "Brut",
  PROCESSED: "Transformé",
  EXPORT: "Export",
};



// ─── Images Produit ───────────────────────────────────────────────────────────

/**
 * Image produit telle que retournée dans le détail d'un produit (sans champ `product`).
 * Utilisée dans `ProductDetail.images`.
 */
export interface ProductImage {
  /** UUID unique — readOnly */
  readonly id: string;

  /**
   * URL de l'image
   * @format uri
   */
  image: string;

  /** Texte alternatif — maxLength: 255 */
  alt_text: string;

  /** Indique si c'est l'image principale du produit */
  is_primary: boolean;

  /** Date de création — readOnly */
  readonly created_at: string;

  /** Date de dernière modification — readOnly */
  readonly updated_at: string;

  /** Image active ou non */
  is_active: boolean;
}

/**
 * Image produit admin — inclut le champ `product` (UUID du produit parent).
 * Retournée par GET /api/v1/catalog/admin/product-images/
 */
export interface ProductImageAdmin extends ProductImage {
  /** UUID du produit parent — required */
  product: string;
}

/**
 * Payload pour créer une image produit.
 * POST /api/v1/catalog/admin/product-images/
 */
export interface CreateProductImagePayload {
  /** UUID du produit parent — required */
  product: string;

  /**
   * URL de l'image ou fichier — required
   * @format uri
   */
  image: string | File;

  /** Texte alternatif — maxLength: 255 */
  alt_text?: string;

  /** Image principale */
  is_primary?: boolean;

  /** Image active */
  is_active?: boolean;
}

/**
 * Payload pour mettre à jour complètement une image produit.
 * PUT /api/v1/catalog/admin/product-images/{id}/
 */
export type UpdateProductImagePayload = CreateProductImagePayload;

/**
 * Payload pour mettre à jour partiellement une image produit.
 * PATCH /api/v1/catalog/admin/product-images/{id}/
 */
export type PatchProductImagePayload = Partial<CreateProductImagePayload>;



// ─── Variantes Produit ────────────────────────────────────────────────────────

/**
 * Variante produit telle que retournée dans le détail d'un produit (sans champ `product`).
 * Utilisée dans `ProductDetail.variants`.
 */
export interface ProductVariant {
  /** UUID unique — readOnly */
  readonly id: string;

  /** Nom de la variante — required, maxLength: 100 */
  name: string;

  /** SKU de la variante — nullable, maxLength: 100 */
  sku: string | null;

  /**
   * Prix de la variante — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0, max: 2147483647 */
  stock: number;

  /** Poids en grammes — nullable, min: 0, max: 2147483647 */
  weight_grams: number | null;

  /** Indique si la variante est en stock — readOnly, calculé backend */
  readonly is_in_stock: string;

  /** Date de création — readOnly */
  readonly created_at: string;

  /** Date de dernière modification — readOnly */
  readonly updated_at: string;

  /** Variante active ou non */
  is_active: boolean;
}

/**
 * Variante produit admin — inclut le champ `product` (UUID du produit parent).
 * Retournée par GET /api/v1/catalog/admin/product-variants/
 */
export interface ProductVariantAdmin extends Omit<ProductVariant, "is_in_stock"> {
  /** UUID du produit parent — required */
  product: string;
}

/**
 * Payload pour créer une variante produit.
 * POST /api/v1/catalog/admin/product-variants/
 */
export interface CreateProductVariantPayload {
  /** UUID du produit parent — required */
  product: string;

  /** Nom de la variante — required, maxLength: 100 */
  name: string;

  /** SKU de la variante — nullable, maxLength: 100 */
  sku?: string | null;

  /**
   * Prix — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0 */
  stock?: number;

  /** Poids en grammes — nullable */
  weight_grams?: number | null;

  /** Variante active */
  is_active?: boolean;
}

/**
 * Payload pour mettre à jour complètement une variante produit.
 * PUT /api/v1/catalog/admin/product-variants/{id}/
 */
export type UpdateProductVariantPayload = CreateProductVariantPayload;

/**
 * Payload pour mettre à jour partiellement une variante produit.
 * PATCH /api/v1/catalog/admin/product-variants/{id}/
 */
export type PatchProductVariantPayload = Partial<CreateProductVariantPayload>;



// ─── Produits ─────────────────────────────────────────────────────────────────

/**
 * Produit en format liste allégé.
 * Utilisé dans `ProductDetail.related_products`.
 */
export interface ProductList {
  /** UUID unique — readOnly */
  readonly id: string;

  /** Nom du produit — required, maxLength: 255 */
  name: string;

  /**
   * Slug URL-safe — nullable, maxLength: 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string | null;

  /** SKU — required, maxLength: 100 */
  sku: string;

  /**
   * Prix — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0, max: 2147483647 */
  stock: number;

  /** Produit mis en avant — nullable */
  is_top: boolean | null;

  /** Type de produit */
  product_type: ProductType;

  /** Nom de la catégorie — readOnly */
  readonly category_name: string;

  /** URL ou objet de l'image principale — readOnly */
  readonly primary_image: ProductImage | null;

  /**
   * Note moyenne du produit — readOnly
   * @pattern ^-?\d{0,1}(?:\.\d{0,2})?$
   */
  readonly note_produit: string;

  /** Nombre de notes — readOnly */
  readonly count_ratings: number;

  /** Nombre de favoris — readOnly */
  readonly count_favorites: number;

  /** Order count */
  order_count?: number;
}




export interface ProductListPublicTop {
  /** UUID unique — readOnly */
  readonly id: string;

  /** Nom du produit — required, maxLength: 255 */
  name: string;

  /**
   * Slug URL-safe — nullable, maxLength: 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string | null;

  /** SKU — required, maxLength: 100 */
  sku: string;

  /**
   * Prix — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0, max: 2147483647 */
  stock: number;

  /** Produit mis en avant — nullable */
  is_top: boolean | null;

  /** Type de produit */
  product_type: ProductType;

  /** Nom de la catégorie — readOnly */
  readonly category_name: string;

  /** URL ou objet de l'image principale — readOnly */
  readonly primary_image: string;  

  /**
   * Note moyenne du produit — readOnly
   * @pattern ^-?\d{0,1}(?:\.\d{0,2})?$
   */
  readonly note_produit: string;

  /** Nombre de notes — readOnly */
  readonly count_ratings: number;

  /** Nombre de favoris — readOnly */
  readonly count_favorites: number;
}

/** Alias pour la compatibilité avec certains composants frontend */
export type ProductListItem = ProductList;

/** Réponse paginée de l'API */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Produit en format détail complet.
 * Retourné par GET /api/v1/catalog/admin/products/ et GET /api/v1/catalog/admin/products/{id}/
 *
 * @example
 * const product: ProductDetail = await getAdminProductById("uuid-...");
 */
export interface ProductDetail {
  /** UUID unique — readOnly */
  readonly id: string;

  /** Nom du produit — required, maxLength: 255 */
  name: string;

  /**
   * Slug URL-safe — nullable, maxLength: 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string | null;

  /** SKU — required, maxLength: 100 */
  sku: string;

  /** Description — nullable */
  description: string | null;

  /** Type de produit — required */
  product_type: ProductType;

  /**
   * Prix — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0, max: 2147483647 */
  stock: number;

  /** Poids en grammes — nullable */
  weight_grams: number | null;

  /** Titre SEO — nullable, maxLength: 255 */
  seo_title: string | null;

  /** Description SEO — nullable */
  seo_description: string | null;

  /** Produit mis en avant — nullable */
  is_top: boolean | null;

  /** Indique si le produit est en stock — readOnly, calculé backend */
  readonly is_in_stock: string;

  /** Catégorie complète — readOnly en réponse */
  readonly category: Category;

  /** Images du produit — readOnly en réponse */
  readonly images: ProductImage[];

  /** Variantes du produit — readOnly en réponse */
  readonly variants: ProductVariant[];

  /** Produits associés — readOnly en réponse */
  readonly related_products: ProductList[];

  /**
   * Note moyenne du produit — readOnly
   * @pattern ^-?\d{0,1}(?:\.\d{0,2})?$
   */
  readonly note_produit: string;

  /** Nombre de notes — readOnly */
  readonly count_ratings: number;

  /** Nombre de favoris — readOnly */
  readonly count_favorites: number;

  /** Date de création — readOnly */
  readonly created_at: string;

  /** Date de dernière modification — readOnly */
  readonly updated_at: string;

  // ─── Champs optionnels présents dans certaines réponses legacy ────────
  /** Image principale URL — parfois incluse dans les réponses */
  primary_image?: string | null;
  /** URL d'image legacy */
  image?: string | null;
  /** URL d'image legacy */
  image_url?: string | null;
  /** URL thumbnail legacy */
  thumbnail?: string | null;
}



export interface ProductDetailPublicTop {
  /** UUID unique — readOnly */
  readonly id: string;

  /** Nom du produit — required, maxLength: 255 */
  name: string;

  /**
   * Slug URL-safe — nullable, maxLength: 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug: string | null;

  /** SKU — required, maxLength: 100 */
  sku: string;

  /** Description — nullable */
  description: string | null;

  /** Type de produit — required */
  product_type: ProductType;

  /**
   * Prix — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0, max: 2147483647 */
  stock: number;

  /** Poids en grammes — nullable */
  weight_grams: number | null;

  /** Titre SEO — nullable, maxLength: 255 */
  seo_title: string | null;

  /** Description SEO — nullable */
  seo_description: string | null;

  /** Produit mis en avant — nullable */
  is_top: boolean | null;

  /** Indique si le produit est en stock — readOnly, calculé backend */
  readonly is_in_stock: string;

  /** Catégorie complète — readOnly en réponse */
  readonly category: Category;

  /** Images du produit — readOnly en réponse */
  readonly images?: string | null; 

  /** Variantes du produit — readOnly en réponse */
  readonly variants: ProductVariant[];

  /** Produits associés — readOnly en réponse */
  readonly related_products: ProductList[];

  /**
   * Note moyenne du produit — readOnly
   * @pattern ^-?\d{0,1}(?:\.\d{0,2})?$
   */
  readonly note_produit: string;

  /** Nombre de notes — readOnly */
  readonly count_ratings: number;

  /** Nombre de favoris — readOnly */
  readonly count_favorites: number;

  /** Date de création — readOnly */
  readonly created_at: string;

  /** Date de dernière modification — readOnly */
  readonly updated_at: string;

  // ─── Champs optionnels présents dans certaines réponses legacy ────────
  /** Image principale URL — parfois incluse dans les réponses */
  primary_image?: string | null;
  /** URL d'image legacy */
  image?: string | null;
  /** URL d'image legacy */
  image_url?: string | null;
  /** URL thumbnail legacy */
  thumbnail?: string | null;
}

/**
 * Image embarquée dans le payload de création/mise à jour produit.
 * Utilisée dans `ProductCreateUpdatePayload.images`.
 */
export interface ProductImagePayload {
  /**
   * URL de l'image — required
   * @format uri
   */
  image: string;

  /** Texte alternatif — maxLength: 255 */
  alt_text?: string;

  /** Image principale */
  is_primary?: boolean;

  /** Image active */
  is_active?: boolean;
}

/**
 * Payload pour créer ou mettre à jour complètement un produit.
 * POST /api/v1/catalog/admin/products/
 * PUT  /api/v1/catalog/admin/products/{id}/
 *
 * @example
 * const payload: ProductCreateUpdatePayload = {
 *   category: "uuid-categorie",
 *   name: "Poivre de Penja",
 *   sku: "POIVRE-PENJA",
 *   product_type: "RAW",
 *   price: "12500.00",
 *   stock: 50,
 * };
 */
export interface ProductCreateUpdatePayload {
  /** UUID de la catégorie parente — required */
  category: string | null;

  /** Nom du produit — required, maxLength: 255 */
  name: string;

  /**
   * Slug URL-safe — nullable, maxLength: 50
   * @pattern ^[-a-zA-Z0-9_]+$
   */
  slug?: string | null;

  /** SKU — required, maxLength: 100 */
  sku: string;

  /** Description — nullable */
  description?: string | null;

  /** Type de produit — required */
  product_type: ProductType | string;

  /**
   * Prix — required
   * @pattern ^-?\d{0,10}(?:\.\d{0,2})?$
   */
  price: string;

  /** Stock disponible — min: 0 */
  stock?: number;

  /** Poids en grammes — nullable */
  weight_grams?: number | null;

  /** Titre SEO — nullable, maxLength: 255 */
  seo_title?: string | null;

  /** Description SEO — nullable */
  seo_description?: string | null;

  /** Produit mis en avant — nullable */
  is_top?: boolean | null;

  /** UUIDs des produits associés */
  related_products?: string[];

  /** Images à embarquer lors de la création */
  images?: ProductImagePayload[];
}

/**
 * Payload pour mettre à jour partiellement un produit.
 * PATCH /api/v1/catalog/admin/products/{id}/
 */
export type PatchProductPayload = Partial<ProductCreateUpdatePayload>;
