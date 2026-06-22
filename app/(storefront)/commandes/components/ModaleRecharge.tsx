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
import { depositWallet } from "@/fonctions_api/wallets-paiements.api";
import { useThemeStore } from "@/store/theme.store";

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
    if (!phone || phone.length < 8) {
      setError("Veuillez saisir un numéro de téléphone valide");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await depositWallet({
        amount: numAmount.toString(),
        phone_number: phone,
      });

      if (res.ok) {
        // Redirection vers PayDunya dans un nouvel onglet
        window.open(res.data.redirect_url, "_blank");
        onOpenChange(false);
      } else {
        setError(res.error.message || "Erreur lors de l'initiation de la recharge");
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
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: muted }}>
                FCFA
              </span>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl py-3 pl-16 pr-4 text-lg font-bold outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center text-sm font-semibold" style={{ color: text }}>
              Numéro de téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: muted }} />
              <input
                type="tel"
                placeholder="Ex: 771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl py-3 pl-12 pr-4 outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                required
              />
            </div>
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
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
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
