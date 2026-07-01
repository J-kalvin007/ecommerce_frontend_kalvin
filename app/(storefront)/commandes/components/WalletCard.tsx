/**
 * WalletCard.tsx
 * -----------------------------------------------------------------------------
 * Carte de paiement via portefeuille — version premium.
 *
 * Direction artistique — "instrument de paiement contextuel" :
 *   Ce composant vit à l'étape 2 du tunnel de commande. Son unique travail :
 *   dire en un coup d'œil si le client peut payer. Il doit déclencher une
 *   réaction émotionnelle immédiate — sérénité si le solde est OK, urgence
 *   actionnable si ce n'est pas le cas.
 *
 *   Signature visuelle — la jauge de couverture :
 *   Une barre de progression représente le montant total de la commande
 *   (= 100 %). Le remplissage montre la part que le solde couvre déjà.
 *   Si le solde dépasse le montant : remplissage complet + état "validation".
 *   Si le solde est insuffisant : remplissage partiel + zone de déficit hachurée.
 *   Ce n'est pas un ornement — c'est l'information la plus utile de la carte,
 *   rendue lisible sans avoir à lire un seul chiffre.
 *
 * Ce qui reste strictement inchangé :
 *   - Props  : wallet, totalAPayer, onOpenRecharge
 *   - Guards : if (!wallet) return null
 *   - Variables dérivées : solde, soldeSuffisant
 *   - Imports de logique (formatCurrency, useThemeStore, Wallet)
 *
 * @module app/(storefront)/commandes/components/WalletCard
 */

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Wallet as WalletIcon,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useThemeStore } from "@/store/theme.store";
import { Wallet } from "@/modeles/wallets-paiements";

/* -- Jetons de design (cohérents avec tout le design system Kalvin) -------- */

const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_SOFT = "rgba(201,168,118,0.14)";

/* -- Props ---------------------------------------------------------------- */

interface WalletCardProps {
  wallet: Wallet | null;
  totalAPayer: number;
  onOpenRecharge: () => void;
}

/* -- Composant principal --------------------------------------------------- */

