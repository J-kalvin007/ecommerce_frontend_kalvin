/**
 * CartDrawer — Slide-over panier premium
 * @module components/cart/CartDrawer
 */

"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";

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

  // Constantes d'animation premium
  const SPRING_SMOOTH = { type: "spring" as const, stiffness: 280, damping: 26, mass: 1.1 };
  const SPRING_SNAPPY = { type: "spring" as const, stiffness: 500, damping: 34, mass: 0.75 };
  const EASE_OUT_CUBIC: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay avec léger flou */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
            className="fixed inset-0 z-[100] cursor-pointer bg-[#0D2E1E]/40 backdrop-blur-sm"
            onClick={() => toggleDrawer(false)}
          />
          
          {/* Drawer ultra-premium */}
          <motion.div
            initial={{ x: "100%", filter: "brightness(0.9)" }}
            animate={{ x: 0, filter: "brightness(1)" }}
            exit={{ x: "100%", filter: "brightness(0.9)" }}
            transition={{ type: "spring", damping: 28, stiffness: 260, mass: 0.8 }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full flex-col bg-[#F7F5F0] shadow-[0_0_60px_rgba(13,46,30,0.15)] sm:w-[460px] border-l border-[#e7dfd2] overflow-hidden"
          >
            {/* Texture discrète */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              }}
            />

            {/* Header */}
            <div className="relative z-10 flex flex-col border-b border-[#e7dfd2] bg-white px-6 py-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f4d3f]/10 text-[#1f4d3f]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-[#1f241c]">Mon Panier</h2>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B8924A]">
                      {itemCount} article{itemCount !== 1 ? 's' : ''} sélectionné{itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearCart}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Vider
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => toggleDrawer(false)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e7dfd2] bg-white text-[#5c6a59] transition-colors hover:bg-[#f3ede2]"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, ...SPRING_SMOOTH }}
                  className="flex h-full flex-col items-center justify-center gap-6 text-center"
                >
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm border border-[#e7dfd2]">
                    <div className="absolute inset-0 rounded-full border border-[#B8924A]/20 scale-110" />
                    <ShoppingBag className="h-10 w-10 text-[#8a9086]/50" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#1f241c]">Votre panier est vide</p>
                    <p className="mt-2 text-sm font-medium text-[#8a9086] max-w-[250px] mx-auto">
                      Découvrez nos produits du terroir exclusifs et commencez vos achats.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => toggleDrawer(false)}
                    className="group flex cursor-pointer items-center gap-2 rounded-full bg-[#1f4d3f] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#17392f] hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Explorer la boutique
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => (
                      <motion.li
                        key={`${item.productId}-${item.variantId || ''}`}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                        transition={{ delay: i * 0.05, ...SPRING_SMOOTH }}
                        className="group flex gap-4 rounded-2xl border border-[#e7dfd2] bg-white p-3 shadow-sm transition-shadow hover:shadow-md hover:border-[#B8924A]/30"
                      >
                        {/* Image */}
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3ede2]">
                          {item.image ? (
                            <Image 
                              src={mediaUrl(item.image) || "/placeholder.png"} 
                              alt={item.name} 
                              fill 
                              className="object-cover transition-transform duration-500 group-hover:scale-105" 
                              sizes="96px" 
                              unoptimized // INDISPENSABLE POUR EVITER LES ERREURS NEXT.JS EN DEV ET IP LOCALES
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-[#8a9086]/30" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={() => { useUIStore.getState().setActiveProductId(item.productId); toggleDrawer(false); }}
                              className="text-sm font-bold leading-tight text-[#1f241c] hover:text-[#1f4d3f] line-clamp-2 transition-colors"
                            >
                              {item.name}
                            </Link>
                            {/* Remove button moved top right */}
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "#fee2e2" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.productId, item.variantId)}
                              className="flex h-7 w-7 cursor-pointer shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:text-red-600 -mr-1 -mt-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                          
                          <div className="flex items-end justify-between mt-3">
                            {/* Quantity controls premium */}
                            <div className="flex items-center rounded-full border border-[#e7dfd2] bg-[#F7F5F0]">
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-l-full text-[#5c6a59] hover:bg-[#e7dfd2] transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="flex h-8 w-8 items-center justify-center text-[13px] font-bold text-[#1f241c]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-r-full text-[#5c6a59] hover:bg-[#e7dfd2] transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {/* Price */}
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-semibold text-[#8a9086] line-through opacity-0 group-hover:opacity-100 transition-opacity">
                                {formatCurrency(item.price, item.currency)}/u
                              </span>
                              <span className="text-base font-black text-[#1f4d3f]">
                                {formatCurrency(String(parseFloat(item.price) * item.quantity), item.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer — Totals + CTA */}
            {items.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, ...SPRING_SMOOTH }}
                className="relative z-10 border-t border-[#e7dfd2] bg-white p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]"
              >
                {/* Liseré décoratif haut */}
                <div className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-[#1f4d3f] via-[#2F9E6F] to-[#B8924A]" />
                
                {/* Sous-total */}
                <div className="flex items-center justify-between text-[15px]">
                  <span className="font-semibold text-[#5c6a59]">Sous-total</span>
                  <span className="font-bold text-[#1f241c]">{formatCurrency(String(total), "FCFA")}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[15px]">
                  <span className="font-semibold text-[#5c6a59]">Livraison</span>
                  <span className="text-[13px] font-bold text-[#B8924A]">Calculée au checkout</span>
                </div>
                
                <div className="my-4 border-t border-dashed border-[#e7dfd2]" />
                
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-[#1f241c]">Total</span>
                  <span className="text-3xl font-black tracking-tight text-[#1f4d3f]">{formatCurrency(String(total), "FCFA")}</span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="h-4 w-4 text-[#1f4d3f]" />
                  <span className="text-xs font-semibold text-[#5c6a59]">Paiement 100% sécurisé</span>
                </div>

                {/* CTAs */}
                <div className="mt-5 space-y-3">
                  <Link
                    href="/commandes"
                    onClick={() => toggleDrawer(false)}
                    className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-[#1f4d3f] py-4 text-sm font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(31,77,63,0.3)]"
                  >
                    {/* Shimmer */}
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1.5 }}
                    />
                    <span className="relative">Passer la commande</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={() => toggleDrawer(false)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#e7dfd2] bg-white py-3.5 text-sm font-bold text-[#1f241c] transition-all hover:border-[#1f4d3f] hover:text-[#1f4d3f] hover:bg-[#F7F5F0]"
                  >
                    Continuer les achats
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
