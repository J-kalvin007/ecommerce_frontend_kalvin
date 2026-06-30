/**
 * WalletActionModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modale d'action unifiée pour les opérations sur le wallet.
 *
 * Gère deux modes distincts via la prop `mode` :
 *   - "deposit"  : Recharger le wallet via Mobile Money (PayDunya)
 *   - "refund"   : Demander un remboursement de commande
 *
 * Features :
 *   - Formulaire typé avec validation côté client
 *   - Montants prédéfinis pour le dépôt (quick-pick)
 *   - Animation d'entrée/sortie spring premium
 *   - Gestion complète des états loading / success / error
 *   - Lien de redirection automatique après dépôt (PayDunya redirect_url)
 *
 * @module app/customer/wallet/components/WalletActionModal
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  ArrowDownLeft,
  Phone,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import {
  depositWallet,
  refundOrder,
} from "@/fonctions_api/wallets-paiements.api";
import { getMyOrders } from "@/fonctions_api/commandes.api";
import type { OrderList } from "@/modeles/commandes";

/* ── Types ───────────────────────────────────────────────────────────────── */
export type WalletActionMode = "deposit" | "refund";

/* ── Montants rapides pour la recharge ──────────────────────────────────── */
const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

/* ── Utilitaires ────────────────────────────────────────────────────────── */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface WalletActionModalProps {
  isOpen: boolean;
  mode: WalletActionMode;
  onClose: () => void;
  onSuccess: (message: string) => void;
  walletId?: string;
}

/**
 * WalletActionModal
 *
 * Modale premium à deux modes (dépôt / remboursement) avec formulaires
 * validés, états de chargement élégants et confirmation de succès animée.
 */
