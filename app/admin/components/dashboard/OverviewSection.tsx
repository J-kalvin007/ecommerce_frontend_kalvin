/**
 * OverviewSection — Dashboard overview admin (Refonte)
 *
 * Tableau de bord central récupérant toutes les métriques clés de la plateforme
 * en parallèle et les affichant via des KPI, des graphiques (Recharts) et une liste
 * des dernières commandes.
 *
 * @module app/admin/components/dashboard/OverviewSection
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Tag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

// APIs
import { getAdminOrders } from "@/fonctions_api/commandes.api";
import { getAllUsers } from "@/fonctions_api/auth.api";
import { getAdminAllWallets } from "@/fonctions_api/wallets-paiements.api";
import { getAdminProducts } from "@/fonctions_api/produits.api";
import { getAdminCategories } from "@/fonctions_api/categories.api";
import { getAdminPromoCodes } from "@/fonctions_api/promotions.api";

// Types
import type { OrderList } from "@/modeles/commandes";

// Sous-composants (Graphiques et UI)
import { KpiCard } from "./components/KpiCard";
import { SalesChart } from "./components/SalesChart";
import { OrderStatusChart } from "./components/OrderStatusChart";
import { RecentOrdersList } from "./components/RecentOrdersList";

export default function OverviewSection() {
  // États de chargement et d'erreur globaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données brutes
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [promotionsCount, setPromotionsCount] = useState(0);

  // Fonction de chargement parallèle massif
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch sequentially to avoid overwhelming the Django dev server with DB connections
      // (Fixes "OperationalError: FATAL: sorry, too many clients already")
      const ordersRes = await getAdminOrders();
      const usersRes = await getAllUsers();
      const walletsRes = await getAdminAllWallets();
      const productsRes = await getAdminProducts();
      const categoriesRes = await getAdminCategories();
      const promosRes = await getAdminPromoCodes();

      // Commandes
      if (ordersRes.ok) {
        setOrders(ordersRes.data || []);
      }

      // Utilisateurs
      if (usersRes.ok) {
        setUsersCount(usersRes.data.length || 0);
      }

      // Wallets (pour le solde total)
      if (walletsRes.ok) {
        const wallets = walletsRes.data;
        const total = wallets.reduce(
          (sum, w) => sum + parseFloat(w.balance || "0"),
          0
        );
        setTotalWalletBalance(total);
      }

      // Produits
      if (productsRes.ok) {
        setProductsCount(productsRes.data.length || 0);
      }

      // Catégories
      if (categoriesRes.ok) {
        setCategoriesCount(categoriesRes.data.length || 0);
      }

      // Promotions
      if (promosRes.ok) {
        setPromotionsCount(promosRes.data.length || 0);
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ========================================================================
  // CALCULS ET MÉTRIQUES DÉRIVÉES
  // ========================================================================

  const metrics = useMemo(() => {
    // Chiffre d'affaires total (basé sur le total des commandes)
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.total_final || "0"),
      0
    );

    // Comptage des statuts pour le PieChart
    const statusCounts: Record<string, number> = {};
    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    const statusChartData = [
      { name: "En attente", value: statusCounts["PENDING"] || 0, color: "#f59e0b" },
      { name: "Confirmée", value: statusCounts["CONFIRMED"] || 0, color: "#3b82f6" },
      { name: "Expédiée", value: statusCounts["SHIPPED"] || 0, color: "#6366f1" },
      { name: "Livrée", value: statusCounts["DELIVERED"] || 0, color: "#10b981" },
      { name: "Annulée", value: statusCounts["CANCELLED"] || 0, color: "#ef4444" },
    ].filter((s) => s.value > 0); // Ne garder que les statuts présents

    // Agrégation par date pour le graphique d'évolution (7 derniers jours)
    // On trie d'abord les commandes par date décroissante
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // On va générer les 7 derniers jours (y compris aujourd'hui)
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

      // Filtrer les commandes de ce jour spécifique
      const dayOrders = sortedOrders.filter((o) => {
        const orderDate = new Date(o.created_at);
        return (
          orderDate.getDate() === d.getDate() &&
          orderDate.getMonth() === d.getMonth() &&
          orderDate.getFullYear() === d.getFullYear()
        );
      });

      const dayRevenue = dayOrders.reduce(
        (sum, o) => sum + parseFloat(o.total_final || "0"),
        0
      );

      salesData.push({
        date: dateString,
        revenue: dayRevenue,
        ordersCount: dayOrders.length,
      });
    }

    return {
      totalRevenue,
      statusChartData,
      salesData,
      sortedOrders,
    };
  }, [orders]);

  // ========================================================================
  // RENDU UI
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* En-tête de la section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Vue d'ensemble
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Aperçu des performances de votre plateforme e-commerce
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex w-fit items-center cursor-pointer gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Rafraîchir
        </button>
      </div>

      {/* {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-500/10 p-4 border border-red-200 dark:border-red-500/30">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )} */}

      {/* Cartes KPI (Grid Responsive) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Chiffre d'Affaires"
          value={formatCurrency(metrics.totalRevenue, "FCFA")}
          icon={Wallet}
          iconColorClass="text-primary"
          iconBgClass="bg-primary/10"
          loading={loading}
          delay={0}
        />
        <KpiCard
          title="Commandes Totales"
          value={orders.length.toString()}
          icon={ShoppingCart}
          iconColorClass="text-emerald-500"
          iconBgClass="bg-emerald-500/10"
          loading={loading}
          delay={0.1}
        />
        <KpiCard
          title="Clients Inscrits"
          value={usersCount.toString()}
          icon={Users}
          iconColorClass="text-blue-500"
          iconBgClass="bg-blue-500/10"
          loading={loading}
          delay={0.2}
        />
        <KpiCard
          title="Solde Wallets Global"
          value={formatCurrency(totalWalletBalance, "FCFA")}
          icon={Wallet}
          iconColorClass="text-orange-500"
          iconBgClass="bg-orange-500/10"
          loading={loading}
          delay={0.3}
        />
      </div>

      {/* Section Graphiques et Listes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Graphique des ventes (Prend 2 colonnes sur grand écran) */}
        <div className="lg:col-span-2">
          <SalesChart data={metrics.salesData} loading={loading} />
        </div>

        {/* Répartition des commandes (Prend 1 colonne) */}
        <div className="lg:col-span-1">
          <OrderStatusChart data={metrics.statusChartData} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Liste des dernières commandes (Prend 2 colonnes) */}
        <div className="lg:col-span-2">
          <RecentOrdersList orders={metrics.sortedOrders} loading={loading} />
        </div>

        {/* Mini stats rapides */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <KpiCard
            title="Produits en catalogue"
            value={productsCount.toString()}
            icon={Package}
            iconColorClass="text-purple-500"
            iconBgClass="bg-purple-500/10"
            loading={loading}
            delay={0.4}
          />
          <KpiCard
            title="Catégories Actives"
            value={categoriesCount.toString()}
            icon={Tag}
            iconColorClass="text-indigo-500"
            iconBgClass="bg-indigo-500/10"
            loading={loading}
            delay={0.5}
          />
          <KpiCard
            title="Promotions Actives"
            value={promotionsCount.toString()}
            icon={Tag}
            iconColorClass="text-rose-500"
            iconBgClass="bg-rose-500/10"
            loading={loading}
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
}