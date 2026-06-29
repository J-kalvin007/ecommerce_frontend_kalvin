// // app/admin/components/commandes/components/OrderDetailModal.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     X, Package, MapPin, Phone, CreditCard, Calendar, Clock,
//     ChevronRight, Loader2, RotateCcw, Truck, CheckCircle2,
//     XCircle, FileText, ShoppingBag, Hash, History, AlertTriangle
// } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import { getAdminOrderByReference, getOrderHistory } from "@/fonctions_api/commandes.api";
// import type { OrderDetail, OrderHistory, OrderStatus } from "@/modeles/commandes";
// import { ORDER_STATUS_MAP } from "@/modeles/commandes";

// interface OrderDetailModalProps {
//     reference: string | null;
//     onClose: () => void;
//     onStatusChange: (reference: string, status: OrderStatus) => Promise<void>;
//     isUpdating?: boolean;
// }

// const NEXT_STATUS_OPTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
//     pending_payment: ["paid", "cancelled"],
//     paid:            ["confirmed", "cancelled", "refunded"],
//     confirmed:       ["processing", "cancelled"],
//     processing:      ["shipped"],
//     shipped:         ["delivered"],
//     delivered:       ["refunded"],
// };

// const StatusIcon = ({ status }: { status: OrderStatus }) => {
//     const icons: Record<string, React.ReactNode> = {
//         draft:           <FileText className="h-5 w-5" />,
//         pending_payment: <Clock className="h-5 w-5" />,
//         paid:            <CreditCard className="h-5 w-5" />,
//         confirmed:       <CheckCircle2 className="h-5 w-5" />,
//         processing:      <ShoppingBag className="h-5 w-5" />,
//         shipped:         <Truck className="h-5 w-5" />,
//         delivered:       <CheckCircle2 className="h-5 w-5" />,
//         cancelled:       <XCircle className="h-5 w-5" />,
//         refunded:        <RotateCcw className="h-5 w-5" />,
//     };
//     return <>{icons[status] || <Package className="h-5 w-5" />}</>;
// };

// export function OrderDetailModal({ reference, onClose, onStatusChange, isUpdating }: OrderDetailModalProps) {
//     const [order, setOrder] = useState<OrderDetail | null>(null);
//     const [history, setHistory] = useState<OrderHistory[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [loadingHistory, setLoadingHistory] = useState(false);
//     const [tab, setTab] = useState<"details" | "history">("details");
//     const [comment, setComment] = useState("");
//     const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

//     useEffect(() => {
//         if (!reference) { setOrder(null); return; }
//         setLoading(true);
//         setTab("details");
//         setComment("");
//         setSelectedStatus("");
//         getAdminOrderByReference(reference).then(res => {
//             if (res.ok) setOrder(res.data);
//         }).finally(() => setLoading(false));
//     }, [reference]);

//     const loadHistory = async () => {
//         if (!reference) return;
//         setLoadingHistory(true);
//         const res = await getOrderHistory(reference);
//         if (res.ok) setHistory(res.data);
//         setLoadingHistory(false);
//     };

//     useEffect(() => {
//         if (tab === "history" && reference) loadHistory();
//     }, [tab]);

//     const handleStatusUpdate = async () => {
//         if (!reference || !selectedStatus || !order) return;
//         await onStatusChange(reference, selectedStatus as OrderStatus);
//         // Reload order after update
//         const res = await getAdminOrderByReference(reference);
//         if (res.ok) setOrder(res.data);
//         setSelectedStatus("");
//         setComment("");
//     };

//     const nextOptions = order ? (NEXT_STATUS_OPTIONS[order.status] || []) : [];

//     return (
//         <AnimatePresence>
//             {reference && (
//                 <>
//                     {/* Backdrop */}
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         onClick={onClose}
//                         className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
//                     />

