/**
 * WalletSection — Interface Admin de gestion des Wallets & Paiements
 *
 * Page principale du module financier. Elle orchestre :
 *
 *  1. [KPI BAR]          — 4 métriques clés (solde plateforme, wallets actifs,
 *                          wallets bloqués, total transactions)
 *  2. [ONGLETS]          — "Wallets" / "Transactions" pour navigation contextuelle
 *  3. [WalletsTable]     — Liste et gestion des wallets utilisateurs
 *  4. [TransactionsTable]— Historique global et unifié de toutes les transactions
 *  5. [WalletStatusModal]— Modale de modification du statut d'un wallet
 *  6. [AdminWithdrawModal] — Modale de retrait Mobile Money administrateur
 *
 * Données : Toutes les données proviennent du backend Django DRF via les fonctions
 * API du module `fonctions_api/wallets-paiements.api.ts`.
 *
 * @module app/admin/components/wallets/WalletSection
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Wallet,
  Activity,
  TrendingUp,
  ShieldBan,
  RefreshCw,
  Download,
  Banknote,
  ChevronRight,
  AlertCircle,
  Loader2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

// Services API
import {
  getAdminAllWallets,
  getAdminAllTransactions,
} from "@/fonctions_api/wallets-paiements.api";

// Modèles
import type { AdminWallet, MyTransfer, PlatformStats } from "@/modeles/wallets-paiements";

// Sous-composants
import { WalletsTable } from "./components/WalletsTable";
import { TransactionsTable } from "./components/TransactionsTable";
import { WalletStatusModal } from "./components/WalletStatusModal";
import { AdminWithdrawModal } from "./components/AdminWithdrawModal";

/* ============================================================
   Animation Variants Framer Motion
   ============================================================ */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const kpiCard: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ============================================================
   Configuration des cartes KPI
   ============================================================ */
interface KpiConfig {
  title: string;
  getValue: (stats: PlatformStats, wallets: AdminWallet[]) => string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  iconBg: string;
  trend?: string;
}

const KPI_CONFIGS: KpiConfig[] = [
  {
    title: "Solde global plateforme",
    getValue: (stats) => formatCurrency(stats.totalBalance, "FCFA"),
    icon: TrendingUp,
    color: "text-primary",
    bgGradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/10 text-primary",
    trend: "Cumul de tous les wallets",
  },
  {
    title: "Wallets actifs",
    getValue: (stats) => stats.activeWallets.toString(),
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    trend: "Wallets en service",
  },
  {
    title: "Wallets suspendus / bloqués",
    getValue: (stats) => stats.inactiveWallets.toString(),
    icon: ShieldBan,
    color: "text-red-600 dark:text-red-400",
    bgGradient: "from-red-500/10 to-red-500/5",
    iconBg: "bg-red-500/10 text-red-600 dark:text-red-400",
    trend: "Nécessitent une attention",
  },
  {
    title: "Total transactions",
    getValue: (stats) => stats.totalTransactions.toLocaleString("fr-FR"),
    icon: Activity,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    trend: "Toutes transactions confondues",
  },
];

/* ============================================================
   Types des onglets de navigation
   ============================================================ */
type TabId = "wallets" | "transactions";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "wallets", label: "Wallets utilisateurs", icon: Wallet },
  { id: "transactions", label: "Historique des transactions", icon: Activity },
];

/* ============================================================
   Composant principal WalletSection
   ============================================================ */
