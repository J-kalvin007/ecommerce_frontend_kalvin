/**
 * Liste des dernières commandes
 * @module app/admin/components/dashboard/components/RecentOrdersList
 */

"use client";

import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { OrderList } from "@/modeles/commandes";

interface RecentOrdersListProps {
  orders: OrderList[];
  loading?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  CONFIRMED: {
    label: "Confirmée",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  PREPARING: {
    label: "Préparation",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  },
  SHIPPED: {
    label: "Expédiée",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  DELIVERED: {
    label: "Livrée",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
};

export function RecentOrdersList({ orders, loading = false }: RecentOrdersListProps) {
  const displayOrders = orders.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex h-full flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Commandes récentes
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dernières commandes enregistrées
          </p>
        </div>
        <Link
          href="/admin?tab=commandes"
          className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Voir tout
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl p-3 animate-pulse bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Package className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Aucune commande
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Les nouvelles commandes apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayOrders.map((order) => {
              const status = STATUS_CONFIG[order.status] || {
                label: order.status,
                className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
              };
              const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const total = parseFloat(order.total_final);

              return (
                <div
                  key={order.id}
                  className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {order.client?.first_name || order.client?.email || "Client inconnu"}
                    </p> */}
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      Ref: <span className="font-mono text-primary">{order.reference}</span> • {date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(total, "FCFA")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
