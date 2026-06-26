/**
 * page.tsx — Portefeuille Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Page principale de gestion du portefeuille (wallet) du client.
 * Intégrée dans le CustomerShell.
 *
 * Architecture de la page :
 *   1. Carte hero du solde (WalletBalanceCard)
 *   2. KPIs dérivés des transactions (WalletStats)
 *   3. Historique filtrable et paginé (WalletTransactionList)
 *
 * Orchestration :
 *   - Chargement parallèle du wallet et des transactions au montage
 *   - Toast de notification global
 *   - Modale d'action unifiée (dépôt / remboursement)
 *   - Gestion robuste des états : loading, erreur, vide
 *
 * @module app/customer/wallet/page
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon } from "lucide-react";

import CustomerShell from "@/app/customer/components/CustomerShell";
import ErrorState from "@/components/special/ErrorState";
import LoadingStyle from "@/components/special/loadingStyle";
import Toast from "@/components/special/Toast";

import {
  getMyWallet,
  getMyWalletHistory,
} from "@/fonctions_api/wallets-paiements.api";
import type {
  Wallet,
  WalletTransaction,
} from "@/modeles/wallets-paiements";

import WalletBalanceCard from "./components/WalletBalanceCard";
import WalletStats from "./components/WalletStats";
import WalletTransactionList from "./components/WalletTransactionList";
import WalletActionModal, {
  type WalletActionMode,
} from "./components/WalletActionModal";

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CustomerWalletPage() {
  /* ── État : Wallet ──────────────────────────────────────────────────── */
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ── État : Transactions ────────────────────────────────────────────── */
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  /* ── État : Modale d'action ─────────────────────────────────────────── */
  const [activeModal, setActiveModal] = useState<WalletActionMode | null>(null);

  /* ── État : Toast de notification ──────────────────────────────────── */
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      setToast({ show: true, type, message });
    },
    []
  );

  /* ── Fetch : Solde du wallet ─────────────────────────────────────────── */
  const fetchWallet = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoadingWallet(true);
      setWalletError(null);
    } else {
      setIsRefreshing(true);
    }

    const result = await getMyWallet();

    if (result.ok) {
      setWallet(result.data);
      if (silent) showToast("success", "Solde actualisé avec succès.");
    } else {
      setWalletError(
        result.error?.message || "Impossible de charger votre wallet."
      );
    }

    setIsLoadingWallet(false);
    setIsRefreshing(false);
  }, [showToast]);

  /* ── Fetch : Historique des transactions ─────────────────────────────── */
  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    const result = await getMyWalletHistory();
    if (result.ok) {
      setTransactions(result.data);
    }
    // Pas d'erreur bloquante pour l'historique — la carte reste affichée
    setIsLoadingTransactions(false);
  }, []);

  /* ── Chargement initial en parallèle ────────────────────────────────── */
  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  /* ── Callback de succès d'action (refresh automatique) ──────────────── */
  const handleActionSuccess = useCallback(
    (message: string) => {
      showToast("success", message);
      // Rafraîchir le solde et l'historique après toute opération réussie
      fetchWallet(true);
      fetchTransactions();
    },
    [showToast, fetchWallet, fetchTransactions]
  );

  /* ═══════════════════════════════════════════════════════════════════════
     Rendu
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <CustomerShell activeSection="wallet">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* ── En-tête ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f4d3f]/8 border border-[#1f4d3f]/12">
              <WalletIcon className="h-4.5 w-4.5 text-[#1f4d3f]" style={{ width: 18, height: 18 }} strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1f241c]">
              Mon Portefeuille
            </h1>
          </div>
          <p className="text-[14px] text-[#8A9080]">
            Gérez votre solde, rechargez et consultez vos transactions.
          </p>
        </motion.div>

        {/* ── État chargement global ── */}
        {isLoadingWallet ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement de votre portefeuille…" size={16} />
          </div>
        ) : walletError ? (
          /* ── État erreur ── */
          <ErrorState
            title="Impossible de charger le wallet"
            message={walletError}
            buttonText="Réessayer"
            onRetry={() => fetchWallet()}
          />
        ) : wallet ? (
          /* ── Contenu principal ── */
          <AnimatePresence mode="wait">
            <motion.div
              key="wallet-content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* 1. Carte hero du solde */}
              <WalletBalanceCard
                wallet={wallet}
                isRefreshing={isRefreshing}
                onDeposit={() => setActiveModal("deposit")}
                onRefund={() => setActiveModal("refund")}
                onRefresh={() => fetchWallet(true)}
              />

              {/* 2. KPIs des transactions */}
              {!isLoadingTransactions && transactions.length > 0 && (
                <WalletStats transactions={transactions} />
              )}

              {/* 3. Historique des transactions */}
              <WalletTransactionList
                transactions={transactions}
                isLoading={isLoadingTransactions}
              />
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      {/* ── Modale d'action (dépôt / remboursement) ── */}
      {activeModal && (
        <WalletActionModal
          isOpen={true}
          mode={activeModal}
          onClose={() => setActiveModal(null)}
          onSuccess={handleActionSuccess}
          walletId={wallet?.id}
        />
      )}

      {/* ── Toast de notification globale ── */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
        position="bottom-right"
      />
    </CustomerShell>
  );
}
