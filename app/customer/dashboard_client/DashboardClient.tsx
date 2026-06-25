/**
 * DashboardClient.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Panneau de contrôle principal de l'espace client.
 * Vue d'ensemble agrégée de toutes les données de l'utilisateur :
 * commandes récentes, portefeuille, points de fidélité et favoris.
 *
 * @module app/customer/dashboard_client/DashboardClient
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Wallet,
  Star,
  Heart,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

import { useAuthStore } from "@/store/authStore";
import { mediaUrl } from "@/lib/mediaUrl";
import LoadingStyle from "@/components/special/loadingStyle";

// APIs
import { getMyOrders } from "@/fonctions_api/commandes.api";
import { getMyWallet, getMyWalletHistory } from "@/fonctions_api/wallets-paiements.api";
import { getMyLoyaltyProfile } from "@/fonctions_api/fidelites.api";
import { getMyFavorites } from "@/fonctions_api/notes-favoris.api";

// Modèles
import type { OrderList } from "@/modeles/commandes";
import { WALLET_TRANSACTION_TYPE_LABELS } from "@/modeles/wallets-paiements";
import type { Wallet as WalletModel, WalletTransaction } from "@/modeles/wallets-paiements";
import type { LoyaltyProfile } from "@/modeles/fidelites";
import type { FavoriteProduct } from "@/modeles/notes-favoris";

/* ── Utilitaires ────────────────────────────────────────────────────────── */

function formatAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 FCFA";
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num) + " FCFA";
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending_payment: "En attente de paiement",
  paid: "Payée",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_payment: "bg-orange-50 text-orange-700 border-orange-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-pink-50 text-pink-700 border-pink-200",
};

/* ── Dashboard Aggregator ────────────────────────────────────────────────── */

