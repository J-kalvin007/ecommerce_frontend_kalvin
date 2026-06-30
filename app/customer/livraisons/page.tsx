"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Search, Map, Inbox } from "lucide-react";
import CustomerShell from "@/app/customer/components/CustomerShell";
import ErrorState from "@/components/special/ErrorState";
import LoadingStyle from "@/components/special/loadingStyle";
import EmptyState from "@/components/special/EmptyState";
import { getMyDeliveries } from "@/fonctions_api/livraisons.api";
import type { Delivery, DeliveryStatus } from "@/modeles/livraisons";
import DeliveryList from "./components/DeliveryList";

export default function CustomerDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DeliveryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await getMyDeliveries({ ordering: "-created_at" });
    if (res.ok) {
      setDeliveries(res.data || []);
    } else {
      setError(res.error?.message || "Erreur de chargement des livraisons");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchTab = activeTab === "all" || d.status === activeTab;
      const matchSearch =
        d.order_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.tracking_number && d.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [deliveries, activeTab, searchQuery]);

  return (
    <CustomerShell activeSection="orders">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── En-tête Premium ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="relative inline-block group">
            <h2
              className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl premium-title-shine flex items-center gap-3"
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
              <Truck className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Suivi des Livraisons
            </h2>
            <span
              className="block text-[13px] font-semibold uppercase tracking-[0.35em] mt-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Suivez l'acheminement de vos commandes en temps réel.
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

            {/* Animations scoppées */}
            <style>{`
              @keyframes premium-title-shine-anim {
                0%, 100% { background-position: 0% center; }
                50% { background-position: 100% center; }
              }
              .premium-title-shine {
                animation: premium-title-shine-anim 6s ease-in-out infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .premium-title-shine { animation: none; }
              }
            `}</style>
          </div>
        </motion.div>

        {/* ── Contenu ── */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement de vos livraisons…" size={16} />
          </div>
        ) : error ? (
          <ErrorState
            title="Impossible de charger les livraisons"
            message={error}
            buttonText="Réessayer"
            onRetry={fetchDeliveries}
          />
        ) : deliveries.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={Map}
              title="Aucune livraison"
              description="Vous n'avez aucune livraison en cours pour le moment. Vos futures expéditions apparaîtront ici."
              actionText="Voir mes commandes"
              onAction={() => window.location.href = "/customer/commandes"}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Barre de contrôles (Onglets & Recherche) */}
            <div className="sticky top-[72px] z-10 -mx-4 border-b border-[#E8E3D8] bg-white/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {[
                  { id: "all", label: "Toutes" },
                  { id: "pending", label: "En attente" },
                  { id: "in_transit", label: "En transit" },
                  { id: "delivered", label: "Livrées" },
                  { id: "cancelled", label: "Annulées" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-[14px] font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#1f4d3f] text-white shadow-sm"
                        : "bg-[#F7F5F0] text-[#8A9080] hover:bg-[#EEE9E0] hover:text-[#1f241c]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2 pl-9 pr-3 text-[14px] text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/15 placeholder:text-[#8A9080]/60"
                />
              </div>
            </div>

            {/* Grille des livraisons */}
            {filteredDeliveries.length === 0 ? (
               <div className="pt-8">
                 <EmptyState
                    icon={Inbox}
                    title="Aucun résultat"
                    description="Aucune livraison ne correspond à vos filtres actuels."
                    actionText={searchQuery ? "Effacer la recherche" : undefined}
                    onAction={() => setSearchQuery("")}
                 />
               </div>
            ) : (
              <DeliveryList deliveries={filteredDeliveries} />
            )}
          </motion.div>
        )}
      </div>
    </CustomerShell>
  );
}
