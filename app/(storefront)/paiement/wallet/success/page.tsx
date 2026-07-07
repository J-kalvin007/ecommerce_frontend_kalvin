// /**
//  * Page de succès de recharge Wallet — Ultra Premium
//  *
//  * Affichée après une recharge réussie via PayDunya.
//  * Le flux intelligent dépend du contexte initial (via Zustand inCommandFlow) :
//  *  - Si inCommandFlow = true (recharge pendant tunnel commande) :
//  *    Redirection auto vers /commandes (panier conservé, étape wallet)
//  *  - Si inCommandFlow = false (recharge depuis dashboard) :
//  *    Redirection auto vers /customer/wallet
//  *
//  * @module app/(storefront)/paiement/wallet/success/page
//  */

// "use client";

// import React, { useEffect, useState, useRef, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import dynamic from "next/dynamic";
// import Link from "next/link";
// import { CheckCircle2, ArrowRight, Wallet, Star } from "lucide-react";
// import { useUIStore } from "@/store/uiStore";
// import { useThemeStore } from "@/store/theme.store";

// // Chargement dynamique de Lottie pour SSR
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import successAnimation from "@/public/assets/lottis/success.json";

// const REDIRECT_DELAY_SECONDS = 5;
// const BRAND_FOREST = "#1f4d3f";
// const BRAND_GOLD = "#c9a876";

// function SuccessWalletContent() {
//   const router = useRouter();
//   const { resolvedTheme } = useThemeStore();
//   const isDark = resolvedTheme === "dark";

//   // Lecture du flag inCommandFlow
//   const inCommandFlow = useUIStore((s) => s.inCommandFlow);
//   const setInCommandFlow = useUIStore((s) => s.setInCommandFlow);

//   const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
//   const [isMounted, setIsMounted] = useState(false);
//   const hasRedirected = useRef(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!isMounted) return;

//     const timer = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           if (!hasRedirected.current) {
//             hasRedirected.current = true;
//             const targetUrl = inCommandFlow ? "/commandes" : "/customer/wallet";
//             // On reset le flag après utilisation
//             if (inCommandFlow) setInCommandFlow(false);
//             router.push(targetUrl);
//           }
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isMounted, inCommandFlow, setInCommandFlow, router]);

//   const bg = isDark
//     ? "linear-gradient(135deg, #030a05 0%, #0a1a0e 50%, #050d07 100%)"
//     : "linear-gradient(135deg, #f0faf5 0%, #e8f5ed 50%, #f5faf7 100%)";
//   const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
//   const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
//   const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#0f1a10";
//   const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

//   const progressRatio = (REDIRECT_DELAY_SECONDS - countdown) / REDIRECT_DELAY_SECONDS;

//   if (!isMounted) return null;

//   return (
//     <div
//       className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20"
//       style={{ background: bg }}
//     >
//       {/* -- Halos ambiants -- */}
//       <div
//         aria-hidden
//         className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
//         style={{ background: "rgba(31,77,63,0.22)" }}
//       />
//       <div
//         aria-hidden
//         className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full blur-3xl"
//         style={{ background: "rgba(201,168,118,0.12)" }}
//       />

//       <motion.div
//         initial={{ opacity: 0, y: 40, scale: 0.94 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
//         className="relative z-10 w-full max-w-lg"
//       >
//         <div
//           className="relative overflow-hidden rounded-3xl shadow-2xl"
//           style={{
//             background: cardBg,
//             border: `1px solid ${cardBorder}`,
//             backdropFilter: "blur(24px)",
//             boxShadow: isDark
//               ? "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
//               : "0 40px 80px -20px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)",
//           }}
//         >
//           <div
//             aria-hidden
//             className="absolute inset-x-0 top-0 h-1"
//             style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})` }}
//           />

//           <div className="px-8 pb-10 pt-10 text-center">
//             {/* Lottie */}
//             <motion.div
//               initial={{ scale: 0.6, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
//               className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center"
//             >
//               <Lottie animationData={successAnimation} loop={false} autoplay={true} style={{ width: "100%", height: "100%" }} />
//             </motion.div>

