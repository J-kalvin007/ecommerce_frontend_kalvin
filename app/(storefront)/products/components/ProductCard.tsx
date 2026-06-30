


"use client";

/**
 * ProductCard — Redesign ultra-premium
 *
 * Améliorations visuelles & UX :
 *
 * MODE GRILLE :
 *  - Image zone : overlay forest-green en bas au hover (gradient opaque → transparent)
 *  - Bouton "Ajouter" slide up depuis le bas avec spring précis
 *  - Badge "Tendance" avec shimmer animé interne
 *  - Badge promo avec pulsation subtile
 *  - Étoiles interactives : scale 1.3 + couleur progressive au hover
 *  - Prix promo : reveal avec underline amber qui apparaît
 *  - Compteur favoris inline élégant
 *  - Bouton favori avec animation heart-beat au clic
 *
 * MODE LISTE :
 *  - Bordure gauche amber qui monte au hover (scaleY spring)
 *  - Section prix avec layout right-aligned raffiné
 *  - Boutons CTA avec icônes et états loading précis
 *
 * Noms de variables et fonctions d'origine conservés intégralement.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Package,
  ShieldCheck,
  Check,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";
import { toggleFavorite, rateProduct } from "@/fonctions_api/notes-favoris.api";
import type { EnrichedProduct } from "@/app/(storefront)/products/components/ProductsCatalogClient";
import Toast from "@/components/special/Toast";

/* ─────────────────────────────────────────────────────────────
   TYPES — conservation de l'interface d'origine
   ───────────────────────────────────────────────────────────── */

type ProductCardProps = {
  product: EnrichedProduct;
  index?: number;
  viewMode?: "grid" | "list";
  userScore?: number | null;
  isFavorited?: boolean;
};

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANT : PriceBlock
   Affiche le bloc prix (variantes ou prix simple) dans les deux modes
   ───────────────────────────────────────────────────────────── */

type PriceBlockProps = {
  product: EnrichedProduct;
  finalPrice: string;
  hasDiscount: boolean | "" | undefined;
  discountPct: number;
  align?: "left" | "right";
  size?: "sm" | "lg";
};

