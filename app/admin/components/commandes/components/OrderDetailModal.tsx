// "use client";

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     X, Package, MapPin, Phone, CreditCard, Calendar, Clock,
//     ChevronRight, Loader2, RotateCcw, Truck, CheckCircle2,
//     XCircle, FileText, ShoppingBag, Hash, History, AlertTriangle,
//     ArrowRight, Receipt, MessageSquare
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
//     paid: ["confirmed", "cancelled", "refunded"],
//     confirmed: ["processing", "cancelled"],
//     processing: ["shipped"],
//     shipped: ["delivered"],
//     delivered: ["refunded"],
// };

// function StatusPill({ status, size = "md" }: { status: OrderStatus; size?: "sm" | "md" }) {
//     const cfg = ORDER_STATUS_MAP[status];
//     if (!cfg) return null;
//     return (
//         <span className={cn(
//             "inline-flex items-center gap-1.5 rounded-md border font-semibold uppercase tracking-wider",
//             size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
//             cfg.bg, cfg.color, cfg.border
//         )}>
//             {cfg.label}
//         </span>
//     );
// }

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
//     }, [tab, reference]);

//     const handleStatusUpdate = async () => {
//         if (!reference || !selectedStatus || !order) return;
//         await onStatusChange(reference, selectedStatus as OrderStatus);
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
//                     <motion.div
//                         key="backdrop"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.15 }}
//                         onClick={onClose}
//                         className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
//                     />

//                     <motion.aside
//                         key="panel"
//                         initial={{ opacity: 0, x: "100%" }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: "100%" }}
//                         transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
//                         className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[500px] flex-col bg-white border-l border-slate-200 shadow-2xl dark:bg-[#121212] dark:border-slate-800"
//                     >
//                         {/* Header */}
//                         <header className="flex-none border-b border-slate-200 px-6 py-5 dark:border-slate-800">
//                             <div className="flex items-start justify-between">
//                                 <div>
//                                     <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
//                                         <Hash className="h-3.5 w-3.5" />
//                                         <span className="text-[11px] font-bold uppercase tracking-widest">Commande</span>
//                                     </div>
//                                     <h2 className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white">
//                                         {reference}
//                                     </h2>
//                                     {order && (
//                                         <div className="mt-3 flex items-center gap-3">
//                                             <StatusPill status={order.status} />
//                                             {order.paid_at && (
//                                                 <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
//                                                     <CreditCard className="h-3.5 w-3.5" />
//                                                     Payée le {new Date(order.paid_at).toLocaleDateString("fr-FR")}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <button
//                                     onClick={onClose}
//                                     className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
//                                 >
//                                     <X className="h-4.5 w-4.5" />
//                                 </button>
//                             </div>
//                         </header>

//                         {/* Tabs */}
//                         <nav className="flex-none border-b border-slate-200 px-6 dark:border-slate-800">
//                             <div className="flex gap-6">
//                                 {(["details", "history"] as const).map(t => (
//                                     <button
//                                         key={t}
//                                         onClick={() => setTab(t)}
//                                         className={cn(
//                                             "relative pb-3 pt-4 text-sm font-semibold transition-colors",
//                                             tab === t ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
//                                         )}
//                                     >
//                                         <div className="flex items-center gap-2">
//                                             {t === "details" ? <Receipt className="h-4 w-4" /> : <History className="h-4 w-4" />}
//                                             {t === "details" ? "Détails" : "Historique"}
//                                         </div>
//                                         {tab === t && (
//                                             <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-900 dark:bg-white" />
//                                         )}
//                                     </button>
//                                 ))}
//                             </div>
//                         </nav>

