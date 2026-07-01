// "use client";
// import { motion } from "framer-motion";
// import { Edit3, Trash2, Calendar, Link as LinkIcon, Power, PowerOff, Target, Eye, LayoutGrid } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { AdminBanner } from "@/modeles/bannieres";
// import { BANNER_TYPE_LABELS, BANNER_TYPE_COLORS } from "@/modeles/bannieres";

// interface BannerCardProps {
//     banner: AdminBanner;
//     viewMode?: "grid" | "list";
//     onView: () => void;
//     onEdit: (e: React.MouseEvent) => void;
//     onDelete: (e: React.MouseEvent) => void;
// }

// export function BannerCard({ banner, viewMode = "grid", onView, onEdit, onDelete }: BannerCardProps) {
//     const typeConfig = BANNER_TYPE_COLORS[banner.banner_type] || { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20" };

//     if (viewMode === "list") {
//         return (
//             <motion.div
//                 layout
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.98 }}
//                 whileHover={{ scale: 1.01 }}
//                 onClick={onView}
//                 className="group relative flex cursor-pointer items-stretch overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm transition-all hover:shadow-md hover:border-primary/30"
//             >
//                 {/* Image List Mode */}
//                 <div className="relative w-40 shrink-0 bg-surface-alt overflow-hidden border-r border-border">
//                     {banner.image ? (
//                         <img 
//                             src={banner.image} 
//                             alt={banner.title} 
//                             className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
//                         />
//                     ) : (
//                         <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
//                             <Target className="h-8 w-8" />
//                         </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    
//                     <span className={cn(
//                         "absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-black backdrop-blur-md border",
//                         banner.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"
//                     )}>
//                         {banner.is_active ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
//                         {banner.is_active ? "Actif" : "Inactif"}
//                     </span>
//                 </div>

//                 {/* Content List Mode */}
//                 <div className="flex flex-1 flex-col justify-center p-4">
//                     <div className="flex items-center justify-between gap-4">
//                         <div className="min-w-0">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border", typeConfig.bg, typeConfig.text, typeConfig.border)}>
//                                     {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
//                                 </span>
//                                 <span className="text-[10px] font-bold text-muted-foreground bg-surface-alt px-1.5 rounded border border-border">
//                                     Pos: {banner.position}
//                                 </span>
//                             </div>
//                             <h3 className="truncate text-base font-black text-foreground group-hover:text-primary transition-colors">
//                                 {banner.title}
//                             </h3>
//                             {banner.subtitle && (
//                                 <p className="truncate text-xs text-muted-foreground mt-0.5">
//                                     {banner.subtitle}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2 shrink-0">
//                             <button 
//                                 onClick={onEdit}
//                                 className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-surface text-muted-foreground transition-all hover:bg-surface-alt hover:text-foreground hover:shadow-sm"
//                                 title="Modifier"
//                             >
//                                 <Edit3 className="h-4 w-4" />
//                             </button>
//                             <button 
//                                 onClick={onDelete}
//                                 className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 transition-all hover:bg-red-500/10 hover:shadow-sm"
//                                 title="Supprimer"
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </motion.div>
//         );
//     }

//     // Mode Grid
//     return (
//         <motion.div
//             layout
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             whileHover={{ y: -4, transition: { duration: 0.2 } }}
//             onClick={onView}
//             className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm transition-all hover:shadow-xl hover:border-primary/30"
//         >
//             {/* Image Preview Area */}
//             <div className="relative h-40 w-full overflow-hidden bg-surface-alt shrink-0 border-b border-border">
//                 {banner.image ? (
//                     <img 
//                         src={banner.image} 
//                         alt={banner.title} 
//                         className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                 ) : (
//                     <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
//                         <Target className="h-10 w-10" />
//                     </div>
//                 )}
                
//                 {/* Gradient Overlay */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 opacity-70" />

