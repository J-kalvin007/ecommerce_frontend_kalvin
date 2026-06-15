

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
























// components/admin/categories/CategoryCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit3, FolderTree, Trash2, PlusCircle, ChevronRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/modeles/categories";

function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);
  const resolvedSrc = src ? (src.startsWith("http") ? src : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${src.startsWith("/") ? "" : "/"}${src}`) : null;

  if (!resolvedSrc || error) {
    return <FolderTree className="h-1/2 w-1/2 text-primary opacity-50 m-auto" />;
  }
  return <Image src={resolvedSrc} alt={alt} {...props} onError={() => setError(true)} />;
}

interface CategoryCardProps {
  category: Category & { levelText?: string };
  onClick?: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parent: Category) => void;
  isGridView?: boolean;
}

export default function CategoryCard({
  category,
  onClick,
  onEdit,
  onDelete,
  onAddSubcategory,
  isGridView = true,
}: CategoryCardProps) {
  const hasChildren = category.children && category.children.length > 0;
  const childPreviews = hasChildren ? category.children.slice(0, 3) : [];
  const remainingCount = hasChildren ? category.children.length - childPreviews.length : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onClick?.();
  };

  if (!isGridView) {
    // Mode liste : Premium
    return (
      <div
        onClick={handleCardClick}
        className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-inner">
            <SafeImage src={category.image} alt={category.name} fill className="object-cover" sizes="56px" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">{category.name}</h3>
              {category.levelText?.includes("—") && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Sous-cat
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">slug: {category.slug}</p>
            {hasChildren && (
              <p className="text-[11px] font-medium text-primary mt-1 flex items-center gap-1">
                <Layers className="h-3 w-3" /> {category.children.length} sous-catégorie(s)
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }}
            className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20"
            title="Ajouter une sous-catégorie"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-2 rounded-xl hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors border border-transparent hover:border-blue-500/20"
            title="Modifier"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
            className="p-2 rounded-xl hover:bg-error/10 text-muted-foreground hover:text-error transition-colors border border-transparent hover:border-error/20"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Mode grille : Premium mais plus compact et sans description
  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      {/* Cover Image Area */}
      <div className="relative h-32 w-full bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
        <SafeImage 
          src={category.image} 
          alt={category.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
          sizes="(max-width: 768px) 100vw, 33vw" 
        />
        {/* Subtle gradient so text below isn't needed here, just image */}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Header and inline elegant actions */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-extrabold text-foreground tracking-tight">{category.name}</h3>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2 py-0.5 border border-border/50">
               <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Slug</span>
               <span className="text-[10px] font-semibold text-foreground truncate">{category.slug}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 transition-all duration-300 group-hover:opacity-100 shrink-0">
             <button onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Ajouter sous-catégorie"><PlusCircle size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onEdit(category); }} className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors" title="Modifier"><Edit3 size={16}/></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(category.id); }} className="p-1.5 text-muted-foreground hover:text-error transition-colors" title="Supprimer"><Trash2 size={16}/></button>
          </div>
        </div>

        {/* Affichage des sous-catégories en bulles */}
        {hasChildren ? (
          <div className="mt-auto flex items-center gap-2 rounded-xl bg-surface/50 p-2.5 border border-border/40">
            <div className="flex -space-x-2">
              {childPreviews.map((child) => (
                <div
                  key={child.id}
                  className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold uppercase"
                >
                  {child.image ? (
                    <SafeImage src={child.image} alt={child.name} fill className="object-cover" sizes="32px" />
                  ) : (
                    child.name.substring(0, 2)
                  )}
                </div>
              ))}
            </div>
            {remainingCount > 0 && (
              <span className="text-[10px] font-bold text-primary">+{remainingCount}</span>
            )}
            <div className="ml-auto flex items-center text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Voir {category.children.length}
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-center text-[11px] font-medium text-muted-foreground">
            <div className="h-8 flex items-center">Aucune sous-catégorie</div>
          </div>
        )}
      </div>
    </div>
  );
}