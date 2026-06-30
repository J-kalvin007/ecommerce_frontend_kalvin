


// components/admin/produits/ProductCard.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, Layers, Crown, Eye, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { mediaUrl } from "@/lib/mediaUrl";
import type { ProductDetail } from "@/modeles/produits";

const PRODUCT_TYPE_FR: Record<string, string> = {
  RAW: "Brut",
  PROCESSED: "Transformé",
  EXPORT: "Export",
};

interface ProductCardProps {
  product: ProductDetail;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddVariant: () => void;
}

export function ProductCard({ product, onClick, onEdit, onDelete, onAddVariant }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image || "";
  const variantsCount = product.variants?.length || 0;
  const isTop = product.is_top;
  const stock = typeof product.stock === "number" ? product.stock : parseInt(product.stock as any) || 0;

  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const resolvedPrimaryImage = mediaUrl(primaryImage);

  // Stock config
  type StockConfig = { label: string; color: string; bg: string; glow: string; barWidth: string; pulse: boolean };
  const stockConfig: StockConfig =
    stock === 0
      ? { label: "Épuisé", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", glow: "bg-red-500", barWidth: "w-0", pulse: false }
      : stock <= 5
        ? { label: "Critique", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", glow: "bg-rose-500", barWidth: "w-[8%]", pulse: true }
        : stock <= 10
          ? { label: "Stock bas", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", glow: "bg-amber-500", barWidth: "w-[25%]", pulse: false }
          : { label: "En stock", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", glow: "bg-emerald-500", barWidth: "w-[85%]", pulse: false };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{ perspective: "1000px" }}
      className="group relative cursor-pointer"
    >
      {/* Outer glow halo on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute -inset-px rounded-[22px] bg-gradient-to-r from-primary/30 via-amber-400/20 to-primary/30 blur-sm pointer-events-none"
      />

      {/* Card body */}
      <motion.div
        animate={{ y: hovered ? -6 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-row rounded-[20px] border border-border/40 bg-white dark:bg-[#1e1e1e] overflow-hidden min-h-[190px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
        style={{
          boxShadow: hovered
            ? "0 24px 48px -12px rgba(0,0,0,0.18), 0 8px 16px -8px rgba(0,0,0,0.1)"
            : "0 4px 24px -8px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* ── LEFT: Image panel ── */}
        <div className="relative w-[38%] shrink-0 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800" />

          {/* Image */}
          {resolvedPrimaryImage && !imgError ? (
            <motion.div
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={resolvedPrimaryImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 40vw, 220px"
                onError={() => setImgError(true)}
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">📦</div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />

          {/* TOP badge */}
          {isTop && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
            >
              <Crown className="h-3 w-3 text-white" />
              <span className="text-[10px] font-black text-white tracking-wider">TOP</span>
            </motion.div>
          )}

          {/* Category badge — bottom left */}
          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-flex items-center rounded-lg bg-black/50 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-gray-200 uppercase border border-white/10 shadow-sm">
              {product.category?.name || "Sans catégorie"}
            </span>
          </div>

          {/* Eye reveal on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-md">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── VERTICAL DIVIDER — luxury accent ── */}
        <div className="relative w-px shrink-0 self-stretch overflow-hidden">
          <div className="absolute inset-0 bg-border/30" />
          <motion.div
            animate={{ scaleY: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
            initial={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ originY: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent"
          />
        </div>

        {/* ── RIGHT: Content panel ── */}
        <div className="flex flex-col flex-1 min-w-0 p-4 gap-3">

          {/* Top row: Name + variants badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              {product.product_type && (
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                  {PRODUCT_TYPE_FR[product.product_type] || product.product_type}
                </span>
              )}
              <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
            </div>
            {variantsCount > 0 && (
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary border border-primary/20 whitespace-nowrap">
                <Layers className="h-3 w-3" />
                <span>{variantsCount}</span>
              </span>
            )}
          </div>

          {/* Stock indicator */}
          <div className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 w-fit", stockConfig.bg)}>
            <div className="relative h-1.5 w-16 rounded-full bg-border/40 overflow-hidden">
              <motion.div
                animate={{ width: stockConfig.barWidth }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className={cn("h-full rounded-full", stockConfig.glow, stockConfig.pulse && "animate-pulse")}
              />
            </div>
            <span className={cn("text-[9px] font-black uppercase tracking-wider", stockConfig.color)}>
              {stockConfig.label}
            </span>
            <span className={cn("text-[9px] font-bold tabular-nums", stockConfig.color)}>
              {stock}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: Price + Actions */}
          <div className="flex items-end justify-between gap-3 pt-3 border-t border-border/40">
            {/* Price block */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
                Prix unitaire
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-primary leading-none tabular-nums">
                  {formatCurrency(parseFloat(product.price), "FCFA")}
                </span>
                {isTop && (
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500 mb-0.5" />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {/* Add variant */}
              <motion.button
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.92, y: 1 }}
                onClick={(e) => { e.stopPropagation(); onAddVariant(); }}
                title="Gérer les variantes"
                className="relative cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-xl" />
                <motion.div
                  animate={{ opacity: hovered ? 1 : 0 }}
                  className="absolute inset-0 bg-primary/20 rounded-xl"
                />
                <Layers className="relative h-3.5 w-3.5 text-primary z-10" />
              </motion.button>

              {/* Edit */}
              <motion.button
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.92, y: 1 }}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                title="Modifier"
                className="relative flex cursor-pointer h-8 w-8 items-center justify-center rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-amber-500/10 border border-amber-500/25 rounded-xl" />
                <motion.div
                  animate={{ opacity: hovered ? 1 : 0 }}
                  className="absolute inset-0 bg-amber-500/20 rounded-xl"
                />
                <Edit3 className="relative h-3.5 w-3.5 text-amber-500 z-10" />
              </motion.button>

              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.92, y: 1 }}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Supprimer"
                className="relative cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-rose-500/10 border border-rose-500/25 rounded-xl" />
                <motion.div
                  animate={{ opacity: hovered ? 1 : 0 }}
                  className="absolute cursor-pointer inset-0 bg-rose-500/20 rounded-xl"
                />
                <Trash2 className="relative h-3.5 w-3.5 text-rose-500 z-10" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}