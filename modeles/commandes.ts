

// modeles/commandes.ts
export type OrderStatus =
    | "draft"
    | "pending_payment"
    | "paid"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";

export interface OrderList {
    id: string;
    reference: string;
    status: OrderStatus;
    items_total: string;
    frais_livraison: string;
    total_final: string;
    created_at: string;
}

export interface OrderItem {
    id: string;
    product: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
}

export interface OrderDetail {
    id: string;
    reference: string;
    status: OrderStatus;
    address_livraison: string;
    phone_livraison: string;
    city: string;
    country: string;
    items_total: string;
    frais_livraison: string;
    discount_amount: string;
    tax_amount: string;
    total_final: string;
    notes: string;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

export interface UpdateOrderStatusPayload {
    status: OrderStatus;
    comment?: string;
}

export interface OrderHistory {
    id: string;
    old_status: string;
    new_status: string;
    comment: string;
    created_at: string;
    changed_by_email: string;
}

export interface CheckoutItem {
    product_id: string;
    quantity: number;
}

export interface CheckoutPayload {
    address_livraison: string;
    phone_livraison: string;
    city: string;
    country: string;
    notes?: string;
    frais_livraison?: number;
    discount_amount?: number;
    items: CheckoutItem[];
}

export interface AdminOrderFilters {
    created_after?: string;
    created_before?: string;
    reference?: string;
    status?: OrderStatus | string;
}

// Map des statuts avec leurs labels et couleurs
export const ORDER_STATUS_MAP: Record<OrderStatus, {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
}> = {
    draft: { label: "Brouillon", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: "FileText" },
    pending_payment: { label: "Paiement en attente", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "Clock" },
    paid: { label: "Payée", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "CreditCard" },
    confirmed: { label: "Confirmée", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "CheckCircle2" },
    processing: { label: "En préparation", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "ShoppingCart" },
    shipped: { label: "Expédiée", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "Truck" },
    delivered: { label: "Livrée", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "PackageCheck" },
    cancelled: { label: "Annulée", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "XCircle" },
    refunded: { label: "Remboursée", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "RotateCcw" },
};