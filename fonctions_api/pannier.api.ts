/**
 * Cart API Service — Gestion du panier distant (Backend Django)
 *
 * Endpoints couverts :
 *   - Panier  : GET/DELETE /api/v1/commandes/cart/
 *   - Items   : POST /api/v1/commandes/cart/items/
 *               PATCH/DELETE /api/v1/commandes/cart/items/{product_id}/
 *
 * @module fonctions_api/pannier.api
 */

import { apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type { Result, ApiError } from "@/modeles/user";
import type { CartAPI, CartItemAPI, AddCartItemPayload } from "@/modeles/pannier";

/**
 * Normalise les erreurs Axios en `ApiError` structurée.
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

/**
 * Récupère le panier du client connecté.
 * Crée le panier s'il n'existe pas.
 */
export const getCart = async (): Promise<Result<CartAPI>> => {
  try {
    const response = await apiPrivate.get<CartAPI>("/api/v1/commandes/cart/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Vide complètement le panier du client connecté.
 */
export const clearCartAPI = async (): Promise<Result<void>> => {
  try {
    await apiPrivate.delete("/api/v1/commandes/cart/");
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Ajoute un produit au panier (ou incrémente sa quantité s'il y est déjà).
 */
export const addCartItem = async (
  payload: AddCartItemPayload
): Promise<Result<CartItemAPI>> => {
  try {
    const response = await apiPrivate.post<CartItemAPI>("/api/v1/commandes/cart/items/", payload);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour la quantité d'un produit dans le panier.
 */
export const updateCartItem = async (
  productId: string,
  quantity: number
): Promise<Result<CartItemAPI>> => {
  try {
    const response = await apiPrivate.patch<CartItemAPI>(
      `/api/v1/commandes/cart/items/${productId}/`,
      { quantity }
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Supprime un produit du panier.
 */
export const removeCartItem = async (
  productId: string
): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/commandes/cart/items/${productId}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};