//                 {/* Status & Type Badges */}
//                 <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
//                     <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border", typeConfig.bg, typeConfig.text, typeConfig.border, "bg-black/40")}>
//                         {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
//                     </span>
//                     <span className={cn(
//                         "px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 backdrop-blur-md border",
//                         banner.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"
//                     )}>
//                         {banner.is_active ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
//                         {banner.is_active ? "Actif" : "Inactif"}
//                     </span>
//                 </div>

//                 <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/20 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md shadow-lg scale-50 transition-transform group-hover:scale-100">
//                         <Eye className="h-5 w-5" />
//                     </div>
//                 </div>
//             </div>

//             {/* Content Area */}
//             <div className="flex flex-col flex-1 p-4">
//                 <div className="flex items-start justify-between gap-3 mb-2">
//                     <div className="min-w-0 flex-1">
//                         <h3 className="text-base font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">
//                             {banner.title}
//                         </h3>
//                     </div>
//                     {/* Actions déplacées ici */}
//                     <div className="flex items-center gap-1 shrink-0 bg-surface-alt rounded-lg border border-border p-1" onClick={e => e.stopPropagation()}>
//                         <button 
//                             onClick={onEdit} 
//                             className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
//                             title="Modifier"
//                         >
//                             <Edit3 className="h-3 w-3" />
//                         </button>
//                         <button 
//                             onClick={onDelete} 
//                             className="flex h-6 w-6 items-center justify-center rounded text-red-500 hover:bg-red-500/10 transition-colors"
//                             title="Supprimer"
//                         >
//                             <Trash2 className="h-3 w-3" />
//                         </button>
//                     </div>
//                 </div>
                
//                 {banner.subtitle && (
//                     <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
//                         {banner.subtitle}
//                     </p>
//                 )}

//                 <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 border-t border-border/50 pt-3">
//                     <div className="flex items-center gap-1.5" title="Ordre d'affichage">
//                         <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
//                         <span>Pos: {banner.position}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                         <Calendar className="h-3.5 w-3.5 shrink-0" />
//                         <span>
//                             {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString("fr-FR") : "Toujours"}
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </motion.div>
//     );
// }











































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
  ExternalLink,
  Radio,
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
    neutral: "bg-surface border-border/50 text-muted-foreground hover:text-foreground hover:bg-surface-alt",
    danger:  "bg-rose-500/8 border-rose-500/20 text-rose-500 hover:bg-rose-500/15",
    primary: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-150",
        styles[variant]
      )}
    >
      {icon}
    </motion.button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LIST MODE — ultra compact single line
