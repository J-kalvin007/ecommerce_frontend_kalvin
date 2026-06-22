/**
 * ModaleResultatPaiement — Modale de feedback après paiement
 *
 * - Affiche une animation Lottie (Succès ou Erreur)
 * - Message personnalisé selon le résultat
 * - Bloque la fermeture si le paiement a réussi (force la navigation)
 *
 * @module components/commandes/ModaleResultatPaiement
 */

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/special/Dialog";
import { useThemeStore } from "@/store/theme.store";

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

  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Empêcher la fermeture si succès, forcer le clic sur le bouton
      if (!isSuccess) onClose();
    }}>
      <DialogContent className="sm:max-w-md p-8 text-center">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
          <Lottie
            animationData={isSuccess ? successAnimation : errorAnimation}
            loop={!isSuccess} // Loop sur l'erreur, one-shot sur succès
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <h2 className="mb-2 text-2xl font-bold" style={{ color: text, fontFamily: "'Playfair Display', serif" }}>
          {isSuccess ? "Paiement réussi !" : "Échec du paiement"}
        </h2>
        
        <p className="mb-8 text-sm leading-relaxed" style={{ color: muted }}>
          {message || (isSuccess 
            ? "Votre commande a été validée avec succès. Nous préparons sa livraison avec soin." 
            : "Une erreur est survenue lors de la transaction. Veuillez vérifier votre solde ou réessayer.")}
        </p>

        {isSuccess && orderReference && (
          <div className="mb-8 rounded-xl bg-[#1f4d3f]/10 py-3">
            <p className="text-xs uppercase tracking-wider text-[#1f4d3f] font-bold">Référence commande</p>
            <p className="font-mono text-lg font-black text-[#1f4d3f] mt-1">{orderReference}</p>
          </div>
        )}

        <button
          onClick={handleAction}
          className="w-full rounded-xl py-3.5 font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
          style={{ background: isSuccess ? "#1f4d3f" : "#ef4444" }}
        >
          {isSuccess ? "Voir ma commande" : "Réessayer"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
