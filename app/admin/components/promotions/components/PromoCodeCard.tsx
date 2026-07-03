/**
 * PromoCodeCard — Carte premium d'un code de réduction (vue admin)
 *
 * Affiche les informations clés d'un code promo dans deux modes :
 *  - "grid"  → carte compacte avec effet glassmorphism sobre et élégant
 *  - "list"  → ligne horizontale épurée pour le mode tableau
 *
 * Palette : noir / blanc / vert forêt (primary). Aucun orange dominant.
 *
 * @module app/admin/components/promotions/components/PromoCodeCard
 */
"use client";

import { motion } from "framer-motion";
import {
    Tag, Edit3, Trash2, Copy, Check, Eye,
    Percent, Banknote, Truck, ArrowRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminPromoCode } from "@/modeles/promotions";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface PromoCodeCardProps {
    promo: AdminPromoCode;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    viewMode?: "grid" | "list";
}

/* ─────────────────────────────────────────────────────────────── */
/* Constantes de design                                            */
/* ─────────────────────────────────────────────────────────────── */

/** Icône associée à chaque type de réduction */
const TYPE_ICON: Record<string, React.ReactNode> = {
    percentage:   <Percent   className="h-3.5 w-3.5" />,
    fixed_amount: <Banknote  className="h-3.5 w-3.5" />,
    free_shipping: <Truck    className="h-3.5 w-3.5" />,
};

/** Palette de statut — sobre, contrastée */
const STATUS_ACTIVE   = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
const STATUS_INACTIVE = "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400";

/* ─────────────────────────────────────────────────────────────── */
/* Composant                                                       */
/* ─────────────────────────────────────────────────────────────── */
export function PromoCodeCard({
    promo,
    onEdit,
    onDelete,
    onView,
    viewMode = "grid",
}: PromoCodeCardProps) {
    const [copied, setCopied] = useState(false);

    /* -- Calculs dérivés ---------------------------------------- */
    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
    const isActive  = promo.is_active && !isExpired;
    const statusLabel = isActive ? "Actif" : isExpired ? "Expiré" : "Inactif";
    const statusCls   = isActive ? STATUS_ACTIVE : STATUS_INACTIVE;

    /** Formate la valeur de réduction selon le type */
    const formatValue = (): string => {
        if (promo.type === "percentage")  return `${promo.value}%`;
        if (promo.type === "fixed_amount") return formatCurrency(parseFloat(promo.value), "FCFA");
        return "Livraison offerte";
    };

    /** Copie le code dans le presse-papier avec feedback visuel */
    const copyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(promo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /* ── VUE LISTE ─────────────────────────────────────────────── */
    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={onView}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-white dark:bg-[#1e1e1e] px-5 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
                {/* Icône type */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Tag className="h-4 w-4" />
                </div>

                {/* Code + description */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <code className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 font-mono text-[13px] font-black text-slate-800 dark:text-slate-100">
                        {promo.code}
                    </code>
                    <span className="truncate text-[13px] text-muted-foreground">
                        {promo.description || "—"}
                    </span>
                </div>

                {/* Type */}
                <div className="hidden sm:flex items-center gap-1 text-[13px] text-muted-foreground shrink-0">
                    {TYPE_ICON[promo.type]}
                </div>

                {/* Valeur */}
                <p className="shrink-0 text-[15px] font-extrabold text-slate-900 dark:text-white">
                    {formatValue()}
                </p>

                {/* Utilisations */}
                <p className="hidden md:block shrink-0 text-[13px] text-muted-foreground">
                    {promo.number_times_used || 0} util.
                </p>

                {/* Date expiration */}
                <p className="hidden lg:block shrink-0 text-[13px] text-muted-foreground">
                    {promo.expires_at
                        ? new Date(promo.expires_at).toLocaleDateString("fr-FR")
                        : "Sans fin"}
                </p>

                {/* Statut */}
                <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusCls)}>
                    {statusLabel}
                </span>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={copyCode}
                        className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Copier le code"
                    >
                        {copied
                            ? <Check className="h-4 w-4 text-emerald-500" />
                            : <Copy className="h-3.5 w-3.5" />
                        }
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onEdit(); }}
                        className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Modifier"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        );
    }

    /* ── VUE GRILLE ────────────────────────────────────────────── */
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={onView}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-white dark:bg-[#1e1e1e] shadow-sm transition-all hover:shadow-lg hover:border-primary/25"
        >
            {/* Liseré signature supérieur — très discret */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-slate-300 via-primary/40 to-slate-300 dark:from-slate-700 dark:via-primary/50 dark:to-slate-700" />

            <div className="p-5">
                {/* En-tête : code + actions */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Icône neutre */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <Tag className="h-4 w-4" />
                        </div>
                        <div>
                            {/* Code + bouton copier */}
                            <div className="flex items-center gap-2">
                                <code className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-0.5 font-mono text-[13px] font-black text-slate-800 dark:text-slate-100">
                                    {promo.code}
                                </code>
                                <button
                                    onClick={e => { e.stopPropagation(); copyCode(e); }}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    title="Copier le code"
                                >
                                    {copied
                                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        : <Copy className="h-3.5 w-3.5" />
                                    }
                                </button>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[160px]">
                                {promo.description || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Actions (visibles au survol) */}
                    <div
                        className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={e => { e.stopPropagation(); onEdit(); }}
                            className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Modifier"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); onDelete(); }}
                            className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Valeur principale + statut */}
                <div className="mt-5 flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatValue()}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                            {promo.number_times_used || 0} utilisation(s)
                        </p>
                    </div>
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", statusCls)}>
                        {statusLabel}
                    </span>
                </div>

                {/* Période de validité */}
                <div className="mt-3 text-[11px] text-muted-foreground">
                    {promo.starts_at && (
                        <span>Du {new Date(promo.starts_at).toLocaleDateString("fr-FR")} </span>
                    )}
                    {promo.expires_at && (
                        <span>au {new Date(promo.expires_at).toLocaleDateString("fr-FR")}</span>
                    )}
                    {!promo.expires_at && <span>Sans date d'expiration</span>}
                </div>

                {/* Lien "Voir détails" */}
                <div className="mt-4 flex items-center justify-end border-t border-border/40 pt-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                        <Eye className="h-3 w-3" />
                        Voir détails
                        <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}