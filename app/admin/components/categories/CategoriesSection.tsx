// /**
//  * CategoriesSection - Gestion des categories admin
//  * @module app/admin/components/CategoriesSection
//  */

// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { AnimatePresence, motion } from "framer-motion";
// import { Edit3, FolderTree, Plus, Save, Trash2, X, Upload } from "lucide-react";

// import {
//   createAdminCategory,
//   deleteAdminCategory,
//   getAdminCategories,
//   updateAdminCategory,
// } from "@/fonctions_api/categories.api";
// import type { Category } from "@/modeles/categories";

// import Toast from "@/components/notifications/Toast";
// import LoadingStyle from "@/components/special/loadingStyle";
// import ConfirmDialog from "@/components/special/ConfirmDialog";
// import ErrorState from "@/components/special/ErrorState";
// import EmptyState from "@/components/special/EmptyState";
// import LoadingSpinner from "@/components/special/ui/LoadingSpinner";

// interface CategoryFormState {
//   name: string;
//   slug: string;
//   description: string;
//   parent: string;
// }

// const INITIAL_FORM: CategoryFormState = {
//   name: "",
//   slug: "",
//   description: "",
//   parent: "",
// };

// function slugify(value: string) {
//   return value
//     .trim()
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .slice(0, 64);
// }

// export default function CategoriesSection() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);

//   // Dialog state
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   // Status state
//   const [error, setError] = useState<string | null>(null);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
//     show: false,
//     type: "info",
//     message: "",
//   });

//   // Form state
//   const [form, setForm] = useState<CategoryFormState>(INITIAL_FORM);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   const loadCategories = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await getAdminCategories();
//       if (result.ok) {
//         setCategories(result.data);
//       } else {
//         setError(result.error.message);
//       }
//     } catch (err) {
//       console.error("Error loading categories:", err);
//       setError("Impossible de charger les catégories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadCategories();
//   }, []);

//   const showToast = (type: "success" | "error" | "info", message: string) => {
//     setToast({ show: true, type, message });
//   };

//   const openCreateModal = () => {
//     setEditingCategory(null);
//     setForm(INITIAL_FORM);
//     setImageFile(null);
//     setImagePreview(null);
//     setShowModal(true);
//   };

//   const openEditModal = (category: Category) => {
//     setEditingCategory(category);
//     setForm({
//       name: category.name,
//       slug: category.slug || "",
//       description: category.description || "",
//       parent: category.parent || "",
//     });
//     setImageFile(null);
//     setImagePreview(category.image || null);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingCategory(null);
//     setForm(INITIAL_FORM);
//     setImageFile(null);
//     setImagePreview(null);
//   };

//   const handleChange = (field: keyof CategoryFormState, value: string) => {
//     setForm((prev) => ({
//       ...prev,
//       [field]: value,
//       ...(field === "name" && !editingCategory ? { slug: slugify(value) } : {}),
//     }));
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name.trim(),
//         slug: form.slug.trim() || slugify(form.name),
//         description: form.description.trim(),
//         parent: form.parent || null,
//         ...(imageFile ? { image: imageFile } : {}),
//       };

//       const result = editingCategory
//         ? await updateAdminCategory(editingCategory.id, payload)
//         : await createAdminCategory(payload);

//       if (result.ok) {
//         showToast("success", `Catégorie ${editingCategory ? "modifiée" : "créée"} avec succès.`);
//         closeModal();
//         await loadCategories();
//       } else {
//         showToast("error", result.error.message);
//       }
//     } catch (err) {
//       console.error("Error saving category:", err);
//       showToast("error", "Erreur inattendue lors de la sauvegarde.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const executeDelete = async () => {
//     if (!confirmDeleteId) return;
//     setDeleting(true);
//     try {
//       const result = await deleteAdminCategory(confirmDeleteId);
//       if (result.ok) {
//         showToast("success", "Catégorie supprimée avec succès.");
//         await loadCategories();
//       } else {
//         showToast("error", result.error.message);
//       }
//     } catch (err) {
//       console.error("Error deleting category:", err);
//       showToast("error", "Erreur inattendue lors de la suppression.");
//     } finally {
//       setDeleting(false);
//       setConfirmDeleteId(null);
//     }
//   };

//   // Aplatis les enfants pour un affichage facile
//   const flattenCategories = (cats: Category[], prefix = ""): (Category & { levelText: string })[] => {
//     return cats.reduce((acc, cat) => {
//       acc.push({ ...cat, levelText: prefix + cat.name });
//       if (cat.children && cat.children.length > 0) {
//         acc.push(...flattenCategories(cat.children, prefix + "— "));
//       }
//       return acc;
//     }, [] as (Category & { levelText: string })[]);
//   };

