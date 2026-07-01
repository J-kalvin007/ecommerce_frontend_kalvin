/**
 * livraisons.ts — Modèles TypeScript pour les livraisons
 * -----------------------------------------------------------------------------
 * Synchronisé avec le schéma OpenAPI : GET /api/v1/livraisons/suivi/
 *
 * @module modeles/livraisons
 */

/** Statuts possibles d'une livraison */
export type DeliveryStatus = "pending" | "in_transit" | "delivered" | "cancelled";

/** Libellés lisibles par statut */
export const DELIVERY_STATUS_MAP: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; border: string; step: number }
> = {
  pending: {
    label: "En attente",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    step: 1,
  },
  in_transit: {
    label: "En transit",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    step: 2,
  },
  delivered: {
    label: "Livrée",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    step: 3,
  },
  cancelled: {
    label: "Annulée",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    step: 0,
  },
};

/** Objet Livraison retourné par l'API */
export interface Delivery {
  id: string;
  order: string;
  order_reference: string;
  status: DeliveryStatus;
  delivery_address: string;
  tracking_number: string;
  delivery_person: number | null;
  delivery_person_name: string;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type PatchedDelivery = Partial<
  Omit<Delivery, "id" | "order_reference" | "delivery_person_name" | "created_at" | "updated_at">
>;

export interface FraisLivraison {
  id: string;
  prix_livraison: string;
  coordonnee_admin: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type PatchedFraisLivraison = Partial<
  Omit<FraisLivraison, "id" | "created_at" | "updated_at">
>;
