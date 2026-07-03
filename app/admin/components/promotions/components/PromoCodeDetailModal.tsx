/**
 * PromoCodeDetailModal — Modale horizontale premium de détail d'un code promo
 *
 * Architecture horizontale en deux colonnes :
 *  - Colonne gauche  → détails du code (valeur, type, période, stats)
 *  - Colonne droite  → produits et catégories affectés
 *
 * Remplace l'ancien tiroir latéral (side-panel) par une vraie modale centrée,
 * avec animations Framer Motion et palette sobre (noir / blanc / vert forêt).
 *
 * @module app/admin/components/promotions/components/PromoCodeDetailModal
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X, Tag, Clock, Check, Copy,
    Package, Layers, ToggleLeft, ToggleRight,
    Percent, Banknote, Truck, Edit3, ArrowRight,
    Calendar, Hash,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminPromoCode } from "@/modeles/promotions";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────────── */
/* Constantes                                                      */
/* ─────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────── */
/* Sous-composants                                                 */
/* ─────────────────────────────────────────────────────────────── */

/** Ligne de détail générique — label à gauche, valeur à droite */
function DetailRow({
    label,
    value,
    accent,
}: {
    label: string;
    value: React.ReactNode;
    accent?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                {label}
            </span>
            <span className={cn("text-xs font-semibold text-right", accent || "text-foreground")}>
                {value}
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */

interface PromoCodeDetailModalProps {
    promo: AdminPromoCode | null;
    onClose: () => void;
    onEdit: () => void;
}

/* ─────────────────────────────────────────────────────────────── */
/* Composant principal                                             */
/* ─────────────────────────────────────────────────────────────── */

export function PromoCodeDetailModal({
    promo,
    onClose,
    onEdit,
}: PromoCodeDetailModalProps) {
    const [copied, setCopied] = useState(false);

    if (!promo) return null;

    /* -- Calculs dérivés ---------------------------------------- */
    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
    const isActive = promo.is_active && !isExpired;
    const hasRestrictions =
        promo.applicable_categories.length > 0 ||
        promo.applicable_products.length > 0;

    const formatValue = (): string => {
        if (promo.type === "percentage") return `${promo.value}%`;
        if (promo.type === "fixed_amount") return formatCurrency(parseFloat(promo.value), "FCFA");
        return "Livraison offerte";
    };

    const copyCode = () => {
        navigator.clipboard.writeText(promo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /* ─────────────────────────────────────────────────────────── */
    /* Rendu                                                        */
    /* ─────────────────────────────────────────────────────────── */
    return (
        <AnimatePresence>
            {promo && (
                <>
                    {/* ── Backdrop ─────────────────────────────── */}
                    <motion.div
                        key="promo-detail-backdrop"
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50"
                    />

                    {/* ── Modale horizontale ───────────────────── */}
                    <motion.div
                        key="promo-detail-modal"
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

                                {/* ── COLONNE GAUCHE : Détails du code ── */}
                                <div className="flex-1 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">

                                    {/* En-tête */}
                                    <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5 text-primary" />
                                        Code Promo
                                    </div>

                                    {/* Code principal + copier */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <code className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest">
                                            {promo.code}
                                        </code>
                                        <button
                                            onClick={copyCode}
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
                                            title="Copier le code"
                                        >
                                            {copied
                                                ? <Check className="h-4 w-4 text-emerald-500" />
                                                : <Copy className="h-4 w-4" />
                                            }
                                        </button>
                                    </div>

                                    {/* Statut */}
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold mb-4",
                                        isActive
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                            : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                                    )}>
                                        {isActive
                                            ? <ToggleRight className="h-3.5 w-3.5" />
                                            : <ToggleLeft className="h-3.5 w-3.5" />
                                        }
                                        {isActive ? "Actif" : isExpired ? "Expiré" : "Inactif"}
                                    </span>

                                    {/* Bloc valeur */}
                                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                Réduction appliquée
                                            </p>
                                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                                {formatValue()}
                                            </p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {TYPE_ICON[promo.type]}
                                        </div>
                                    </div>

                                    {/* Informations générales */}
                                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] p-4 mb-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                            Informations générales
                                        </h3>
                                        <DetailRow label="Type" value={
                                            <span className="flex items-center gap-1.5">
                                                {TYPE_ICON[promo.type]} {TYPE_LABEL[promo.type]}
                                            </span>
                                        } />
                                        {promo.description && (
                                            <DetailRow label="Description" value={promo.description} />
                                        )}
                                        <DetailRow
                                            label="Utilisations"
                                            value={
                                                <span className="font-bold text-primary">
                                                    {promo.number_times_used || 0}
                                                </span>
                                            }
                                        />
                                        <DetailRow label="Créé le" value={new Date(promo.created_at).toLocaleString("fr-FR")} />
                                        <DetailRow label="Modifié le" value={new Date(promo.updated_at).toLocaleString("fr-FR")} />
                                    </div>

                                    {/* Période de validité */}
                                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] p-4">
                                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Période de validité
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2.5">
                                                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Début</p>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                    {promo.starts_at
                                                        ? new Date(promo.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                                                        : "Immédiat"}
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "rounded-xl p-2.5",
                                                isExpired ? "bg-red-50 dark:bg-red-500/10" : "bg-slate-50 dark:bg-slate-900/50"
                                            )}>
                                                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Expiration</p>
                                                <p className={cn("text-xs font-bold", isExpired ? "text-red-500" : "text-slate-800 dark:text-slate-100")}>
                                                    {promo.expires_at
                                                        ? new Date(promo.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                                                        : "Aucune limite"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── COLONNE DROITE : Produits & Catégories ── */}
                                <div className="w-full lg:w-[360px] flex flex-col p-4 sm:p-5">

                                    <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                        <Package className="h-3.5 w-3.5 text-primary" />
                                        Produits & Catégories affectés
                                    </div>

                                    {!hasRestrictions ? (
                                        /* Aucune restriction → applicable partout */
                                        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                                <Tag className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                Applicable sur tout le catalogue
                                            </p>
                                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                                Ce code ne comporte aucune restriction de produit ou de catégorie.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 space-y-5 overflow-y-auto pr-1">

                                            {/* Catégories */}
                                            {promo.applicable_categories.length > 0 && (
                                                <div>
                                                    <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-3">
                                                        <Layers className="h-3.5 w-3.5" />
                                                        Catégories ({promo.applicable_categories.length})
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {promo.applicable_categories.map(cat => (
                                                            <div
                                                                key={cat.id}
                                                                className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                {cat.image ? (
                                                                    <img
                                                                        src={cat.image}
                                                                        alt={cat.name}
                                                                        className="h-8 w-8 rounded-lg object-cover shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0">
                                                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <span className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                                                                    {cat.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Produits */}
                                            {promo.applicable_products.length > 0 && (
                                                <div>
                                                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground mb-2">
                                                        <Package className="h-3.5 w-3.5" />
                                                        Produits ({promo.applicable_products.length})
                                                    </p>
                                                    <div className="space-y-2">
                                                        {promo.applicable_products.map(prod => (
                                                            <div
                                                                key={prod.id}
                                                                className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                {prod.primary_image ? (
                                                                    <img
                                                                        src={typeof prod.primary_image === "string"
                                                                            ? prod.primary_image
                                                                            : prod.primary_image.image}
                                                                        alt={prod.name}
                                                                        className="h-8 w-8 rounded-lg object-cover shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0">
                                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                                                                        {prod.name}
                                                                    </p>
                                                                    <p className="text-[9px] text-muted-foreground">
                                                                        {prod.category_name}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                                                    {formatCurrency(parseFloat(prod.price), "FCFA")}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Bouton Modifier */}
                                    <button
                                        onClick={onEdit}
                                        className="group relative mt-4 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-2.5 text-[13px] font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                    >
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                        <Edit3 className="h-4 w-4" />
                                        Modifier ce code promo
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
