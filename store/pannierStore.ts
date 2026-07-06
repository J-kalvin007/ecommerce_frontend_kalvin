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
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCartAPI } from "@/fonctions_api/pannier.api";
import { useAuthStore } from "./authStore";

/** Article dans le panier */
export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  productImage?: string | null;
  quantity: number;
  maxStock: number;
  currency: string;
  slug: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  loyaltyPointsToUse: number;
  isDrawerOpen: boolean;

  addItem: (item: CartItem, preventOpenDrawer?: boolean) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, qty: number) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null, discount: number) => void;
  setLoyaltyPoints: (points: number) => void;
  toggleDrawer: (open?: boolean) => void;
  syncCart: () => Promise<void>;

  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

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

          let updatedItems;
          if (existingIndex >= 0) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = Math.min(existing.quantity + item.quantity, existing.maxStock);
            updated[existingIndex] = { ...existing, quantity: newQty };
            updatedItems = updated;
          } else {
            updatedItems = [...state.items, item];
          }

          // Background API sync
          if (useAuthStore.getState().status === "authenticated") {
            const targetId = item.variantId || item.productId;
            addCartItem({ product_id: targetId, quantity: item.quantity }).catch(console.error);
          }

          return { items: updatedItems, isDrawerOpen: preventOpenDrawer ? state.isDrawerOpen : true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => {
          const targetId = variantId || productId;
          if (useAuthStore.getState().status === "authenticated") {
            removeCartItem(targetId).catch(console.error);
          }
          return {
            items: state.items.filter((i) => !(i.productId === productId && i.variantId === variantId)),
          };
        });
      },

      updateQuantity: (productId, variantId, qty) => {
        set((state) => {
          const targetId = variantId || productId;

          if (qty <= 0) {
            if (useAuthStore.getState().status === "authenticated") {
              removeCartItem(targetId).catch(console.error);
            }
            return {
              items: state.items.filter((i) => !(i.productId === productId && i.variantId === variantId)),
            };
          }

          if (useAuthStore.getState().status === "authenticated") {
            updateCartItem(targetId, qty).catch(console.error);
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
        if (useAuthStore.getState().status === "authenticated") {
          clearCartAPI().catch(console.error);
        }
        set({
          items: [],
          promoCode: null,
          promoDiscount: 0,
          loyaltyPointsToUse: 0,
        });
      },

      syncCart: async () => {
        const isAuth = useAuthStore.getState().status === "authenticated";
        if (!isAuth) return;

        const res = await getCart();
        if (res.ok) {
          const remoteItems = res.data.items;
          const localItems = get().items;

          // Push local items to backend if missing or update quantity
          for (const local of localItems) {
            const targetId = local.variantId || local.productId;
            const existsRemote = remoteItems.find(ri => ri.product === targetId || ri.product_details?.id === targetId);
            if (!existsRemote) {
              await addCartItem({ product_id: targetId, quantity: local.quantity });
            }
          }

          // Fetch updated remote cart
          const updatedRes = await getCart();
          if (updatedRes.ok) {
             const finalRemoteItems = updatedRes.data.items;
             
             // Convert remote items to local format
             const mergedItems: CartItem[] = finalRemoteItems.map(ri => {
                const isVariant = ri.product_details?.product !== undefined; // ProductVariant model structure
                const productId = ri.parent_product_id || ri.product_details?.product || ri.product;
                const variantId = isVariant ? ri.product : null;
                
                // Try to find if we already have it locally to preserve images and metadata
                const localMatch = localItems.find(li => li.productId === productId && li.variantId === variantId);
                
                if (localMatch) {
                   return { ...localMatch, quantity: ri.quantity };
                }

                return {
                  productId: productId,
                  variantId: variantId,
                  name: ri.product_details?.name || "Produit",
                  sku: ri.product_details?.sku || "SKU",
                  price: ri.product_details?.price || "0",
                  compareAtPrice: null,
                  image: ri.primary_image || null,
                  productImage: ri.primary_image || null,
                  quantity: ri.quantity,
                  maxStock: ri.product_details?.stock || 99,
                  currency: "FCFA",
                  slug: ri.slug || "produit",
                };
             });

             set({ items: mergedItems });
          }
        }
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
