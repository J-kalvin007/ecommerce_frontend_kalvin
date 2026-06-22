/**
 * Products API Service — Repository Pattern pour les produits, images et variantes
 *
 * Endpoints couverts :
 *   - Produits  : GET/POST /api/v1/catalog/admin/products/
 *                 GET/PUT/PATCH/DELETE /api/v1/catalog/admin/products/{id}/
 *   - Images   : GET/POST /api/v1/catalog/admin/product-images/
 *                 GET/PUT/PATCH/DELETE /api/v1/catalog/admin/product-images/{id}/
 *   - Variantes: GET/POST /api/v1/catalog/admin/product-variants/
 *                 GET/PUT/PATCH/DELETE /api/v1/catalog/admin/product-variants/{id}/
 *
 * Toutes les fonctions retournent le type discriminé `Result<T>` :
 *   - `{ ok: true, data: T }` en cas de succès
 *   - `{ ok: false, error: ApiError }` en cas d'erreur
 *
 * @module fonctions_api/produits.api
 */

// import api from "@/lib/axios";
import { apiPublic, apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type { Result, ApiError } from "@/modeles/user";
import type {
  ProductDetail,
  ProductCreateUpdatePayload,
  PatchProductPayload,
  ProductImageAdmin,
  CreateProductImagePayload,
  UpdateProductImagePayload,
  PatchProductImagePayload,
  ProductVariantAdmin,
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
  PatchProductVariantPayload,
  ProductList,
  PaginatedResponse,
} from "@/modeles/produits";



// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise les erreurs Axios en `ApiError` structurée.
 * Extrait le message le plus pertinent du payload DRF.
 *
 * @param error - Erreur brute (AxiosError ou Error)
 * @returns Résultat échoué avec erreur normalisée
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
//  PRODUITS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère la liste de tous les produits (admin).
 *
 * @returns Liste des produits avec catégorie, images, variantes imbriquées
 *
 * @example
 * const result = await getAdminProducts();
 * if (result.ok) {
 *   result.data.forEach(p => console.log(p.name, p.price));
 * }
 */
export const getAdminProducts = async (): Promise<Result<ProductDetail[]>> => {
  try {
    const response = await apiPrivate.get<ProductDetail[]>("/api/v1/catalog/admin/products/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Paramètres pour la récupération des produits publics.
 */
export interface GetPublicProductsParams {
  category?: string;
  ordering?: string;
  search?: string;
  page?: number;
  page_size?: number;
  is_top?: boolean; 
}

/**
 * Récupère la liste des produits publics (paginée).
 *
 * @param params - Filtres et pagination
 * @returns Résultat paginé des produits
 */
export const getPublicProducts = async (
  params?: GetPublicProductsParams
): Promise<Result<PaginatedResponse<ProductList>>> => {
  try {
    const response = await apiPublic.get<PaginatedResponse<ProductList>>(
      "/api/v1/catalog/products/",
      { params }
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère le détail d'un produit par son ID (public).
 *
 * @param id - UUID du produit
 * @returns Produit détaillé
 */
export const getPublicProductById = async (
  id: string
): Promise<Result<ProductDetail>> => {
  try {
    const response = await apiPublic.get<ProductDetail>(`/api/v1/catalog/products/${id}/`);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère le détail d'un produit par son ID (admin).
 *
 * @param id - UUID du produit
 * @returns Produit détaillé avec catégorie, images, variantes, produits associés
 */
export const getAdminProductById = async (
  id: string
): Promise<Result<ProductDetail>> => {
  try {
    const response = await apiPrivate.get<ProductDetail>(`/api/v1/catalog/admin/products/${id}/`);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Crée un nouveau produit (admin).
 *
 * @param data - Payload du produit (avec images embarquées si souhaité)
 * @returns Produit créé
 *
 * @example
 * const result = await createAdminProduct({
 *   category: "uuid-categorie",
 *   name: "Poivre de Penja",
 *   sku: "POIVRE-PENJA",
 *   product_type: "RAW",
 *   price: "12500.00",
 *   stock: 50,
 * });
 */
export const createAdminProduct = async (
  data: ProductCreateUpdatePayload
): Promise<Result<ProductDetail>> => {
  try {
    const response = await apiPrivate.post<ProductDetail>("/api/v1/catalog/admin/products/", data);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour complètement un produit (admin).
 *
 * @param id - UUID du produit
 * @param data - Données complètes de mise à jour
 * @returns Produit mis à jour
 */
export const updateAdminProduct = async (
  id: string,
  data: ProductCreateUpdatePayload
): Promise<Result<ProductDetail>> => {
  try {
    const response = await apiPrivate.put<ProductDetail>(
      `/api/v1/catalog/admin/products/${id}/`,
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour partiellement un produit (admin).
 *
 * @param id - UUID du produit
 * @param data - Champs à mettre à jour (partiels)
 * @returns Produit mis à jour
 */
export const patchAdminProduct = async (
  id: string,
  data: PatchProductPayload
): Promise<Result<ProductDetail>> => {
  try {
    const response = await apiPrivate.patch<ProductDetail>(
      `/api/v1/catalog/admin/products/${id}/`,
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Supprime un produit (admin).
 *
 * @param id - UUID du produit à supprimer
 * @returns void en cas de succès (HTTP 204)
 */
export const deleteAdminProduct = async (
  id: string
): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/catalog/admin/products/${id}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};



// ═══════════════════════════════════════════════════════════════════════════════
//  IMAGES PRODUIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère la liste de toutes les images produit (admin).
 *
 * @returns Liste des images produit avec métadonnées
 */
export const getAdminProductImages = async (): Promise<Result<ProductImageAdmin[]>> => {
  try {
    const response = await apiPrivate.get<ProductImageAdmin[]>("/api/v1/catalog/admin/product-images/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère le détail d'une image produit par son ID (admin).
 *
 * @param id - UUID de l'image
 * @returns Image produit détaillée
 */
export const getAdminProductImageById = async (
  id: string
): Promise<Result<ProductImageAdmin>> => {
  try {
    const response = await apiPrivate.get<ProductImageAdmin>(
      `/api/v1/catalog/admin/product-images/${id}/`
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Crée une nouvelle image produit (admin).
 * Gère automatiquement l'upload de fichier via FormData si `image` est un File.
 *
 * @param data - Données de l'image (image peut être un File ou une URL string)
 * @returns Image produit créée
 *
 * @example
 * // Avec un fichier
 * const result = await createAdminProductImage({
 *   product: "uuid-produit",
 *   image: fileObject,
 *   alt_text: "Photo du poivre de Penja",
 *   is_primary: true,
 *   is_active: true,
 * });
 */
export const createAdminProductImage = async (
  data: CreateProductImagePayload
): Promise<Result<ProductImageAdmin>> => {
  try {
    let response;

    if (data.image instanceof File) {
      // Upload via FormData pour les fichiers binaires
      const formData = new FormData();
      formData.append("product", data.product);
      formData.append("image", data.image);
      if (data.alt_text !== undefined) formData.append("alt_text", data.alt_text);
      if (data.is_primary !== undefined) formData.append("is_primary", String(data.is_primary));
      if (data.is_active !== undefined) formData.append("is_active", String(data.is_active));

      response = await apiPrivate.post<ProductImageAdmin>(
        "/api/v1/catalog/admin/product-images/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } else {
      // Envoi JSON classique pour les URLs
      response = await apiPrivate.post<ProductImageAdmin>(
        "/api/v1/catalog/admin/product-images/",
        data
      );
    }

    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour complètement une image produit (admin).
 *
 * @param id - UUID de l'image
 * @param data - Données complètes de mise à jour
 * @returns Image mise à jour
 */
export const updateAdminProductImage = async (
  id: string,
  data: UpdateProductImagePayload
): Promise<Result<ProductImageAdmin>> => {
  try {
    const response = await apiPrivate.put<ProductImageAdmin>(
      `/api/v1/catalog/admin/product-images/${id}/`,
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour partiellement une image produit (admin).
 *
 * @param id - UUID de l'image
 * @param data - Champs à mettre à jour (partiels)
 * @returns Image mise à jour
 */
export const patchAdminProductImage = async (
  id: string,
  data: PatchProductImagePayload
): Promise<Result<ProductImageAdmin>> => {
  try {
    const response = await apiPrivate.patch<ProductImageAdmin>(
      `/api/v1/catalog/admin/product-images/${id}/`,
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Supprime une image produit (admin).
 *
 * @param id - UUID de l'image à supprimer
 * @returns void en cas de succès (HTTP 204)
 */
export const deleteAdminProductImage = async (
  id: string
): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/catalog/admin/product-images/${id}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};



// ═══════════════════════════════════════════════════════════════════════════════
//  VARIANTES PRODUIT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère la liste de toutes les variantes produit (admin).
 *
 * @returns Liste des variantes avec métadonnées
 */
export const getAdminProductVariants = async (): Promise<Result<ProductVariantAdmin[]>> => {
  try {
    const response = await apiPrivate.get<ProductVariantAdmin[]>(
      "/api/v1/catalog/admin/product-variants/"
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère le détail d'une variante produit par son ID (admin).
 *
 * @param id - UUID de la variante
 * @returns Variante produit détaillée
 */
export const getAdminProductVariantById = async (
  id: string
): Promise<Result<ProductVariantAdmin>> => {
  try {
    const response = await apiPrivate.get<ProductVariantAdmin>(
      `/api/v1/catalog/admin/product-variants/${id}/`
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Crée une nouvelle variante produit (admin).
 *
 * @param data - Données de la variante
 * @returns Variante créée
 *
 * @example
 * const result = await createAdminProductVariant({
 *   product: "uuid-produit",
 *   name: "500g",
 *   sku: "POIVRE-PENJA-500G",
 *   price: "6500.00",
 *   stock: 20,
 *   is_active: true,
 * });
 */
export const createAdminProductVariant = async (
  data: CreateProductVariantPayload
): Promise<Result<ProductVariantAdmin>> => {
  try {
    const response = await apiPrivate.post<ProductVariantAdmin>(
      "/api/v1/catalog/admin/product-variants/",
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour complètement une variante produit (admin).
 *
 * @param id - UUID de la variante
 * @param data - Données complètes de mise à jour
 * @returns Variante mise à jour
 */
export const updateAdminProductVariant = async (
  id: string,
  data: UpdateProductVariantPayload
): Promise<Result<ProductVariantAdmin>> => {
  try {
    const response = await apiPrivate.put<ProductVariantAdmin>(
      `/api/v1/catalog/admin/product-variants/${id}/`,
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour partiellement une variante produit (admin).
 *
 * @param id - UUID de la variante
 * @param data - Champs à mettre à jour (partiels)
 * @returns Variante mise à jour
 */
export const patchAdminProductVariant = async (
  id: string,
  data: PatchProductVariantPayload
): Promise<Result<ProductVariantAdmin>> => {
  try {
    const response = await apiPrivate.patch<ProductVariantAdmin>(
      `/api/v1/catalog/admin/product-variants/${id}/`,
      data
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Supprime une variante produit (admin).
 *
 * @param id - UUID de la variante à supprimer
 * @returns void en cas de succès (HTTP 204)
 */
export const deleteAdminProductVariant = async (
  id: string
): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/catalog/admin/product-variants/${id}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};
