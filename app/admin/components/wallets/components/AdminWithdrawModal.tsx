/**
 * AdminWithdrawModal — Modale de retrait Mobile Money administrateur
 *
 * Permet à l'admin d'initier un retrait de fonds vers un numéro mobile money
 * via l'API PayDunya.
 * Endpoint : POST /api/v1/paiements/admin/retrait-fonds/
 *
 * @module app/admin/components/wallets/components/AdminWithdrawModal
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  Banknote,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { adminWithdraw } from "@/fonctions_api/wallets-paiements.api";
import type { Payment } from "@/modeles/wallets-paiements";
import { PAYMENT_STATUS_LABELS } from "@/modeles/wallets-paiements";
import PhoneInputWithCountry from "@/components/special/PhoneInputWithCountry";

/* ============================================================
   Props
   ============================================================ */
interface AdminWithdrawModalProps {
  /** Contrôle l'affichage de la modale */
  isOpen: boolean;
  /** Callback de fermeture */
  onClose: () => void;
  /** Callback après retrait réussi */
  onSuccess?: (payment: Payment) => void;
}

/* ============================================================
   Composant principal
   ============================================================ */
export function AdminWithdrawModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminWithdrawModalProps) {
  // État du formulaire
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // État UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPayment, setSuccessPayment] = useState<Payment | null>(null);

  /** Réinitialise le formulaire et ferme la modale */
  const handleClose = () => {
    setAmount("");
    setPhone("");
    setDescription("");
    setError(null);
    setSuccessPayment(null);
    onClose();
  };

  /** Soumet le retrait à l'API Django → PayDunya */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await adminWithdraw({
      amount,
      phone_number: phone,
      description: description || undefined,
    });

    setLoading(false);
    if (result.ok) {
      setSuccessPayment(result.data);
      onSuccess?.(result.data);
    } else {
      setError(result.error.message);
    }
  };

  const isFormValid = amount && parseFloat(amount) > 0 && phone.trim().length >= 8;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Card modale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] shadow-2xl"
          >
            {/* Barre de couleur supérieure (orange = action financière) */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

            {/* En-tête */}
            <div className="flex items-center justify-between p-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Retrait Mobile Money
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Via PayDunya — Retrait administrateur
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenu : formulaire ou succès */}
            {successPayment ? (
              /* === État succès === */
              <div className="px-6 pb-6">
                <div className="flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-8 text-center border border-emerald-200 dark:border-emerald-500/30">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      Retrait initié !
                    </p>
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-500">
                      PayDunya traite votre demande
                    </p>
                  </div>
                  <div className="w-full space-y-2 rounded-xl bg-white dark:bg-slate-800 p-4 text-left border border-emerald-100 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Référence</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {successPayment.reference_externe}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Statut</span>
                      <span className="font-semibold text-amber-500">
                        {PAYMENT_STATUS_LABELS[successPayment.status]}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Montant</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {parseFloat(successPayment.amount).toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full cursor-pointer rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              /* === État formulaire === */
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                {/* Avertissement opération irréversible */}
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3 border border-amber-200 dark:border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Cette opération est irréversible. Le montant sera débité
                    immédiatement via PayDunya vers le numéro Mobile Money indiqué.
                  </p>
                </div>

                {/* Champ montant */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Montant (FCFA) *
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ex: 50000"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      FCFA
                    </span>
                  </div>
                </div>

                {/* Champ numéro de téléphone */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Numéro Mobile Money *
                  </label>
                  <PhoneInputWithCountry
                    value={phone}
                    onChange={setPhone}
                    required
                  />
                </div>

                {/* Description optionnelle */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Description (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={255}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Motif du retrait..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Message d'erreur API */}
                {error && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 border border-red-200 dark:border-red-500/30">
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading ? "Traitement..." : "Initier le retrait"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
