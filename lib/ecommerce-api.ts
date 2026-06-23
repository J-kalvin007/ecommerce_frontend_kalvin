/**
 * ecommerce-api.ts
 * Re-exports API functions and types from the new modular structure in @/fonctions_api and @/modeles
 * to prevent breaking changes in existing components.
 */

import { getPublicCategories as _getPublicCategories, getPublicCategoryById as _getPublicCategoryById } from "@/fonctions_api/categories.api";
import { getPublicProducts as _getPublicProducts } from "@/fonctions_api/produits.api";
import {
  getActiveRecommendations as _getActiveBanners,
  getActiveSales as _getActiveFlashSales,
  getActivePromoCodes as _getActivePromoCodes,
  validatePromoCode as _validatePromoCode,
} from "@/fonctions_api/promotions.api";

// Wrappers pour unwrapper le Result<T> car l'ancien code attendait directement la donnée
export const getPublicCategories = async () => {
    const res = await _getPublicCategories();
    return res.ok ? res.data : [];
}

export const getPublicCategoryById = async (id: string) => {
    const res = await _getPublicCategoryById(id);
    return res.ok ? res.data : null;
}

export const getPublicProducts = async (params: any = {}) => {
    const res = await _getPublicProducts(params);
    return res.ok ? res.data.results : [];
}

export const getActiveBanners = async () => {
    const res = await _getActiveBanners();
    return res.ok ? res.data : [];
}

export const getActiveFlashSales = async () => {
    const res = await _getActiveFlashSales();
    return res.ok ? res.data : [];
}

export const getActivePromoCodes = async () => {
    const res = await _getActivePromoCodes();
    return res.ok ? res.data : [];
}

export const validatePromoCode = async (payload: any) => {
    const res = await _validatePromoCode(payload);
    return res.ok ? res.data : null;
}


// Types
export type { ProductListItem } from "@/modeles/produits";
export type { Category as PublicCategory } from "@/modeles/categories";
export type { 
  Banner as PublicBanner, 
  Soldes as PublicFlashSale, 
  PromoCodeList as PublicPromoCode 
} from "@/modeles/promotions";
