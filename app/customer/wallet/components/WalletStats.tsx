/**
 * WalletStats.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Grille de KPIs dérivés de l'historique des transactions wallet.
 *
 * Calcule côté client :
 *   - Total des dépôts (recharges)
 *   - Total des paiements
 *   - Total des remboursements
 *   - Nombre de transactions du mois courant
 *
 * @module app/customer/wallet/components/WalletStats
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, CalendarDays } from "lucide-react";
import type { WalletTransaction } from "@/modeles/wallets-paiements";

/* ── Utilitaires ────────────────────────────────────────────────────────── */

function formatAmount(amount: number): string {
  if (amount === 0) return "—";
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " FCFA"
  );
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface WalletStatsProps {
  transactions: WalletTransaction[];
}

/**
 * WalletStats
 *
 * Calcule et affiche les KPIs financiers en temps réel à partir
 * des transactions du wallet. Chaque carte est animée en stagger.
 */
export default function WalletStats({ transactions }: WalletStatsProps) {
  /* ── Calculs mémoïsés des KPIs ─────────────────────────────────────── */
  const stats = useMemo(() => {
    const successful = transactions.filter((t) => t.status === "success");

    const totalDeposits = successful
      .filter((t) => t.transaction_type === "deposit")
      .reduce((acc, t) => acc + parseFloat(t.amount || "0"), 0);

    const totalPayments = successful
      .filter((t) => t.transaction_type === "payment")
      .reduce((acc, t) => acc + parseFloat(t.amount || "0"), 0);

    const totalRefunds = successful
      .filter((t) => t.transaction_type === "refund")
      .reduce((acc, t) => acc + parseFloat(t.amount || "0"), 0);

    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { totalDeposits, totalPayments, totalRefunds, thisMonth };
  }, [transactions]);

  const KPIS = [
    {
      id: "deposits",
      label: "Total rechargé",
      value: formatAmount(stats.totalDeposits),
      icon: ArrowUpRight,
      color: "#10b981",
      bg: "rgba(16,185,129,0.07)",
      border: "rgba(16,185,129,0.14)",
      iconBg: "rgba(16,185,129,0.12)",
    },
    {
      id: "payments",
      label: "Total dépensé",
      value: formatAmount(stats.totalPayments),
      icon: ArrowDownLeft,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.07)",
      border: "rgba(245,158,11,0.14)",
      iconBg: "rgba(245,158,11,0.12)",
    },
    {
      id: "refunds",
      label: "Remboursements",
      value: formatAmount(stats.totalRefunds),
      icon: RefreshCcw,
      color: "#818cf8",
      bg: "rgba(129,140,248,0.07)",
      border: "rgba(129,140,248,0.14)",
      iconBg: "rgba(129,140,248,0.12)",
    },
    {
      id: "month",
      label: "Ce mois-ci",
      value:
        stats.thisMonth === 0
          ? "—"
          : `${stats.thisMonth} opération${stats.thisMonth > 1 ? "s" : ""}`,
      icon: CalendarDays,
      color: "#C9963A",
      bg: "rgba(201,150,58,0.07)",
      border: "rgba(201,150,58,0.14)",
      iconBg: "rgba(201,150,58,0.12)",
    },
  ] as const;

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      role="region"
      aria-label="Statistiques de votre portefeuille"
    >
      {KPIS.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: idx * 0.07,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-2xl border bg-white p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.08)]"
            style={{ borderColor: kpi.border }}
          >
            {/* Glow arrière-plan */}
            <div
              className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl"
              style={{ background: kpi.bg }}
            />

            {/* Icône */}
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: kpi.iconBg,
                border: `1px solid ${kpi.border}`,
              }}
            >
              <Icon
                style={{ color: kpi.color, width: 17, height: 17 }}
                strokeWidth={2}
              />
            </div>

            {/* Valeur */}
            <p
              className="truncate text-[1.05rem] font-black leading-tight tracking-tight"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>

            {/* Label */}
            <p className="mt-1 text-[11px] font-semibold text-[#8A9080]">
              {kpi.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