//                     {/* Panel */}
//                     <motion.div
//                         initial={{ opacity: 0, x: "100%" }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: "100%" }}
//                         transition={{ type: "spring", stiffness: 260, damping: 28 }}
//                         className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-white-elevated border-l border-border/50 shadow-2xl"
//                     >
//                         {/* Header */}
//                         <div className="relative overflow-hidden border-b border-border/40 p-6">
//                             <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
//                             <div className="relative flex items-start justify-between gap-4">
//                                 <div>
//                                     <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
//                                         <Hash className="h-3 w-3" /> Commande
//                                     </div>
//                                     <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
//                                         {reference}
//                                     </h2>
//                                     {order && (
//                                         <div className="mt-2">
//                                             <span className={cn(
//                                                 "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
//                                                 ORDER_STATUS_MAP[order.status]?.bg,
//                                                 ORDER_STATUS_MAP[order.status]?.color,
//                                                 ORDER_STATUS_MAP[order.status]?.border,
//                                             )}>
//                                                 <StatusIcon status={order.status} />
//                                                 {ORDER_STATUS_MAP[order.status]?.label}
//                                             </span>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <button onClick={onClose} className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-white-alt hover:text-foreground">
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Tabs */}
//                         <div className="flex border-b border-border/40 px-6 pt-2">
//                             {(["details", "history"] as const).map(t => (
//                                 <button
//                                     key={t}
//                                     onClick={() => setTab(t)}
//                                     className={cn(
//                                         "relative pb-3 pr-6 text-sm font-semibold transition-colors",
//                                         tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
//                                     )}
//                                 >
//                                     {t === "details" ? "Détails" : "Historique"}
//                                     {tab === t && (
//                                         <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-4 h-0.5 rounded-full bg-primary" />
//                                     )}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Body */}
//                         <div className="flex-1 overflow-y-auto p-6">
//                             {loading ? (
//                                 <div className="flex h-40 items-center justify-center">
//                                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                 </div>
//                             ) : !order ? (
//                                 <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
//                                     <AlertTriangle className="h-8 w-8" />
//                                     <p className="text-sm">Impossible de charger la commande.</p>
//                                 </div>
//                             ) : tab === "details" ? (
//                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
//                                     {/* Totaux */}
//                                     <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-gradient-to-br from-surface to-surface-alt p-5">
//                                         <div>
//                                             <p className="text-xs font-semibold uppercase text-muted-foreground">Sous-total</p>
//                                             <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs font-semibold uppercase text-muted-foreground">Livraison</p>
//                                             <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}</p>
//                                         </div>
//                                         {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
//                                             <div>
//                                                 <p className="text-xs font-semibold uppercase text-muted-foreground">Réduction</p>
//                                                 <p className="mt-1 text-lg font-bold text-emerald-400">-{formatCurrency(parseFloat(order.discount_amount), "FCFA")}</p>
//                                             </div>
//                                         )}
//                                         <div className="col-span-2 border-t border-border/50 pt-4">
//                                             <p className="text-xs font-semibold uppercase text-muted-foreground">Total final</p>
//                                             <p className="mt-1 text-3xl font-extrabold text-primary">{formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}</p>
//                                         </div>
//                                     </div>

//                                     {/* Livraison */}
//                                     <div className="rounded-2xl border border-border/50 bg-white p-5 space-y-3">
//                                         <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
//                                             <MapPin className="h-4 w-4 text-primary" /> Adresse de livraison
//                                         </h3>
//                                         <p className="text-sm font-semibold text-foreground">{order.address_livraison}</p>
//                                         <p className="text-sm text-muted-foreground">{order.city}, {order.country}</p>
//                                         {order.phone_livraison && (
//                                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                                                 <Phone className="h-4 w-4" /> {order.phone_livraison}
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Dates */}
//                                     <div className="flex gap-4">
//                                         <div className="flex-1 rounded-xl border border-border/50 bg-white p-4">
//                                             <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-1">
//                                                 <Calendar className="h-3.5 w-3.5" /> Créée le
//                                             </div>
//                                             <p className="text-sm font-bold">{new Date(order.created_at).toLocaleString("fr-FR")}</p>
//                                         </div>
//                                         {order.paid_at && (
//                                             <div className="flex-1 rounded-xl border border-border/50 bg-white p-4">
//                                                 <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground mb-1">
//                                                     <CreditCard className="h-3.5 w-3.5" /> Payée le
//                                                 </div>
//                                                 <p className="text-sm font-bold">{new Date(order.paid_at).toLocaleString("fr-FR")}</p>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Articles */}
//                                     <div className="space-y-3">
//                                         <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
//                                             <ShoppingBag className="h-4 w-4 text-primary" /> Articles ({order.items.length})
//                                         </h3>
//                                         <div className="space-y-2">
//                                             {order.items.map(item => (
//                                                 <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-white p-4 transition-colors hover:bg-white-elevated">
//                                                     <div className="flex min-w-0 flex-1 flex-col">
//                                                         <p className="truncate text-sm font-bold text-foreground">{item.product_name}</p>
//                                                         <p className="text-xs text-muted-foreground">SKU: {item.product_sku} · Qté: {item.quantity}</p>
//                                                     </div>
//                                                     <div className="text-right shrink-0">
//                                                         <p className="text-sm font-bold text-foreground">{formatCurrency(parseFloat(item.subtotal), "FCFA")}</p>
//                                                         <p className="text-xs text-muted-foreground">{formatCurrency(parseFloat(item.unit_price), "FCFA")} × {item.quantity}</p>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>

