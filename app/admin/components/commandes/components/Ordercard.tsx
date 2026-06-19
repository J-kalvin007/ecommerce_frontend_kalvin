// app/admin/components/commandes/components/OrderCard.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Calendar, ChevronRight, SlidersHorizontal,
  ChevronDown, ArrowUpRight, Sparkles
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { OrderList, OrderStatus } from "@/modeles/commandes";
import { ORDER_STATUS_MAP } from "@/modeles/commandes";

interface OrderCardProps {
  order: OrderList;
  viewMode: "grid" | "list";
  onView: () => void;
  onStatusChange: (status: OrderStatus) => void;
  isUpdating: boolean;
}

/* ── Status pill ──────────────────────────────────────────────── */
function StatusPill({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
      cfg.bg, cfg.color, cfg.border
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.color.replace("text-", "bg-"))} />
      {cfg.label}
    </span>
  );
}

/* ── Status quick-change dropdown ─────────────────────────────── */
function StatusDropdown({
  currentStatus,
  isUpdating,
  onSelect,
  onClose,
}: {
  currentStatus: OrderStatus;
  isUpdating: boolean;
  onSelect: (s: OrderStatus) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-white-elevated shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Changer le statut</p>
      </div>
      {/* Options */}
      <div className="p-1.5">
        {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map(s => {
          const cfg = ORDER_STATUS_MAP[s];
          const isCurrent = s === currentStatus;
          return (
            <button
              key={s}
              disabled={isCurrent || isUpdating}
              onClick={() => { onSelect(s); onClose(); }}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                isCurrent
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-white-alt"
              )}
            >
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px]",
                isCurrent ? `${cfg.bg} ${cfg.border}` : "border-border bg-white group-hover:border-primary/30"
              )}>
                <span className={cn("h-2 w-2 rounded-full", isCurrent ? cfg.color.replace("text-", "bg-") : "bg-muted-foreground/30 group-hover:bg-primary/50")} />
              </span>
              <span className={cn(isCurrent ? cfg.color : "text-foreground/80")}>{cfg.label}</span>
              {isCurrent && <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground">Actuel</span>}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Main OrderCard ───────────────────────────────────────────── */
export function OrderCard({ order, viewMode, onView, onStatusChange, isUpdating }: OrderCardProps) {
  const [showStatus, setShowStatus] = useState(false);
  const cfg = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.pending_payment;
  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const itemCount = (order as any).items_count ?? "—";

  /* ── GRID card ─────────────────────────────────────────────── */
  if (viewMode === "grid") {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-white-elevated shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
      >
        {/* Top accent bar */}
        <div className={cn("absolute inset-x-0 top-0 h-px", cfg.bg.replace("/10", ""))} />

        {/* Shimmer on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        </div>

        {/* ── Image zone (left column feel: full width top half) ── */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-surface-alt to-surface">
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 24px,currentColor 24px,currentColor 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,currentColor 24px,currentColor 25px)"
          }} />
          {/* Floating icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-lg",
              cfg.bg, cfg.border
            )}>
              <Package className={cn("h-7 w-7", cfg.color)} />
            </div>
          </div>
          {/* Badge overlay — top-left */}
          <div className="absolute left-3 top-3">
            <StatusPill status={order.status} />
          </div>
          {/* Reference tag — top-right */}
          <div className="absolute right-3 top-3">
            <span className="rounded-xl border border-border/50 bg-white-elevated/80 px-2 py-1 font-mono text-[10px] font-bold text-foreground/70 backdrop-blur-sm">
              {order.reference}
            </span>
          </div>
        </div>

        {/* ── Info zone ── */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Date + items */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> {date}
            </span>
            <span className="rounded-lg border border-border/50 bg-white px-2 py-0.5 font-mono text-[10px] font-bold">
              {itemCount} art.
            </span>
          </div>

          {/* Amount */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}
            </p>
          </div>

          {/* Sub-amounts */}
          <div className="flex gap-4 border-t border-border/30 pt-3 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Articles</p>
              <p className="font-semibold text-foreground/80">{formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Livraison</p>
              <p className="font-semibold text-foreground/80">{formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center justify-between gap-2">
            {/* Status changer */}
            <div className="relative">
              <button
                onClick={() => setShowStatus(!showStatus)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all",
                  showStatus
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Statut
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", showStatus && "rotate-180")} />
              </button>
              <AnimatePresence>
                {showStatus && (
                  <StatusDropdown
                    currentStatus={order.status}
                    isUpdating={isUpdating}
                    onSelect={onStatusChange}
                    onClose={() => setShowStatus(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* View button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onView}
              className="group/btn relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2 text-[11px] font-black text-white shadow-md shadow-primary/30 transition-all hover:shadow-lg hover:shadow-primary/40"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-600" />
              Détails
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  }

  /* ── LIST card ─────────────────────────────────────────────── */
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white-elevated shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/15"
    >
      {/* Left accent stripe */}
      <div className={cn("absolute inset-y-0 left-0 w-0.5 rounded-r-full transition-all duration-300 group-hover:w-1", cfg.bg.replace("/10", ""))} />

      {/* Shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-white/3 via-transparent to-transparent" />
      </div>

      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:gap-0">

        {/* ── Left: image container + reference + status ── */}
        <div className="flex items-center gap-4 sm:flex-[2]">
          {/* Image / icon container */}
          <div className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 shadow-md transition-transform duration-300 group-hover:scale-105",
            cfg.bg, cfg.border
          )}>
            {/* Inner glow */}
            <div className={cn("absolute inset-0 rounded-2xl opacity-40", cfg.bg)} />
            <Package className={cn("relative h-6 w-6", cfg.color)} />
            {/* Sparkle on hover */}
            <div className="absolute -right-1 -top-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Sparkles className={cn("h-3 w-3", cfg.color)} />
            </div>
          </div>

          {/* Reference + Status + Date */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm font-extrabold tracking-tight text-foreground">
                {order.reference}
              </p>
              <StatusPill status={order.status} />
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              {date}
            </p>
          </div>
        </div>

        {/* ── Center: amounts ── */}
        <div className="flex items-center gap-6 sm:flex-1 sm:justify-center">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Articles</p>
            <p className="mt-0.5 text-sm font-bold text-foreground/80">
              {formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}
            </p>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Livraison</p>
            <p className="mt-0.5 text-sm font-bold text-foreground/80">
              {formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}
            </p>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="mt-0.5 text-lg font-extrabold text-primary">
              {formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}
            </p>
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center justify-end gap-2 sm:flex-none sm:pl-6">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatus(!showStatus)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all",
                showStatus
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Statut
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showStatus && "rotate-180")} />
            </button>
            <AnimatePresence>
              {showStatus && (
                <StatusDropdown
                  currentStatus={order.status}
                  isUpdating={isUpdating}
                  onSelect={onStatusChange}
                  onClose={() => setShowStatus(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Voir */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onView}
            className="group/btn relative flex h-9 items-center gap-1.5 overflow-hidden rounded-xl bg-primary px-4 text-[11px] font-black text-white shadow-md shadow-primary/30 transition-all hover:shadow-lg hover:shadow-primary/40"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-600" />
            Détails
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}