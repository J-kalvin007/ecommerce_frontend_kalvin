/**
 * LoyaltyHistoryList.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Historique filtrable des événements de points de fidélité.
 *
 * Fonctionnalités :
 *   - Filtre par raison (purchase, refund, bonus, etc.)
 *   - Filtre par direction (gain / dépense)
 *   - Section filtres avancés collapsible
 *   - Montant delta signé et coloré (+/-)
 *   - Badge de raison typé
 *   - Pagination progressive (10 par 10)
 *   - Animations staggerées à l'entrée
 *
 * @module app/customer/fidelites/components/LoyaltyHistoryList
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  RotateCcw,
  Users,
  Star,
  Clock,
  Settings,
  Percent,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Search,
  ChevronDown,
  Inbox,
  Calendar,
  Hash,
  Grid,
  List,
} from "lucide-react";
import type { LoyaltyEvent, LoyaltyEventReason } from "@/modeles/fidelites";
import { LOYALTY_EVENT_LABELS } from "@/modeles/fidelites";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/special/EmptyState";

/* ── Map des icônes d'événements ────────────────────────────────────────── */
const EVENT_ICONS: Record<LoyaltyEventReason, React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>> = {
  purchase: ShoppingBag,
  refund: RotateCcw,
  referral_bonus: Users,
  first_purchase: Star,
  birthday_bonus: Star,
  points_expiry: Clock,
  admin_adjustment: Settings,
  order_discount: Percent,
};