//             {/* Title */}
//             <motion.div
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.25, duration: 0.45 }}
//             >
//               <div className="mb-2 flex items-center justify-center gap-2">
//                 <Star className="h-4 w-4" style={{ color: BRAND_GOLD }} />
//                 <span className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: BRAND_GOLD }}>
//                   Transaction confirmée
//                 </span>
//                 <Star className="h-4 w-4" style={{ color: BRAND_GOLD }} />
//               </div>
//               <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: textPrimary }}>
//                 Recharge réussie !
//               </h1>
//               <p className="mt-3 text-[15px] leading-relaxed" style={{ color: textMuted }}>
//                 Votre portefeuille a été crédité avec succès. Le nouveau solde est disponible immédiatement.
//               </p>
//             </motion.div>

//             {/* Countdown */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//               className="mx-auto my-8 flex max-w-sm flex-col items-center gap-3"
//             >
//               <div
//                 className="h-1.5 w-full overflow-hidden rounded-full"
//                 style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}
//               >
//                 <motion.div
//                   className="h-full rounded-full"
//                   style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, #2d7a63)` }}
//                   initial={{ width: "0%" }}
//                   animate={{ width: `${progressRatio * 100}%` }}
//                   transition={{ duration: 0.9, ease: "easeOut" }}
//                 />
//               </div>
//               <p className="text-[13px] font-medium" style={{ color: textMuted }}>
//                 Redirection automatique dans <span className="font-black" style={{ color: BRAND_FOREST }}>{countdown}s</span>...
//               </p>
//             </motion.div>

//             {/* Action */}
//             <motion.div
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//             >
//               <Link
//                 href={inCommandFlow ? "/commandes" : "/customer/wallet"}
//                 onClick={() => { if (inCommandFlow) setInCommandFlow(false); }}
//                 className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
//                 style={{
//                   background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
//                   boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
//                 }}
//               >
//                 {inCommandFlow ? (
//                   <>
//                     <CheckCircle2 className="h-5 w-5" />
//                     Finaliser ma commande
//                   </>
//                 ) : (
//                   <>
//                     <Wallet className="h-5 w-5" />
//                     Aller au portefeuille
//                   </>
//                 )}
//                 <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
//               </Link>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// export default function SuccessWalletPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center">
//           <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3f] border-t-transparent" />
//         </div>
//       }
//     >
//       <SuccessWalletContent />
//     </Suspense>
//   );
// }

















/**
 * page.tsx — Page de succès de recharge Wallet — version ultra-premium
 * ─────────────────────────────────────────────────────────────────────────────
 * Affichée après une recharge réussie via PayDunya.
 *
 * Direction artistique — "l'onde de paiement" :
 *   Ce moment est le plus chargé émotionnellement du parcours client.
 *   La page doit confirmer le succès avant même que l'œil commence à lire,
 *   puis guider vers la prochaine action avec précision.
 *   L'esthétique emprunte à la haute joaillerie et aux apps fintech premium :
 *   sombre, confiant, raffiné — une salle des coffres, pas un supermarché.
 *
 *   Signature visuelle — le "Coin Ripple" :
 *   Au montage, un double anneau doré s'étend depuis le centre de l'animation
 *   Lottie, comme une pièce de monnaie touchant l'eau. L'onde jouera une
 *   seule fois, puis disparaît — elle dit "transaction validée, le signal
 *   a été reçu." C'est spécifique au contexte fintech/paiement — cette
 *   métaphore n'aurait aucun sens sur une page d'inscription ou un formulaire.
 *
 * Ce qui reste strictement inchangé :
 *   - REDIRECT_DELAY_SECONDS, BRAND_FOREST, BRAND_GOLD
 *   - SuccessWalletContent, SuccessWalletPage
 *   - Tous les états : countdown, isMounted, hasRedirected
 *   - Toute la logique des effects (timer, redirect)
 *   - Hooks Zustand : useUIStore, useThemeStore
 *   - inCommandFlow, setInCommandFlow
 *   - progressRatio
 *   - Tous les jetons de thème : bg, cardBg, cardBorder, textPrimary, textMuted
 *   - Import Lottie + successAnimation
 *   - Wrapper Suspense
 *
 * @module app/(storefront)/paiement/wallet/success/page
 */

"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Wallet, Star, Shield } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useThemeStore } from "@/store/theme.store";

