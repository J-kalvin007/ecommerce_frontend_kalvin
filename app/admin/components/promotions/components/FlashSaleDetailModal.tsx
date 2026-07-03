/**
 * FlashSaleDetailModal — Modale horizontale premium de détail d'une vente en solde
 *
 * Architecture horizontale en deux colonnes :
 *  - Colonne gauche  → détails de la vente (prix, réduction, période, progression)
 *  - Colonne droite  → produit & variante concernés
 *
 * Remplace l'ancien tiroir latéral (side-panel) par une vraie modale centrée.
 * Palette : noir / blanc / vert forêt. Renommé "Vente en Solde" partout.
 *
 * @module app/admin/components/promotions/components/FlashSaleDetailModal
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X, Calendar, Clock, BarChart2, Package, Edit3,
    ToggleLeft, ToggleRight, ArrowRight, Tag, Hash, TrendingDown,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminSoldes } from "@/modeles/promotions";

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface FlashSaleDetailModalProps {
    sale: AdminSoldes | null;
    onClose: () => void;
    onEdit: () => void;
}

/* ─────────────────────────────────────────────────────────────── */
/* Composant principal                                             */
/* ─────────────────────────────────────────────────────────────── */
export function FlashSaleDetailModal({
    sale,
    onClose,
    onEdit,
}: FlashSaleDetailModalProps) {
    if (!sale) return null;

    /* -- Calculs dérivés ---------------------------------------- */
    const isActive = sale.is_active && new Date(sale.ends_at) > new Date();
    const progress = sale.quota_stock_limit
        ? Math.min((sale.product_sold_count / sale.quota_stock_limit) * 100, 100)
        : 0;
    const remaining = sale.quota_stock_limit
        ? sale.quota_stock_limit - sale.product_sold_count
        : null;

    const discount = sale.original_price && parseFloat(sale.original_price) > 0
        ? Math.round((1 - parseFloat(sale.sale_price) / parseFloat(sale.original_price)) * 100)
        : null;

    /** Calcule le temps restant sous forme lisible */
    const timeLeft = (): string => {
        const now = new Date();
        const end = new Date(sale.ends_at);
        if (end < now) return "Terminée";
        const diff = end.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        if (d > 0) return `${d}j ${h % 24}h restant${d > 1 ? "s" : ""}`;
        return `${h}h restantes`;
    };

    /** Résolution de l'image principale du produit */
    const primaryImageObj = (sale.product as any).images?.find((img: any) => img.is_primary)
        || (sale.product as any).images?.[0];
    const imageSrc = primaryImageObj
        ? primaryImageObj.image
        : sale.product.primary_image
            ? (typeof sale.product.primary_image === "string"
                ? sale.product.primary_image
                : sale.product.primary_image.image)
            : null;

    /* ─────────────────────────────────────────────────────────── */
    /* Rendu                                                        */
    /* ─────────────────────────────────────────────────────────── */
    return (
        <AnimatePresence>
            {sale && (
                <>
                    {/* ── Backdrop ─────────────────────────────── */}
                    <motion.div
                        key="sale-detail-backdrop"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50"
                    />

                    {/* ── Modale horizontale ───────────────────── */}
                    <motion.div
                        key="sale-detail-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
                    >
                        <div 
                            className="no-scrollbar relative w-full max-w-4xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-[24px] bg-white dark:bg-[#1a1a1a] shadow-2xl border border-slate-200 dark:border-slate-800"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <style>{`
                                .no-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>

                            {/* Liseré supérieur signature */}
                            {/* <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-slate-300 via-primary/50 to-slate-300 dark:from-slate-700 dark:via-primary/60 dark:to-slate-700" /> */}

                            {/* Halos ambiants */}
                            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/6 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-slate-200/50 dark:bg-slate-800/50 blur-3xl" />

                            {/* Bouton fermer */}
                            <button
                                onClick={onClose}
                                className="absolute right-5 top-5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-all hover:rotate-90 hover:bg-slate-200 dark:hover:bg-slate-700"
                                aria-label="Fermer"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* ── Structure horizontale ──────────── */}
                            <div className="relative z-10 flex flex-col lg:flex-row gap-0">

                                {/* ── COLONNE GAUCHE : Détails de la vente ── */}
                                <div className="flex-1 p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">

                                    {/* En-tête */}
                                    <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                        <TrendingDown className="h-3.5 w-3.5 text-primary" />
                                        Vente en Solde
                                    </div>

                                    {/* Badges statut + temps */}
                                    <div className="mb-6 flex flex-wrap items-center gap-2">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                                            isActive
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                                        )}>
                                            {isActive
                                                ? <ToggleRight className="h-3.5 w-3.5" />
                                                : <ToggleLeft className="h-3.5 w-3.5" />
                                            }
                                            {isActive ? "En cours" : "Terminée"}
                                        </span>
                                        {isActive && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                <Clock className="h-3 w-3" />
                                                {timeLeft()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bloc prix hero */}
                                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 mb-5">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                    Prix soldé
                                                </p>
                                                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                                    {formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}
                                                </p>
                                                {sale.original_price && (
                                                    <p className="mt-1 text-sm line-through text-muted-foreground">
                                                        {formatCurrency(parseFloat(sale.original_price), "FCFA")}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Badge de réduction sobre */}
                                            {discount !== null && discount > 0 && (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 dark:bg-slate-700 shadow-lg">
                                                    <div className="text-center text-gray-100">
                                                        <p className="text-xl font-extrabold leading-none">-{discount}%</p>
                                                        <p className="text-[9px] font-bold opacity-70 mt-0.5">SOLDE</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progression du stock */}
                                    {sale.quota_stock_limit && (
                                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] p-5 mb-5">
                                            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                                <BarChart2 className="h-3.5 w-3.5" />
                                                Progression des ventes
                                            </h3>
                                            <div className="flex justify-between text-sm font-bold mb-3">
                                                <span className="text-slate-800 dark:text-slate-100">
                                                    {sale.product_sold_count} vendu(s)
                                                </span>
                                                <span className="text-muted-foreground">
                                                    / {sale.quota_stock_limit} quota
                                                </span>
                                            </div>
                                            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        progress >= 90
                                                            ? "bg-red-500"
                                                            : progress >= 60
                                                                ? "bg-amber-500"
                                                                : "bg-primary"
                                                    )}
                                                />
                                            </div>
                                            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                                                <span>{progress.toFixed(0)}% écoulé</span>
                                                {remaining !== null && remaining > 0 && (
                                                    <span className="text-primary font-bold">
                                                        {remaining} restant(s) au prix soldé
                                                    </span>
                                                )}
                                                {remaining === 0 && (
                                                    <span className="text-red-500 font-bold">Quota épuisé</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Période d'activation */}
                                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] p-5">
                                        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Période d'activation
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3">
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Début</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    {new Date(sale.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(sale.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "rounded-xl p-3",
                                                !isActive ? "bg-red-50 dark:bg-red-500/10" : "bg-slate-50 dark:bg-slate-900/50"
                                            )}>
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Fin</p>
                                                <p className={cn("text-sm font-bold", !isActive ? "text-red-500" : "text-slate-800 dark:text-slate-100")}>
                                                    {new Date(sale.ends_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(sale.ends_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── COLONNE DROITE : Produit & Variante ── */}
                                <div className="w-full lg:w-[360px] flex flex-col p-5 sm:p-7">

                                    <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                        <Package className="h-3.5 w-3.5 text-primary" />
                                        Produit concerné
                                    </div>

                                    {/* Carte produit */}
                                    <div className="flex-1 space-y-4">
                                        <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e1e]">
                                            {/* Image produit */}
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={sale.product.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                                    <Package className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                                                </div>
                                            )}

                                            {/* Détails produit */}
                                            <div className="p-4">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {sale.product.name}
                                                </p>
                                                {sale.product.category_name && (
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <Tag className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {sale.product.category_name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Variante */}
                                        {sale.variant && (
                                            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700">
                                                    <Hash className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Variante ciblée</p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                                                        {sale.variant.name}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Récap des prix */}
                                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] divide-y divide-slate-100 dark:divide-slate-800">
                                            {sale.original_price && (
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <span className="text-xs text-muted-foreground">Prix original</span>
                                                    <span className="text-xs font-bold line-through text-muted-foreground">
                                                        {formatCurrency(parseFloat(sale.original_price), "FCFA")}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-xs text-muted-foreground">Prix soldé</span>
                                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                    {formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}
                                                </span>
                                            </div>
                                            {discount !== null && discount > 0 && (
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <span className="text-xs text-muted-foreground">Économie</span>
                                                    <span className="text-xs font-bold text-primary">
                                                        -{discount}% ({formatCurrency(
                                                            parseFloat(sale.original_price || "0") - parseFloat(sale.sale_price || "0"),
                                                            "FCFA"
                                                        )})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bouton Modifier */}
                                    <button
                                        onClick={onEdit}
                                        className="group relative mt-6 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-3.5 text-[14px] font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                    >
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                        <Edit3 className="h-4 w-4" />
                                        Modifier cette vente en solde
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
