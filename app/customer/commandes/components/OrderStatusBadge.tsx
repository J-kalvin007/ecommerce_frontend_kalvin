/**
 * OrderStatusBadge.tsx
 * -----------------------------------------------------------------------------
 * Badge de statut de commande ultra-premium avec icône, label et couleur
 * dynamiques basés sur ORDER_STATUS_MAP du modèle commandes.ts.
 *
 * @module app/customer/commnades/components/OrderStatusBadge
 */

"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CreditCard,
  CheckCircle2,
  ShoppingCart,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/modeles/commandes";
import { ORDER_STATUS_MAP } from "@/modeles/commandes";

/* -- Map des icônes Lucide par statut ------------------------------------ */
const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  draft:           FileText,
  pending_payment: Clock,
  paid:            CreditCard,
  confirmed:       CheckCircle2,
  processing:      ShoppingCart,
  shipped:         Truck,
  delivered:       PackageCheck,
  cancelled:       XCircle,
  refunded:        RotateCcw,
};

/* -- Props ---------------------------------------------------------------- */
interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** Taille du badge : "sm" = compact, "md" = standard (défaut) */
  size?: "sm" | "md";
  /** Afficher l'animation de pulse pour les statuts actifs */
  animated?: boolean;
}

/* -- Statuts considérés comme "actifs" (pulse animé) ---------------------- */
const ACTIVE_STATUSES: OrderStatus[] = ["processing", "shipped", "confirmed", "paid"];

/**
 * OrderStatusBadge
 *
 * Affiche un badge stylisé avec l'icône, la couleur et le label du statut
 * de la commande, avec une animation pulse optionnelle pour les statuts actifs.
 */
export default function OrderStatusBadge({
  status,
  size = "md",
  animated = true,
}: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_MAP[status] ?? ORDER_STATUS_MAP.draft;
  const Icon   = STATUS_ICONS[status] ?? FileText;
  const isActive = animated && ACTIVE_STATUSES.includes(status);

  const sizeClasses = {
    sm: { badge: "px-2 py-0.5 gap-1 text-[10px]", icon: "h-2.5 w-2.5", dot: "h-1.5 w-1.5" },
    md: { badge: "px-3 py-1 gap-1.5 text-[11.5px]", icon: "h-3 w-3", dot: "h-2 w-2" },
  };

  const cls = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.color} ${config.border} ${cls.badge}`}
    >
      {/* Dot pulsant pour les statuts actifs */}
      {isActive ? (
        <span className="relative flex shrink-0">
          <motion.span
            className={`absolute inline-flex rounded-full ${cls.dot} ${config.bg}`}
            animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <span className={`relative inline-flex rounded-full ${cls.dot} bg-current`} />
        </span>
      ) : (
        <Icon className={`shrink-0 ${cls.icon}`} strokeWidth={2} />
      )}
      {config.label}
    </span>
  );
}
