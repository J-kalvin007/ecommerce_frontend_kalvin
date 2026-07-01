/**
 * Page de succès de recharge Wallet — Ultra Premium
 *
 * Affichée après une recharge réussie via PayDunya.
 * Le flux intelligent dépend du contexte initial (via Zustand inCommandFlow) :
 *  - Si inCommandFlow = true (recharge pendant tunnel commande) :
 *    Redirection auto vers /commandes (panier conservé, étape wallet)
 *  - Si inCommandFlow = false (recharge depuis dashboard) :
 *    Redirection auto vers /customer/wallet
 *
 * @module app/(storefront)/paiement/wallet/success/page
 */

"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Wallet, Sparkles } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useThemeStore } from "@/store/theme.store";

// Chargement dynamique de Lottie pour SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import successAnimation from "@/public/assets/lottis/success_01.json";

const REDIRECT_DELAY_SECONDS = 5;
const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";

function SuccessWalletContent() {
  const router = useRouter();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Lecture du flag inCommandFlow
  const inCommandFlow = useUIStore((s) => s.inCommandFlow);
  const setInCommandFlow = useUIStore((s) => s.setInCommandFlow);

  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
  const [isMounted, setIsMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            const targetUrl = inCommandFlow ? "/commandes" : "/customer/wallet";
            // On reset le flag après utilisation
            if (inCommandFlow) setInCommandFlow(false);
            router.push(targetUrl);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, inCommandFlow, setInCommandFlow, router]);

  const bg = isDark
    ? "linear-gradient(135deg, #030a05 0%, #0a1a0e 50%, #050d07 100%)"
    : "linear-gradient(135deg, #f0faf5 0%, #e8f5ed 50%, #f5faf7 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#0f1a10";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

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
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})` }}
          />

          <div className="px-8 pb-10 pt-10 text-center">
            {/* Lottie */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
              className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center"
            >
              <Lottie animationData={successAnimation} loop={false} autoplay={true} style={{ width: "100%", height: "100%" }} />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: BRAND_GOLD }} />
                <span className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: BRAND_GOLD }}>
                  Transaction confirmée
                </span>
                <Sparkles className="h-4 w-4" style={{ color: BRAND_GOLD }} />
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: textPrimary }}>
                Recharge réussie !
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: textMuted }}>
                Votre portefeuille a été crédité avec succès. Le nouveau solde est disponible immédiatement.
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mx-auto my-8 flex max-w-sm flex-col items-center gap-3"
            >
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, #2d7a63)` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressRatio * 100}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="text-[13px] font-medium" style={{ color: textMuted }}>
                Redirection automatique dans <span className="font-black" style={{ color: BRAND_FOREST }}>{countdown}s</span>...
              </p>
            </motion.div>

            {/* Action */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href={inCommandFlow ? "/commandes" : "/customer/wallet"}
                onClick={() => { if (inCommandFlow) setInCommandFlow(false); }}
                className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                  boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                }}
              >
                {inCommandFlow ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Finaliser ma commande
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Aller au portefeuille
                  </>
                )}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3f] border-t-transparent" />
        </div>
      }
    >
      <SuccessWalletContent />
    </Suspense>
  );
}