// Chargement dynamique de Lottie pour SSR (identique à l'original)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import successAnimation from "@/public/assets/lottis/success.json";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/* ── Constantes — IDENTIQUES à l'original ───────────────────────────────── */

const REDIRECT_DELAY_SECONDS = 5;
const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_SOFT = "rgba(201,168,118,0.14)";

/* ── Configuration des orbes flottants — statique pour éviter l'hydratation ─
 *
 *  6 orbes aux positions, tailles et délais déterministes.
 *  Petit + flou = poussière d'or en suspension dans l'air.
 *  Utilisés dans FloatingOrbs ci-dessous.
 */
const FLOATING_ORBS = [
  { id: 1, left: "8%", bottom: "18%", size: 10, color: BRAND_GOLD, delay: 0, dur: 5.2 },
  { id: 2, left: "22%", bottom: "8%", size: 6, color: BRAND_FOREST, delay: 0.8, dur: 4.5 },
  { id: 3, left: "58%", bottom: "22%", size: 14, color: BRAND_GOLD, delay: 1.5, dur: 6.0 },
  { id: 4, left: "76%", bottom: "12%", size: 8, color: BRAND_FOREST, delay: 0.4, dur: 4.8 },
  { id: 5, left: "90%", bottom: "28%", size: 5, color: BRAND_GOLD, delay: 2.0, dur: 5.5 },
  { id: 6, left: "44%", bottom: "4%", size: 12, color: BRAND_GOLD, delay: 1.1, dur: 4.2 },
] as const;

/* ════════════════════════════════════════════════════════════════════════════
   Composant principal — IDENTIQUE à l'original pour toute la logique métier
   ════════════════════════════════════════════════════════════════════════════ */

