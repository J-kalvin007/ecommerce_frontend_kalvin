

// "use client";

// import Image from "next/image";
// import { Edit3, FolderTree, Trash2, PlusCircle, ChevronRight } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { Category } from "@/modeles/categories";

// interface CategoryCardProps {
//   category: Category & { levelText?: string };
//   onClick?: () => void;
//   onEdit: (cat: Category) => void;
//   onDelete: (id: string) => void;
//   onAddSubcategory: (parent: Category) => void;
//   isGridView?: boolean;
// }

// export default function CategoryCard({
//   category,
//   onClick,
//   onEdit,
//   onDelete,
//   onAddSubcategory,
//   isGridView = true,
// }: CategoryCardProps) {
//   const hasChildren = category.children && category.children.length > 0;
//   const childPreviews = hasChildren ? category.children.slice(0, 3) : [];
//   const remainingCount = hasChildren ? category.children.length - childPreviews.length : 0;

//   const handleCardClick = (e: React.MouseEvent) => {
//     // Éviter la propagation si on clique sur les boutons d'action
//     const target = e.target as HTMLElement;
//     if (target.closest('button')) return;
//     onClick?.();
//   };

//   if (!isGridView) {
//     // Mode liste : affichage horizontal simplifié
//     return (
//       <div
//         onClick={handleCardClick}
//         className="group flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface-elevated p-4 transition-all hover:shadow-md"
//       >
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
//             {category.image ? (
//               <Image src={category.image} alt={category.name} width={32} height={32} className="rounded-lg object-cover" />
//             ) : (
//               <FolderTree className="h-5 w-5" />
//             )}
//           </div>
//           <div>
//             <h3 className="font-semibold text-foreground">{category.name}</h3>
//             <p className="text-xs text-muted-foreground">slug: {category.slug}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => onAddSubcategory(category)}
//             className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
//             title="Ajouter une sous-catégorie"
//           >
//             <PlusCircle className="h-4 w-4" />
//           </button>
//           <button
//             onClick={() => onEdit(category)}
//             className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
//           >
//             <Edit3 className="h-4 w-4" />
//           </button>
//           <button
//             onClick={() => onDelete(category.id)}
//             className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
//           >
//             <Trash2 className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Mode grille
//   return (
//     <div
//       onClick={handleCardClick}
//       className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
//     >
//       {/* Badge niveau */}
//       {category.levelText?.includes("—") && (
//         <div className="absolute -top-2 left-4 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
//           Sous-catégorie
//         </div>
//       )}

//       <div className="flex items-start justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-primary/5 text-primary ring-1 ring-border group-hover:ring-primary/30">
//             {category.image ? (
//               <Image src={category.image} alt={category.name} fill className="object-cover" sizes="48px" />
//             ) : (
//               <FolderTree className="m-auto h-5 w-5" />
//             )}
//           </div>
//           <div className="min-w-0">
//             <h3 className="truncate text-base font-semibold text-foreground">{category.name}</h3>
//             <p className="truncate text-xs text-muted-foreground">slug: {category.slug}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
//           <button
//             onClick={() => onAddSubcategory(category)}
//             className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
//             title="Ajouter une sous-catégorie"
//           >
//             <PlusCircle className="h-4 w-4" />
//           </button>
//           <button
//             onClick={() => onEdit(category)}
//             className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
//           >
//             <Edit3 className="h-4 w-4" />
//           </button>
//           <button
//             onClick={() => onDelete(category.id)}
//             className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
//           >
//             <Trash2 className="h-4 w-4" />
//           </button>
//         </div>
//       </div>

//       <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
//         {category.description || "Aucune description."}
//       </p>

//       {/* Affichage des sous-catégories en bulles */}
//       {hasChildren && (
//         <div className="mt-4 flex items-center gap-2">
//           <div className="flex -space-x-2">
//             {childPreviews.map((child) => (
//               <div
//                 key={child.id}
//                 className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-surface-elevated bg-primary/10"
//               >
//                 {child.image ? (
//                   <Image src={child.image} alt={child.name} fill className="object-cover" sizes="28px" />
//                 ) : (
//                   <FolderTree className="m-auto h-3 w-3 text-primary" />
//                 )}
//               </div>
//             ))}
//           </div>
//           {remainingCount > 0 && (
//             <span className="text-xs font-medium text-muted-foreground">+{remainingCount}</span>
//           )}
//           <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
//         </div>
//       )}
//     </div>
//   );
// }
























