







"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  Calendar,
  Power,
  PowerOff,
  Target,
  Eye,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminBanner } from "@/modeles/bannieres";
import { BANNER_TYPE_LABELS, BANNER_TYPE_COLORS } from "@/modeles/bannieres";

interface BannerCardProps {
  banner: AdminBanner;
  viewMode?: "grid" | "list";
  onView: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

// --- Tiny action button -------------------------------------------------------
function Btn({
  icon,
  title,
  onClick,
  variant = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "neutral" | "danger" | "primary";
}) {
  const styles = {
    neutral: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/30 shadow-sm",
    primary: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30 shadow-sm",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      title={title}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300",
        styles[variant]
      )}
    >
      {icon}
    </motion.button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LIST MODE — Premium compact list view
// ═════════════════════════════════════════════════════════════════════════════
function ListCard({ banner, onView, onEdit, onDelete }: Omit<BannerCardProps, "viewMode">) {
  const typeConfig = BANNER_TYPE_COLORS[banner.banner_type] || {
    bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={onView}
      className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-[20px] border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-[#1a1a1a] px-4 py-3.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-primary/30"
    >
      {/* Accent Line on the left */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-all duration-400 scale-y-50 group-hover:scale-y-100" />

      {/* Thumbnail */}
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50">
        {banner.image ? (
          <img src={banner.image} alt={banner.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Target className="h-6 w-6 text-slate-300 dark:text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Infos */}
      <div className="flex-1 flex items-center justify-between gap-4 min-w-0 pr-2">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-extrabold text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-primary">
              {banner.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className={cn(
                "rounded-md px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                typeConfig.bg, typeConfig.text, typeConfig.border
              )}>
                {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                <Calendar className="h-3 w-3 text-primary/70" />
                {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "Permanent"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <span className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm",
              banner.is_active
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            )}>
              {banner.is_active ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
              {banner.is_active ? "Actif" : "Inactif"}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <LayoutGrid className="h-3 w-3" />
              Position #{String(banner.position).padStart(2, "0")}
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-400 -translate-x-2 group-hover:translate-x-0">
            <Btn icon={<Edit3 className="h-4 w-4" />} title="Modifier" onClick={onEdit} />
            <Btn icon={<Trash2 className="h-4 w-4" />} title="Supprimer" onClick={onDelete} variant="danger" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GRID MODE — Premium billboard card
// ═════════════════════════════════════════════════════════════════════════════
function GridCard({ banner, onView, onEdit, onDelete }: Omit<BannerCardProps, "viewMode">) {
  const [hovered, setHovered] = useState(false);
  const typeConfig = BANNER_TYPE_COLORS[banner.banner_type] || {
    bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onView}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-[#1a1a1a] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1.5"
    >
      {/* Accent glow top */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

      {/* Image Container with inner padding */}
      <div className="p-3 pb-0 z-10">
        <div className="relative h-[160px] w-full overflow-hidden rounded-[20px] bg-slate-100 dark:bg-slate-900/50 shrink-0 border border-slate-200/50 dark:border-white/5">
          {banner.image ? (
            <motion.img
              src={banner.image}
              alt={banner.title}
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Target className="h-8 w-8 text-slate-300 dark:text-slate-700" />
            </div>
          )}

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

          {/* Eye overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Badges (Top) */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
            <span className={cn(
              "flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-sm",
              typeConfig.bg, typeConfig.text, typeConfig.border,
              "bg-white/90 dark:bg-black/60"
            )}>
              {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
            </span>

            <span className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-sm",
              banner.is_active
                ? "bg-emerald-500/20 text-emerald-100 dark:text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-100 dark:text-rose-300 border-rose-500/30"
            )}>
              {banner.is_active ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
              {banner.is_active ? "Actif" : "Inactif"}
            </span>
          </div>

          {/* Floating Badge (Bottom) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 px-2 py-1 shadow-sm">
              <LayoutGrid className="h-3 w-3 text-gray-200" />
              <span className="font-mono text-[10px] font-black text-gray-200">
                #{String(banner.position).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0 flex-1 gap-1.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 leading-tight group-hover:text-primary transition-colors duration-300">
              {banner.title}
            </h3>
            {banner.subtitle ? (
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                {banner.subtitle}
              </p>
            ) : (
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic">
                Sans description
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span>
              {banner.starts_at
                ? new Date(banner.starts_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "Permanent"}
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-400 -translate-x-2 group-hover:translate-x-0">
            <Btn icon={<Edit3 className="h-3.5 w-3.5" />} title="Modifier" onClick={onEdit} />
            <Btn icon={<Trash2 className="h-3.5 w-3.5" />} title="Supprimer" onClick={onDelete} variant="danger" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export function BannerCard({ viewMode = "grid", ...props }: BannerCardProps) {
  return viewMode === "list" ? <ListCard {...props} /> : <GridCard {...props} />;
}