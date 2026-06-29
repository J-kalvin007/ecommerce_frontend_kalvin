
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { apiPublic } from "@/lib/axios";
import type { PromoCodeList } from "@/modeles/promotions";
import { Tag } from "lucide-react";

// ─── Vitesse de défilement (px par seconde) ──────────────────────────────────
// Augmenter pour aller plus vite, diminuer pour ralentir.
const PX_PER_SECOND = 60;

const STATS = [
  { value: "10+", label: "Producteurs partenaires" },
  { value: "85+", label: "References produits" },
  { value: "4+", label: "Pays d'export" },
  { value: "4.2/5", label: "Satisfaction client" },
] as const;

export default function TrustBand() {
  const [promoItems, setPromoItems] = useState<PromoCodeList[]>([]);
  const [duration, setDuration] = useState<number>(30);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ── Fetch des codes promo actifs ─────────────────────────────────────── */
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await apiPublic.get<PromoCodeList[]>(
          "/api/v1/promotions/codes-promo-actifs/"
        );
        setPromoItems(response.data);
      } catch {
        setPromoItems([]);
      }
    };
    fetchPromos();
  }, []);

  /* ── Calcul dynamique de la durée selon la largeur réelle du track ─────── */
  useEffect(() => {
    if (!trackRef.current || promoItems.length === 0) return;
    // On mesure la largeur d'une seule copie (la moitié du track doublé)
    const trackWidth = trackRef.current.scrollWidth / 2;
    const computed = Math.max(10, Math.round(trackWidth / PX_PER_SECOND));
    setDuration(computed);
  }, [promoItems]);

  if (promoItems.length === 0) {
    /* ── Pas de codes promo : on affiche uniquement les stats ─────────────── */
    return (
      <section className="border-y border-border bg-surface">
        <StatsGrid />
      </section>
    );
  }

  // Triple le contenu pour que le seamless-loop fonctionne même avec très peu d'items
  const loopItems = [...promoItems, ...promoItems, ...promoItems];

  return (
    <section className="border-y border-border bg-surface">
      <StatsGrid />

      {/* ── Bannière défilante ─────────────────────────────────────────────── */}
      <div
        className="group relative overflow-hidden bg-primary py-2.5"
        aria-label="Codes promotionnels actifs"
      >
        {/* Dégradés de fondu sur les bords */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-primary to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-primary to-transparent" />

        {/* Track — utilise une animation CSS inline pour une durée dynamique */}
        <div
          ref={trackRef}
          className="flex w-max items-center"
          style={{
            animationName: "marquee-scroll",
            animationDuration: `${duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            // Pause au survol pour que l'utilisateur puisse lire le code
            animationPlayState: undefined,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.animationPlayState = "paused")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.animationPlayState = "running")
          }
        >
          {loopItems.map((promo, index) => (
            <PromoChip key={`${promo.code}-${index}`} promo={promo} />
          ))}
        </div>
      </div>

      {/* ── Keyframe injectée en ligne ─────────────────────────────────────── */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
      `}</style>
    </section>
  );
}

/* ── Chip individuelle pour un code promo ───────────────────────────────────── */
function PromoChip({ promo }: { promo: PromoCodeList }) {
  const discountLabel =
    promo.type === "percentage"
      ? `-${parseFloat(promo.value).toFixed(0)}%`
      : promo.type === "fixed_amount"
        ? `-${parseFloat(promo.value).toLocaleString()} FCFA`
        : promo.type_display || null;

  return (
    <div className="flex shrink-0 items-center gap-3 px-6 sm:px-8">
      {/* Code promo */}
      <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/20">
        <Tag className="h-3.5 w-3.5 text-[#c2e662]" />
        <span className="text-sm font-black uppercase tracking-[0.18em] text-white">
          {promo.code}
        </span>
        {discountLabel && (
          <span className="rounded-full bg-[#c2e662] px-2 py-0.5 text-[10px] font-extrabold text-[#1f4d3f]">
            {discountLabel}
          </span>
        )}
      </div>

      {/* Description si disponible */}
      {/* {promo.description && (
        <span className="max-w-[180px] truncate text-xs font-medium text-white/70 sm:max-w-[240px]">
          {promo.description}
        </span>
      )} */}

      {/* Séparateur décoratif */}
      <span className="text-lg text-[#c2e662]/60">✦</span>
    </div>
  );
}

/* ── Grille des statistiques ────────────────────────────────────────────────── */
function StatsGrid() {
  return (
    <div className="mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
      <div className="grid grid-cols-2 divide-x divide-[#eadfce] md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="flex flex-col items-center justify-center px-4 py-6 text-center"
          >
            <p className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}