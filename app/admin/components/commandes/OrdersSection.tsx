
// app/admin/components/commandes/OrdersSection.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, Filter,
  ChevronDown, LayoutGrid, List,
  TrendingUp, Clock, Truck, CheckCircle2, Package,
  RefreshCw, X, Calendar
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getAdminOrders, updateOrderStatus } from "@/fonctions_api/commandes.api";
import type { OrderList, OrderStatus, AdminOrderFilters } from "@/modeles/commandes";
import { ORDER_STATUS_MAP } from "@/modeles/commandes";
import Toast from "@/components/notifications/Toast";
import LoadingKalvin from "@/components/special/loadingKalvin";
import EmptyState from "@/components/special/EmptyState";
import ErrorState from "@/components/special/ErrorState";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { OrderCard } from "./components/Ordercard";

// --- KPI card ----------------------------------------------------------------

interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accentClass: string;
  iconColorClass: string;
  active?: boolean;
  onClick?: () => void;
}

function KPICard({ label, value, icon, accentClass, iconColorClass, active, onClick }: KPICardProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
        active
          ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/60 bg-white-elevated hover:border-border shadow-sm hover:shadow-md"
      )}
    >
      {/* Glow blob */}
      {/* <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50 transition-opacity group-hover:opacity-80", accentClass)} /> */}

      <div className="relative space-y-3 flex items-center justify-between ">



        <div>
          <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>

        <div className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-110",
          accentClass, "border-current/20"
        )}>
          <span className={iconColorClass}>{icon}</span>
        </div>

      </div>

      {active && (
        <motion.div layoutId="kpi-indicator" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />
      )}

    </motion.button>
  );
}

// --- Section principale -------------------------------------------------------

