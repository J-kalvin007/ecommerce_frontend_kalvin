"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Eye, Loader2, ShoppingCart, Search, Truck, XCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/axios";
import type { Order } from "@/modeles";

interface OrderData {
  id: string;
  reference: string;
  client: string;
  email?: string;
  date: string;
  total: number;
  status: string;
  items: number;
  payment?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmee", className: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle2 },
  PREPARING: { label: "Preparation", className: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: ShoppingCart },
  SHIPPED: { label: "Expediee", className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: Truck },
  DELIVERED: { label: "Livree", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  CANCELLED: { label: "Annulee", className: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

function extractOrders(data: unknown): Order[] {
  if (Array.isArray(data)) return data as Order[];
  if (data && typeof data === "object") {
    const candidate = data as { results?: unknown; data?: unknown; items?: unknown };
    if (Array.isArray(candidate.results)) return candidate.results as Order[];
    if (Array.isArray(candidate.data)) return candidate.data as Order[];
    if (Array.isArray(candidate.items)) return candidate.items as Order[];
  }
  return [];
}

function mapOrder(order: Order): OrderData {
  return {
    id: order.id,
    reference: order.order_number || order.id,
    client: order.shipping_address?.full_name || "Client",
    email: order.guest_email,
    date: order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "",
    total: Number(order.total_amount || 0),
    status: order.status,
    items: order.items?.reduce((total, item) => total + item.quantity, 0) || 0,
    payment: order.wallet_transaction_id ? "Wallet" : order.currency || "FCFA",
  };
}

export default function OrdersSection() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Order[] | { results?: Order[]; data?: Order[]; items?: Order[] }>(
        "/api/v1/commandes/admin/"
      );
      setOrders(extractOrders(data).map(mapOrder));
    } catch (error) {
      console.warn("Erreur fetch orders", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleStatusChange = async (reference: string, newStatus: string) => {
    try {
      await api.patch(`/api/v1/commandes/admin/${reference}/status/`, {
        status: newStatus,
        comment: "",
      });
      await fetchOrders();
    } catch (error) {
      console.error("Erreur mise a jour statut", error);
      alert("Erreur lors de la mise a jour du statut.");
    }
  };

  const filtered = orders.filter((order) => {
    if (filter !== "ALL" && order.status !== filter) return false;
    if (
      search &&
      !order.reference.toLowerCase().includes(search.toLowerCase()) &&
      !order.client.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Commandes</h1>
        <p className="text-sm text-white/40">Liste backend des commandes sans donnees de demonstration</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {[{ key: "ALL", label: "Toutes", count: orders.length }, ...Object.entries(STATUS_CONFIG).map(([key, value]) => ({ key, label: value.label, count: orders.filter((order) => order.status === key).length }))].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              filter === item.key
                ? "border border-orange-500/20 bg-orange-500/15 text-orange-400"
                : "border border-white/5 text-white/40 hover:bg-white/5"
            )}
          >
            {item.label} <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par numero de commande ou client..."
          className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
        />
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-white/50">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
            Chargement des commandes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-white/50">
            Aucune commande backend disponible.
          </div>
        ) : (
          filtered.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            return (
              <motion.div
                key={order.id}
                layout
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <config.icon className={cn("h-5 w-5", config.className.split(" ").find((item) => item.startsWith("text-")))} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{order.reference}</p>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", config.className)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{order.client} . {order.email || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-white/30">{order.date}</span>
                    <span className="text-white/30">{order.items} art.</span>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/50">{order.payment || "N/A"}</span>
                    <span className="text-base font-bold text-white">
                      {formatCurrency(typeof order.total === "string" ? parseFloat(order.total) : order.total, "FCFA")}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => void handleStatusChange(order.reference, e.target.value)}
                      className="h-8 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] text-white/70 outline-none hover:bg-white/10"
                    >
                      {Object.keys(STATUS_CONFIG).map((status) => (
                        <option key={status} value={status} className="bg-[#12121a]">
                          {STATUS_CONFIG[status].label}
                        </option>
                      ))}
                    </select>

                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30 hover:bg-white/5 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
