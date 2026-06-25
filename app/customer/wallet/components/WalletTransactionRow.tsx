/**
 * WalletTransactionRow.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Ligne unitaire d'une transaction dans l'historique du wallet.
 *
 * Affiche : icône typée, référence, date, montant signé (+/-),
 * badge de statut coloré. Micro-animations hover élégantes.
 *
 * @module app/customer/wallet/components/WalletTransactionRow
 */

"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  CreditCard,
  Gift,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import type {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
} from "@/modeles/wallets-paiements";
import {
  WALLET_TRANSACTION_TYPE_LABELS,
} from "@/modeles/wallets-paiements";

/* ── Configuration des types de transactions ────────────────────────────── */

const TRANSACTION_TYPE_CONFIG: Record<
  WalletTransactionType,
  {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
    color: string;
    bg: string;
    border: string;
    sign: "+" | "-" | "";
  }
> = {
  deposit: {
    icon: ArrowUpRight,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.15)",
    sign: "+",
  },
  withdrawal: {
    icon: ArrowDownLeft,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.15)",
    sign: "-",
  },
  payment: {
    icon: CreditCard,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
    sign: "-",
  },
  refund: {
    icon: RefreshCcw,
    color: "#818cf8",
    bg: "rgba(129,140,248,0.08)",
    border: "rgba(129,140,248,0.15)",
    sign: "+",
  },
  cashback: {
    icon: Gift,
    color: "#C9963A",
    bg: "rgba(201,150,58,0.08)",
    border: "rgba(201,150,58,0.15)",
    sign: "+",
  },
};

/* ── Configuration des statuts de transactions ──────────────────────────── */

const TRANSACTION_STATUS_CONFIG: Record<
  WalletTransactionStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    label: "Réussi",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.15)",
  },
  pending: {
    icon: Clock,
    label: "En attente",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
  },
  failed: {
    icon: AlertCircle,
    label: "Échoué",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.15)",
  },
  cancelled: {
    icon: XCircle,
    label: "Annulé",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.15)",
  },
};

/* ── Utilitaires ─────────────────────────────────────────────────────────── */

function formatAmount(amount: string): string {
  const num = parseFloat(amount || "0");
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function truncateRef(ref: string, maxLength = 18): string {
  if (ref.length <= maxLength) return ref;
  return ref.slice(0, 8) + "…" + ref.slice(-6);
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface WalletTransactionRowProps {
  transaction: WalletTransaction;
  index: number;
}

/**
 * WalletTransactionRow
 *
 * Ligne de transaction avec icône typée, montant signé coloré,
 * badge de statut et animation d'entrée staggerée.
 */
export default function WalletTransactionRow({
  transaction,
  index,
}: WalletTransactionRowProps) {
  const typeConfig =
    TRANSACTION_TYPE_CONFIG[transaction.transaction_type] ??
    TRANSACTION_TYPE_CONFIG.payment;
  const statusConfig =
    TRANSACTION_STATUS_CONFIG[transaction.status] ??
    TRANSACTION_STATUS_CONFIG.pending;

  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;
  const amountFormatted = formatAmount(transaction.amount);
  const isCredit = typeConfig.sign === "+";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3.5 transition-all duration-200 hover:border-[#E8E3D8] hover:bg-[#FAFAF8]"
    >
      {/* Icône du type de transaction */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        style={{
          background: typeConfig.bg,
          border: `1px solid ${typeConfig.border}`,
        }}
      >
        <TypeIcon
          className="h-4.5 w-4.5"
          style={{ color: typeConfig.color, width: 18, height: 18 }}
          strokeWidth={2}
        />
      </div>

      {/* Infos de la transaction */}
      <div className="min-w-0 flex-1">
        {/* Ligne 1 : Type + Statut badge */}
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-bold text-[#1f241c]">
            {WALLET_TRANSACTION_TYPE_LABELS[transaction.transaction_type]}
          </span>
          <span
            className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            style={{
              color: statusConfig.color,
              background: statusConfig.bg,
              borderColor: statusConfig.border,
            }}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {statusConfig.label}
          </span>
        </div>

        {/* Ligne 2 : Référence + Date */}
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8A9080]">
          <span className="font-mono tracking-tight">
            {truncateRef(transaction.reference)}
          </span>
          <span>·</span>
          <span>{formatDate(transaction.created_at)}</span>
        </div>
      </div>

      {/* Montant signé */}
      <div className="shrink-0 text-right">
        <p
          className="text-[15px] font-black tracking-tight"
          style={{
            color: isCredit ? "#10b981" : "#ef4444",
          }}
        >
          {typeConfig.sign}
          {amountFormatted}
        </p>
        <p className="mt-0.5 text-[10px] text-[#8A9080]">FCFA</p>
      </div>
    </motion.div>
  );
}
