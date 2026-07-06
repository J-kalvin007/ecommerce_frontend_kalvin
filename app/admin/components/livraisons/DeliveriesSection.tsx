// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import { Plus, Settings2, Search, Truck, MapPin, ClipboardList, Trash2, Edit, Star } from "lucide-react";
// import type { Delivery, FraisLivraison } from "@/modeles/livraisons";
// import { DELIVERY_STATUS_MAP } from "@/modeles/livraisons";
// import { getDeliveries, deleteDelivery, getFraisLivraison } from "@/fonctions_api/livraisons.api";
// import FraisLivraisonModal from "./components/FraisLivraisonModal";
// import DeliveryFormModal from "./components/DeliveryFormModal";
// import LoadingStyle from "@/components/special/loadingStyle";
// import ErrorState from "@/components/special/ErrorState";

// export default function DeliveriesSection() {
//   const [deliveries, setDeliveries] = useState<Delivery[]>([]);
//   const [fraisConfig, setFraisConfig] = useState<FraisLivraison | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [isFraisModalOpen, setIsFraisModalOpen] = useState(false);
//   const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
//   const [selectedDelivery, setSelectedDelivery] = useState<Delivery | undefined>();

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const [deliveriesRes, fraisRes] = await Promise.all([
//         getDeliveries({ ordering: "-created_at" }),
//         getFraisLivraison(),
//       ]);

//       if (!deliveriesRes.ok) {
//         throw new Error(deliveriesRes.error?.message || "Erreur de chargement des livraisons");
//       }

//       setDeliveries(deliveriesRes.data);

//       if (fraisRes.ok && fraisRes.data) {
//         setFraisConfig(fraisRes.data);
//       }
//     } catch (err: any) {
//       setError(err.message || "Une erreur est survenue.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleDelete = async (id: string) => {
//     if (confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?")) {
//       const res = await deleteDelivery(id);
//       if (res.ok) {
//         setDeliveries((prev) => prev.filter((d) => d.id !== id));
//       } else {
//         alert(res.error?.message || "Erreur lors de la suppression.");
//       }
//     }
//   };

//   const handleEdit = (delivery: Delivery) => {
//     setSelectedDelivery(delivery);
//     setIsDeliveryModalOpen(true);
//   };

//   const filteredDeliveries = deliveries.filter((d) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       d.order_reference?.toLowerCase().includes(q) ||
//       d.tracking_number?.toLowerCase().includes(q) ||
//       d.delivery_person_name?.toLowerCase().includes(q)
//     );
//   });

//   return (
//     <div className="space-y-6 px-20">
//       {/* -- En-tête -- */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">




//         {/* -- En-tête avec effet premium -- */}
//         <motion.div
//           initial={{ opacity: 0, y: -12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
//           className="flex flex-col gap-2"
//         >
//           <div className="relative inline-block group">
//             <h2
//               className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
//               style={{
//                 letterSpacing: "-0.025em",
//                 backgroundImage:
//                   "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
//                 backgroundSize: "220% auto",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 backgroundClip: "text",
//               }}
//             >
//               <Truck className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
//               Livraisons
//             </h2>

//             {/* Kicker discret en lettres espacées doré, signature premium */}
//             <span
//               className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
//               style={{ color: "#B8924A", opacity: 0.85 }}
//             >
//               Gérez le suivi des expéditions et les frais de livraison.
//             </span>

//             {/* Gradient SVG caché pour l'icône */}
//             <svg width="0" height="0" className="absolute">
//               <defs>
//                 <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                   <stop offset="0%" stopColor="#FDE68A" />
//                   <stop offset="50%" stopColor="#D97706" />
//                   <stop offset="100%" stopColor="#B45309" />
//                 </linearGradient>
//               </defs>
//             </svg>


//             {/* Animations scoppées, avec respect du prefers-reduced-motion */}
//             <style>{`
//             @keyframes premium-title-shine-anim {
//             0%, 100% { background-position: 0% center; }
//             50% { background-position: 100% center; }
//             }
//             .premium-title-shine {
//             animation: premium-title-shine-anim 6s ease-in-out infinite;
//             }
//             @media (prefers-reduced-motion: reduce) {
//             .premium-title-shine {
//                 animation: none;
//             }
//             }
//         `}</style>
//           </div>
//         </motion.div>







//         <div className="flex items-center gap-3">

//           <button
//             onClick={() => setIsFraisModalOpen(true)}
//             className="flex items-center cursor-pointer gap-2 rounded-xl border border-[#E8E3D8] bg-white px-4 py-3 text-[14px] font-semibold text-[#1f241c] shadow-sm transition-all hover:bg-[#F7F5F0]"
//           >
//             <Settings2 className="h-4 w-4" />
//             <span className="hidden sm:inline">Configuration</span>
//           </button>

//           <button
//             onClick={() => {
//               setSelectedDelivery(undefined);
//               setIsDeliveryModalOpen(true);
//             }}
//             className="flex items-center cursor-pointer gap-2 rounded-xl bg-[#1f4d3f] px-4 py-3 text-[14px] font-bold text-gray-100 shadow-sm transition-all hover:bg-[#16332b]"
//           >
//             <Plus className="h-4 w-4" />
//             <span className="hidden sm:inline">Nouvelle Livraison</span>
//           </button>

//         </div>

//       </div>


//       {/* -- Barre de recherche -- */}
//       <div className="relative max-w-md">
//         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
//         <input
//           type="text"
//           placeholder="Rechercher par N° commande, livreur ou tracking..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2.5 pl-9 pr-3 text-[14px] outline-none focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
//         />
//       </div>

//       {/* -- Contenu -- */}
//       {isLoading ? (

//         <div className="flex justify-center py-20">
//           <LoadingStyle label="Chargement des données..." size={16} />
//         </div>

//       ) : error ? (

//         <ErrorState title="Erreur" message={error} buttonText="Réessayer" onRetry={fetchData} />

//       ) : (
//         <div className="rounded-2xl border border-[#E8E3D8] bg-white shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-[#F7F5F0] text-[11px] font-bold uppercase tracking-wider text-[#8A9080]">
//                 <tr>
//                   <th className="px-6 py-4">Commande & Suivi</th>
//                   <th className="px-6 py-4">Statut</th>
//                   <th className="px-6 py-4">Livreur</th>
//                   <th className="px-6 py-4">Détails (Dates & Adresse)</th>
//                   <th className="px-6 py-4 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[#E8E3D8]">
//                 {filteredDeliveries.map((delivery) => {
//                   const statusCfg = DELIVERY_STATUS_MAP[delivery.status];
//                   return (
//                     <motion.tr
//                       key={delivery.id}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       className="group transition-colors hover:bg-slate-50"
//                     >
//                       <td className="px-6 py-4">
//                         <div className="font-bold text-[#1f241c] flex items-center gap-1.5">
//                           {delivery.order_reference}
//                         </div>
//                         <div className="text-[12px] text-[#8A9080] flex items-center gap-1 mt-1">
//                           <ClipboardList className="h-3.5 w-3.5" />
//                           {delivery.tracking_number || "Aucun tracking"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}
//                         >
//                           {statusCfg.label}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-[#1f241c] font-medium">
//                         {delivery.delivery_person_name || "Non assigné"}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col gap-1 text-[12px] text-[#8A9080]">
//                           <div className="flex items-center gap-1.5">
//                             <MapPin className="h-3.5 w-3.5 shrink-0" />
//                             <span className="truncate max-w-[200px]">{delivery.delivery_address || "Non précisée"}</span>
//                           </div>
//                           {delivery.estimated_delivery_date && (
//                             <div className="text-[11px]">Est. : {new Date(delivery.estimated_delivery_date).toLocaleDateString("fr-FR")}</div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => handleEdit(delivery)}
//                             className="p-2 rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
//                             title="Modifier"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(delivery.id)}
//                             className="p-2 rounded-lg text-red-300 transition-colors hover:bg-red-50 hover:text-red-600"
//                             title="Supprimer"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </motion.tr>
//                   );
//                 })}
//                 {filteredDeliveries.length === 0 && (

//                   <tr>
//                     <td colSpan={5} className="px-6 py-12 text-center text-[#8A9080] text-[20px]">
//                       <span className="flex items-center justify-center m-2">
//                         <MapPin className="h-10 w-10 shrink-0" />
//                       </span>
//                       Aucune livraison trouvée.
//                     </td>
//                   </tr>

//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       <FraisLivraisonModal
//         isOpen={isFraisModalOpen}
//         onClose={() => setIsFraisModalOpen(false)}
//         fraisConfig={fraisConfig}
//         onSuccess={fetchData}
//       />

//       {isDeliveryModalOpen && (
//         <DeliveryFormModal
//           isOpen={isDeliveryModalOpen}
//           onClose={() => setIsDeliveryModalOpen(false)}
//           delivery={selectedDelivery}
//           onSuccess={fetchData}
//         />
//       )}
//     </div>
//   );
// }























































// app/admin/components/livraisons/DeliveriesSection.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Settings2, Search, Truck, MapPin, ClipboardList,
  Trash2, Edit, X, Clock, CheckCircle2, XCircle, PackageSearch,
  Loader2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Delivery, FraisLivraison, DeliveryStatus } from "@/modeles/livraisons";
import { DELIVERY_STATUS_MAP } from "@/modeles/livraisons";
import { getDeliveries, deleteDelivery, getFraisLivraison } from "@/fonctions_api/livraisons.api";
import FraisLivraisonModal from "./components/FraisLivraisonModal";
import DeliveryFormModal from "./components/DeliveryFormModal";
import LoadingStyle from "@/components/special/loadingStyle";
import ErrorState from "@/components/special/ErrorState";
import Toast from "@/components/notifications/Toast";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import EmptyState from "@/components/special/EmptyState";

// --- Icônes associées à chaque statut de livraison ----------------------------
// Encode visuellement la progression logistique (attente → transit → livrée / annulée)
const STATUS_ICON: Record<DeliveryStatus, React.ElementType> = {
  pending: Clock,
  in_transit: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

// --- KPI card (identique à la charte utilisée dans Commandes) ----------------

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
        active
          ? "border-[#0D2E1E] bg-[#0D2E1E] text-gray-100 shadow-lg shadow-[#0D2E1E]/20 dark:border-white dark:bg-[#0D2E1E] dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-[#121212] dark:text-gray-100 dark:hover:bg-slate-800"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40",
          !active && accentClass
        )}
      />
      <div className="flex items-center gap-2">
        <span className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-white/15 text-gray-100 dark:text-slate-900" : cn(iconColorClass)
        )}>
          {icon}
        </span>
        <span className={cn("text-[11px] font-bold uppercase tracking-widest", active ? "text-gray-100 dark:text-slate-900/80" : "text-slate-500")}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight">
        {value}
      </p>
    </button>
  );
}