function SuccessWalletContent() {
  const router = useRouter();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Lecture du flag inCommandFlow — IDENTIQUE à l'original
  const inCommandFlow = useUIStore((s) => s.inCommandFlow);
  const setInCommandFlow = useUIStore((s) => s.setInCommandFlow);

  // États — IDENTIQUES à l'original
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
  const [isMounted, setIsMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Logique de décompte et redirection
  useEffect(() => {
    if (!isMounted) return;

    if (countdown <= 0) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        const targetUrl = inCommandFlow ? "/commandes" : "/customer/wallet";
        if (inCommandFlow) setInCommandFlow(false);
        router.push(targetUrl);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isMounted, inCommandFlow, setInCommandFlow, router]);

  // Jetons de thème — IDENTIQUES à l'original
  const bg = isDark
    ? "linear-gradient(135deg, #030a05 0%, #0a1a0e 50%, #050d07 100%)"
    : "linear-gradient(135deg, #f0faf5 0%, #e8f5ed 50%, #f5faf7 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#0f1a10";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

  // Ratio de progression [0 → 1] — IDENTIQUE à l'original
  const progressRatio = (REDIRECT_DELAY_SECONDS - countdown) / REDIRECT_DELAY_SECONDS;

  if (!isMounted) return null;

  /* ── Rendu ─────────────────────────────────────────────────────────────── */
  return (
    <div
      className="relative flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: bg }}
    >

      {/* ────────────────────────────────────────────────────────────────────
       *  Halos ambiants — IDENTIQUES à l'original, légèrement affinés
       * ──────────────────────────────────────────────────────────────────── */}
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

      {/* ── Orbes flottants — poussière d'or ambiante (NEW) ──────────────── */}
      <FloatingOrbs isDark={isDark} />

      {/* ════════════════════════════════════════════════════════════════════
       *  Carte principale
       * ════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            backdropFilter: "blur(24px)",
            boxShadow: isDark
              ? "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
              : "0 40px 80px -20px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* Shimmer de validation — balaie la carte une seule fois au montage.
           *  Cohérent avec le shimmer de LoyaltyTiersGrid : même métaphore
           *  "lumière qui accroche une surface précieuse" en moment de révélation. */}
          <style>{`
            @keyframes validationSweep {
              0%   { transform: translateX(-110%); }
              100% { transform: translateX(210%); }
            }
          `}</style>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            style={{ zIndex: 1 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "translateX(-110%)",
                animation: "validationSweep 1.6s cubic-bezier(0.22,1,0.36,1) 0.8s 1 forwards",
                background: `linear-gradient(
                  108deg,
                  transparent 33%,
                  rgba(255,255,255,0.16) 48%,
                  rgba(255,255,255,0.28) 52%,
                  transparent 67%
                )`,
              }}
            />
          </div>

          {/* Liseré doré supérieur — signature Kalvin (IDENTIQUE à l'original) */}
          {/* <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-1"
            style={{
              background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})`,
            }}
          /> */}

          <div className="relative z-[2] px-8 pb-10 pt-10 text-center">

            {/* ── Zone Lottie + COIN RIPPLE (signature visuelle) ─────────────
             *
             *  Le Coin Ripple est positionné en absolu autour de l'animation.
             *  Deux anneaux décalés — le premier plus ample et lent, le second
             *  plus compact et rapide. Ils jouent UNE SEULE FOIS (no repeat).
             * ─────────────────────────────────────────────────────────────── */}
            <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">

              {/* Halo ambiant derrière la Lottie */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${BRAND_GOLD}22 0%, transparent 70%)`,
                }}
              />

              {/* Anneau externe — onde lente et ample */}
              <motion.div
                aria-hidden
                className="absolute rounded-full"
                style={{ border: `1.5px solid ${BRAND_GOLD}`, pointerEvents: "none" }}
                initial={{ width: 80, height: 80, opacity: 0.85 }}
                animate={{ width: 260, height: 260, opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
              />

              {/* Anneau interne — onde rapide et concentrée */}
              <motion.div
                aria-hidden
                className="absolute rounded-full"
                style={{ border: `2px solid ${BRAND_GOLD}`, pointerEvents: "none" }}
                initial={{ width: 80, height: 80, opacity: 0.9 }}
                animate={{ width: 190, height: 190, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.75 }}
              />

              {/* Animation Lottie — IDENTIQUE à l'original */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
                className="relative z-10 h-full w-full"
              >
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </motion.div>
            </div>

            {/* ── En-tête du message ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              {/* Eyebrow */}
              <div className="mb-3 flex items-center justify-center gap-2">
                <Star className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />
                <span
                  className="text-[10.5px] font-black uppercase tracking-[0.22em]"
                  style={{ color: BRAND_GOLD }}
                >
                  Transaction confirmée
                </span>
                <Star className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />
              </div>

              {/* Titre */}
              <h1
                className="font-display text-3xl font-black tracking-tight"
                style={{ color: textPrimary }}
              >
                Recharge réussie !
              </h1>

              {/* Sous-titre */}
              <p
                className="mx-auto mt-3 max-w-xs text-[14.5px] leading-relaxed"
                style={{ color: textMuted }}
              >
                Votre portefeuille a été crédité. Le nouveau solde est disponible immédiatement.
              </p>
            </motion.div>

            {/* ── Décompte — double représentation (ring SVG + barre) ────────
             *
             *  CircularCountdown est le sous-composant NEW qui remplace
             *  la simple barre linéaire de l'original.
             *  La barre linéaire est conservée comme élément secondaire discret.
             * ─────────────────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="my-8 flex flex-col items-center gap-4"
            >
              {/* Ring SVG (NEW) */}
              <CircularCountdown
                countdown={countdown}
                progressRatio={progressRatio}
                isDark={isDark}
                textMuted={textMuted}
              />

              {/* Barre linéaire secondaire (conservée de l'original) */}
              <div className="w-full max-w-xs">
                <div
                  className="h-1 w-full overflow-hidden rounded-full"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.06)",
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
              </div>
            </motion.div>

            {/* ── CTA Bouton — IDENTIQUE à l'original, micro-interactions affinées ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href={inCommandFlow ? "/commandes" : "/customer/wallet"}
                onClick={() => { if (inCommandFlow) setInCommandFlow(false); }}
                className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                  boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                }}
              >
                {inCommandFlow ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                    Finaliser ma commande
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" strokeWidth={1.75} />
                    Aller au portefeuille
                  </>
                )}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Badge de sécurité — sous la carte, cohérent avec CommandesClient */}
        {/* <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[12px] font-semibold"
          style={{
            background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.18)",
            color: isDark ? "rgba(52,211,153,0.85)" : "#059669",
          }}
        >
          <Shield className="h-4 w-4" />
          Transaction protégée par chiffrement 256-bit
        </motion.div> */}

      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Wrapper Suspense — IDENTIQUE à l'original
   ════════════════════════════════════════════════════════════════════════════ */

export default function SuccessWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
          <div className="relative z-10 w-full max-w-lg">
            <div className="h-[500px] w-full animate-pulse rounded-3xl bg-black/5 dark:bg-white/5 backdrop-blur-2xl" />
          </div>
        </div>
      }
    >
      <SuccessWalletContent />
    </Suspense>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Sous-composants présentationnels
   ════════════════════════════════════════════════════════════════════════════ */

/* ── FloatingOrbs ──────────────────────────────────────────────────────────
 *
 * Petits cercles flous qui dérivent lentement vers le haut en boucle infinie.
 * Ils donnent une profondeur "atmosphérique" à l'arrière-plan sans distraire.
 * Positions et timings déterministes (définis dans FLOATING_ORBS ci-dessus).
 *
 * Le filtre blur() sur chaque orbe est justifié ici car :
 *   1. Les orbes sont en position absolute HORS de la carte principale
 *   2. Ils ne contiennent pas de texte à rendre lisible
 *   3. Leur quantité est limitée (6) pour ne pas charger le GPU
 */
function FloatingOrbs({ isDark }: { isDark: boolean }) {
  return (
    <>
      <style>{`
        @keyframes orbDrift {
          0%   { opacity: 0; transform: translateY(0)    scale(0.6); }
          15%  { opacity: 0.65; }
          80%  { opacity: 0.35; }
          100% { opacity: 0; transform: translateY(-180px) scale(1.2); }
        }
      `}</style>
      {FLOATING_ORBS.map((orb) => (
        <div
          key={orb.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: orb.left,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            opacity: 0,
            filter: "blur(3px)",
            animation: `orbDrift ${orb.dur}s ${orb.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}

/* ── CircularCountdown ──────────────────────────────────────────────────────
 *
 * Décompte circulaire SVG — anneau qui se vide au fil des secondes.
 * Complète la barre linéaire conservée de l'original (double représentation).
 *
 * Mécanique SVG :
 *   - R = 28 → Circonférence C ≈ 175.9
 *   - strokeDashoffset = C * progressRatio
 *     → 0 (cercle plein) quand progressRatio=0
 *     → C (cercle vide)  quand progressRatio=1
 *   - rotate(-90deg) pour démarrer depuis 12h
 *
 * Framer Motion anime strokeDashoffset en douceur entre chaque changement
 * de secondes, évitant les sauts visuels.
 */
function CircularCountdown({
  countdown,
  progressRatio,
  isDark,
  textMuted,
}: {
  countdown: number;
  progressRatio: number;
  isDark: boolean;
  textMuted: string;
}) {
  const R = 28;
  const C = 2 * Math.PI * R; // ≈ 175.9

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Anneau SVG */}
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
          {/* Rail de fond */}
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
            strokeWidth="3.5"
          />

          {/* Arc de progression — se vide avec le temps */}
          <motion.circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={BRAND_FOREST}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: C * progressRatio }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            transform="rotate(-90 40 40)"
          />

          {/* Petit point doré à la pointe de l'arc */}
          <motion.circle
            cx="40"
            cy={40 - R}
            r="4"
            fill={BRAND_GOLD}
            initial={{ opacity: 0 }}
            animate={{ opacity: progressRatio < 0.95 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            transform={`rotate(${progressRatio * 360} 40 40)`}
          />

          {/* Chiffre du décompte */}
          <text
            x="40"
            y="45"
            textAnchor="middle"
            fontSize="22"
            fontWeight="900"
            fill={BRAND_FOREST}
            fontFamily="inherit"
          >
            {countdown}
          </text>
        </svg>
      </div>

      {/* Libellé sous l'anneau */}
      <p className="text-[12.5px] font-medium" style={{ color: textMuted }}>
        Redirection automatique dans{" "}
        <span className="font-black" style={{ color: BRAND_FOREST }}>
          {countdown}s
        </span>
      </p>
    </div>
  );
}