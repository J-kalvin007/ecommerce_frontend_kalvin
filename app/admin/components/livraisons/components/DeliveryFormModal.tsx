"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MapPin, ClipboardList, Tag, FileText, User } from "lucide-react";
import type { Delivery, DeliveryStatus } from "@/modeles/livraisons";
import { createDelivery, updateDelivery } from "@/fonctions_api/livraisons.api";

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery?: Delivery;
  onSuccess: () => void;
}

export default function DeliveryFormModal({ isOpen, onClose, delivery, onSuccess }: DeliveryFormModalProps) {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<DeliveryStatus>("pending");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryPersonId, setDeliveryPersonId] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (delivery) {
      setOrderId(delivery.order);
      setStatus(delivery.status);
      setDeliveryAddress(delivery.delivery_address || "");
      setTrackingNumber(delivery.tracking_number || "");
      setDeliveryPersonId(delivery.delivery_person ? delivery.delivery_person.toString() : "");
      
      // format date for datetime-local input
      if (delivery.estimated_delivery_date) {
        const date = new Date(delivery.estimated_delivery_date);
        const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setEstimatedDate(iso);
      } else {
        setEstimatedDate("");
      }
      
      setNotes(delivery.notes || "");
    } else {
      setOrderId("");
      setStatus("pending");
      setDeliveryAddress("");
      setTrackingNumber("");
      setDeliveryPersonId("");
      setEstimatedDate("");
      setNotes("");
    }
    setError(null);
  }, [delivery, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      order: orderId,
      status,
      delivery_address: deliveryAddress,
      tracking_number: trackingNumber,
      delivery_person: deliveryPersonId ? parseInt(deliveryPersonId) : null,
      estimated_delivery_date: estimatedDate ? new Date(estimatedDate).toISOString() : null,
      actual_delivery_date: status === "delivered" ? new Date().toISOString() : null, // Auto set actual date if delivered
      notes,
      is_active: true,
    };

    let res;
    if (delivery) {
      res = await updateDelivery(delivery.id, payload);
    } else {
      res = await createDelivery(payload);
    }

    setIsSubmitting(false);

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      setError(res.error?.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#E8E3D8] bg-[#F7F5F0] px-6 py-4">
              <h3 className="text-lg font-bold text-[#1f241c]">
                {delivery ? "Modifier la Livraison" : "Créer une Livraison"}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#8A9080] transition-colors hover:bg-[#E8E3D8] hover:text-[#1f241c]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Order ID */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#1f241c]">ID de la Commande (UUID) *</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                    <input
                      type="text"
                      required
                      disabled={!!delivery} // Usually can't change order ID after creation
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20 disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="UUID de la commande"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#1f241c]">Statut *</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
                    className="w-full rounded-xl border border-[#E8E3D8] py-2.5 px-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20 bg-white"
                  >
                    <option value="pending">En attente</option>
                    <option value="in_transit">En transit</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                {/* Tracking Number */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#1f241c]">N° de Suivi</label>
                  <div className="relative">
                    <ClipboardList className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
                      placeholder="Ex: TRK-123456"
                    />
                  </div>
                </div>

                {/* Delivery Person (User ID) */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#1f241c]">ID Livreur</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                    <input
                      type="number"
                      value={deliveryPersonId}
                      onChange={(e) => setDeliveryPersonId(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
                      placeholder="ID de l'utilisateur"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-bold text-[#1f241c]">Adresse de Livraison *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 h-4 w-4 text-[#8A9080]" />
                    <textarea
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20 resize-none"
                      placeholder="Adresse complète"
                    />
                  </div>
                </div>

                {/* Estimated Date */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-bold text-[#1f241c]">Date d'Estimation</label>
                  <input
                    type="datetime-local"
                    value={estimatedDate}
                    onChange={(e) => setEstimatedDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E3D8] py-2.5 px-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-bold text-[#1f241c]">Notes / Instructions</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-4 h-4 w-4 text-[#8A9080]" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20 resize-none"
                      placeholder="Instructions pour le livreur..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E3D8]">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-[#8A9080] transition-colors hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#16332b] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
