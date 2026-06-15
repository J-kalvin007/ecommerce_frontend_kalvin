/**
 * OverviewSection — Dashboard overview admin
 * @module app/admin/components/OverviewSection
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingCart, Tag, Users } from "lucide-react";
import api from "@/lib/axios";
import { cn, formatCurrency } from "@/lib/utils";
import { getAdminCategories } from "@/fonctions_api/categories.api";
import { getAdminProducts } from "@/fonctions_api/produits.api";
import type { ProductDetail } from "@/modeles/produits";

import LoadingStyle from "@/components/special/loadingStyle";
import ErrorState from "@/components/special/ErrorState";

interface OverviewOrder {
  id: string;
  reference?: string;
  client?: string;
  total?: number | string;
  status?: string;
}

interface OverviewUser {
  id: string;
  name?: string;
  email?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "Préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function OverviewSection() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [orders, setOrders] = useState<OverviewOrder[]>([]);
  const [users, setUsers] = useState<OverviewUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsResult, categoriesResult, ordersResult, usersResult] =
        await Promise.allSettled([
          getAdminProducts(),
          getAdminCategories(),
          api.get("/admin/orders/"),
          api.get("/api/users/"),
        ]);

      if (productsResult.status === "fulfilled" && productsResult.value.ok) {
        setProducts(productsResult.value.data);
      } else {
        setProducts([]);
      }

      if (categoriesResult.status === "fulfilled" && categoriesResult.value.ok) {
        setCategoriesCount(categoriesResult.value.data.length);
      } else {
        setCategoriesCount(0);
      }

      if (ordersResult.status === "fulfilled") {
        const data = ordersResult.value.data;
        setOrders(data?.results || data || []);
      } else {
        setOrders([]);
      }

      if (usersResult.status === "fulfilled") {
        const data = usersResult.value.data;
        setUsers(data?.results || data || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement du dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => {
      const amount =
        typeof order.total === "string" ? Number.parseFloat(order.total) : Number(order.total || 0);
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    return {
      products: products.length,
      inStock: products.filter((product) => product.stock > 0).length,
      categories: categoriesCount,
      orders: orders.length,
      users: users.length,
      revenue,
    };
  }, [categoriesCount, orders, products, users]);

  const recentProducts = products.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  if (error && !loading && !products.length && !orders.length) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Vue d&apos;ensemble basée sur les données du backend</p>
      </div>

      {loading ? (
        <LoadingStyle label="Chargement des statistiques..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Produits", value: stats.products, icon: Package, tone: "text-slate-700" },
              { label: "Commandes", value: stats.orders, icon: ShoppingCart, tone: "text-blue-600" },
              { label: "Clients", value: stats.users, icon: Users, tone: "text-emerald-600" },
              { label: "Catégories", value: stats.categories, icon: Tag, tone: "text-primary" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <item.icon className={cn("h-5 w-5", item.tone)} />
                <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
              <p className="text-sm font-semibold text-slate-900">Chiffres rapides</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span>Produits en stock</span>
                  <span className="font-semibold text-slate-900">{stats.inStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span>Revenu (Commandes)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(stats.revenue, "FCFA")}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Derniers produits</p>
                <span className="text-xs text-slate-400">{recentProducts.length} visible(s)</span>
              </div>
              {recentProducts.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 bg-slate-50">
                  Aucun produit backend disponible.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50 transition-colors hover:bg-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.sku} • {formatCurrency(Number.parseFloat(product.price || "0"), "FCFA")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Dernières commandes</p>
                <span className="text-xs text-slate-400">{recentOrders.length} visible(s)</span>
              </div>
              {recentOrders.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 bg-slate-50">
                  Aucune commande backend disponible.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50 transition-colors hover:bg-slate-100">
                      <p className="text-sm font-semibold text-slate-900">
                        {order.reference || `Commande #${order.id}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.client || "Client inconnu"} •{" "}
                        {STATUS_LABELS[order.status || ""] || order.status || "Statut inconnu"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
