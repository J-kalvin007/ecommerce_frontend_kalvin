// app/admin/components/promotions/components/PromoCodeDetailModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X, Tag, Calendar, Clock, Hash, Check, Copy,
    Users, Package, Layers, ToggleLeft, ToggleRight, Percent, Banknote, Truck
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminPromoCode } from "@/modeles/promotions";
import { useState } from "react";

interface PromoCodeDetailModalProps {
    promo: AdminPromoCode | null;
    onClose: () => void;
    onEdit: () => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
    percentage: <Percent className="h-4 w-4" />,
    fixed_amount: <Banknote className="h-4 w-4" />,
    free_shipping: <Truck className="h-4 w-4" />,
};

const TYPE_LABEL: Record<string, string> = {
    percentage: "Pourcentage",
    fixed_amount: "Montant fixe",
    free_shipping: "Livraison gratuite",
};

function DetailRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
            <span className={cn("text-sm font-semibold text-right", accent || "text-foreground")}>{value}</span>
        </div>
    );
}

export function PromoCodeDetailModal({ promo, onClose, onEdit }: PromoCodeDetailModalProps) {
    const [copied, setCopied] = useState(false);

    if (!promo) return null;

    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
    const isActive = promo.is_active && !isExpired;

    const formatValue = () => {
        if (promo.type === "percentage") return `${promo.value}%`;
        if (promo.type === "fixed_amount") return formatCurrency(parseFloat(promo.value), "FCFA");
        return "Livraison offerte";
    };

    const copyCode = () => {
        navigator.clipboard.writeText(promo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {promo && (
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
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                        <Tag className="h-3.5 w-3.5 text-primary" /> Code Promo
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <code className="rounded-xl bg-primary/10 px-4 py-2 font-mono text-2xl font-black text-primary tracking-widest border border-primary/20">
                                            {promo.code}
                                        </code>
                                        <button
                                            onClick={copyCode}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                                            isActive
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                            {isActive ? "Actif" : isExpired ? "Expiré" : "Inactif"}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={onClose} className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Valeur / Réduction */}
                            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-1">Réduction appliquée</p>
                                    <p className="text-4xl font-extrabold text-primary">{formatValue()}</p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                    {TYPE_ICON[promo.type]}
                                </div>
                            </div>

                            {/* Infos générales */}
                            <div className="rounded-2xl border border-border/50 bg-surface p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Informations générales</h3>
                                <DetailRow label="Type" value={
                                    <span className="flex items-center gap-1.5">{TYPE_ICON[promo.type]} {TYPE_LABEL[promo.type]}</span>
                                } />
                                {promo.description && (
                                    <DetailRow label="Description" value={promo.description} />
                                )}
                                <DetailRow label="Utilisations" value={
                                    <span className="text-blue-400 font-bold">{promo.number_times_used || 0}</span>
                                } />
                                <DetailRow label="Créé le" value={new Date(promo.created_at).toLocaleString("fr-FR")} />
                                <DetailRow label="Modifié le" value={new Date(promo.updated_at).toLocaleString("fr-FR")} />
                            </div>

                            {/* Période */}
                            <div className="rounded-2xl border border-border/50 bg-surface p-5">
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                    <Clock className="h-3.5 w-3.5" /> Période de validité
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-surface-elevated p-3">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Début</p>
                                        <p className="text-sm font-bold text-foreground">
                                            {promo.starts_at ? new Date(promo.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "Immédiat"}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "rounded-xl p-3",
                                        isExpired ? "bg-red-500/10" : "bg-surface-elevated"
                                    )}>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Expiration</p>
                                        <p className={cn("text-sm font-bold", isExpired ? "text-red-400" : "text-foreground")}>
                                            {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "Aucune limite"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Restrictions */}
                            {(promo.applicable_categories.length > 0 || promo.applicable_products.length > 0) && (
                                <div className="rounded-2xl border border-border/50 bg-surface p-5 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Restrictions d'application</h3>
                                    {promo.applicable_categories.length > 0 && (
                                        <div>
                                            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                                                <Layers className="h-3.5 w-3.5" /> Catégories ({promo.applicable_categories.length})
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {promo.applicable_categories.map(cat => (
                                                    <div key={cat.id} className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface/50 p-2 shadow-sm transition-colors hover:bg-surface-elevated">
                                                        {cat.image ? (
                                                            <img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt">
                                                                <Layers className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <span className="truncate text-xs font-bold text-foreground">{cat.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {promo.applicable_products.length > 0 && (
                                        <div>
                                            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                                                <Package className="h-3.5 w-3.5" /> Produits ({promo.applicable_products.length})
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {promo.applicable_products.map(prod => (
                                                    <div key={prod.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-2 shadow-sm transition-colors hover:bg-surface-elevated">
                                                        {prod.primary_image ? (
                                                            <img src={typeof prod.primary_image === 'string' ? prod.primary_image : prod.primary_image.image} alt={prod.name} className="h-10 w-10 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt">
                                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate text-xs font-bold text-foreground">{prod.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{prod.category_name}</p>
                                                        </div>
                                                        <p className="text-xs font-bold text-foreground">{formatCurrency(parseFloat(prod.price), "FCFA")}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border/40 p-5">
                            <button
                                onClick={onEdit}
                                className="relative w-full overflow-hidden rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
                                Modifier ce code promo
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