// // components/admin/categories/CategoryCard.tsx
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { Edit3, FolderTree, Trash2, PlusCircle, ChevronRight, Layers } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { Category } from "@/modeles/categories";

// function SafeImage({ src, alt, ...props }: any) {
//   const [error, setError] = useState(false);
//   const resolvedSrc = src ? (src.startsWith("http") ? src : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${src.startsWith("/") ? "" : "/"}${src}`) : null;

//   if (!resolvedSrc || error) {
//     return <FolderTree className="h-1/2 w-1/2 text-primary opacity-50 m-auto" />;
//   }
//   return <Image src={resolvedSrc} alt={alt} {...props} onError={() => setError(true)} />;
// }

// interface CategoryCardProps {
//   category: Category & { levelText?: string };
//   onClick?: () => void;
//   onEdit: (cat: Category) => void;
//   onDelete: (id: string) => void;
//   onAddSubcategory: (parent: Category) => void;
//   isGridView?: boolean;
// }

// export default function CategoryCard({
//   category,
//   onClick,
//   onEdit,
//   onDelete,
//   onAddSubcategory,
//   isGridView = true,
// }: CategoryCardProps) {
//   const hasChildren = category.children && category.children.length > 0;
//   const childPreviews = hasChildren ? category.children.slice(0, 3) : [];
//   const remainingCount = hasChildren ? category.children.length - childPreviews.length : 0;

//   const handleCardClick = (e: React.MouseEvent) => {
//     if ((e.target as HTMLElement).closest("button")) return;
//     onClick?.();
//   };

//   if (!isGridView) {
//     // Mode liste : Premium
//     return (
//       <div
//         onClick={handleCardClick}
//         className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
//       >
//         <div className="flex items-center gap-4">
//           <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-inner">
//             <SafeImage src={category.image} alt={category.name} fill className="object-cover" sizes="56px" />
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <h3 className="text-base font-bold text-foreground">{category.name}</h3>
//               {category.levelText?.includes("—") && (
//                 <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
//                   Sous-cat
//                 </span>
//               )}
//             </div>
//             <p className="text-xs text-muted-foreground mt-0.5">slug: {category.slug}</p>
//             {hasChildren && (
//               <p className="text-[11px] font-medium text-primary mt-1 flex items-center gap-1">
//                 <Layers className="h-3 w-3" /> {category.children.length} sous-catégorie(s)
//               </p>
//             )}
//           </div>
//         </div>
//         <div className="flex items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
//           <button
//             onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }}
//             className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20"
//             title="Ajouter une sous-catégorie"
//           >
//             <PlusCircle className="h-4 w-4" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onEdit(category); }}
//             className="p-2 rounded-xl hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors border border-transparent hover:border-blue-500/20"
//             title="Modifier"
//           >
//             <Edit3 className="h-4 w-4" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
//             className="p-2 rounded-xl hover:bg-error/10 text-muted-foreground hover:text-error transition-colors border border-transparent hover:border-error/20"
//             title="Supprimer"
//           >
//             <Trash2 className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Mode grille : Premium mais plus compact et sans description
//   return (
//     <div
//       onClick={handleCardClick}
//       className="group flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
//     >
//       {/* Cover Image Area */}
//       <div className="relative h-32 w-full bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
//         <SafeImage 
//           src={category.image} 
//           alt={category.name} 
//           fill 
//           className="object-cover transition-transform duration-700 group-hover:scale-105" 
//           sizes="(max-width: 768px) 100vw, 33vw" 
//         />
//         {/* Subtle gradient so text below isn't needed here, just image */}
//       </div>

