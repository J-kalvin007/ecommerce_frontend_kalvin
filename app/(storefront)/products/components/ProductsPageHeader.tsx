


"use client";

/**
 * ProductsPageHeader — Redesign ultra-premium
 *
 * Améliorations visuelles & UX :
 *  - Compteurs animés CountUp natif (useCountUp hook interne)
 *  - Ligne de séparation dorée qui se dessine de gauche à droite au mount
 *  - Shimmer ambiant très subtil sur le fond hero
 *  - Breadcrumb avec chevrons animés au hover
 *  - Badges stat avec ring subtil et icône colorée
 *  - Entrées orchestrées stagger précis
 *  - useReducedMotion respecté partout
 *
 * Noms de variables et fonctions d'origine conservés intégralement.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Package, Tags } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES — conservation de l'interface d'origine
   ───────────────────────────────────────────────────────────── */

type ProductsPageHeaderProps = {
  productCount: number;
  categoryCount: number;
};

/* ─────────────────────────────────────────────────────────────
   HOOK INTERNE : useCountUp
   Anime un entier de 0 jusqu'à `target` en `duration` ms.
   ───────────────────────────────────────────────────────────── */

function useCountUp(target: number, duration = 900): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrent(target);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic pour une décélération naturelle
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, prefersReducedMotion]);

  return current;
}

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANT : StatBadge — conservation du nom d'origine
   Enrichi avec CountUp, ring subtil et animation d'entrée
   ───────────────────────────────────────────────────────────── */

function StatBadge({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  delay?: number;
}) {
  const animatedValue = useCountUp(value, 800);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "group flex min-w-[116px] items-center gap-3",
        "rounded-xl border border-white/12 bg-white/8",
        "px-4 py-3 backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-white/22 hover:bg-white/14",
      ].join(" ")}
    >
      {/* Icône avec ring subtil au hover */}
      <div className={[
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        "bg-white/10 transition-all duration-300",
        "group-hover:bg-white/18 group-hover:scale-110",
      ].join(" ")}>
        <Icon className="h-4 w-4 text-primary-light" strokeWidth={2.2} aria-hidden />
      </div>

      <div>
        {/* Valeur animée */}
        <p className="text-lg font-bold leading-none tabular-nums tracking-tight">
          {animatedValue}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL — conservation du nom d'origine
   ───────────────────────────────────────────────────────────── */

export function ProductsPageHeader({ productCount, categoryCount }: ProductsPageHeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-highlight pt-0 text-white"
      aria-labelledby="products-hero-heading"
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











      {/* ── Fond ambiant multi-radial ── */}
      {/* <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(circle at 12% 18%, rgba(239,130,25,0.16) 0%, transparent 40%)",
            "radial-gradient(circle at 88% 0%, rgba(255,255,255,0.08) 0%, transparent 34%)",
            "radial-gradient(circle at 50% 110%, rgba(31,77,63,0.25) 0%, transparent 50%)",
          ].join(","),
        }}
        aria-hidden
      /> */}

      {/* ── Shimmer diagonale très subtil ── */}
      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute -inset-y-4 w-[200px] -skew-x-12"
          style={{
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "200vw" }}
          transition={{ duration: 3.5, delay: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 6 }}
          aria-hidden
        />
      )}

      <div className="relative mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-9 md:py-10">

        {/* ── Breadcrumb ── */}
        <motion.nav
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label="Fil d'Ariane"
          className="mb-5 flex items-center gap-1.5 text-xs text-white/50"
        >
          <Link
            href="/"
            className="transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded"
          >
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="font-medium text-white/88">Boutique</span>
        </motion.nav>

        {/* ── Hero body ── */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          {/* Titre + description */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="max-w-2xl"
          >
            {/* Eyebrow avec séparateur doré */}
            <div className="mb-2 flex items-center gap-2">
              <motion.span
                className="block h-px bg-primary-light/60"
                initial={prefersReducedMotion ? {} : { width: 0 }}
                animate={{ width: 20 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-light">
                Catalogue produits
              </p>
            </div>

            <h1
              id="products-hero-heading"
              className="font-display text-3xl font-bold tracking-tight md:text-[2.35rem]"
            >
              Notre Boutique
            </h1>

            <p className="mt-2.5 max-w-xl text-sm leading-6 text-white/72 md:text-[15px]">
              Parcourez notre sélection de produits du terroir — fruits, légumes, épices et
              produits transformés, disponibles pour la livraison mondiale.
            </p>
          </motion.div>

          {/* Badges statistiques */}
          <div className="flex shrink-0 flex-wrap gap-3">
            <StatBadge icon={Package} label="Produits" value={productCount} delay={0.12} />
            <StatBadge icon={Tags} label="Catégories" value={categoryCount} delay={0.18} />
          </div>
        </div>
      </div>

      {/* ── Ligne dorée qui se dessine ── */}
      <div className="relative h-0.5 overflow-hidden">
        <div className="absolute inset-0 bg-primary/20" />
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            background: "linear-gradient(to right, var(--color-primary, #ef8219), rgba(239,130,25,0.4), transparent)",
          }}
          initial={prefersReducedMotion ? {} : { width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
      </div>
    </section>
  );
}