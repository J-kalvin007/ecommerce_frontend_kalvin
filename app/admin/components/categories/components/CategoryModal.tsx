

// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { X, Upload, Save, Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/special/ui/Dialog";
// import type { Category } from "@/modeles/categories";

// interface CategoryModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: any) => Promise<void>;
//   initialData?: Partial<Category> & { parentId?: string | null };
//   isEditing?: boolean;
//   isSaving?: boolean;
//   parentCategoryName?: string | null;
//   categoriesList?: Category[]; // pour la sélection du parent (exclure soi-même)
// }

// export default function CategoryModal({
//   isOpen,
//   onClose,
//   onSave,
//   initialData = {},
//   isEditing = false,
//   isSaving = false,
//   parentCategoryName,
//   categoriesList = [],
// }: CategoryModalProps) {
//   const [form, setForm] = useState({
//     name: "",
//     slug: "",
//     description: "",
//     parent: "",
//   });
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   const slugify = (value: string) => {
//     return value
//       .trim()
//       .toLowerCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "")
//       .slice(0, 64);
//   };

//   useEffect(() => {
//     if (isOpen) {
//       setForm({
//         name: initialData.name || "",
//         slug: initialData.slug || "",
//         description: initialData.description || "",
//         parent: initialData.parentId || initialData.parent || "",
//       });
//       setImagePreview(initialData.image || null);
//       setImageFile(null);
//     }
//   }, [isOpen, initialData]);

//   const handleChange = (field: keyof typeof form, value: string) => {
//     setForm((prev) => ({
//       ...prev,
//       [field]: value,
//       ...(field === "name" && !isEditing ? { slug: slugify(value) } : {}),
//     }));
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload = {
//       name: form.name.trim(),
//       slug: form.slug.trim() || slugify(form.name),
//       description: form.description.trim(),
//       parent: form.parent || null,
//       ...(imageFile ? { image: imageFile } : {}),
//     };
//     await onSave(payload);
//   };

//   // Filtrer les catégories pour éviter de sélectionner soi-même comme parent
//   const availableParents = categoriesList.filter((cat) => cat.id !== initialData.id);

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
//         <div className="relative flex flex-col max-h-[90vh]">
//           <DialogHeader className="p-6 pb-0">
//             <DialogTitle className="text-xl font-bold">
//               {isEditing ? "Modifier la catégorie" : initialData.parentId ? "Ajouter une sous-catégorie" : "Nouvelle catégorie"}
//             </DialogTitle>
//             <DialogDescription>
//               {parentCategoryName && `Sous-catégorie de : ${parentCategoryName}`}
//             </DialogDescription>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
//             {/* Upload image */}
//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Image</label>
//               <label className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface hover:border-primary/40 transition-colors">
//                 {imagePreview ? (
//                   <Image src={imagePreview} alt="Preview" fill className="object-cover" />
//                 ) : (
//                   <div className="text-center">
//                     <Upload className="mx-auto h-6 w-6 text-muted" />
//                     <p className="mt-1 text-xs font-medium text-muted-foreground">Choisir une image</p>
//                   </div>
//                 )}
//                 <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//               </label>
//             </div>

//             {/* Parent (optionnel, sauf si déjà défini) */}
//             {!initialData.parentId && !parentCategoryName && (
//               <div>
//                 <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Catégorie parente (optionnel)</label>
//                 <select
//                   value={form.parent}
//                   onChange={(e) => handleChange("parent", e.target.value)}
//                   className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
//                 >
//                   <option value="">Aucune (catégorie principale)</option>
//                   {availableParents.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nom *</label>
//               <input
//                 value={form.name}
//                 onChange={(e) => handleChange("name", e.target.value)}
//                 className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
//                 required
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug *</label>
//               <input
//                 value={form.slug}
//                 onChange={(e) => handleChange("slug", e.target.value)}
//                 className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
//                 required
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
//               <textarea
//                 rows={4}
//                 value={form.description}
//                 onChange={(e) => handleChange("description", e.target.value)}
//                 className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
//               />
//             </div>

//             <div className="flex justify-end gap-3 pt-2">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-alt"
//               >
//                 Annuler
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSaving || !form.name.trim() || !form.slug.trim()}
//                 className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
//               >
//                 {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//                 {isEditing ? "Enregistrer" : "Créer"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }













// components/admin/categories/CategoryModal.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/widgets_originaux/special/ui/Dialog";
import type { Category } from "@/modeles/categories";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Partial<Category> & { parentId?: string | null };
  isEditing?: boolean;
  isSaving?: boolean;
  parentCategoryName?: string | null;
  categoriesList?: Category[];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isEditing = false,
  isSaving = false,
  parentCategoryName,
  categoriesList = [],
}: CategoryModalProps) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        parent: initialData.parentId || initialData.parent || "",
      });
      setImagePreview(initialData.image || null);
      setImageFile(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !isEditing ? { slug: slugify(value) } : {}),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim(),
      parent: form.parent || null,
      ...(imageFile ? { image: imageFile } : {}),
    };
    await onSave(payload);
  };

  const availableParents = categoriesList.filter((cat) => cat.id !== initialData.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <div className="relative flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">
              {isEditing
                ? "Modifier la catégorie"
                : initialData.parentId
                  ? "Ajouter une sous-catégorie"
                  : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              {parentCategoryName && `Sous-catégorie de : ${parentCategoryName}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Image</label>
              <label className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface hover:border-primary/40 transition-colors">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-muted" />
                    <p className="mt-1 text-xs font-medium text-muted-foreground">Choisir une image</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {!initialData.parentId && !parentCategoryName && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Catégorie parente (optionnel)</label>
                <select
                  value={form.parent}
                  onChange={(e) => handleChange("parent", e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {availableParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nom *</label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-alt"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving || !form.name.trim() || !form.slug.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEditing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}