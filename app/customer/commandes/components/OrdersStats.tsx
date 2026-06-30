/**
 * OrdersStats.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Barre de statistiques premium en haut de la page commandes.
 *
 * Affiche 4 KPIs visuels :
 *   - Total commandes
 *   - Commandes livrées
 *   - En cours (toutes autres sauf annulées)
 *   - Montant total dépensé (calculé côté client sur les commandes livrées)
 *
 * @module app/customer/commnades/components/OrdersStats
 */

"use client";

import { motion } from "framer-motion";
import { Package, PackageCheck, RefreshCcw, TrendingUp } from "lucide-react";
import type { OrderList } from "@/modeles/commandes";

/* ── Utilitaires ────────────────────────────────────────────────────────── */

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface OrdersStatsProps {
  orders: OrderList[];
}

/**
 * OrdersStats
 *
 * Calcule et affiche les statistiques principales dérivées de la liste
 * de commandes du client. Chaque carte est animée en stagger.
 */
export default function OrdersStats({ orders }: OrdersStatsProps) {
  /* ── Calculs des KPIs ───────────────────────────────────────────────── */
  const total = orders.length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const inProgress = orders.filter(
    (o) => !["delivered", "cancelled", "refunded", "draft"].includes(o.status)
  ).length;
  const totalSpent = orders
    .filter((o) => o.status === "delivered")
    .reduce((acc, o) => acc + parseFloat(o.total_final || "0"), 0);

  const STATS = [
    {
      id: "total",
      label: "Total commandes",
      value: String(total),
      suffix: "commandes",
      icon: Package,
      color: "#1f4d3f",
      bg: "rgba(31,77,63,0.06)",
      border: "rgba(31,77,63,0.12)",
    },
    {
      id: "delivered",
      label: "Livrées",
      value: String(delivered),
      suffix: "livraisons",
      icon: PackageCheck,
      color: "#059669",
      bg: "rgba(5,150,105,0.06)",
      border: "rgba(5,150,105,0.12)",
    },
    {
      id: "progress",
      label: "En cours",
      value: String(inProgress),
      suffix: "en traitement",
      icon: RefreshCcw,
      color: "#d97706",
      bg: "rgba(217,119,6,0.06)",
      border: "rgba(217,119,6,0.12)",
    },
    {
      id: "spent",
      label: "Total dépensé",
      value: totalSpent > 0 ? formatAmount(totalSpent) : "—",
      suffix: "sur commandes livrées",
      icon: TrendingUp,
      color: "#C9963A",
      bg: "rgba(201,150,58,0.06)",
      border: "rgba(201,150,58,0.12)",
    },
  ] as const;

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      role="region"
      aria-label="Statistiques de vos commandes"
    >
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: idx * 0.07,
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-2xl border bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]"
            style={{
              borderColor: stat.border,
            }}
          >
            {/* Glow d'arrière-plan */}
            <div
              className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl"
              style={{ background: stat.bg }}
            />

            <div className="flex items-center justify-between">


              {/* Valeur */}
              <p
                className="text-[1.5rem] font-black leading-none tracking-tight"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>



              {/* Icône */}
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color, width: 20, height: 20 }} strokeWidth={1.75} />
              </div>

            </div>


            {/* Label */}
            <p className="mt-1 text-[16px] font-semibold text-[#8A9080]">
              {stat.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
