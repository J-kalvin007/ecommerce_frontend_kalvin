/**
 * ModaleResultatPaiement — Modale ultra-premium de feedback après paiement
 *
 * - Animation Lottie one-shot (succès) ou loop (erreur)
 * - Confetti de fond animé sur le succès (particules CSS via Framer Motion)
 * - Référence commande avec effet copier-au-clic
 * - Boutons d'action distincts selon le résultat
 * - Logique métier intacte (handleAction, router.push, protection fermeture)
 *
 * @module components/commandes/ModaleResultatPaiement
 */

"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/special/Dialog";
import { useThemeStore } from "@/store/theme.store";
import { CheckCircle2, XCircle, Copy, Check, ArrowRight, RefreshCcw } from "lucide-react";

// Chargement dynamique de lottie-react pour éviter SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import successAnimation from "@/public/assets/lottis/success.json";
import errorAnimation from "@/public/assets/lottis/attention.json";

interface ModaleResultatPaiementProps {
  open: boolean;
  status: "success" | "error" | null;
  message?: string;
  orderReference?: string;
  onClose: () => void;
}

export default function ModaleResultatPaiement({
  open,
  status,
  message,
  orderReference,
  onClose,
}: ModaleResultatPaiementProps) {
  const router = useRouter();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [copied, setCopied] = useState(false);

  if (!status) return null;

  const isSuccess = status === "success";

  const handleAction = () => {
    if (isSuccess) {
      router.push(`/commandes/${orderReference || ""}`);
    } else {
      onClose();
    }
  };

  const handleCopyRef = () => {
    if (!orderReference) return;
    navigator.clipboard.writeText(orderReference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const text = isDark ? "rgba(255,255,255,0.95)" : "#0f172a";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "#475569";
  const bgSurface = isDark ? "#0f172a" : "#ffffff";

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isSuccess) onClose(); }}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] bg-transparent">
        <DialogTitle className="sr-only">
          {isSuccess ? "Paiement réussi" : "Échec du paiement"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isSuccess ? "Votre commande a été validée." : "Erreur lors du paiement."}
        </DialogDescription>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative overflow-hidden rounded-3xl"
          style={{ backgroundColor: bgSurface }}
        >
          {/* -- Background Ambiance -- */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute -top-32 -left-32 h-64 w-64 rounded-full mix-blend-multiply blur-3xl opacity-30 dark:opacity-20 dark:mix-blend-screen"
              style={{ background: isSuccess ? "#34d399" : "#f87171" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full mix-blend-multiply blur-3xl opacity-20 dark:opacity-10 dark:mix-blend-screen"
              style={{ background: isSuccess ? "#1f4d3f" : "#991b1b" }}
            />
          </div>

          {/* -- Top Border Indicator -- */}
          <div
            className="relative h-1.5 w-full"
            style={{
              background: isSuccess
                ? "linear-gradient(90deg, #10b981, #1f4d3f, #059669)"
                : "linear-gradient(90deg, #ef4444, #991b1b, #dc2626)",
            }}
          />

          {/* -- Content -- */}
          <div className="relative z-10 px-8 pb-10 pt-10 text-center">
            {/* Lottie Container */}
            <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
              {/* Rotating glowing halo */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: isSuccess 
                    ? "conic-gradient(from 0deg, transparent, #34d399, transparent)" 
                    : "conic-gradient(from 0deg, transparent, #f87171, transparent)",
                  opacity: 0.15,
                  filter: "blur(10px)"
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              />
              <motion.div
                initial={{ scale: 0.4, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.15 }}
                className="relative z-10 h-[120%] w-[120%] drop-shadow-2xl"
              >
                <Lottie
                  animationData={isSuccess ? successAnimation : errorAnimation}
                  loop={!isSuccess}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </motion.div>
            </div>

            {/* Typography */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 20 }}
              className="font-display mb-3 text-3xl font-extrabold tracking-tight"
              style={{ color: text }}
            >
              {isSuccess ? "Paiement réussi !" : "Paiement refusé"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mx-auto mb-8 max-w-sm text-[15px] leading-relaxed font-medium"
              style={{ color: textMuted }}
            >
              {message || (isSuccess
                ? "Votre transaction a été validée avec succès. Nous préparons votre commande avec le plus grand soin."
                : "Une erreur inattendue a bloqué la transaction. Veuillez vérifier votre moyen de paiement et réessayer.")}
            </motion.p>

            {/* Order Reference */}
            <AnimatePresence>
              {isSuccess && orderReference && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                  className="mx-auto mb-8 flex max-w-xs flex-col items-center justify-center overflow-hidden rounded-2xl p-4 shadow-inner"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                  }}
                >
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: textMuted }}>
                    Référence de la commande
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-black tracking-wider" style={{ color: text }}>
                      {orderReference}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-primary/10 transition-colors hover:bg-primary/20 active:scale-95"
                      title="Copier la référence"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Copy className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-2 text-[10px] font-bold text-emerald-600"
                    >
                      Copié !
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <motion.button
              onClick={handleAction}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative mx-auto flex w-full max-w-sm cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 font-black text-white shadow-xl transition-all"
              style={{
                background: isSuccess
                  ? "linear-gradient(135deg, #1f4d3f 0%, #115e59 100%)"
                  : "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
                boxShadow: isSuccess
                  ? "0 10px 40px -10px rgba(31,77,63,0.5)"
                  : "0 10px 40px -10px rgba(239,68,68,0.4)",
              }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              
              <span className="relative z-10 flex items-center gap-2.5 text-[15px]">
                {isSuccess ? (
                  <>
                    Suivre ma commande
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                    Réessayer le paiement
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
