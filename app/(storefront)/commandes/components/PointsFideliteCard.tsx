/**
 * PointsFideliteCard — Carte de fidélité ultra-premium pour checkout
 *
 * - Affiche le solde, le tier, et la valeur de conversion des points
 * - Animations spring Framer Motion sur chaque état (appliqué / non-appliqué)
 * - Effet shimmer animé en continu pour signifier le statut exclusif
 * - Barre de progression des points utilisés
 * - Design glassmorphism haut de gamme adaptatif dark / light
 *
 * @module components/commandes/PointsFideliteCard
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, ChevronRight, Zap, Gift } from "lucide-react";
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
  valeurPointFCFA = 10,
  pointsAppliques,
  onPointsChange,
}: PointsFideliteCardProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Si pas de profil on n'affiche rien
  if (!profil) return null;

  const solde = profil.points_balance;
  const maxPointsApplicables = Math.min(solde, Math.floor(totalCommande / valeurPointFCFA));
  const isApplique = pointsAppliques > 0;

  // Pourcentage de points utilisés pour la barre de progression
  const progressPct = solde > 0 ? Math.min(100, (pointsAppliques / solde) * 100) : 0;

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

  // Tokens visuels selon le thème
  const bg = isDark ? "rgba(12,14,12,0.9)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shadow = isDark ? "0 16px 48px -12px rgba(0,0,0,0.6)" : "0 16px 48px -12px rgba(0,0,0,0.06)";
  const text = isDark ? "rgba(255,255,255,0.95)" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.9 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: isApplique
          ? isDark
            ? `linear-gradient(145deg, rgba(31,77,63,0.25) 0%, rgba(10,20,16,0.95) 100%)`
            : `linear-gradient(145deg, rgba(31,77,63,0.1) 0%, rgba(31,77,63,0.02) 100%)`
          : bg,
        border: `1px solid ${isApplique ? `${tierConfig.color}55` : border}`,
        boxShadow: isApplique
          ? `0 16px 48px -12px ${tierConfig.color}30`
          : shadow,
      }}
    >
      {/* ── Shimmer décoratif animé en arrière-plan ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          background: `linear-gradient(120deg, transparent 0%, ${tierConfig.color} 40%, transparent 80%)`,
          backgroundSize: "200% 200%",
        }}
      />

      {/* ── Orbe décorative coin supérieur droit ── */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-20"
        style={{ background: tierConfig.color }}
      />

      {/* ── Contenu principal ── */}
      <div className="relative z-10 p-5 sm:p-6">

        {/* En-tête : badge tier + solde */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icône tier avec gradient */}
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${tierConfig.color} 0%, #0f2018 100%)`,
              }}
            >
              <Star className="h-5 w-5 text-white" fill="white" />
              {/* Pulse ring si appliqué */}
              {isApplique && (
                <motion.span
                  className="absolute inset-0 rounded-2xl"
                  animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  style={{ border: `2px solid ${tierConfig.color}` }}
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-black uppercase tracking-widest" style={{ color: text }}>
                  Atelier Récompenses
                </h4>
                {/* Badge tier */}
                <span
                  className="flex h-[18px] items-center rounded-full px-2 text-[9px] font-black uppercase tracking-wider text-white"
                  style={{ background: tierConfig.color }}
                >
                  {profil.tier_name}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] font-semibold" style={{ color: textMuted }}>
                {solde.toLocaleString()} pts disponibles
              </p>
            </div>
          </div>

          {/* Valeur en FCFA du solde */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: textMuted }}>
              Valeur
            </span>
            <span className="text-base font-black tracking-tight" style={{ color: tierConfig.color }}>
              {formatCurrency(String(solde * valeurPointFCFA), "FCFA")}
            </span>
          </div>
        </div>

        {/* Séparateur léger */}
        <div className="mb-4 h-px w-full" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />

        {/* Ligne action : conversion + bouton */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0" style={{ color: tierConfig.color }} />
            <p className="text-[12px] font-semibold leading-tight" style={{ color: textMuted }}>
              {maxPointsApplicables > 0
                ? `Économisez ${formatCurrency(String(maxPointsApplicables * valeurPointFCFA), "FCFA")} sur cette commande`
                : "Solde insuffisant pour cette commande"}
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={maxPointsApplicables === 0}
            className="group relative flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-[12px] font-black text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isApplique
                ? "linear-gradient(135deg, #1f4d3f, #0f2018)"
                : `linear-gradient(135deg, ${tierConfig.color}, #1f4d3f)`,
            }}
          >
            {/* Shimmer au hover */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative z-10 flex items-center gap-1.5">
              {isApplique ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Appliqué
                </>
              ) : (
                <>
                  <Gift className="h-3.5 w-3.5" />
                  Utiliser
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </button>
        </div>

        {/* ── Section détail de la réduction (visible uniquement si appliqué) ── */}
        <AnimatePresence>
          {isApplique && (
            <motion.div
              key="detail-reduc"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="overflow-hidden"
            >
              {/* Barre de progression des points */}
              <div className="mb-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: textMuted }}>
                    Points utilisés
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: tierConfig.color }}>
                    {pointsAppliques} / {solde} pts
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${tierConfig.color}, #1f4d3f)` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
                  />
                </div>
              </div>

              {/* Résumé textuel */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: isDark ? "rgba(31,77,63,0.12)" : "rgba(31,77,63,0.06)",
                  border: `1px solid ${tierConfig.color}25`,
                }}
              >
                <p className="text-[12px] font-semibold" style={{ color: textMuted }}>
                  Réduction appliquée
                </p>
                <span className="text-base font-black" style={{ color: tierConfig.color }}>
                  -{formatCurrency(String(pointsAppliques * valeurPointFCFA), "FCFA")}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
