/**
 * FavoriteProductCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Carte d'un produit favori dans la grille des favoris du client.
 *
 * Affiche : image produit, nom, prix, date d'ajout, badge stock,
 * compteur de favoris et action de retrait (toggle).
 *
 * @module app/customer/notes-favoris/components/FavoriteProductCard
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Package,
  CalendarDays,
  Users,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FavoriteProduct } from "@/modeles/notes-favoris";
import { mediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

/* ── Utilitaires ────────────────────────────────────────────────────────── */

function formatPrice(price: string): string {
  const num = parseFloat(price || "0");
  if (isNaN(num)) return "—";
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " FCFA"
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface FavoriteProductCardProps {
  product: FavoriteProduct;
  index: number;
  onToggle: (productId: string) => Promise<void>;
  viewMode?: "grid" | "list";
}

/**
 * FavoriteProductCard
 *
 * Carte interactive avec image, infos produit, et bouton de retrait
 * des favoris avec animation de sortie fluide.
 */
export default function FavoriteProductCard({
  product,
  index,
  onToggle,
  viewMode = "grid",
}: FavoriteProductCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const imageUrl = mediaUrl(product.image);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onToggle(product.id);
    setIsRemoved(true);
    setIsRemoving(false);
  };

  return (
    <AnimatePresence>
      {!isRemoved && (
        <motion.article
          key={product.id}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92, y: -12 }}
          transition={{
            delay: index * 0.055,
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ y: -3 }}
          className={cn(
             "group relative overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_28px_-6px_rgba(31,77,63,0.12)] hover:border-[#1f4d3f]/20",
             viewMode === "list" ? "flex flex-col sm:flex-row items-stretch" : "flex flex-col"
          )}
        >
          {/* ── Image du produit ── */}
          <div className={cn(
            "relative overflow-hidden bg-[#F7F5F0]",
            viewMode === "list" ? "w-full sm:w-56 shrink-0 h-48 sm:h-auto" : "h-48 w-full"
          )}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-12 w-12 text-[#C4BFB6]" strokeWidth={1.5} />
              </div>
            )}

            {/* Badge stock */}
            <div className="absolute left-3 top-3">
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold shadow-sm ${
                  product.is_in_stock
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {product.is_in_stock ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : (
                  <XCircle className="h-2.5 w-2.5" />
                )}
                {product.is_in_stock ? "En stock" : "Épuisé"}
              </span>
            </div>

            {/* Bouton retrait des favoris */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              disabled={isRemoving}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:bg-red-50 disabled:opacity-60 cursor-pointer"
              title="Retirer des favoris"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
              ) : (
                <Heart
                  className="h-3.5 w-3.5 fill-red-500 text-red-500"
                  strokeWidth={2}
                />
              )}
            </motion.button>
          </div>

          {/* ── Infos du produit ── */}
          <div className={cn("p-4 flex flex-1 flex-col", viewMode === "list" ? "justify-center" : "")}>
            <h3 className="mb-1 truncate text-[16px] font-bold text-[#1f241c] leading-snug">
              {product.name}
            </h3>

            {/* Prix */}
            <p className="mb-3 text-[18px] font-black tracking-tight text-[#1f4d3f]">
              {formatPrice(product.price)}
            </p>

            {/* Méta : date + compteur */}
            <div className="flex items-center justify-between text-[13px] text-[#8A9080]">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(product.favorited_at)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {product.count_favorites} favori
                {product.count_favorites > 1 ? "s" : ""}
              </span>
            </div>

            {/* Lien vers le produit */}
            <Link
              href={`/products/${product.slug}`}
              onClick={() => useUIStore.getState().setActiveProductId(product.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border border-[#E8E3D8] py-2.5 text-[14px] font-semibold text-[#1f4d3f] transition-colors hover:border-[#1f4d3f]/25 hover:bg-[#1f4d3f]/5 cursor-pointer",
                viewMode === "list" ? "w-fit px-6 mt-4" : "w-full mt-3"
              )}
            >
              <ExternalLink className="h-3 w-3" strokeWidth={2} />
              Voir le produit
            </Link>
          </div>
        </motion.article>
      )}
    </AnimatePresence>
  );
}