/* ── Configuration couleurs d'événements ─────────────────────────────────── */
const EVENT_COLORS: Record<LoyaltyEventReason, { color: string; bg: string; border: string }> = {
  purchase: { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
  refund: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
  referral_bonus: { color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.15)" },
  first_purchase: { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
  birthday_bonus: { color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.15)" },
  points_expiry: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)" },
  admin_adjustment: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
  order_discount: { color: "#06b6d4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
};

/* ── Types internes ──────────────────────────────────────────────────────── */
type FilterReason = "all" | LoyaltyEventReason;
type FilterDirection = "all" | "gain" | "depense";
type SortBy = "date_desc" | "date_asc" | "points_desc" | "points_asc";

const PAGE_SIZE = 12;

/* ── Utilitaires ─────────────────────────────────────────────────────────── */
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

/* ── Props ──────────────────────────────────────────────────────────────── */
interface LoyaltyHistoryListProps {
  events: LoyaltyEvent[];
  isLoading: boolean;
}

/**
 * LoyaltyHistoryList
 *
 * Journal des événements de points avec filtres avancés, tri,
 * et pagination progressive animée.
 */
export default function LoyaltyHistoryList({
  events,
  isLoading,
}: LoyaltyHistoryListProps) {
  /* ── État des filtres ────────────────────────────────────────────────── */
  const [filterReason, setFilterReason] = useState<FilterReason>("all");
  const [filterDirection, setFilterDirection] = useState<FilterDirection>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  /* ── Filtrage + tri mémoïsés ─────────────────────────────────────────── */
  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => {
      if (filterReason !== "all" && e.reason !== filterReason) return false;
      if (filterDirection === "gain" && e.points_delta <= 0) return false;
      if (filterDirection === "depense" && e.points_delta >= 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchReason = e.reason_display?.toLowerCase().includes(q);
        if (!matchDesc && !matchReason) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy.startsWith("date")) {
        const dA = new Date(a.created_at).getTime();
        const dB = new Date(b.created_at).getTime();
        return sortBy === "date_desc" ? dB - dA : dA - dB;
      } else {
        const ptA = Math.abs(a.points_delta);
        const ptB = Math.abs(b.points_delta);
        return sortBy === "points_desc" ? ptB - ptA : ptA - ptB;
      }
    });

    return result;
  }, [events, filterReason, filterDirection, searchQuery, sortBy]);

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount]
  );

  const hasMore = visibleCount < filteredEvents.length;

  const handleReset = useCallback(() => {
    setFilterReason("all");
    setFilterDirection("all");
    setSearchQuery("");
    setSortBy("date_desc");
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  /* ── Raisons disponibles dans les données ───────────────────────────── */
  const availableReasons = useMemo(() => {
    const reasons = new Set(events.map((e) => e.reason));
    return Array.from(reasons);
  }, [events]);

  return (
    <section aria-label="Journal des événements de fidélité">
      {/* ── Titre ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-black tracking-tight text-[#1f241c]">
            Journal des événements
          </h2>
          <p className="text-[13px] text-[#8A9080]">
            {filteredEvents.length} événement{filteredEvents.length !== 1 ? "s" : ""} trouvé
            {filteredEvents.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Toggle vue */}
        <div className="flex items-center rounded-xl bg-[#F7F5F0] border border-[#E8E3D8] p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer",
              viewMode === "list" ? "bg-white text-[#1f4d3f] shadow-sm" : "text-[#8A9080] hover:text-[#1f241c]"
            )}
            title="Vue liste"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer",
              viewMode === "grid" ? "bg-white text-[#1f4d3f] shadow-sm" : "text-[#8A9080] hover:text-[#1f241c]"
            )}
            title="Vue grille"
          >
            <Grid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Barre de contrôles ── */}
      <div className="sticky top-[72px] z-10 -mx-4 mb-4 border-b border-[#E8E3D8] bg-white/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Filtre direction (Gains / Dépenses) */}
          <div className="flex gap-1.5">
            {(
              [
                { value: "all", label: "Tout", color: "#1f4d3f" },
                { value: "gain", label: "Gains", color: "#10b981", icon: ArrowUp },
                { value: "depense", label: "Dépenses", color: "#ef4444", icon: ArrowDown },
              ] as Array<{ value: FilterDirection; label: string; color: string; icon?: React.ComponentType<{ className?: string }> }>
            ).map((f) => {
              const Icon = f.icon;
              const isActive = filterDirection === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilterDirection(f.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[14px] font-semibold transition-all duration-200 cursor-pointer ${isActive
                      ? "shadow-sm"
                      : "bg-[#F7F5F0] text-[#8A9080] hover:bg-[#EEE9E0] hover:text-[#1f241c]"
                    }`}
                  style={
                    isActive
                      ? { background: f.color, color: "#fff", boxShadow: `0 4px 12px ${f.color}40` }
                      : undefined
                  }
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Recherche + filtres avancés */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative w-44 sm:w-52">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8A9080]" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2 pl-9 pr-3 text-[14px] text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/15 placeholder:text-[#8A9080]/60"
              />
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-center rounded-xl border p-2 transition-colors cursor-pointer ${showAdvanced
                  ? "border-[#1f4d3f] bg-[#1f4d3f] text-white"
                  : "border-[#E8E3D8] bg-white text-[#1f241c] hover:bg-[#F7F5F0]"
                }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Filtres avancés collapsibles ── */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-4 rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] p-4">
                {/* Filtre par raison */}
                {availableReasons.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8A9080]">
                      Type d'événement
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          setFilterReason("all");
                          setVisibleCount(PAGE_SIZE);
                        }}
                        className={`rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-all cursor-pointer ${filterReason === "all"
                            ? "bg-[#1f4d3f] text-white shadow-sm"
                            : "bg-white text-[#8A9080] hover:text-[#1f241c]"
                          }`}
                      >
                        Tous
                      </button>
                      {availableReasons.map((reason) => {
                        const cfg = EVENT_COLORS[reason];
                        const Icon = EVENT_ICONS[reason];
                        const isActive = filterReason === reason;
                        return (
                          <button
                            key={reason}
                            onClick={() => {
                              setFilterReason(reason);
                              setVisibleCount(PAGE_SIZE);
                            }}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-all cursor-pointer"
                            style={
                              isActive
                                ? { background: cfg.color, color: "#fff", boxShadow: `0 3px 10px ${cfg.color}40` }
                                : { background: "#fff", color: "#8A9080" }
                            }
                          >
                            {Icon && <Icon className="h-3 w-3" />}
                            {LOYALTY_EVENT_LABELS[reason]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tri */}
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8A9080]">
                    Trier par
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { value: "date_desc", label: "Plus récent", icon: Calendar },
                        { value: "date_asc", label: "Plus ancien", icon: Calendar },
                        { value: "points_desc", label: "Points ↓", icon: Hash },
                        { value: "points_asc", label: "Points ↑", icon: Hash },
                      ] as Array<{ value: SortBy; label: string; icon: React.ComponentType<{ className?: string }> }>
                    ).map((s) => {
                      const Icon = s.icon;
                      const isActive = sortBy === s.value;
                      return (
                        <button
                          key={s.value}
                          onClick={() => setSortBy(s.value)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-all cursor-pointer ${isActive
                              ? "border-[#1f4d3f] bg-white text-[#1f4d3f] shadow-sm"
                              : "border-transparent bg-white text-[#8A9080] hover:border-[#E8E3D8] hover:text-[#1f241c]"
                            }`}
                        >
                          <Icon className="h-3 w-3" />
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

      {/* ── Liste des événements ── */}
      <div className="rounded-2xl border border-[#E8E3D8] bg-white overflow-hidden">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="inline-flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 rounded-full border-2 border-[#E8E3D8] border-t-[#1f4d3f]"
                />
                <p className="text-[13px] text-[#8A9080]">
                  Chargement du journal…
                </p>
              </div>
            </motion.div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Aucun événement"
              description="Aucun événement ne correspond à vos filtres. Essayez de modifier vos critères de recherche."
              actionText={filterReason !== "all" || filterDirection !== "all" || searchQuery ? "Réinitialiser les filtres" : undefined}
              onAction={filterReason !== "all" || filterDirection !== "all" || searchQuery ? handleReset : undefined}
            />
          ) : (
            <motion.div key="list">
              {viewMode === "list" ? (
                /* ── VUE LISTE ── */
                <div className="divide-y divide-[#F2EFE8] px-2">
                  {visibleEvents.map((event, idx) => {
                    const cfg = EVENT_COLORS[event.reason] ?? EVENT_COLORS.purchase;
                    const Icon = EVENT_ICONS[event.reason] ?? ShoppingBag;
                    const isGain = event.points_delta > 0;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.035,
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:bg-[#FAFAF8]"
                      >
                        {/* Icône */}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{ color: cfg.color }}
                            strokeWidth={2}
                          />
                        </div>

                        {/* Infos */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[14px] font-bold text-[#1f241c]">
                              {event.reason_display || LOYALTY_EVENT_LABELS[event.reason]}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[13px] text-[#8A9080]">
                            {event.description && (
                              <span className="truncate max-w-[200px]">
                                {event.description}
                              </span>
                            )}
                            {event.description && <span>·</span>}
                            <span>{formatDate(event.created_at)}</span>
                          </div>
                        </div>

                        {/* Delta de points */}
                        <div className="shrink-0 text-right">
                          <p
                            className="text-[16px] font-black tracking-tight"
                            style={{ color: isGain ? "#10b981" : "#ef4444" }}
                          >
                            {isGain ? "+" : ""}
                            {new Intl.NumberFormat("fr-FR").format(event.points_delta)}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[#8A9080]">
                            → {new Intl.NumberFormat("fr-FR").format(event.new_points_balance_after)} pts
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* ── VUE GRILLE ── */
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleEvents.map((event, idx) => {
                    const cfg = EVENT_COLORS[event.reason] ?? EVENT_COLORS.purchase;
                    const Icon = EVENT_ICONS[event.reason] ?? ShoppingBag;
                    const isGain = event.points_delta > 0;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: idx * 0.04,
                          duration: 0.38,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="group relative overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white p-4 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.1)] hover:border-[#D0CCC4]"
                        style={{
                          borderTop: `3px solid ${cfg.color}`,
                        }}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: cfg.color }} strokeWidth={2} />
                          </div>
                          <p
                            className="text-[17px] font-black tracking-tight"
                            style={{ color: isGain ? "#10b981" : "#ef4444" }}
                          >
                            {isGain ? "+" : ""}
                            {new Intl.NumberFormat("fr-FR").format(event.points_delta)} pts
                          </p>
                        </div>

                        {/* Body */}
                        <p className="text-[14px] font-bold text-[#1f241c] leading-snug mb-1">
                          {event.reason_display || LOYALTY_EVENT_LABELS[event.reason]}
                        </p>
                        {event.description && (
                          <p className="text-[12px] text-[#8A9080] truncate mb-2">{event.description}</p>
                        )}

                        {/* Footer */}
                        <div className="mt-auto flex items-center justify-between text-[12px] text-[#8A9080]">
                          <span>{formatDate(event.created_at)}</span>
                          <span
                            className="rounded-full px-2 py-0.5 font-semibold"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            → {new Intl.NumberFormat("fr-FR").format(event.new_points_balance_after)} pts
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {hasMore && (
                <div className="border-t border-[#E8E3D8] px-4 py-3 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[13px] font-semibold text-[#8A9080] transition-colors hover:bg-[#F7F5F0] hover:text-[#1f241c] cursor-pointer"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Voir plus ({filteredEvents.length - visibleCount} restant
                    {filteredEvents.length - visibleCount > 1 ? "s" : ""})
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
