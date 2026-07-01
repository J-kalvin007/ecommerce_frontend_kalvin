/**
 * page.tsx — Portefeuille Client
 * -----------------------------------------------------------------------------
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
  /* -- État : Wallet ---------------------------------------------------- */
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* -- État : Transactions ---------------------------------------------- */
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  /* -- État : Modale d'action ------------------------------------------- */
  const [activeModal, setActiveModal] = useState<WalletActionMode | null>(null);

  /* -- État : Toast de notification ------------------------------------ */
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  /* -- Helpers ----------------------------------------------------------- */
  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      setToast({ show: true, type, message });
    },
    []
  );

  /* -- Fetch : Solde du wallet ------------------------------------------- */
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

  /* -- Fetch : Historique des transactions ------------------------------- */
  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    const result = await getMyWalletHistory();
    if (result.ok) {
      setTransactions(result.data);
    }
    // Pas d'erreur bloquante pour l'historique — la carte reste affichée
    setIsLoadingTransactions(false);
  }, []);

  /* -- Chargement initial en parallèle ---------------------------------- */
  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  /* -- Callback de succès d'action (refresh automatique) ---------------- */
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
      <div className="mx-auto max-w-8xl px-20 py-8 sm:px-6 lg:px-20 space-y-8">

        {/* -- En-tête avec effet premium -- */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="relative inline-block group">
            <h2
              className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
              style={{
                letterSpacing: "-0.025em",
                backgroundImage:
                  "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
                backgroundSize: "220% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <WalletIcon className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Mon Portefeuille
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Gérez votre solde, rechargez et consultez vos transactions.
            </span>

            {/* Gradient SVG caché pour l'icône */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>

            {/* Animations scoppées, avec respect du prefers-reduced-motion */}
            <style>{`
              @keyframes premium-title-shine-anim {
                0%, 100% { background-position: 0% center; }
                50% { background-position: 100% center; }
              }
              .premium-title-shine {
                animation: premium-title-shine-anim 6s ease-in-out infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .premium-title-shine {
                  animation: none;
                }
              }
            `}</style>
          </div>
        </motion.div>


















        {/* -- État chargement global -- */}
        {isLoadingWallet ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement de votre portefeuille…" size={16} />
          </div>
        ) : walletError ? (
          /* -- État erreur -- */
          <ErrorState
            title="Impossible de charger le wallet"
            message={walletError}
            buttonText="Réessayer"
            onRetry={() => fetchWallet()}
          />
        ) : wallet ? (
          /* -- Contenu principal -- */
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

      {/* -- Modale d'action (dépôt / remboursement) -- */}
      {activeModal && (
        <WalletActionModal
          isOpen={true}
          mode={activeModal}
          onClose={() => setActiveModal(null)}
          onSuccess={handleActionSuccess}
          walletId={wallet?.id}
        />
      )}

      {/* -- Toast de notification globale -- */}
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