// ═════════════════════════════════════════════════════════════════════════════
function ListCard({ banner, onView, onEdit, onDelete }: Omit<BannerCardProps, "viewMode">) {
  const [hovered, setHovered] = useState(false);
  const typeConfig = BANNER_TYPE_COLORS[banner.banner_type] || {
    bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onView}
      className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-border/40 bg-surface px-3 py-2.5"
      style={{
        boxShadow: hovered ? "0 8px 24px -8px rgba(0,0,0,0.1)" : "0 1px 4px -2px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Left accent */}
      <motion.div
        animate={{ scaleY: hovered ? 1 : 0.2, opacity: hovered ? 1 : 0 }}
        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary"
      />

      {/* Thumbnail */}
      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-surface-alt">
        {banner.image ? (
          <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Target className="h-4 w-4 text-muted-foreground/30" />
          </div>
        )}
        {/* Active dot overlay */}
        <div className={cn(
          "absolute top-1 right-1 h-1.5 w-1.5 rounded-full",
          banner.is_active ? "bg-emerald-400" : "bg-rose-400"
        )} />
      </div>

      {/* Channel number pill */}
      <div className="shrink-0 flex items-center justify-center rounded-md bg-surface-alt border border-border/40 px-1.5 py-0.5 min-w-[28px]">
        <span className="font-mono text-[10px] font-black text-muted-foreground">
          {String(banner.position).padStart(2, "0")}
        </span>
      </div>

      {/* Type badge */}
      <span className={cn(
        "shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
        typeConfig.bg, typeConfig.text, typeConfig.border
      )}>
        {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
      </span>

      {/* Title */}
      <h3 className={cn(
        "flex-1 min-w-0 truncate text-xs font-bold text-foreground transition-colors duration-200",
        hovered && "text-primary"
      )}>
        {banner.title}
      </h3>

      {/* Date */}
      <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground/60 font-medium">
        <Calendar className="h-3 w-3" />
        {banner.starts_at
          ? new Date(banner.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
          : "Toujours"}
      </span>

      {/* Status */}
      <span className={cn(
        "shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black border",
        banner.is_active
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
      )}>
        {banner.is_active ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
        {banner.is_active ? "Actif" : "Inactif"}
      </span>

      {/* Actions */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <Btn icon={<Edit3 className="h-3.5 w-3.5" />} title="Modifier" onClick={onEdit} />
            <Btn icon={<Trash2 className="h-3.5 w-3.5" />} title="Supprimer" onClick={onDelete} variant="danger" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GRID MODE — compact billboard card with scan-line hover
// ═════════════════════════════════════════════════════════════════════════════
function GridCard({ banner, onView, onEdit, onDelete }: Omit<BannerCardProps, "viewMode">) {
  const [hovered, setHovered] = useState(false);
  const typeConfig = BANNER_TYPE_COLORS[banner.banner_type] || {
    bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onView}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[18px] border border-border/40 bg-surface"
      style={{
        boxShadow: hovered
          ? "0 16px 40px -12px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)"
          : "0 2px 10px -4px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* -- Top accent line -- */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        initial={{ scaleX: 0, opacity: 0 }}
        style={{ originX: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent z-20 pointer-events-none"
      />

      {/* -- Image preview (compact 120px) -- */}
      <div className="relative h-[118px] w-full overflow-hidden bg-surface-alt shrink-0">
        {banner.image ? (
          <motion.img
            src={banner.image}
            alt={banner.title}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground/20" />
          </div>
        )}

        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* -- Scan line (signature) -- */}
        <motion.div
          initial={{ y: "120%" }}
          animate={hovered ? { y: "-20%" } : { y: "120%" }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-[40%] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.06) 60%, transparent)",
          }}
        />

        {/* Eye overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/20 shadow-md">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -- Top badges row -- */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          {/* Type */}
          <span className={cn(
            "flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md border",
            typeConfig.bg, typeConfig.text, typeConfig.border,
            "bg-black/30"
          )}>
            {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
          </span>

          {/* Status */}
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black backdrop-blur-md border",
            banner.is_active
              ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/25 text-rose-300 border-rose-500/30"
          )}>
            {banner.is_active ? <Power className="h-2 w-2" /> : <PowerOff className="h-2 w-2" />}
            {banner.is_active ? "Actif" : "Inactif"}
          </span>
        </div>

        {/* -- Channel number (bottom-left of image) -- */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 px-1.5 py-0.5">
            <Radio className="h-2.5 w-2.5 text-white/60" />
            <span className="font-mono text-[10px] font-black text-white/80">
              {String(banner.position).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* -- Content (compact) -- */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3 gap-2">

        {/* Title + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <h3 className={cn(
              "text-xs font-black text-foreground line-clamp-1 leading-tight transition-colors duration-200",
              hovered && "text-primary"
            )}>
              {banner.title}
            </h3>
            {banner.subtitle && (
              <p className="text-[10px] text-muted-foreground/70 line-clamp-1 leading-tight">
                {banner.subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1"
                >
                  <Btn icon={<Edit3 className="h-3 w-3" />} title="Modifier" onClick={onEdit} />
                  <Btn icon={<Trash2 className="h-3 w-3" />} title="Supprimer" onClick={onDelete} variant="danger" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* -- Footer: position + date -- */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60">
            <LayoutGrid className="h-3 w-3" />
            <span>Position {banner.position}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60">
            <Calendar className="h-3 w-3" />
            <span>
              {banner.starts_at
                ? new Date(banner.starts_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })
                : "Toujours actif"}
            </span>
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