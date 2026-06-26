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





  // const handlePayer = async () => {

  //   // if (!phone || phone.length < 8) {
  //   //   setError("Veuillez saisir un numéro de téléphone valide.");
  //   //   return;
  //   // }

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const res = await initiateDirectPayment({
  //       order_id: orderId,
  //       amount: String(amount),
  //       // phone_number: phone,
  //       phone_number: "+22962693544",
  //     });

  //     console.

  //     if (res.ok) {
  //       // Redirection vers l'interface PayDunya dans le même onglet
  //       window.location.href = res.data.redirect_url;
  //     } else {
  //       setError(res.error.message || "Erreur lors de l'initiation du paiement avec PayDunya.");
  //     }
  //   } catch (err) {
  //     setError("Une erreur inattendue est survenue.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };














  const handlePayer = async () => {
    console.log("══════════════════════════════════════════════");
    console.log("💳 DÉBUT DU PROCESSUS DE PAIEMENT");
    console.log("══════════════════════════════════════════════");

    console.log("📌 Etat actuel avant traitement :");
    console.log("   • orderId :", orderId);
    console.log("   • amount :", amount);
    console.log("   • phone :", "+22962693544");

    // if (!phone || phone.length < 8) {
    //   console.warn("⚠️ Numéro de téléphone invalide.");
    //   setError("Veuillez saisir un numéro de téléphone valide.");
    //   return;
    // }

    console.log("⏳ Activation du loader...");
    setLoading(true);

    console.log("🧹 Suppression des anciennes erreurs...");
    setError(null);

    try {
      const payload = {
        order_id: orderId,
        amount: String(amount),
        phone_number: "+22962693544",
      };

      console.log("════════════════════════════════════");
      console.log("🚀 ENVOI DE LA REQUÊTE D'INITIATION");
      console.log("════════════════════════════════════");
      console.log("Payload envoyé :", payload);

      const res = await initiateDirectPayment(payload);

      console.log("════════════════════════════════════");
      console.log("📥 RÉPONSE REÇUE DE initiateDirectPayment()");
      console.log("════════════════════════════════════");

      console.log("Réponse complète :", res);

      if (res.ok) {
        console.log("✅ Paiement initié avec succès.");
        console.log("Informations retournées :");
        console.log("   • order_id :", res.data.order_id);
        console.log("   • success :", res.data.success);
        console.log("   • token :", res.data.token);
        console.log("   • payment_url :", res.data.payment_url);
        console.log("   • Données complètes  :", res.data);

        console.log("🌍 Redirection vers PayDunya...");
        console.log("URL :", res.data.payment_url);

        window.open(res.data.payment_url, "_blank", "noopener,noreferrer");

        console.log("➡️ Redirection demandée au navigateur.");
      } else {
        console.error("❌ L'API a retourné une erreur.");

        console.error("Status :", res.error.status);
        console.error("Message :", res.error.message);
        console.error("Réponse brute :", res.error.raw);

        setError(
          res.error.message ||
          "Erreur lors de l'initiation du paiement avec PayDunya."
        );
      }
    } catch (err) {
      console.error("════════════════════════════════════");
      console.error("💥 EXCEPTION CAPTURÉE");
      console.error("════════════════════════════════════");

      console.error("Erreur :", err);

      if (err instanceof Error) {
        console.error("erreur :", err);
        console.error("Nom :", err.name);
        console.error("Message :", err.message);
        console.error("Stack :", err.stack);
      }

      setError("Une erreur inattendue est survenue.");
    } finally {
      console.log("⏹ Désactivation du loader...");
      setLoading(false);

      console.log("════════════════════════════════════");
      console.log("🏁 FIN DU PROCESSUS DE PAIEMENT");
      console.log("════════════════════════════════════");
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
        {/* <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
            Numéro Mobile Money <span className="text-[#1f4d3f]">*</span>
          </label>
          <PhoneInputWithCountry value={phone} onChange={setPhone} required />
        </div> */}

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