//                         {/* Body */}
//                         <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 dark:bg-[#121212]">
//                             {loading ? (
//                                 <div className="flex h-64 flex-col items-center justify-center gap-3">
//                                     <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
//                                     <p className="text-sm font-medium text-slate-500">Chargement de la commande...</p>
//                                 </div>
//                             ) : !order ? (
//                                 <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
//                                     <AlertTriangle className="h-8 w-8" />
//                                     <p className="text-sm font-medium">Commande introuvable.</p>
//                                 </div>
//                             ) : tab === "details" ? (
//                                 <div className="space-y-6">
//                                     {/* Action Box */}
//                                     {nextOptions.length > 0 && (
//                                         <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
//                                             <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modifier le statut</h3>
//                                             <div className="mt-3 flex flex-wrap gap-2">
//                                                 {nextOptions.map(s => {
//                                                     const isSelected = selectedStatus === s;
//                                                     const cfg = ORDER_STATUS_MAP[s];
//                                                     return (
//                                                         <button
//                                                             key={s}
//                                                             onClick={() => setSelectedStatus(isSelected ? "" : s)}
//                                                             className={cn(
//                                                                 "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
//                                                                 isSelected
//                                                                     ? `${cfg.bg} ${cfg.color} border-transparent ring-2 ring-offset-1 ring-${cfg.color.split("-")[1]}-500`
//                                                                     : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
//                                                             )}
//                                                         >
//                                                             {cfg.label}
//                                                         </button>
//                                                     );
//                                                 })}
//                                             </div>
//                                             {selectedStatus && (
//                                                 <div className="mt-4 space-y-3">
//                                                     <textarea
//                                                         rows={2}
//                                                         value={comment}
//                                                         onChange={e => setComment(e.target.value)}
//                                                         placeholder="Ajouter une note interne (optionnel)"
//                                                         className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-white dark:focus:ring-white"
//                                                     />
//                                                     <button
//                                                         onClick={handleStatusUpdate}
//                                                         disabled={isUpdating}
//                                                         className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
//                                                     >
//                                                         {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le changement"}
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}

//                                     {/* Financials */}
//                                     <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
//                                         <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Résumé financier</h3>
//                                         <div className="space-y-3 text-sm">
//                                             <div className="flex justify-between text-slate-500 dark:text-slate-400">
//                                                 <span>Sous-total articles</span>
//                                                 <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}</span>
//                                             </div>
//                                             <div className="flex justify-between text-slate-500 dark:text-slate-400">
//                                                 <span>Frais de livraison</span>
//                                                 <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}</span>
//                                             </div>
//                                             {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
//                                                 <div className="flex justify-between text-slate-500 dark:text-slate-400">
//                                                     <span>Réduction</span>
//                                                     <span className="font-medium text-emerald-600 dark:text-emerald-400">-{formatCurrency(parseFloat(order.discount_amount), "FCFA")}</span>
//                                                 </div>
//                                             )}
//                                             <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
//                                                 <div className="flex justify-between">
//                                                     <span className="font-bold text-slate-900 dark:text-white">Total</span>
//                                                     <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Shipping Address */}
//                                     <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
//                                         <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
//                                             <MapPin className="h-4 w-4 text-slate-400" />
//                                             Livraison
//                                         </h3>
//                                         <p className="text-sm font-medium text-slate-900 dark:text-white">{order.address_livraison}</p>
//                                         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{order.city}, {order.country}</p>
//                                         {order.phone_livraison && (
//                                             <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
//                                                 <Phone className="h-3.5 w-3.5" />
//                                                 <span>{order.phone_livraison}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Items List */}
//                                     <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
//                                         <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
//                                             <h3 className="text-sm font-bold text-slate-900 dark:text-white">Articles ({order.items.length})</h3>
//                                         </div>
//                                         <div className="divide-y divide-slate-100 dark:divide-slate-800">
//                                             {order.items.map((item, idx) => (
//                                                 <div key={item.id} className="flex items-center gap-4 px-5 py-4">
//                                                     <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
//                                                         {idx + 1}
//                                                     </div>
//                                                     <div className="flex-1 min-w-0">
//                                                         <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.product_name}</p>
//                                                         <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">SKU: {item.product_sku}</p>
//                                                     </div>
//                                                     <div className="text-right">
//                                                         <p className="text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(item.subtotal), "FCFA")}</p>
//                                                         <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(parseFloat(item.unit_price), "FCFA")} × {item.quantity}</p>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>

