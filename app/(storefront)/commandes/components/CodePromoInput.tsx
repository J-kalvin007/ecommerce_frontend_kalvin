/**
 * CodePromoInput — Champ premium pour code promotionnel
 *
 * - Validation en temps réel via l'API validatePromoCode
 * - Animation de succès/erreur
 * - Gestion du chargement
 *
 * @module components/commandes/CodePromoInput
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
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
        // La validation côté serveur a échoué (ex: expiré, montant insuffisant)
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

  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f9f8";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {codeApplique ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-3 rounded-2xl p-4"
            style={{
              background: isDark ? "rgba(31,77,63,0.15)" : "rgba(31,77,63,0.05)",
              border: `1px solid ${isDark ? "rgba(31,77,63,0.3)" : "rgba(31,77,63,0.2)"}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4d3f]/10">
                <CheckCircle2 className="h-5 w-5 text-[#1f4d3f]" />
              </div>
              <div>
                <p className="font-bold text-[#1f4d3f]">
                  Code appliqué : {codeApplique.code}
                </p>
                <p className="text-xs" style={{ color: muted }}>
                  {codeApplique.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black tracking-tight text-[#1f4d3f]">
                -{formatCurrency(codeApplique.discount_amount, "FCFA")}
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-full p-2 hover:bg-[#1f4d3f]/10 transition-colors"
                title="Retirer le code"
              >
                <X className="h-4 w-4 text-[#1f4d3f]" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-4"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: text }}>
              <Tag className="h-4 w-4" /> Code promotionnel
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: BIENVENUE10"
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold tracking-wider outline-none transition-all placeholder:font-normal"
                style={{
                  background: inputBg,
                  border: `1px solid ${error ? "#ef4444" : border}`,
                  color: text,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={!code.trim() || loading}
                className="flex items-center justify-center rounded-xl px-6 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "#1f4d3f" }}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Appliquer"}
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
