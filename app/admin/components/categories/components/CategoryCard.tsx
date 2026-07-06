

// components/admin/categories/CategoryCard.tsx
"use client";

import { useState } from "react";
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
import { mediaUrl } from "@/lib/mediaUrl";

/* --- Composant image sécurisé (fallback si erreur) --- */
function SafeImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const resolvedSrc = mediaUrl(src);

  if (!resolvedSrc || error) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-100", className)}>
        <FolderTree className="h-1/2 w-1/2 text-slate-300" />
      </div>
    );
  }
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}

/* --- Palette de couleurs pour les accents --- */
const PALETTES = [
  { from: "#0f172a", to: "#1e3a8a", accent: "#3b82f6" },
  { from: "#0f172a", to: "#0d9488", accent: "#14b8a6" },
  { from: "#0f172a", to: "#b45309", accent: "#f59e0b" },
  { from: "#0f172a", to: "#7c3aed", accent: "#8b5cf6" },
  { from: "#0f172a", to: "#be123c", accent: "#f43f5e" },
  { from: "#0f172a", to: "#047857", accent: "#10b981" },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

/* --- Types --- */
interface CategoryCardProps {
  category: Category & { levelText?: string };
  onClick?: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parent: Category) => void;
  isGridView?: boolean;
}

/* ══════════════════════════════════════════════════════════════════
   MODE LISTE – Fond blanc, image 56px, texte en dégradé
   ══════════════════════════════════════════════════════════════════ */
function ListCard({ category, onClick, onEdit, onDelete, onAddSubcategory }: Omit<CategoryCardProps, "isGridView">) {
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
      className={cn(
        "group relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-3 pr-4 transition-all duration-300",
        hovered ? "shadow-lg border-slate-200" : "shadow-sm border-slate-100"
      )}
    >
      {/* Image catégorie (56x56 arrondi) */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
        <SafeImage src={category.image} alt={category.name} className="h-full w-full" />
      </div>

      {/* Informations */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h3
            className="truncate text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {category.name}
          </h3>
          {category.levelText?.includes("—") && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">
              Sous-cat
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Hash className="h-2.5 w-2.5 opacity-50" />
          <span className="truncate font-mono">{category.slug}</span>
        </div>
        {hasChildren && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <Layers className="h-2.5 w-2.5" />
            {category.children.length} sous-catégorie{category.children.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Actions (apparaissent au survol) */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <ActionBtn icon={<PlusCircle className="h-3.5 w-3.5" />} title="Ajouter sous-catégorie" onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }} />
        <ActionBtn icon={<Edit3 className="h-3.5 w-3.5" />} title="Modifier" onClick={(e) => { e.stopPropagation(); onEdit(category); }} />
        <ActionBtn icon={<Trash2 className="h-3.5 w-3.5" />} title="Supprimer" onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MODE GRILLE – Fond blanc, image 88x88 carré arrondi, texte dégradé
   ══════════════════════════════════════════════════════════════════ */
function GridCard({ category, onClick, onEdit, onDelete, onAddSubcategory }: Omit<CategoryCardProps, "isGridView">) {
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
      className={cn(
        "group relative flex cursor-pointer flex-col rounded-[22px] border bg-white p-5 transition-all duration-300",
        hovered ? "shadow-xl border-slate-200 -translate-y-1" : "shadow-sm border-slate-100"
      )}
    >
      {/* Image catégorie (88x88, centrée) */}
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
        <SafeImage src={category.image} alt={category.name} className="h-full w-full" />
      </div>

      {/* Nom de la catégorie (dégradé) */}
      <h3
        className="text-center text-sm font-bold leading-tight"
        style={{
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {category.name}
      </h3>

      {/* Slug */}
      <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <Hash className="h-2.5 w-2.5 opacity-50" />
        <span className="font-mono">{category.slug}</span>
      </div>

      {/* Sous-catégories ou message "Aucune" */}
      <div className="mt-4">
        {hasChildren ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex -space-x-2 flex-1">
              {childPreviews.map((child) => (
                <div
                  key={child.id}
                  title={child.name}
                  className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold uppercase text-slate-600"
                >
                  {child.image ? (
                    <SafeImage src={child.image} alt={child.name} className="h-full w-full" />
                  ) : (
                    child.name.substring(0, 2)
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[8px] font-bold text-slate-500">
                  +{remainingCount}
                </div>
              )}
            </div>
            <motion.div
              animate={{ x: hovered ? 2 : 0 }}
              className="flex items-center gap-0.5 text-[10px] font-bold text-slate-500"
            >
              Voir
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-[10px] font-semibold text-slate-400">
            <PlusCircle className="h-3 w-3" />
            Aucune sous-catégorie
          </div>
        )}
      </div>

      {/* Actions (survol) */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            className="absolute right-3 top-3 flex items-center gap-1"
          >
            <ActionBtn icon={<PlusCircle className="h-3.5 w-3.5" />} title="Ajouter sous-catégorie" onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }} />
            <ActionBtn icon={<Edit3 className="h-3.5 w-3.5" />} title="Modifier" onClick={(e) => { e.stopPropagation(); onEdit(category); }} />
            <ActionBtn icon={<Trash2 className="h-3.5 w-3.5" />} title="Supprimer" onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* --- Bouton d'action miniature --- */
function ActionBtn({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-600"
    >
      {icon}
    </motion.button>
  );
}

/* --- Export principal --- */
export default function CategoryCard({ isGridView = true, ...props }: CategoryCardProps) {
  return isGridView ? <GridCard {...props} /> : <ListCard {...props} />;
}