export default function OrdersSection() {
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false, type: "success", message: "",
  });
  const [pendingStatusChange, setPendingStatusChange] = useState<{ reference: string; status: OrderStatus } | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setError(null); }

    const filters: AdminOrderFilters = {};
    if (statusFilter !== "ALL") filters.status = statusFilter;
    if (dateFrom) filters.created_after = dateFrom;
    if (dateTo) filters.created_before = dateTo;

    const res = await getAdminOrders(filters);
    if (res.ok) { setOrders(res.data); setError(null); }
    else setError(res.error.message || "Impossible de charger les commandes.");

    setLoading(false);
    setRefreshing(false);
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = useCallback(async (reference: string, newStatus: OrderStatus) => {
    setUpdatingRef(reference);
    setPendingStatusChange(null);
    const res = await updateOrderStatus(reference, { status: newStatus });
    if (res.ok) {
      setToast({ show: true, type: "success", message: `Commande ${reference} → ${ORDER_STATUS_MAP[newStatus]?.label}` });
      await fetchOrders();
    } else {
      setToast({ show: true, type: "error", message: res.error.message || "Erreur de mise à jour" });
    }
    setUpdatingRef(null);
  }, [fetchOrders]);

  const requestStatusChange = useCallback((reference: string, newStatus: OrderStatus) => {
    setPendingStatusChange({ reference, status: newStatus });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(o => o.reference.toLowerCase().includes(q));
  }, [orders, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "pending_payment" || o.status === "paid").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    revenue: orders.reduce((s, o) => s + parseFloat(o.total_final || "0"), 0),
  }), [orders]);

  if (error && orders.length === 0) {
    return <ErrorState message={error} onRetry={() => fetchOrders()} />;
  }

  return (
    <>
      {/* Toast */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(p => ({ ...p, show: false }))}
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={!!pendingStatusChange}
        onCancel={() => setPendingStatusChange(null)}
        onConfirm={() => {
          if (pendingStatusChange) void handleStatusChange(pendingStatusChange.reference, pendingStatusChange.status);
        }}
        title="Changer le statut"
        message={pendingStatusChange
          ? `Confirmer le passage de la commande ${pendingStatusChange.reference} vers "${ORDER_STATUS_MAP[pendingStatusChange.status]?.label}" ?`
          : ""}
        confirmText="Confirmer"
        type="info"
        isLoading={!!updatingRef}
      />

      {/* Order detail modal */}
      <OrderDetailModal
        reference={selectedRef}
        onClose={() => setSelectedRef(null)}
        onStatusChange={async (ref, status) => { await handleStatusChange(ref, status); }}
        isUpdating={!!updatingRef}
      />

      <div className="space-y-8 px-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* -- Header -- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">






        {/* -- En-tête avec effet premium -- */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="relative inline-block group">
            <h2
              className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
              style={{
                letterSpacing: "-0.025em",
                backgroundImage:
                  "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
                backgroundSize: "220% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <ShoppingBag className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Commandes
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Suivi en temps réel de toutes les commandes de la plateforme.
            </span>

            {/* Gradient SVG caché pour l'icône */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>


            {/* Animations scoppées, avec respect du prefers-reduced-motion */}
            <style>{`
            @keyframes premium-title-shine-anim {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 100% center; }
            }
            .premium-title-shine {
            animation: premium-title-shine-anim 6s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
            .premium-title-shine {
                animation: none;
            }
            }
        `}</style>
          </div>
        </motion.div>





        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 cursor-pointer rounded-xl border border-border/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4 transition-transform", refreshing && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {/* -- KPI cards -- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <KPICard
          label="Toutes"
          value={stats.total}
          icon={<ShoppingBag className="h-4.5 w-4.5" />}
          accentClass="bg-primary/10"
          iconColorClass="text-primary"
          active={statusFilter === "ALL"}
          onClick={() => setStatusFilter("ALL")}
        />
        <KPICard
          label="En attente"
          value={stats.pending}
          icon={<Clock className="h-4.5 w-4.5" />}
          accentClass="bg-amber-400/10"
          iconColorClass="text-amber-400"
          active={statusFilter === "pending_payment"}
          onClick={() => setStatusFilter("pending_payment")}
        />
        <KPICard
          label="Préparation"
          value={stats.processing}
          icon={<Package className="h-4.5 w-4.5" />}
          accentClass="bg-orange-400/10"
          iconColorClass="text-orange-400"
          active={statusFilter === "processing"}
          onClick={() => setStatusFilter("processing")}
        />
        <KPICard
          label="Expédiées"
          value={stats.shipped}
          icon={<Truck className="h-4.5 w-4.5" />}
          accentClass="bg-cyan-400/10"
          iconColorClass="text-cyan-400"
          active={statusFilter === "shipped"}
          onClick={() => setStatusFilter("shipped")}
        />
        <KPICard
          label="Livrées"
          value={stats.delivered}
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          accentClass="bg-emerald-400/10"
          iconColorClass="text-emerald-400"
          active={statusFilter === "delivered"}
          onClick={() => setStatusFilter("delivered")}
        />
      </div>

      {/* -- Revenue banner -- */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Chiffre d'affaires total</p>
            <p className="mt-1 text-4xl font-black tracking-tight text-foreground">
              {formatCurrency(stats.revenue, "FCFA")}
            </p>
          </div>
          <TrendingUp className="h-14 w-14 text-primary/15" />
        </div>
      </div>

      {/* -- Search & toolbar -- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par référence…"
            className="h-11 w-full rounded-xl border border-border/60 bg-white pl-11 pr-10 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all",
              showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-white text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>

          {/* View toggle */}
          <div className="flex rounded-xl border border-border/60 bg-white p-1">
            {(["list", "grid"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  viewMode === mode ? "bg-white-alt text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "list" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -- Date filters (collapsible) -- */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border/60 bg-white-elevated p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Du</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="h-9 rounded-xl border border-border/60 bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Au</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="h-9 rounded-xl border border-border/60 bg-white px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Effacer
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Status filter pills -- */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black transition-all whitespace-nowrap",
            statusFilter === "ALL"
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
              : "border-border/60 bg-white text-muted-foreground hover:border-primary/40"
          )}
        >
          Toutes
          <span className={cn("rounded-lg px-1.5 py-0.5 text-[10px]", statusFilter === "ALL" ? "bg-white/20" : "bg-white-alt")}>
            {orders.length}
          </span>
        </button>

        {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map(s => {
          const count = orders.filter(o => o.status === s).length;
          if (count === 0) return null;
          const cfg = ORDER_STATUS_MAP[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black transition-all whitespace-nowrap",
                statusFilter === s
                  ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                  : "border-border/60 bg-white text-muted-foreground hover:border-primary/40"
              )}
            >
              {cfg.label}
              <span className={cn("rounded-lg px-1.5 py-0.5 text-[10px]", statusFilter === s ? "bg-white/20" : "bg-white-alt")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* -- Orders list -- */}
      {loading ? (
        <LoadingKalvin />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucune commande trouvée"
          description={
            search
              ? `Aucun résultat pour "${search}". Essayez de modifier votre recherche.`
              : "Aucune commande ne correspond à ces critères."
          }
          icon={ShoppingBag}
        />
      ) : (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-3"
        )}>
          <AnimatePresence mode="popLayout">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                viewMode={viewMode}
                onView={() => setSelectedRef(order.reference)}
                onStatusChange={status => requestStatusChange(order.reference, status)}
                isUpdating={updatingRef === order.reference}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      </div>
    </>
  );
}