//       <div className="flex flex-1 flex-col p-5">
//         {/* Header and inline elegant actions */}
//         <div className="mb-4 flex items-start justify-between gap-3">
//           <div className="min-w-0 flex-1">
//             <h3 className="truncate text-lg font-extrabold text-foreground tracking-tight">{category.name}</h3>
//             <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2 py-0.5 border border-border/50">
//                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Slug</span>
//                <span className="text-[10px] font-semibold text-foreground truncate">{category.slug}</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-0.5 opacity-0 transition-all duration-300 group-hover:opacity-100 shrink-0">
//              <button onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Ajouter sous-catégorie"><PlusCircle size={16}/></button>
//              <button onClick={(e) => { e.stopPropagation(); onEdit(category); }} className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors" title="Modifier"><Edit3 size={16}/></button>
//              <button onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} className="p-1.5 text-muted-foreground hover:text-error transition-colors" title="Supprimer"><Trash2 size={16}/></button>
//           </div>
//         </div>

//         {/* Affichage des sous-catégories en bulles */}
//         {hasChildren ? (
//           <div className="mt-auto flex items-center gap-2 rounded-xl bg-surface/50 p-2.5 border border-border/40">
//             <div className="flex -space-x-2">
//               {childPreviews.map((child) => (
//                 <div
//                   key={child.id}
//                   className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold uppercase"
//                 >
//                   {child.image ? (
//                     <SafeImage src={child.image} alt={child.name} fill className="object-cover" sizes="32px" />
//                   ) : (
//                     child.name.substring(0, 2)
//                   )}
//                 </div>
//               ))}
//             </div>
//             {remainingCount > 0 && (
//               <span className="text-[10px] font-bold text-primary">+{remainingCount}</span>
//             )}
//             <div className="ml-auto flex items-center text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
//               Voir {category.children.length}
//               <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
//             </div>
//           </div>
//         ) : (
//           <div className="mt-auto flex items-center text-[11px] font-medium text-muted-foreground">
//             <div className="h-8 flex items-center">Aucune sous-catégorie</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }











































// components/admin/categories/CategoryCard.tsx
"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  FolderTree,
  Trash2,
  PlusCircle,
  ChevronRight,
  Layers,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/modeles/categories";

// ─── Utility: resolve image URL ─────────────────────────────────────────────
function resolveUrl(src?: string | null): string | null {
  if (!src) return null;
  return src.startsWith("http")
    ? src
    : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${src.startsWith("/") ? "" : "/"}${src}`;
}

// ─── Safe image with fallback icon ──────────────────────────────────────────
function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);
  const resolved = resolveUrl(src);
  if (!resolved || error)
    return (
      <FolderTree className="h-1/2 w-1/2 text-current opacity-40 m-auto" />
    );
  return (
    <Image
      src={resolved}
      alt={alt}
      {...props}
      onError={() => setError(true)}
    />
  );
}

// ─── Circular arc progress (SVG) for subcategory count ──────────────────────
function ArcProgress({
  count,
  max = 10,
  size = 44,
  stroke = 3,
  color = "var(--color-primary)",
}: {
  count: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const uid = useId();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(count / max, 1);
  const dash = circ * fill;
  const gap = circ - dash;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
    >
      <defs>
        <linearGradient id={`arc-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={stroke}
      />
      {/* Progress */}
      {count > 0 && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#arc-grad-${uid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${gap}` }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </svg>
  );
}

