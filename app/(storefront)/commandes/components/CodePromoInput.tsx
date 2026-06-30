/**
 * CodePromoInput — Champ premium pour code promotionnel
 *
 * - Validation en temps réel via l'API validatePromoCode
 * - Animations fluides et modernes (Framer Motion)
 * - Expérience Utilisateur (UX) de luxe, très détaillée
 * - Gestion du chargement
 *
 * @module components/commandes/CodePromoInput
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, X, Sparkles, TicketPercent, ArrowRight } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { validatePromoCode } from "@/fonctions_api/promotions.api";
import { formatCurrency } from "@/lib/utils";

export interface CodePromoApplique {
  code: string;
  type: string;
  value: string;
  discount_amount: string;
  description: string;
}

interface CodePromoInputProps {
  /** Sous-total du panier nécessaire pour valider le code */
  cartTotal: number;
  /** Code actuellement appliqué */
  codeApplique: CodePromoApplique | null;
  /** Callback quand un code est appliqué ou retiré */
  onCodeChange: (code: CodePromoApplique | null) => void;
}

export default function CodePromoInput({ cartTotal, codeApplique, onCodeChange }: CodePromoInputProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await validatePromoCode({
        code: code.trim(),
        cart_total: String(cartTotal),
      });

      if (res.ok && res.data.valid) {
        onCodeChange({
          code: res.data.code,
          type: res.data.type,
          value: res.data.value,
          discount_amount: res.data.discount_amount,
          description: res.data.description,
        });
        setCode("");
      } else {
        setError((res as any).error?.message || "Code invalide ou expiré");
      }
    } catch (err) {
      setError("Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onCodeChange(null);
    setCode("");
    setError(null);
  };

  // Couleurs et thèmes premium
  const bg = isDark ? "linear-gradient(145deg, rgba(22,25,22,1) 0%, rgba(18,20,18,1) 100%)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const shadow = isDark ? "0 10px 40px -10px rgba(0,0,0,0.5)" : "0 10px 40px -10px rgba(0,0,0,0.05)";
  const text = isDark ? "rgba(255,255,255,0.95)" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const inputBg = isDark ? "rgba(0,0,0,0.2)" : "#f9fafb";
  const brandColor = "#1f4d3f";

  // Animations Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.8 } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      scale: 0.98,
      transition: { duration: 0.2, ease: "easeInOut" } 
    }
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: { 
      opacity: 1, 
      height: "auto", 
      marginTop: 12,
      transition: { type: "spring", stiffness: 400, damping: 25 } 
    },
    exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {codeApplique ? (
          <motion.div
            key="applied"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
            style={{
              background: isDark 
                ? "linear-gradient(135deg, rgba(31,77,63,0.15) 0%, rgba(31,77,63,0.05) 100%)" 
                : "linear-gradient(135deg, rgba(31,77,63,0.08) 0%, rgba(31,77,63,0.02) 100%)",
              border: `1px solid ${isDark ? "rgba(31,77,63,0.3)" : "rgba(31,77,63,0.15)"}`,
              boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 8px 32px rgba(31,77,63,0.05)",
            }}
          >
            {/* Décoration d'arrière-plan */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#1f4d3f] opacity-5 blur-3xl" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm"
                     style={{ border: "1px solid rgba(31,77,63,0.1)" }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-[#1f4d3f]" />
                  </motion.div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#1f4d3f]">
                      {codeApplique.code}
                    </p>
                    <span className="flex h-5 items-center rounded-full bg-[#1f4d3f]/10 px-2 text-[10px] font-bold uppercase tracking-wider text-[#1f4d3f]">
                      Appliqué
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium" style={{ color: textMuted }}>
                    {codeApplique.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-[#1f4d3f]/10 pt-4 sm:border-0 sm:pt-0">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1f4d3f]/70">
                    Économie
                  </span>
                  <span className="text-lg font-black tracking-tight text-[#1f4d3f]">
                    -{formatCurrency(codeApplique.discount_amount, "FCFA")}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleRemove}
                  className="group relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-all hover:bg-red-50 hover:shadow-md"
                  style={{ border: "1px solid rgba(0,0,0,0.05)" }}
                  title="Retirer le code"
                >
                  <X className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-red-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative rounded-2xl p-5 sm:p-6 transition-all duration-300"
            style={{ 
              background: bg, 
              border: `1px solid ${isFocused ? (isDark ? "rgba(31,77,63,0.5)" : "rgba(31,77,63,0.3)") : border}`,
              boxShadow: isFocused ? "0 12px 40px -10px rgba(31,77,63,0.15)" : shadow,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <label className="flex items-center gap-2.5 text-sm font-bold tracking-wide" style={{ color: text }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1f4d3f]/10 text-[#1f4d3f]">
                  <TicketPercent className="h-4 w-4" />
                </div>
                Code promotionnel
              </label>
              <Sparkles className="h-4 w-4 text-[#1f4d3f]/40" />
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Entrez votre code..."
                className="w-full rounded-xl py-3.5 pl-4 pr-32 text-sm font-bold tracking-widest outline-none transition-all placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
                style={{
                  background: inputBg,
                  border: `1px solid ${error ? "#ef4444" : "transparent"}`,
                  color: text,
                  boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)"
                }}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
              />
              
              <div className="absolute right-1.5 flex items-center">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!code.trim() || loading}
                  className="group relative flex h-[38px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ 
                    background: !code.trim() ? (isDark ? "#333" : "#d1d5db") : brandColor,
                    color: !code.trim() && !isDark ? "#6b7280" : "#ffffff"
                  }}
                >
                  {/* Effet de brillance au survol si actif */}
                  {!!code.trim() && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  )}
                  
                  <span className="relative z-10 flex items-center gap-1.5">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Appliquer
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
