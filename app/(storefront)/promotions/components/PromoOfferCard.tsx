/**
 * @file PromoOfferCard.tsx
 * @description Carte produit promotionnelle ultra-premium.
 *
 * Architecture :
 *  - DiscountBadge   : badge remise flottant (haut gauche)
 *  - ProductAvatar   : image circulaire avec effet 3D tilt
 *  - CartButton      : bouton panier magnetique
 *  - PromoOfferCard  : composant principal
 *
 * Effets visuels :
 *  - Fond forest profond multi-couches
 *  - Texture grain subtile
 *  - Sweep de lumiere anime (shimmer)
 *  - Halo jade en bas a droite
 *  - Effet 3D tilt au survol de la souris
 *  - Animation d'entree spring (whileInView)
 *
 * Accessibilite :
 *  - aria-labels sur tous les elements interactifs
 *  - tabIndex conditionnel pour les cartes estompees
 *  - Roles semantiques (article, link)
 *
 * @module promotions/PromoOfferCard
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShoppingCart, Star, Zap, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { PromoProductCard } from "./PromotionsPage";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";
import { useRef, useCallback } from "react";

/* ─── Constantes ──────────────────────────────────────────────────────────── */

/** Image de fallback si le produit n'a pas d'image */
const FALLBACK_IMAGE = "/assets/images/LOGO.png";

/** Duree du sweep de lumiere sur la carte active */
const SHIMMER_DURATION = "3s";

/* ─── CSS global (keyframes injectes une seule fois) ─────────────────────── */

const CARD_KEYFRAMES = `
  @keyframes promo-card-shimmer {
    0%   { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
    12%  { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
  }
  @keyframes promo-card-pulse-ring {
    0%   { transform: scale(1);    opacity: 0.5; }
    70%  { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes promo-card-badge-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-3px); }
  }
`;

/* ─── Sous-composants ─────────────────────────────────────────────────────── */

/**
 * Badge remise flottant — haut gauche de la carte.
 * Affiche le pourcentage ou "PROMO" si indetermine.
 */
function DiscountBadge({ label }: { label: string }) {
  return (
    <span
      className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
      style={{
        background: "linear-gradient(135deg, #E8711A 0%, #F5A623 60%, #E8711A 100%)",
        boxShadow: "0 4px 16px rgba(232,113,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
        animation: "promo-card-badge-float 3s ease-in-out infinite",
        letterSpacing: "0.12em",
      }}
    >
      <Zap className="h-3 w-3 fill-current" aria-hidden="true" />
      {label}
    </span>
  );
}

/**
 * Avatar produit circulaire avec halo lumineux.
 * Effet 3D tilt via les valeurs spring de la souris.
 */
