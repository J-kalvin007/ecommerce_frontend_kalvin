/**
 * ModaleRecharge — Modale premium pour recharger le wallet via PayDunya
 *
 * - Utilise le composant UI Dialog.tsx existant
 * - Formulaire de montant + téléphone
 * - Redirection vers PayDunya (nouvel onglet)
 *
 * @module components/commandes/ModaleRecharge
 */

"use client";

import React, { useState } from "react";
import { Loader2, Plus, Phone, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/special/Dialog";
import { depositWallet, getMyWallet } from "@/fonctions_api/wallets-paiements.api";
import { useThemeStore } from "@/store/theme.store";
import PhoneInputWithCountry from "@/components/special/PhoneInputWithCountry";

interface ModaleRechargeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  montantDefaut?: number;
}

export default function ModaleRecharge({ open, onOpenChange, montantDefaut = 5000 }: ModaleRechargeProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [amount, setAmount] = useState<string>(montantDefaut.toString());
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f9f8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recharger mon portefeuille</DialogTitle>
          <DialogDescription>
            Saisissez le montant et votre numéro Mobile Money. Vous serez redirigé vers PayDunya pour valider le paiement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 flex items-center text-sm font-semibold" style={{ color: text }}>
              Montant à recharger (FCFA)
            </label>
            <div
              className="flex items-center w-full rounded-xl px-4 transition-all focus-within:ring-2 focus-within:ring-[#1f4d3f]/50"
              style={{ background: inputBg, border: `1px solid ${border}` }}
            >
              <span className="text-base font-bold shrink-0 mr-3" style={{ color: muted }}>
                FCFA
              </span>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full py-3.5 text-lg font-bold outline-none bg-transparent"
                style={{ color: text }}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center text-sm font-semibold" style={{ color: text }}>
              Numéro de téléphone
            </label>
            <PhoneInputWithCountry
              value={phone}
              onChange={setPhone}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#1f4d3f" }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5" /> Confirmer la recharge
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
