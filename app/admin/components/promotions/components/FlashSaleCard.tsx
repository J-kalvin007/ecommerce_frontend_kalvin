/**
 * FlashSaleCard — Carte premium d'une vente en solde (vue admin)
 *
 * Affiche les informations clés d'une vente en solde dans deux modes :
 *  - "grid" → carte avec image produit, barre de progression du stock
 *  - "list" → ligne horizontale compacte
 *
 * Renommage : "Vente Flash" → "Vente en Solde" partout dans ce composant.
 * Palette : noir / blanc / vert forêt. Amber uniquement pour les badges %.
 *
 * @module app/admin/components/promotions/components/FlashSaleCard
 */
"use client";

import { motion } from "framer-motion";
import {
    TrendingDown, Edit3, Trash2, Clock, Eye, Edit, ArrowRight, Package,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminSoldes } from "@/modeles/promotions";

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface FlashSaleCardProps {
    sale: AdminSoldes;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    viewMode?: "grid" | "list";
}

/* ─────────────────────────────────────────────────────────────── */
/* Composant                                                       */
/* ─────────────────────────────────────────────────────────────── */
export function FlashSaleCard({
    sale,
    onEdit,
    onDelete,
    onView,
    viewMode = "grid",
}: FlashSaleCardProps) {
    /* -- Calculs dérivés ---------------------------------------- */
    const isActive = sale.is_active && new Date(sale.ends_at) > new Date();
    const progress = sale.quota_stock_limit
        ? Math.min((sale.product_sold_count / sale.quota_stock_limit) * 100, 100)
        : 0;

    const discount = sale.original_price && parseFloat(sale.original_price) > 0
        ? Math.round((1 - parseFloat(sale.sale_price) / parseFloat(sale.original_price)) * 100)
        : null;

    const statusCls = isActive
        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
        : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400";

    /** Résolution de l'URL de l'image principale du produit */
    const primaryImageObj = (sale.product as any).images?.find((img: any) => img.is_primary)
        || (sale.product as any).images?.[0];
    const imageSrc = primaryImageObj
        ? primaryImageObj.image
        : sale.product.primary_image
            ? (typeof sale.product.primary_image === "string"
                ? sale.product.primary_image
                : sale.product.primary_image.image)
            : null;

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
                {/* Image / Icône du produit */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {imageSrc ? (
                        <img src={imageSrc} alt={sale.product.name} className="h-full w-full object-cover" />
                    ) : (
                        <Package className="h-5 w-5 text-slate-400" />
                    )}
                </div>

                {/* Nom produit */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">
                        {sale.product.name}
                    </p>
                    {sale.variant && (
                        <span className="text-[11px] text-muted-foreground">
                            Variante : {sale.variant.name?.slice(0, 16)}
                        </span>
                    )}
                </div>

                {/* Badge de réduction */}
                {discount !== null && discount > 0 && (
                    <span className="shrink-0 rounded-lg bg-slate-800 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-black text-gray-100 shadow-sm">
                        -{discount}%
                    </span>
                )}

                {/* Prix soldé + original */}
                <div className="shrink-0 text-right">
                    <p className="text-[14px] font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}
                    </p>
                    {sale.original_price && (
                        <p className="text-[11px] line-through text-muted-foreground">
                            {formatCurrency(parseFloat(sale.original_price), "FCFA")}
                        </p>
                    )}
                </div>

                {/* Date de fin */}
                <div className="hidden md:flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(sale.ends_at).toLocaleDateString("fr-FR")}
                </div>

                {/* Stock */}
                {sale.quota_stock_limit && (
                    <p className="hidden lg:block shrink-0 text-[12px] text-muted-foreground">
                        {sale.product_sold_count}/{sale.quota_stock_limit}
                    </p>
                )}

                {/* Statut */}
                <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusCls)}>
                    {isActive ? "En cours" : "Terminée"}
                </span>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={e => { e.stopPropagation(); onEdit(); }}
                        className="rounded-lg p-1.5 cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Modifier"
                    >
                        <Edit className="h-4 w-4" />
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
            {/* Liseré signature supérieur */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-slate-300 via-primary/40 to-slate-300 dark:from-slate-700 dark:via-primary/50 dark:to-slate-700" />

            <div className="p-5">
                {/* En-tête : image + badge discount + actions */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Miniature produit */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {imageSrc ? (
                                <img src={imageSrc} alt={sale.product.name} className="h-full w-full object-cover" />
                            ) : (
                                <Package className="h-5 w-5 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {sale.product.name.length > 20
                                    ? `${sale.product.name.slice(0, 20)}…`
                                    : sale.product.name}
                            </p>
                            {sale.variant && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {sale.variant.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Badge de réduction sobre */}
                        {discount !== null && discount > 0 && (
                            <span className="rounded-lg bg-slate-800 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-black text-gray-100">
                                -{discount}%
                            </span>
                        )}
                        {/* Actions au survol */}
                        <div
                            className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
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
                </div>

                {/* Bloc prix */}
                <div className="mt-5 flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}
                        </p>
                        {sale.original_price && (
                            <p className="text-xs line-through text-muted-foreground mt-0.5">
                                {formatCurrency(parseFloat(sale.original_price), "FCFA")}
                            </p>
                        )}
                    </div>
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", statusCls)}>
                        {isActive ? "En cours" : "Terminée"}
                    </span>
                </div>

                {/* Barre de progression du stock */}
                {sale.quota_stock_limit && (
                    <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-[11px]">
                            <span className="text-muted-foreground">Stock vendu</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {sale.product_sold_count}/{sale.quota_stock_limit}
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    progress >= 90
                                        ? "bg-red-500"
                                        : progress >= 60
                                            ? "bg-amber-500"
                                            : "bg-primary"
                                )}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer : date + voir détails */}
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(sale.ends_at).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-primary transition-colors font-semibold">
                        <Eye className="h-3 w-3" />
                        Voir détails
                        <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}