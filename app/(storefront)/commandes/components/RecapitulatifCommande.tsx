/**
 * RecapitulatifCommande — Résumé de commande ultra-premium
 *
 * - Design Stripe / Apple avec hiérarchie typographique raffinée
 * - Chaque montant s'anime individuellement lors de sa mise à jour (spring)
 * - Les remises apparaissent/disparaissent avec AnimatePresence
 * - Ligne « Total » avec accent visuel fort (fond dégradé exclusif)
 * - Icônes contextuelles pour chaque ligne
 * - Responsive et adaptatif dark / light
 *
 * @module components/commandes/RecapitulatifCommande
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useThemeStore } from "@/store/theme.store";
import { Receipt, Truck, TicketPercent, Star, ShieldCheck } from "lucide-react";

interface RecapitulatifCommandeProps {
  sousTotal: number;
  fraisLivraison: number;
  remisePromo: number;
  remiseFidelite: number;
}

/* ─── Sous-composant : Ligne de récapitulatif ────────────────────────────── */

interface LigneProps {
  label: string;
  valeur: number;
  icon?: React.ElementType;
  /** Affiche le montant en vert avec un signe "-" (réduction) */
  negatif?: boolean;
  /** Frais gratuits (ex: livraison offerte) */
  isGratuit?: boolean;
  /** Style spécial pour le total */
  isTotal?: boolean;
  /** Style atténué pour les lignes secondaires */
  muted: string;
  text: string;
}

function Ligne({
  label,
  valeur,
  icon: Icon,
  negatif = false,
  isGratuit = false,
  isTotal = false,
  muted,
  text,
}: LigneProps) {
  return (
    <div className={`flex items-center justify-between ${isTotal ? "pt-1" : ""}`}>
      {/* Libellé + icône */}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{
              background: negatif
                ? "rgba(31,77,63,0.1)"
                : isTotal
                  ? "rgba(31,77,63,0.12)"
                  : "rgba(0,0,0,0.04)",
            }}
          >
            <Icon
              className="h-3.5 w-3.5"
              style={{
                color: negatif ? "#1f4d3f" : isTotal ? "#1f4d3f" : muted,
              }}
            />
          </div>
        )}
        <span
          className={
            isTotal
              ? "text-base font-bold"
              : "text-sm font-medium"
          }
          style={{ color: isTotal ? text : muted }}
        >
          {label}
        </span>
      </div>

      {/* Valeur animée à chaque changement */}
      <motion.span
        key={valeur}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className={
          isTotal
            ? "text-2xl font-black tracking-tight"
            : "text-sm font-semibold"
        }
        style={{
          color: isGratuit
            ? "#1f4d3f"
            : negatif
              ? "#1f4d3f"
              : isTotal
                ? text
                : text,
        }}
      >
        {isGratuit ? (
          <span className="rounded-full bg-[#1f4d3f]/10 px-2.5 py-0.5 text-xs font-bold text-[#1f4d3f]">
            Gratuit
          </span>
        ) : (
          <>
            {negatif && "-"}
            {formatCurrency(String(valeur), "FCFA")}
          </>
        )}
      </motion.span>
    </div>
  );
}

/* ─── Composant principal ───────────────────────────────────────────────── */

export default function RecapitulatifCommande({
  sousTotal,
  fraisLivraison,
  remisePromo,
  remiseFidelite,
}: RecapitulatifCommandeProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const total = Math.max(0, sousTotal + fraisLivraison - remisePromo - remiseFidelite);
  const isLivraisonGratuite = fraisLivraison === 0;
  const hasRemises = remisePromo > 0 || remiseFidelite > 0;
  const totalEconomies = remisePromo + remiseFidelite;

  // Tokens visuels
  const bg = isDark ? "rgba(12,14,12,0.9)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shadow = isDark
    ? "0 20px 60px -15px rgba(0,0,0,0.55)"
    : "0 20px 60px -15px rgba(0,0,0,0.05)";
  const text = isDark ? "rgba(255,255,255,0.95)" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: shadow,
      }}
    >
      {/* Orbe décorative arrière-plan */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#1f4d3f] opacity-[0.035] blur-3xl" />

      {/* ── En-tête ── */}
      <div className="relative z-10 flex items-center gap-3 border-b px-5 py-5 sm:px-6" style={{ borderColor: divider }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f4d3f]/10">
          <Receipt className="h-4 w-4 text-[#1f4d3f]" />
        </div>
        <div>
          <h3 className="text-base font-black tracking-tight" style={{ color: text }}>
            Récapitulatif
          </h3>
          <p className="text-[11px] font-medium" style={{ color: textMuted }}>
            Détail des montants
          </p>
        </div>
      </div>

      {/* ── Lignes de détail ── */}
      <div className="relative z-10 space-y-3.5 px-5 py-5 sm:px-6">
        {/* Sous-total */}
        <Ligne
          label="Sous-total"
          valeur={sousTotal}
          text={text}
          muted={textMuted}
        />

        {/* Frais de livraison */}
        <Ligne
          label="Livraison"
          valeur={fraisLivraison}
          icon={Truck}
          isGratuit={isLivraisonGratuite}
          text={text}
          muted={textMuted}
        />

        {/* Remises — apparaissent avec AnimatePresence */}
        <AnimatePresence>
          {remisePromo > 0 && (
            <motion.div
              key="remise-promo"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="overflow-hidden"
            >
              <Ligne
                label="Code promotionnel"
                valeur={remisePromo}
                icon={TicketPercent}
                negatif
                text={text}
                muted={textMuted}
              />
            </motion.div>
          )}

          {remiseFidelite > 0 && (
            <motion.div
              key="remise-fidelite"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="overflow-hidden"
            >
              <Ligne
                label="Points de fidélité"
                valeur={remiseFidelite}
                icon={Star}
                negatif
                text={text}
                muted={textMuted}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge total économies */}
        <AnimatePresence>
          {hasRemises && (
            <motion.div
              key="badge-eco"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 350, damping: 24 }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(31,77,63,0.08)",
                border: "1px solid rgba(31,77,63,0.12)",
              }}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#1f4d3f]" />
              <p className="text-[12px] font-bold text-[#1f4d3f]">
                Vous économisez{" "}
                <span className="font-black">
                  {formatCurrency(String(totalEconomies), "FCFA")}
                </span>{" "}
                sur cette commande 🎉
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Ligne Total ── */}
      <div
        className="relative z-10 mx-0 overflow-hidden rounded-b-2xl px-5 py-5 sm:px-6"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(31,77,63,0.18) 0%, rgba(10,20,16,0.6) 100%)"
            : "linear-gradient(135deg, rgba(31,77,63,0.06) 0%, rgba(31,77,63,0.01) 100%)",
          borderTop: `1px solid ${isDark ? "rgba(31,77,63,0.25)" : "rgba(31,77,63,0.1)"}`,
        }}
      >
        {/* Orbe décorative dans la zone Total */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#1f4d3f] opacity-10 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f4d3f]/15">
              <ShieldCheck className="h-4 w-4 text-[#1f4d3f]" />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: text }}>
                Total à payer
              </p>
              <p className="text-[11px] font-medium" style={{ color: textMuted }}>
                TVA incluse
              </p>
            </div>
          </div>

          <motion.span
            key={total}
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="text-3xl font-black tracking-tight text-[#1f4d3f]"
          >
            {formatCurrency(String(total), "FCFA")}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
