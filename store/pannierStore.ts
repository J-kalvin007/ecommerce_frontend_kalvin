/**
 * Cart Store — Gestion du panier (Zustand)
 *
 * Panier persistant via localStorage (Redis sync côté backend).
 * Gère :
 * 1. Ajout / retrait / modification de quantité
 * 2. Application de code promo (validation côté client)
 * 3. Calcul des totaux en temps réel
 * 4. Points de fidélité applicables
 *
 * @module store/cartStore
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Article dans le panier */
export interface CartItem {
  /** UUID du produit */
  productId: string;
  /** UUID de la variante (null si produit simple) */
  variantId: string | null;
  /** Nom du produit (snapshot pour affichage offline) */
  name: string;
  /** SKU */
  sku: string;
  /** Prix unitaire (string décimal) */
  price: string;
  /** Ancien prix barré */
  compareAtPrice: string | null;
  /** URL de l'image principale */
  image: string | null;
  /** Quantité */
  quantity: number;
  /** Stock disponible (pour validation côté client) */
  maxStock: number;
  /** Devise */
  currency: string;
  /** Slug pour le lien vers la page produit */
  slug: string;
}

/** Shape du store panier */
interface CartState {
  /** Articles dans le panier */
  items: CartItem[];
  /** Code promo appliqué (null si aucun) */
  promoCode: string | null;
  /** Montant de réduction du code promo */
  promoDiscount: number;
  /** Points de fidélité à utiliser */
  loyaltyPointsToUse: number;
  /** Visibilité du drawer panier */
  isDrawerOpen: boolean;

  /* --- Actions --- */
  addItem: (item: CartItem, preventOpenDrawer?: boolean) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, qty: number) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null, discount: number) => void;
  setLoyaltyPoints: (points: number) => void;
  toggleDrawer: (open?: boolean) => void;

  /* --- Computed (getters) --- */
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

/**
 * Store Zustand pour le panier.
 * Persiste en localStorage pour retrouver le panier entre les sessions.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      loyaltyPointsToUse: 0,
      isDrawerOpen: false,

      addItem: (item, preventOpenDrawer = false) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex >= 0) {
            /* Article déjà dans le panier → incrémenter la quantité */
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = Math.min(
              existing.quantity + item.quantity,
              existing.maxStock
            );
            updated[existingIndex] = { ...existing, quantity: newQty };
            return { items: updated, isDrawerOpen: preventOpenDrawer ? state.isDrawerOpen : true };
          }

          /* Nouvel article */
          return { items: [...state.items, item], isDrawerOpen: preventOpenDrawer ? state.isDrawerOpen : true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, qty) => {
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId)
              ),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: Math.min(qty, i.maxStock) }
                : i
            ),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          promoCode: null,
          promoDiscount: 0,
          loyaltyPointsToUse: 0,
        });
      },

      setPromoCode: (code, discount) => {
        set({ promoCode: code, promoDiscount: discount });
      },

      setLoyaltyPoints: (points) => {
        set({ loyaltyPointsToUse: points });
      },

      toggleDrawer: (open) => {
        set((state) => ({
          isDrawerOpen: open !== undefined ? open : !state.isDrawerOpen,
        }));
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0
        );
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const promoDiscount = get().promoDiscount;
        return Math.max(0, subtotal - promoDiscount);
      },
    }),
    {
      name: "Atelier du terroir-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    }
  )
);
