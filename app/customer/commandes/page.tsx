/**
 * page.tsx
 * -----------------------------------------------------------------------------
 * Page principale de gestion des commandes client.
 * Intégrée dans le CustomerShell.
 * 
 * @module app/customer/commnades/page
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Grid, List, SlidersHorizontal, Calendar, DollarSign } from "lucide-react";
import CustomerShell from "@/app/customer/components/CustomerShell";
import ErrorState from "@/components/special/ErrorState";
import EmptyState from "@/components/special/EmptyState";
import Toast from "@/components/special/Toast";
import LoadingStyle from "@/components/special/loadingStyle";

import {
  getMyOrders,
  getMyOrderByReference,
  getOrderHistory,
  cancelMyOrder,
} from "@/fonctions_api/commandes.api";
import type { OrderList, OrderDetail, OrderHistory } from "@/modeles/commandes";

import OrderCard from "./components/OrderCard";
import OrderDetailModal from "./components/OrderDetailModal";
import OrdersStats from "./components/OrdersStats";
import OrdersFilter, { FilterStatus } from "./components/OrdersFilter";

export default function CustomerOrdersPage() {
  /* -- State principal (Liste) ------------------------------------------ */
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -- State Filtres & Recherche -------------------------------------- */
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  /* -- State Modale de détail ----------------------------------------- */
  const [selectedOrderRef, setSelectedOrderRef] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  /* -- State Notification --------------------------------------------- */
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false, type: "info", message: "",
  });

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  };

  /* -- Fetch : Liste des commandes ------------------------------------ */
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getMyOrders();
    if (result.ok) {
      if (result.data) {
        setOrders(result.data);
      }
    } else {
      setError(result.error?.message || "Impossible de charger vos commandes.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* -- Actions : Modale de détail ------------------------------------- */
  const handleViewOrder = useCallback(async (reference: string) => {
    setSelectedOrderRef(reference);
    setOrderDetail(null);
    setOrderHistory([]);
    setIsLoadingDetail(true);

    const result = await getMyOrderByReference(reference);
    if (result.ok && result.data) {
      setOrderDetail(result.data);
    } else {
      showToast("error", "Impossible de charger le détail de la commande.");
      setSelectedOrderRef(null);
    }
    setIsLoadingDetail(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrderRef(null);
    setOrderDetail(null);
    setOrderHistory([]);
  }, []);

  const handleLoadHistory = useCallback(async () => {
    if (!selectedOrderRef) return;
    setIsLoadingHistory(true);
    const result = await getOrderHistory(selectedOrderRef);
    if (result.ok && result.data) {
      setOrderHistory(result.data);
    } else {
      showToast("error", "Impossible de charger l'historique.");
    }
    setIsLoadingHistory(false);
  }, [selectedOrderRef]);

  const handleCancelOrder = useCallback(async () => {
    if (!selectedOrderRef) return;
    setIsCancelling(true);
    const result = await cancelMyOrder(selectedOrderRef);
    setIsCancelling(false);

    if (result.ok) {
      showToast("success", "Votre commande a été annulée avec succès.");
      handleCloseModal();
      fetchOrders(); // Rafraîchir la liste
    } else {
      showToast("error", result.error?.message || "Échec de l'annulation.");
    }
  }, [selectedOrderRef, fetchOrders, handleCloseModal]);

  /* -- Filtrage côté client ------------------------------------------- */
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // 1. Filtre par statut
      if (activeFilter !== "all" && order.status !== activeFilter) return false;
      // 2. Recherche par référence
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!order.reference.toLowerCase().includes(query)) return false;
      }
      return true;
    });

    // Tri
    result = result.sort((a, b) => {
      if (sortBy.includes("date")) {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortBy === "date_desc" ? dateB - dateA : dateA - dateB;
      } else {
        const amountA = parseFloat(a.total_final || "0");
        const amountB = parseFloat(b.total_final || "0");
        return sortBy === "amount_desc" ? amountB - amountA : amountA - amountB;
      }
    });

    return result;
  }, [orders, activeFilter, searchQuery, sortBy]);


  /* -- Rendu principal ------------------------------------------------ */
  return (
    <CustomerShell activeSection="orders">
      <div className="mx-auto max-w-8xl px-20 py-8 lg:px-20 space-y-8">

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
              <ShoppingBag className="h-9 w-9 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Mes Commandes
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Consultez, suivez et gérez l'historique de vos achats.
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
















        {/* -- Chargement global -- */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement de vos commandes…" size={16} />
          </div>
        ) : error ? (
          /* -- Erreur globale -- */
          <ErrorState
            title="Oups ! Erreur de chargement"
            message={error}
            buttonText="Réessayer"
            onRetry={fetchOrders}
          />
        ) : orders.length === 0 ? (
          /* -- État vide global (0 commandes au total) -- */
          <EmptyState
            title="Aucune commande trouvée"
            description="Vous n'avez pas encore passé de commande. Explorez notre boutique pour découvrir nos produits d'exception."
            icon={ShoppingBag}
            actionText="Découvrir la boutique"
            onAction={() => window.location.href = "/"}
          />
        ) : (
          /* -- Contenu principal (liste chargée) -- */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Statistiques (sur TOUTES les commandes) */}
            <OrdersStats orders={orders} />

            {/* Barre de contrôle : Filtres + Recherche */}
            <div className="sticky top-[72px] z-20 -mx-4 px-4 py-3 sm:mx-0 sm:px-0 bg-white/80 backdrop-blur-xl sm:bg-transparent sm:backdrop-blur-none border-b border-[#E8E3D8] sm:border-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <OrdersFilter
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    orders={orders}
                  />
                </div>

                {/* Champ de recherche + Vues + Filtres Avancés */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="absolute left-3.5 top-1/2 cursor-pointer -translate-y-1/2 h-4 w-4 text-[#8A9080]" />
                    <input
                      type="text"
                      placeholder="Rechercher (ex: REF-123)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2 pl-10 pr-4 text-[13px] text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20 placeholder:text-[#8A9080]/70"
                    />
                  </div>

                  {/* Bouton Filtres Avancés */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center cursor-pointer justify-center p-2 rounded-xl border transition-colors ${showAdvancedFilters
                      ? "bg-[#1f4d3f] border-[#1f4d3f] text-white"
                      : "bg-white border-[#E8E3D8] text-[#1f241c] hover:bg-[#F7F5F0]"
                      }`}
                    title="Filtres avancés"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </button>

                  {/* Boutons Vue */}
                  <div className="flex items-center p-1 rounded-xl bg-white border border-[#E8E3D8]">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === "grid" ? "bg-[#F7F5F0] text-[#1f4d3f]" : "text-[#8A9080] hover:text-[#1f241c]"}`}
                      title="Vue Grille"
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === "list" ? "bg-[#F7F5F0] text-[#1f4d3f]" : "text-[#8A9080] hover:text-[#1f241c]"}`}
                      title="Vue Liste"
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Filtres Avancés */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-[#E8E3D8] flex flex-wrap gap-4 items-center">
                      <span className="text-[14px] font-semibold text-[#1f241c] mr-2">Trier par :</span>

                      <button
                        onClick={() => setSortBy("date_desc")}
                        className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-lg text-[14px] transition-colors ${sortBy === "date_desc" ? "bg-white border border-[#1f4d3f] text-[#1f4d3f] shadow-sm" : "bg-transparent border border-transparent text-[#8A9080] hover:bg-white/60 hover:text-[#1f241c]"}`}
                      >
                        <Calendar className="h-4 w-4" /> Date (Plus récent)
                      </button>
                      <button
                        onClick={() => setSortBy("date_asc")}
                        className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-lg text-[14px] transition-colors ${sortBy === "date_asc" ? "bg-white border border-[#1f4d3f] text-[#1f4d3f] shadow-sm" : "bg-transparent border border-transparent text-[#8A9080] hover:bg-white/60 hover:text-[#1f241c]"}`}
                      >
                        <Calendar className="h-4 w-4" /> Date (Plus ancien)
                      </button>
                      <button
                        onClick={() => setSortBy("amount_desc")}
                        className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-lg text-[14px] transition-colors ${sortBy === "amount_desc" ? "bg-white border border-[#1f4d3f] text-[#1f4d3f] shadow-sm" : "bg-transparent border border-transparent text-[#8A9080] hover:bg-white/60 hover:text-[#1f241c]"}`}
                      >
                        <DollarSign className="h-4 w-4" /> Montant (Décroissant)
                      </button>
                      <button
                        onClick={() => setSortBy("amount_asc")}
                        className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-lg text-[14px] transition-colors ${sortBy === "amount_asc" ? "bg-white border border-[#1f4d3f] text-[#1f4d3f] shadow-sm" : "bg-transparent border border-transparent text-[#8A9080] hover:bg-white/60 hover:text-[#1f241c]"}`}
                      >
                        <DollarSign className="h-4 w-4" /> Montant (Croissant)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Liste filtrée */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-10"
                  >
                    <EmptyState
                      title="Aucun résultat"
                      description="Aucune commande ne correspond à vos critères de recherche ou de filtre."
                      icon={Search}
                      actionText="Réinitialiser les filtres"
                      onAction={() => {
                        setActiveFilter("all");
                        setSearchQuery("");
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                        : "flex flex-col gap-4"
                    }
                  >
                    {filteredOrders.map((order, idx) => (
                      <OrderCard
                        key={order.reference}
                        order={order}
                        index={idx}
                        onView={handleViewOrder}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modale de détail (ouverte uniquement si selectedOrderRef != null) */}
      <OrderDetailModal
        isOpen={!!selectedOrderRef}
        onClose={handleCloseModal}
        order={orderDetail}
        history={orderHistory}
        isLoadingOrder={isLoadingDetail}
        isLoadingHistory={isLoadingHistory}
        isCancelling={isCancelling}
        onCancelOrder={handleCancelOrder}
        onLoadHistory={handleLoadHistory}
      />

      {/* Notifications */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
        position="bottom-right"
      />
    </CustomerShell>
  );
}
