/**
 * ConfirmPaiementModal — Modale ultra-premium de confirmation de paiement wallet
 *
 * Affichée uniquement pour le paiement via le portefeuille interne du client.
 * Refonte horizontale : Séparation claire entre les informations de paiement (gauche)
 * et les actions (droite) dans deux conteneurs distincts, épurés et luxueux.
 *
 * @module components/special/confirmPaiement
 */

"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ShieldCheck, X, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useThemeStore } from "@/store/theme.store";

/* ----------------------------------------------- */
/* Props                                           */
/* ----------------------------------------------- */

export interface ConfirmPaiementModalProps {
  open: boolean;
  amount: number;
  walletBalance: number;
  customerName?: string;
  orderReference?: string;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/* ----------------------------------------------- */
/* Constantes de design                            */
/* ----------------------------------------------- */

const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";
const BRAND_FOREST_LIGHT = "#2d7a63";

const BRAND_DANGER = "#ef4444";
const BRAND_DANGER_SOFT = "rgba(239,68,68,0.12)";
const BRAND_DANGER_BORDER = "rgba(239,68,68,0.22)";

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
  const dialogRef = useRef<HTMLDivElement>(null);

  const balanceAfter = walletBalance - amount;
  const isInsufficient = balanceAfter < 0;

  const gaugeReference = Math.max(walletBalance, amount, 1);
  const gaugeAfterPercent = Math.max(0, Math.min(100, (balanceAfter / gaugeReference) * 100));

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isProcessing, onCancel]);

  const overlayBg = isDark ? "rgba(0,0,0,0.85)" : "rgba(10,20,13,0.4)";
  const cardBg = isDark ? "rgba(15,20,17,0.85)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "rgba(255,255,255,0.98)" : "#0f1a10";
  const textMuted = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
  const innerCardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)";
  const innerCardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const rowBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const rowBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const chipBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop avec un blur prononcé */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50"
            style={{ background: overlayBg }}
            onClick={!isProcessing ? onCancel : undefined}
            aria-hidden
          />

          {/* Wrapper Modale */}
          <motion.div
            key="modal"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-paiement-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 focus:outline-none sm:p-6"
          >
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] shadow-2xl"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: "blur(32px)",
                boxShadow: isDark
                  ? "0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)"
                  : "0 40px 80px -20px rgba(31,77,63,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              {/* Liseré or supérieur */}
              {/* <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})` }}
              /> */}

              {/* Halos lumineux */}
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-[80px]" style={{ background: "rgba(31,77,63,0.15)" }} />
              <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full blur-[100px]" style={{ background: "rgba(201,168,118,0.1)" }} />

              {/* Bouton Fermer */}
              {!isProcessing && (
                <button
                  onClick={onCancel}
                  className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
                  style={{ background: chipBg, color: textMuted, ["--tw-ring-color" as string]: BRAND_GOLD }}
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Structure Horizontale */}
              <div className="relative z-10 flex flex-col gap-4 p-4 md:flex-row md:gap-5 md:p-6 lg:p-7">

                {/* ---------------------------------------------------- */}
                {/* COLONNE GAUCHE : RÉCAPITULATIF                       */}
                {/* ---------------------------------------------------- */}
                <div
                  className="flex flex-1 flex-col rounded-[24px] p-6 sm:p-8"
                  style={{ background: innerCardBg, border: `1px solid ${innerCardBorder}`, boxShadow: "inset 0 2px 10px rgba(255,255,255,0.02)" }}
                >
                  {/* Entête gauche */}
                  <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${BRAND_FOREST}, ${BRAND_FOREST_LIGHT})` }}
                    >
                      <Wallet className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        id="confirm-paiement-title"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="font-display text-2xl font-black tracking-tight sm:text-3xl"
                        style={{ color: textPrimary }}
                      >
                        Confirmation
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: textMuted }}
                      >
                        {customerName ? `${customerName}, voici le récapitulatif de votre paiement.` : "Voici le récapitulatif de votre paiement."}
                      </motion.p>
                    </div>
                  </div>

                  {/* Puces d'informations */}
                  {orderReference && (

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="mb-8 flex flex-wrap items-center gap-3"
                    >

                      <span className="flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[13px] font-bold shadow-sm" style={{ background: chipBg, color: BRAND_FOREST, border: `1px solid ${rowBorder}` }}>
                        <span className="text-[10px] uppercase tracking-widest opacity-60">Réf</span>
                        {orderReference}
                      </span>

                      <span className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold shadow-sm" style={{ background: chipBg, color: textPrimary, border: `1px solid ${rowBorder}` }}>
                        <Wallet className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />
                        Portefeuille interne
                      </span>

                    </motion.div>
                  )}

                  <div className="mt-auto">
                    {/* Jauge de solde animée */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-2xl p-5"
                      style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
                    >
                      <div className="mb-3 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: textMuted }}>
                        <span>Solde actuel</span>
                        <span>Après paiement</span>
                      </div>

                      <div className="relative mb-4 h-2.5 w-full overflow-hidden rounded-full" style={{ background: chipBg, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: isInsufficient ? BRAND_DANGER : `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_FOREST_LIGHT})` }}
                          initial={{ width: "100%" }}
                          animate={{ width: `${gaugeAfterPercent}%` }}
                          transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>

                      <div className="flex items-end justify-between font-mono">
                        <span className="text-sm font-semibold" style={{ color: textMuted }}>{formatCurrency(String(walletBalance), "FCFA")}</span>
                        <span className="text-lg font-black tracking-tight" style={{ color: isInsufficient ? BRAND_DANGER : textPrimary }}>
                          {formatCurrency(String(Math.max(0, balanceAfter)), "FCFA")}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* COLONNE DROITE : ACTIONS ET MONTANT                  */}
                {/* ---------------------------------------------------- */}
                <div
                  className="flex w-full flex-col justify-between rounded-[24px] p-6 md:w-[360px] lg:w-[400px] sm:p-8"
                  style={{ background: innerCardBg, border: `1px solid ${innerCardBorder}`, boxShadow: "inset 0 2px 10px rgba(255,255,255,0.02)" }}
                >
                  <div className="mb-8 text-center md:mt-4 md:text-left">

                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-[12px] font-black uppercase tracking-[0.2em]"
                      style={{ color: textMuted }}
                    >
                      Montant à débiter
                    </motion.span>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="mt-2 font-display text-[42px] font-black leading-none tabular-nums tracking-tighter lg:text-[48px]"
                      style={{ color: BRAND_FOREST, textShadow: isDark ? "0 4px 12px rgba(31,77,63,0.3)" : "none" }}
                    >
                      {formatCurrency(String(amount), "FCFA")}
                    </motion.div>

                  </div>

                  <div className="mt-auto space-y-5">
                    {/* Avertissement solde insuffisant */}
                    <AnimatePresence>
                      {isInsufficient && (

                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: BRAND_DANGER_SOFT, border: `1px solid ${BRAND_DANGER_BORDER}` }}>
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_DANGER }} />
                            <p className="text-[13px] font-semibold leading-relaxed" style={{ color: BRAND_DANGER }}>
                              Solde insuffisant pour ce paiement. Veuillez recharger votre compte.
                            </p>
                          </div>
                        </motion.div>

                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex flex-col gap-3"
                    >
                      <button
                        onClick={onConfirm}
                        disabled={isProcessing || isInsufficient}
                        className="group cursor-pointer relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[18px] py-4 text-[15px] font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        style={{
                          background: `linear-gradient(135deg, ${BRAND_FOREST}, ${BRAND_FOREST_LIGHT})`,
                          // boxShadow: `0 12px 32px rgba(31,77,63,0.35)`,
                          ["--tw-ring-color" as string]: BRAND_GOLD,
                        }}
                      >
                        {!(isProcessing || isInsufficient) && (
                          <span
                            aria-hidden
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Traitement en cours...
                            </>
                          ) : (
                            <>
                              Confirmer le paiement
                              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                          )}
                        </span>
                      </button>

                      <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] py-4 text-[14px] font-bold transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ color: textMuted, ["--tw-ring-color" as string]: BRAND_GOLD }}
                      >
                        Annuler la transaction
                      </button>
                    </motion.div>

                    {/* Sécurité */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-center gap-2 pt-2"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                        Transaction sécurisée
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}