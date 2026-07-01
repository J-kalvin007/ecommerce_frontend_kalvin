


/**
 * @file ProduitsFavoris.tsx  (HomeTrendingProducts)
 * @description Section "Les plus demandés" — édition ultra-premium.
 *
 * Cohérence totale avec le design system établi :
 *  - Palette : Forest #0D2E1E · Jade #2F9E6F · Ember #E8711A · Champagne #F5E6C8
 *  - shimmerBeam sur la modal (même keyframe que PromoOfferCard)
 *  - Springs Framer Motion alignés (stiffness 280-300, damping 26-30)
 *  - Halos d'ambiance identiques à PubSection / AgriShowcaseSection
 *
 * Signature exclusive — "Rank Indicator" :
 *  Pastille numérotée #1/#2/#3/#4 en coin supérieur gauche de l'image,
 *  avec dégradé forest→jade. Encode visuellement le classement issu des
 *  données réelles (tri par order_count desc) — pas purement décoratif.
 *
 * Architecture :
 *  ┌- HomeTrendingProducts     (orchestrateur : fetch, état, modal)
 *  │   ├- TrendingProductSkeleton  (squelette champagne pulsé avec stagger)
 *  │   ├- SectionHeader            (eyebrow + titre + CTA)
 *  │   ├- TrendingProductCard      (carte produit avec rank indicator)
 *  │   ├- EmptyState               (état vide avec CTA direction)
 *  │   └- ProductDetailModal       (modal glassmorphism profond)
 *
 * Patterns :
 *  - IIFE async dans useEffect avec cleanup flag
 *  - getPrimaryImageUrl : support objet ET string (API inconsistante)
 *  - formatWeight : conversion g→kg avec trim des .0 inutiles
 *  - openModal : fetch détail à la demande (pas de prefetch)
 *  - Accessibilité : role="dialog", aria-modal, aria-labelledby, aria-busy
 */

"use client";

import { useUIStore } from "@/store/uiStore";
import { useEffect, useState, useCallback, useId } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
  X,
  Scale,
  Weight,
  Package,
  Leaf,
  Tag,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPublicProducts, getPublicProductById } from "@/fonctions_api/produits.api";
import type { ProductList, ProductDetail } from "@/modeles/produits";
import { mediaUrl } from "@/lib/mediaUrl";

/* --- Keyframes globaux ----------------------------------------------------- */

/**
 * shimmerBeam   : cohérent avec PromoOfferCard / AgriShowcaseSection
 * rankGlow      : pulsation subtile sur la pastille de rang
 * stockPulse    : indicateur stock disponible (vert jade)
 */
