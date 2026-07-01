/**
 * ConfirmPaiementModal — Modale ultra-premium de confirmation de paiement wallet
 *
 * Affichée uniquement pour le paiement via le portefeuille interne du client.
 * Présente un récapitulatif clair (montant, source, solde restant estimé) et
 * deux actions : Annuler et Confirmer le paiement.
 *
 * Design :
 *  - Glassmorphism avec halo vert ambiant
 *  - Typographie haut de gamme, icônes Lucide
 *  - Micro-animations Framer Motion (slide-up spring)
 *  - Bouton de confirmation avec shimmer et état de chargement désactivant
 *  - Accessibilité : focus trap, aria-labelledby, aria-describedby
 *
 * @module components/special/confirmPaiement
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ShieldCheck, X, Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useThemeStore } from "@/store/theme.store";

/* ----------------------------------------------- */
/* Props                                           */
/* ----------------------------------------------- */

export interface ConfirmPaiementModalProps {
  /** Contrôle la visibilité de la modale */
  open: boolean;
  /** Montant total à débiter du wallet (en FCFA) */
  amount: number;
  /** Solde actuel du wallet (en FCFA) */
  walletBalance: number;
  /** Prénom du client pour la personnalisation */
  customerName?: string;
  /** Référence de la commande */
  orderReference?: string;
  /** En cours de traitement (désactive les boutons) */
  isProcessing: boolean;
  /** Rappel : l'utilisateur annule */
  onCancel: () => void;
  /** Rappel : l'utilisateur confirme le paiement */
  onConfirm: () => void;
}

/* ----------------------------------------------- */
/* Constantes de design                            */
/* ----------------------------------------------- */

const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";

/* ----------------------------------------------- */
/* Composant principal                             */
/* ----------------------------------------------- */

export default function ConfirmPaiementModal({
  open,
  amount,
  walletBalance,
  customerName,
  orderReference,
  isProcessing,
  onCancel,
  onConfirm,
}: ConfirmPaiementModalProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  /* Solde restant estimé après débit */
  const balanceAfter = walletBalance - amount;
  const isInsufficient = balanceAfter < 0;

  /* Tokens couleur selon le thème */
  const overlayBg = isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.55)";
  const cardBg = isDark
    ? "rgba(10,20,13,0.95)"
    : "rgba(255,255,255,0.97)";
  const cardBorder = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#0f1a10";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const rowBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const rowBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* -- Backdrop -- */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: overlayBg, backdropFilter: "blur(6px)" }}
            onClick={!isProcessing ? onCancel : undefined}
            aria-hidden
          />

          {/* -- Carte modale -- */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-paiement-title"
            aria-describedby="confirm-paiement-desc"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
              mass: 0.9,
            }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: "blur(24px)",
                boxShadow: isDark
                  ? "0 32px 64px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              {/* Bande dorée supérieure — signature fintech premium */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})`,
                }}
              />

              {/* Halo ambiant discret */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: "rgba(31,77,63,0.18)" }}
              />

              {/* Bouton de fermeture */}
              {!isProcessing && (
                <button
                  onClick={onCancel}
                  className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)",
                    color: textMuted,
                  }}
                  aria-label="Fermer la modale"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* -- Corps -- */}
              <div className="relative z-10 px-8 pb-8 pt-9">

                {/* Icône principale */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 18,
                    delay: 0.05,
                  }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                    boxShadow: `0 8px 28px rgba(31,77,63,0.38)`,
                  }}
                >
                  <Wallet className="h-8 w-8 text-white" />
                </motion.div>

                {/* Titre */}
                <motion.h2
                  id="confirm-paiement-title"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="mb-1 text-center font-display text-2xl font-black tracking-tight"
                  style={{ color: textPrimary }}
                >
                  Confirmer le paiement
                </motion.h2>

                {/* Sous-titre personnalisé */}
                <motion.p
                  id="confirm-paiement-desc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mb-7 text-center text-sm leading-relaxed"
                  style={{ color: textMuted }}
                >
                  {customerName
                    ? `${customerName}, confirmez le débit de votre portefeuille interne.`
                    : "Confirmez le débit de votre portefeuille interne."}
                </motion.p>

                {/* -- Récapitulatif financier -- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="mb-6 space-y-3 rounded-2xl p-5"
                  style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
                >
                  {/* Référence commande */}
                  {orderReference && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: textMuted }}>
                        Référence
                      </span>
                      <span className="font-mono text-sm font-black" style={{ color: BRAND_FOREST }}>
                        {orderReference}
                      </span>
                    </div>
                  )}

                  {/* Séparateur si référence présente */}
                  {orderReference && (
                    <div className="h-px" style={{ background: rowBorder }} />
                  )}

                  {/* Solde actuel */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: textMuted }}>
                      Solde actuel
                    </span>
                    <span className="text-sm font-bold" style={{ color: textPrimary }}>
                      {formatCurrency(String(walletBalance), "FCFA")}
                    </span>
                  </div>

                  {/* Montant à débiter */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: textMuted }}>
                      Montant à débiter
                    </span>
                    <span className="text-sm font-bold text-red-500">
                      − {formatCurrency(String(amount), "FCFA")}
                    </span>
                  </div>

                  {/* Séparateur */}
                  <div className="h-px" style={{ background: rowBorder }} />

                  {/* Solde restant estimé */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                      Solde restant
                    </span>
                    <span
                      className="text-base font-black"
                      style={{ color: isInsufficient ? "#ef4444" : BRAND_FOREST }}
                    >
                      {formatCurrency(String(Math.max(0, balanceAfter)), "FCFA")}
                    </span>
                  </div>
                </motion.div>

                {/* Avertissement solde insuffisant (cas de protection UI) */}
                <AnimatePresence>
                  {isInsufficient && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3"
                           style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                        <p className="text-[13px] font-semibold text-red-500">
                          Solde insuffisant pour finaliser ce paiement.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Badge de sécurité */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mb-6 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: BRAND_FOREST }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                    Transaction sécurisée · Portefeuille interne
                  </span>
                </motion.div>

                {/* -- Boutons d'action -- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  {/* Annuler */}
                  <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: rowBg,
                      border: `1px solid ${rowBorder}`,
                      color: textMuted,
                    }}
                  >
                    Annuler
                  </button>

                  {/* Confirmer */}
                  <button
                    onClick={onConfirm}
                    disabled={isProcessing || isInsufficient}
                    className="group relative flex-1 overflow-hidden rounded-2xl py-3.5 text-sm font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                      boxShadow: `0 8px 24px rgba(31,77,63,0.32)`,
                    }}
                  >
                    {/* Shimmer au hover */}
                    <span
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />

                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Traitement…
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4" />
                          Confirmer le paiement
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