// ─── Gradient palette per category (deterministic from name) ─────────────────
const PALETTES = [
  { from: "#1a1a2e", via: "#16213e", to: "#0f3460", accent: "#e94560" },
  { from: "#0d1b2a", via: "#1b2a3f", to: "#243b55", accent: "#f5a623" },
  { from: "#1a0533", via: "#2d1b69", to: "#11998e", accent: "#a78bfa" },
  { from: "#0f2027", via: "#203a43", to: "#2c5364", accent: "#38ef7d" },
  { from: "#200122", via: "#6f0000", to: "#200122", accent: "#ffd200" },
  { from: "#0a3d62", via: "#1e5799", to: "#207cca", accent: "#60a3d9" },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface CategoryCardProps {
  category: Category & { levelText?: string };
  onClick?: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parent: Category) => void;
  isGridView?: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// LIST MODE
// ═════════════════════════════════════════════════════════════════════════════
function ListCard({
  category,
  onClick,
  onEdit,
  onDelete,
  onAddSubcategory,
}: Omit<CategoryCardProps, "isGridView">) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const palette = getPalette(category.name);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onClick?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      className="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-border/40 bg-surface overflow-hidden p-3 pr-4 transition-all duration-300"
      style={{
        boxShadow: hovered
          ? "0 12px 32px -8px rgba(0,0,0,0.14)"
          : "0 2px 8px -4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "translateY(0px)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Left accent strip */}
      <motion.div
        animate={{ scaleY: hovered ? 1 : 0.3, opacity: hovered ? 1 : 0 }}
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ background: `linear-gradient(to bottom, transparent, ${palette.accent}, transparent)` }}
      />

      {/* Avatar medallion */}
      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
      >
        <SafeImage
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
          sizes="48px"
        />
        {/* Inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Text */}
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground truncate">{category.name}</h3>
          {category.levelText?.includes("—") && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
              style={{ background: `${palette.accent}20`, color: palette.accent }}
            >
              Sous-cat
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Hash className="h-2.5 w-2.5 opacity-50" />
          <span className="font-mono truncate opacity-70">{category.slug}</span>
        </div>
        {hasChildren && (
          <div className="flex items-center gap-1 text-[10px] font-semibold mt-0.5" style={{ color: palette.accent }}>
            <Layers className="h-2.5 w-2.5" />
            {category.children.length} sous-catégorie{category.children.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Arc counter */}
      {hasChildren && (
        <div className="relative shrink-0" style={{ color: palette.accent }}>
          <ArcProgress count={category.children.length} color={palette.accent} size={40} stroke={2.5} />
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-black"
            style={{ color: palette.accent }}
          >
            {category.children.length}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
        <ActionBtn icon={<PlusCircle className="h-3.5 w-3.5" />} title="Ajouter sous-catégorie" color={palette.accent} onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }} />
        <ActionBtn icon={<Edit3 className="h-3.5 w-3.5" />} title="Modifier" color="#60a5fa" onClick={(e) => { e.stopPropagation(); onEdit(category); }} />
        <ActionBtn icon={<Trash2 className="h-3.5 w-3.5" />} title="Supprimer" color="#f87171" onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} />
      </div>
    </motion.div>
  );
}

