// app/admin/components/promotions/components/FlashSaleCard.tsx
"use client";
import { motion } from "framer-motion";
import { Zap, Edit3, Trash2, Clock, Eye } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminSoldes } from "@/modeles/promotions";

interface FlashSaleCardProps {
    sale: AdminSoldes;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    viewMode?: "grid" | "list";
}

export function FlashSaleCard({ sale, onEdit, onDelete, onView, viewMode = "grid" }: FlashSaleCardProps) {
    const isActive = sale.is_active && new Date(sale.ends_at) > new Date();
    const progress = sale.quota_stock_limit ? Math.min((sale.product_sold_count / sale.quota_stock_limit) * 100, 100) : 0;
    const remaining = sale.quota_stock_limit ? sale.quota_stock_limit - sale.product_sold_count : null;
    const discount = sale.original_price && parseFloat(sale.original_price) > 0
        ? Math.round((1 - parseFloat(sale.sale_price) / parseFloat(sale.original_price)) * 100)
        : null;

    const statusCls = isActive
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20";

    const primaryImageObj = (sale.product as any).images?.find((img: any) => img.is_primary) || (sale.product as any).images?.[0];
    const imageSrc = primaryImageObj ? primaryImageObj.image : (sale.product.primary_image ? (typeof sale.product.primary_image === 'string' ? sale.product.primary_image : sale.product.primary_image.image) : null);

    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={onView}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-surface-elevated px-4 py-3 shadow-sm transition-all hover:border-amber-500/30 hover:shadow-md hover:bg-surface-alt/50"
            >
                {/* Image / Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 overflow-hidden relative">
                    {imageSrc ? (
                        <img src={imageSrc} alt={sale.product.name} className="h-full w-full object-cover" />
                    ) : (
                        <Zap className="h-4 w-4" />
                    )}
                </div>

                {/* Produit */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <code className="truncate font-mono text-xs text-muted-foreground">
                        {sale.product.name.slice(0, 16)}…
                    </code>
                    {sale.variant && (
                        <span className="text-[10px] text-muted-foreground/60">Variante: {sale.variant.name?.slice(0, 8)}…</span>
                    )}
                </div>

                {/* Discount badge */}
                {discount !== null && discount > 0 && (
                    <span className="shrink-0 rounded-lg bg-amber-500 px-2 py-0.5 text-xs font-black text-white shadow-sm">
                        -{discount}%
                    </span>
                )}

                {/* Prix */}
                <div className="shrink-0 text-right">
                    <p className="text-base font-extrabold text-amber-400">{formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}</p>
                    {sale.original_price && (
                        <p className="text-[10px] line-through text-muted-foreground">{formatCurrency(parseFloat(sale.original_price), "FCFA")}</p>
                    )}
                </div>

                {/* Date fin */}
                <div className="hidden md:flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(sale.ends_at).toLocaleDateString("fr-FR")}
                </div>

                {/* Stock */}
                {sale.quota_stock_limit && (
                    <p className="hidden lg:block shrink-0 text-xs text-muted-foreground">
                        {sale.product_sold_count}/{sale.quota_stock_limit}
                    </p>
                )}

                {/* Statut */}
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold", statusCls)}>
                    {isActive ? "En cours" : "Terminée"}
                </span>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    <button onClick={e => { e.stopPropagation(); onEdit(); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400 transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
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
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-amber-500/30"
        >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/60 to-orange-500/60" />

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 overflow-hidden">
                        {imageSrc ? (
                            <img src={imageSrc} alt={sale.product.name} className="h-full w-full object-cover" />
                        ) : (
                            <Zap className="h-4 w-4" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">Produit</p>
                        <code className="font-mono text-[10px] text-muted-foreground">{sale.product.name.slice(0, 12)}…</code>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {discount !== null && discount > 0 && (
                        <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-xs font-black text-white">-{discount}%</span>
                    )}
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                        <button onClick={e => { e.stopPropagation(); onEdit(); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400 transition-colors">
                            <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className="text-2xl font-extrabold text-amber-400">{formatCurrency(parseFloat(sale.sale_price || "0"), "FCFA")}</p>
                    {sale.original_price && (
                        <p className="text-xs line-through text-muted-foreground">{formatCurrency(parseFloat(sale.original_price), "FCFA")}</p>
                    )}
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", statusCls)}>
                    {isActive ? "En cours" : "Terminée"}
                </span>
            </div>

            {sale.quota_stock_limit && (
                <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-semibold text-foreground">{sale.product_sold_count}/{sale.quota_stock_limit}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-alt overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", progress >= 90 ? "bg-red-500" : progress >= 60 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(sale.ends_at).toLocaleDateString("fr-FR")}</span>
                <span className="flex items-center gap-1 text-amber-400/60 group-hover:text-amber-400 transition-colors">
                    <Eye className="h-3 w-3" /> Voir détails
                </span>
            </div>
        </motion.div>
    );
}