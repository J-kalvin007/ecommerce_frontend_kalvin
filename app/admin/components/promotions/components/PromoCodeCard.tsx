// app/admin/components/promotions/components/PromoCodeCard.tsx
"use client";
import { motion } from "framer-motion";
import { Tag, Edit3, Trash2, Copy, Check, Eye, Percent, Banknote, Truck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminPromoCode } from "@/modeles/promotions";
import { useState } from "react";

interface PromoCodeCardProps {
    promo: AdminPromoCode;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    viewMode?: "grid" | "list";
}

const TYPE_ICON: Record<string, React.ReactNode> = {
    percentage: <Percent className="h-3.5 w-3.5" />,
    fixed_amount: <Banknote className="h-3.5 w-3.5" />,
    free_shipping: <Truck className="h-3.5 w-3.5" />,
};

export function PromoCodeCard({ promo, onEdit, onDelete, onView, viewMode = "grid" }: PromoCodeCardProps) {
    const [copied, setCopied] = useState(false);
    const copyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(promo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
    const isActive = promo.is_active && !isExpired;
    const statusLabel = isActive ? "Actif" : isExpired ? "Expiré" : "Inactif";
    const statusCls = isActive
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20";

    const formatValue = () => {
        if (promo.type === "percentage") return `${promo.value}%`;
        if (promo.type === "fixed_amount") return formatCurrency(parseFloat(promo.value), "FCFA");
        return "Livraison offerte";
    };

    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={onView}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-surface-elevated px-4 py-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:bg-surface-alt/50"
            >
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Tag className="h-5 w-5" />
                </div>

                {/* Code + description */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <code className="shrink-0 rounded-lg bg-primary/5 px-2.5 py-1 font-mono text-[14px]  font-black text-primary border border-primary/10">
                        {promo.code}
                    </code>
                    <span className="truncate text-[14px] text-muted-foreground">{promo.description || "—"}</span>
                </div>

                {/* Type */}
                <div className="hidden sm:flex items-center gap-1 text-[14px] text-muted-foreground shrink-0">
                    {TYPE_ICON[promo.type]}
                </div>

                {/* Valeur */}
                <p className="shrink-0 text-[16px] font-extrabold text-primary">{formatValue()}</p>

                {/* Utilisations */}
                <p className="hidden md:block shrink-0 text-[14px] text-muted-foreground">{promo.number_times_used || 0} util.</p>

                {/* Date expiration */}
                <p className="hidden lg:block shrink-0 text-[14px] text-muted-foreground">
                    {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString("fr-FR") : "Sans fin"}
                </p>

                {/* Statut */}
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[14px] font-bold", statusCls)}>
                    {statusLabel}
                </span>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 " onClick={e => e.stopPropagation()}>

                    <button onClick={copyCode} className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>

                    <button onClick={e => { e.stopPropagation(); onEdit(); }} className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit3 className="h-4 w-4" />
                    </button>

                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />

                    </button>
                </div>

            </motion.div>
        );
    }

    // Grid mode
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onView}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
        >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Tag className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <code className="rounded-lg bg-primary/5 px-2 py-0.5 font-mono text-sm font-black text-primary border border-primary/10">
                                {promo.code}
                            </code>
                            <button onClick={e => { e.stopPropagation(); copyCode(e); }} className="text-muted-foreground hover:text-primary transition-colors">
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[160px]">{promo.description || "—"}</p>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    <button onClick={e => { e.stopPropagation(); onEdit(); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className="text-2xl font-extrabold text-primary">{formatValue()}</p>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">{promo.number_times_used || 0} utilisation(s)</p>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", statusCls)}>
                    {statusLabel}
                </span>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
                {promo.starts_at && <span>Du {new Date(promo.starts_at).toLocaleDateString("fr-FR")}</span>}
                {promo.expires_at && <span> au {new Date(promo.expires_at).toLocaleDateString("fr-FR")}</span>}
                {!promo.expires_at && <span>Sans date d'expiration</span>}
            </div>

            <div className="mt-3 flex items-center justify-end">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary/60 group-hover:text-primary transition-colors">
                    <Eye className="h-3 w-3" /> Voir détails
                </span>
            </div>
        </motion.div>
    );
}