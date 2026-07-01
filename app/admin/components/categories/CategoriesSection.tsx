


// app/admin/components/CategoriesSection.tsx
"use client";

import { useEffect, useState } from "react";
import { FolderTree, LayoutGrid, List, Plus, ShoppingBag } from "lucide-react";
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
import { motion } from "framer-motion";



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
    <div className="space-y-6 px-20">

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


        {/* -- En-tête avec effet premium -- */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="relative inline-block group">
            <h2
              className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
              style={{
                letterSpacing: "-0.025em",
                backgroundImage:
                  "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
                backgroundSize: "220% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <ShoppingBag className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Catégories
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              {categories.length} catégorie(s) principale(s)
            </span>

            {/* Gradient SVG caché pour l'icône */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>


            {/* Animations scoppées, avec respect du prefers-reduced-motion */}
            <style>{`
            @keyframes premium-title-shine-anim {
              0%, 100% { background-position: 0% center; }
              50% { background-position: 100% center; }
            }
            .premium-title-shine {
              animation: premium-title-shine-anim 6s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .premium-title-shine {
                animation: none;
              }
            }
          `}</style>
          </div>
        </motion.div>







        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("rounded-md p-1.5 cursor-pointer transition-colors", viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("rounded-md p-1.5 cursor-pointer transition-colors", viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center cursor-pointer gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
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