// ─── Small action button ─────────────────────────────────────────────────────
function ActionBtn({
  icon,
  title,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent transition-all duration-150"
      style={{ color }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `${color}18`;
        (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
      }}
    >
      {icon}
    </motion.button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GRID MODE — Fintech card with shimmer sweep
// ═════════════════════════════════════════════════════════════════════════════
function GridCard({
  category,
  onClick,
  onEdit,
  onDelete,
  onAddSubcategory,
}: Omit<CategoryCardProps, "isGridView">) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const childPreviews = hasChildren ? category.children.slice(0, 3) : [];
  const remainingCount = hasChildren ? category.children.length - 3 : 0;
  const palette = getPalette(category.name);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onClick?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      className="group relative flex flex-col cursor-pointer rounded-[22px] overflow-hidden border border-white/5"
      style={{
        background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.via} 50%, ${palette.to} 100%)`,
        boxShadow: hovered
          ? `0 28px 56px -12px rgba(0,0,0,0.45), 0 0 0 1px ${palette.accent}30`
          : "0 4px 20px -8px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-8px) scale(1.01)" : "translateY(0px) scale(1)",
        transition: "box-shadow 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        minHeight: "230px",
      }}
    >
      {/* ── Noise grain texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
        }}
      />

      {/* ── Shimmer sweep (signature element) ── */}
      <motion.div
        initial={{ x: "-130%", skewX: -12 }}
        animate={hovered ? { x: "220%" } : { x: "-130%" }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        className="absolute inset-y-0 w-1/3 pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.07), rgba(255,255,255,0.13), rgba(255,255,255,0.07), transparent)`,
          transform: "skewX(-12deg)",
        }}
      />

      {/* ── Radial glow at top-right ── */}
      <div
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.accent}28 0%, transparent 70%)`,
        }}
      />

      {/* ── Top row: chip icon + actions ── */}
      <div className="relative z-20 flex items-start justify-between p-4 pb-0">
        {/* EMV chip style icon */}
        <div
          className="flex h-8 w-10 items-center justify-center rounded-md border"
          style={{
            background: `linear-gradient(135deg, ${palette.accent}40, ${palette.accent}15)`,
            borderColor: `${palette.accent}30`,
          }}
        >
          <div className="grid grid-cols-2 gap-[3px] opacity-60">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[5px] w-[7px] rounded-[1.5px] bg-current" style={{ color: palette.accent }} />
            ))}
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              <ActionBtn icon={<PlusCircle className="h-3.5 w-3.5" />} title="Ajouter sous-catégorie" color="#ffffff" onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }} />
              <ActionBtn icon={<Edit3 className="h-3.5 w-3.5" />} title="Modifier" color="#93c5fd" onClick={(e) => { e.stopPropagation(); onEdit(category); }} />
              <ActionBtn icon={<Trash2 className="h-3.5 w-3.5" />} title="Supprimer" color="#fca5a5" onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Central medallion image ── */}
      <div className="relative z-20 flex justify-center py-3">
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: hovered ? 1.08 : 1, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.4 }}
            className="absolute -inset-1.5 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${palette.accent}60, transparent, ${palette.accent}30, transparent, ${palette.accent}60)`,
            }}
          />
          {/* Image medallion */}
          <motion.div
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full border-2"
            style={{
              borderColor: `${palette.accent}50`,
              background: `radial-gradient(circle at 30% 30%, ${palette.accent}30, transparent 70%), linear-gradient(135deg, ${palette.via}, ${palette.from})`,
            }}
          >
            <SafeImage
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              sizes="62px"
            />
            {/* Specular highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* ── Name + slug ── */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 gap-1">
        <h3 className="text-sm font-black text-white leading-tight line-clamp-1 tracking-tight">
          {category.name}
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-white/40">
          <Hash className="h-2.5 w-2.5" />
          <span className="font-mono">{category.slug}</span>
        </div>
      </div>

      {/* ── Bottom: Subcategory section ── */}
      <div className="relative z-20 mt-auto p-4 pt-3">
        {hasChildren ? (
          <div
            className="flex items-center gap-2 rounded-xl p-2.5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Arc + count */}
            <div className="relative shrink-0" style={{ color: palette.accent }}>
              <ArcProgress count={category.children.length} color={palette.accent} size={36} stroke={2} />
              <span
                className="absolute inset-0 flex items-center justify-center text-[9px] font-black"
                style={{ color: palette.accent }}
              >
                {category.children.length}
              </span>
            </div>

            {/* Avatar stack */}
            <div className="flex -space-x-2 flex-1">
              {childPreviews.map((child) => (
                <div
                  key={child.id}
                  title={child.name}
                  className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border text-[8px] font-black uppercase text-white"
                  style={{
                    borderColor: `${palette.accent}40`,
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                  }}
                >
                  {child.image ? (
                    <SafeImage src={child.image} alt={child.name} fill className="object-cover" sizes="24px" />
                  ) : (
                    child.name.substring(0, 2)
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[8px] font-black text-white"
                  style={{ borderColor: `${palette.accent}40`, background: `${palette.accent}30` }}
                >
                  +{remainingCount}
                </div>
              )}
            </div>

            {/* See all caret */}
            <motion.div
              animate={{ x: hovered ? 2 : 0 }}
              className="flex items-center gap-0.5 text-[10px] font-bold shrink-0"
              style={{ color: palette.accent }}
            >
              Voir
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-semibold"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
          >
            <PlusCircle className="h-3 w-3" />
            Aucune sous-catégorie
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export default function CategoryCard({ isGridView = true, ...props }: CategoryCardProps) {
  return isGridView ? <GridCard {...props} /> : <ListCard {...props} />;
}