export default function WalletCard({
  wallet,
  totalAPayer,
  onOpenRecharge,
}: WalletCardProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const prefersReducedMotion = useReducedMotion();

  // Guard identique à l'original
  if (!wallet) return null;

  // Variables dérivées — identiques à l'original
  const solde = parseFloat(wallet.balance);
  const soldeSuffisant = solde >= totalAPayer;

  // Ratio de couverture pour la jauge [0 → 1], plafonné à 1 si excédent
  const coverageRatio = Math.min(1, solde / totalAPayer);

  /* ════════════════════════════════════════════════════════════════════════
     Rendu — deux états visuels distincts selon soldeSuffisant
     ════════════════════════════════════════════════════════════════════════ */
  return soldeSuffisant ? (
    <SufficientState
      solde={solde}
      totalAPayer={totalAPayer}
      coverageRatio={coverageRatio}
      isDark={isDark}
      prefersReducedMotion={!!prefersReducedMotion}
    />
  ) : (
    <InsufficientState
      solde={solde}
      totalAPayer={totalAPayer}
      coverageRatio={coverageRatio}
      isDark={isDark}
      prefersReducedMotion={!!prefersReducedMotion}
      onOpenRecharge={onOpenRecharge}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   État 1 — Solde suffisant
   Dark card premium (cohérente avec WalletPhysicalCard du Dashboard).
   Le client peut payer en confiance : l'interface le reflète visuellement.
   ════════════════════════════════════════════════════════════════════════════ */

function SufficientState({
  solde,
  totalAPayer,
  coverageRatio,
  isDark,
  prefersReducedMotion,
}: {
  solde: number;
  totalAPayer: number;
  coverageRatio: number;
  isDark: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(140deg, #0d1a0f 0%, #1a2e1c 50%, #0f2012 100%)",
        boxShadow:
          "0 20px 48px -12px rgba(31,77,63,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Grain de texture — même traitement que la carte du Dashboard */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 p-5 sm:p-6">

        {/* En-tête : icône + identité + check */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Puce EMV miniature — signe d'authenticité de la carte */}
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201,168,118,0.25), rgba(201,168,118,0.08))",
                border: `1px solid ${BRAND_GOLD}35`,
              }}
            >
              <WalletIcon
                className="h-5.5 w-5.5"
                style={{ color: BRAND_GOLD }}
                strokeWidth={1.75}
              />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Kalvin Pay
              </p>
              <p className="text-[14px] font-black text-white">
                Mon Portefeuille
              </p>
            </div>
          </div>

          {/* Badge validation animé */}
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.2 }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#34D399",
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Prêt à payer
          </motion.div>
        </div>

        {/* Solde affiché en grand — la donnée principale */}
        <div className="mb-5">
          <p
            className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Solde disponible
          </p>
          <p className="text-[28px] font-black text-white tabular-nums tracking-tight">
            {formatCurrency(String(solde), "FCFA")}
          </p>
        </div>

        {/* -- Jauge de couverture ---------------------------------------------
         *  SIGNATURE VISUELLE : barre montrant le rapport solde / totalAPayer.
         *  Ici, solde ≥ totalAPayer → jauge pleine, verte.
         * ------------------------------------------------------------------- */}
        <BalanceGauge
          coverageRatio={coverageRatio}
          soldeSuffisant={true}
          totalAPayer={totalAPayer}
          solde={solde}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Rappel du montant à débiter */}
        <div
          className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p
            className="text-[12px] font-semibold"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Montant à débiter
          </p>
          <p className="text-[15px] font-black text-white tabular-nums">
            {formatCurrency(String(totalAPayer), "FCFA")}
          </p>
        </div>
      </div>

      {/* Liseré doré inférieur — signature du design system Kalvin */}
      <div
        aria-hidden
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}80, ${BRAND_GOLD}, ${BRAND_GOLD}80, transparent)`,
        }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   État 2 — Solde insuffisant
   Carte claire avec traitement d'alerte amber — sans agression visuelle,
   mais avec une urgence actionnable immédiate.
   ════════════════════════════════════════════════════════════════════════════ */

function InsufficientState({
  solde,
  totalAPayer,
  coverageRatio,
  isDark,
  prefersReducedMotion,
  onOpenRecharge,
}: {
  solde: number;
  totalAPayer: number;
  coverageRatio: number;
  isDark: boolean;
  prefersReducedMotion: boolean;
  onOpenRecharge: () => void;
}) {
  const deficit = totalAPayer - solde;

  const bg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {/* Liseré amber supérieur — signal d'alerte immédiat */}
      <div
        aria-hidden
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #F59E0B80, #F59E0B, #F59E0B80, transparent)",
        }}
      />

      <div className="p-5 sm:p-6">

        {/* En-tête */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: `${BRAND_FOREST}12`,
                border: `1px solid ${BRAND_FOREST}25`,
              }}
            >
              <WalletIcon
                className="h-5.5 w-5.5"
                style={{ color: BRAND_FOREST }}
                strokeWidth={1.75}
              />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
              >
                Kalvin Pay
              </p>
              <p className="text-[14px] font-black" style={{ color: text }}>
                Mon Portefeuille
              </p>
            </div>
          </div>

          {/* Bouton Recharger — CTA principal de cet état */}
          <button
            onClick={onOpenRecharge}
            className="group flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            style={{
              background: `${BRAND_FOREST}12`,
              border: `1px solid ${BRAND_FOREST}25`,
              color: BRAND_FOREST,
              boxShadow: "none",
            }}
            aria-label="Recharger le portefeuille"
          >
            <PlusCircle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Recharger
          </button>
        </div>

        {/* Solde actuel + montant requis — côte à côte */}
        <div
          className="mb-5 grid grid-cols-2 gap-3 rounded-xl p-4"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "#F7F5F0",
            border: `1px solid ${border}`,
          }}
        >
          <div>
            <p
              className="mb-1 text-[10.5px] font-bold uppercase tracking-wider"
              style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}
            >
              Votre solde
            </p>
            <p
              className="text-[18px] font-black tabular-nums tracking-tight"
              style={{ color: BRAND_FOREST }}
            >
              {formatCurrency(String(solde), "FCFA")}
            </p>
          </div>

          {/* Séparateur vertical */}
          <div
            aria-hidden
            className="absolute self-stretch border-l"
            style={{ borderColor: border }}
          />

          <div>
            <p
              className="mb-1 text-[10.5px] font-bold uppercase tracking-wider"
              style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}
            >
              Montant requis
            </p>
            <p
              className="text-[18px] font-black tabular-nums tracking-tight"
              style={{ color: text }}
            >
              {formatCurrency(String(totalAPayer), "FCFA")}
            </p>
          </div>
        </div>

        {/* -- Jauge de couverture ---------------------------------------------
         *  Ici, solde < totalAPayer → jauge partiellement remplie, amber.
         *  La zone non couverte est hachurée — représentation visuelle du déficit.
         * ------------------------------------------------------------------- */}
        <BalanceGauge
          coverageRatio={coverageRatio}
          soldeSuffisant={false}
          totalAPayer={totalAPayer}
          solde={solde}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Message d'alerte actionnable */}
        <div
          className="mt-4 flex items-start gap-2.5 rounded-xl p-3.5"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.20)",
          }}
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
            strokeWidth={1.75}
          />
          <div>
            <p className="text-[13px] font-bold text-amber-700 dark:text-amber-400">
              Solde insuffisant
            </p>
            <p
              className="mt-0.5 text-[12px] font-medium"
              style={{ color: isDark ? "rgba(251,191,36,0.75)" : "rgba(180,83,9,0.85)" }}
            >
              Rechargez{" "}
              <strong className="font-black">
                {formatCurrency(String(deficit), "FCFA")}
              </strong>{" "}
              pour finaliser votre commande.
            </p>
          </div>
        </div>

        {/* CTA Recharger — version large, répétition justifiée car c'est l'action attendue */}
        <button
          onClick={onOpenRecharge}
          className="group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          style={{
            background: BRAND_FOREST,
            boxShadow: `0 8px 24px -8px ${BRAND_FOREST}50`,
          }}
        >
          <Zap
            className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110"
            strokeWidth={2}
          />
          Recharger mon portefeuille
        </button>
      </div>
    </motion.div>
  );
}

/* -- Sous-composant BalanceGauge ------------------------------------------- */

/**
 * BalanceGauge — jauge de couverture du paiement.
 *
 * SIGNATURE VISUELLE du composant WalletCard :
 *   La barre représente le coût total de la commande (= 100 %).
 *   Le remplissage animé montre la part que le solde couvre :
 *     - Solde ≥ montant : remplissage 100 % vert (emerald → forest)
 *     - Solde < montant : remplissage partiel amber + zone de déficit hachurée
 *
 *   Le marqueur "|" à l'extrémité droite représente le point de coût exact.
 *   Cette métaphore visuelle est spécifique à un contexte de paiement et
 *   ne fonctionnerait sur aucun autre composant.
 *
 * @param coverageRatio  [0 → 1] — part du montant couverte par le solde
 * @param soldeSuffisant  true si le solde est ≥ au montant total
 */
function BalanceGauge({
  coverageRatio,
  soldeSuffisant,
  totalAPayer,
  solde,
  prefersReducedMotion,
}: {
  coverageRatio: number;
  soldeSuffisant: boolean;
  totalAPayer: number;
  solde: number;
  prefersReducedMotion: boolean;
}) {
  return (
    <div>
      {/* Légendes gauche/droite */}
      <div className="mb-2 flex items-center justify-between">
        <p
          className="text-[10.5px] font-bold uppercase tracking-wide"
          style={{ color: soldeSuffisant ? "rgba(52,211,153,0.8)" : "rgba(245,158,11,0.8)" }}
        >
          {soldeSuffisant ? "Couverture complète" : `${Math.round(coverageRatio * 100)} % couvert`}
        </p>
        <p
          className="text-[10.5px] font-semibold"
          style={{
            color: soldeSuffisant
              ? "rgba(52,211,153,0.7)"
              : "rgba(0,0,0,0.35)",
          }}
        >
          {soldeSuffisant ? "✓" : `${100 - Math.round(coverageRatio * 100)} % restant`}
        </p>
      </div>

      {/* Rail de la jauge */}
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: soldeSuffisant ? "rgba(52,211,153,0.12)" : "rgba(245,158,11,0.1)" }}
        role="progressbar"
        aria-valuenow={Math.round(coverageRatio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(coverageRatio * 100)} % du montant couvert`}
      >
        {/* Remplissage animé */}
        <motion.div
          initial={prefersReducedMotion ? false : { width: "0%" }}
          animate={{ width: `${coverageRatio * 100}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.1,
            ease: [0.22, 1, 0.36, 1],
            delay: prefersReducedMotion ? 0 : 0.2,
          }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: soldeSuffisant
              ? "linear-gradient(90deg, #10B981, #1f4d3f)"
              : "linear-gradient(90deg, #F59E0B, #F97316)",
          }}
        />

        {/* Zone de déficit — hachures subtiles si solde insuffisant */}
        {!soldeSuffisant && (
          <div
            aria-hidden
            className="absolute right-0 top-0 h-full"
            style={{
              width: `${(1 - coverageRatio) * 100}%`,
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(245,158,11,0.12) 3px, rgba(245,158,11,0.12) 4px)",
            }}
          />
        )}
      </div>

      {/* Étiquettes contextuelles sous la jauge */}
      {!soldeSuffisant && (
        <div className="mt-2 flex items-center justify-between">
          <p
            className="text-[10px]"
            style={{ color: "rgba(245,158,11,0.85)" }}
          >
            {formatCurrency(String(solde), "FCFA")} disponible
          </p>
          <p
            className="text-[10px]"
            style={{ color: "rgba(0,0,0,0.35)" }}
          >
            {formatCurrency(String(totalAPayer), "FCFA")} requis
          </p>
        </div>
      )}
    </div>
  );
}