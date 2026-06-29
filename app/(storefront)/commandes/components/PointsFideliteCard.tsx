/**
 * PointsFideliteCard — Carte de fidélité premium pour checkout
 *
 * - Affiche le solde actuel de l'utilisateur
 * - Permet d'appliquer des points pour réduire le total
 * - Effet glassmorphism et shimmer
 *
 * @module components/commandes/PointsFideliteCard
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, ChevronRight, Star } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { LoyaltyProfile, getTierConfig } from "@/modeles/fidelites";
import { formatCurrency } from "@/lib/utils";

interface PointsFideliteCardProps {
  /** Profil de fidélité (chargé depuis le backend) */
  profil: LoyaltyProfile | null;
  /** Le montant total de la commande actuel (pour calculer la réduc max) */
  totalCommande: number;
  /** Valeur FCFA équivalente à 1 point (ex: 1 point = 10 FCFA, selon les règles métier, ou renvoyé par l'API) */
  valeurPointFCFA?: number;
  /** Les points actuellement appliqués à la commande */
  pointsAppliques: number;
  /** Callback quand l'utilisateur applique/retire ses points */
  onPointsChange: (points: number, discountFcfa: number) => void;
}

export default function PointsFideliteCard({
  profil,
  totalCommande,
  valeurPointFCFA = 10, // Valeur par défaut, à ajuster selon le backend
  pointsAppliques,
  onPointsChange,
}: PointsFideliteCardProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Si pas de profil on n'affiche rien. Si le solde est 0, on affiche quand même pour information
  if (!profil) {
    return null;
  }

  const solde = profil.points_balance;
  const maxPointsApplicables = Math.min(solde, Math.floor(totalCommande / valeurPointFCFA));
  const isApplique = pointsAppliques > 0;

  const handleToggle = () => {
    if (isApplique) {
      onPointsChange(0, 0);
    } else {
      const points = maxPointsApplicables;
      const discount = points * valeurPointFCFA;
      onPointsChange(points, discount);
    }
  };

  const tierConfig = getTierConfig(profil.tier_name);
  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-4 shadow-sm"
      style={{
        background: isApplique ? tierConfig.bg : bg,
        border: `1px solid ${isApplique ? tierConfig.color : border}`,
      }}
    >
      {/* Shimmer effect pour carte fidélité */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${tierConfig.color} 50%, transparent 100%)`,
          maskImage: "linear-gradient(white, white)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md"
            style={{
              background: `linear-gradient(135deg, ${tierConfig.color}, #000)`,
            }}
          >
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-[13px] tracking-tight uppercase" style={{ color: text }}>
              Atelier Récompenses
            </h4>
            <p className="text-xs font-medium" style={{ color: tierConfig.color }}>
              Solde : {solde} points ({formatCurrency(String(solde * valeurPointFCFA), "FCFA")})
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={maxPointsApplicables === 0}
          className="cursor-pointer flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          style={{ background: `linear-gradient(135deg, ${tierConfig.color}, #1f4d3f)` }}
        >
          {isApplique ? (
            <>
              <Check className="h-3.5 w-3.5" /> Appliqué
            </>
          ) : (
            <>
              Utiliser <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {isApplique && (
        <div className="relative z-10 mt-3 border-t pt-2.5" style={{ borderColor: border }}>
          <p className="text-[11px] font-medium" style={{ color: text }}>
            Vous utilisez <strong>{pointsAppliques} points</strong> pour une réduction de{" "}
            <strong style={{ color: tierConfig.color }}>
              {formatCurrency(String(pointsAppliques * valeurPointFCFA), "FCFA")}
            </strong>
          </p>
        </div>
      )}
    </motion.div>
  );
}