//   const flatCategoriesList = flattenCategories(categories);

//   if (error && !categories.length) {
//     return <ErrorState message={error} onRetry={loadCategories} />;
//   }

//   return (
//     <div className="space-y-6">
//       <Toast 
//         show={toast.show} 
//         type={toast.type} 
//         message={toast.message} 
//         onClose={() => setToast((prev) => ({ ...prev, show: false }))} 
//       />

//       <ConfirmDialog
//         isOpen={!!confirmDeleteId}
//         onCancel={() => setConfirmDeleteId(null)}
//         onConfirm={executeDelete}
//         title="Supprimer la catégorie"
//         message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
//         confirmText="Supprimer"
//         type="danger"
//         isLoading={deleting}
//       />

//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Catégories</h1>
//           <p className="text-sm text-slate-500">{categories.length} catégorie(s) principale(s)</p>
//         </div>
//         <button
//           onClick={openCreateModal}
//           className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-primary-hover"
//         >
//           <Plus className="h-4 w-4" /> Créer une catégorie
//         </button>
//       </div>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//         {loading ? (
//           <div className="col-span-full">
//             <LoadingStyle label="Chargement des catégories..." />
//           </div>
//         ) : flatCategoriesList.length === 0 ? (
//           <div className="col-span-full">
//             <EmptyState 
//               title="Aucune catégorie" 
//               description="Votre catalogue de catégories est actuellement vide. Commencez par en créer une nouvelle."
//               actionText="Créer une catégorie"
//               onAction={openCreateModal}
//               icon={FolderTree}
//             />
//           </div>
//         ) : (
//           flatCategoriesList.map((category) => (
//             <div key={category.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
//               <div className="flex items-start justify-between gap-3">
//                 <div className="flex items-center gap-3">
//                   <div className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-orange-50 text-primary">
//                     {category.image ? (
//                       <Image src={category.image} alt={category.name} fill className="object-cover" sizes="44px" />
//                     ) : (
//                       <FolderTree className="m-auto h-5 w-5" />
//                     )}
//                   </div>
//                   <div className="min-w-0">
//                     <h2 className="truncate text-base font-semibold text-slate-900">{category.levelText}</h2>
//                     <p className="truncate text-xs text-slate-400">{category.slug}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={() => openEditModal(category)}
//                     className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-primary"
//                   >
//                     <Edit3 className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => setConfirmDeleteId(category.id)}
//                     className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>

//               <p className="mt-4 min-h-[44px] text-sm leading-6 text-slate-600 line-clamp-2">
//                 {category.description || "Aucune description fournie."}
//               </p>

//               <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
//                 <span>{category.children?.length ? `${category.children.length} sous-catégorie(s)` : "Sans sous-catégorie"}</span>
//                 <span className="font-mono">ID: {category.id.slice(0, 8)}</span>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       <AnimatePresence>
//         {showModal && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
//               onClick={closeModal}
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
//             >
//               <div className="mb-5 flex items-center justify-between">
//                 <h3 className="text-lg font-bold text-slate-900">
//                   {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
//                 </h3>
//                 <button onClick={closeModal} className="text-slate-400 hover:text-slate-900">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="mb-1.5 block text-xs font-medium text-slate-500">Image</label>
//                   <label className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-orange-50/40 transition-colors">
//                     {imagePreview ? (
//                       <Image src={imagePreview} alt="Preview" fill className="object-cover" />
//                     ) : (
//                       <div className="text-center">
//                         <Upload className="mx-auto h-6 w-6 text-slate-400" />
//                         <p className="mt-1 text-[11px] font-medium text-slate-600">Choisir une image</p>
//                       </div>
//                     )}
//                     <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="mb-1.5 block text-xs font-medium text-slate-500">Catégorie Parente (Optionnel)</label>
//                   <select
//                     value={form.parent}
//                     onChange={(e) => handleChange("parent", e.target.value)}
//                     className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//                   >
//                     <option value="">Aucune (Catégorie principale)</option>
//                     {flatCategoriesList
//                       .filter((c) => c.id !== editingCategory?.id)
//                       .map((category) => (
//                         <option key={category.id} value={category.id}>
//                           {category.levelText}
//                         </option>
//                       ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="mb-1.5 block text-xs font-medium text-slate-500">Nom *</label>
//                   <input
//                     value={form.name}
//                     onChange={(e) => handleChange("name", e.target.value)}
//                     className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1.5 block text-xs font-medium text-slate-500">Slug *</label>
//                   <input
//                     value={form.slug}
//                     onChange={(e) => handleChange("slug", e.target.value)}
//                     className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1.5 block text-xs font-medium text-slate-500">Description</label>
//                   <textarea
//                     rows={4}
//                     value={form.description}
//                     onChange={(e) => handleChange("description", e.target.value)}
//                     className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//                   />
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end gap-3">
//                 <button
//                   onClick={closeModal}
//                   className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={saving || !form.name.trim() || !form.slug.trim()}
//                   className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {saving ? <LoadingSpinner size="sm" className="border-t-white border-r-white" /> : <Save className="h-4 w-4" />}
//                   {editingCategory ? "Enregistrer" : "Créer"}
//                 </button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }





