//                                     {/* Customer Notes */}
//                                     {order.notes && (
//                                         <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
//                                             <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Note du client</h3>
//                                             <p className="text-sm italic text-slate-700 dark:text-slate-300">"{order.notes}"</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             ) : (
//                                 <div className="space-y-6">
//                                     {loadingHistory ? (
//                                         <div className="flex h-32 items-center justify-center">
//                                             <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
//                                         </div>
//                                     ) : history.length === 0 ? (
//                                         <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-500">
//                                             <History className="h-6 w-6" />
//                                             <p className="text-sm">Aucun historique disponible.</p>
//                                         </div>
//                                     ) : (
//                                         <div className="relative border-l border-slate-200 ml-4 pl-6 py-2 space-y-6 dark:border-slate-700">
//                                             {history.map((entry, i) => (
//                                                 <div key={entry.id} className="relative">
//                                                     <div className={cn(
//                                                         "absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#121212]",
//                                                         i === 0 ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-600"
//                                                     )} />
//                                                     <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
//                                                         <div className="flex items-center gap-2 mb-2">
//                                                             {entry.old_status && (
//                                                                 <>
//                                                                     <StatusPill status={entry.old_status as OrderStatus} size="sm" />
//                                                                     <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
//                                                                 </>
//                                                             )}
//                                                             <StatusPill status={entry.new_status as OrderStatus} size="sm" />
//                                                         </div>
//                                                         {entry.comment && (
//                                                             <div className="mt-3 flex items-start gap-2 rounded-md bg-slate-50 p-2.5 dark:bg-slate-800/50">
//                                                                 <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
//                                                                 <p className="text-xs italic text-slate-600 dark:text-slate-300">"{entry.comment}"</p>
//                                                             </div>
//                                                         )}
//                                                         <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
//                                                             <span>Par {entry.changed_by_email}</span>
//                                                             <span>{new Date(entry.created_at).toLocaleString("fr-FR")}</span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </motion.aside>
//                 </>
//             )}
//         </AnimatePresence>
//     );
// }

















































"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Phone, CreditCard,
    Loader2, Truck, CheckCircle2,
    Hash, History, AlertTriangle,
    ArrowRight, Receipt, MessageSquare
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

const NEXT_STATUS_OPTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
    pending_payment: ["paid", "cancelled"],
    paid: ["confirmed", "cancelled", "refunded"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped"],
    shipped: ["delivered"],
    delivered: ["refunded"],
};

function StatusPill({ status, size = "md" }: { status: OrderStatus; size?: "sm" | "md" }) {
    const cfg = ORDER_STATUS_MAP[status];
    if (!cfg) return null;
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider",
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
            cfg.bg, cfg.color, cfg.border
        )}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {cfg.label}
        </span>
    );
}