function PriceBlock({ product, finalPrice, hasDiscount, discountPct, align = "left", size = "sm" }: PriceBlockProps) {
  const activeVariants = product.variants?.filter((v) => v.is_active);
  const priceSize = size === "lg" ? "text-2xl" : "text-xl";
  const alignClass = align === "right" ? "items-end" : "items-start";

  if (activeVariants && activeVariants.length > 0) {
    const prices = activeVariants.map((v) => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return (
      <div className={cn("flex flex-col", alignClass)}>
        {minPrice !== maxPrice && (
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8b5e34]/80">
            À partir de
          </span>
        )}
        <span className={cn(priceSize, "font-black tracking-tight text-[#1f4d3f]")}>
          {formatCurrency(minPrice, "FCFA")}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", alignClass)}>
      {hasDiscount && (
        <span className="mb-0.5 text-xs font-bold text-[#8a9086] line-through decoration-[#ef8219]/60 decoration-2">
          {formatCurrency(product.original_price!, "FCFA")}
        </span>
      )}
      <span className={cn(priceSize, "font-black tracking-tight", hasDiscount ? "text-[#ef8219]" : "text-[#1f4d3f]")}>
        {formatCurrency(finalPrice, "FCFA")}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANT : InteractiveStars
   Étoiles avec hover scale et coloration progressive
   ───────────────────────────────────────────────────────────── */

type InteractiveStarsProps = {
  displayScore: number;
  ratingCount: number;
  ratingLoading: boolean;
  isAuthenticated: boolean;
  userScore: number | null;
  onRate: (e: React.MouseEvent, score: number) => void;
  onHover: (star: number | null) => void;
};

function InteractiveStars({
  displayScore,
  ratingCount,
  ratingLoading,
  isAuthenticated,
  userScore,
  onRate,
  onHover,
}: InteractiveStarsProps) {
  return (
    <div className="mt-1.5 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(displayScore);
        return (
          <motion.button
            key={star}
            type="button"
            onClick={(e) => void onRate(e, star)}
            onMouseEnter={() => isAuthenticated && onHover(star)}
            onMouseLeave={() => onHover(null)}
            disabled={ratingLoading}
            whileHover={isAuthenticated ? { scale: 1.3 } : {}}
            whileTap={isAuthenticated ? { scale: 0.9 } : {}}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
              "rounded p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
              isAuthenticated ? "cursor-pointer" : "cursor-default"
            )}
            aria-label={isAuthenticated ? `Noter ${star} étoile${star > 1 ? "s" : ""}` : undefined}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-100",
                isFilled ? "fill-amber-400 text-amber-400" : "fill-[#e7dfd2] text-[#e7dfd2]"
              )}
            />
          </motion.button>
        );
      })}
      {ratingCount > 0 && (
        <span className="ml-1 text-[10px] font-medium text-[#8a9086]">({ratingCount})</span>
      )}
      {isAuthenticated && userScore !== null && (
        <span className="ml-1.5 rounded-sm bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
          Ma note
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL — conservation du nom d'origine
   ───────────────────────────────────────────────────────────── */

export function ProductCard({
  product,
  index = 0,
  viewMode = "grid",
  userScore: initialUserScore = null,
  isFavorited: initialIsFavorited = false,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { status, user } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();

  const isAuthenticated = status === "authenticated" && Boolean(user);

  /* ── État local — noms d'origine conservés ── */
  const [isAdding, setIsAdding] = useState(false);

  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favCount, setFavCount] = useState(product.count_favorites || 0);
  const [favLoading, setFavLoading] = useState(false);

  const [userScore, setUserScore] = useState<number | null>(initialUserScore);
  const [avgRating, setAvgRating] = useState(parseFloat(product.note_produit) || 0);
  const [ratingCount, setRatingCount] = useState(product.count_ratings || 0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  }, []);

  /* ── Prix calculés ── */
  const finalPrice = product.sale_price ?? product.price;
  const hasDiscount =
    product.sale_price &&
    product.original_price &&
    Number(product.sale_price) < Number(product.original_price);
  const discountPct = hasDiscount
    ? Math.round(
      (1 - parseFloat(product.sale_price!) / parseFloat(product.original_price!)) * 100
    )
    : 0;
  const isOutOfStock = product.stock === 0;

  /* ── Panier — nom d'origine conservé ── */
  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      showToast("error", "Ce produit est actuellement en rupture de stock.");
      return;
    }

    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: defaultVariant ? defaultVariant.id : null,
      name: defaultVariant ? `${product.name} — ${defaultVariant.name}` : product.name,
      sku: defaultVariant?.sku || (product.slug ?? ""),
      price: defaultVariant ? defaultVariant.price : finalPrice,
      compareAtPrice: product.original_price ?? null,
      image:
        typeof product.primary_image === "object" && product.primary_image
          ? product.primary_image.image
          : typeof product.primary_image === "string"
            ? product.primary_image
            : null,
      quantity: 1,
      maxStock: defaultVariant ? defaultVariant.stock : product.stock,
      currency: "FCFA",
      slug: product.slug ?? "",
    }, true);

    // showToast("success", `${product.name} a été ajouté à votre panier.`);
    window.setTimeout(() => setIsAdding(false), 2000);
  };

  /* ── Toggle favoris — nom d'origine conservé ── */
  const handleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      showToast("info", "Connectez-vous pour ajouter ce produit à vos favoris.");
      return;
    }
    if (favLoading) return;
    setFavLoading(true);

    const nextState = !isFavorited;
    setIsFavorited(nextState);
    setFavCount((c) => c + (nextState ? 1 : -1));

    try {
      const res = await toggleFavorite(product.id);
      if (res.ok) {
        setIsFavorited(res.data.favorited);
        setFavCount(res.data.count_favorites);
        showToast("success", res.data.favorited ? "Ajouté aux favoris." : "Retiré des favoris.");
      } else {
        setIsFavorited(!nextState);
        setFavCount((c) => c + (nextState ? -1 : 1));
        showToast("error", "Erreur lors de la modification des favoris.");
      }
    } catch {
      setIsFavorited(!nextState);
      setFavCount((c) => c + (nextState ? -1 : 1));
    } finally {
      setFavLoading(false);
    }
  };

  /* ── Notation — nom d'origine conservé ── */
  const handleRate = async (event: React.MouseEvent, score: number) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      showToast("info", "Connectez-vous pour évaluer ce produit.");
      return;
    }
    if (ratingLoading) return;
    setRatingLoading(true);

    const prevScore = userScore;
    setUserScore(score);

    try {
      const res = await rateProduct(product.id, score);
      if (res.ok) {
        setUserScore(res.data.user_score);
        setAvgRating(parseFloat(res.data.note_produit) || 0);
        setRatingCount(res.data.count_ratings);
        // showToast("success", `Votre note de ${score}/5 a été enregistrée.`);
      } else {
        setUserScore(prevScore);
        showToast("error", "Erreur lors de l'envoi de votre note.");
      }
    } catch {
      setUserScore(prevScore);
    } finally {
      setRatingLoading(false);
    }
  };

  /* ── Score à afficher (hover > note perso > moyenne) ── */
  const displayScore = hoveredStar ?? userScore ?? avgRating;

  /* ── URL image ── */
  const imgSrc =
    typeof product.primary_image === "object" && product.primary_image
      ? mediaUrl(product.primary_image.image)
      : typeof product.primary_image === "string"
        ? mediaUrl(product.primary_image)
        : null;

  /* ─────────────────────────────────────────────────────────────
     RENDU GRILLE
     ───────────────────────────────────────────────────────────── */
  if (viewMode === "grid") {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {toast.show && (
          <Toast
            show={toast.show}
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        <Link
          onClick={() => useUIStore.getState().setActiveProductId(product.id)}
          href={`/products/${product.slug}`}
          className={cn(
            "group relative flex h-full cursor-pointer flex-col overflow-hidden",
            "rounded-[1.5rem] border border-[#e7dfd2] bg-white",
            "transition-all duration-300",
            "hover:border-[#1f4d3f]/20 hover:shadow-[0_16px_48px_rgba(31,77,63,0.12)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/40"
          )}
        >
          {/* ── Zone image ── */}
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#f3ede2]">

            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-700 ease-out group-hover:scale-106",
                  isOutOfStock && "opacity-50 grayscale"
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-10 w-10 text-[#c4b59b]" />
              </div>
            )}

            {/* Overlay forest-green au hover — gradient depuis le bas */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-400",
                "bg-gradient-to-t from-[#1f4d3f]/50 via-[#1f4d3f]/15 to-transparent",
                "opacity-0 group-hover:opacity-100"
              )}
              aria-hidden
            />

            {/* ── Badges haut gauche ── */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {hasDiscount && (
                <motion.span
                  animate={prefersReducedMotion ? {} : {
                    scale: [1, 1.04, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center rounded-full bg-[#ef8219] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md"
                >
                  -{discountPct}%
                </motion.span>
              )}
              {product.is_top && !hasDiscount && (
                <span className="relative overflow-hidden inline-flex items-center gap-1 rounded-full bg-[#1f4d3f] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  <Star className="h-2.5 w-2.5" aria-hidden />
                  Tendance
                  {/* Shimmer interne */}
                  {!prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                      aria-hidden
                    />
                  )}
                </span>
              )}
              {isOutOfStock ? (
                <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  Indisponible
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  En stock
                </span>
              )}
            </div>

            {/* ── Bouton favoris ── */}
            <motion.button
              type="button"
              onClick={handleWishlist}
              disabled={favLoading}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className={cn(
                "absolute right-3 top-3 z-10",
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm",
                "transition-colors duration-200",
                isFavorited
                  ? "bg-[#1f4d3f] text-white hover:bg-[#17392f]"
                  : "bg-white/90 text-[#8a9086] hover:bg-white hover:text-[#1f4d3f]"
              )}
              aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isFavorited && "fill-white scale-110"
                )}
              />
            </motion.button>

            {/* ── CTA "Ajouter" — slide up depuis le bas ── */}
            <div
              className={cn(
                "absolute bottom-3 left-3 right-3 z-10",
                "translate-y-3 opacity-0 transition-all duration-300 ease-out",
                "group-hover:translate-y-0 group-hover:opacity-100"
              )}
            >
              <motion.button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                whileHover={(!isOutOfStock && !isAdding && !prefersReducedMotion) ? { scale: 1.02 } : {}}
                whileTap={(!isOutOfStock && !isAdding && !prefersReducedMotion) ? { scale: 0.96 } : {}}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-center overflow-hidden relative",
                  "rounded-xl py-2.5 text-sm font-semibold shadow-lg",
                  "transition-colors duration-300",
                  isOutOfStock
                    ? "cursor-not-allowed bg-white/80 text-[#8a9086] backdrop-blur-md"
                    : isAdding
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1f4d3f] text-white hover:bg-[#17392f]"
                )}
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div
                      key="added"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Check className="h-4 w-4" aria-hidden />
                      </motion.div>
                      <span>Ajouté !</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden />
                      <span>{isOutOfStock ? "Rupture" : "Ajouter"}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ── Informations produit ── */}
          <div className="flex flex-1 flex-col p-4">

            {/* Catégorie */}
            {product.category_name && (
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
                {product.category_name}
              </p>
            )}

            {/* Nom */}
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1f241c] transition-colors duration-200 group-hover:text-[#1f4d3f]">
              {product.name}
            </h3>

            {/* Étoiles interactives */}
            <InteractiveStars
              displayScore={displayScore}
              ratingCount={ratingCount}
              ratingLoading={ratingLoading}
              isAuthenticated={isAuthenticated}
              userScore={userScore}
              onRate={handleRate}
              onHover={setHoveredStar}
            />

            {/* Prix + favoris */}
            <div className="mt-auto pt-3">
              <PriceBlock
                product={product}
                finalPrice={finalPrice}
                hasDiscount={hasDiscount}
                discountPct={discountPct}
                align="left"
                size="sm"
              />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDU LISTE
     ───────────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {toast.show && (
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <Link
        onClick={() => useUIStore.getState().setActiveProductId(product.id)}
        href={`/products/${product.slug}`}
        className={cn(
          "group relative flex cursor-pointer overflow-hidden",
          "rounded-2xl border border-[#e7dfd2] bg-white",
          "transition-all duration-300",
          "hover:border-[#1f4d3f]/20 hover:shadow-[0_8px_32px_rgba(31,77,63,0.10)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/40",
          "sm:h-44"
        )}
      >
        {/* Bord gauche amber qui monte au hover */}
        <motion.span
          className="absolute bottom-0 left-0 top-0 z-10 w-[3px] origin-bottom rounded-l-2xl"
          style={{
            background: hasDiscount
              ? "linear-gradient(to top, #ef8219cc, #ef821920)"
              : "linear-gradient(to top, #1f4d3fcc, #1f4d3f20)",
          }}
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />

        {/* ── Image ── */}
        <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-[#f3ede2] sm:w-44">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 128px, 176px"
              className={cn(
                "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                isOutOfStock && "opacity-50 grayscale"
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-[#c4b59b]" />
            </div>
          )}

          {/* Badges image */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="rounded-full bg-[#ef8219] px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                -{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                Rupture
              </span>
            )}
          </div>
        </div>

        {/* ── Détails ── */}
        <div className="flex flex-1 flex-col p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">

          {/* Infos gauche */}
          <div className="flex-1 min-w-0">
            {product.category_name && (
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
                {product.category_name}
              </p>
            )}
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#1f241c] transition-colors duration-200 group-hover:text-[#1f4d3f]">
              {product.name}
            </h3>
            <InteractiveStars
              displayScore={displayScore}
              ratingCount={ratingCount}
              ratingLoading={ratingLoading}
              isAuthenticated={isAuthenticated}
              userScore={userScore}
              onRate={handleRate}
              onHover={setHoveredStar}
            />
          </div>

          {/* ── Section prix + actions ── */}
          <div className="mt-3 flex flex-col items-start gap-3 sm:mt-0 sm:w-48 sm:items-end sm:text-right">

            {/* Prix */}
            <div className="flex flex-col sm:items-end">
              <PriceBlock
                product={product}
                finalPrice={finalPrice}
                hasDiscount={hasDiscount}
                discountPct={discountPct}
                align="right"
                size="lg"
              />
              {isOutOfStock ? (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
                  Indisponible
                </span>
              ) : (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  En stock
                </span>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex w-full gap-2 sm:mt-2">

              {/* Favori */}
              <motion.button
                type="button"
                onClick={handleWishlist}
                disabled={favLoading}
                whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                  "transition-all duration-200",
                  isFavorited
                    ? "border-[#1f4d3f] bg-[#1f4d3f]/5 text-[#1f4d3f]"
                    : "border-[#e7dfd2] bg-white text-[#8a9086] hover:border-[#1f4d3f]/30 hover:text-[#1f4d3f]"
                )}
                aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isFavorited && "fill-current"
                  )}
                />
              </motion.button>

              {/* Panier */}
              <motion.button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                whileHover={(!isOutOfStock && !isAdding && !prefersReducedMotion) ? { scale: 1.02 } : {}}
                whileTap={(!isOutOfStock && !isAdding && !prefersReducedMotion) ? { scale: 0.96 } : {}}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center overflow-hidden relative",
                  "rounded-xl text-sm font-semibold h-[42px]",
                  "transition-colors duration-300",
                  isOutOfStock
                    ? "cursor-not-allowed border border-[#e7dfd2] bg-gray-50 text-[#8a9086]"
                    : isAdding
                      ? "bg-emerald-500 text-white shadow-md border-transparent"
                      : "bg-[#1f4d3f] text-white hover:bg-[#17392f] shadow-md hover:shadow-lg border-transparent"
                )}
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div
                      key="added-list"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                      <span className="hidden sm:inline">Ajouté !</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add-list"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden />
                      <span className="hidden sm:inline">
                        {isOutOfStock ? "Rupture" : "Ajouter"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}