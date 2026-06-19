
// components/admin/produits/ProductList.tsx
"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Edit3, Trash2, Layers, Crown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { mediaUrl } from "@/lib/mediaUrl";
import type { ProductDetail } from "@/modeles/produits";

const PRODUCT_TYPE_FR: Record<string, string> = {
  RAW: "Brut",
  PROCESSED: "Transformé",
  EXPORT: "Export",
};

interface ProductListProps {
  products: ProductDetail[];
  onProductClick: (product: ProductDetail) => void;
  onEdit: (product: ProductDetail) => void;
  onDelete: (id: string) => void;
  onAddVariant: (product: ProductDetail) => void;
}

export function SafeProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const resolvedSrc = mediaUrl(src);

  if (!resolvedSrc || error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg text-muted-foreground/30 bg-slate-50 dark:bg-slate-800">
        📦
      </div>
    );
  }
  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="48px"
      onError={() => setError(true)}
    />
  );
}

export function ProductList({ products, onProductClick, onEdit, onDelete, onAddVariant }: ProductListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e1e1e] shadow-sm">
      {/* Header table */}
      <div className="border-b border-border/50 bg-slate-50 dark:bg-slate-800/60 px-5 py-3">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 min-w-[680px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Produit</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SKU</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prix</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stock</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right pr-1">Actions</span>
        </div>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {products.map((product, idx) => {
            const primaryImage = product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image || "";
            const variantsCount = product.variants?.length || 0;
            const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as any) || 0;
            let stockLabel = "";
            let stockDot = "";
            let stockTextColor = "";

            if (stock === 0) {
              stockLabel = "Épuisé";
              stockDot = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
              stockTextColor = "text-red-600 font-bold";
            } else if (stock <= 5) {
              stockLabel = "Alerte critique";
              stockDot = "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]";
              stockTextColor = "text-rose-600 font-bold";
            } else if (stock <= 10) {
              stockLabel = "Stock bas";
              stockDot = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
              stockTextColor = "text-amber-600 font-semibold";
            } else {
              stockLabel = "En stock";
              stockDot = "bg-emerald-500";
              stockTextColor = "text-emerald-600 font-medium";
            }

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onProductClick(product)}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border/30 px-5 py-4 last:border-0 cursor-pointer transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]"
              >
                {/* Produit */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-slate-50 dark:bg-slate-800 border border-border/50 p-1.5 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <div className="relative h-full w-full rounded-[8px] overflow-hidden bg-white dark:bg-zinc-900">
                      <SafeProductImage src={primaryImage} alt={product.name} />
                    </div>
                    {product.is_top && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-md border border-white dark:border-zinc-900">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1.5">
                      <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-border/50">{product.category?.name || "Sans catégorie"}</span>
                      {variantsCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                          <Layers className="h-3 w-3" /> {variantsCount} var.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* SKU */}
                <div className="font-mono text-[13px] font-medium text-muted-foreground truncate bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-border/30 inline-block w-fit">
                  {product.sku}
                </div>

                {/* Prix */}
                <div className="text-[15px] font-black text-primary tracking-tight">
                  {formatCurrency(parseFloat(product.price), "FCFA")}
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full shrink-0 border border-white/20", stockDot)} />
                  <div className="flex flex-col">
                    <span className={cn("text-[13px] leading-tight", stockTextColor)}>{stockLabel}</span>
                    <span className="text-[11px] text-muted-foreground font-medium">{product.stock} en stock</span>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span className="rounded-full border border-border/60 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-muted-foreground shadow-sm">
                    {PRODUCT_TYPE_FR[product.product_type] || product.product_type}
                  </span>
                </div>

                {/* Actions (Bubble Menu) */}
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-border/60 p-1 shadow-sm backdrop-blur-xl transition-all duration-300 group-hover:bg-white dark:group-hover:bg-zinc-800 group-hover:shadow-md group-hover:border-border/80">
                    <button
                      onClick={() => onAddVariant(product)}
                      title="Gérer les variantes"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105"
                    >
                      <Layers className="h-4 w-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
                    <button
                      onClick={() => onEdit(product)}
                      title="Modifier"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-600 hover:scale-105"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
                    <button
                      onClick={() => onDelete(product.id)}
                      title="Supprimer"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}