//                                     {/* Notes */}
//                                     {order.notes && (
//                                         <div className="rounded-xl border border-border/50 bg-white p-4">
//                                             <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Notes client</p>
//                                             <p className="text-sm text-foreground italic">"{order.notes}"</p>
//                                         </div>
//                                     )}

//                                     {/* Changement de statut */}
//                                     {nextOptions.length > 0 && (
//                                         <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-4">
//                                             <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
//                                                 <ChevronRight className="h-4 w-4 text-primary" />
//                                                 Faire avancer la commande
//                                             </h3>
//                                             <div className="flex flex-wrap gap-2">
//                                                 {nextOptions.map(s => (
//                                                     <button
//                                                         key={s}
//                                                         onClick={() => setSelectedStatus(s === selectedStatus ? "" : s)}
//                                                         className={cn(
//                                                             "rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
//                                                             selectedStatus === s
//                                                                 ? `${ORDER_STATUS_MAP[s].bg} ${ORDER_STATUS_MAP[s].color} ${ORDER_STATUS_MAP[s].border} scale-105 shadow-sm`
//                                                                 : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground"
//                                                         )}
//                                                     >
//                                                         {ORDER_STATUS_MAP[s].label}
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                             {selectedStatus && (
//                                                 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
//                                                     <textarea
//                                                         rows={2}
//                                                         value={comment}
//                                                         onChange={e => setComment(e.target.value)}
//                                                         placeholder="Commentaire interne (optionnel)..."
//                                                         className="w-full resize-none rounded-xl border border-border/80 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
//                                                     />
//                                                     <button
//                                                         onClick={handleStatusUpdate}
//                                                         disabled={isUpdating}
//                                                         className="relative w-full overflow-hidden rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 group"
//                                                     >
//                                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
//                                                         {isUpdating ? (
//                                                             <span className="flex items-center justify-center gap-2">
//                                                                 <Loader2 className="h-4 w-4 animate-spin" /> Mise à jour...
//                                                             </span>
//                                                         ) : (
//                                                             `Confirmer → ${ORDER_STATUS_MAP[selectedStatus as OrderStatus]?.label}`
//                                                         )}
//                                                     </button>
//                                                 </motion.div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </motion.div>
//                             ) : (
//                                 /* Historique tab */
//                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
//                                     {loadingHistory ? (
//                                         <div className="flex h-40 items-center justify-center">
//                                             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                         </div>
//                                     ) : history.length === 0 ? (
//                                         <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
//                                             <History className="h-8 w-8" />
//                                             <p className="text-sm">Aucun historique disponible.</p>
//                                         </div>
//                                     ) : (
//                                         <div className="relative pl-6">
//                                             <div className="absolute left-2 top-2 bottom-2 w-0.5 rounded-full bg-border/50" />
//                                             <div className="space-y-6">
//                                                 {history.map((entry, i) => (
//                                                     <div key={entry.id} className="relative">
//                                                         <div className={cn(
//                                                             "absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-surface-elevated",
//                                                             i === 0 ? "bg-primary" : "bg-border"
//                                                         )} />
//                                                         <div className="rounded-xl border border-border/50 bg-white p-4 space-y-2">
//                                                             <div className="flex flex-wrap items-center gap-2">
//                                                                 {entry.old_status && (
//                                                                     <>
//                                                                         <span className={cn(
//                                                                             "rounded-full border px-2 py-0.5 text-[10px] font-bold",
//                                                                             ORDER_STATUS_MAP[entry.old_status as OrderStatus]?.bg,
//                                                                             ORDER_STATUS_MAP[entry.old_status as OrderStatus]?.color,
//                                                                             ORDER_STATUS_MAP[entry.old_status as OrderStatus]?.border,
//                                                                         )}>
//                                                                             {ORDER_STATUS_MAP[entry.old_status as OrderStatus]?.label || entry.old_status}
//                                                                         </span>
//                                                                         <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
//                                                                     </>
//                                                                 )}
//                                                                 <span className={cn(
//                                                                     "rounded-full border px-2 py-0.5 text-[10px] font-bold",
//                                                                     ORDER_STATUS_MAP[entry.new_status as OrderStatus]?.bg,
//                                                                     ORDER_STATUS_MAP[entry.new_status as OrderStatus]?.color,
//                                                                     ORDER_STATUS_MAP[entry.new_status as OrderStatus]?.border,
//                                                                 )}>
//                                                                     {ORDER_STATUS_MAP[entry.new_status as OrderStatus]?.label || entry.new_status}
//                                                                 </span>
//                                                             </div>
//                                                             {entry.comment && (
//                                                                 <p className="text-xs text-muted-foreground italic">"{entry.comment}"</p>
//                                                             )}
//                                                             <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
//                                                                 <span>{entry.changed_by_email}</span>
//                                                                 <span>{new Date(entry.created_at).toLocaleString("fr-FR")}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </motion.div>
//                             )}
//                         </div>
//                     </motion.div>
//                 </>
//             )}
//         </AnimatePresence>
//     );
// }







































// app/admin/components/commandes/components/OrderDetailModal.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Package, MapPin, Phone, CreditCard, Calendar, Clock,
    ChevronRight, Loader2, RotateCcw, Truck, CheckCircle2,
    XCircle, FileText, ShoppingBag, Hash, History, AlertTriangle,
    ArrowRight, Star, Receipt, MessageSquare, Send
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getAdminOrderByReference, getOrderHistory } from "@/fonctions_api/commandes.api";
import type { OrderDetail, OrderHistory, OrderStatus } from "@/modeles/commandes";
import { ORDER_STATUS_MAP } from "@/modeles/commandes";

interface OrderDetailModalProps {
    reference: string | null;
    onClose: () => void;
    onStatusChange: (reference: string, status: OrderStatus) => Promise<void>;
    isUpdating?: boolean;
}

/* ── Statuts suivants autorisés ───────────────────────────────── */
const NEXT_STATUS_OPTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
    pending_payment: ["paid", "cancelled"],
    paid: ["confirmed", "cancelled", "refunded"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped"],
    shipped: ["delivered"],
    delivered: ["refunded"],
};

/* ── Icône de statut ──────────────────────────────────────────── */
const STATUS_ICONS: Record<string, React.ReactNode> = {
    draft: <FileText className="h-4 w-4" />,
    pending_payment: <Clock className="h-4 w-4" />,
    paid: <CreditCard className="h-4 w-4" />,
    confirmed: <CheckCircle2 className="h-4 w-4" />,
    processing: <ShoppingBag className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle2 className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
    refunded: <RotateCcw className="h-4 w-4" />,
};

/* ── Pill de statut ───────────────────────────────────────────── */
function StatusPill({ status, size = "md" }: { status: OrderStatus; size?: "sm" | "md" }) {
    const cfg = ORDER_STATUS_MAP[status];
    if (!cfg) return null;
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border font-black uppercase tracking-widest",
            size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]",
            cfg.bg, cfg.color, cfg.border
        )}>
            <span className={cn("rounded-full animate-pulse", size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5", cfg.color.replace("text-", "bg-"))} />
            {cfg.label}
        </span>
    );
}

