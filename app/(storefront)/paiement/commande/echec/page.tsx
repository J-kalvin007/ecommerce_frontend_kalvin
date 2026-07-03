

/**
 * Page d'échec de paiement commande — Ultra Premium
 *
 * Affichée lorsqu'un paiement échoue (wallet insuffisant, erreur réseau).
 * Le panier et les données de commande sont conservés dans Zustand (pannierStore)
 * pour que l'utilisateur puisse reprendre sans ressaisir ses informations.
 *
 * Direction artistique :
 *  - Univers visuel "ticket de concierge" : la carte reprend le langage d'un
 *    reçu boutique haut de gamme (bordure perforée, sceau circulaire, souche
 *    en pointillés) pour transformer un moment d'échec en moment de marque.
 *  - Palette dérivée de l'identité existante (forêt profonde + or), enrichie
 *    d'un ton "cuivre atténué" pour l'alerte — plus chaleureux et plus
 *    cohérent avec le brand qu'un rouge/orange générique.
 *  - Animation Lottie attention.json conservée comme pièce centrale, mise en
 *    valeur dans un médaillon à liseré or.
 *  - Chorégraphie de mouvement orchestrée à l'entrée, halos ambiants discrets,
 *    micro-interactions sur les CTAs (balayage lumineux, élévation).
 *  - Respect de prefers-reduced-motion : les animations en boucle sont
 *    désactivées, seules les transitions d'entrée légères sont conservées.
 *
 * Comportement :
 *  - 2 CTAs :
 *    1. "Réessayer avec le wallet" → /commandes (données panier conservées)
 *    2. "Payer avec PayDunya" → /commandes (l'interface PayDunya sera pré-sélectionnée)
 *
 * @module app/(storefront)/paiement/commande/echec/page
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  RefreshCcw,
  Smartphone,
  ArrowLeft,
  ShieldAlert,
  Wallet,
  Sparkles,
  ChevronRight,
  ReceiptText,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";

// Chargement paresseux de Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import attentionAnimation from "@/public/assets/lottis/attention.json";

/* ----------------------------------------------- */
/* Constantes — Design tokens                      */
/* ----------------------------------------------- */

// Identité de marque (inchangée)
const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";

// Extensions de la palette de marque, dérivées des mêmes teintes,
// pour une cohérence chromatique sur l'ensemble du composant.
const BRAND_FOREST_LIGHT = "#2d7a63";
const BRAND_FOREST_DEEP = "#0f2b22";
const BRAND_GOLD_SOFT = "#e4cfa4";

// Ton d'alerte "cuivre atténué" — remplace le duo rouge/ambre générique
// par une teinte chaude cohérente avec l'univers boutique haut de gamme.
const BRAND_COPPER = "#b8763f";
const BRAND_COPPER_DEEP = "#8a5228";

// Bleu PayDunya conservé pour la reconnaissance de la méthode de paiement,
// mais tempéré pour rester en harmonie avec la charte.
const BRAND_PAYDUNYA = "#0f76b5";
const BRAND_PAYDUNYA_DEEP = "#0a4a75";

/* ----------------------------------------------- */
/* Composant principal                             */
/* ----------------------------------------------- */

