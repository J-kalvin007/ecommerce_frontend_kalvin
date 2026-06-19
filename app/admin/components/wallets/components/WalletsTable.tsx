/**
 * WalletsTable — Table des wallets utilisateurs (vue admin)
 *
 * Affiche la liste paginée de tous les wallets avec :
 * - Informations propriétaire (nom, email)
 * - Solde actuel formaté
 * - Statut avec badge coloré
 * - Date de création / mise à jour
 * - Action de modification du statut
 *
 * @module app/admin/components/wallets/components/WalletsTable
 */

"use client";

import { useState, useMemo, Fragment } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  ShieldOff,
  ShieldBan,
  Edit3,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminWallet, WalletStatus } from "@/modeles/wallets-paiements";

/* ============================================================
   Configuration des badges de statut
   ============================================================ */
const STATUS_BADGE: Record<
  WalletStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  active: {
    label: "Actif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: ShieldCheck,
  },
  suspendu: {
    label: "Suspendu",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    icon: ShieldOff,
  },
  blocked: {
    label: "Bloqué",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    icon: ShieldBan,
  },
};

const PAGE_SIZE = 10;

/* ============================================================
   Props
   ============================================================ */
interface WalletsTableProps {
  wallets: AdminWallet[];
  onEditStatus: (wallet: AdminWallet) => void;
}

/* ============================================================
   Composant principal
   ============================================================ */
export function WalletsTable({ wallets, onEditStatus }: WalletsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WalletStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [sortByBalance, setSortByBalance] = useState<"asc" | "desc" | null>(null);

  /** Filtrage + tri local */
  const filtered = useMemo(() => {
    let result = wallets.filter((w) => {
      const matchSearch =
        w.user_name.toLowerCase().includes(search.toLowerCase()) ||
        w.user_email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || w.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (sortByBalance) {
      result = [...result].sort((a, b) => {
        const diff = parseFloat(a.balance) - parseFloat(b.balance);
        return sortByBalance === "asc" ? diff : -diff;
      });
    }

    return result;
  }, [wallets, search, statusFilter, sortByBalance]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = () => {
    setSortByBalance((prev) =>
      prev === null ? "desc" : prev === "desc" ? "asc" : null
    );
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilter = (val: WalletStatus | "all") => {
    setStatusFilter(val);
    setPage(1);
  };

  /* --- Format date lisible --- */
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] overflow-hidden shadow-sm">
      {/* Barre de filtres */}
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-700 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Recherche */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Nom ou email..."
            className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filtres statut */}
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "active", "suspendu", "blocked"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all",
                statusFilter === s
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {s === "all" ? "Tous" : STATUS_BADGE[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Utilisateur
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <button
                  onClick={toggleSort}
                  className="flex cursor-pointer items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  Solde
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortByBalance && (
                    <span className="text-[9px] text-primary">
                      {sortByBalance === "desc" ? "↓" : "↑"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Statut
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Créé le
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Mis à jour
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Wallet className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Aucun wallet trouvé
                    </p>
                    <p className="text-xs text-slate-400">
                      Essayez d'ajuster vos filtres
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((wallet, idx) => {
                const badge = STATUS_BADGE[wallet.status];
                const BadgeIcon = badge.icon;
                const balance = parseFloat(wallet.balance);

                return (
                  <motion.tr
                    key={wallet.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="group border-b border-slate-100 dark:border-slate-700/50 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  >
                    {/* Utilisateur */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary">
                          {wallet.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {wallet.user_name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {wallet.user_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Solde */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          balance > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400"
                        )}
                      >
                        {formatCurrency(balance, "FCFA")}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          badge.className
                        )}
                      >
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    </td>

                    {/* Créé le */}
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(wallet.created_at)}
                    </td>

                    {/* Mis à jour */}
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(wallet.updated_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onEditStatus(wallet)}
                        title="Modifier le statut"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Statut
                      </button>
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
            {filtered.length} wallet{filtered.length > 1 ? "s" : ""} •{" "}
            page {page}/{totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`ellipsis-${p}`} className="px-1 text-xs text-slate-400">…</span>
                  )}
                  <button
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
                </Fragment>
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
