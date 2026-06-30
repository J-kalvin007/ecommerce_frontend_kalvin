/**
 * ModaleRecharge — Modale ultra-premium pour recharger le wallet via PayDunya
 *
 * - Montants rapides (raccourcis cliquables)
 * - Champ montant custom avec préfixe FCFA stylisé
 * - Indicateurs de confiance visuels
 * - AnimatePresence sur le message d'erreur
 * - Toute la logique métier intacte (depositWallet, getMyWallet)
 *
 * @module components/commandes/ModaleRecharge
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, AlertCircle, Wallet, ShieldCheck, Zap, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/special/Dialog";
import { depositWallet, getMyWallet } from "@/fonctions_api/wallets-paiements.api";
import { useThemeStore } from "@/store/theme.store";

interface ModaleRechargeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  montantDefaut?: number;
}

/** Montants rapides suggérés */
const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000] as const;

export default function ModaleRecharge({ open, onOpenChange, montantDefaut = 5000 }: ModaleRechargeProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [amount, setAmount] = useState<string>(montantDefaut.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Sélectionne un montant rapide */
  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setError("Le montant doit être supérieur à 100 FCFA");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Récupérer le walletId
      const walletRes = await getMyWallet();
      if (!walletRes.ok || !walletRes.data) {
        setError("Impossible de récupérer les informations de votre portefeuille.");
        setLoading(false);
        return;
      }

      const walletId = walletRes.data.id;

      // 2. Initier la recharge avec la nouvelle architecture
      const res = await depositWallet({
        order_id: walletId,
        amount: numAmount.toString(),
        description: "RECHARGE-WALLET",
      });

      if (res.ok) {
        // Redirection automatique vers PayDunya
        window.location.href = res.data.payment_url;
      } else {
        setError(res.error?.message || "Erreur lors de l'initiation de la recharge");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Tokens visuels
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const text = isDark ? "rgba(255,255,255,0.95)" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const numAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numAmount) && numAmount >= 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/* En-tête avec icône premium */}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1f4d3f]/10 shadow-sm"
                 style={{ border: "1px solid rgba(31,77,63,0.12)" }}>
              <Wallet className="h-6 w-6 text-[#1f4d3f]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight">
                Recharger mon portefeuille
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px]">
                Paiement sécurisé via PayDunya
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Montants rapides ── */}
          <div>
            <p className="mb-2.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
              Montants suggérés
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((val) => {
                const isSelected = amount === val.toString();
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="group relative overflow-hidden rounded-xl px-2 py-2.5 text-[13px] font-bold transition-all active:scale-95"
                    style={{
                      background: isSelected
                        ? "rgba(31,77,63,0.12)"
                        : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                      border: `1px solid ${isSelected ? "rgba(31,77,63,0.35)" : border}`,
                      color: isSelected ? "#1f4d3f" : text,
                    }}
                  >
                    {/* Shimmer au hover */}
                    {isSelected && (
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#1f4d3f]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    )}
                    <span className="relative z-10">
                      {val >= 1000 ? `${val / 1000}k` : val}
                    </span>
                    <span className="relative z-10 text-[10px] font-semibold opacity-70"> FCFA</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Champ montant custom ── */}
          <div>
            <label className="mb-2 block text-[13px] font-bold" style={{ color: text }}>
              Ou saisissez un montant personnalisé
            </label>
            <div
              className="flex items-center w-full rounded-xl px-4 transition-all focus-within:ring-2 focus-within:ring-[#1f4d3f]/30"
              style={{
                background: inputBg,
                border: `1px solid ${error ? "rgba(239,68,68,0.4)" : border}`,
              }}
            >
              <span className="mr-3 shrink-0 text-sm font-black" style={{ color: "#1f4d3f" }}>
                FCFA
              </span>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                className="w-full bg-transparent py-4 text-xl font-black outline-none"
                style={{ color: text }}
                placeholder="5000"
                required
              />
            </div>
            {isValidAmount && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1.5 text-[12px] font-semibold text-[#1f4d3f]"
              >
                ✓ {numAmount.toLocaleString("fr-FR")} FCFA seront crédités sur votre portefeuille
              </motion.p>
            )}
          </div>

          {/* ── Erreur animée ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-xl bg-red-500/10 px-4 py-3"
                     style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm font-semibold text-red-500">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bouton de confirmation ── */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || !isValidAmount}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl py-4 font-black text-white shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #1f4d3f 0%, #0f2018 100%)",
                boxShadow: "0 8px 32px -8px rgba(31,77,63,0.4)",
              }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative z-10 flex items-center gap-2.5 text-[15px]">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirection vers PayDunya…
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Confirmer la recharge
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </>
                )}
              </span>
            </button>

            {/* Trust badges sous le bouton */}
            <div className="mt-4 flex items-center justify-center gap-5">
              {[
                { icon: ShieldCheck, label: "Sécurisé" },
                { icon: Zap, label: "Instantané" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" style={{ color: textMuted }} />
                  <span className="text-[11px] font-semibold" style={{ color: textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
