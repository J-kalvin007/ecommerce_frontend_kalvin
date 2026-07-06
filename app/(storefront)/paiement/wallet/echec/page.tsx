


/**
 * Page d'échec de recharge Wallet — Ultra Premium
 *
 * Affichée lorsqu'une recharge échoue via PayDunya.
 * Le flux intelligent dépend du contexte initial (via Zustand inCommandFlow).
 *
 * Direction artistique :
 *  - Reprend le même langage visuel que la page d'échec de commande (sceau
 *    circulaire en médaillon, souche en pointillés façon reçu, ton "cuivre
 *    atténué" pour l'alerte) afin que l'utilisateur reconnaisse un système
 *    de design cohérent d'un échec de paiement à l'autre, plutôt qu'une
 *    interface isolée.
 *  - La réassurance "aucun montant débité" — auparavant une simple phrase —
 *    devient une carte dédiée avec icône, pour rassurer d'un coup d'œil,
 *    sans devoir lire tout le paragraphe.
 *  - Les deux parcours conditionnels (inCommandFlow) sont conservés à
 *    l'identique dans leur logique ; seule leur présentation est élevée au
 *    niveau du reste du système.
 *  - Respect de prefers-reduced-motion : les boucles ambiantes sont coupées,
 *    seules les transitions d'entrée légères restent actives.
 *
 * @module app/(storefront)/paiement/wallet/echec/page
 */

"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  RefreshCcw,
  ArrowLeft,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ReceiptText,
  Wallet,
  UserLock,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { useUIStore } from "@/store/uiStore";

// Chargement paresseux de Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import attentionAnimation from "@/public/assets/lottis/attention.json";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/* ----------------------------------------------- */
/* Constantes — Design tokens                      */
/* ----------------------------------------------- */

// Identité de marque (inchangée)
const BRAND_FOREST = "#1f4d3f";

// Extensions de la palette de marque, alignées sur le système de design
// introduit sur la page d'échec de commande, pour une cohérence inter-pages.
const BRAND_FOREST_LIGHT = "#2d7a63";
const BRAND_FOREST_DEEP = "#0f2b22";
const BRAND_GOLD = "#c9a876";

// Ton d'alerte "cuivre atténué" — identique à la page d'échec de commande,
// pour que les deux écrans d'échec partagent le même vocabulaire visuel.
const BRAND_COPPER = "#b8763f";
const BRAND_COPPER_DEEP = "#8a5228";

/* ----------------------------------------------- */
/* Contenu (dépend de useSearchParams via Suspense) */
/* ----------------------------------------------- */

function EchecWalletContent() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  const inCommandFlow = useUIStore((s) => s.inCommandFlow);
  const setInCommandFlow = useUIStore((s) => s.setInCommandFlow);

  // Respecte la préférence système de réduction des animations.
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bg = isDark
    ? "radial-gradient(120% 120% at 50% -10%, #17251f 0%, #0a0505 45%, #0a0705 100%)"
    : "radial-gradient(120% 120% at 50% -10%, #fffaf4 0%, #fff8f5 45%, #fef3ee 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "rgba(255,255,255,0.96)" : "#1a0a05";
  const textMuted = isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.5)";
  const rowBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const rowBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const stubDivider = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";

  if (!isMounted) return null;

  return (

    <div
      className="relative flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: bg }}
    >

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Sceau circulaire — même signature que la page d'échec de commande,
              pour une reconnaissance immédiate du système de design. */}
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
              <Lottie animationData={attentionAnimation} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
            </div>
            <div aria-hidden className="absolute inset-[-6px] rounded-full" style={{ border: `1.5px dashed ${BRAND_GOLD}80` }} />
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
              {/* Eyebrow : statut de la recharge */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mb-3 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="h-4 w-4" style={{ color: BRAND_COPPER }} />
                <span className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: BRAND_COPPER }}>
                  Recharge non aboutie
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
                La recharge a échoué
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.36 }}
                className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed"
                style={{ color: textMuted }}
              >
                Une erreur s&apos;est produite lors de la transaction.
              </motion.p>

              {/* Souche de ticket — sépare le message d'erreur de la réassurance,
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

              {/* Réassurance : aucun montant débité — élevée en carte dédiée
                  pour être comprise d'un coup d'œil, pas seulement lue. */}
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
                  <p className="text-[12px] font-black uppercase tracking-wider" style={{ color: "#10b981" }}>
                    Aucun débit effectué
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: textMuted }}>
                    Aucun montant n&apos;a été débité de votre compte bancaire.
                    Vous pouvez retenter l&apos;opération en toute confiance.
                  </p>
                </div>
              </motion.div>

              {/* -- Actions -- */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 }}
                className="flex flex-col gap-3"
              >
                {inCommandFlow ? (
                  <>
                    {/**
                     * Contexte "commande en cours" : l'utilisateur venait de
                     * tenter de recharger son wallet depuis le tunnel de
                     * commande. On le ramène en priorité vers sa commande.
                     */}
                    <Link
                      href="/commandes"
                      onClick={() => setInCommandFlow(false)} // Clear on explicit navigation
                      className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_FOREST}, ${BRAND_FOREST_LIGHT})`,
                        boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                        ["--tw-ring-color" as string]: BRAND_GOLD,
                      }}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                      />
                      <ShoppingBag className="h-5 w-5" />
                      <span className="relative">Retourner à ma commande</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70" />
                    </Link>

                    <Link
                      href="/customer/wallet"
                      onClick={() => setInCommandFlow(false)}
                      className="group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ background: rowBg, border: `1px solid ${rowBorder}`, color: textMuted, ["--tw-ring-color" as string]: BRAND_GOLD }}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Réessayer depuis le portefeuille
                    </Link>
                  </>
                ) : (
                  <>
                    {/**
                     * Contexte "recharge autonome" : l'utilisateur rechargeait
                     * son wallet en dehors de tout tunnel de commande.
                     */}
                    <Link
                      href="/customer/wallet"
                      className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_FOREST}, ${BRAND_FOREST_LIGHT})`,
                        boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                        ["--tw-ring-color" as string]: BRAND_GOLD,
                      }}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                      />
                      <RefreshCcw className="h-5 w-5" />
                      <span className="relative">Réessayer la recharge</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70" />
                    </Link>

                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:rounded-xl"
                      style={{ color: textMuted, ["--tw-ring-color" as string]: BRAND_GOLD }}
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                      Retour à l&apos;accueil
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Note discrète sous la carte — cohérente avec la page d'échec de commande */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 flex items-center justify-center gap-1.5 text-[11px]"
            style={{ color: textMuted }}
          >
            <UserLock className="h-3 w-3" style={{ color: BRAND_GOLD }} />
            <span>Assistance disponible 24h/24 pour finaliser votre recharge</span>
          </motion.div>
        </motion.div>
      </div>
  );
}

/* ----------------------------------------------- */
/* Composant exporté — Suspense pour useSearchParams */
/* ----------------------------------------------- */

export default function EchecWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
          <div className="relative z-10 w-full max-w-lg">
            <div className="h-[400px] w-full animate-pulse rounded-[28px] bg-black/5 dark:bg-white/5 backdrop-blur-2xl" />
          </div>
        </div>
      }
    >
      <EchecWalletContent />
    </Suspense>
  );
}