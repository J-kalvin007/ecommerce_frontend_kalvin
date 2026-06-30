/**
 * LoyaltyProfileCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Carte hero du profil de fidélité — pièce centrale de l'interface.
 *
 * Design inspiré des meilleures apps de fidélité (Starbucks Rewards, LVMH).
 * Affiche : grade actuel avec gradient animé, points, solde total,
 * progression vers le palier suivant et avatar utilisateur.
 *
 * @module app/customer/fidelites/components/LoyaltyProfileCard
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Medal,
  Star,
  Crown,
  Gem,
  TrendingUp,
  ChevronRight,
  Award,
  RefreshCw,
  BadgeDollarSign,
} from "lucide-react";
import type { LoyaltyProfile, Tier, PointValue } from "@/modeles/fidelites";
import { getTierConfig } from "@/modeles/fidelites";

/* ── Map des icônes de palier ────────────────────────────────────────────── */
const TIER_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Bronze: Medal,
  Silver: Star,
  Gold: Crown,
  Platinum: Gem,
  Diamond: Star,
};

/* ── Utilitaires ────────────────────────────────────────────────────────── */

function formatPoints(pts: number): string {
  return new Intl.NumberFormat("fr-FR").format(pts);
}

function formatAmount(amount: string): string {
  const num = parseFloat(amount || "0");
  if (isNaN(num)) return "0 FCFA";
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " FCFA"
  );
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface LoyaltyProfileCardProps {
  profile: LoyaltyProfile;
  tiers: Tier[];
  pointValueConfig?: PointValue | null;
  isRefreshing: boolean;
  onRedeem: () => void;
  onRefresh: () => void;
}

/**
 * LoyaltyProfileCard
 *
 * Carte hero ultra-premium avec gradient du palier, barre de progression
 * animée vers le grade suivant, et appel à l'action principal (Dépenser).
 */
