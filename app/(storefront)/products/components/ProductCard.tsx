/**
 * ProductCard — Carte produit avec favoris toggle et notation intégrés
 *
 * @module app/products/components/ProductCard
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, Eye, Package, ShieldCheck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";
import { toggleFavorite, rateProduct } from "@/fonctions_api/notes-favoris.api";
import type { EnrichedProduct } from "@/app/(storefront)/products/components/ProductsCatalogClient";
import Toast from "@/components/special/Toast";

/* ─────────────────────────────────────────────────────────────────────────────
   Composant principal
   ─────────────────────────────────────────────────────────────────────────── */

type ProductCardProps = {
  product: EnrichedProduct;
  index?: number;
  /** Vue : grille ou liste */
  viewMode?: "grid" | "list";
  /** Note personnelle de l'utilisateur pour ce produit */
  userScore?: number | null;
  /** true si l'utilisateur a déjà ce produit en favoris */
  isFavorited?: boolean;
};

export function ProductCard({
  product,
  index = 0,
  viewMode = "grid",
  userScore: initialUserScore = null,
  isFavorited: initialIsFavorited = false,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { status, user } = useAuthStore();

  const isAuthenticated = status === "authenticated" && Boolean(user);

  /* --- État local ---------------------------------------------------------- */
  const [isAdding, setIsAdding] = useState(false);

  // Favoris
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favCount, setFavCount] = useState(product.count_favorites || 0);
  const [favLoading, setFavLoading] = useState(false);

  // Note personnelle de l'utilisateur
  const [userScore, setUserScore] = useState<number | null>(initialUserScore);
  const [avgRating, setAvgRating] = useState(parseFloat(product.note_produit) || 0);
  const [ratingCount, setRatingCount] = useState(product.count_ratings || 0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  }, []);

  /* --- Prix ---------------------------------------------------------------- */
  const finalPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.original_price && Number(product.sale_price) < Number(product.original_price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.sale_price!) / parseFloat(product.original_price!)) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;

  /* --- Panier -------------------------------------------------------------- */
  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) {
      showToast("error", "Ce produit est actuellement en rupture de stock.");
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      sku: product.slug ?? "",
      price: finalPrice,
      compareAtPrice: product.original_price ?? null,
      image: typeof product.primary_image === "object" && product.primary_image
        ? product.primary_image.image
        : typeof product.primary_image === "string"
          ? product.primary_image
          : null,
      quantity: 1,
      maxStock: product.stock,
      currency: "FCFA",
      slug: product.slug ?? "",
    });

    showToast("success", `${product.name} a été ajouté à votre panier.`);
    window.setTimeout(() => setIsAdding(false), 1200);
  };

  /* --- Toggle favoris ------------------------------------------------------- */
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

  /* --- Notation ------------------------------------------------------------ */
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
        showToast("success", `Merci ! Votre note de ${score}/5 a été enregistrée.`);
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

  /* --- Étoiles à afficher -------------------------------------------------- */
  const displayScore = hoveredStar ?? userScore ?? avgRating;

  /* --- URL Image ---------------------------------------------------------- */
  const imgSrc = typeof product.primary_image === "object" && product.primary_image
    ? mediaUrl(product.primary_image.image)
    : typeof product.primary_image === "string"
      ? mediaUrl(product.primary_image)
      : null;

  /* ─────────────────────────────────────────────────────────────────────────
     Rendu Grille (Vertical)
     ─────────────────────────────────────────────────────────────────────── */
  if (viewMode === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      >
        {toast.show && (
          <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        )}
        <Link
          onClick={() => useUIStore.getState().setActiveProductId(product.id)}
          href={`/products/${product.slug}`}
          className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-[#e7dfd2] bg-white transition-all duration-300 hover:border-[#8b5e34]/30 hover:shadow-[0_12px_40px_rgba(31,36,28,0.08)]"
        >
          {/* Image */}
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#f3ede2]">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-700 group-hover:scale-105",
                  isOutOfStock && "opacity-50 grayscale"
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-10 w-10 text-[#c4b59b]" />
              </div>
            )}

            {/* Overlay Gradient pour lisibilité */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Badges haut gauche */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {hasDiscount && (
                <span className="rounded-full bg-[#ef8219] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  -{discountPct}%
                </span>
              )}
              {product.is_top && !hasDiscount && (
                <span className="rounded-full bg-[#1f4d3f] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  Tendance
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

            {/* Bouton favori */}
            <button
              type="button"
              onClick={handleWishlist}
              disabled={favLoading}
              className={cn(
                "absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110",
                isFavorited ? "bg-[#1f4d3f] text-white hover:bg-[#17392f]" : "bg-white/90 text-[#8a9086] hover:bg-white hover:text-[#1f4d3f]"
              )}
            >
              <Heart className={cn("h-4 w-4 transition-colors", isFavorited && "fill-white")} />
            </button>

            {/* Actions au survol */}
            <div className="absolute bottom-3 left-3 right-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-lg transition-all",
                  isOutOfStock
                    ? "cursor-not-allowed bg-white/80 text-[#8a9086] backdrop-blur-md"
                    : isAdding
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1f4d3f] text-white hover:bg-[#17392f]"
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                {isAdding ? "Ajouté ✓" : isOutOfStock ? "Rupture" : "Ajouter"}
              </button>
            </div>
          </div>

          {/* Infos produit */}
          <div className="flex flex-1 flex-col p-4">
            {product.category_name && (
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
                {product.category_name}
              </p>
            )}
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1f241c] transition-colors group-hover:text-[#1f4d3f]">
              {product.name}
            </h3>

            {/* Étoiles interactives */}
            <div className="mt-1.5 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => void handleRate(e, star)}
                  onMouseEnter={() => isAuthenticated && setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  disabled={ratingLoading}
                  className={cn("p-0.5 rounded transition-transform", isAuthenticated ? "cursor-pointer hover:scale-125" : "cursor-default")}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 transition-colors duration-100",
                      star <= Math.round(displayScore)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-[#e7dfd2] text-[#e7dfd2]"
                    )}
                  />
                </button>
              ))}
              <span className="ml-1 text-[10px] font-medium text-[#8a9086]">
                {ratingCount > 0 ? `(${ratingCount})` : ""}
              </span>
              {isAuthenticated && userScore !== null && (
                <span className="ml-1.5 rounded-sm bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                  Ma note
                </span>
              )}
            </div>

            <div className="mt-auto pt-3">
              {/* Prix */}
              <div className="flex flex-wrap items-baseline gap-2">
                {(() => {
                  const activeVariants = product.variants?.filter((v) => v.is_active);
                  if (activeVariants && activeVariants.length > 0) {
                    const prices = activeVariants.map((v) => parseFloat(v.price));
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    if (minPrice === maxPrice) {
                      return <span className="text-[20px] font-bold text-[#1f4d3f]">{formatCurrency(minPrice, "FCFA")}</span>;
                    }
                    return (
                      <span className="flex flex-wrap items-baseline gap-1 text-[#1f4d3f]">
                        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#8a9086]">Dès</span>
                        <span className="text-[20px] font-bold">{formatCurrency(minPrice, "FCFA")}</span>
                        <span className="text-[20px] text-[#8a9086]">— {formatCurrency(maxPrice, "FCFA")}</span>
                      </span>
                    );
                  }
                  return (
                    <>
                      <span className="text-[20px] font-bold text-[#1f4d3f]">{formatCurrency(finalPrice, "FCFA")}</span>
                      {hasDiscount && (
                        <span className="text-[18px] font-semibold text-[#8a9086] line-through">
                          {formatCurrency(product.original_price!, "FCFA")}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Compteur favoris */}
              {/* {favCount > 0 && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#8a9086]">
                  <Heart className="h-3 w-3 fill-red-400/20 text-red-400" />
                  {favCount} favori{favCount > 1 ? "s" : ""}
                </div>
              )} */}

            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Rendu Liste (Horizontal)
     ─────────────────────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="w-full"
    >
      {toast.show && (
        <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      )}
      <Link
        onClick={() => useUIStore.getState().setActiveProductId(product.id)}
        href={`/products/${product.slug}`}
        className="group relative flex cursor-pointer overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white transition-all duration-300 hover:border-[#8b5e34]/30 hover:shadow-lg sm:h-44"
      >
        {/* Image - prend une largeur fixe sur Desktop */}
        <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-[#f3ede2] sm:w-44">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 128px, 176px"
              className={cn(
                "object-cover transition-transform duration-700 group-hover:scale-105",
                isOutOfStock && "opacity-50 grayscale"
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-[#c4b59b]" />
            </div>
          )}

          {/* Badges haut gauche */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
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

        {/* Détails - s'étend sur le reste de la largeur */}
        <div className="flex flex-1 flex-col p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="flex-1">
            {product.category_name && (
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
                {product.category_name}
              </p>
            )}
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#1f241c] transition-colors group-hover:text-[#1f4d3f]">
              {product.name}
            </h3>

            {/* Étoiles interactives */}
            <div className="mt-1.5 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => void handleRate(e, star)}
                  onMouseEnter={() => isAuthenticated && setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  disabled={ratingLoading}
                  className={cn("p-0.5 rounded transition-transform", isAuthenticated ? "cursor-pointer hover:scale-125" : "cursor-default")}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 transition-colors duration-100",
                      star <= Math.round(displayScore)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-[#e7dfd2] text-[#e7dfd2]"
                    )}
                  />
                </button>
              ))}
              <span className="ml-1 text-[10px] font-medium text-[#8a9086]">
                {ratingCount > 0 ? `(${ratingCount})` : ""}
              </span>
            </div>

          </div>

          {/* Section Prix et actions (droite) */}
          <div className="mt-3 flex flex-col items-start gap-3 sm:mt-0 sm:w-48 sm:items-end sm:text-right">
            <div className="flex flex-col sm:items-end">
              {(() => {
                const activeVariants = product.variants?.filter((v) => v.is_active);
                if (activeVariants && activeVariants.length > 0) {
                  const prices = activeVariants.map((v) => parseFloat(v.price));
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  if (minPrice === maxPrice) {
                    return <span className="text-[28px] font-bold text-[#1f4d3f]">{formatCurrency(minPrice, "FCFA")}</span>;
                  }
                  return (
                    <div className="flex flex-col sm:items-end">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9086]">À partir de</span>
                      <span className="text-[28px] font-bold text-[#1f4d3f]">{formatCurrency(minPrice, "FCFA")}</span>
                    </div>
                  );
                }
                return (
                  <>
                    <span className="text-[28px]  font-bold text-[#1f4d3f]">{formatCurrency(finalPrice, "FCFA")}</span>
                    {hasDiscount && (
                      <span className="text-[28px] font-semibold text-[#8a9086] line-through">
                        {formatCurrency(product.original_price!, "FCFA")}
                      </span>
                    )}
                  </>
                );
              })()}

              {isOutOfStock ? (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Indisponible
                </span>
              ) : (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <ShieldCheck className="h-3 w-3" />
                  En stock
                </span>
              )}
            </div>

            <div className="flex w-full gap-2 sm:mt-2">
              <button
                type="button"
                onClick={handleWishlist}
                disabled={favLoading}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all",
                  isFavorited
                    ? "border-[#1f4d3f] bg-[#1f4d3f]/5 text-[#1f4d3f]"
                    : "border-[#e7dfd2] bg-white text-[#8a9086] hover:border-[#8b5e34]/30 hover:text-[#1f4d3f]"
                )}
              >
                <Heart className={cn("h-4 w-4 transition-colors", isFavorited && "fill-current")} />
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
                  isOutOfStock
                    ? "cursor-not-allowed border border-[#e7dfd2] bg-gray-50 text-[#8a9086]"
                    : isAdding
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1f4d3f] text-white hover:bg-[#17392f] shadow-md hover:shadow-lg"
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">{isAdding ? "Ajouté ✓" : isOutOfStock ? "Rupture" : "Ajouter"}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}