/**
 * RecapitulatifCommande — Composant premium pour le résumé des coûts
 *
 * - Affiche le sous-total, livraison, remises (promo/fidelite), et total
 * - Animations lors de la mise à jour des montants
 * - Design clean type Apple/Stripe
 *
 * @module components/commandes/RecapitulatifCommande
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useThemeStore } from "@/store/theme.store";
import { Receipt, Truck, Tag, Sparkles } from "lucide-react";

interface RecapitulatifCommandeProps {
  sousTotal: number;
  fraisLivraison: number;
  remisePromo: number;
  remiseFidelite: number;
}

export default function RecapitulatifCommande({
  sousTotal,
  fraisLivraison,
  remisePromo,
  remiseFidelite,
}: RecapitulatifCommandeProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const total = Math.max(0, sousTotal + fraisLivraison - remisePromo - remiseFidelite);

  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const Ligne = ({ label, valeur, icon: Icon, negatif = false, isTotal = false }: any) => (
    <div className={`flex items-center justify-between ${isTotal ? "pt-4" : "py-1"}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" style={{ color: muted }} />}
        <span
          className={isTotal ? "text-lg font-bold" : "text-sm"}
          style={{ color: isTotal ? text : muted }}
        >
          {label}
        </span>
      </div>
      <motion.span
        key={valeur}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isTotal ? "text-2xl font-black tracking-tight" : "text-sm font-semibold"} ${
          negatif ? "text-[#1f4d3f]" : ""
        }`}
        style={{ color: isTotal || negatif ? undefined : text }}
      >
        {negatif ? "-" : ""}
        {formatCurrency(String(valeur), "FCFA")}
      </motion.span>
    </div>
  );

  return (
    <div
      className="rounded-3xl p-6"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4d3f]/10">
          <Receipt className="h-5 w-5 text-[#1f4d3f]" />
        </div>
        <h3 className="text-xl font-bold" style={{ color: text, fontFamily: "'Playfair Display', serif" }}>
          Récapitulatif
        </h3>
      </div>

      <div className="space-y-3 border-b pb-4" style={{ borderColor: border }}>
        <Ligne label="Sous-total" valeur={sousTotal} />
        <Ligne label="Frais de livraison" valeur={fraisLivraison} icon={Truck} />
        
        {remisePromo > 0 && (
          <Ligne label="Code promotionnel" valeur={remisePromo} icon={Tag} negatif />
        )}
        
        {remiseFidelite > 0 && (
          <Ligne label="Points de fidélité" valeur={remiseFidelite} icon={Sparkles} negatif />
        )}
      </div>

      <Ligne label="Total à payer" valeur={total} isTotal />
    </div>
  );
}