export default function LoyaltyProfileCard({
  profile,
  tiers,
  pointValueConfig,
  isRefreshing,
  onRedeem,
  onRefresh,
}: LoyaltyProfileCardProps) {
  const tierCfg = getTierConfig(profile.tier_name);
  const TierIcon = TIER_ICONS[profile.tier_name] ?? Award;

  /* ── Calcul de la progression vers le palier suivant ─────────────────── */
  const progressData = useMemo(() => {
    const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);
    const currentIdx = sortedTiers.findIndex((t) => t.name === profile.tier_name);
    const nextTier = sortedTiers[currentIdx + 1] ?? null;
    const currentTier = sortedTiers[currentIdx];

    if (!nextTier) return { percent: 100, nextTier: null, pointsNeeded: 0 };

    const base = currentTier?.min_points ?? 0;
    const target = nextTier.min_points;
    const range = target - base;
    const progress = profile.points_balance - base;
    const percent = Math.min(100, Math.max(0, (progress / range) * 100));
    const pointsNeeded = Math.max(0, target - profile.points_balance);

    return { percent, nextTier, pointsNeeded };
  }, [tiers, profile.tier_name, profile.points_balance]);

  const isMaxTier = progressData.nextTier === null;

  /* ── Calcul Valeur réelle ──────────────────────────────────────────────── */
  const pointValueRatio =
    pointValueConfig && pointValueConfig.nombre_de_point > 0
      ? pointValueConfig.valeur_un_point_frcfa / pointValueConfig.nombre_de_point
      : 10;
  const currentFcfaValue = profile.points_balance * pointValueRatio;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          "linear-gradient(135deg, #0d1a0f 0%, #1a2e1c 40%, #0f2012 70%, #071208 100%)",
        boxShadow:
          "0 32px 80px -16px rgba(31,77,63,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Glow de couleur du palier ── */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
        style={{
          background: `radial-gradient(circle, ${tierCfg.color}30 0%, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />

      {/* ── Lignes décoratives (style carte de crédit) ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 opacity-5"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.6), rgba(255,255,255,0.6) 1px, transparent 1px, transparent 14px)",
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* ── En-tête : Palier + Bouton refresh ── */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Badge palier avec icône */}
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${tierCfg.color}25, ${tierCfg.color}10)`,
                border: `1.5px solid ${tierCfg.color}35`,
                boxShadow: `0 0 20px ${tierCfg.color}20`,
              }}
            >
              <span style={{ color: tierCfg.color }}>
                <TierIcon
                  className="h-6 w-6"
                  strokeWidth={1.75}
                />
              </span>
              {/* Shimmer animé sur l'icône */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                className="absolute inset-0 -skew-x-12 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tierCfg.color}40, transparent)`,
                }}
              />
            </motion.div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                Grade actuel
              </p>
              <h2
                className="text-[1.6rem] font-black leading-none tracking-tight"
                style={{ color: tierCfg.color }}
              >
                {profile.tier_name}
              </h2>
            </div>
          </div>

          {/* Bouton actualiser */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            title="Actualiser"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={
                isRefreshing
                  ? { duration: 0.8, repeat: Infinity, ease: "linear" }
                  : {}
              }
            >
              <RefreshCw className="h-3.5 w-3.5 text-white/50" />
            </motion.div>
          </motion.button>
        </div>

        {/* ── Points solde principal ── */}
        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Points disponibles
          </p>
          <div className="flex items-end gap-3">
            <motion.p
              key={profile.points_balance}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-black leading-none tracking-tighter text-white"
              style={{
                fontSize: "clamp(3rem, 7vw, 5rem)",
                textShadow: `0 0 40px ${tierCfg.color}30`,
              }}
            >
              {formatPoints(profile.points_balance)}
            </motion.p>
            <span className="mb-2 text-lg font-bold text-white/40">pts</span>
          </div>

          {/* Méta info : total gagné + solde */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
              <span className="text-[11.5px] text-white/60">
                Valeur actuelle :{" "}
                <span className="font-bold text-white/90" style={{ color: tierCfg.color }}>
                  {formatAmount(String(currentFcfaValue))}
                </span>
              </span>
            </div>
            {pointValueConfig && pointValueConfig.duree_validite > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
                <span className="text-[11.5px] text-white/60">
                  Validité :{" "}
                  <span className="font-bold text-white/90">
                    {pointValueConfig.duree_validite} jours
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400/70" strokeWidth={2} />
              <span className="text-[11.5px] text-white/40">
                Gagné :{" "}
                <span className="font-bold text-white/60">
                  {formatPoints(profile.total_points_gagne)} pts
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Barre de progression vers le palier suivant ── */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-white/40">
              {isMaxTier
                ? "Palier maximum atteint 🏆"
                : `Vers ${progressData.nextTier?.name}`}
            </p>
            {!isMaxTier && (
              <p className="text-[11px] font-bold" style={{ color: tierCfg.color }}>
                {formatPoints(progressData.pointsNeeded)} pts restants
              </p>
            )}
          </div>

          {/* Track de progression */}
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressData.percent}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${tierCfg.color}80, ${tierCfg.color})`,
                boxShadow: `0 0 12px ${tierCfg.color}60`,
              }}
            />
          </div>

          {!isMaxTier && (
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/25">
              <span>{profile.tier_name}</span>
              <span>{progressData.nextTier?.name}</span>
            </div>
          )}
        </div>

        {/* ── Bouton d'action : Dépenser mes points ── */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          // onClick={onRedeem}
          onClick={() => window.location.href = "/products"}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[14px] font-bold tracking-tight text-white"
          style={{
            background: `linear-gradient(135deg, ${tierCfg.color} 0%, ${tierCfg.color}bb 100%)`,
            boxShadow: `0 8px 24px ${tierCfg.color}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          <BadgeDollarSign className="h-4 w-4" strokeWidth={2} />
          Utiliser mes points
          <ChevronRight className="h-4 w-4 opacity-70" />
        </motion.button>
      </div>
    </motion.div>
  );
}
