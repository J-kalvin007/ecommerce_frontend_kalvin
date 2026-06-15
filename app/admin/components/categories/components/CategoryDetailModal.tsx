

// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import { FolderTree, ChevronRight, ChevronDown, PlusCircle } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/special/ui/Dialog";
// import type { Category } from "@/modeles/categories";

// interface CategoryDetailModalProps {
//   category: Category | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onAddSubcategory: (parent: Category) => void;
// }

// function SubcategoryTree({ category, level = 0, onAddSubcategory }: { category: Category; level: number; onAddSubcategory: (cat: Category) => void }) {
//   const [expanded, setExpanded] = useState(true);

//   return (
//     <div className="ml-4 first:ml-0">
//       <div
//         className="flex items-center gap-2 rounded-lg p-2 hover:bg-surface-alt cursor-pointer transition-colors"
//         onClick={() => setExpanded(!expanded)}
//       >
//         {category.children && category.children.length > 0 && (
//           <div className="text-muted-foreground">
//             {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//           </div>
//         )}
//         <div className="relative h-6 w-6 overflow-hidden rounded-md bg-primary/5">
//           {category.image ? (
//             <Image src={category.image} alt={category.name} fill className="object-cover" sizes="24px" />
//           ) : (
//             <FolderTree className="h-3 w-3 m-auto text-primary" />
//           )}
//         </div>
//         <span className="text-sm font-medium text-foreground">{category.name}</span>
//         <button
//           onClick={(e) => { e.stopPropagation(); onAddSubcategory(category); }}
//           className="ml-auto rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary"
//           title="Ajouter une sous-catégorie"
//         >
//           <PlusCircle className="h-3.5 w-3.5" />
//         </button>
//       </div>
//       <AnimatePresence initial={false}>
//         {expanded && category.children && category.children.length > 0 && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="overflow-hidden"
//           >
//             {category.children.map((child) => (
//               <SubcategoryTree key={child.id} category={child} level={level + 1} onAddSubcategory={onAddSubcategory} />
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default function CategoryDetailModal({ category, isOpen, onClose, onAddSubcategory }: CategoryDetailModalProps) {
//   if (!category) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
//         <div className="relative flex flex-col max-h-[80vh]">
//           <DialogHeader className="p-6 pb-2">
//             <DialogTitle className="flex items-center gap-3 text-xl font-bold">
//               <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-primary/5">
//                 {category.image ? (
//                   <Image src={category.image} alt={category.name} fill className="object-cover" />
//                 ) : (
//                   <FolderTree className="m-auto h-5 w-5 text-primary" />
//                 )}
//               </div>
//               {category.name}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
//             <div>
//               <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</h4>
//               <p className="text-sm text-foreground">{category.slug}</p>
//             </div>
//             {category.description && (
//               <div>
//                 <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
//                 <p className="text-sm text-foreground">{category.description}</p>
//               </div>
//             )}
//             <div>
//               <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sous-catégories</h4>
//               {category.children && category.children.length > 0 ? (
//                 <div className="mt-2 space-y-1">
//                   {category.children.map((child) => (
//                     <SubcategoryTree key={child.id} category={child} level={0} onAddSubcategory={onAddSubcategory} />
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-muted-foreground">Aucune sous-catégorie.</p>
//               )}
//             </div>
//           </div>

//           <div className="border-t border-border p-4 flex justify-end">
//             <button
//               onClick={() => onAddSubcategory(category)}
//               className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90"
//             >
//               <PlusCircle className="h-4 w-4" />
//               Ajouter une sous-catégorie
//             </button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }














// components/admin/categories/CategoryDetailModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FolderTree, ChevronRight, ChevronDown, PlusCircle, Edit3, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/special/ui/Dialog";
import type { Category } from "@/modeles/categories";

function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);
  const resolvedSrc = src ? (src.startsWith("http") ? src : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${src.startsWith("/") ? "" : "/"}${src}`) : null;
  
  if (!resolvedSrc || error) {
    return <FolderTree className="h-1/2 w-1/2 text-primary opacity-50 m-auto" />;
  }
  return <Image src={resolvedSrc} alt={alt} {...props} onError={() => setError(true)} />;
}

interface CategoryDetailModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onAddSubcategory: (parent: Category) => void;
  onEdit?: (cat: Category) => void;
  onDelete?: (id: string) => void;
}

function SubcategoryTree({
  category,
  onAddSubcategory,
  onEdit,
  onDelete,
}: {
  category: Category;
  onAddSubcategory: (cat: Category) => void;
  onEdit?: (cat: Category) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="ml-5 first:ml-0 border-l border-border/50 pl-4 py-1">
      <div
        className="group flex items-center gap-3 rounded-xl p-2 hover:bg-surface-alt cursor-pointer transition-all duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-muted-foreground transition-transform duration-200 group-hover:text-primary">
          {category.children && category.children.length > 0 ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner">
          <SafeImage src={category.image} alt={category.name} fill className="object-cover" sizes="48px" />
        </div>
        <div className="flex flex-col min-w-0 flex-1 ml-1">
          <span className="text-sm font-bold text-foreground truncate">{category.name}</span>
          <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{category.description || "Aucune description."}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSubcategory(category);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted-foreground shadow-sm border border-border/50 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Ajouter une sous-catégorie"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted-foreground shadow-sm border border-border/50 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
              title="Modifier"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted-foreground shadow-sm border border-border/50 hover:bg-error/10 hover:text-error transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && category.children && category.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1">
              {category.children.map((child) => (
                <SubcategoryTree key={child.id} category={child} onAddSubcategory={onAddSubcategory} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CategoryDetailModal({
  category,
  isOpen,
  onClose,
  onAddSubcategory,
  onEdit,
  onDelete,
}: CategoryDetailModalProps) {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-5xl p-4 md:p-8 overflow-hidden border-none shadow-2xl rounded-2xl md:rounded-[2.5rem] bg-surface">
        <DialogTitle className="sr-only">
          Détails de la catégorie {category.name}
        </DialogTitle>
        <div className="relative flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar gap-6 md:gap-8 pr-1 md:pr-2">
          {/* Header Split Layout */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch shrink-0">
            {/* Gauche : Image (Cover) */}
            <div className="relative w-full md:w-[45%] shrink-0 rounded-2xl md:rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
              <div className="aspect-[4/3] w-full relative">
                <SafeImage src={category.image} alt={category.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 500px" />
              </div>
            </div>

            {/* Sublime Divider */}
            <div className="hidden md:block w-px border-l-2 border-dashed border-border/60 my-4" />

            {/* Droite : Informations */}
            <div className="flex-1 flex flex-col justify-center py-2 pr-4">
              <div className="mb-6">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight drop-shadow-sm">{category.name}</h2>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-alt px-3 py-1.5 border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Slug</span>
                  <span className="text-sm font-semibold text-foreground">{category.slug}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Description
                </h4>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {category.description || "Aucune description fournie pour cette catégorie. Vous pouvez en ajouter une en la modifiant."}
                </p>
              </div>
            </div>
          </div>

          {/* Sublime Divider Horizontal */}
          <div className="w-full border-t-2 border-dashed border-border/50 shrink-0" />

          <div className="shrink-0">
            {/* Subcategories Section */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Sous-catégories
                </h4>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {category.children?.length || 0}
                </div>
              </div>
              
              <div className="rounded-2xl bg-surface-elevated p-6 border border-border/50 shadow-sm">
                {category.children && category.children.length > 0 ? (
                  <div className="space-y-1.5">
                    {category.children.map((child) => (
                      <SubcategoryTree key={child.id} category={child} onAddSubcategory={onAddSubcategory} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary/60 mb-4 border border-primary/10">
                      <FolderTree className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Aucune sous-catégorie</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                      Structurez votre catalogue en ajoutant des sous-catégories.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 pt-4 flex justify-end">
            <button
              onClick={() => onAddSubcategory(category)}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="h-5 w-5" />
              Ajouter une sous-catégorie
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}