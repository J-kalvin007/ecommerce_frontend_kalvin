/**
 * TransactionsTable — Historique global et unifié des transactions (vue admin)
 *
 * Affiche l'ensemble des transactions financières de la plateforme :
 * Wallet + PayDunya + Remboursements, fusionnées via MyTransfer.
 *
 * Fonctionnalités :
 * - Recherche par référence ou ID de commande
 * - Filtres par type et statut
 * - Pagination locale
 * - Badge de statut coloré
 * - Montant avec flèche directionnelle (entrant/sortant)
 *
 * @module app/admin/components/wallets/components/TransactionsTable
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MyTransfer } from "@/modeles/wallets-paiements";

/* ============================================================
   Configuration des badges de statut
   ============================================================ */
const STATUS_STYLE: Record<
  string,
  { className: string; dot: string }
> = {
  "Réussi":     { className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30", dot: "bg-emerald-500" },
  "En attente": { className: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30", dot: "bg-amber-500" },
  "Échoué":     { className: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30", dot: "bg-red-500" },
  "Annulé":     { className: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/30", dot: "bg-slate-400" },
  "Remboursé":  { className: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/30", dot: "bg-blue-500" },
};

const DEFAULT_STATUS_STYLE = { className: "text-slate-500 bg-slate-50 border-slate-200", dot: "bg-slate-400" };

/** Détermine l'icône directionnelle selon le type de transaction */
const getTypeIcon = (typeLabel: string) => {
  if (typeLabel.toLowerCase().includes("recharge") || typeLabel.toLowerCase().includes("dépôt")) {
    return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
  }
  if (typeLabel.toLowerCase().includes("remboursement")) {
    return <RefreshCcw className="h-4 w-4 text-blue-500" />;
  }
  if (typeLabel.toLowerCase().includes("retrait")) {
    return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
  }
  return <ArrowUpRight className="h-4 w-4 text-slate-400" />;
};

const PAGE_SIZE = 12;

/* ============================================================
   Props
   ============================================================ */
interface TransactionsTableProps {
  transactions: MyTransfer[];
}

/* ============================================================
   Hook : copie dans le presse-papier avec feedback visuel
   ============================================================ */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return { copied, copy };
}

/* ============================================================
   Composant principal
   ============================================================ */
export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { copied, copy } = useCopy();

  /* Récupérer les types uniques depuis les données */
  const uniqueTypes = useMemo(() => {
    const types = new Set(transactions.map((t) => t.type_label));
    return Array.from(types);
  }, [transactions]);

  /* Récupérer les statuts uniques depuis les données */
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(transactions.map((t) => t.status_label));
    return Array.from(statuses);
  }, [transactions]);

  /** Filtrage local */
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const searchLower = search.toLowerCase();
      const matchSearch =
        t.reference_externe.toLowerCase().includes(searchLower) ||
        (t.order_reference && t.order_reference.toLowerCase().includes(searchLower)) ||
        t.amount.includes(searchLower);
      const matchStatus = statusFilter === "all" || t.status_label === statusFilter;
      const matchType = typeFilter === "all" || t.type_label === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [transactions, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage(1); };
  const handleTypeFilter = (val: string) => { setTypeFilter(val); setPage(1); };

  /* Format date lisible */
  const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  /* Format montant avec couleur */
  const formatAmount = (amount: string, typeLabel: string) => {
    const num = parseFloat(amount);
    const isPositive =
      typeLabel.toLowerCase().includes("recharge") ||
      typeLabel.toLowerCase().includes("remboursement") ||
      typeLabel.toLowerCase().includes("cashback");

    return (
      <span
        className={cn(
          "text-sm font-bold",
          isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-700 dark:text-slate-300"
        )}
      >
        {isPositive ? "+" : ""}
        {num.toLocaleString("fr-FR")} FCFA
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] overflow-hidden shadow-sm">
      {/* Barre de filtres */}
      <div className="border-b border-slate-100 dark:border-slate-700 p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Recherche */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Référence ou commande..."
              className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Compteur résultats */}
          <p className="text-xs text-slate-400 shrink-0">
            {filtered.length} transaction{filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres statut */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-400 self-center">Statut :</span>
          {["all", ...uniqueStatuses].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all",
                statusFilter === s
                  ? "bg-primary text-white border-primary"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {s === "all" ? "Tous" : s}
            </button>
          ))}
        </div>

        {/* Filtres type */}
        {uniqueTypes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-400 self-center">Type :</span>
            {["all", ...uniqueTypes].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeFilter(t)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all",
                  typeFilter === t
                    ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {t === "all" ? "Tous" : t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              {["Type", "Fournisseur", "Montant", "Commande", "Référence externe", "Statut", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Receipt className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Aucune transaction trouvée
                    </p>
                    <p className="text-xs text-slate-400">
                      Essayez d'ajuster vos filtres
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((tx, idx) => {
                const statusStyle = STATUS_STYLE[tx.status_label] || DEFAULT_STATUS_STYLE;
                const copyKey = `ref-${tx.id}`;

                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.025 }}
                    className="group border-b border-slate-100 dark:border-slate-700/50 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  >
                    {/* Type */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          {getTypeIcon(tx.type_label)}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {tx.type_label}
                        </span>
                      </div>
                    </td>

                    {/* Fournisseur */}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {tx.provider_label}
                      </span>
                    </td>

                    {/* Montant */}
                    <td className="px-5 py-4">
                      {formatAmount(tx.amount, tx.type_label)}
                    </td>

                    {/* Commande */}
                    <td className="px-5 py-4">
                      {tx.order_reference ? (
                        <span className="font-mono text-xs text-primary">
                          {tx.order_reference}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Référence externe */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="max-w-[120px] truncate font-mono text-xs text-slate-400">
                          {tx.reference_externe || "—"}
                        </span>
                        {tx.reference_externe && (
                          <button
                            onClick={() => copy(tx.reference_externe, copyKey)}
                            className="cursor-pointer shrink-0 text-slate-300 dark:text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                            title="Copier la référence"
                          >
                            {copied === copyKey ? (
                              <CheckCheck className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          statusStyle.className
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                        {tx.status_label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDateTime(tx.created_at)}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-5 py-3">
          <p className="text-xs text-slate-400">
            Page {page}/{totalPages} — {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  page === p
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