const GLOBAL_KEYFRAMES = `
  @keyframes shimmerBeam {
    0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
    12%  { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateX(240%) skewX(-18deg); opacity: 0; }
  }
  @keyframes rankGlow {
    0%, 100% { box-shadow: 0 4px 16px rgba(13,46,30,0.35), 0 0 0 0 rgba(47,158,111,0); }
    50%       { box-shadow: 0 4px 16px rgba(13,46,30,0.35), 0 0 0 5px rgba(47,158,111,0.18); }
  }
  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,113,26,0); }
    50%       { box-shadow: 0 0 0 6px rgba(232,113,26,0.15); }
  }
  @keyframes stockDot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

/* --- Variants Framer Motion ------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* --- Utilitaires ----------------------------------------------------------- */

/**
 * Convertit un grammage en chaîne lisible ("1.5 kg", "250 g").
 * Supprime le suffixe ".0" inutile pour les entiers.
 */
function formatWeight(grams: number | null | undefined): string {
  if (!grams || grams <= 0) return "";
  if (grams >= 1000) return `${(grams / 1000).toFixed(1).replace(/\.0$/, "")} kg`;
  return `${grams} g`;
}

/**
 * Extrait l'URL d'image principale d'un produit.
 * Supporte les deux formes retournées par l'API (string ou objet {image}).
 */
function getPrimaryImageUrl(product: ProductList): string | null {
  const img = product.primary_image;
  if (!img) return null;
  if (typeof img === "string") return img;
  return (img as unknown as Record<string, unknown>).image as string ?? null;
}

/* --- Labels de rang -------------------------------------------------------- */

/** Étiquettes de rang avec leur couleur d'accent spécifique */
const RANK_CONFIG = [
  { label: "#1", bg: "linear-gradient(135deg, #0D2E1E, #12422D)", accent: "#7EDBB4" },
  { label: "#2", bg: "linear-gradient(135deg, #12422D, #1B5E3F)", accent: "#A8E6C8" },
  { label: "#3", bg: "linear-gradient(135deg, #1B5E3F, #2F9E6F)", accent: "#F5E6C8" },
  { label: "#4", bg: "linear-gradient(135deg, #2F4F3F, #1B3D2F)", accent: "#E8D4A8" },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : TrendingProductSkeleton
   Squelette champagne pulsé — cohérent avec le fond clair de la section.
   Stagger visuel via animation-delay CSS passé en style inline.
═══════════════════════════════════════════════════════════════════════════ */
function TrendingProductSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255,250,240,0.9)",
        border: "1px solid rgba(13,46,30,0.07)",
        boxShadow: "0 8px 24px rgba(13,46,30,0.06)",
      }}
    >
      {/* Zone image */}
      <div
        className="aspect-square animate-pulse"
        style={{
          background: "linear-gradient(145deg, #F0EBE0, #E8E0D2)",
          animationDelay: `${delay}s`,
        }}
      />
      {/* Zone texte */}
      <div className="space-y-2.5 p-4">
        <div
          className="h-2.5 w-14 animate-pulse rounded-full"
          style={{ background: "#E8E0D2", animationDelay: `${delay + 0.05}s` }}
        />
        <div
          className="h-4 w-4/5 animate-pulse rounded"
          style={{ background: "#E8E0D2", animationDelay: `${delay + 0.08}s` }}
        />
        <div
          className="h-3 w-full animate-pulse rounded"
          style={{ background: "#EDE8E0", animationDelay: `${delay + 0.1}s` }}
        />
        <div className="mt-4 flex justify-between border-t border-black/5 pt-4">
          <div
            className="h-4 w-20 animate-pulse rounded"
            style={{ background: "#E8E0D2", animationDelay: `${delay + 0.12}s` }}
          />
          <div
            className="h-7 w-16 animate-pulse rounded-full"
            style={{ background: "#E8E0D2", animationDelay: `${delay + 0.14}s` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : RankBadge
   Pastille de rang #1/#2/#3/#4 — SIGNATURE du composant.
   Dégradé forest→jade, glow pulsant, position angle supérieur gauche.
   Justifié par les données réelles (tri order_count desc).
═══════════════════════════════════════════════════════════════════════════ */
function RankBadge({ rank }: { rank: number }) {
  const config = RANK_CONFIG[rank] ?? RANK_CONFIG[3];

  return (
    <div
      className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-black text-white"
      style={{
        background: config.bg,
        animation: rank === 0 ? "rankGlow 2.8s ease-in-out infinite" : undefined,
        boxShadow: "0 4px 16px rgba(13,46,30,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
        border: `1.5px solid ${config.accent}40`,
        letterSpacing: "0.01em",
      }}
      aria-label={`Rang ${rank + 1}`}
    >
      {config.label}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : StockBadge
   Badge de disponibilité stock — vert jade ou rouge discret.
═══════════════════════════════════════════════════════════════════════════ */
function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <div
      className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest"
      style={
        inStock
          ? {
            background: "rgba(47,158,111,0.15)",
            border: "1px solid rgba(47,158,111,0.3)",
            color: "#1B5E3F",
            backdropFilter: "blur(8px)",
          }
          : {
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.2)",
            color: "#991B1B",
            backdropFilter: "blur(8px)",
          }
      }
    >
      {/* Dot animé pour "en stock" */}
      {inStock && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: "#2F9E6F",
            animation: "stockDot 2s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
      )}
      {inStock ? "Dispo" : "Épuisé"}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : StarRow
   Rangée d'étoiles avec rating numérique et compteur d'avis.
   Étoiles ember (#E8711A) pour cohérence avec le design system.
═══════════════════════════════════════════════════════════════════════════ */
function StarRow({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-sm";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={starSize}
          style={{
            fill: i < Math.floor(rating) ? "#E8711A" : "transparent",
            color: i < Math.floor(rating) ? "#E8711A" : "rgba(13,46,30,0.2)",
          }}
          aria-hidden="true"
        />
      ))}
      {rating > 0 && (
        <span
          className={`${textSize} font-black`}
          style={{ color: "#0D2E1E" }}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {count > 0 && (
        <span className={`${textSize}`} style={{ color: "rgba(13,46,30,0.4)" }}>
          ({count})
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : TrendingProductCard
   Carte produit premium — fond champagne verre dépoli, rank indicator,
   hover avec scale image + lift shadow (pas de translate -y).
═══════════════════════════════════════════════════════════════════════════ */
function TrendingProductCard({
  product,
  rank,
  onOpenModal,
}: {
  product: ProductList;
  rank: number;
  onOpenModal: (id: string) => void;
}) {
  const avgRating = parseFloat(product.note_produit) || 0;
  const imageUrl = getPrimaryImageUrl(product);
  const isOutOfStock = product.stock === 0;
  const currency = "FCFA";

  const description = product.category_name
    ? `Produit ${product.category_name.toLowerCase()} sélectionné pour sa qualité et sa fraîcheur.`
    : "Produit du terroir sélectionné pour sa qualité et sa fraîcheur.";

  return (
    <motion.article
      variants={cardVariants}
      onClick={() => onOpenModal(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpenModal(product.id)}
      aria-label={`Voir le détail de ${product.name}`}
      className="group cursor-pointer overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: "rgba(255,250,240,0.92)",
        border: "1px solid rgba(13,46,30,0.08)",
        boxShadow: "0 8px 28px rgba(13,46,30,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        backdropFilter: "blur(12px)",
        transition: "box-shadow 0.35s ease, transform 0.35s ease",
      }}
      whileHover={{
        boxShadow: "0 18px 44px rgba(13,46,30,0.14), 0 4px 12px rgba(0,0,0,0.06)",
        y: -3,
        transition: { type: "spring", stiffness: 300, damping: 22 },
      }}
    >
      {/* -- Zone image -- */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: "linear-gradient(145deg, #F5EEE3, #EDE5D8)" }}
      >
        {imageUrl ? (
          <Image
            src={mediaUrl(imageUrl) || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-xs"
            style={{ color: "rgba(13,46,30,0.3)" }}
          >
            Aucune image
          </div>
        )}

        {/* Overlay dégradé bas pour adoucir la transition image→texte */}
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              "linear-gradient(to top, rgba(245,238,227,0.7), transparent)",
          }}
          aria-hidden="true"
        />

        {/* Rank badge (SIGNATURE) */}
        <RankBadge rank={rank} />

        {/* Stock badge */}
        <StockBadge inStock={!isOutOfStock} />
      </div>

      {/* -- Zone texte -- */}
      <div className="p-4">
        {/* Catégorie */}
        {product.category_name && (
          <p
            className="mb-2 text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: "rgba(13,46,30,0.4)" }}
          >
            {product.category_name}
          </p>
        )}

        {/* Nom du produit */}
        <h3
          className="line-clamp-1 text-sm font-black leading-snug transition-colors duration-200 group-hover:text-[#0D2E1E]"
          style={{ color: "#1B3D2F", letterSpacing: "-0.01em" }}
        >
          {product.name}
        </h3>

        {/* Description courte */}
        <p
          className="mt-1.5 line-clamp-2 text-[11px] leading-[1.65]"
          style={{ color: "rgba(13,46,30,0.52)" }}
        >
          {description}
        </p>

        {/* Rating + favoris */}
        <div className="mt-3 flex items-center justify-between">
          <StarRow rating={avgRating} count={product.count_ratings} size="sm" />
          {product.count_favorites > 0 && (
            <div className="flex items-center gap-1">
              <Heart
                className="h-3 w-3"
                style={{ fill: "#F87171", color: "#F87171" }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(13,46,30,0.45)" }}
              >
                {product.count_favorites}
              </span>
            </div>
          )}
        </div>

        {/* Prix + CTA */}
        <div
          className="mt-4 flex items-end justify-between gap-2 border-t pt-4"
          style={{ borderColor: "rgba(13,46,30,0.07)" }}
        >
          <p
            className="text-base font-black"
            style={{ color: "#0D2E1E", letterSpacing: "-0.01em" }}
          >
            {formatCurrency(product.price, currency)}
          </p>

          <motion.span
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black text-white"
            style={{
              background: "linear-gradient(135deg, #E8711A, #F5A623)",
              boxShadow: "0 4px 12px rgba(232,113,26,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              letterSpacing: "0.02em",
            }}
          >
            <ShoppingBag className="h-3 w-3" aria-hidden="true" />
            Voir
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : SectionHeader
   En-tête de section : eyebrow TrendingUp, titre, description, CTA.
   Cohérent typographiquement avec PubSection / AgriShowcaseSection.
═══════════════════════════════════════════════════════════════════════════ */
function SectionHeader() {
  return (
    <motion.div
      variants={itemVariants}
      className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="max-w-5xl">
        {/* Eyebrow badge */}
        {/* <div
          className="mb-3.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
          style={{
            background: "rgba(232,113,26,0.08)",
            border: "1px solid rgba(232,113,26,0.2)",
            color: "#E8711A",
            animation: "badgePulse 3.2s ease-in-out infinite",
          }}
        >
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          Sélection
        </div> */}

        {/* Titre */}
        {/* <h2
          className="text-2xl font-black tracking-tight sm:text-3xl"
          style={{ color: "#0D2E1E", letterSpacing: "-0.025em" }}
        >
          Les plus demandés
        </h2> */}












        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          {/* Eyebrow avec ligne dorée */}
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9a96e]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9a96e]">
              Sélection exclusive
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a96e]" />
          </div>

          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-[#0D2E1E] sm:text-4xl lg:text-5xl"
          >
            Les plus demandés,{" "}
            <span className="relative inline-block">
              <span className="text-[#c9a96e]">Nos meilleures ventes</span>
              {/* Soulignement doré dessiné */}
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] rounded-full"
                style={{ background: "linear-gradient(to right, #c9a96e, #f5d98b)" }}
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              />
            </span>
          </h2>


        </motion.div>



      </div>

      {/* CTA "Voir tout" */}
      <Link
        href="/products"
        className="group inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300"
        style={{
          background: "rgba(13,46,30,0.06)",
          border: "1px solid rgba(13,46,30,0.12)",
          color: "#0D2E1E",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "linear-gradient(135deg, #12422D, #0D2E1E)";
          (e.currentTarget as HTMLElement).style.color = "#fff";
          (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 16px rgba(13,46,30,0.25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(13,46,30,0.06)";
          (e.currentTarget as HTMLElement).style.color = "#0D2E1E";
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(13,46,30,0.12)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <span>Voir tout</span>
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : EmptyState
   État vide avec direction claire — pas de gris mélancolique.
═══════════════════════════════════════════════════════════════════════════ */
function EmptyState() {
  return (
    <div
      className="rounded-2xl px-8 py-12 text-center"
      style={{
        background: "rgba(255,250,240,0.7)",
        border: "1.5px dashed rgba(13,46,30,0.15)",
      }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "rgba(47,158,111,0.1)" }}
      >
        <Package className="h-5 w-5" style={{ color: "#2F9E6F" }} />
      </div>
      <p
        className="text-sm font-black"
        style={{ color: "#0D2E1E" }}
      >
        Aucun produit disponible pour le moment.
      </p>
      <p
        className="mt-1.5 text-xs"
        style={{ color: "rgba(13,46,30,0.45)" }}
      >
        Les produits marqués comme top dans l&apos;admin apparaîtront ici.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : ProductDetailModal
   Modal glassmorphism profond — overlay dégradé forest, panneau champagne,
   shimmerBeam sur la zone image, étoiles ember, badge stock jade.
═══════════════════════════════════════════════════════════════════════════ */
function ProductDetailModal({
  product,
  onClose,
}: {
  product: ProductDetail;
  onClose: () => void;
}) {
  const titleId = useId();
  const avgRating = parseFloat(product.note_produit) || 0;
  const mainImage = product.primary_image || product.images?.[0]?.image || null;
  const weightDisplay = formatWeight(product.weight_grams);
  const currency = "FCFA";
  const isInStock = product.stock > 0;

  /* Étiquette du type produit */
  const productTypeLabel =
    product.product_type === "RAW"
      ? "Brut"
      : product.product_type === "PROCESSED"
        ? "Transformé"
        : "Export";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* -- Overlay glassmorphism forest profond -- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, rgba(13,46,30,0.78), rgba(0,0,0,0.65))",
          backdropFilter: "blur(14px)",
        }}
      />

      {/* -- Panneau modal -- */}
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl"
        style={{
          background: "rgba(255,252,246,0.98)",
          boxShadow:
            "0 32px 80px rgba(13,46,30,0.35), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(47,158,111,0.12)",
        }}
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* -- Bouton fermer -- */}
        <motion.button
          onClick={onClose}
          aria-label="Fermer le détail produit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 cursor-pointer top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{
            background: "rgba(13,46,30,0.08)",
            border: "1px solid rgba(13,46,30,0.1)",
            color: "#0D2E1E",
          }}
        >
          <X className="h-4 w-4" />
        </motion.button>

        <div className="flex flex-col overflow-y-auto md:flex-row">
          {/* -- Colonne image -- */}
          <div
            className="relative w-full overflow-hidden md:w-1/2"
            style={{ background: "linear-gradient(145deg, #F0E8D8, #E8DFC8)" }}
          >
            <div className="aspect-square w-full overflow-hidden">
              {mainImage ? (
                <Image
                  src={mediaUrl(mainImage) || "/placeholder.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-sm"
                  style={{ color: "rgba(13,46,30,0.35)" }}
                >
                  Aucune image
                </div>
              )}
            </div>

            {/* shimmerBeam sur la zone image */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                  animation: "shimmerBeam 4s ease-in-out 1s infinite",
                }}
              />
            </div>

            {/* Badge type produit */}
            <div
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
              style={{
                background: "rgba(13,46,30,0.75)",
                color: "#F5E6C8",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(245,230,200,0.2)",
              }}
            >
              {productTypeLabel}
            </div>

            {/* Badge poids */}
            {weightDisplay && (
              <div
                className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #E8711A, #F5A623)",
                  boxShadow: "0 4px 12px rgba(232,113,26,0.4)",
                }}
              >
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                {weightDisplay}
              </div>
            )}
          </div>

          {/* -- Colonne détails -- */}
          <div className="flex flex-col p-6 sm:p-7 md:w-1/2">
            {/* Catégorie */}
            {product.category?.name && (
              <div
                className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em]"
                style={{
                  background: "rgba(232,113,26,0.08)",
                  border: "1px solid rgba(232,113,26,0.2)",
                  color: "#E8711A",
                }}
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {product.category.name}
              </div>
            )}

            {/* Titre */}
            <h2
              id={titleId}
              className="font-display text-xl font-black leading-tight sm:text-2xl"
              style={{ color: "#0D2E1E", letterSpacing: "-0.02em" }}
            >
              {product.name}
            </h2>

            {/* Description */}
            {product.description && (
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "rgba(13,46,30,0.6)" }}
              >
                {product.description}
              </p>
            )}

            {/* Rating + favoris */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <StarRow rating={avgRating} count={product.count_ratings} size="md" />
              <div className="flex items-center gap-1.5">
                <Heart
                  className="h-4 w-4"
                  style={{ fill: "#F87171", color: "#F87171" }}
                  aria-hidden="true"
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "rgba(13,46,30,0.55)" }}
                >
                  {product.count_favorites}
                </span>
              </div>
            </div>

            {/* Prix + stock */}
            <div className="mt-5 flex items-center gap-3">
              <span
                className="text-2xl font-black"
                style={{ color: "#0D2E1E", letterSpacing: "-0.02em" }}
              >
                {formatCurrency(product.price, currency)}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black"
                style={
                  isInStock
                    ? {
                      background: "rgba(47,158,111,0.12)",
                      border: "1px solid rgba(47,158,111,0.25)",
                      color: "#1B5E3F",
                    }
                    : {
                      background: "rgba(220,38,38,0.08)",
                      border: "1px solid rgba(220,38,38,0.2)",
                      color: "#991B1B",
                    }
                }
              >
                {isInStock ? (
                  <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {isInStock ? "En stock" : "Rupture"}
              </span>
            </div>

            {/* Séparateur jade */}
            <div
              className="my-5 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(47,158,111,0.25), transparent)",
              }}
              aria-hidden="true"
            />

            {/* Détails techniques */}
            <div className="space-y-3">
              {product.weight_grams && (
                <div className="flex items-center gap-3 text-sm">
                  <Scale
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#2F9E6F" }}
                    aria-hidden="true"
                  />
                  <span style={{ color: "rgba(13,46,30,0.5)" }}>Poids</span>
                  <span
                    className="font-semibold"
                    style={{ color: "#0D2E1E" }}
                  >
                    {formatWeight(product.weight_grams)}
                  </span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-3 text-sm">
                  <Package
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#2F9E6F" }}
                    aria-hidden="true"
                  />
                  <span style={{ color: "rgba(13,46,30,0.5)" }}>SKU</span>
                  <span
                    className="font-semibold"
                    style={{ color: "#0D2E1E" }}
                  >
                    {product.sku}
                  </span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="flex items-center gap-3 text-sm">
                  <Leaf
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#2F9E6F" }}
                    aria-hidden="true"
                  />
                  <span style={{ color: "rgba(13,46,30,0.5)" }}>Stock</span>
                  <span
                    className="font-semibold"
                    style={{ color: "#0D2E1E" }}
                  >
                    {product.stock} unités
                  </span>
                </div>
              )}
            </div>

            {/* Variantes */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-5">
                <h3
                  className="mb-2.5 text-xs font-black uppercase tracking-[0.15em]"
                  style={{ color: "rgba(13,46,30,0.5)" }}
                >
                  Variantes disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <span
                      key={variant.id}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:-translate-y-0.5"
                      style={{
                        background: "rgba(13,46,30,0.06)",
                        border: "1px solid rgba(13,46,30,0.15)",
                        color: "#1f241c",
                      }}
                    >
                      {variant.name}
                      {variant.weight_grams != null && (
                        <span className="flex items-center gap-1 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-[#1f4d3f] shadow-sm">
                          <Weight className="h-3 w-3 opacity-90" />
                          {formatWeight(variant.weight_grams)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA fiche complète */}
            <div className="mt-7">
              <Link
                href={`/products/${product.slug}`}
                onClick={() => useUIStore.getState().setActiveProductId(product.id)}
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full py-3.5 text-sm font-black text-white transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #12422D 0%, #0D2E1E 100%)",
                  boxShadow:
                    "0 8px 24px rgba(13,46,30,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 12px 32px rgba(13,46,30,0.38), inset 0 1px 0 rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 24px rgba(13,46,30,0.28), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Voir la fiche complète
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT PRINCIPAL : HomeTrendingProducts
   Orchestrateur : fetch produits top, état modal, rendu grille + modal.
═══════════════════════════════════════════════════════════════════════════ */
export default function HomeTrendingProducts() {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -- État du modal -- */
  const [modalProduct, setModalProduct] = useState<ProductDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  /* -- Fetch produits top -- */
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getPublicProducts({ page_size: 20, is_top: true });

        if (!active) return;

        if (result.ok) {
          const data = result.data;
          let fetched: ProductList[] = Array.isArray(data)
            ? data
            : Array.isArray((data as { results?: ProductList[] }).results)
              ? (data as { results: ProductList[] }).results
              : [];

          /* Tri : order_count desc, puis rating desc */
          fetched.sort((a, b) => {
            const orderDiff = (b.order_count || 0) - (a.order_count || 0);
            if (orderDiff !== 0) return orderDiff;
            return (parseFloat(b.note_produit) || 0) - (parseFloat(a.note_produit) || 0);
          });

          setProducts(fetched.slice(0, 4));
        } else {
          throw new Error(result.error?.message || "Erreur de chargement");
        }
      } catch (err) {
        if (active) {
          console.error("Error loading trending products:", err);
          setError("Impossible de charger les produits les plus demandés.");
          setProducts([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  /* -- Ouverture du modal (fetch détail à la demande) -- */
  const openModal = useCallback(async (productId: string) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const result = await getPublicProductById(productId);
      if (result.ok) {
        setModalProduct(result.data);
      } else {
        setModalError(result.error?.message || "Erreur de chargement du détail");
      }
    } catch {
      setModalError("Erreur réseau lors du chargement du produit.");
    } finally {
      setModalLoading(false);
    }
  }, []);

  /* -- Fermeture du modal -- */
  const closeModal = useCallback(() => {
    setModalProduct(null);
    setModalError(null);
  }, []);

  return (
    <section
      className="relative overflow-hidden py-10 sm:py-12"
      aria-label="Section produits les plus demandés"
    >
      {/* Injection keyframes */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_KEYFRAMES }} />

      {/* -- Halos d'ambiance (cohérents avec tout le design system) -- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-[8%] top-8 h-36 w-36 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,113,26,0.07), transparent 70%)" }}
        />
        <div
          className="absolute right-[6%] top-20 h-44 w-44 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(47,158,111,0.07), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* -- En-tête -- */}
          <SectionHeader />

          {/* -- Message d'erreur API -- */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.18)",
                color: "#991B1B",
              }}
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </motion.div>
          )}

          {/* -- Grille produits -- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <TrendingProductSkeleton key={`trending-skeleton-${i}`} delay={i * 0.1} />
              ))
              : products.map((product, idx) => (
                <TrendingProductCard
                  key={product.id}
                  product={product}
                  rank={idx}
                  onOpenModal={openModal}
                />
              ))}
          </div>

          {/* -- État vide -- */}
          {!loading && products.length === 0 && !error && (
            <motion.div variants={itemVariants}>
              <EmptyState />
            </motion.div>
          )}

          {/* -- Lien secondaire "Explorer la collection" -- */}
          {!loading && products.length > 0 && (
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200"
                style={{ color: "rgba(13,46,30,0.45)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#E8711A";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(13,46,30,0.45)";
                }}
              >
                Explorer toute la collection
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* -- Modal AnimatePresence -- */}
      <AnimatePresence>
        {/* Spinner de chargement modal */}
        {modalLoading && !modalProduct && (
          <motion.div
            key="modal-spinner"
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
              background: "rgba(13,46,30,0.65)",
              backdropFilter: "blur(12px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-busy="true"
            aria-label="Chargement du produit…"
          >
            <div
              className="h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "rgba(47,158,111,0.6)", borderTopColor: "transparent" }}
            />
          </motion.div>
        )}

        {/* Erreur modal */}
        {modalError && !modalProduct && (
          <motion.div
            key="modal-error"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "rgba(13,46,30,0.65)",
              backdropFilter: "blur(12px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <div
              className="rounded-2xl p-7 text-center"
              style={{
                background: "rgba(255,252,246,0.98)",
                boxShadow: "0 24px 60px rgba(13,46,30,0.3)",
                border: "1px solid rgba(220,38,38,0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle
                className="mx-auto mb-3 h-8 w-8"
                style={{ color: "#DC2626" }}
              />
              <p
                className="font-semibold"
                style={{ color: "#0D2E1E" }}
              >
                {modalError}
              </p>
              <button
                onClick={closeModal}
                className="mt-4 text-sm font-black underline"
                style={{ color: "#E8711A" }}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}

        {/* Modal produit */}
        {modalProduct && (
          <ProductDetailModal
            key="modal-product"
            product={modalProduct}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </section>
  );
}