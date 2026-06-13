/**
 * favorisClient — Page de souhaits interactive
 * @module app/favoris/FavorisClient
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

/** Mock favoris data */
const INITIAL_favoris = [
  { id: "1", name: "Huile d'Olive Extra Vierge — Toscane IGP", slug: "huile-olive-toscane-igp", price: "16500", compare_at_price: "21000", currency: "FCFA", image: "/assets/images/img_01.png", category: "Huiles", rating: 4.8, stock: true },
  { id: "2", name: "Safran Pure de la Mancha — 1g", slug: "safran-mancha-1g", price: "8500", compare_at_price: null, currency: "FCFA", image: "/assets/images/img_10.png", category: "Épices", rating: 4.9, stock: true },
  { id: "4", name: "Thé Matcha Cérémoniel — Uji, Kyoto", slug: "the-matcha-ceremoniel-uji", price: "19500", compare_at_price: null, currency: "FCFA", image: "/assets/images/img_11.png", category: "Thés", rating: 4.6, stock: true },
  { id: "5", name: "Vinaigre Balsamique de Modène — 25 ans", slug: "vinaigre-balsamique-modene-25", price: "29500", compare_at_price: "35000", currency: "FCFA", image: "/assets/images/img_08.jpg", category: "Vinaigres", rating: 5.0, stock: false },
];

export default function FavorisClient() {
  const [favoris, setfavoris] = useState(INITIAL_favoris);
  const addItem = useCartStore((s) => s.addItem);

  const removeFromfavoris = (id: string) => {
    setfavoris((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (item: typeof INITIAL_favoris[0]) => {
    addItem({
      productId: item.id, variantId: null, name: item.name, sku: item.slug,
      price: item.price, compareAtPrice: item.compare_at_price, image: item.image,
      quantity: 1, maxStock: 99, currency: item.currency, slug: item.slug,
    });
  };

  return (
    <div className="page-transition">
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Ma liste de souhaits</h1>
          </div>
          <p className="mt-2 text-muted">{favoris.length} produit{favoris.length !== 1 ? "s" : ""} sauvegardé{favoris.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        {favoris.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-alt">
              <Heart className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-lg font-semibold">Votre liste est vide</p>
              <p className="mt-1 text-sm text-muted">Parcourez notre boutique et ajoutez vos coups de cœur</p>
            </div>
            <Link href="/products" className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
              Découvrir la boutique <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {favoris.map((item) => {
                const hasDiscount = item.compare_at_price && parseFloat(item.compare_at_price) > parseFloat(item.price);
                return (
                  <motion.div key={item.id} layout exit={{ opacity: 0, x: -100 }}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center">
                    {/* Image */}
                    <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                    </Link>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.category}</p>
                      <Link href={`/products/${item.slug}`} className="mt-0.5 text-sm font-semibold text-foreground hover:text-primary line-clamp-1">
                        {item.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={cn("h-3 w-3", s <= Math.round(item.rating) ? "fill-highlight text-highlight" : "fill-border text-border")} />
                        ))}
                        <span className="text-xs text-muted ml-1">{item.rating}</span>
                      </div>
                    </div>
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">{formatCurrency(item.price, item.currency)}</span>
                      {hasDiscount && <span className="text-sm text-muted line-through">{formatCurrency(item.compare_at_price!, item.currency)}</span>}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => addToCart(item)} disabled={!item.stock}
                        className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                          item.stock ? "bg-primary text-white hover:bg-primary-hover" : "cursor-not-allowed bg-surface-alt text-muted")}>
                        <ShoppingBag className="h-4 w-4" />
                        {item.stock ? "Ajouter" : "Rupture"}
                      </button>
                      <button onClick={() => removeFromfavoris(item.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-error/30 hover:bg-error-light hover:text-error">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