export default function DashboardClient() {
  const { user } = useAuthStore();

  /* ── États ───────────────────────────────────────────────────────────── */
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [wallet, setWallet] = useState<WalletModel | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  /* ── Chargement de toutes les données en parallèle ───────────────────── */
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);

      const [ordersRes, walletRes, historyRes, loyaltyRes, favsRes] = await Promise.allSettled([
        getMyOrders(),
        getMyWallet(),
        getMyWalletHistory(),
        getMyLoyaltyProfile(),
        getMyFavorites(),
      ]);

      // Commandes
      if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
        setOrders(ordersRes.value.data.slice(0, 3)); // Seulement les 3 plus récentes
      }

      // Wallet
      if (walletRes.status === "fulfilled" && walletRes.value.ok) {
        setWallet(walletRes.value.data);
      }
      if (historyRes.status === "fulfilled" && historyRes.value.ok) {
        setTransactions(historyRes.value.data.slice(0, 4)); // Les 4 dernières
      }

      // Fidélité
      if (loyaltyRes.status === "fulfilled" && loyaltyRes.value.ok) {
        setLoyalty(loyaltyRes.value.data);
      }

      // Favoris
      if (favsRes.status === "fulfilled" && favsRes.value.ok) {
        setFavorites(favsRes.value.data.slice(0, 4)); // Les 4 derniers favoris
      }

      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  /* ── Rendu de l'état de chargement ───────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoadingStyle label="Préparation de votre espace…" size={18} />
      </div>
    );
  }

  /* ── Données dérivées ────────────────────────────────────────────────── */
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Client";

  /* ═══════════════════════════════════════════════════════════════════════
     Rendu Principal
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* ── En-tête de bienvenue ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
        style={{
          background: "linear-gradient(135deg, #0d1a0f 0%, #1a2e1c 40%, #0f2012 100%)",
          boxShadow: "0 24px 60px -12px rgba(31,77,63,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#C9963A" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,80.7,-46.3C89.6,-33.5,94.4,-18,94.2,-2.7C94,-12.6,88.8,-25.2,79.9,-36.8C71,-48.4,58.4,-59,44.7,-67.2C31,-75.4,15.5,-81.2,-0.2,-80.9C-15.9,-80.6,-31.8,-74.2,-45.5,-65.4C-59.2,-56.6,-70.7,-45.4,-78.9,-31.6C-87.1,-17.8,-92,-1.4,-89.6,13.8C-87.2,29,-77.5,43,-64.7,52.9C-51.9,62.8,-36,68.6,-20.9,72.6C-5.8,76.6,8.5,78.8,22.6,76.1C36.7,73.4,50.6,65.8,61.9,55.3C73.2,44.8,81.9,31.4,85.2,16.5C88.5,1.6,86.4,-14.8,80.4,-29.4C74.4,-44,64.5,-56.8,52.2,-66.2C39.9,-75.6,25.2,-81.6,9.8,-83.4C-5.6,-85.2,-21.7,-82.8,-35.8,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/50">
            {greeting},
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {displayName}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Compte sécurisé
            </span>
            {loyalty && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#C9963A]/20 px-3 py-1.5 text-[12px] font-semibold text-[#E8B450] shadow-sm border border-[#C9963A]/30 backdrop-blur-sm">
                <Crown className="h-3.5 w-3.5" />
                Client {loyalty.tier_name}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Grille principale : 3 colonnes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Gauche (Portefeuille & Fidélité) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Carte Portefeuille */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-[#E8E3D8] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                  <Wallet className="h-4.5 w-4.5 text-emerald-600" strokeWidth={1.75} />
                </div>
                <h2 className="text-[15px] font-black tracking-tight text-[#1f241c]">Portefeuille</h2>
              </div>
              <Link href="/customer/wallet" className="text-[12px] font-bold text-[#1f4d3f] hover:underline">
                Ouvrir
              </Link>
            </div>
            
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8A9080]">Solde Actuel</p>
            <p className="mt-1 text-3xl font-black tracking-tighter text-[#1f241c]">
              {wallet ? formatAmount(wallet.balance) : "—"}
            </p>

            <div className="mt-6 flex gap-2">
              <Link
                href="/customer/wallet"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1f4d3f] py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#16382c]"
              >
                Recharger
              </Link>
            </div>
          </motion.div>

          {/* Carte Fidélité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl border border-[#E8E3D8] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                  <Star className="h-4.5 w-4.5 text-amber-500" strokeWidth={1.75} />
                </div>
                <h2 className="text-[15px] font-black tracking-tight text-[#1f241c]">Fidélité</h2>
              </div>
              <Link href="/customer/fidelites" className="text-[12px] font-bold text-amber-600 hover:underline">
                Détails
              </Link>
            </div>
            
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8A9080]">Points Disponibles</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-3xl font-black tracking-tighter text-[#1f241c]">
                {loyalty ? new Intl.NumberFormat("fr-FR").format(loyalty.points_balance) : "—"}
              </p>
              <span className="mb-1 text-[13px] font-bold text-[#8A9080]">pts</span>
            </div>

            {loyalty && loyalty.next_tier && (
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#8A9080]">
                  <span>{loyalty.tier_name}</span>
                  <span>{loyalty.next_tier.name}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F7F5F0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    style={{ width: "65%" }} // Simulé pour le dashboard (la vraie logique est dans la page fidélité)
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Colonne Centrale & Droite (Commandes & Reste) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Commandes Récentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-3xl border border-[#E8E3D8] bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                  <Package className="h-4.5 w-4.5 text-blue-600" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-[16px] font-black tracking-tight text-[#1f241c]">Commandes Récentes</h2>
                  <p className="text-[12px] text-[#8A9080]">Vos derniers achats</p>
                </div>
              </div>
              <Link
                href="/customer/dashboard_client?tab=orders"
                className="flex items-center gap-1 rounded-xl bg-[#F7F5F0] px-3 py-1.5 text-[12px] font-bold text-[#1f241c] transition-colors hover:bg-[#E8E3D8]"
              >
                Tout voir
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const statusColors = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.draft;
                  return (
                    <Link
                      key={order.id}
                      href={`/customer/dashboard_client?tab=orders`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#F2EFE8] p-4 transition-all hover:border-[#1f4d3f]/20 hover:bg-[#FAFAF8] hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7F5F0] text-[#8A9080] transition-colors group-hover:bg-white group-hover:text-[#1f4d3f] group-hover:shadow-sm">
                          <Package className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1f241c]">{order.reference}</p>
                          <p className="text-[12px] text-[#8A9080]">{formatDate(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                        <span className={`inline-flex items-center whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-bold ${statusColors}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                        <div className="text-right">
                          <p className="text-[14px] font-black text-[#1f4d3f]">{formatAmount(order.total_final)}</p>
                          <p className="text-[11px] font-semibold text-[#8A9080]">{order.items_total} article(s)</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F5F0]">
                    <Package className="h-6 w-6 text-[#C4BFB6]" strokeWidth={1.5} />
                  </div>
                  <p className="text-[14px] font-bold text-[#1f241c]">Aucune commande</p>
                  <p className="text-[12px] text-[#8A9080]">Vous n'avez pas encore passé de commande.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Grille secondaire (Transactions & Favoris) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Transactions du portefeuille */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="rounded-3xl border border-[#E8E3D8] bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[14px] font-black tracking-tight text-[#1f241c]">Dernières transactions</h3>
                <Link href="/customer/wallet" className="text-[12px] font-bold text-[#8A9080] hover:text-[#1f241c]">Voir</Link>
              </div>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((tx) => {
                    const isCredit = tx.transaction_type === "deposit" || tx.transaction_type === "refund" || tx.transaction_type === "cashback";
                    return (
                      <div key={tx.id} className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                          {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-bold text-[#1f241c]">{WALLET_TRANSACTION_TYPE_LABELS[tx.transaction_type]}</p>
                          <p className="text-[10px] text-[#8A9080]">{formatDate(tx.created_at)}</p>
                        </div>
                        <p className={`text-[13px] font-black ${isCredit ? "text-emerald-600" : "text-[#1f241c]"}`}>
                          {isCredit ? "+" : "-"}{formatAmount(tx.amount)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-4 text-center text-[12px] text-[#8A9080]">Aucune transaction récente.</p>
                )}
              </div>
            </motion.div>

            {/* Favoris récents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="rounded-3xl border border-[#E8E3D8] bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[14px] font-black tracking-tight text-[#1f241c]">Favoris récents</h3>
                <Link href="/customer/notes-favoris" className="text-[12px] font-bold text-[#8A9080] hover:text-[#1f241c]">Voir</Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {favorites.length > 0 ? (
                  favorites.map((product) => {
                    const imgUrl = mediaUrl(product.image);
                    return (
                      <Link key={product.id} href={`/product/${product.slug}`} className="group block overflow-hidden rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] transition-colors hover:border-red-200 hover:bg-white">
                        <div className="relative h-20 w-full overflow-hidden bg-white">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" sizes="100px" />
                          ) : (
                            <div className="flex h-full items-center justify-center"><Heart className="h-5 w-5 text-gray-300" /></div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[11px] font-bold text-[#1f241c]">{product.name}</p>
                          <p className="text-[11px] font-black text-[#1f4d3f]">{formatAmount(product.price)}</p>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-4 text-center">
                    <p className="text-[12px] text-[#8A9080]">Aucun favori enregistré.</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
