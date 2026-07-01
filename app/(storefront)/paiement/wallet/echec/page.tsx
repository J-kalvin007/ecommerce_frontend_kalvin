/**
 * Page d'échec de recharge Wallet — Ultra Premium
 *
 * Affichée lorsqu'une recharge échoue via PayDunya.
 * Le flux intelligent dépend du contexte initial (via Zustand inCommandFlow).
 *
 * @module app/(storefront)/paiement/wallet/echec/page
 */

"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { RefreshCcw, ArrowLeft, ShieldAlert, ShoppingBag } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { useUIStore } from "@/store/uiStore";

// Chargement paresseux de Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import attentionAnimation from "@/public/assets/lottis/attention.json";

const BRAND_FOREST = "#1f4d3f";

function EchecWalletContent() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  const inCommandFlow = useUIStore((s) => s.inCommandFlow);
  const setInCommandFlow = useUIStore((s) => s.setInCommandFlow);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bg = isDark
    ? "linear-gradient(135deg, #0a0505 0%, #160a0a 50%, #0a0505 100%)"
    : "linear-gradient(135deg, #fff8f5 0%, #fef3ee 50%, #fff8f5 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#1a0a05";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

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
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)" }}
          />

          <div className="px-8 pb-10 pt-10 text-center">
            {/* Lottie */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center"
            >
              <Lottie animationData={attentionAnimation} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 flex items-center justify-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" style={{ color: "#f59e0b" }} />
              <span className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: "#f59e0b" }}>
                Recharge non aboutie
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-display text-3xl font-black tracking-tight"
              style={{ color: textPrimary }}
            >
              La recharge a échoué
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed"
              style={{ color: textMuted }}
            >
              Une erreur s&apos;est produite lors de la transaction. Aucun montant n&apos;a été débité de votre compte bancaire.
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col gap-3"
            >
              {inCommandFlow ? (
                <>
                  <Link
                    href="/commandes"
                    onClick={() => setInCommandFlow(false)} // Clear on explicit navigation
                    className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                      boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                    }}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Retourner à ma commande
                  </Link>
                  <Link
                    href="/customer/wallet"
                    onClick={() => setInCommandFlow(false)}
                    className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    style={{ color: textMuted }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Réessayer depuis le portefeuille
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/customer/wallet"
                    className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                      boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                    }}
                  >
                    <RefreshCcw className="h-5 w-5" />
                    Réessayer la recharge
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    style={{ color: textMuted }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;accueil
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function EchecWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3f] border-t-transparent" />
        </div>
      }
    >
      <EchecWalletContent />
    </Suspense>
  );
}