export function OrderDetailModal({ reference, onClose, onStatusChange, isUpdating }: OrderDetailModalProps) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [history, setHistory] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [tab, setTab] = useState<"details" | "history">("details");
    const [comment, setComment] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
    // Garde locale contre le double-clic / le double-appel pendant la
    // confirmation d'un changement de statut depuis la modale.
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

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
    }, [tab, reference]);

    const handleStatusUpdate = async () => {
        if (!reference || !selectedStatus || !order || isSubmittingStatus) return;
        setIsSubmittingStatus(true);
        try {
            await onStatusChange(reference, selectedStatus as OrderStatus);
            const res = await getAdminOrderByReference(reference);
            if (res.ok) setOrder(res.data);
            setSelectedStatus("");
            setComment("");
        } finally {
            setIsSubmittingStatus(false);
        }
    };

    const nextOptions = order ? (NEXT_STATUS_OPTIONS[order.status] || []) : [];
    const busy = !!isUpdating || isSubmittingStatus;

    return (
        <AnimatePresence>
            {reference && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
                    />

                    <motion.aside
                        key="panel"
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 34 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[500px] flex-col bg-white border-l border-slate-200 shadow-2xl dark:bg-[#121212] dark:border-slate-800"
                    >
                        {/* Header */}
                        <header className="flex-none border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-5 dark:border-slate-800 dark:from-[#121212] dark:to-slate-900/40">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <Hash className="h-3.5 w-3.5" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">Commande</span>
                                    </div>
                                    <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        {reference}
                                    </h2>
                                    {order && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <StatusPill status={order.status} />
                                            {order.paid_at && (
                                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    Payée le {new Date(order.paid_at).toLocaleDateString("fr-FR")}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Fermer"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                >
                                    <X className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        </header>

                        {/* Tabs */}
                        <nav className="flex-none border-b border-slate-200 px-6 dark:border-slate-800">
                            <div className="flex gap-6">
                                {(["details", "history"] as const).map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTab(t)}
                                        className={cn(
                                            "relative cursor-pointer pb-3 pt-4 text-sm font-semibold transition-colors",
                                            tab === t ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {t === "details" ? <Receipt className="h-4 w-4" /> : <History className="h-4 w-4" />}
                                            {t === "details" ? "Détails" : "Historique"}
                                        </div>
                                        {tab === t && (
                                            <motion.div
                                                layoutId="order-detail-tab-indicator"
                                                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#0D2E1E] dark:bg-white"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </nav>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 dark:bg-[#121212]">
                            {loading ? (
                                <div className="flex h-64 flex-col items-center justify-center gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                    <p className="text-sm font-medium text-slate-500">Chargement de la commande...</p>
                                </div>
                            ) : !order ? (
                                <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
                                    <AlertTriangle className="h-8 w-8" />
                                    <p className="text-sm font-medium">Commande introuvable.</p>
                                </div>
                            ) : tab === "details" ? (
                                <div className="space-y-6">
                                    {/* Action Box */}
                                    {nextOptions.length > 0 && (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modifier le statut</h3>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {nextOptions.map(s => {
                                                    const isSelected = selectedStatus === s;
                                                    const cfg = ORDER_STATUS_MAP[s];
                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setSelectedStatus(isSelected ? "" : s)}
                                                            className={cn(
                                                                "cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                                                                isSelected
                                                                    ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-current`
                                                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                            )}
                                                        >
                                                            {cfg.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <AnimatePresence>
                                                {selectedStatus && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 space-y-3">
                                                            <textarea
                                                                rows={2}
                                                                value={comment}
                                                                onChange={e => setComment(e.target.value)}
                                                                placeholder="Ajouter une note interne (optionnel)"
                                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-white dark:focus:ring-white"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleStatusUpdate}
                                                                disabled={busy}
                                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0D2E1E] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#123d29] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                                            >
                                                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le changement"}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {/* Financials */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Résumé financier</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                                <span>Sous-total articles</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(order.items_total || "0"), "FCFA")}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                                <span>Frais de livraison</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(order.frais_livraison || "0"), "FCFA")}</span>
                                            </div>
                                            {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                                                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                                    <span>Réduction</span>
                                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">-{formatCurrency(parseFloat(order.discount_amount), "FCFA")}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(parseFloat(order.total_final || "0"), "FCFA")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Livraison
                                        </h3>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{order.address_livraison}</p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{order.city}, {order.country}</p>
                                        {order.phone_livraison && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{order.phone_livraison}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items List */}
                                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Articles ({order.items.length})</h3>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {order.items.map((item, idx) => (
                                                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.product_name}</p>
                                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">SKU: {item.product_sku}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(parseFloat(item.subtotal), "FCFA")}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(parseFloat(item.unit_price), "FCFA")} × {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customer Notes */}
                                    {order.notes && (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Note du client</h3>
                                            <p className="text-sm italic text-slate-700 dark:text-slate-300">&ldquo;{order.notes}&rdquo;</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {loadingHistory ? (
                                        <div className="flex h-32 items-center justify-center">
                                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-500">
                                            <History className="h-6 w-6" />
                                            <p className="text-sm">Aucun historique disponible.</p>
                                        </div>
                                    ) : (
                                        <div className="relative ml-4 space-y-6 border-l border-slate-200 py-2 pl-6 dark:border-slate-700">
                                            {history.map((entry, i) => (
                                                <div key={entry.id} className="relative">
                                                    <div className={cn(
                                                        "absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#121212]",
                                                        i === 0 ? "bg-[#0D2E1E] dark:bg-white" : "bg-slate-300 dark:bg-slate-600"
                                                    )} />
                                                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            {entry.old_status && (
                                                                <>
                                                                    <StatusPill status={entry.old_status as OrderStatus} size="sm" />
                                                                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                                                </>
                                                            )}
                                                            <StatusPill status={entry.new_status as OrderStatus} size="sm" />
                                                        </div>
                                                        {entry.comment && (
                                                            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                                                                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                                <p className="text-xs italic text-slate-600 dark:text-slate-300">&ldquo;{entry.comment}&rdquo;</p>
                                                            </div>
                                                        )}
                                                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                            <span>Par {entry.changed_by_email}</span>
                                                            <span>{new Date(entry.created_at).toLocaleString("fr-FR")}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}