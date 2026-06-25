/**
 * OrdersFilter.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Barre de filtre premium pour la liste des commandes.
 *
 * Permet au client de filtrer ses commandes par statut via des pills animées.
 * Affiche le nombre de commandes pour chaque statut.
 *
 * @module app/customer/commnades/components/OrdersFilter
 */

"use client";

import { motion } from "framer-motion";
import type { OrderStatus } from "@/modeles/commandes";
import type { OrderList } from "@/modeles/commandes";

/* ── Types ──────────────────────────────────────────────────────────────── */
export type FilterStatus = OrderStatus | "all";

/* ── Configuration des filtres ──────────────────────────────────────────── */
const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all",             label: "Toutes" },
  { value: "pending_payment", label: "En attente" },
  { value: "paid",            label: "Payées" },
  { value: "confirmed",       label: "Confirmées" },
  { value: "processing",      label: "En préparation" },
  { value: "shipped",         label: "Expédiées" },
  { value: "delivered",       label: "Livrées" },
  { value: "cancelled",       label: "Annulées" },
];

/* ── Props ──────────────────────────────────────────────────────────────── */
interface OrdersFilterProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  orders: OrderList[];
}

/**
 * OrdersFilter
 *
 * Pills de filtre scrollable horizontalement. Chaque pill affiche un badge
 * avec le nombre de commandes du statut correspondant.
 */
export default function OrdersFilter({
  activeFilter,
  onFilterChange,
  orders,
}: OrdersFilterProps) {
  /* ── Calcul des comptes par statut ──────────────────────────────────── */
  const getCount = (filter: FilterStatus): number => {
    if (filter === "all") return orders.length;
    return orders.filter((o) => o.status === filter).length;
  };

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Filtrer les commandes"
    >
      {FILTER_OPTIONS.map(({ value, label }) => {
        const count     = getCount(value);
        const isActive  = activeFilter === value;

        // On masque les filtres sans commandes (sauf "all")
        if (value !== "all" && count === 0) return null;

        return (
          <motion.button
            key={value}
            role="tab"
            aria-selected={isActive}
            aria-label={`${label} (${count})`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onFilterChange(value)}
            className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              isActive
                ? "bg-[#1f4d3f] text-white shadow-[0_4px_14px_-4px_rgba(31,77,63,0.35)]"
                : "bg-white border border-[#E8E3D8] text-[#8A9080] hover:border-[#1f4d3f]/20 hover:text-[#1f4d3f]"
            }`}
          >
            {label}
            {/* Badge compteur */}
            {count > 0 && (
              <span
                className={`flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#1f4d3f]/08 text-[#1f4d3f]"
                }`}
                style={{
                  height: 18,
                  minWidth: 18,
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(31,77,63,0.08)",
                  color: isActive ? "#fff" : "#1f4d3f",
                }}
              >
                {count}
              </span>
            )}

            {/* Indicateur actif animé */}
            {isActive && (
              <motion.div
                layoutId="filter-indicator"
                className="absolute inset-0 rounded-full bg-[#1f4d3f]"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