export default function EchecCommandePage() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  // Respecte la préférence système de réduction des animations :
  // les boucles ambiantes sont coupées, les transitions d'entrée restent
  // légères et courtes plutôt que d'être totalement supprimées.
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* Tokens de design */
  const bg = isDark
    ? "radial-gradient(120% 120% at 50% -10%, #17251f 0%, #0a0505 45%, #0a0705 100%)"
    : "radial-gradient(120% 120% at 50% -10%, #fffaf4 0%, #fff8f5 45%, #fef3ee 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "rgba(255,255,255,0.96)" : "#1a0a05";
  const textMuted = isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.5)";
  const rowBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const rowBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  // Couleur de la souche pointillée (motif "ticket"), calquée sur la bordure
  // de la carte pour rester discrète en light comme en dark mode.
  const stubDivider = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";

  if (!isMounted) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-20"
      style={{ background: bg }}
    >
      {/* -- Grain subtil pour casser la platitude des dégradés -- */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* -- Halos ambiants -- */}
      {/* <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `${BRAND_COPPER}1a` }}
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, 24, 0], y: [0, 12, 0] }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      /> */}
      {/* <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `${BRAND_GOLD}14` }}
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, -18, 0], y: [0, -14, 0] }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      /> */}
      {/* <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/3 h-56 w-56 rounded-full blur-3xl"
        style={{ background: `${BRAND_FOREST}12` }}
      /> */}

      {/* -- Carte principale -- */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Sceau circulaire chevauchant le sommet de la carte, façon cachet
            de concierge — c'est l'élément signature de cette mise en page. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.05 }}
          className="relative z-20 mx-auto -mb-10 flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28"
          style={{
            background: isDark
              ? `linear-gradient(160deg, ${BRAND_FOREST_DEEP}, ${BRAND_FOREST})`
              : `linear-gradient(160deg, ${BRAND_FOREST_LIGHT}, ${BRAND_FOREST})`,
            boxShadow: `0 14px 34px -8px rgba(31,77,63,0.55), 0 0 0 4px ${isDark ? "rgba(10,5,5,0.6)" : "#fff8f5"}, 0 0 0 5px ${BRAND_GOLD}55`,
          }}
        >
          <div className="flex h-[72%] w-[72%] items-center justify-center overflow-hidden rounded-full">
            <Lottie
              animationData={attentionAnimation}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          {/* Fine bague dorée en pointillés, évoquant l'estampe d'un sceau */}
          {/* <div
            aria-hidden
            className="absolute inset-[-6px] rounded-full"
            style={{ border: `1.5px dashed ${BRAND_GOLD}80` }}
          /> */}
        </motion.div>

        <div
          className="relative overflow-hidden rounded-[28px] pt-12 shadow-2xl"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            backdropFilter: "blur(24px)",
            boxShadow: isDark
              ? "0 40px 90px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)"
              : "0 40px 90px -20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {/* Bande de garde supérieure — liseré or "cuivre" avec balayage lumineux */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${BRAND_COPPER_DEEP}, ${BRAND_GOLD}, ${BRAND_COPPER_DEEP})` }}
          >
            {!prefersReducedMotion && (
              <motion.div
                aria-hidden
                className="h-full w-1/3"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
                animate={{ x: ["-120%", "220%"] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
              />
            )}
          </div>

          <div className="px-7 pb-10 pt-6 text-center sm:px-9">
            {/* Eyebrow : statut de la commande */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mb-3 flex items-center justify-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" style={{ color: BRAND_COPPER }} />
              <span
                className="text-[11px] font-black uppercase tracking-[0.24em]"
                style={{ color: BRAND_COPPER }}
              >
                Paiement non abouti
              </span>
            </motion.div>

            {/* Titre */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="font-display text-[28px] font-black leading-tight tracking-tight sm:text-3xl"
              style={{ color: textPrimary }}
            >
              Oups, une erreur s&apos;est produite
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
              className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed"
              style={{ color: textMuted }}
            >
              Ne vous inquiétez pas — votre commande et votre panier sont
              toujours disponibles. Choisissez comment vous souhaitez continuer.
            </motion.p>

            {/* Souche de ticket — sépare la promesse de sécurité des actions,
                comme la ligne perforée d'un reçu boutique. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="relative my-7 flex items-center gap-3"
              aria-hidden
            >
              <span className="h-px flex-1" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${stubDivider} 0 6px, transparent 6px 12px)` }} />
              <ReceiptText className="h-3.5 w-3.5 shrink-0" style={{ color: textMuted, opacity: 0.6 }} />
              <span className="h-px flex-1" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${stubDivider} 0 6px, transparent 6px 12px)` }} />
            </motion.div>

            {/* Info : données conservées */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 }}
              className="mx-auto mb-7 flex max-w-sm items-start gap-3 rounded-2xl p-4 text-left"
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
              transition={{ delay: 0.52 }}
              className="flex flex-col gap-3"
            >
              {/**
               * Option 1 : Réessayer avec le wallet.
               * L'utilisateur retourne à la page commande dont les données
               * (panier via pannierStore Zustand) sont intactes.
               */}
              <Link
                href="/commandes"
                className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_FOREST}, ${BRAND_FOREST_LIGHT})`,
                  boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                  ["--tw-ring-color" as string]: BRAND_GOLD,
                }}
              >
                {/* Balayage lumineux au survol — discret, non permanent */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <Wallet className="h-5 w-5" />
                <span className="relative">Réessayer avec le wallet</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70" />
              </Link>

              {/**
               * Option 2 : Passer au paiement PayDunya.
               * L'utilisateur retourne à la page commande ; le
               * composant PayDunyaCheckout sera accessible depuis l'étape 2.
               */}
              <Link
                href="/commandes"
                className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_PAYDUNYA}, ${BRAND_PAYDUNYA_DEEP})`,
                  boxShadow: "0 8px 28px rgba(15,118,181,0.3)",
                  color: "#fff",
                  ["--tw-ring-color" as string]: BRAND_PAYDUNYA,
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <Smartphone className="h-5 w-5" />
                <span className="relative">Payer avec PayDunya</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70" />
              </Link>

              {/* Retour à l'accueil */}
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:rounded-xl"
                style={{ color: textMuted, ["--tw-ring-color" as string]: BRAND_GOLD }}
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Retour à la boutique
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Note discrète sous la carte — clin d'œil à la marque, non intrusif */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 flex items-center justify-center gap-1.5 text-[11px]"
          style={{ color: textMuted }}
        >
          <Sparkles className="h-3 w-3" style={{ color: BRAND_GOLD }} />
          <span>Assistance disponible 24h/24 pour finaliser votre commande</span>
        </motion.div>
      </motion.div>
    </div>
  );
}