// --- Pastille de statut --------------------------------------------------------

function StatusPill({ status }: { status: DeliveryStatus }) {
  const cfg = DELIVERY_STATUS_MAP[status];
  if (!cfg) return null;
  const Icon = STATUS_ICON[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap",
      cfg.bg, cfg.color, cfg.border
    )}>
      {Icon && <Icon className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

// --- Section principale ---------------------------------------------------------

export default function DeliveriesSection() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [fraisConfig, setFraisConfig] = useState<FraisLivraison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "ALL">("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const [isFraisModalOpen, setIsFraisModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | undefined>();

  // Suppression : identifiant en attente de confirmation + identifiant en cours de suppression
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false, type: "success", message: "",
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [deliveriesRes, fraisRes] = await Promise.all([
        getDeliveries({ ordering: "-created_at" }),
        getFraisLivraison(),
      ]);

      if (!deliveriesRes.ok) {
        throw new Error(deliveriesRes.error?.message || "Erreur de chargement des livraisons");
      }

      setDeliveries(deliveriesRes.data);

      if (fraisRes.ok && fraisRes.data) {
        setFraisConfig(fraisRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ouvre la confirmation avant toute suppression définitive
  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setPendingDeleteId(null);
    const res = await deleteDelivery(id);
    if (res.ok) {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
      setToast({ show: true, type: "success", message: "Livraison supprimée avec succès." });
    } else {
      setToast({ show: true, type: "error", message: res.error?.message || "Erreur lors de la suppression." });
    }
    setDeletingId(null);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDeliveryModalOpen(true);
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        d.order_reference?.toLowerCase().includes(q) ||
        d.tracking_number?.toLowerCase().includes(q) ||
        d.delivery_person_name?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchQuery, statusFilter]);

  // Comptages utilisés à la fois par les cartes KPI et les pastilles de filtre
  const stats = useMemo(() => ({
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "pending").length,
    in_transit: deliveries.filter((d) => d.status === "in_transit").length,
    delivered: deliveries.filter((d) => d.status === "delivered").length,
    cancelled: deliveries.filter((d) => d.status === "cancelled").length,
  }), [deliveries]);

  if (error && deliveries.length === 0) {
    return <ErrorState title="Erreur" message={error} buttonText="Réessayer" onRetry={() => fetchData()} />;
  }

  return (
    <>
      {/* Toast de retour d'action */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) void handleDelete(pendingDeleteId);
        }}
        title="Supprimer la livraison"
        message="Cette action est définitive et ne peut pas être annulée. Voulez-vous vraiment supprimer cette livraison ?"
        confirmText="Supprimer"
        type="danger"
        isLoading={!!deletingId}
      />

      <div className="space-y-8 px-4 sm:px-8 lg:px-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* -- En-tête -- */}
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
                className="premium-title-shine relative flex items-center gap-3 text-2xl font-black uppercase tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl"
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
                <Truck className="h-10 w-10 shrink-0 text-amber-500" style={{ fill: "url(#gold-gradient-delivery)" }} />
                Livraisons
              </h2>

              {/* Kicker discret en lettres espacées doré, signature premium */}
              <span
                className="mb-2 mt-2 block text-[11px] font-semibold uppercase tracking-[0.35em]"
                style={{ color: "#B8924A", opacity: 0.85 }}
              >
                Gérez le suivi des expéditions et les frais de livraison.
              </span>

              {/* Gradient SVG caché pour l'icône */}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="gold-gradient-delivery" x1="0%" y1="0%" x2="100%" y2="100%">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:border-[#0D2E1E]/30 hover:text-[#0D2E1E] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-[#121212] dark:text-slate-400 dark:hover:text-white"
              title="Actualiser"
            >
              <RefreshCw className={cn("h-4 w-4 transition-transform", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFraisModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-[#121212] dark:text-gray-100 dark:hover:bg-slate-800"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDelivery(undefined);
                setIsDeliveryModalOpen(true);
              }}
              className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-[#0D2E1E] px-4 py-3 text-[14px] font-bold text-gray-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0D2E1E]/20 dark:bg-white dark:text-slate-900"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouvelle Livraison</span>
            </button>
          </div>
        </div>

        {/* -- KPI cards -- */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <KPICard
            label="Toutes"
            value={stats.total}
            icon={<Truck className="h-4 w-4" />}
            accentClass="bg-slate-400"
            iconColorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />
          <KPICard
            label={DELIVERY_STATUS_MAP.pending?.label || "En attente"}
            value={stats.pending}
            icon={<Clock className="h-4 w-4" />}
            accentClass="bg-amber-400"
            iconColorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            active={statusFilter === "pending"}
            onClick={() => setStatusFilter("pending")}
          />
          <KPICard
            label={DELIVERY_STATUS_MAP.in_transit?.label || "En transit"}
            value={stats.in_transit}
            icon={<Truck className="h-4 w-4" />}
            accentClass="bg-blue-400"
            iconColorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            active={statusFilter === "in_transit"}
            onClick={() => setStatusFilter("in_transit")}
          />
          <KPICard
            label={DELIVERY_STATUS_MAP.delivered?.label || "Livrées"}
            value={stats.delivered}
            icon={<CheckCircle2 className="h-4 w-4" />}
            accentClass="bg-emerald-400"
            iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            active={statusFilter === "delivered"}
            onClick={() => setStatusFilter("delivered")}
          />
          <KPICard
            label={DELIVERY_STATUS_MAP.cancelled?.label || "Annulées"}
            value={stats.cancelled}
            icon={<XCircle className="h-4 w-4" />}
            accentClass="bg-red-400"
            iconColorClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            active={statusFilter === "cancelled"}
            onClick={() => setStatusFilter("cancelled")}
          />
        </div>

        {/* -- Barre de recherche -- */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, livreur ou tracking…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/60 bg-white pl-11 pr-10 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-[#121212] dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* -- Contenu -- */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement des données..." size={16} />
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <EmptyState
            title="Aucune livraison trouvée"
            description={
              searchQuery
                ? `Aucun résultat pour "${searchQuery}". Essayez de modifier votre recherche.`
                : "Aucune livraison ne correspond à ces critères."
            }
            icon={PackageSearch}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#121212]">
            {/* -- Vue tableau : md et plus -- */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Commande &amp; Suivi</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Livreur</th>
                    <th className="px-6 py-4">Détails (Dates &amp; Adresse)</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <AnimatePresence mode="popLayout">
                    {filteredDeliveries.map((delivery) => (
                      <motion.tr
                        key={delivery.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2 }}
                        className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            {delivery.order_reference}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
                            <ClipboardList className="h-3.5 w-3.5" />
                            {delivery.tracking_number || "Aucun tracking"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={delivery.status} />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {delivery.delivery_person_name || (
                            <span className="italic text-slate-400 dark:text-slate-500">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-[12px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="max-w-[220px] truncate">{delivery.delivery_address || "Non précisée"}</span>
                            </div>
                            {delivery.estimated_delivery_date && (
                              <div className="text-[11px]">
                                Est. : {new Date(delivery.estimated_delivery_date).toLocaleDateString("fr-FR")}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(delivery)}
                              className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(delivery.id)}
                              disabled={deletingId === delivery.id}
                              className="cursor-pointer rounded-lg p-2 text-red-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                              title="Supprimer"
                            >
                              {deletingId === delivery.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* -- Vue cartes : mobile uniquement -- */}
            <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredDeliveries.map((delivery) => (
                  <motion.div
                    key={delivery.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{delivery.order_reference}</p>
                        <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {delivery.tracking_number || "Aucun tracking"}
                        </div>
                      </div>
                      <StatusPill status={delivery.status} />
                    </div>

                    <div className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{delivery.delivery_address || "Adresse non précisée"}</span>
                    </div>

                    <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400">
                      <span>{delivery.delivery_person_name || "Livreur non assigné"}</span>
                      {delivery.estimated_delivery_date && (
                        <span>Est. {new Date(delivery.estimated_delivery_date).toLocaleDateString("fr-FR")}</span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleEdit(delivery)}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Edit className="h-3.5 w-3.5" /> Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(delivery.id)}
                        disabled={deletingId === delivery.id}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                      >
                        {deletingId === delivery.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Supprimer
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <FraisLivraisonModal
        isOpen={isFraisModalOpen}
        onClose={() => setIsFraisModalOpen(false)}
        fraisConfig={fraisConfig}
        onSuccess={fetchData}
      />

      {isDeliveryModalOpen && (
        <DeliveryFormModal
          isOpen={isDeliveryModalOpen}
          onClose={() => setIsDeliveryModalOpen(false)}
          delivery={selectedDelivery}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}