export default function WalletSection() {
  /* --- State : données brutes du backend --- */
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [transactions, setTransactions] = useState<MyTransfer[]>([]);

  /* --- State : statut de chargement --- */
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorWallets, setErrorWallets] = useState<string | null>(null);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(null);

  /* --- State : UI --- */
  const [activeTab, setActiveTab] = useState<TabId>("wallets");
  const [walletToEdit, setWalletToEdit] = useState<AdminWallet | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /* ============================================================
     Chargement des données
     ============================================================ */

  /** Charge la liste des wallets depuis l'API Django */
  const fetchWallets = useCallback(async () => {
    setLoadingWallets(true);
    setErrorWallets(null);
    const result = await getAdminAllWallets();
    setLoadingWallets(false);
    if (result.ok) {
      setWallets(result.data);
    } else {
      setErrorWallets(result.error.message);
    }
  }, []);

  /** Charge l'historique global des transactions */
  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    const result = await getAdminAllTransactions();
    setLoadingTransactions(false);
    if (result.ok) {
      setTransactions(result.data);
    } else {
      setErrorTransactions(result.error.message);
    }
  }, []);

  /** Rafraîchit les deux sources de données */
  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchWallets(), fetchTransactions()]);
    setLastRefresh(new Date());
  }, [fetchWallets, fetchTransactions]);

  /* Chargement initial */
  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, [fetchWallets, fetchTransactions]);

  /* ============================================================
     Calcul des statistiques globales (côté frontend)
     ============================================================ */
  const stats = useMemo((): PlatformStats => {
    const totalBalance = wallets.reduce(
      (sum, w) => sum + parseFloat(w.balance || "0"),
      0
    );
    const activeWallets = wallets.filter((w) => w.status === "active").length;
    const inactiveWallets = wallets.filter(
      (w) => w.status === "suspendu" || w.status === "blocked"
    ).length;

    return {
      totalBalance,
      totalWallets: wallets.length,
      activeWallets,
      inactiveWallets,
      totalTransactions: transactions.length,
    };
  }, [wallets, transactions]);

  /* ============================================================
     Handlers métier
     ============================================================ */

  /** Appelé après une mise à jour de statut réussie → mise à jour locale */
  const handleWalletStatusUpdated = useCallback((updated: AdminWallet) => {
    setWallets((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w))
    );
    setWalletToEdit(null);
  }, []);

  /** Export CSV simple des wallets */
  const handleExportWallets = useCallback(() => {
    if (!wallets.length) return;
    const headers = ["ID", "Email", "Nom", "Solde (FCFA)", "Statut", "Créé le"];
    const rows = wallets.map((w) => [
      w.id,
      w.user_email,
      w.user_name,
      parseFloat(w.balance).toFixed(2),
      w.status,
      new Date(w.created_at).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallets_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [wallets]);

  /** Export CSV des transactions */
  const handleExportTransactions = useCallback(() => {
    if (!transactions.length) return;
    const headers = ["ID", "Type", "Fournisseur", "Montant (FCFA)", "Statut", "Référence", "Commande", "Date"];
    const rows = transactions.map((t) => [
      t.id,
      t.type_label,
      t.provider_label,
      parseFloat(t.amount).toFixed(2),
      t.status_label,
      t.reference_externe,
      t.order_reference || "",
      new Date(t.created_at).toLocaleString("fr-FR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  /* ============================================================
     Indicateur de chargement global
     ============================================================ */
  const isLoading = loadingWallets || loadingTransactions;

  /* ============================================================
     Rendu
     ============================================================ */
  return (
    <div className="min-h-full px-20 space-y-6 bg-white dark:bg-transparent p-1">
      {/* ─────────────────────────────────────────────────────── */}
      {/* SECTION 1 : En-tête de page                           */}
      {/* ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >








        {/* ── En-tête avec effet premium ── */}
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
              <Wallet className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Wallets & Paiements
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Gestion financière centralisée de la plateforme
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








        {/* Actions globales */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dernière mise à jour */}
          <p className="hidden text-xs text-slate-400 dark:text-slate-500 xl:block">
            Màj : {lastRefresh.toLocaleTimeString("fr-FR")}
          </p>

          {/* Rafraîchir */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            title="Rafraîchir les données"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-primary/30 hover:text-primary disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Rafraîchir</span>
          </button>

          {/* Export */}
          <button
            onClick={activeTab === "wallets" ? handleExportWallets : handleExportTransactions}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-primary/30 hover:text-primary"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>

          {/* Retrait Mobile Money */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:shadow-orange-500/40 active:translate-y-0"
          >
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Retrait Mobile Money</span>
          </button>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────── */}
      {/* SECTION 2 : Cartes KPI                                */}
      {/* ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {KPI_CONFIGS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              variants={kpiCard}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] p-5 shadow-sm transition-shadow hover:shadow-lg"
            >
              {/* Fond gradient décoratif */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  kpi.bgGradient
                )}
              />

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {kpi.title}
                  </p>
                  {loadingWallets && kpi.title !== "Total transactions" ? (
                    <div className="mt-2 h-8 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                  ) : loadingTransactions && kpi.title === "Total transactions" ? (
                    <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <p className={cn("mt-1.5 text-2xl font-extrabold tracking-tight", kpi.color)}>
                      {kpi.getValue(stats, wallets)}
                    </p>
                  )}
                  {kpi.trend && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <ChevronRight className="h-3 w-3" />
                      {kpi.trend}
                    </p>
                  )}
                </div>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", kpi.iconBg)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─────────────────────────────────────────────────────── */}
      {/* SECTION 3 : Onglets de navigation                     */}
      {/* ─────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === "wallets" ? wallets.length : transactions.length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {!isLoading && count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ─────────────────────────────────────────────────────── */}
      {/* SECTION 4 : Contenu principal (table selon l'onglet)  */}
      {/* ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "wallets" ? (
          <motion.div
            key="wallets-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* État d'erreur */}
            {/* {errorWallets && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Erreur de chargement des wallets
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">{errorWallets}</p>
                </div>
                <button
                  onClick={fetchWallets}
                  className="ml-auto cursor-pointer rounded-lg bg-red-100 dark:bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30"
                >
                  Réessayer
                </button>
              </div>
            )} */}

            {/* Indicateur de chargement */}
            {loadingWallets ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] py-20">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
                  <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Chargement des wallets...
                  </p>
                  <p className="text-xs text-slate-400">Connexion au backend Django</p>
                </div>
              </div>
            ) : (
              <>
                {/* Résumé rapide wallets */}
                <div className="mb-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-white">{wallets.length}</strong> wallet{wallets.length > 1 ? "s" : ""} au total
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      <strong>{stats.activeWallets}</strong> actif{stats.activeWallets > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-2">
                    <ShieldBan className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-400">
                      <strong>{stats.inactiveWallets}</strong> inactif{stats.inactiveWallets > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <WalletsTable
                  wallets={wallets}
                  onEditStatus={(wallet) => setWalletToEdit(wallet)}
                />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="transactions-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* État d'erreur */}
            {/* {errorTransactions && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Erreur de chargement des transactions
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">{errorTransactions}</p>
                </div>
                <button
                  onClick={fetchTransactions}
                  className="ml-auto cursor-pointer rounded-lg bg-red-100 dark:bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30"
                >
                  Réessayer
                </button>
              </div>
            )} */}

            {/* Indicateur de chargement */}
            {loadingTransactions ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] py-20">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
                  <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Chargement des transactions...
                  </p>
                  <p className="text-xs text-slate-400">Récupération de l'historique complet</p>
                </div>
              </div>
            ) : (
              <TransactionsTable transactions={transactions} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────── */}
      {/* MODALES                                               */}
      {/* ─────────────────────────────────────────────────────── */}

      {/* Modale de modification du statut d'un wallet */}
      <WalletStatusModal
        wallet={walletToEdit}
        onClose={() => setWalletToEdit(null)}
        onSuccess={handleWalletStatusUpdated}
      />

      {/* Modale de retrait Mobile Money admin */}
      <AdminWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={() => {
          // Rafraîchir les transactions après un retrait réussi
          fetchTransactions();
          setActiveTab("transactions");
        }}
      />
    </div>
  );
}