function ProductAvatar({
  src,
  alt,
  rotateX,
  rotateY,
}: {
  src: string;
  alt: string;
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}) {
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative h-[88px] w-[88px] shrink-0"
    >
      {/* Anneau pulsant externe */}
      <span
        className="absolute inset-0 rounded-full border-2 border-white/30"
        style={{ animation: "promo-card-pulse-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite" }}
        aria-hidden="true"
      />
      {/* Cercle image principal */}
      <div
        className="relative h-full w-full overflow-hidden rounded-full"
        style={{
          border: "3px solid rgba(255,255,255,0.22)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="88px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmNGQzZiIvPjwvc3ZnPg=="
        />
      </div>
    </motion.div>
  );
}

/**
 * Bouton d'ajout au panier avec effet magnetique au survol.
 */
function CartButton({
  onClick,
  label,
  tabIndex,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  tabIndex?: number;
}) {
  return (
    <motion.button
      type="button"
      tabIndex={tabIndex}
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.14, y: -3 }}
      whileTap={{ scale: 0.90 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className="absolute bottom-4 right-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl text-white"
      style={{
        background: "linear-gradient(135deg, #E8711A 0%, #F5A623 50%, #E8711A 100%)",
        boxShadow: "0 6px 20px rgba(232,113,26,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
    </motion.button>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */

export interface PromoOfferCardProps {
  item: PromoProductCard;
  index: number;
  disableEntrance?: boolean;
  dimmed?: boolean;
}

export function PromoOfferCard({
  item,
  index,
  disableEntrance = false,
  dimmed = false,
}: PromoOfferCardProps) {
  /* ── Stores ── */
  const addItem = useCartStore((state) => state.addItem);

  /* ── Derivations ── */
  const imageSrc = mediaUrl(item.image || FALLBACK_IMAGE) || "/placeholder.png";

  /* ── Effet 3D tilt (desactive sur les cartes estompees) ── */
  const cardRef = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (dimmed) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [dimmed, rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  /* ── Calcul de la remise ── */
  const discountLabel =
    item.discountPercent > 0
      ? `-${item.discountPercent}%`
      : item.comparePrice && Number(item.comparePrice) > Number(item.price)
        ? `-${Math.round((1 - Number(item.price) / Number(item.comparePrice)) * 100)}%`
        : "PROMO";

  const hasSavings = !!(item.comparePrice && Number(item.comparePrice) > Number(item.price));

  /* ── Handler panier ── */
  const handleAddToCart = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: item.productId,
      variantId: null,
      name: item.name,
      sku: item.slug,
      price: item.price,
      compareAtPrice: item.comparePrice,
      image: typeof item.image === "string" && item.image ? item.image : null,
      quantity: 1,
      maxStock: 99,
      currency: "FCFA",
      slug: item.slug,
    });
  }, [addItem, item]);

  /* ── Classes dynamiques ── */
  const cardClassName = cn(
    "group relative overflow-hidden rounded-[1.75rem] p-5",
    "transition-[filter,opacity] duration-500 ease-out",
    dimmed && "brightness-[0.80] saturate-[0.7] pointer-events-none"
  );

  /* ── Contenu interne (partage entre les deux modes de rendu) ── */
  const content = (
    <>
      {/* Injection unique des keyframes */}
      <style dangerouslySetInnerHTML={{ __html: CARD_KEYFRAMES }} />

      {/* Fond forest profond */}
      <div
        className="absolute inset-0 rounded-[1.75rem]"
        style={{
          background: "linear-gradient(145deg, #12422D 0%, #0D2E1E 40%, #162E22 100%)",
          boxShadow: "0 20px 60px rgba(13,46,30,0.45), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        aria-hidden="true"
      />

      {/* Texture grille subtile */}
      <div
        className="absolute inset-0 rounded-[1.75rem] opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,1) 24px, rgba(255,255,255,1) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,1) 24px, rgba(255,255,255,1) 25px)",
        }}
        aria-hidden="true"
      />

      {/* Sweep de lumiere anime */}
      {!dimmed && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden="true">
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 50%, transparent 65%)",
              animation: `promo-card-shimmer ${SHIMMER_DURATION} ease-in-out 1.2s infinite`,
            }}
          />
        </div>
      )}

      {/* Halo jade bas-droite */}
      <div
        className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #2F9E6F, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Badge remise */}
      <DiscountBadge label={discountLabel} />

      {/* Corps : texte + avatar */}
      <Link
        onClick={() => useUIStore.getState().setActiveProductId(item.productId)}
        href={`/products/${item.slug}`}
        tabIndex={dimmed ? -1 : undefined}
        className="group relative z-10 flex h-full cursor-pointer items-start gap-4 overflow-visible"
        aria-label={`Voir le produit : ${item.name}`}
      >
        {/* Bloc texte */}
        <div className="min-w-0 flex-1 pt-7">
          <p
            className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(245,230,200,0.50)" }}
          >
            Offre du moment
          </p>

          <p className="line-clamp-2 text-[15px] font-black leading-snug text-white">
            {item.name}
          </p>

          {/* Prix */}
          <div className="mt-3.5 flex flex-wrap items-end gap-2">
            <p
              className="text-2xl font-black leading-none text-white"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
            >
              {formatCurrency(parseFloat(item.price), "FCFA")}
            </p>
            {hasSavings && (
              <div className="flex items-center gap-1">
                <p className="text-xs text-white/35 line-through">
                  {formatCurrency(parseFloat(item.comparePrice!), "FCFA")}
                </p>
                <span
                  className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(47,158,111,0.25)",
                    color: "#7EDBB4",
                    border: "1px solid rgba(47,158,111,0.3)",
                  }}
                >
                  <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
                  Economie
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Star className="h-3 w-3 fill-[#F5A623] text-[#F5A623]" aria-hidden="true" />
              <span className="font-black text-white">{item.rating.toFixed(1)}</span>
            </span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {item.reviewCount > 0 ? `${item.reviewCount} avis` : "Selection terroir"}
            </span>
          </div>
        </div>

        {/* Avatar produit */}
        <div className="mt-7 shrink-0">
          <ProductAvatar
            src={imageSrc}
            alt={item.name}
            rotateX={rotateX}
            rotateY={rotateY}
          />
        </div>
      </Link>

      {/* Bouton panier */}
      <CartButton
        onClick={handleAddToCart}
        label={`Ajouter ${item.name} au panier`}
        tabIndex={dimmed ? -1 : undefined}
      />
    </>
  );

  /* ── Rendu : avec ou sans animation d'entree ── */
  if (disableEntrance) {
    return (
      <article
        ref={cardRef}
        className={cardClassName}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "900px", minHeight: "160px" }}
      >
        <motion.div
          style={{ rotateX: dimmed ? 0 : rotateX, rotateY: dimmed ? 0 : rotateY }}
          className="h-full w-full"
        >
          {content}
        </motion.div>
      </article>
    );
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cardClassName}
      style={{ perspective: "900px", minHeight: "160px" }}
    >
      <motion.div
        style={{ rotateX: dimmed ? 0 : rotateX, rotateY: dimmed ? 0 : rotateY }}
        className="h-full w-full"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {content}
      </motion.div>
    </motion.article>
  );
}
