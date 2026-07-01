/**
 * Page d'échec de paiement commande — Ultra Premium
 *
 * Affichée lorsqu'un paiement échoue (wallet insuffisant, erreur réseau).
 * Le panier et les données de commande sont conservés dans Zustand (pannierStore)
 * pour que l'utilisateur puisse reprendre sans ressaisir ses informations.
 *
 * Comportement :
 *  - Animation Lottie attention.json (ton chaleureux, non alarmiste)
 *  - Message explicatif empathique
 *  - 2 CTAs :
 *    1. "Réessayer avec le wallet" → /commandes (données panier conservées)
 *    2. "Payer avec PayDunya" → /commandes (l'interface PayDunya sera pré-sélectionnée)
 *
 * @module app/(storefront)/paiement/commande/echec/page
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  RefreshCcw,
  Smartphone,
  ArrowLeft,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";

// Chargement paresseux de Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import attentionAnimation from "@/public/assets/lottis/attention.json";

/* ----------------------------------------------- */
/* Constantes                                      */
/* ----------------------------------------------- */

const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";

/* ----------------------------------------------- */
/* Composant principal                             */
/* ----------------------------------------------- */

export default function EchecCommandePage() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* Tokens de design */
  const bg = isDark
    ? "linear-gradient(135deg, #0a0505 0%, #160a0a 50%, #0a0505 100%)"
    : "linear-gradient(135deg, #fff8f5 0%, #fef3ee 50%, #fff8f5 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#1a0a05";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const rowBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const rowBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  if (!isMounted) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20"
      style={{ background: bg }}
    >
      {/* -- Halos ambiants -- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "rgba(239,68,68,0.1)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(245,158,11,0.08)" }}
      />

      {/* -- Carte principale -- */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            backdropFilter: "blur(24px)",
            boxShadow: isDark
              ? "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
              : "0 40px 80px -20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* Bande d'alerte supérieure */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background:
                "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
            }}
          />

          <div className="px-8 pb-10 pt-10 text-center">
            {/* -- Animation Lottie -- */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 16,
                delay: 0.1,
              }}
              className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center"
            >
              <Lottie
                animationData={attentionAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </motion.div>

            {/* Icône d'alerte */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 flex items-center justify-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" style={{ color: "#f59e0b" }} />
              <span
                className="text-[11px] font-black uppercase tracking-[0.22em]"
                style={{ color: "#f59e0b" }}
              >
                Paiement non abouti
              </span>
            </motion.div>

            {/* Titre */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-display text-3xl font-black tracking-tight"
              style={{ color: textPrimary }}
            >
              Oups, une erreur s&apos;est produite
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed"
              style={{ color: textMuted }}
            >
              Ne vous inquiétez pas — votre commande et votre panier sont
              toujours disponibles. Choisissez comment vous souhaitez continuer.
            </motion.p>

            {/* Info : données conservées */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto my-7 flex max-w-sm items-start gap-3 rounded-2xl p-4 text-left"
              style={{ background: rowBg, border: `1px solid ${rowBorder}` }}
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(16,185,129,0.12)" }}
              >
                <RefreshCcw className="h-4 w-4" style={{ color: "#10b981" }} />
              </div>
              <div>
                <p
                  className="text-[12px] font-black uppercase tracking-wider"
                  style={{ color: "#10b981" }}
                >
                  Vos données sont sécurisées
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: textMuted }}>
                  Votre panier, votre adresse de livraison et votre commande
                  sont intégralement conservés. Vous pouvez reprendre là où
                  vous en étiez.
                </p>
              </div>
            </motion.div>

            {/* -- Boutons d'action -- */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              {/**
               * Option 1 : Réessayer avec le wallet.
               * L'utilisateur retourne à la page commande dont les données
               * (panier via pannierStore Zustand) sont intactes.
               */}
              <Link
                href="/commandes"
                className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                  boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                }}
              >
                <Wallet className="h-5 w-5" />
                Réessayer avec le wallet
              </Link>

              {/**
               * Option 2 : Passer au paiement PayDunya.
               * L'utilisateur retourne à la page commande ; le
               * composant PayDunyaCheckout sera accessible depuis l'étape 2.
               */}
              <Link
                href="/commandes"
                className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #0f76b5, #0a4a75)",
                  boxShadow: "0 8px 28px rgba(15,118,181,0.3)",
                  color: "#fff",
                }}
              >
                <Smartphone className="h-5 w-5" />
                Payer avec PayDunya
              </Link>

              {/* Retour à l'accueil */}
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{ color: textMuted }}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la boutique
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
