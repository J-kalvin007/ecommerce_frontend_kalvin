/**
 * RedeemPointsModal.tsx
 * -----------------------------------------------------------------------------
 * Modale pour dépenser des points de fidélité sur une commande.
 *
 * Permet à l'utilisateur de :
 *   1. Saisir l'UUID de la commande à payer
 *   2. Choisir un nombre de points à dépenser (avec validation max = solde)
 *   3. Visualiser la réduction estimée avant de confirmer
 *
 * @module app/customer/fidelites/components/RedeemPointsModal
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  ShoppingBag,
  Hash,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { redeemLoyaltyPoints } from "@/fonctions_api/fidelites.api";
import type { LoyaltyProfile, PointValue } from "@/modeles/fidelites";

/* -- Utilitaires ---------------------------------------------------------- */

function formatPoints(pts: number): string {
  return new Intl.NumberFormat("fr-FR").format(pts);
}

function formatAmount(amount: string): string {
  const num = parseFloat(amount || "0");
  if (isNaN(num)) return "0 FCFA";
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " FCFA"
  );
}

/* -- Props ---------------------------------------------------------------- */
interface RedeemPointsModalProps {
  isOpen: boolean;
  profile: LoyaltyProfile;
  pointValueConfig?: PointValue | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * RedeemPointsModal
 *
 * Formulaire de dépense de points avec validation max, saisie rapide
 * par pourcentage (25 / 50 / 75 / max) et aperçu de la réduction.
 */
export default function RedeemPointsModal({
  isOpen,
  profile,
  pointValueConfig,
  onClose,
  onSuccess,
}: RedeemPointsModalProps) {
  /* -- État du formulaire ------------------------------------------------ */
  const [orderId, setOrderId] = useState("");
  const [pointsToSpend, setPointsToSpend] = useState("");

  /* -- État de la soumission --------------------------------------------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* -- Points disponibles ------------------------------------------------ */
  const maxPoints = profile.points_balance;
  const parsedPoints = parseInt(pointsToSpend || "0", 10);
  const isValidPoints = parsedPoints > 0 && parsedPoints <= maxPoints;

  /* -- Estimation de la réduction (valeur du point + bonus grade) ------- */
  const estimatedDiscount = useMemo(() => {
    if (!isValidPoints) return null;
    const ratio = pointValueConfig && pointValueConfig.nombre_de_point > 0 
        ? pointValueConfig.valeur_un_point_frcfa / pointValueConfig.nombre_de_point 
        : 10;
    const baseDiscount = parsedPoints * ratio;
    const discountRate = parseFloat(profile.tier.discount_percent || "0") / 100;
    const discount = baseDiscount + (baseDiscount * discountRate);
    return formatAmount(String(discount));
  }, [parsedPoints, isValidPoints, profile.tier.discount_percent, pointValueConfig]);

  /* -- Réinitialisation à l'ouverture ----------------------------------- */
  useEffect(() => {
    if (isOpen) {
      setOrderId("");
      setPointsToSpend("");
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  /* -- Escape pour fermer ------------------------------------------------ */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isSubmitting, onClose]);

  /* -- Saisie rapide (% du solde) ---------------------------------------- */
  const setQuickAmount = useCallback(
    (fraction: number) => {
      const pts = Math.floor(maxPoints * fraction);
      setPointsToSpend(String(Math.max(1, pts)));
    },
    [maxPoints]
  );

  /* -- Soumission -------------------------------------------------------- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      if (!orderId.trim()) {
        setErrorMsg("Veuillez saisir l'identifiant de la commande.");
        return;
      }
      if (!isValidPoints) {
        setErrorMsg(
          parsedPoints <= 0
            ? "Saisissez un nombre de points valide."
            : `Vous ne disposez que de ${formatPoints(maxPoints)} pts.`
        );
        return;
      }

      setIsSubmitting(true);
      const result = await redeemLoyaltyPoints({
        order_id: orderId.trim(),
        points_to_spend: parsedPoints,
      });
      setIsSubmitting(false);

      if (result.ok) {
        onSuccess(
          `Succès ! ${formatPoints(result.data.points_spent)} pts dépensés — réduction de ${formatAmount(result.data.discount_amount)} appliquée.`
        );
        onClose();
      } else {
        setErrorMsg(
          result.error?.message || "Impossible d'effectuer l'opération."
        );
      }
    },
    [orderId, parsedPoints, isValidPoints, maxPoints, onSuccess, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={isSubmitting ? undefined : onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Carte de la modale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            style={{
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Barre décorative supérieure (couleur du grade) */}
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${profile.tier.name === "Gold" ? "#FFD700" : "#C9963A"}88, ${profile.tier.name === "Gold" ? "#FFD700" : "#C9963A"}, transparent)`,
              }}
            />

            {/* En-tête */}
            <div className="border-b border-[#F2EFE8] bg-[#FAFAF8] px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/50">
                  <Star className="h-5 w-5 text-amber-500" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-black tracking-tight text-[#1f241c]">
                    Utiliser mes points
                  </h2>
                  <p className="text-[12px] text-[#8A9080]">
                    Solde :{" "}
                    <span className="font-bold text-[#1f4d3f]">
                      {formatPoints(maxPoints)} pts
                    </span>{" "}
                    disponibles
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E8E3D8] bg-white text-[#8A9080] transition-colors hover:bg-[#F7F5F0] hover:text-[#1f241c] disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Corps */}
            <div className="px-6 py-6">
              {/* Message d'erreur */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-[12.5px] text-red-700">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Informations */}
                <div className="rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] px-4 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1f4d3f]" strokeWidth={1.75} />
                    <p className="text-[12.5px] text-[#4A5540] leading-relaxed">
                      Vos points seront convertis en réduction appliquée directement
                      sur le total de la commande sélectionnée.
                    </p>
                  </div>
                </div>

                {/* ID commande */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.08em] text-[#8A9080]">
                    Identifiant de la commande
                  </label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                    <input
                      type="text"
                      placeholder="UUID de la commande…"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E3D8] bg-white py-3 pl-10 pr-4 font-mono text-[13px] text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#1f4d3f]/10 placeholder:font-sans placeholder:text-[#8A9080]/60"
                    />
                  </div>
                </div>

                {/* Points à dépenser */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.08em] text-[#8A9080]">
                    Points à utiliser
                  </label>

                  {/* Saisie rapide */}
                  <div className="mb-2 grid grid-cols-4 gap-1.5">
                    {[
                      { label: "25%", fraction: 0.25 },
                      { label: "50%", fraction: 0.5 },
                      { label: "75%", fraction: 0.75 },
                      { label: "Max", fraction: 1 },
                    ].map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => setQuickAmount(q.fraction)}
                        disabled={maxPoints === 0}
                        className="rounded-xl border border-[#E8E3D8] bg-white py-2 text-[12px] font-bold text-[#1f4d3f] transition-all hover:border-[#1f4d3f]/30 hover:bg-[#1f4d3f]/5 disabled:opacity-30"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                    <input
                      type="number"
                      min="1"
                      max={maxPoints}
                      step="1"
                      placeholder={`1 – ${formatPoints(maxPoints)} pts`}
                      value={pointsToSpend}
                      onChange={(e) => setPointsToSpend(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E3D8] bg-white py-3 pl-10 pr-4 text-[14px] font-semibold text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#1f4d3f]/10 placeholder:font-normal placeholder:text-[#8A9080]/60"
                    />
                  </div>

                  {/* Aperçu de la réduction */}
                  <AnimatePresence>
                    {estimatedDiscount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200/60 px-4 py-2.5">
                          <span className="text-[12px] text-emerald-700">
                            Réduction estimée
                          </span>
                          <span className="text-[14px] font-black text-emerald-700">
                            ~{estimatedDiscount}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bouton de soumission */}
                <motion.button
                  whileHover={!isSubmitting ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSubmitting || maxPoints === 0}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, #C9963A 0%, #a37730 100%)",
                    boxShadow:
                      "0 8px 24px rgba(201,150,58,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Traitement en cours…
                    </>
                  ) : maxPoints === 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Aucun point disponible
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                      Confirmer la dépense
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
