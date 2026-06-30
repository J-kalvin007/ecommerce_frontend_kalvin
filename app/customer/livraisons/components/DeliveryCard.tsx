"use client";

import { motion } from "framer-motion";
import { Package, Truck, Calendar, MapPin, ClipboardList, Clock } from "lucide-react";
import type { Delivery } from "@/modeles/livraisons";
import { DELIVERY_STATUS_MAP } from "@/modeles/livraisons";
import DeliveryTimeline from "./DeliveryTimeline";

interface DeliveryCardProps {
  delivery: Delivery;
  index: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Non défini";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function DeliveryCard({ delivery, index }: DeliveryCardProps) {
  const statusCfg = DELIVERY_STATUS_MAP[delivery.status] || DELIVERY_STATUS_MAP.pending;
  const StatusIcon = delivery.status === 'delivered' ? Package : Truck;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-[#E8E3D8] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#D0CCC4] cursor-pointer"
    >
      {/* ── Status Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${statusCfg.bg} ${statusCfg.border} transition-transform duration-300 group-hover:scale-105`}
          >
            <StatusIcon className={`h-6 w-6 ${statusCfg.color}`} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#8A9080]">
              Commande {delivery.order_reference}
            </p>
            <h3 className="text-[18px] font-black tracking-tight text-[#1f241c]">
              Suivi de livraison
            </h3>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-xl border text-[13px] font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
        >
          {statusCfg.label}
        </div>
      </div>

      {/* ── Tracking Info ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 rounded-2xl bg-[#F7F5F0] p-4 border border-[#E8E3D8]">
        <div className="flex items-start gap-2.5">
          <ClipboardList className="h-4 w-4 text-[#8A9080] mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9080]">N° Suivi</p>
            <p className="text-[14px] font-bold text-[#1f241c] break-all">{delivery.tracking_number || "Non attribué"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="h-4 w-4 text-[#8A9080] mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9080]">Adresse</p>
            <p className="text-[14px] font-bold text-[#1f241c] line-clamp-2">{delivery.delivery_address || "Non précisée"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Clock className="h-4 w-4 text-[#8A9080] mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9080]">Estimation</p>
            <p className="text-[14px] font-bold text-[#1f241c]">{formatDate(delivery.estimated_delivery_date)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Calendar className="h-4 w-4 text-[#8A9080] mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9080]">Actualisation</p>
            <p className="text-[14px] font-bold text-[#1f241c]">{formatDate(delivery.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="mt-4 border-t border-[#E8E3D8] pt-4">
         <DeliveryTimeline currentStatus={delivery.status} />
      </div>
      
      {delivery.notes && (
        <div className="mt-6 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900 border border-amber-100">
          <strong className="font-bold">Note : </strong> {delivery.notes}
        </div>
      )}
    </motion.div>
  );
}
