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
import { Sparkles, Check, ChevronRight } from "lucide-react";
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

  // Si pas de profil ou solde 0, on n'affiche rien ou une version désactivée
  if (!profil || profil.points_balance === 0) {
    return null; // On masque complètement au checkout s'il n'a pas de points
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
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: isApplique ? tierConfig.bg : bg,
        border: `1px solid ${isApplique ? tierConfig.color : border}`,
      }}
    >
      {/* Shimmer effect pour carte fidélité */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${tierConfig.color} 50%, transparent 100%)`,
          maskImage: "linear-gradient(white, white)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${tierConfig.color}, #000)`,
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold tracking-tight" style={{ color: text }}>
              Atelier Récompenses
            </h4>
            <p className="mt-0.5 text-sm font-medium" style={{ color: tierConfig.color }}>
              Solde : {solde} points ({formatCurrency(String(solde * valeurPointFCFA), "FCFA")})
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={maxPointsApplicables === 0}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          style={{ background: `linear-gradient(135deg, ${tierConfig.color}, #1f4d3f)` }}
        >
          {isApplique ? (
            <>
              <Check className="h-4 w-4" /> Points appliqués
            </>
          ) : (
            <>
              Utiliser mes points <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {isApplique && (
        <div className="relative z-10 mt-4 border-t pt-3" style={{ borderColor: border }}>
          <p className="text-sm font-medium" style={{ color: text }}>
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