/* ── Section wrapper ──────────────────────────────────────────── */
function Section({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "rounded-2xl border border-border/50 bg-white overflow-hidden",
            className
        )}>
            {children}
        </div>
    );
}

/* ── Section header ───────────────────────────────────────────── */
function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2.5 border-b border-border/40 bg-white-alt/50 px-5 py-3.5">
            <span className="text-primary">{icon}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
    );
}

/* ── Article item ─────────────────────────────────────────────── */
function ArticleItem({ item, index }: { item: OrderDetail["items"][0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white-alt/60 border-b border-border/30 last:border-0"
        >
            {/* Index badge */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white-elevated">
                <span className="font-mono text-[11px] font-black text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{item.product_name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="rounded border border-border/50 bg-white-elevated px-1.5 py-0.5 font-mono font-semibold">{item.product_sku}</span>
                    <span>·</span>
                    <span>Qté {item.quantity}</span>
                    <span>·</span>
                    <span>{formatCurrency(parseFloat(item.unit_price), "FCFA")} / u.</span>
                </div>
            </div>

            {/* Subtotal */}
            <div className="shrink-0 text-right">
                <p className="text-sm font-black text-foreground">{formatCurrency(parseFloat(item.subtotal), "FCFA")}</p>
            </div>
        </motion.div>
    );
}

/* ── History entry ────────────────────────────────────────────── */
function HistoryEntry({ entry, index, total }: { entry: OrderHistory; index: number; total: number }) {
    const isFirst = index === 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="relative flex gap-4"
        >
            {/* Timeline line */}
            {index < total - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-border/60 to-transparent" />
            )}

            {/* Dot */}
            <div className={cn(
                "relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                isFirst
                    ? "border-primary bg-primary shadow-md shadow-primary/30"
                    : "border-border/60 bg-white-elevated"
            )}>
                {isFirst
                    ? <Star className="h-3.5 w-3.5 text-white" />
                    : <div className="h-2 w-2 rounded-full bg-border" />
                }
            </div>

            {/* Card */}
            <div className="flex-1 pb-6">
                <div className="rounded-2xl border border-border/50 bg-white overflow-hidden">
                    {/* Status transition */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-border/30 bg-white-alt/40 px-4 py-3">
                        {entry.old_status && (
                            <>
                                <StatusPill status={entry.old_status as OrderStatus} size="sm" />
                                <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                            </>
                        )}
                        <StatusPill status={entry.new_status as OrderStatus} size="sm" />
                    </div>

                    {/* Comment */}
                    {entry.comment && (
                        <div className="flex items-start gap-2.5 border-b border-border/30 px-4 py-3">
                            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                            <p className="text-xs italic text-muted-foreground">"{entry.comment}"</p>
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground/60">{entry.changed_by_email}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground/60">{new Date(entry.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main modal ───────────────────────────────────────────────── */
export function OrderDetailModal({ reference, onClose, onStatusChange, isUpdating }: OrderDetailModalProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [history, setHistory] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [tab, setTab] = useState<"details" | "history">("details");
    const [comment, setComment] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

    useEffect(() => {
        if (!reference) { setOrder(null); return; }
        setLoading(true);
        setTab("details");
        setComment("");
        setSelectedStatus("");
        getAdminOrderByReference(reference).then(res => {
            if (res.ok) setOrder(res.data);
        }).finally(() => setLoading(false));
    }, [reference]);

    const loadHistory = async () => {
        if (!reference) return;
        setLoadingHistory(true);
        const res = await getOrderHistory(reference);
        if (res.ok) setHistory(res.data);
        setLoadingHistory(false);
    };

    useEffect(() => {
        if (tab === "history" && reference) loadHistory();
    }, [tab]);

    const handleStatusUpdate = async () => {
        if (!reference || !selectedStatus || !order) return;
        await onStatusChange(reference, selectedStatus as OrderStatus);
        const res = await getAdminOrderByReference(reference);
        if (res.ok) setOrder(res.data);
        setSelectedStatus("");
        setComment("");
    };

    const nextOptions = order ? (NEXT_STATUS_OPTIONS[order.status] || []) : [];
    const statusCfg = order ? ORDER_STATUS_MAP[order.status] : null;

    return (
        <AnimatePresence>
            {reference && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                    />

                    {/* ── Drawer panel ── */}
                    <motion.aside
                        key="panel"
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.8 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-white-elevated border-l border-border/40 shadow-[−32px_0_80px_rgba(0,0,0,0.4)]"
                    >
                        {/* ── Header ── */}
                        <header className="relative flex-none overflow-hidden">
                            {/* Ambient glow layer */}
                            <div className={cn(
                                "absolute inset-0 opacity-10 transition-colors duration-500",
                                statusCfg ? statusCfg.bg.replace("/10", "") : "bg-primary"
                            )} />
                            {/* Radial blob */}
                            <div className={cn(
                                "absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-20 transition-colors duration-500",
                                statusCfg ? statusCfg.bg.replace("/10", "") : "bg-primary"
                            )} />
                            {/* Hairline accent */}
                            <div className={cn("absolute inset-x-0 top-0 h-px", statusCfg?.bg.replace("/10", "") ?? "bg-primary")} />

                            <div className="relative px-6 pb-5 pt-6">
                                {/* Top row: eyebrow + close */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Hash className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Commande</span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="group flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                                    >
                                        <X className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
                                    </button>
                                </div>

                                {/* Reference */}
                                <h2 className="mt-2 font-mono text-2xl font-black tracking-tight text-foreground">
                                    {reference}
                                </h2>

                                {/* Status pill */}
                                {order && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <StatusPill status={order.status} />
                                        {order.paid_at && (
                                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                                                <CreditCard className="h-3 w-3" />
                                                Payée le {new Date(order.paid_at).toLocaleDateString("fr-FR")}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </header>

                        {/* ── Tabs ── */}
                        <nav className="relative flex-none border-b border-border/40 bg-white-elevated px-6">
                            <div className="flex gap-1">
                                {(["details", "history"] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={cn(
                                            "relative flex items-center gap-2 pb-3.5 pt-3 text-xs font-black uppercase tracking-widest transition-colors",
                                            t === "details" ? "pr-8" : "pr-4",
                                            tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {t === "details"
                                            ? <><Receipt className="h-3.5 w-3.5" /> Détails</>
                                            : <><History className="h-3.5 w-3.5" /> Historique</>
                                        }
                                        {tab === t && (
                                            <motion.div
                                                layoutId="modal-tab-indicator"
                                                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </nav>

                        {/* ── Body ── */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Loading state */}
                            {loading && (
                                <div className="flex h-64 flex-col items-center justify-center gap-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full border-2 border-border/40" />
                                        <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-primary" />
                                    </div>
                                    <p className="text-xs font-semibold text-muted-foreground">Chargement…</p>
                                </div>
                            )}

                            {/* Error state */}
                            {!loading && !order && (
                                <div className="flex h-64 flex-col items-center justify-center gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-white">
                                        <AlertTriangle className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-foreground">Commande introuvable</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Impossible de charger les données.</p>
                                    </div>
                                </div>
                            )}

                            {/* ── Details tab ── */}
                            {!loading && order && tab === "details" && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-4 p-5"
                                >
                                    {/* ── Totaux ── */}
                                    <Section>
                                        <SectionHeader icon={<Receipt className="h-4 w-4" />} label="Récapitulatif financier" />
                                        <div className="p-5">
                                            {/* Rows */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Sous-total articles</span>
                                                    <span className="text-sm font-bold text-foreground">{formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Frais de livraison</span>
                                                    <span className="text-sm font-bold text-foreground">{formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}</span>
                                                </div>
                                                {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                                                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                                                        <span className="text-sm font-semibold text-emerald-400">Réduction appliquée</span>
                                                        <span className="text-sm font-black text-emerald-400">−{formatCurrency(parseFloat(order.discount_amount), "FCFA")}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Divider */}
                                            <div className="my-4 border-t border-dashed border-border/40" />

                                            {/* Grand total */}
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total final</p>
                                                    <p className="text-[10px] text-muted-foreground/60">{order.items.length} article{order.items.length > 1 ? "s" : ""}</p>
                                                </div>
                                                <p className="text-3xl font-black tracking-tight text-primary">
                                                    {formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}
                                                </p>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* ── Livraison ── */}
                                    <Section>
                                        <SectionHeader icon={<MapPin className="h-4 w-4" />} label="Adresse de livraison" />
                                        <div className="p-5 space-y-3">
                                            <p className="text-sm font-bold text-foreground leading-snug">{order.address_livraison}</p>
                                            <p className="text-sm text-muted-foreground">{order.city}, {order.country}</p>
                                            {order.phone_livraison && (
                                                <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-white-elevated px-3 py-2">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-mono text-sm font-semibold text-foreground">{order.phone_livraison}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Section>

                                    {/* ── Dates ── */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Section>
                                            <div className="p-4 space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Créée le</span>
                                                </div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </Section>
                                        {order.paid_at ? (
                                            <Section>
                                                <div className="p-4 space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-emerald-400">
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Payée le</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        {new Date(order.paid_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {new Date(order.paid_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </Section>
                                        ) : (
                                            <Section>
                                                <div className="p-4 space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-amber-400">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Paiement</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-amber-400/80">En attente</p>
                                                </div>
                                            </Section>
                                        )}
                                    </div>

                                    {/* ── Articles ── */}
                                    <Section>
                                        <SectionHeader
                                            icon={<ShoppingBag className="h-4 w-4" />}
                                            label={`Articles · ${order.items.length}`}
                                        />
                                        <div>
                                            {order.items.map((item, i) => (
                                                <ArticleItem key={item.id} item={item} index={i} />
                                            ))}
                                        </div>
                                    </Section>

                                    {/* ── Notes client ── */}
                                    {order.notes && (
                                        <Section>
                                            <SectionHeader icon={<MessageSquare className="h-4 w-4" />} label="Notes client" />
                                            <div className="p-5">
                                                <p className="text-sm italic leading-relaxed text-foreground/80">"{order.notes}"</p>
                                            </div>
                                        </Section>
                                    )}

                                    {/* ── Changement de statut ── */}
                                    {nextOptions.length > 0 && (
                                        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent overflow-hidden">
                                            {/* Header */}
                                            <div className="flex items-center gap-2.5 border-b border-primary/15 bg-primary/5 px-5 py-3.5">
                                                <Star className="h-4 w-4 text-primary" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Faire avancer la commande</p>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                {/* Status options */}
                                                <div className="flex flex-wrap gap-2">
                                                    {nextOptions.map(s => {
                                                        const cfg = ORDER_STATUS_MAP[s];
                                                        const isSelected = selectedStatus === s;
                                                        return (
                                                            <motion.button
                                                                key={s}
                                                                whileHover={{ scale: 1.03 }}
                                                                whileTap={{ scale: 0.97 }}
                                                                onClick={() => setSelectedStatus(isSelected ? "" : s)}
                                                                className={cn(
                                                                    "flex items-center cursor-pointer gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-black transition-all",
                                                                    isSelected
                                                                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-md`
                                                                        : "border-border/60 bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                                                )}
                                                            >
                                                                {isSelected && (
                                                                    <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.color.replace("text-", "bg-"))} />
                                                                )}
                                                                {cfg.label}
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Comment + confirm — appears when a status is selected */}
                                                <AnimatePresence>
                                                    {selectedStatus && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden space-y-3"
                                                        >
                                                            {/* Textarea */}
                                                            <div className="relative">
                                                                <MessageSquare className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                                                <textarea
                                                                    rows={2}
                                                                    value={comment}
                                                                    onChange={e => setComment(e.target.value)}
                                                                    placeholder="Commentaire interne (optionnel)…"
                                                                    className="w-full resize-none rounded-xl border border-border/60 bg-white pl-10 pr-4 pt-3 pb-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50"
                                                                />
                                                            </div>

                                                            {/* Confirm button */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.01 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={handleStatusUpdate}
                                                                disabled={isUpdating}
                                                                className="group relative cursor-pointer w-full overflow-hidden rounded-xl bg-primary py-3 text-sm font-black text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                                                            >
                                                                {/* Shimmer */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                                                <span className="relative flex items-center justify-center gap-2">
                                                                    {isUpdating ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                            Mise à jour…
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Send className="h-4 w-4" />
                                                                            Confirmer → {ORDER_STATUS_MAP[selectedStatus as OrderStatus]?.label}
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {/* Spacer */}
                                    <div className="h-4" />
                                </motion.div>
                            )}

                            {/* ── History tab ── */}
                            {!loading && order && tab === "history" && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="p-5"
                                >
                                    {loadingHistory ? (
                                        <div className="flex h-48 flex-col items-center justify-center gap-3">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-full border-2 border-border/40" />
                                                <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-primary" />
                                            </div>
                                            <p className="text-xs font-semibold text-muted-foreground">Chargement de l'historique…</p>
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="flex h-48 flex-col items-center justify-center gap-3">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-white">
                                                <History className="h-6 w-6 text-muted-foreground/40" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-foreground">Aucun historique</p>
                                                <p className="mt-1 text-xs text-muted-foreground">Les changements de statut apparaîtront ici.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-0">
                                            {history.map((entry, i) => (
                                                <HistoryEntry
                                                    key={entry.id}
                                                    entry={entry}
                                                    index={i}
                                                    total={history.length}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}