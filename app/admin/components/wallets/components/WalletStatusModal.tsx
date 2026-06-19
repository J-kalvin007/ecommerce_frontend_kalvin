/**
 * WalletStatusModal — Modale de modification du statut d'un wallet
 *
 * Permet à l'admin de passer un wallet de "active" → "suspendu" ou "blocked".
 * Django impose une règle métier stricte : le solde doit être nul pour bloquer.
 *
 * @module app/admin/components/wallets/components/WalletStatusModal
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  ShieldOff,
  ShieldBan,
  AlertTriangle,
  Loader2,
  Wallet,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { updateWalletStatus } from "@/fonctions_api/wallets-paiements.api";
import type { AdminWallet, WalletStatus } from "@/modeles/wallets-paiements";

/* ============================================================
   Configuration des statuts (couleurs, icônes, libellés)
   ============================================================ */
const STATUS_CONFIG: Record<
  WalletStatus,
  { label: string; description: string; color: string; icon: React.ElementType; bg: string; border: string }
> = {
  active: {
    label: "Actif",
    description: "Le wallet fonctionne normalement. L'utilisateur peut envoyer et recevoir des fonds.",
    color: "text-emerald-600 dark:text-emerald-400",
    icon: ShieldCheck,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  suspendu: {
    label: "Suspendu",
    description: "Le wallet est temporairement suspendu. Les transactions sont bloquées mais le solde est conservé.",
    color: "text-amber-600 dark:text-amber-400",
    icon: ShieldOff,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  blocked: {
    label: "Bloqué",
    description: "Le wallet est définitivement bloqué. Uniquement possible si le solde est nul (règle Django).",
    color: "text-red-600 dark:text-red-400",
    icon: ShieldBan,
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  },
};

/* ============================================================
   Props
   ============================================================ */
interface WalletStatusModalProps {
  /** Wallet sélectionné à modifier (null → modale fermée) */
  wallet: AdminWallet | null;
  /** Callback de fermeture */
  onClose: () => void;
  /** Callback après mise à jour réussie */
  onSuccess: (updated: AdminWallet) => void;
}

/* ============================================================
   Composant principal
   ============================================================ */
export function WalletStatusModal({
  wallet,
  onClose,
  onSuccess,
}: WalletStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser la sélection à chaque ouverture d'un nouveau wallet
  const isOpen = !!wallet;

  /** Soumet la modification de statut à l'API Django */
  const handleSubmit = async () => {
    if (!wallet || !selectedStatus) return;
    setLoading(true);
    setError(null);

    const result = await updateWalletStatus(wallet.id, { status: selectedStatus });

    setLoading(false);
    if (result.ok) {
      onSuccess(result.data);
      setSelectedStatus(null);
    } else {
      // Django retourne 400 si le solde > 0 lors d'un blocage
      setError(result.error.message);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && wallet && (
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
            {/* Barre de couleur supérieure */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-primary via-primary/70 to-highlight" />

            {/* En-tête */}
            <div className="flex items-start justify-between p-6 pt-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Modifier le statut du wallet
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Compte de{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {wallet.user_name}
                  </span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Solde actuel */}
            <div className="mx-6 mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Solde actuel</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(parseFloat(wallet.balance), "FCFA")}
                </p>
              </div>
              <div className="ml-auto">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    STATUS_CONFIG[wallet.status].bg,
                    STATUS_CONFIG[wallet.status].color,
                    "border",
                    STATUS_CONFIG[wallet.status].border
                  )}
                >
                  {STATUS_CONFIG[wallet.status].label}
                </span>
              </div>
            </div>

            {/* Sélection du nouveau statut */}
            <div className="px-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choisir un nouveau statut
              </p>
              {(Object.keys(STATUS_CONFIG) as WalletStatus[]).map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                const isSelected = selectedStatus === status;
                const isCurrent = wallet.status === status;

                return (
                  <button
                    key={status}
                    onClick={() => !isCurrent && setSelectedStatus(status)}
                    disabled={isCurrent}
                    className={cn(
                      "w-full cursor-pointer flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                      isCurrent
                        ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
                        : isSelected
                          ? cn("ring-2 ring-primary/50", config.bg, config.border)
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        config.bg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-semibold", config.color)}>
                          {config.label}
                        </p>
                        {isCurrent && (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            ACTUEL
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Avertissement règle métier Django */}
            {selectedStatus === "blocked" && (
              <div className="mx-6 mt-4 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 border border-red-200 dark:border-red-500/30">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400">
                  Django refuse le blocage si le solde est supérieur à 0 FCFA.
                  Assurez-vous que le solde est nul avant de procéder.
                </p>
              </div>
            )}

            {/* Message d'erreur API */}
            {error && (
              <div className="mx-6 mt-3 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 border border-red-200 dark:border-red-500/30">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6">
              <button
                onClick={handleClose}
                className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedStatus || loading}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
