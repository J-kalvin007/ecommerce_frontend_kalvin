"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Settings2, Search, Truck, MapPin, ClipboardList, Trash2, Edit } from "lucide-react";
import type { Delivery, FraisLivraison } from "@/modeles/livraisons";
import { DELIVERY_STATUS_MAP } from "@/modeles/livraisons";
import { getDeliveries, deleteDelivery, getFraisLivraison } from "@/fonctions_api/livraisons.api";
import LoadingStyle from "@/components/widgets_originaux/special/loadingStyle";
import ErrorState from "@/components/widgets_originaux/special/ErrorState";
import FraisLivraisonModal from "./FraisLivraisonModal";
import DeliveryFormModal from "./DeliveryFormModal";

export default function DeliveriesSection() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [fraisConfig, setFraisConfig] = useState<FraisLivraison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFraisModalOpen, setIsFraisModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | undefined>();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
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
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?")) {
      const res = await deleteDelivery(id);
      if (res.ok) {
        setDeliveries((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(res.error?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDeliveryModalOpen(true);
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.order_reference?.toLowerCase().includes(q) ||
      d.tracking_number?.toLowerCase().includes(q) ||
      d.delivery_person_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1f241c] flex items-center gap-2">
            <Truck className="h-6 w-6 text-[#1f4d3f]" />
            Livraisons
          </h1>
          <p className="text-[13px] text-[#8A9080] mt-1 font-medium">
            Gérez le suivi des expéditions et les frais de livraison.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFraisModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#E8E3D8] bg-white px-4 py-2 text-[13px] font-semibold text-[#1f241c] shadow-sm transition-all hover:bg-[#F7F5F0]"
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </button>
          <button
            onClick={() => {
              setSelectedDelivery(undefined);
              setIsDeliveryModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#16332b]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle Livraison</span>
          </button>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
        <input
          type="text"
          placeholder="Rechercher par N° commande, livreur ou tracking..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2.5 pl-9 pr-3 text-[14px] outline-none focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
        />
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingStyle label="Chargement des données..." size={16} />
        </div>
      ) : error ? (
        <ErrorState title="Erreur" message={error} buttonText="Réessayer" onRetry={fetchData} />
      ) : (
        <div className="rounded-2xl border border-[#E8E3D8] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F5F0] text-[11px] font-bold uppercase tracking-wider text-[#8A9080]">
                <tr>
                  <th className="px-6 py-4">Commande & Suivi</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Livreur</th>
                  <th className="px-6 py-4">Détails (Dates & Adresse)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8]">
                {filteredDeliveries.map((delivery) => {
                  const statusCfg = DELIVERY_STATUS_MAP[delivery.status];
                  return (
                    <motion.tr
                      key={delivery.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1f241c] flex items-center gap-1.5">
                          {delivery.order_reference}
                        </div>
                        <div className="text-[12px] text-[#8A9080] flex items-center gap-1 mt-1">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {delivery.tracking_number || "Aucun tracking"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#1f241c] font-medium">
                        {delivery.delivery_person_name || "Non assigné"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-[12px] text-[#8A9080]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{delivery.delivery_address || "Non précisée"}</span>
                          </div>
                          {delivery.estimated_delivery_date && (
                             <div className="text-[11px]">Est. : {new Date(delivery.estimated_delivery_date).toLocaleDateString("fr-FR")}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(delivery)}
                            className="p-2 rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(delivery.id)}
                            className="p-2 rounded-lg text-red-300 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filteredDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#8A9080]">
                      Aucune livraison trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
    </div>
  );
}
