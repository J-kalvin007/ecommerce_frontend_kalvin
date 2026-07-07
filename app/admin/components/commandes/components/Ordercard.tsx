



"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Calendar, ChevronRight, SlidersHorizontal,
  ChevronDown, ArrowUpRight, Check
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

/* -- Status pill ------------------------------------------------ */
function StatusPill({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap tracking-wide",
      cfg.bg, cfg.color, cfg.border
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

/* -- Status quick-change dropdown ------------------------------- */
function StatusDropdown({
  currentStatus,
  isUpdating,
  onSelect,
}: {
  currentStatus: OrderStatus;
  isUpdating: boolean;
  onSelect: (s: OrderStatus) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      // ⚠️ CRITICAL: stopPropagation prevents clicks inside the dropdown
      // from bubbling up to the card or to document listeners that would
      // close the dropdown immediately after opening it.
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-[calc(100%+8px)] z-[100] w-60 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          Changer le statut
        </p>
      </div>
      <div className="p-1.5">
        {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map(s => {
          const cfg = ORDER_STATUS_MAP[s];
          const isCurrent = s === currentStatus;
          return (
            <button
              key={s}
              type="button"
              disabled={isCurrent || isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(s);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                isCurrent
                  ? "cursor-not-allowed opacity-50 bg-slate-50 dark:bg-slate-800/50"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <span className={cn("flex items-center gap-2", isCurrent ? cfg.color : "text-slate-700 dark:text-slate-300")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.bg.replace("bg-", "bg-"), "border", cfg.border)} />
                {cfg.label}
              </span>
              {isCurrent && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                  <Check className="h-3 w-3" /> Actuel
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* -- Main OrderCard --------------------------------------------- */
export function OrderCard({ order, viewMode, onView, onStatusChange, isUpdating }: OrderCardProps) {
  const [showStatus, setShowStatus] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const itemCount = (order as any).items_count ?? "—";

  // ─── Close status dropdown on outside click ───────────────────────────────
  // NOTE: We listen to "click" (not "mousedown") intentionally.
  //
  // The ConfirmDialog overlay calls e.stopPropagation() on its "click" event.
  // If we used "mousedown" here, it would fire BEFORE stopPropagation kicks in,
  // causing the dropdown to close prematurely and buttons to appear unresponsive.
  //
  // By using "click", we ensure the full event chain (including stopPropagation
  // in any overlay/modal) is resolved first, so we only close the dropdown when
  // a genuine outside click reaches the document.
  useEffect(() => {
    if (!showStatus) return;

    function handleOutsideClick(event: MouseEvent) {
      // Guard: do not close if clicking an element with a higher z-index (e.g. modals)
      const target = event.target as HTMLElement;
      if (parseInt(window.getComputedStyle(target).zIndex) > 100) return;

      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowStatus(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowStatus(false);
    }

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showStatus]);

  const handleSelectStatus = (s: OrderStatus) => {
    setShowStatus(false);
    onStatusChange(s);
  };

  /* -- GRID card ----------------------------------------------- */
  if (viewMode === "grid") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D2E1E]/20 hover:shadow-xl hover:shadow-slate-900/[0.06] dark:border-slate-800 dark:bg-[#121212] dark:hover:border-slate-700"
      >
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {order.reference}
            </span>
            <StatusPill status={order.status} />
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {date}
            </span>
            <span className="font-medium">
              {itemCount} article(s)
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:white">
              {formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}
            </p>
          </div>

          <div className="flex gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sous-total</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Livraison</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}</p>
            </div>
          </div>

          <div ref={containerRef} className="mt-4 flex items-center justify-between gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatus(v => !v);
                }}
                aria-expanded={showStatus}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                  showStatus
                    ? "border-[#0D2E1E]/30 bg-[#0D2E1E]/5 text-[#0D2E1E] dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
                    onSelect={handleSelectStatus}
                  />
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0D2E1E] px-4 py-2 text-xs font-semibold text-gray-100 shadow-sm transition-all hover:bg-[#123d29] hover:shadow-md active:scale-[0.97] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Détails
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* -- LIST card ----------------------------------------------- */
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all duration-300 hover:border-[#0D2E1E]/20 hover:shadow-md hover:shadow-slate-900/[0.05] sm:flex-row dark:border-slate-800 dark:bg-[#121212] dark:hover:border-slate-700"
    >
      <div className="flex w-full min-w-0 flex-1 items-center gap-4 sm:w-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-[#0D2E1E]/10 dark:bg-slate-800">
          <Package className="h-5 w-5 text-slate-500 transition-colors group-hover:text-[#0D2E1E] dark:text-slate-400 dark:group-hover:text-slate-200" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm font-bold tracking-wide text-slate-900 dark:text-white">
              {order.reference}
            </p>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between sm:w-auto sm:gap-6 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}
          </p>
        </div>

        <div ref={containerRef} className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatus(v => !v);
              }}
              aria-expanded={showStatus}
              className={cn(
                "flex h-9 items-center cursor-pointer gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all",
                showStatus
                  ? "border-[#0D2E1E]/30 bg-[#0D2E1E]/5 text-[#0D2E1E] dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Statut</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showStatus && "rotate-180")} />
            </button>
            <AnimatePresence>
              {showStatus && (
                <StatusDropdown
                  currentStatus={order.status}
                  isUpdating={isUpdating}
                  onSelect={handleSelectStatus}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-[#0D2E1E] px-3 text-xs font-semibold text-gray-100 shadow-sm transition-all hover:bg-[#123d29] hover:shadow-md active:scale-[0.97] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <span className="hidden sm:inline">Détails</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}