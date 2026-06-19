// /**
//  * OverviewSection — Dashboard overview admin
//  * @module app/admin/components/OverviewSection
//  */

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Package, ShoppingCart, Tag, Users } from "lucide-react";
// import api from "@/lib/axios";
// import { cn, formatCurrency } from "@/lib/utils";
// import { getAdminCategories } from "@/fonctions_api/categories.api";
// import { getAdminProducts } from "@/fonctions_api/produits.api";
// import type { ProductDetail } from "@/modeles/produits";

// import LoadingStyle from "@/components/special/loadingStyle";
// import ErrorState from "@/components/special/ErrorState";

// interface OverviewOrder {
//   id: string;
//   reference?: string;
//   client?: string;
//   total?: number | string;
//   status?: string;
// }

// interface OverviewUser {
//   id: string;
//   name?: string;
//   email?: string;
// }

// const STATUS_LABELS: Record<string, string> = {
//   PENDING: "En attente",
//   CONFIRMED: "Confirmée",
//   PREPARING: "Préparation",
//   SHIPPED: "Expédiée",
//   DELIVERED: "Livrée",
//   CANCELLED: "Annulée",
// };

// export default function OverviewSection() {
//   const [products, setProducts] = useState<ProductDetail[]>([]);
//   const [categoriesCount, setCategoriesCount] = useState(0);
//   const [orders, setOrders] = useState<OverviewOrder[]>([]);
//   const [users, setUsers] = useState<OverviewUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadDashboard = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [productsResult, categoriesResult, ordersResult, usersResult] =
//         await Promise.allSettled([
//           getAdminProducts(),
//           getAdminCategories(),
//           api.get("/admin/orders/"),
//           api.get("/api/users/"),
//         ]);

//       if (productsResult.status === "fulfilled" && productsResult.value.ok) {
//         setProducts(productsResult.value.data);
//       } else {
//         setProducts([]);
//       }

//       if (categoriesResult.status === "fulfilled" && categoriesResult.value.ok) {
//         setCategoriesCount(categoriesResult.value.data.length);
//       } else {
//         setCategoriesCount(0);
//       }

//       if (ordersResult.status === "fulfilled") {
//         const data = ordersResult.value.data;
//         setOrders(data?.results || data || []);
//       } else {
//         setOrders([]);
//       }

//       if (usersResult.status === "fulfilled") {
//         const data = usersResult.value.data;
//         setUsers(data?.results || data || []);
//       } else {
//         setUsers([]);
//       }
//     } catch (err) {
//       setError("Erreur lors du chargement du dashboard.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadDashboard();
//   }, []);

//   const stats = useMemo(() => {
//     const revenue = orders.reduce((sum, order) => {
//       const amount =
//         typeof order.total === "string" ? Number.parseFloat(order.total) : Number(order.total || 0);
//       return Number.isFinite(amount) ? sum + amount : sum;
//     }, 0);

//     return {
//       products: products.length,
//       inStock: products.filter((product) => product.stock > 0).length,
//       categories: categoriesCount,
//       orders: orders.length,
//       users: users.length,
//       revenue,
//     };
//   }, [categoriesCount, orders, products, users]);

//   const recentProducts = products.slice(0, 5);
//   const recentOrders = orders.slice(0, 5);

//   if (error && !loading && !products.length && !orders.length) {
//     return <ErrorState message={error} onRetry={loadDashboard} />;
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
//         <p className="text-sm text-slate-500">Vue d&apos;ensemble basée sur les données du backend</p>
//       </div>

//       {loading ? (
//         <LoadingStyle label="Chargement des statistiques..." />
//       ) : (
//         <>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {[
//               { label: "Produits", value: stats.products, icon: Package, tone: "text-slate-700" },
//               { label: "Commandes", value: stats.orders, icon: ShoppingCart, tone: "text-blue-600" },
//               { label: "Clients", value: stats.users, icon: Users, tone: "text-emerald-600" },
//               { label: "Catégories", value: stats.categories, icon: Tag, tone: "text-primary" },
//             ].map((item) => (
//               <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
//                 <item.icon className={cn("h-5 w-5", item.tone)} />
//                 <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
//                 <p className="text-xs text-slate-500">{item.label}</p>
//               </div>
//             ))}
//           </div>