export default function WalletActionModal({
  isOpen,
  mode,
  onClose,
  onSuccess,
  walletId,
}: WalletActionModalProps) {
  /* ── État du formulaire dépôt ────────────────────────────────────────── */
  const [depositAmount, setDepositAmount] = useState("");

  /* ── État du formulaire remboursement ───────────────────────────────── */
  const [refundOrderId, setRefundOrderId] = useState("");
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  /* ── État de la soumission ───────────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRedirectUrl, setSuccessRedirectUrl] = useState<string | null>(
    null
  );

  /* ── Réinitialisation à l'ouverture ─────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setDepositAmount("");
      setRefundOrderId("");
      setErrorMsg(null);
      setSuccessRedirectUrl(null);
      setIsSubmitting(false);

      if (mode === "refund") {
        const fetchOrders = async () => {
          setIsLoadingOrders(true);
          const res = await getMyOrders();
          if (res.ok && res.data) {
            setOrders(res.data);
          }
          setIsLoadingOrders(false);
        };
        fetchOrders();
      }
    }
  }, [isOpen, mode]);

  /* ── Gestion de la touche Escape ────────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isSubmitting, onClose]);

  /* ── Soumission du formulaire dépôt ─────────────────────────────────── */
  const handleDepositSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      if (!walletId) {
        setErrorMsg("Wallet introuvable. Veuillez recharger la page.");
        return;
      }

      const amount = parseFloat(depositAmount);
      if (!depositAmount || isNaN(amount) || amount < 100) {
        setErrorMsg("Le montant minimum est de 100 FCFA.");
        return;
      }

      setIsSubmitting(true);
      const result = await depositWallet({
        order_id: walletId,
        amount: String(amount),
        description: "RECHARGE-WALLET",
      });
      setIsSubmitting(false);

      if (result.ok) {
        setSuccessRedirectUrl(result.data.payment_url);
        onSuccess("Recharge initiée ! Vous allez être redirigé vers PayDunya.");
        window.location.href = result.data.payment_url;
      } else {
        setErrorMsg(
          result.error?.message ||
          "Impossible d'initier la recharge. Réessayez."
        );
      }
    },
    [depositAmount, walletId, onSuccess]
  );

  /* ── Soumission du formulaire remboursement ──────────────────────────── */
  const handleRefundSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      if (!refundOrderId.trim()) {
        setErrorMsg("Veuillez saisir l'identifiant de la commande.");
        return;
      }

      setIsSubmitting(true);
      const result = await refundOrder({ order_id: refundOrderId.trim() });
      setIsSubmitting(false);

      if (result.ok) {
        onSuccess(result.data.detail || "Remboursement traité avec succès.");
        onClose();
      } else {
        setErrorMsg(
          result.error?.message ||
          "Impossible de traiter le remboursement. Réessayez."
        );
      }
    },
    [refundOrderId, onSuccess, onClose]
  );

  /* ── Configuration visuelle par mode ─────────────────────────────────── */
  const config = {
    deposit: {
      title: "Recharger le Wallet",
      subtitle: "Via Mobile Money — PayDunya",
      icon: Plus,
      iconColor: "#10b981",
      iconBg: "rgba(16,185,129,0.1)",
      btnLabel: "Initier la recharge",
      btnColor: "#10b981",
    },
    refund: {
      title: "Demander un Remboursement",
      subtitle: "Remboursement sur une commande payée",
      icon: ArrowDownLeft,
      iconColor: "#818cf8",
      iconBg: "rgba(129,140,248,0.1)",
      btnLabel: "Demander le remboursement",
      btnColor: "#818cf8",
    },
  }[mode];

  const ModeIcon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ padding: "0" }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
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
            {/* Barre décorative supérieure */}
            {/* <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${config.iconColor}88, ${config.iconColor}, ${config.iconColor}88, transparent)`,
              }}
            /> */}

            {/* En-tête */}
            <div className="border-b border-[#F2EFE8] bg-[#FAFAF8] px-6 py-5">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: config.iconBg,
                    border: `1px solid ${config.iconColor}25`,
                  }}
                >
                  <ModeIcon
                    className="h-5 w-5"
                    style={{ color: config.iconColor }}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[22px] font-bold tracking-tight text-[#1f241c]">
                    {config.title}
                  </h2>
                  <p className="text-[14px] text-[#8A9080]">{config.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-xl border border-[#E8E3D8] bg-white text-[#8A9080] transition-colors hover:bg-[#F7F5F0] hover:text-[#1f241c] disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Corps du formulaire */}
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

              {/* URL de redirection PayDunya (succès dépôt) */}
              <AnimatePresence>
                {successRedirectUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-emerald-800">
                        Recharge initiée avec succès !
                      </p>
                      <a
                        href={successRedirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1.5 text-[14px] font-bold text-emerald-700 underline underline-offset-2"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Finaliser sur PayDunya
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FORMULAIRE DÉPÔT ── */}
              {mode === "deposit" && (
                <form onSubmit={handleDepositSubmit} className="space-y-5">
                  {/* Montants rapides */}
                  <div>
                    <label className="mb-2 block text-[14px] font-bold uppercase tracking-[0.08em] text-[#8A9080]">
                      Montant rapide
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(String(amt))}
                          className={`rounded-xl cursor-pointer border py-2.5 text-[14px] font-bold transition-all duration-200 ${depositAmount === String(amt)
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-[#E8E3D8] bg-white text-[#1f241c] hover:border-emerald-200 hover:bg-emerald-50/50"
                            }`}
                        >
                          {formatAmount(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Montant personnalisé */}
                  <div>
                    <label className="mb-1.5 block text-[14px] font-bold uppercase tracking-[0.08em] text-[#8A9080]">
                      Montant (FCFA)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                      <input
                        type="number"
                        min="100"
                        step="100"
                        placeholder="Ex : 5000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full rounded-xl border border-[#E8E3D8] bg-white py-3 pl-10 pr-4 text-[14px] font-semibold text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#1f4d3f]/10 placeholder:font-normal placeholder:text-[#8A9080]/60"
                      />
                    </div>
                  </div>



                  {/* Bouton de soumission */}
                  <motion.button
                    whileHover={!isSubmitting ? { scale: 1.01, y: -1 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow:
                        "0 8px 24px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement en cours…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        {config.btnLabel}
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* ── FORMULAIRE REMBOURSEMENT ── */}
              {mode === "refund" && (
                <form onSubmit={handleRefundSubmit} className="space-y-5">
                  {/* Information */}
                  <div className="rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-[#1f4d3f]" strokeWidth={1.75} />
                      <p className="text-[12.5px] text-[#4A5540] leading-relaxed">
                        Saisissez l'identifiant UUID de la commande pour laquelle
                        vous souhaitez demander un remboursement. Le montant sera
                        crédité sur votre wallet sous 24–48h.
                      </p>
                    </div>
                  </div>

                  {/* ID de commande */}
                  <div>
                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.08em] text-[#8A9080]">
                      Sélectionnez la commande
                    </label>
                    {isLoadingOrders ? (
                      <div className="flex items-center gap-2 py-3 px-4 rounded-xl border border-[#E8E3D8] bg-[#F7F5F0]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#1f4d3f]" />
                        <span className="text-[13px] text-[#8A9080]">Chargement de vos commandes...</span>
                      </div>
                    ) : (
                      <select
                        value={refundOrderId}
                        onChange={(e) => setRefundOrderId(e.target.value)}
                        className="w-full rounded-xl border border-[#E8E3D8] bg-white py-3 px-4 text-[13px] text-[#1f241c] outline-none transition-colors focus:border-[#818cf8] focus:ring-2 focus:ring-[#818cf8]/10 disabled:opacity-60 cursor-pointer"
                        required
                      >
                        <option value="" disabled>-- Choisissez une commande --</option>
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.reference} - {parseFloat(o.total_final || "0").toLocaleString('fr-FR')} FCFA ({o.status})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <motion.button
                    whileHover={!isSubmitting ? { scale: 1.01, y: -1 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
                      boxShadow:
                        "0 8px 24px rgba(129,140,248,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement en cours…
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="h-4 w-4" strokeWidth={2} />
                        {config.btnLabel}
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
