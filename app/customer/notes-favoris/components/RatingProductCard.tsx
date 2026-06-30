/**
 * RatingProductCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Carte d'un produit noté par le client dans l'onglet « Mes Notes ».
 *
 * Combine les données du produit favori (image, nom, prix) avec
 * le score de l'utilisateur, via une jointure côté frontend par product_id.
 *
 * Fonctionnalités :
 *   - Affichage des étoiles interactives (re-notation à la volée)
 *   - Mise à jour optimiste du score en attente de la réponse API
 *   - Bouton de suppression de la note
 *   - Note moyenne du produit affichée après action
 *
 * @module app/customer/notes-favoris/components/RatingProductCard
 */

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Package,
  Loader2,
  Trash2,
  CheckCircle2,
  ExternalLink,
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

/* ── Composant étoiles interactives ─────────────────────────────────────── */
interface StarRatingProps {
  value: number;
  onChange?: (score: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (readonly ? value : hoverValue || value) >= star;
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
          >
            <Star
              className={starSize}
              style={{
                fill: isFilled ? "#f59e0b" : "none",
                color: isFilled ? "#f59e0b" : "#D1CBC0",
              }}
              strokeWidth={1.75}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface RatingProductCardProps {
  product: FavoriteProduct;
  userScore: number;
  index: number;
  onRate: (productId: string, score: number) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
  viewMode?: "grid" | "list";
}

/**
 * RatingProductCard
 *
 * Carte de produit noté avec étoiles interactives pour re-noter,
 * bouton de suppression de note et affichage de la note actuelle.
 */
export default function RatingProductCard({
  product,
  userScore,
  index,
  onRate,
  onDelete,
  viewMode = "grid",
}: RatingProductCardProps) {
  const [currentScore, setCurrentScore] = useState(userScore);
  const [isRating, setIsRating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [justRated, setJustRated] = useState(false);

  const imageUrl = mediaUrl(product.image);

  /* ── Notation (mise à jour optimiste) ───────────────────────────────── */
  const handleRate = useCallback(
    async (score: number) => {
      if (score === currentScore || isRating) return;
      const previousScore = currentScore;
      setCurrentScore(score);
      setIsRating(true);

      await onRate(product.id, score);

      setIsRating(false);
      setJustRated(true);
      setTimeout(() => setJustRated(false), 2000);
    },
    [currentScore, isRating, onRate, product.id]
  );

  /* ── Suppression de note ────────────────────────────────────────────── */
  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await onDelete(product.id);
    // Le parent gère le retrait de la liste
  }, [onDelete, product.id]);

  return (
    <motion.article
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
        "group relative overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_28px_-6px_rgba(245,158,11,0.12)] hover:border-amber-200/60",
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

        {/* Badge note actuelle */}
        <div className="absolute left-3 top-3">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={2} />
            <span className="text-[13px] font-black text-amber-600">
              {currentScore}/5
            </span>
          </div>
        </div>

        {/* Bouton suppression */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-colors hover:bg-red-50 disabled:opacity-60 cursor-pointer"
          title="Supprimer ma note"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
          ) : (
            <Trash2 className="h-3.5 w-3.5 text-red-400" strokeWidth={2} />
          )}
        </motion.button>
      </div>

      {/* ── Corps de la carte ── */}
      <div className={cn("p-4 flex flex-1 flex-col", viewMode === "list" ? "justify-center" : "")}>
        <h3 className="mb-1 truncate text-[16px] font-bold text-[#1f241c] leading-snug">
          {product.name}
        </h3>

        <p className="mb-3 text-[17px] font-black tracking-tight text-[#1f4d3f]">
          {formatPrice(product.price)}
        </p>

        {/* Étoiles interactives */}
        <div className="mb-3">
          <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8A9080]">
            Ma note
          </p>
          <div className="flex items-center gap-2">
            <StarRating
              value={currentScore}
              onChange={handleRate}
              size="md"
            />
            {/* Indicateurs d'état */}
            <AnimatePresence mode="wait">
              {isRating && (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[13px] text-amber-500"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Enregistrement…
                </motion.div>
              )}
              {justRated && !isRating && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[13px] text-emerald-500"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Mis à jour !
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Lien vers le produit */}
        <Link
          href={`/products/${product.slug}`}
          onClick={() => useUIStore.getState().setActiveProductId(product.id)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border border-[#E8E3D8] py-2.5 text-[14px] font-semibold text-[#1f4d3f] transition-colors hover:border-[#1f4d3f]/25 hover:bg-[#1f4d3f]/5 cursor-pointer",
            viewMode === "list" ? "w-fit px-6 mt-4" : "w-full mt-auto"
          )}
        >
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
          Voir le produit
        </Link>
      </div>
    </motion.article>
  );
}