// app/admin/components/CategoriesSection.tsx
"use client";

import { useEffect, useState } from "react";
import { FolderTree, LayoutGrid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/fonctions_api/categories.api";
import type { Category } from "@/modeles/categories";
import Toast from "@/components/notifications/Toast";
import LoadingStyle from "@/components/special/loadingStyle";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import ErrorState from "@/components/special/ErrorState";
import EmptyState from "@/components/special/EmptyState";
import CategoryCard from "./components/CategoryCard";
import CategoryModal from "./components/CategoryModal";
import CategoryDetailModal from "./components/CategoryDetailModal";



function flattenCategories(cats: Category[], prefix = ""): (Category & { levelText: string })[] {
  return cats.reduce((acc, cat) => {
    acc.push({ ...cat, levelText: prefix + cat.name });
    if (cat.children?.length) {
      acc.push(...flattenCategories(cat.children, prefix + "— "));
    }
    return acc;
  }, [] as (Category & { levelText: string })[]);
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "info",
    message: "",
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentForSub, setParentForSub] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Category | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminCategories();
      if (result.ok) {
        // Collect all child IDs to filter them out of the root level
        const childIds = new Set<string>();
        const collectChildren = (cats: Category[]) => {
          cats.forEach((cat) => {
            if (cat.children && cat.children.length > 0) {
              cat.children.forEach((child) => {
                childIds.add(child.id);
                collectChildren([child]); // recursive
              });
            }
          });
        };
        collectChildren(result.data);

        // Only keep categories that are NOT children of any other category
        const rootCategories = result.data.filter((cat) => !childIds.has(cat.id));
        setCategories(rootCategories);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("Impossible de charger les catégories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setParentForSub(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setParentForSub(null);
    setIsFormModalOpen(true);
  };

  const openAddSubModal = (parent: Category) => {
    setParentForSub(parent);
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    setSaving(true);
    try {
      const result = editingCategory
        ? await updateAdminCategory(editingCategory.id, payload)
        : await createAdminCategory(payload);
      if (result.ok) {
        showToast("success", `Catégorie ${editingCategory ? "modifiée" : "créée"} avec succès.`);
        setIsFormModalOpen(false);
        await loadCategories();
      } else {
        showToast("error", result.error.message);
      }
    } catch {
      showToast("error", "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      const result = await deleteAdminCategory(confirmDeleteId);
      if (result.ok) {
        showToast("success", "Catégorie supprimée.");
        await loadCategories();
      } else {
        showToast("error", result.error.message);
      }
    } catch {
      showToast("error", "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const flatList = flattenCategories(categories);

  if (error && !categories.length) {
    return <ErrorState message={error} onRetry={loadCategories} />;
  }

  return (
    <div className="space-y-6">
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast((p) => ({ ...p, show: false }))} />
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={executeDelete}
        title="Supprimer"
        message="Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
        isLoading={deleting}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} catégorie(s) principale(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("rounded-md p-1.5 transition-colors", viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("rounded-md p-1.5 transition-colors", viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Créer
          </button>
        </div>
      </div>

      <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
        {loading ? (
          <div className="col-span-full">
            <LoadingStyle label="Chargement..." size={10} />
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="Aucune catégorie" description="Commencez par en créer une." actionText="Créer" onAction={openCreateModal} icon={FolderTree} />
          </div>
        ) : (
          categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isGridView={viewMode === "grid"}
              onClick={() => setSelectedDetail(cat)}
              onEdit={openEditModal}
              onDelete={setConfirmDeleteId}
              onAddSubcategory={openAddSubModal}
            />
          ))
        )}
      </div>

      <CategoryModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
        initialData={editingCategory ? editingCategory : parentForSub ? { parentId: parentForSub.id } : {}}
        isEditing={!!editingCategory}
        isSaving={saving}
        parentCategoryName={parentForSub?.name}
        categoriesList={categories}
      />

      <CategoryDetailModal
        category={selectedDetail}
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onAddSubcategory={(cat) => {
          setSelectedDetail(null);
          openAddSubModal(cat);
        }}
        onEdit={(cat) => {
          setSelectedDetail(null);
          openEditModal(cat);
        }}
        onDelete={(id) => {
          setSelectedDetail(null);
          setConfirmDeleteId(id);
        }}
      />
    </div>
  );
}