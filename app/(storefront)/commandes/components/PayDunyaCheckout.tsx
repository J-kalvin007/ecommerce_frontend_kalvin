/**
 * PayDunyaCheckout — Composant pour payer directement via PayDunya
 *
 * - Demande le numéro de téléphone
 * - Déclenche l'API `initiateDirectPayment`
 * - Redirige vers PayDunya
 *
 * @module components/commandes/PayDunyaCheckout
 */

"use client";

import React, { useState } from "react";
import { Loader2, Phone, AlertCircle, ExternalLink } from "lucide-react";
import { initiateDirectPayment } from "@/fonctions_api/wallets-paiements.api";
import { useThemeStore } from "@/store/theme.store";
import PhoneInputWithCountry from "@/components/special/PhoneInputWithCountry";

interface PayDunyaCheckoutProps {
  orderId: string;
  amount: number;
}

export default function PayDunyaCheckout({ orderId, amount }: PayDunyaCheckoutProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayer = async () => {
    if (!phone || phone.length < 8) {
      setError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await initiateDirectPayment({
        order_id: orderId,
        amount: String(amount),
        phone_number: phone,
      });

      if (res.ok) {
        // Redirection vers l'interface PayDunya dans le même onglet
        window.location.href = res.data.redirect_url;
      } else {
        setError(res.error.message || "Erreur lors de l'initiation du paiement avec PayDunya.");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f9f8";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div className="rounded-2xl p-6" style={{ background: bg, border: `1px solid ${border}` }}>
      <h3 className="mb-2 font-bold text-lg" style={{ color: text, fontFamily: "'Playfair Display', serif" }}>
        Paiement Mobile Money
      </h3>
      <p className="mb-6 text-sm" style={{ color: muted }}>
        Payez en toute sécurité via notre partenaire PayDunya. Saisissez votre numéro de compte Mobile Money.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
            Numéro Mobile Money <span className="text-[#1f4d3f]">*</span>
          </label>
          <PhoneInputWithCountry value={phone} onChange={setPhone} required />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handlePayer}
          disabled={loading || !orderId}
          className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#0f76b5" }} // Couleur PayDunya
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Payer avec PayDunya <ExternalLink className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
