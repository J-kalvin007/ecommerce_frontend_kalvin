/**
 * OrderCard.tsx
 * -----------------------------------------------------------------------------
 * Carte de commande premium pour la liste des commandes client.
 *
 * Affiche : référence, statut, date, montant, nombre d'articles,
 * avec des animations d'entrée en stagger et des interactions hover élégantes.
 *
 * @module app/customer/commnades/components/OrderCard
 */

"use client";

import { motion } from "framer-motion";
import { Package, ChevronRight, Calendar, ShoppingBag, MapPin } from "lucide-react";
import type { OrderList } from "@/modeles/commandes";
import OrderStatusBadge from "./OrderStatusBadge";

/* -- Utilitaires ---------------------------------------------------------- */

/**
 * Formate un montant string (ex: "35900") en devise FCFA.
 */
function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "— FCFA";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + " FCFA";
}

/**
 * Formate une date ISO en date lisible française.
 */
function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/* -- Props ---------------------------------------------------------------- */
interface OrderCardProps {
  order: OrderList;
  index: number;
  onView: (reference: string) => void;
}

/**
 * OrderCard
 *
 * Carte interactive premium pour afficher un résumé de commande.
 * Entrée staggerée, hover avec lift et glow subtil, indicateur visuel
 * du statut, accès au détail en un clic.
 */
export default function OrderCard({ order, index, onView }: OrderCardProps) {
  const totalFinal = formatAmount(order.total_final);
  const formattedDate = formatDate(order.created_at);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -2, scale: 1.004 }}
      className="group relative overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-[0_2px_12px_-4px_rgba(31,77,63,0.06)] transition-shadow duration-300 hover:border-[#1f4d3f]/20 hover:shadow-[0_8px_32px_-8px_rgba(31,77,63,0.12)] cursor-pointer"
      onClick={() => onView(order.reference)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView(order.reference)}
      aria-label={`Voir la commande ${order.reference}`}
    >
      {/* Liseré coloré gauche selon le statut */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
        style={{
          background:
            order.status === "delivered" ? "linear-gradient(180deg, #10b981, #059669)" :
              order.status === "shipped" ? "linear-gradient(180deg, #06b6d4, #0284c7)" :
                order.status === "processing" ? "linear-gradient(180deg, #f59e0b, #d97706)" :
                  order.status === "confirmed" ? "linear-gradient(180deg, #3b82f6, #2563eb)" :
                    order.status === "cancelled" ? "linear-gradient(180deg, #ef4444, #dc2626)" :
                      order.status === "paid" ? "linear-gradient(180deg, #22c55e, #16a34a)" :
                        "linear-gradient(180deg, #94a3b8, #64748b)",
        }}
      />

      <div className="flex items-center gap-4 pl-5 pr-4 py-4 sm:py-5">

        {/* Icône commande */}
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] text-[#1f4d3f]/60 transition-colors group-hover:border-[#1f4d3f]/15 group-hover:bg-[#1f4d3f]/5 group-hover:text-[#1f4d3f]">
          <Package className="h-5 w-5" strokeWidth={1.6} />
        </div>

        {/* Infos principales */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Ligne 1 : référence + badge statut */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-bold tracking-tight text-[#1f241c]">
              {order.reference}
            </span>
            <OrderStatusBadge status={order.status} size="sm" animated />
          </div>

          {/* Ligne 2 : date + frais livraison */}
          <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#8A9080]">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            {parseFloat(order.frais_livraison) > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Livraison : {formatAmount(order.frais_livraison)}
              </span>
            )}
          </div>
        </div>

        {/* Montant total */}
        <div className="shrink-0 text-right">
          <p className="text-[14px] font-black tracking-tight text-[#1f4d3f]">
            {totalFinal}
          </p>
          <p className="mt-0.5 text-[14px] text-[#8A9080]">
            Total TTC
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          className="ml-1 shrink-0 text-[#1f4d3f]/30 transition-colors group-hover:text-[#1f4d3f]"
          animate={{ x: 0 }}
          whileHover={{ x: 2 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.article>
  );
}
