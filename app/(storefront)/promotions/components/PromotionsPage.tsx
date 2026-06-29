/**
 * @file PromotionsPage.tsx
 * @description Page des promotions - edition ultra-premium "Atelier du Terroir".
 *
 * Architecture :
 *  - HeroSection    : hero cinematique avec parallaxe + compteur live
 *  - SectionHeader  : en-tete de section stylise
 *  - SkeletonCard   : placeholder anime pendant le chargement
 *  - EmptyState     : ecran vide premium
 *  - PromotionsPage : orchestrateur principal
 *
 * Design tokens :
 *  --forest-deep  : #0D2E1E (fond hero)
 *  --jade-glow    : #2F9E6F (accentuation verte)
 *  --champagne    : #F5E6C8 (texte lumineux)
 *  --ember        : #E8711A (CTA / badges)
 *  --cream-bg     : #f9f6ee (fond clair de la page)
 *
 * Principes :
 *  - Animations spring physics exclusivement
 *  - Responsive mobile-first
 *  - Accessibilite : aria-live, aria-labels, focus-visible
 *  - Performance : useCallback/useMemo, images lazy
 *
 * @module promotions/PromotionsPage
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Leaf, Loader2, Star, Tag, Zap,
  ArrowRight, Clock, ShoppingBag, TrendingDown, Star,
} from "lucide-react";
import { getActiveSales, getActivePromoCodes } from "@/fonctions_api/promotions.api";
import type { Soldes, PromoCodeList } from "@/modeles/promotions";
import { formatCurrency } from "@/lib/utils";
import { mediaUrl } from "@/lib/mediaUrl";
import { PromoCodesGrid } from "./PromoCodesGrid";
import { PromoProductsCarousel } from "./PromoProductsCarousel";

/* ─── Constantes ──────────────────────────────────────────────────────────── */

const FALLBACK_HERO = "/assets/images/LOGO.png";

/* ─── CSS global (keyframes injectes une seule fois) ─────────────────────── */

const GLOBAL_KEYFRAMES = `
  @keyframes promo-grain {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-2%, -3%); }
    30% { transform: translate(3%, 2%); }
    50% { transform: translate(-1%, 4%); }
    70% { transform: translate(4%, -2%); }
    90% { transform: translate(-3%, 1%); }
  }
  @keyframes promo-float-leaf {
    0%, 100% { transform: translateY(0px) rotate(-18deg); }
    50% { transform: translateY(-12px) rotate(-14deg); }
  }
  @keyframes promo-float-leaf-2 {
    0%, 100% { transform: translateY(0px) rotate(24deg); }
    50% { transform: translateY(-8px) rotate(28deg); }
  }
  @keyframes promo-halo-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.08); }
  }
  @keyframes promo-orb-drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-15px, 15px) scale(0.96); }
  }
  @keyframes promo-badge-float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-4px) scale(1.03); }
  }
`;

/* ─── Types ───────────────────────────────────────────────────────────────── */

/**
 * Carte produit promotionnel normalisee.
 * Decouple la logique API du rendu UI.
 */
export interface PromoProductCard {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: string;
  comparePrice: string | null;
  discountPercent: number;
  image: string | null;
  reviewCount: number;
  rating: number;
}

/* ─── Utilitaires ─────────────────────────────────────────────────────────── */

