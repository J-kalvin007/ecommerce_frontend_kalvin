/**
 * PayDunyaCheckout — Composant ultra-premium de paiement via PayDunya
 *
 * Corrections apportées :
 *  - Ouverture dans le MÊME onglet (window.location.href) au lieu de window.open
 *  - Stockage de la référence commande dans Zustand (uiStore.paymentOrderRef)
 *    avant la redirection, pour la récupérer sur la page de retour PayDunya
 *  - Suppression du clearCart immédiat (le panier est nettoyé sur la page de succès)
 *
 * UX :
 *  - Zone de confiance et indicateurs de sécurité
 *  - Animation de chargement progressive et shimmer au hover
 *  - Gestion d'erreur élégante avec AnimatePresence
 *
 * @module components/commandes/PayDunyaCheckout
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";
import { initiateDirectPayment } from "@/fonctions_api/wallets-paiements.api";
import { useThemeStore } from "@/store/theme.store";
import { formatCurrency } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

interface PayDunyaCheckoutProps {
  orderId: string;
  amount: number;
  /** Référence de la commande pour la stocker dans Zustand avant redirection */
  orderReference?: string;
}

/** Indicateurs de confiance affichés sous le bouton */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Paiement sécurisé SSL" },
  { icon: Lock, label: "Données chiffrées" },
  { icon: Zap, label: "Confirmation instantanée" },
] as const;

export default function PayDunyaCheckout({
  orderId,
  amount,
  orderReference,
}: PayDunyaCheckoutProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Zustand — pour stocker la référence commande avant redirection
  const setPaymentOrderRef = useUIStore((s) => s.setPaymentOrderRef);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayer = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        order_id: orderId,
        amount: String(amount),
        phone_number: "+22962693544",
      };

      const res = await initiateDirectPayment(payload);

      if (res.ok) {
        /**
         * Stockage de la référence commande dans Zustand AVANT la redirection.
         * PayDunya redirige l'utilisateur vers la page success/echec sans
         * transmettre la référence en paramètre URL — on la retrouvera donc
         * depuis le store persisté.
         */
        if (orderReference) {
          setPaymentOrderRef(orderReference);
        }

        // Redirection dans le MÊME onglet (comportement natif, pas de popup bloquée)
        window.location.href = res.data.payment_url;
      } else {
        setError(
          res.error.message ||
            "Erreur lors de l'initiation du paiement avec PayDunya."
        );
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // Tokens visuels
  const bg = isDark ? "rgba(10,12,10,0.95)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shadow = isDark
    ? "0 20px 60px -15px rgba(0,0,0,0.6)"
    : "0 20px 60px -15px rgba(0,0,0,0.06)";
  const text = isDark ? "rgba(255,255,255,0.95)" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  /** Couleur de la marque PayDunya */
  const PAYDUNYA_BLUE = "#0f76b5";

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ background: bg, border: `1px solid ${border}`, boxShadow: shadow }}
    >
      {/* Orbes décoratives */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-10"
        style={{ background: PAYDUNYA_BLUE }}
      />
      <div
        className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full blur-3xl opacity-5"
        style={{ background: PAYDUNYA_BLUE }}
      />

      {/* -- En-tête -- */}
      <div
        className="relative z-10 flex items-center gap-4 border-b px-6 py-5"
        style={{ borderColor: divider }}
      >
        {/* Logo PayDunya stylisé */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${PAYDUNYA_BLUE} 0%, #0a4a75 100%)`,
          }}
        >
          <Smartphone className="h-6 w-6 text-white" />
        </div>

        <div>
          <h3 className="text-base font-black tracking-tight" style={{ color: text }}>
            Paiement Mobile Money
          </h3>
          <p className="mt-0.5 text-[12px] font-medium" style={{ color: textMuted }}>
            Via PayDunya · Partenaire certifié
          </p>
        </div>

        {/* Badge SSL */}
        <div
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: isDark
              ? "rgba(15,118,181,0.12)"
              : "rgba(15,118,181,0.08)",
            border: "1px solid rgba(15,118,181,0.2)",
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#0f76b5]" />
          <span className="text-[11px] font-bold text-[#0f76b5] uppercase tracking-wider">
            SSL
          </span>
        </div>
      </div>

      {/* -- Corps -- */}
      <div className="relative z-10 space-y-6 px-6 py-6">

        {/* Montant récapitulatif */}
        <div
          className="flex items-center justify-between rounded-xl px-5 py-4"
          style={{
            background: isDark
              ? "rgba(15,118,181,0.08)"
              : "rgba(15,118,181,0.05)",
            border: "1px solid rgba(15,118,181,0.15)",
          }}
        >
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: textMuted }}
            >
              Montant à régler
            </p>
            <p className="mt-0.5 text-2xl font-black tracking-tight" style={{ color: PAYDUNYA_BLUE }}>
              {formatCurrency(String(amount), "FCFA")}
            </p>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "rgba(15,118,181,0.12)" }}
          >
            <ArrowRight className="h-5 w-5 text-[#0f76b5]" />
          </div>
        </div>

        {/* Message d'information */}
        <p className="text-[13px] leading-relaxed" style={{ color: textMuted }}>
          Cliquez sur le bouton ci-dessous pour être redirigé vers la plateforme
          sécurisée PayDunya. Choisissez votre opérateur Mobile Money (MTN, Moov,
          Wave…) et confirmez le paiement. Vous serez automatiquement ramené ici
          après le paiement.
        </p>

        {/* Erreur animée */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-start gap-3 rounded-xl bg-red-500/10 px-4 py-3"
                style={{ border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-semibold text-red-500">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -- Bouton principal -- */}
        <button
          onClick={handlePayer}
          disabled={loading || !orderId}
          className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl py-4 font-black text-white shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${PAYDUNYA_BLUE} 0%, #0a4a75 100%)`,
            boxShadow: `0 8px 32px -8px ${PAYDUNYA_BLUE}60`,
          }}
        >
          {/* Shimmer */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

          <span className="relative z-10 flex items-center gap-2.5 text-[15px]">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connexion à PayDunya…
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5" />
                Payer avec PayDunya
              </>
            )}
          </span>
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 pt-1">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: textMuted }} />
              <span
                className="hidden text-[11px] font-medium sm:block"
                style={{ color: textMuted }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
