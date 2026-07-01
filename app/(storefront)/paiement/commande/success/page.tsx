/**
 * Page de succès de paiement commande — Ultra Premium
 *
 * Affichée après un paiement réussi (wallet ou PayDunya).
 * La référence de commande est lue depuis :
 *  1. Le paramètre de navigation ?ref=XXX (cas wallet)
 *  2. Le store Zustand uiStore.paymentOrderRef (cas PayDunya — retour automatique)
 *
 * Comportement :
 *  - Animation Lottie success_01.json + confettis
 *  - Message personnalisé avec le prénom du client
 *  - Compteur 5 secondes visible avant redirection automatique
 *  - Redirection vers /commandes/[reference] pour voir le détail de la commande
 *  - Nettoyage du store Zustand après utilisation
 *
 * @module app/(storefront)/paiement/commande/success/page
 */

"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Receipt,
  ShoppingBag,
  BadgeCheck,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useThemeStore } from "@/store/theme.store";

// Chargement paresseux de Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Import direct des animations Lottie
import successAnimation from "@/public/assets/lottis/Success_02.json";
import confettiAnimation from "@/public/assets/lottis/Confetti.json";

/* ----------------------------------------------- */
/* Constantes                                      */
/* ----------------------------------------------- */

const REDIRECT_DELAY_SECONDS = 5;
const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";

/* ----------------------------------------------- */
/* Composant principal (wrappé dans Suspense)      */
/* ----------------------------------------------- */

function SuccessCommandeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Récupération de la référence depuis l'URL ou Zustand (fallback PayDunya)
  const paymentOrderRef = useUIStore((s) => s.paymentOrderRef);
  const setPaymentOrderRef = useUIStore((s) => s.setPaymentOrderRef);

  const refFromUrl = searchParams?.get("ref") || "";
  const [orderRef, setOrderRef] = useState<string>("");
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
  const [isMounted, setIsMounted] = useState(false);
  const hasRedirected = useRef(false);

  /* Résolution de la référence : URL > Zustand */
  useEffect(() => {
    setIsMounted(true);
    const resolvedRef = refFromUrl || paymentOrderRef || "";
    setOrderRef(resolvedRef);

    /**
     * Nettoyage du store après récupération.
     * On le fait ici pour éviter que la valeur ne soit réutilisée sur
     * une prochaine visite accidentelle de cette page.
     */
    if (paymentOrderRef && !refFromUrl) {
      // Petite pause pour laisser le composant lire la valeur
      setTimeout(() => setPaymentOrderRef(null), 1000);
    }
  }, [refFromUrl, paymentOrderRef, setPaymentOrderRef]);

  /* Compteur de redirection automatique */
  useEffect(() => {
    if (!isMounted || !orderRef) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.push(`/commandes/${encodeURIComponent(orderRef)}`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, orderRef, router]);

  /* Tokens de design */
  const bg = isDark
    ? "linear-gradient(135deg, #030a05 0%, #0a1a0e 50%, #050d07 100%)"
    : "linear-gradient(135deg, #f0faf5 0%, #e8f5ed 50%, #f5faf7 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#0f1a10";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

  /* Progression du compteur (0 → 1) */
  const progressRatio = (REDIRECT_DELAY_SECONDS - countdown) / REDIRECT_DELAY_SECONDS;

  if (!isMounted) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20"
      style={{ background: bg }}
    >
      {/* -- Halos ambiants -- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "rgba(31,77,63,0.22)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(201,168,118,0.12)" }}
      />

      {/* -- Confettis en fond -- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
      >
        <Lottie
          animationData={confettiAnimation}
          loop={true}
          autoplay={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

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
              : "0 40px 80px -20px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* Bande dorée supérieure */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})`,
            }}
          />

          <div className="px-8 pb-10 pt-10 text-center">
            {/* -- Animation Lottie succès -- */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
              className="relative mx-auto mb-6 flex h-44 w-44 items-center justify-center"
            >
              {/* Halo pulsant */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <Lottie
                animationData={successAnimation}
                loop={false}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </motion.div>

            {/* Titre */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                <BadgeCheck className="h-5 w-5" style={{ color: BRAND_GOLD }} />
                <span
                  className="text-[11px] font-black uppercase tracking-[0.22em]"
                  style={{ color: BRAND_GOLD }}
                >
                  Paiement confirmé
                </span>
                <BadgeCheck className="h-5 w-5" style={{ color: BRAND_GOLD }} />
              </div>
              <h1
                className="font-display text-4xl font-black tracking-tight"
                style={{ color: textPrimary }}
              >
                Paiement réussi !
              </h1>
              <p className="mt-3 text-base leading-relaxed" style={{ color: textMuted }}>
                Votre commande a été validée avec succès. Votre facture vous sera envoyée par email.
              </p>
            </motion.div>

            {/* Badge référence commande */}
            <AnimatePresence>
              {orderRef && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                  className="mx-auto my-7 flex max-w-xs items-center justify-center gap-3 rounded-2xl px-6 py-4"
                  style={{
                    background: isDark
                      ? "rgba(31,77,63,0.18)"
                      : "rgba(31,77,63,0.06)",
                    border: "1.5px solid rgba(31,77,63,0.25)",
                  }}
                >
                  <Receipt className="h-5 w-5 shrink-0" style={{ color: BRAND_GOLD }} />
                  <div className="text-left">
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.18em]"
                      style={{ color: textMuted }}
                    >
                      N° de commande
                    </p>
                    <p
                      className="mt-0.5 font-mono text-lg font-black tracking-wider"
                      style={{ color: BRAND_FOREST }}
                    >
                      {orderRef}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* -- Compteur de redirection -- */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mb-8 flex max-w-sm flex-col items-center gap-3"
            >
              {/* Barre de progression */}
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${BRAND_FOREST}, #2d7a63)`,
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressRatio * 100}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>

              <p className="text-[13px] font-medium" style={{ color: textMuted }}>
                Redirection automatique dans{" "}
                <span className="font-black" style={{ color: BRAND_FOREST }}>
                  {countdown}s
                </span>{" "}
                vers votre commande…
              </p>
            </motion.div>

            {/* -- Boutons d'action -- */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              {/* CTA principal : voir le détail de commande */}
              {orderRef ? (
                <Link
                  href={`/commandes/${encodeURIComponent(orderRef)}`}
                  className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                    boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Voir ma commande
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link
                  href="/dashboard?tab=orders"
                  className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                    boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                  }}
                >
                  <Receipt className="h-5 w-5" />
                  Mes commandes
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}

              {/* Lien secondaire : continuer les achats */}
              <Link
                href="/products"
                className="group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${cardBorder}`,
                  color: textMuted,
                }}
              >
                <ShoppingBag className="h-4 w-4" style={{ color: BRAND_FOREST }} />
                Continuer mes achats
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------- */
/* Export — wrappé dans Suspense pour useSearchParams */
/* ----------------------------------------------- */

export default function SuccessCommandePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3f] border-t-transparent" />
        </div>
      }
    >
      <SuccessCommandeContent />
    </Suspense>
  );
}
