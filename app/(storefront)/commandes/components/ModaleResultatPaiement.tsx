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

import successAnimation from "@/public/assets/lottis/success_01.json";
import errorAnimation from "@/public/assets/lottis/error13.json";

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
      // Si succès, on redirige vers le détail de la commande (ou liste)
      router.push(`/commandes/${orderReference || ""}`);
    } else {
      // Si erreur, on permet de réessayer en fermant la modale
      onClose();
    }
  };

  /** Copie la référence commande dans le presse-papier */
  const handleCopyRef = () => {
    if (!orderReference) return;
    navigator.clipboard.writeText(orderReference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const text = isDark ? "rgba(255,255,255,0.95)" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Empêcher la fermeture si succès, forcer le clic sur le bouton
        if (!isSuccess) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Requis par Radix UI pour l'accessibilité (lecteurs d'écran) — visuellement masqué */}
        <DialogTitle className="sr-only">
          {isSuccess ? "Paiement réussi" : "Échec du paiement"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isSuccess
            ? "Votre commande a été validée avec succès."
            : "Une erreur est survenue lors du paiement."}
        </DialogDescription>

        {/* ── Bande de couleur en haut ── */}
        <div
          className="relative h-2 w-full"
          style={{
            background: isSuccess
              ? "linear-gradient(90deg, #1f4d3f, #2d7a62, #1f4d3f)"
              : "linear-gradient(90deg, #dc2626, #ef4444, #dc2626)",
          }}
        >
          {/* Animation slide-in de la barre */}
          <motion.div
            className="absolute inset-0"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: isSuccess
                ? "linear-gradient(90deg, #1f4d3f, #2d7a62)"
                : "linear-gradient(90deg, #dc2626, #ef4444)",
            }}
          />
        </div>

        {/* ── Corps ── */}
        <div className="px-8 pb-8 pt-6 text-center">

          {/* Lottie + icône de statut */}
          <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            {/* Orbe de fond */}
            <div
              className="absolute inset-0 rounded-full opacity-10 blur-xl"
              style={{ background: isSuccess ? "#1f4d3f" : "#ef4444" }}
            />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
              className="relative z-10 h-full w-full"
            >
              <Lottie
                animationData={isSuccess ? successAnimation : errorAnimation}
                loop={!isSuccess}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </motion.div>
          </div>

          {/* Titre principal */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
            className="mb-2 text-2xl font-black tracking-tight"
            style={{ color: text }}
          >
            {isSuccess ? "Paiement réussi ! 🎉" : "Échec du paiement"}
          </motion.h2>

          {/* Message descriptif */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-7 text-[14px] leading-relaxed"
            style={{ color: textMuted }}
          >
            {message || (isSuccess
              ? "Votre commande a été validée avec succès. Nous préparons sa livraison avec soin."
              : "Une erreur est survenue lors de la transaction. Veuillez vérifier votre solde ou réessayer.")}
          </motion.p>

          {/* ── Référence commande (succès uniquement) ── */}
          <AnimatePresence>
            {isSuccess && orderReference && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 24 }}
                className="mb-7 rounded-2xl px-5 py-4"
                style={{
                  background: isDark ? "rgba(31,77,63,0.12)" : "rgba(31,77,63,0.06)",
                  border: "1px solid rgba(31,77,63,0.15)",
                }}
              >
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#1f4d3f]/70">
                  Référence commande
                </p>
                <div className="flex items-center justify-center gap-3">
                  <p className="font-mono text-xl font-black text-[#1f4d3f]">
                    {orderReference}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-[#1f4d3f]/15 active:scale-95"
                    title="Copier la référence"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="h-4 w-4 text-[#1f4d3f]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="h-4 w-4 text-[#1f4d3f]/60" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 text-[11px] font-semibold text-[#1f4d3f]"
                  >
                    Référence copiée !
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bouton d'action ── */}
          <motion.button
            onClick={handleAction}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl py-4 font-black text-white shadow-xl transition-all active:scale-[0.98]"
            style={{
              background: isSuccess
                ? "linear-gradient(135deg, #1f4d3f 0%, #0f2018 100%)"
                : "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
              boxShadow: isSuccess
                ? "0 8px 32px -8px rgba(31,77,63,0.45)"
                : "0 8px 32px -8px rgba(220,38,38,0.4)",
            }}
          >
            {/* Shimmer */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative z-10 flex items-center gap-2 text-[15px]">
              {isSuccess ? (
                <>
                  Voir ma commande
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Réessayer
                </>
              )}
            </span>
          </motion.button>

          {/* ── Message de bas de page ── */}
          {isSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-4 text-[12px] font-medium"
              style={{ color: textMuted }}
            >
              Un e-mail de confirmation vous a été envoyé
            </motion.p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
