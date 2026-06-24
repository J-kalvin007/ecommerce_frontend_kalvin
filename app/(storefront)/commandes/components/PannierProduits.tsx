/**
 * CartDrawer — Slide-over panier premium
 * @module components/cart/CartDrawer
 */

"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";

export default function CartDrawer() {
  const { items, isDrawerOpen, toggleDrawer, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();

  // Bloquer le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cursor-pointer fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => toggleDrawer(false)}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-surface-elevated shadow-2xl sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold">Mon Panier</h2>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {itemCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-error-light hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Vider
                  </button>
                )}
                <button
                  onClick={() => toggleDrawer(false)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-surface-alt"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-alt">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Votre panier est vide</p>
                    <p className="mt-1 text-sm text-muted">Ajoutez des produits pour commencer</p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => toggleDrawer(false)}
                    className="flex items-center cursor-pointer gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
                  >
                    Explorer la boutique
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 rounded-2xl border border-border bg-surface p-3"
                    >
                      {/* Image */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => toggleDrawer(false)}
                            className="text-sm font-semibold leading-snug text-foreground hover:text-primary line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <div className="flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center rounded-lg border border-border">
                            <button
                              onClick={() => updateQuantity(item.productId, null, item.quantity - 1)}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-l-lg hover:bg-surface-alt"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-7 w-8 items-center justify-center border-x border-border text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, null, item.quantity + 1)}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-r-lg hover:bg-surface-alt"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          {/* Price */}
                          <span className="text-sm font-bold">
                            {formatCurrency(String(parseFloat(item.price) * item.quantity), item.currency)}
                          </span>
                        </div>
                      </div>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId, null)}
                        className="flex h-7 w-7 cursor-pointer shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-error-light hover:text-error"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — Totals + CTA */}
            {items.length > 0 && (
              <div className="border-t border-border bg-surface p-6">
                {/* Sous-total */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Sous-total</span>
                  <span className="font-semibold">{formatCurrency(String(total), "FCFA")}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted">Livraison</span>
                  <span className="text-xs text-success font-medium">Calculée au checkout</span>
                </div>
                <div className="my-3 border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(String(total), "FCFA")}</span>
                </div>
                {/* CTAs */}
                <div className="mt-4 space-y-2">
                  <Link
                    href="/commandes"
                    onClick={() => toggleDrawer(false)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-glow-strong"
                  >
                    Passer la commande
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => toggleDrawer(false)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold transition-all hover:bg-surface-alt"
                  >
                    Continuer les achats
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