/** Convertit un objet Soldes (API) vers une PromoProductCard (UI) */
function mapSaleToCard(sale: Soldes): PromoProductCard {
  return {
    id: sale.id,
    productId: sale.id,
    name: sale.product_name,
    slug: sale.product_slug,
    price: sale.sale_price,
    comparePrice: sale.original_price,
    discountPercent: sale.discount_percent,
    image: sale.product_image || null,
    reviewCount: 0,
    rating: 5.0,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : LiveCountdownBadge
   Affiche le temps restant sur la premiere vente flash.
   Mise a jour toutes les secondes.
═══════════════════════════════════════════════════════════════════════════ */
function LiveCountdownBadge({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function compute() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Terminee"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(`${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    }
    compute();
    const id = setInterval(compute, 1_000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!remaining) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2"
      style={{
        background: "rgba(232,113,26,0.15)",
        border: "1px solid rgba(232,113,26,0.35)",
        backdropFilter: "blur(8px)",
      }}
      aria-live="polite"
      aria-label={`Offre se termine dans ${remaining}`}
    >
      <Clock className="h-3.5 w-3.5 text-[#F5A623]" aria-hidden="true" />
      <span className="font-mono text-[11px] font-bold tracking-widest text-[#F5A623]">
        {remaining}
      </span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : HeroSection
   Section hero cinematique — image circulaire, gradient profond,
   feuilles animees, badge timer live, CTAs premium.
═══════════════════════════════════════════════════════════════════════════ */
interface HeroSectionProps {
  featured: Soldes | null;
  loading: boolean;
}

function HeroSection({ featured, loading }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const heroImage = featured?.product_image || FALLBACK_HERO;
  const heroPrice = featured?.sale_price ?? "5900";
  const heroCompare = featured?.original_price ?? null;
  const heroLink = featured ? `/products/${featured.product_slug}` : "/products";
  const hasDiscount = !!(heroCompare && Number(heroCompare) > Number(heroPrice));
  const discountPct = hasDiscount
    ? Math.round((1 - Number(heroPrice) / Number(heroCompare!)) * 100)
    : 0;

  /* Variants d'animation staggeres */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[520px] overflow-hidden pt-24 pb-24 text-white sm:pt-28 sm:pb-28"
      aria-label="Offres du moment - section principale"
    >
      {/* Fond gradient forest profond */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(145deg, #0A2418 0%, #0D2E1E 35%, #1A4A30 65%, #122C1E 100%)" }}
        aria-hidden="true"
      />

      {/* Texture grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          animation: "promo-grain 8s steps(1) infinite",
        }}
        aria-hidden="true"
      />

      {/* Halo radial jade */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #2F9E6F 0%, transparent 70%)", animation: "promo-halo-pulse 6s ease-in-out infinite" }}
        aria-hidden="true"
      />

      {/* Orbes decoratifs */}
      <div
        className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #2F9E6F, transparent 70%)", animation: "promo-orb-drift 12s ease-in-out infinite" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-12 h-56 w-56 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #E8711A, transparent 70%)", animation: "promo-orb-drift 9s ease-in-out 3s infinite reverse" }}
        aria-hidden="true"
      />

      {/* Grille fine de profondeur */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* Contenu principal */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-10">

          {/* Bloc texte gauche */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Pill label */}
            <motion.div variants={itemVariants}>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{
                  background: "rgba(47,158,111,0.18)",
                  border: "1px solid rgba(47,158,111,0.35)",
                  backdropFilter: "blur(12px)",
                  color: "#7EDBB4",
                }}
              >
                <Zap className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Offres du moment
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
            >
              Goutez le{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #7EDBB4 0%, #2F9E6F 50%, #F5A623 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                meilleur
              </span>
              <span className="mt-1 block text-white/85">du terroir</span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={itemVariants} className="mt-5 max-w-md text-[15px] leading-7 text-white/60">
              Des produits agricoles selectionnes avec soin et des ventes flash pour
              savourer le terroir a prix avantageux.
            </motion.p>

            {/* Prix hero */}
            {!loading && (
              <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-end gap-3">
                <p
                  className="text-4xl font-black leading-none text-white"
                  style={{ textShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                >
                  {formatCurrency(parseFloat(heroPrice), "FCFA")}
                </p>
                {hasDiscount && (
                  <>
                    <p className="pb-1 text-lg text-white/35 line-through">
                      {formatCurrency(parseFloat(heroCompare!), "FCFA")}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white"
                      style={{
                        background: "linear-gradient(135deg, #E8711A, #F5A623)",
                        boxShadow: "0 4px 16px rgba(232,113,26,0.45)",
                        animation: "promo-badge-float 3s ease-in-out infinite",
                      }}
                    >
                      <TrendingDown className="h-3 w-3" aria-hidden="true" />
                      -{discountPct}%
                    </span>
                  </>
                )}
              </motion.div>
            )}

            {/* Countdown live */}
            {featured?.ends_at && (
              <motion.div variants={itemVariants} className="mt-4">
                <LiveCountdownBadge endsAt={featured.ends_at} />
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={heroLink}
                className="group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(232,113,26,0.45)] transition-all hover:scale-105 hover:shadow-[0_18px_44px_rgba(232,113,26,0.55)]"
                style={{ background: "linear-gradient(135deg, #E8711A 0%, #F5A623 60%, #E8711A 100%)" }}
              >
                <ShoppingBag className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                Acheter maintenant
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/50 hover:text-white"
                style={{ borderColor: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.06)" }}
              >
                Voir la boutique
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-5">
              {[
                { icon: Star, label: "Selection premium" },
                { icon: Leaf, label: "Produits du terroir" },
                { icon: Zap, label: "Offres limitees" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] font-medium text-white/40">
                  <Icon className="h-3.5 w-3.5 text-white/25" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Bloc image circulaire */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.12 }}
            className="relative mx-auto w-full max-w-[440px] justify-self-center lg:justify-self-end"
          >
            {/* Feuille gauche */}
            <div
              className="pointer-events-none absolute -left-10 top-10 h-20 w-20 opacity-75"
              style={{ animation: "promo-float-leaf 5s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <Leaf className="h-full w-full text-[#7EDBB4]" strokeWidth={1.1} />
            </div>
            {/* Feuille droite */}
            <div
              className="pointer-events-none absolute -right-6 bottom-16 h-14 w-14 opacity-60"
              style={{ animation: "promo-float-leaf-2 7s ease-in-out 1.5s infinite" }}
              aria-hidden="true"
            >
              <Leaf className="h-full w-full text-[#9fd067]" strokeWidth={1.1} />
            </div>

            {/* Halo de lumiere */}
            <div
              className="absolute inset-4 rounded-full opacity-25 blur-2xl"
              style={{ background: "radial-gradient(circle, #2F9E6F 0%, #E8711A 80%, transparent 100%)" }}
              aria-hidden="true"
            />

            {/* Image principale avec parallaxe */}
            <motion.div
              style={{ y: imgY }}
              className="relative aspect-square overflow-hidden rounded-full"
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-full"
                style={{
                  border: "5px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.08)",
                }}
              >
                <Image
                  src={mediaUrl(heroImage) || FALLBACK_HERO}
                  alt={featured ? `Produit en promotion : ${featured.product_name}` : "Selection de produits du terroir"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 440px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(145deg, rgba(13,46,30,0.15) 0%, transparent 50%, rgba(13,46,30,0.35) 100%)" }}
                  aria-hidden="true"
                />
              </div>
            </motion.div>

            {/* Badge remise */}
            {hasDiscount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                transition={{ type: "spring", stiffness: 340, damping: 18, delay: 0.5 }}
                className="absolute -right-4 top-8 rounded-2xl px-4 py-3 text-center text-white shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #E8711A, #F5A623)",
                  boxShadow: "0 12px 32px rgba(232,113,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
                aria-hidden="true"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.15em]">Economie</p>
                <p className="text-2xl font-black leading-none">-{discountPct}%</p>
              </motion.div>
            )}

            {/* Badge Premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.65 }}
              className="absolute -left-6 bottom-12 rounded-xl px-3 py-2.5 text-center shadow-xl"
              style={{
                background: "rgba(13,46,30,0.9)",
                border: "1px solid rgba(47,158,111,0.4)",
                backdropFilter: "blur(16px)",
              }}
              aria-hidden="true"
            >
              <Star className="mx-auto h-4 w-4 text-[#7EDBB4]" />
              <p className="mt-1 text-[10px] font-bold text-white/70">Qualite</p>
              <p className="text-sm font-black text-white">Premium</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Vague de transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 24 L1440 60 Z" fill="#f9f6ee" />
        </svg>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : SectionHeader
   En-tete de section avec pill label et titre principal.
═══════════════════════════════════════════════════════════════════════════ */
interface SectionHeaderProps {
  icon: React.ElementType;
  label: string;
  title: string;
  subtitle?: string;
}

function SectionHeader({ icon: Icon, label, title, subtitle }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="mb-10"
    >
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{
          background: "rgba(31,77,63,0.10)",
          border: "1px solid rgba(31,77,63,0.20)",
          color: "#1f4d3f",
        }}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
      <h2 className="mt-3 text-2xl font-black text-[#1f241c] sm:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5c6a59]">{subtitle}</p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : SkeletonCard
   Placeholder anime pendant le chargement.
═══════════════════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="h-48 animate-pulse rounded-2xl bg-gradient-to-br from-[#eae5da] to-[#ddd8cc]" />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : EmptyState
   Affichage premium quand aucune promotion n'est active.
═══════════════════════════════════════════════════════════════════════════ */
function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#ddd8cc] bg-white/60 px-8 py-16 text-center backdrop-blur-sm"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(47,158,111,0.12), rgba(232,113,26,0.08))",
          border: "1px solid rgba(47,158,111,0.2)",
        }}
      >
        <Star className="h-7 w-7 text-[#2F9E6F]" aria-hidden="true" />
      </div>
      <p className="max-w-xs text-sm leading-relaxed text-[#5c6a59]">{message}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL : PromotionsPage
   Orchestrateur de la page entiere.
   - Charge les donnees API
   - Gere les etats de chargement
   - Compose les sections dans l'ordre visuel
═══════════════════════════════════════════════════════════════════════════ */
export default function PromotionsPage() {
  const [flashSales, setFlashSales] = useState<Soldes[]>([]);
  const [promoCards, setPromoCards] = useState<PromoProductCard[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCodeList[]>([]);
  const [loading, setLoading] = useState(true);

  /* Chargement des donnees API */
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const [salesRes, codesRes] = await Promise.allSettled([
          getActiveSales(),
          getActivePromoCodes(),
        ]);

        if (!active) return;

        const sales: Soldes[] =
          salesRes.status === "fulfilled" && salesRes.value.ok ? salesRes.value.data : [];
        const codes: PromoCodeList[] =
          codesRes.status === "fulfilled" && codesRes.value.ok ? codesRes.value.data : [];

        setFlashSales(sales);
        setPromoCards(sales.map(mapSaleToCard));
        setPromoCodes(codes);
      } catch {
        if (!active) return;
        setFlashSales([]);
        setPromoCards([]);
        setPromoCodes([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  const featured = flashSales[0] ?? null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9f6ee]">
      {/* Injection unique des keyframes globaux */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_KEYFRAMES }} />

      {/* Section 1 : Hero cinematique */}
      <HeroSection featured={featured} loading={loading} />

      {/* Section 2 : Corps de la page */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">

        {/* Etat de chargement / contenu */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-14"
            >
              <div>
                <div className="mb-8 h-8 w-48 animate-pulse rounded-full bg-[#e0dbd0]" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
              <div>
                <div className="mb-8 h-8 w-56 animate-pulse rounded-full bg-[#e0dbd0]" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-16"
            >
              {/* Section codes promo */}
              {promoCodes.length > 0 && (
                <section aria-label="Codes promo disponibles">
                  <SectionHeader
                    icon={Tag}
                    label="Codes promo"
                    title="Vos codes de reduction"
                    subtitle="Cliquez sur un code pour l'appliquer directement a votre panier."
                  />
                  <PromoCodesGrid promos={promoCodes} />
                </section>
              )}

              {/* Section produits en promotion */}
              <section aria-label="Produits en promotion">
                <SectionHeader
                  icon={Star}
                  label="Ventes flash"
                  title="Produits en promotion"
                  subtitle="Des offres limitees selectionnees parmi les meilleurs produits du terroir."
                />
                {promoCards.length === 0 ? (
                  <EmptyState message="Aucune vente flash active pour le moment. Les promotions configurees dans l'administration apparaitront ici automatiquement." />
                ) : (
                  <PromoProductsCarousel items={promoCards} />
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA explorer la boutique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="mt-16 text-center"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-white shadow-[0_12px_32px_rgba(31,77,63,0.3)] transition-all hover:scale-105 hover:shadow-[0_18px_44px_rgba(31,77,63,0.4)]"
            style={{ background: "linear-gradient(135deg, #1f4d3f 0%, #2F9E6F 50%, #1f4d3f 100%)" }}
          >
            <ShoppingBag className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
            Explorer toute la boutique
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
