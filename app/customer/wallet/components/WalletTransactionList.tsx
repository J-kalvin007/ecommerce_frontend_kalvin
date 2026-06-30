/**
 * WalletTransactionList.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Liste complète des transactions du wallet avec filtrage, recherche et
 * basculement grille/liste.
 *
 * Fonctionnalités :
 *   - Filtre par type de transaction (all, deposit, payment, refund…)
 *   - Filtre par statut (all, success, pending, failed, cancelled)
 *   - Recherche par référence
 *   - Section de filtres avancés collapsible (tri par date/montant)
 *   - Pagination virtuelle (affichage progressif)
 *   - AnimatePresence pour les transitions de liste
 *
 * @module app/customer/wallet/components/WalletTransactionList
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  CreditCard,
  Gift,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
  Inbox,
} from "lucide-react";
import type { WalletTransaction } from "@/modeles/wallets-paiements";
import WalletTransactionRow from "./WalletTransactionRow";
import LoadingKalvin from "@/components/special/loadingKalvin";

/* ── Types internes ─────────────────────────────────────────────────────── */

type FilterType =
  | "all"
  | "deposit"
  | "withdrawal"
  | "payment"
  | "refund"
  | "cashback";

type FilterStatus = "all" | "success" | "pending" | "failed" | "cancelled";

type SortBy =
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc";

/* ── Configuration des filtres de type ─────────────────────────────────── */

const TYPE_FILTERS: Array<{
  value: FilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
    { value: "all", label: "Tout", icon: SlidersHorizontal, color: "#1f4d3f" },
    { value: "deposit", label: "Dépôts", icon: ArrowUpRight, color: "#10b981" },
    { value: "payment", label: "Paiements", icon: CreditCard, color: "#f59e0b" },
    { value: "refund", label: "Remboursements", icon: RefreshCcw, color: "#818cf8" },
    {
      value: "cashback",
      label: "Cashback",
      icon: Gift,
      color: "#C9963A",
    },
    {
      value: "withdrawal",
      label: "Retraits",
      icon: ArrowDownLeft,
      color: "#ef4444",
    },
  ];

/* ── Configuration des filtres de statut ───────────────────────────────── */

const STATUS_FILTERS: Array<{
  value: FilterStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
    { value: "all", label: "Tous statuts", icon: SlidersHorizontal, color: "#1f4d3f" },
    { value: "success", label: "Réussis", icon: CheckCircle2, color: "#10b981" },
    { value: "pending", label: "En attente", icon: Clock, color: "#f59e0b" },
    { value: "failed", label: "Échoués", icon: AlertCircle, color: "#ef4444" },
    { value: "cancelled", label: "Annulés", icon: XCircle, color: "#94a3b8" },
  ];

/* ── Constante de pagination ─────────────────────────────────────────────── */
const PAGE_SIZE = 10;

/* ── Props ──────────────────────────────────────────────────────────────── */
interface WalletTransactionListProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
}

/**
 * WalletTransactionList
 *
 * Liste paginée et filtrable de transactions avec barre de contrôles
 * premium (recherche + filtres type + filtres avancés collapsibles).
 */
