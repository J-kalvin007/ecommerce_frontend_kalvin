/**
 * DashboardClient - Espace client premium
 *
 * Sections : Résumé, Commandes récentes, Portefeuille, Fidélité
 *
 * @module app/dashboard/DashboardClient
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package, Wallet, Star, TrendingUp, Clock, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Gift, Crown, Eye, BellRing,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { getOrders } from "@/fonctions_api/orders.api";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ORDERS = [
  { id: "SAF-2026-001", date: "25 Avr 2026", status: "delivered", total: "35900", items: 3, label: "Livrée" },
  { id: "SAF-2026-002", date: "22 Avr 2026", status: "shipped", total: "19500", items: 1, label: "En transit" },
  { id: "SAF-2026-003", date: "18 Avr 2026", status: "processing", total: "57200", items: 5, label: "En préparation" },
  { id: "SAF-2026-004", date: "10 Avr 2026", status: "delivered", total: "27500", items: 2, label: "Livrée" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", type: "credit" as const, amount: 35000, label: "Rechargement", date: "20 Avr 2026" },
  { id: "2", type: "debit" as const, amount: 16500, label: "Commande SAF-001", date: "18 Avr 2026" },
  { id: "3", type: "credit" as const, amount: 6500, label: "Cashback fidélité", date: "15 Avr 2026" },
  { id: "4", type: "debit" as const, amount: 8500, label: "Commande SAF-002", date: "12 Avr 2026" },
];

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  shipped: "bg-info/10 text-info",
  processing: "bg-warning/10 text-warning",
  cancelled: "bg-error/10 text-error",
};

const LOYALTY_TIERS = [
  { name: "Bronze", min: 0, max: 500, color: "from-amber-700 to-amber-600" },
  { name: "Silver", min: 500, max: 2000, color: "from-gray-400 to-gray-300" },
  { name: "Gold", min: 2000, max: 5000, color: "from-yellow-500 to-amber-400" },
  { name: "Platinum", min: 5000, max: 10000, color: "from-gray-300 to-white" },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardClient() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "wallet" | "loyalty">("overview");

  const [orders, setOrders] = useState<any[]>(MOCK_ORDERS);
  const [wsConnected, setWsConnected] = useState(false);

  // Lire l'onglet initial depuis l'URL (?tab=orders)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "orders", "wallet", "loyalty"].includes(tab)) {
      setActiveTab(tab as typeof activeTab);
    }
  }, [searchParams]);

  // Fetch orders et connexion WebSocket
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        if (data && (data.results || Array.isArray(data))) {
          const results = data.results || data;
          if (results.length > 0) {
            const mappedOrders = results.map((o: any) => ({
              realId: o.id,
              id: o.order_number,
              date: new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
              status: o.status,
              total: o.total_amount,
              items: o.items ? o.items.length : 1,
              label: o.status_display || o.status,
            }));
            setOrders(mappedOrders);

            // Connexion WebSocket sur la première commande pour la démonstration
            const latestOrder = mappedOrders[0];
            const wsUrl = `ws://localhost:8000/ws/orders/${latestOrder.realId}/`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => setWsConnected(true);
            ws.onclose = () => setWsConnected(false);

            ws.onmessage = (event) => {
              const msg = JSON.parse(event.data);
              console.log("WebSocket Message Reçu:", msg);
              if (msg.status) {
                // Mise à jour temps réel
                setOrders((prev) =>
                  prev.map((o) => o.realId === latestOrder.realId
                    ? { ...o, status: msg.status, label: msg.status }
                    : o
                  )
                );
              }
            };
            return () => ws.close();
          }
        }
      } catch (err) {
        console.warn("API Commandes injoignable, mock data...", err);
      }
    }

    if (activeTab === "orders" || activeTab === "overview") {
      fetchOrders();
    }
  }, [activeTab]);

  const userName = user?.name?.trim() || user?.email?.split("@")[0] || "Client";
  const walletBalance = (user as any)?.wallet_balance ?? 23000;
  const loyaltyPoints = (user as any)?.loyalty_points ?? 1250;
  const tier = (user as any)?.loyalty_tier || "Silver";

  const currentTier = LOYALTY_TIERS.find((t) => t.name === tier) || LOYALTY_TIERS[1];
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1];
  const progressPct = nextTier ? Math.min(100, ((loyaltyPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;

  const TABS = [
    { id: "overview" as const, label: "Aperçu", icon: TrendingUp },
    { id: "orders" as const, label: "Commandes", icon: Package },
    { id: "wallet" as const, label: "Portefeuille", icon: Wallet },
    { id: "loyalty" as const, label: "Fidélité", icon: Star },
  ];

  return (
    <div className="page-transition">
      {/* En-tête */}
      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-highlight/5">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
          <p className="text-sm text-muted">Bienvenue sur votre espace client,</p>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">
            {userName}
          </h1>
          {/* Tabs */}
          <div className="mt-6 flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === tab.id ? "bg-primary text-white shadow-md" : "text-muted hover:bg-surface-alt"
                )}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        {/* === OVERVIEW === */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Package, label: "Commandes", value: "12", sub: "4 ce mois", color: "text-info" },
                { icon: Wallet, label: "Portefeuille", value: formatCurrency(String(walletBalance), "FCFA"), sub: "Solde actuel", color: "text-success" },
                { icon: Star, label: "Points", value: String(loyaltyPoints), sub: `Niveau ${tier}`, color: "text-highlight" },
                { icon: Gift, label: "Économies", value: "85 000 FCFA", sub: "Total économisé", color: "text-primary" },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-border bg-surface-elevated p-5">
                  <div className="flex items-center justify-between">
                    <card.icon className={cn("h-5 w-5", card.color)} />
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Commandes récentes */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Commandes récentes</h2>
                <button onClick={() => setActiveTab("orders")} className="text-sm font-medium text-primary hover:underline">
                  Tout voir
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-4 transition-all hover:border-primary/20">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-alt">
                      <Package className="h-5 w-5 text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{order.id}</p>
                      <p className="text-xs text-muted">{order.date} Â· {order.items} article{order.items > 1 ? "s" : ""}</p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[order.status])}>
                      {order.label}
                    </span>
                    <span className="text-sm font-bold">{formatCurrency(order.total, "FCFA")}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* === COMMANDES === */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Mes commandes</h2>
              {wsConnected && (
                <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                  </span>
                  Suivi en direct activé
                </div>
              )}
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-5 transition-all hover:border-primary/20">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-alt">
                    <Package className="h-6 w-6 text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-muted">{order.date} Â· {order.items} article{order.items > 1 ? "s" : ""}</p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLES[order.status])}>
                    {order.label}
                  </span>
                  <span className="text-lg font-bold">{formatCurrency(order.total, "FCFA")}</span>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-alt">
                    <Eye className="h-4 w-4 text-muted" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* === PORTEFEUILLE === */}
        {activeTab === "wallet" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary to-highlight p-8 text-white shadow-xl">
              <p className="text-sm text-white/70">Solde du portefeuille</p>
              <p className="mt-1 text-4xl font-bold">{formatCurrency(String(walletBalance), "FCFA")}</p>
              <div className="mt-4 flex gap-3">
                <button className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30">
                  Recharger
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/20">
                  Transférer
                </button>
              </div>
            </div>
            <h3 className="mb-4 font-display text-lg font-bold">Transactions récentes</h3>
            <div className="space-y-3">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-4">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    tx.type === "credit" ? "bg-success/10" : "bg-error/10")}>
                    {tx.type === "credit" ? <ArrowDownLeft className="h-5 w-5 text-success" /> : <ArrowUpRight className="h-5 w-5 text-error" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{tx.label}</p>
                    <p className="text-xs text-muted">{tx.date}</p>
                  </div>
                  <span className={cn("text-sm font-bold", tx.type === "credit" ? "text-success" : "text-error")}>
                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(String(tx.amount), "FCFA")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* === FIDÉLITÉ === */}
        {activeTab === "loyalty" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Tier card */}
            <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/10 to-highlight/10 border border-border p-8">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-highlight" />
                <div>
                  <p className="text-sm text-muted">Votre niveau</p>
                  <p className="text-2xl font-bold">{tier}</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{loyaltyPoints} points</span>
                  {nextTier && <span className="text-muted">{nextTier.min} pour {nextTier.name}</span>}
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-alt">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-highlight"
                  />
                </div>
              </div>
            </div>

            {/* Avantages */}
            <h3 className="mb-4 font-display text-lg font-bold">Vos avantages {tier}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: "🎁", label: "Points x2 le week-end" },
                { icon: "🚚", label: "Livraison offerte dès 15 000 FCFA" },
                { icon: "💰", label: "Cashback 3% sur tout" },
                { icon: "🎂", label: "Cadeau d'anniversaire" },
              ].map((perk) => (
                <div key={perk.label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-4">
                  <span className="text-2xl">{perk.icon}</span>
                  <span className="text-sm font-medium">{perk.label}</span>
                </div>
              ))}
            </div>

            {/* Comment gagner */}
            <h3 className="mb-4 mt-8 font-display text-lg font-bold">Comment gagner des points</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { action: "Achat", points: "1f = 10 pts", icon: ShoppingBagIcon },
                { action: "Parrainage", points: "+500 pts", icon: Gift },
                { action: "Avis produit", points: "+50 pts", icon: Star },
              ].map((item) => (
                <div key={item.action} className="rounded-2xl border border-border bg-surface-elevated p-5 text-center">
                  <item.icon className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 font-semibold">{item.action}</p>
                  <p className="text-sm text-primary font-medium">{item.points}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* Alias pour éviter conflit de nom avec l'import lucide */
function ShoppingBagIcon({ className }: { className?: string }) {
  return <Package className={className} />;
}