//           <div className="grid gap-6 lg:grid-cols-3">
//             <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
//               <p className="text-sm font-semibold text-slate-900">Chiffres rapides</p>
//               <div className="mt-4 space-y-3 text-sm text-slate-600">
//                 <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
//                   <span>Produits en stock</span>
//                   <span className="font-semibold text-slate-900">{stats.inStock}</span>
//                 </div>
//                 <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
//                   <span>Revenu (Commandes)</span>
//                   <span className="font-semibold text-slate-900">{formatCurrency(stats.revenue, "FCFA")}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
//               <div className="flex items-center justify-between">
//                 <p className="text-sm font-semibold text-slate-900">Derniers produits</p>
//                 <span className="text-xs text-slate-400">{recentProducts.length} visible(s)</span>
//               </div>
//               {recentProducts.length === 0 ? (
//                 <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 bg-slate-50">
//                   Aucun produit backend disponible.
//                 </div>
//               ) : (
//                 <div className="mt-4 space-y-3">
//                   {recentProducts.map((product) => (
//                     <div key={product.id} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50 transition-colors hover:bg-slate-100">
//                       <p className="text-sm font-semibold text-slate-900">{product.name}</p>
//                       <p className="mt-1 text-xs text-slate-500">
//                         {product.sku} • {formatCurrency(Number.parseFloat(product.price || "0"), "FCFA")}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
//               <div className="flex items-center justify-between">
//                 <p className="text-sm font-semibold text-slate-900">Dernières commandes</p>
//                 <span className="text-xs text-slate-400">{recentOrders.length} visible(s)</span>
//               </div>
//               {recentOrders.length === 0 ? (
//                 <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 bg-slate-50">
//                   Aucune commande backend disponible.
//                 </div>
//               ) : (
//                 <div className="mt-4 space-y-3">
//                   {recentOrders.map((order) => (
//                     <div key={order.id} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50 transition-colors hover:bg-slate-100">
//                       <p className="text-sm font-semibold text-slate-900">
//                         {order.reference || `Commande #${order.id}`}
//                       </p>
//                       <p className="mt-1 text-xs text-slate-500">
//                         {order.client || "Client inconnu"} •{" "}
//                         {STATUS_LABELS[order.status || ""] || order.status || "Statut inconnu"}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


















































/**
 * OverviewSection — Dashboard overview admin
 * @module app/admin/components/OverviewSection
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Tag,
  Users,
  Sparkles,
  TrendingUp,
  Boxes,
  Inbox,
} from "lucide-react";
import api from "@/lib/axios";
import { cn, formatCurrency } from "@/lib/utils";
import { getAdminCategories } from "@/fonctions_api/categories.api";
import { getAdminProducts } from "@/fonctions_api/produits.api";
import type { ProductDetail } from "@/modeles/produits";

import LoadingStyle from "@/components/widgets_originaux/special/loadingStyle";
import ErrorState from "@/components/widgets_originaux/special/ErrorState";

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

// Styles visuels associés à chaque statut (purement cosmétique, n'affecte aucune logique)
const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  PREPARING: "border-purple-200 bg-purple-50 text-purple-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

/* -------------------------------------------------------------------------- */
/*  Variantes d'animation (purement visuelles, aucune logique métier touchée)  */
/* -------------------------------------------------------------------------- */

const containerStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeScale = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <div className="rounded-xl bg-primary/10 p-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Vue d&apos;ensemble basée sur les données du backend
          </p>
        </div>
      </motion.div>

      {loading ? (
        <LoadingStyle label="Chargement des statistiques..." />
      ) : (
        <>
          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              {
                label: "Produits",
                value: stats.products,
                icon: Package,
                tone: "text-slate-700",
                chip: "bg-slate-100",
                bar: "bg-slate-300",
              },
              {
                label: "Commandes",
                value: stats.orders,
                icon: ShoppingCart,
                tone: "text-blue-600",
                chip: "bg-blue-50",
                bar: "bg-blue-400",
              },
              {
                label: "Clients",
                value: stats.users,
                icon: Users,
                tone: "text-emerald-600",
                chip: "bg-emerald-50",
                bar: "bg-emerald-400",
              },
              {
                label: "Catégories",
                value: stats.categories,
                icon: Tag,
                tone: "text-primary",
                chip: "bg-primary/10",
                bar: "bg-primary",
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={fadeScale}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
              >
                <span className={cn("absolute inset-x-0 top-0 h-1 rounded-t-2xl", item.bar)} />
                <div
                  className={cn(
                    "inline-flex rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110",
                    item.chip
                  )}
                >
                  <item.icon className={cn("h-5 w-5", item.tone)} />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{item.value}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-3"
          >
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-1"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-100 p-1.5">
                  <Boxes className="h-4 w-4 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Chiffres rapides</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
                  <span>Produits en stock</span>
                  <span className="font-semibold tabular-nums text-slate-900">{stats.inStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    Revenu (Commandes)
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {formatCurrency(stats.revenue, "FCFA")}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Derniers produits</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {recentProducts.length} visible(s)
                </span>
              </div>
              {recentProducts.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <Inbox className="h-5 w-5 text-slate-400" />
                  Aucun produit backend disponible.
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.sku} •{" "}
                          {formatCurrency(Number.parseFloat(product.price || "0"), "FCFA")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Dernières commandes</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {recentOrders.length} visible(s)
                </span>
              </div>
              {recentOrders.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <Inbox className="h-5 w-5 text-slate-400" />
                  Aucune commande backend disponible.
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                        <ShoppingCart className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {order.reference || `Commande #${order.id}`}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {order.client || "Client inconnu"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          STATUS_STYLES[order.status || ""] ||
                          "border-slate-200 bg-slate-100 text-slate-600"
                        )}
                      >
                        {STATUS_LABELS[order.status || ""] || order.status || "Statut inconnu"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
}