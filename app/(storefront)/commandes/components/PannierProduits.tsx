/**
 * CartDrawer — Slide-over panier ultra-premium luxueux
 * @module components/cart/CartDrawer
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";

export default function CartDrawer() {
  const { items, isDrawerOpen, toggleDrawer, updateQuantity, removeItem, getTotal, getItemCount, clearCart, syncCart } = useCartStore();
  const authStatus = useAuthStore((state) => state.status);
  const itemCount = getItemCount();
  const total = getTotal();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Sync cart on drawer open if authenticated
  useEffect(() => {
    if (isDrawerOpen && authStatus === "authenticated") {
      syncCart().catch(console.error);
    }
  }, [isDrawerOpen, authStatus, syncCart]);

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
  const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 };
  const EASE_OUT_CUBIC: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: SPRING_SMOOTH },
    exit: { opacity: 0, scale: 0.9, filter: "blur(4px)", transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay avec blur prononcé */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: EASE_OUT_CUBIC }}
            className="fixed inset-0 z-[100] cursor-pointer bg-[#0D2E1E]/50"
            onClick={() => toggleDrawer(false)}
          />

          {/* Drawer ultra-premium */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: "100%", opacity: 0.5, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 280, mass: 0.9 }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full flex-col bg-[#FDFBF7] shadow-[0_0_80px_rgba(13,46,30,0.25)] sm:w-[480px] border-l border-[#e7dfd2]/50 overflow-hidden"
          >
            {/* Texture discrète */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-multiply"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              }}
            />

            {/* Header avec Glassmorphism */}
            <div className="relative z-20 flex flex-col border-b border-[#e7dfd2]/60 bg-white/80 backdrop-blur-xl px-7 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={SPRING_SNAPPY}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4d3f] to-[#123128] text-[#D4AF37] shadow-lg shadow-[#1f4d3f]/20"
                  >
                    <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
                  </motion.div>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#1f241c]">Mon Panier</h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8924A] mt-0.5">
                      {itemCount} article{itemCount !== 1 ? 's' : ''} exclusif{itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearCart}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d94a4a] transition-all hover:bg-red-50"
                    >
                      Vider
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => toggleDrawer(false)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f3ede2]/50 text-[#5c6a59] backdrop-blur-md transition-all hover:bg-[#e7dfd2]"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="relative z-10 flex-1 overflow-y-auto px-7 py-6 custom-scrollbar">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, ...SPRING_SMOOTH }}
                  className="flex h-full flex-col items-center justify-center gap-8 text-center"
                >
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-xl shadow-[#e7dfd2]/50 border border-[#e7dfd2]/40">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20"
                    />
                    <ShoppingBag className="h-12 w-12 text-[#8a9086]/40" strokeWidth={1} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-display font-bold tracking-tight text-[#1f241c]">Votre panier est vide</p>
                    <p className="text-sm font-medium text-[#8a9086] max-w-[280px] mx-auto leading-relaxed">
                      Découvrez notre sélection rigoureuse de produits du terroir.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => toggleDrawer(false)}
                    className="group flex cursor-pointer items-center gap-3 rounded-full bg-[#1f4d3f] px-9 py-4 text-sm font-bold text-white shadow-xl shadow-[#1f4d3f]/20 transition-all hover:bg-[#17392f] hover:shadow-2xl hover:-translate-y-1"
                  >
                    Explorer la boutique
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </Link>
                </motion.div>
              ) : (
                <motion.ul
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-5"
                >
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.li
                        key={`${item.productId}-${item.variantId || ''}`}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="group flex gap-5 rounded-2xl border border-[#e7dfd2]/80 bg-white p-4 shadow-sm transition-all hover:shadow-xl hover:shadow-[#e7dfd2]/40 hover:border-[#D4AF37]/40"
                      >
                        {/* Image */}
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#f8f6f0]">
                          {(() => {
                            const key = `${item.productId}-${item.variantId ?? 'null'}`;
                            const imgPrimary = item.image || item.productImage;
                            const imgFallback = failedImages.has(key) ? item.productImage : null;
                            const imgSrc = failedImages.has(key) ? imgFallback : imgPrimary;
                            return imgSrc ? (
                              <Image
                                src={mediaUrl(imgSrc) || "/placeholder.png"}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="112px"
                                unoptimized
                                onError={() => setFailedImages((prev) => new Set(prev).add(key))}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-[#8a9086]/20" />
                              </div>
                            );
                          })()}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={() => { useUIStore.getState().setActiveProductId(item.productId); toggleDrawer(false); }}
                                className="text-base font-bold leading-snug text-[#1f241c] hover:text-[#1f4d3f] transition-colors line-clamp-2"
                              >
                                {item.name.split(" — ")[0]}
                              </Link>
                              {item.name.includes(" — ") && (
                                <span className="mt-1.5 inline-block rounded-md border border-[#e7dfd2] bg-[#f8f6f0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8b5e34]">
                                  {item.name.split(" — ").slice(1).join(" — ")}
                                </span>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: "#fee2e2" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.productId, item.variantId)}
                              className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-full bg-[#f8f6f0] text-red-400 transition-colors hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            {/* Quantity controls ultra-premium */}
                            <div className="flex items-center rounded-full border border-[#e7dfd2] bg-white p-0.5 shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#5c6a59] hover:bg-[#f8f6f0] hover:text-[#1f241c] transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="flex w-8 items-center justify-center text-[13px] font-black text-[#1f241c]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#1f4d3f] text-white hover:bg-[#123128] transition-colors shadow-md shadow-[#1f4d3f]/20"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-bold text-[#8a9086] opacity-0 group-hover:opacity-100 transition-opacity">
                                {formatCurrency(item.price, item.currency)} l'unité
                              </span>
                              <span className="text-lg font-black tracking-tight text-[#1f4d3f]">
                                {formatCurrency(String(parseFloat(item.price) * item.quantity), item.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* Footer — Totals + CTA */}
            {items.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, ...SPRING_SMOOTH }}
                className="relative z-20 border-t border-[#e7dfd2]/60 bg-white/90 backdrop-blur-xl p-7 shadow-[0_-10px_40px_rgba(31,36,28,0.04)]"
              >
                {/* Liseré Or/Émeraude décoratif */}
                <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-[#1f4d3f] via-[#D4AF37] to-[#1f4d3f] opacity-80" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="font-semibold text-[#8a9086]">Sous-total</span>
                    <span className="font-bold text-[#1f241c]">{formatCurrency(String(total), "FCFA")}</span>
                  </div>
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="font-semibold text-[#8a9086]">Expédition</span>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-[#D4AF37]">Calculée au paiement</span>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-[#e7dfd2]" />

                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-[#1f241c]">Total</span>
                  <span className="text-4xl font-black tracking-tighter text-[#1f4d3f]">
                    {formatCurrency(String(total), "FCFA")}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#D4AF37]" strokeWidth={2.5} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#5c6a59]">Transactions chiffrées & sécurisées</span>
                </div>

                {/* CTAs Luxueux */}
                <div className="mt-6 space-y-3">
                  <Link
                    href="/commandes"
                    onClick={() => toggleDrawer(false)}
                    className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1f4d3f] to-[#123128] py-4.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)]"
                  >
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.2) 40%, transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                    />
                    <span className="relative">Finaliser la commande</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </Link>
                  <button
                    onClick={() => toggleDrawer(false)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#e7dfd2] bg-transparent py-4 text-sm font-bold uppercase tracking-widest text-[#5c6a59] transition-all hover:border-[#1f4d3f] hover:text-[#1f4d3f] hover:bg-[#f8f6f0]"
                  >
                    Poursuivre la visite
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
