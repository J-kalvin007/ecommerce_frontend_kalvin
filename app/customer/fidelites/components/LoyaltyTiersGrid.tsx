/**
 * LoyaltyTiersGrid.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Grille visuelle de tous les paliers de fidélité disponibles.
 *
 * Pour chaque palier, affiche :
 *   - Icône et nom du grade avec gradient du palier
 *   - Points minimums requis
 *   - Solde minimum requis
 *   - Pourcentage de réduction offert
 *   - Indicateur visuel si c'est le palier actuel du client
 *
 * @module app/customer/fidelites/components/LoyaltyTiersGrid
 */

"use client";

import { motion } from "framer-motion";
import {
  Medal,
  Star,
  Crown,
  Gem,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
} from "lucide-react";
import type { Tier } from "@/modeles/fidelites";
import { getTierConfig } from "@/modeles/fidelites";

/* ── Map des icônes de palier ────────────────────────────────────────────── */
const TIER_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Bronze:   Medal,
  Silver:   Star,
  Gold:     Crown,
  Platinum: Gem,
  Diamond:  Sparkles,
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
interface LoyaltyTiersGridProps {
  tiers: Tier[];
  currentTierName: string;
  currentPoints: number;
}

/**
 * LoyaltyTiersGrid
 *
 * Grille des paliers de fidélité avec mise en évidence du grade actuel
 * et indicateur de progression (débloqué / actuel / verrouillé).
 */
export default function LoyaltyTiersGrid({
  tiers,
  currentTierName,
  currentPoints,
}: LoyaltyTiersGridProps) {
  const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);

  return (
    <section aria-label="Paliers de fidélité">
      <div className="mb-4">
        <h2 className="text-[15px] font-black tracking-tight text-[#1f241c]">
          Parcours de fidélité
        </h2>
        <p className="text-[12px] text-[#8A9080]">
          Progressez pour débloquer des avantages exclusifs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTiers.map((tier, idx) => {
          const cfg = getTierConfig(tier.name);
          const TierIcon = TIER_ICONS[tier.name] ?? Award;
          const isCurrentTier = tier.name === currentTierName;
          const isUnlocked = currentPoints >= tier.min_points;
          const discountPercent = parseFloat(tier.discount_percent || "0");

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: idx * 0.08,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)]"
              style={{
                borderColor: isCurrentTier ? cfg.color + "60" : "#E8E3D8",
                boxShadow: isCurrentTier
                  ? `0 0 0 2px ${cfg.color}20, 0 4px 16px -4px ${cfg.color}25`
                  : undefined,
              }}
            >
              {/* Barre supérieure colorée */}
              <div
                className="h-1 w-full"
                style={{
                  background: isUnlocked
                    ? `linear-gradient(90deg, ${cfg.color}60, ${cfg.color}, ${cfg.color}60)`
                    : "linear-gradient(90deg, #E8E3D8, #D4CFC5, #E8E3D8)",
                }}
              />

              {/* Badge "Actuel" */}
              {isCurrentTier && (
                <div
                  className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    background: cfg.color + "18",
                    color: cfg.color,
                    border: `1px solid ${cfg.color}30`,
                  }}
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Mon grade
                </div>
              )}

              <div className="p-5">
                {/* Icône du palier */}
                <motion.div
                  whileHover={isUnlocked ? { rotate: 6, scale: 1.08 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: isUnlocked
                      ? `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}08)`
                      : "rgba(0,0,0,0.03)",
                    border: `1.5px solid ${isUnlocked ? cfg.color + "30" : "#E8E3D8"}`,
                  }}
                >
                  {isUnlocked ? (
                    <TierIcon
                      className="h-6 w-6"
                      style={{ color: cfg.color }}
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Lock className="h-5 w-5 text-[#C4BFB6]" strokeWidth={1.75} />
                  )}
                </motion.div>

                {/* Nom du palier */}
                <h3
                  className="text-[17px] font-black tracking-tight"
                  style={{
                    color: isUnlocked ? cfg.color : "#C4BFB6",
                  }}
                >
                  {tier.name}
                </h3>

                {/* Points minimum */}
                <p className="mt-1 text-[12px] text-[#8A9080]">
                  À partir de{" "}
                  <span className="font-bold text-[#4A5540]">
                    {formatPoints(tier.min_points)} pts
                  </span>
                </p>

                {/* Séparateur */}
                <div className="my-4 h-px bg-[#F2EFE8]" />

                {/* Avantages du palier */}
                <div className="space-y-2">
                  {/* Réduction */}
                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#8A9080]">Réduction</span>
                      <span
                        className="text-[13px] font-black"
                        style={{ color: isUnlocked ? cfg.color : "#C4BFB6" }}
                      >
                        {discountPercent}%
                      </span>
                    </div>
                  )}

                  {/* Solde minimum */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#8A9080]">Solde requis</span>
                    <span className="text-[12px] font-bold text-[#4A5540]">
                      {formatAmount(tier.min_solde)}
                    </span>
                  </div>
                </div>

                {/* Barre de progression si palier verrouillé */}
                {!isUnlocked && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10.5px] text-[#8A9080]">Progression</span>
                      <span className="text-[10.5px] font-bold text-[#8A9080]">
                        {Math.round(
                          Math.min(100, (currentPoints / tier.min_points) * 100)
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2EFE8]">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${Math.min(100, (currentPoints / tier.min_points) * 100)}%`,
                        }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: idx * 0.1 + 0.4 }}
                        className="h-full rounded-full bg-[#D4CFC5]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
