// app/admin/components/promotions/components/FlashSaleDetailModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X, Zap, Calendar, Clock, BarChart2, Package, Edit3,
    ToggleLeft, ToggleRight, TrendingDown, Target, Hash
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminSoldes } from "@/modeles/promotions";

interface FlashSaleDetailModalProps {
    sale: AdminSoldes | null;
    onClose: () => void;
    onEdit: () => void;
}

export function FlashSaleDetailModal({ sale, onClose, onEdit }: FlashSaleDetailModalProps) {
    if (!sale) return null;

    const isActive = sale.is_active && new Date(sale.ends_at) > new Date();
    const hasStarted = new Date(sale.starts_at) <= new Date();
    const progress = sale.quota_stock_limit
        ? Math.min((sale.product_sold_count / sale.quota_stock_limit) * 100, 100)
        : 0;
    const remaining = sale.quota_stock_limit ? sale.quota_stock_limit - sale.product_sold_count : null;

    const discount = sale.original_price && parseFloat(sale.original_price) > 0
        ? Math.round((1 - parseFloat(sale.sale_price) / parseFloat(sale.original_price)) * 100)
        : null;

    const timeLeft = () => {
        const now = new Date();
        const end = new Date(sale.ends_at);
        if (end < now) return "Terminée";
        const diff = end.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        if (d > 0) return `${d}j ${h % 24}h restant${d > 1 ? 's' : ''}`;
        return `${h}h restantes`;
    };

    return (
        <AnimatePresence>
            {sale && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-surface-elevated border-l border-border/50 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="relative overflow-hidden border-b border-border/40 p-6">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                        <Zap className="h-3.5 w-3.5 text-amber-400" /> Vente Flash
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-3 shadow-sm">
                                        {sale.product.primary_image ? (
                                            <img src={typeof sale.product.primary_image === 'string' ? sale.product.primary_image : sale.product.primary_image.image} alt={sale.product.name} className="h-12 w-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-alt">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-bold text-foreground">{sale.product.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{sale.product.category_name}</p>
                                        </div>
                                    </div>
                                    {sale.variant && (
                                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface-alt/50 px-3 py-1.5 border border-border/30">
                                            <Hash className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Variante: <span className="font-semibold text-foreground">{sale.variant.name}</span></span>
                                        </div>
                                    )}
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                                            isActive
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                            {isActive ? "En cours" : "Terminée"}
                                        </span>
                                        {isActive && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-400">
                                                <Clock className="h-3 w-3" /> {timeLeft()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={onClose} className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Prix hero */}
                            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400/70 mb-1">Prix soldé</p>
                                        <p className="text-4xl font-extrabold text-amber-400">{formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}</p>
                                        {sale.original_price && (
                                            <p className="mt-1 text-sm line-through text-muted-foreground">
                                                {formatCurrency(parseFloat(sale.original_price), "FCFA")}
                                            </p>
                                        )}
                                    </div>
                                    {discount !== null && discount > 0 && (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
                                            <div className="text-center text-white">
                                                <p className="text-xl font-extrabold leading-none">-{discount}%</p>
                                                <p className="text-[10px] font-bold opacity-80">OFF</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progression du stock */}
                            {sale.quota_stock_limit && (
                                <div className="rounded-2xl border border-border/50 bg-surface p-5">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                        <BarChart2 className="h-3.5 w-3.5" /> Progression des ventes
                                    </h3>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-foreground">{sale.product_sold_count} vendu(s)</span>
                                        <span className="text-muted-foreground">/ {sale.quota_stock_limit} quota</span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-surface-alt overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className={cn(
                                                "h-full rounded-full",
                                                progress >= 90 ? "bg-red-500" : progress >= 60 ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                        <span>{progress.toFixed(0)}% écoulé</span>
                                        {remaining !== null && remaining > 0 && (
                                            <span className="text-emerald-400 font-bold">{remaining} restant(s) au prix flash</span>
                                        )}
                                        {remaining === 0 && (
                                            <span className="text-red-400 font-bold">Quota épuisé</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Période */}
                            <div className="rounded-2xl border border-border/50 bg-surface p-5">
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                    <Calendar className="h-3.5 w-3.5" /> Période d'activation
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-surface-elevated p-3">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Début</p>
                                        <p className="text-sm font-bold text-foreground">
                                            {new Date(sale.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(sale.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "rounded-xl p-3",
                                        !isActive ? "bg-red-500/10" : "bg-surface-elevated"
                                    )}>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Fin</p>
                                        <p className={cn("text-sm font-bold", !isActive ? "text-red-400" : "text-foreground")}>
                                            {new Date(sale.ends_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(sale.ends_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Métadonnées */}
                            <div className="rounded-2xl border border-border/50 bg-surface p-5 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Métadonnées</h3>
                                <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">ID</span>
                                    <code className="text-xs font-mono text-muted-foreground">{sale.id}</code>
                                </div>
                                <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Créé le</span>
                                    <span className="text-xs font-semibold text-foreground">{new Date(sale.created_at).toLocaleString("fr-FR")}</span>
                                </div>
                                <div className="flex items-start justify-between gap-4 py-2">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Mis à jour</span>
                                    <span className="text-xs font-semibold text-foreground">{new Date(sale.updated_at).toLocaleString("fr-FR")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border/40 p-5">
                            <button
                                onClick={onEdit}
                                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
                                <span className="flex items-center justify-center gap-2">
                                    <Edit3 className="h-4 w-4" /> Modifier cette vente flash
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