export default function WalletTransactionList({
  transactions,
  isLoading,
}: WalletTransactionListProps) {
  /* ── État des filtres ────────────────────────────────────────────────── */
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ── Filtrage + tri mémoïsés ─────────────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => {
      if (filterType !== "all" && t.transaction_type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!t.reference.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy.startsWith("date")) {
        const dA = new Date(a.created_at).getTime();
        const dB = new Date(b.created_at).getTime();
        return sortBy === "date_desc" ? dB - dA : dA - dB;
      } else {
        const amA = parseFloat(a.amount || "0");
        const amB = parseFloat(b.amount || "0");
        return sortBy === "amount_desc" ? amB - amA : amA - amB;
      }
    });

    return result;
  }, [transactions, filterType, filterStatus, searchQuery, sortBy]);

  /* ── Transactions visibles (pagination progressive) ─────────────────── */
  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, visibleCount),
    [filteredTransactions, visibleCount]
  );

  const hasMore = visibleCount < filteredTransactions.length;

  /* ── Réinitialisation des filtres ────────────────────────────────────── */
  const handleResetFilters = useCallback(() => {
    setFilterType("all");
    setFilterStatus("all");
    setSearchQuery("");
    setSortBy("date_desc");
  }, []);

  /* ── Chargement suivant ──────────────────────────────────────────────── */
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  return (
    <section aria-label="Historique de vos transactions">
      {/* ── Titre de section ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[22px] md:text-[24px] xl:text-[26px] font-black tracking-tight text-[#1f241c]">
            Historique des transactions
          </h2>
          <p className="text-[14px] text-[#8A9080]">
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""} trouvée
            {filteredTransactions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Barre de contrôles ── */}
      <div className="sticky top-[72px] z-10 -mx-4 mb-4 border-b border-[#E8E3D8] bg-white/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4 sm:py-3 sm:backdrop-blur-none">
        {/* Rangée 1 : Filtres de type (chips scrollables) + Recherche + Filtres avancés */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Chips de type */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {TYPE_FILTERS.map((f) => {
              const Icon = f.icon;
              const isActive = filterType === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilterType(f.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[16px] font-semibold transition-all duration-200 ${isActive
                    ? "shadow-sm"
                    : "bg-[#F7F5F0] text-[#8A9080] hover:bg-[#EEE9E0] hover:text-[#1f241c]"
                    }`}
                  style={
                    isActive
                      ? {
                        background: f.color,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${f.color}40`,
                      }
                      : undefined
                  }
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Recherche + bouton filtres avancés */}
          <div className="flex shrink-0 items-center gap-2 ml-auto">
            <div className="relative w-44 sm:w-52">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8A9080]" />
              <input
                type="text"
                placeholder="Ref. transaction…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2 pl-9 pr-3 text-[15px] text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/15 placeholder:text-[#8A9080]/60"
              />
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex cursor-pointer items-center justify-center rounded-xl border p-2 transition-colors ${showAdvanced
                ? "border-[#1f4d3f] bg-[#1f4d3f] text-white"
                : "border-[#E8E3D8] bg-white text-[#1f241c] hover:bg-[#F7F5F0]"
                }`}
              title="Filtres avancés"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Section filtres avancés collapsible ── */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] p-4 space-y-4">
                {/* Filtre par statut */}
                <div>
                  <p className="mb-2 text-[14px] font-bold uppercase tracking-[0.1em] text-[#8A9080]">
                    Statut
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map((f) => {
                      const Icon = f.icon;
                      const isActive = filterStatus === f.value;
                      return (
                        <button
                          key={f.value}
                          onClick={() => {
                            setFilterStatus(f.value);
                            setVisibleCount(PAGE_SIZE);
                          }}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[14px] font-semibold transition-all duration-200 ${isActive
                            ? "shadow-sm"
                            : "border border-transparent bg-white text-[#8A9080] hover:text-[#1f241c]"
                            }`}
                          style={
                            isActive
                              ? {
                                background: f.color,
                                color: "#fff",
                                boxShadow: `0 3px 10px ${f.color}40`,
                              }
                              : undefined
                          }
                        >
                          <Icon className="h-4s w-4" />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trier par */}
                <div>
                  <p className="mb-2 text-[14px] font-bold uppercase tracking-[0.1em] text-[#8A9080]">
                    Trier par
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { value: "date_desc", label: "Plus récent", icon: Calendar },
                        { value: "date_asc", label: "Plus ancien", icon: Calendar },
                        {
                          value: "amount_desc",
                          label: "Montant ↓",
                          icon: DollarSign,
                        },
                        {
                          value: "amount_asc",
                          label: "Montant ↑",
                          icon: DollarSign,
                        },
                      ] as Array<{
                        value: SortBy;
                        label: string;
                        icon: React.ComponentType<{ className?: string }>;
                      }>
                    ).map((s) => {
                      const Icon = s.icon;
                      const isActive = sortBy === s.value;
                      return (
                        <button
                          key={s.value}
                          onClick={() => setSortBy(s.value)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[14px] font-semibold transition-all duration-200 ${isActive
                            ? "border-[#1f4d3f] bg-white text-[#1f4d3f] shadow-sm"
                            : "border-transparent bg-white text-[#8A9080] hover:border-[#E8E3D8] hover:text-[#1f241c]"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Liste des transactions ── */}
      <div className="rounded-2xl border border-[#E8E3D8] bg-white overflow-hidden">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            /* État de chargement */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="inline-flex flex-col items-center gap-3">
                <LoadingKalvin message="Chargement des transactions…" />
              </div>
            </motion.div>
          ) : filteredTransactions.length === 0 ? (
            /* État vide */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-14 px-6 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F5F0] border border-[#E8E3D8]">
                <Inbox className="h-7 w-7 text-[#8A9080]" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-bold text-[#1f241c]">
                Aucune transaction
              </p>
              <p className="mt-1 text-[12px] text-[#8A9080]">
                Aucune transaction ne correspond à vos critères.
              </p>
              {(filterType !== "all" ||
                filterStatus !== "all" ||
                searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 rounded-xl cursor-pointer bg-[#F7F5F0] px-4 py-2 text-[12px] font-semibold text-[#1f4d3f] transition-colors hover:bg-[#EEE9E0]"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
            </motion.div>
          ) : (
            /* Liste filtrée */
            <motion.div key="list">
              <div className="divide-y divide-[#F2EFE8] px-2">
                {visibleTransactions.map((transaction, idx) => (
                  <WalletTransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    index={idx}
                  />
                ))}
              </div>

              {/* Bouton "Voir plus" */}
              {hasMore && (
                <div className="border-t border-[#E8E3D8] px-4 py-3 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-[14px] font-semibold text-[#8A9080] transition-colors hover:bg-[#F7F5F0] hover:text-[#1f241c]"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Voir plus ({filteredTransactions.length - visibleCount}{" "}
                    restante{filteredTransactions.length - visibleCount > 1 ? "s" : ""})
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
