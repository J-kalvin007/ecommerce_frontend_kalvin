
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Filter, Plus, Package, Layers, TrendingUp, AlertTriangle,
  LayoutGrid, List, SlidersHorizontal, X, ChevronDown, Crown, Star, Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminCategories } from "@/fonctions_api/categories.api";
import {
  getAdminProducts, getAdminProductImages, getAdminProductVariants,
  createAdminProduct, updateAdminProduct, deleteAdminProduct,
  createAdminProductVariant, updateAdminProductVariant, deleteAdminProductVariant,
  createAdminProductImage
} from "@/fonctions_api/produits.api";
import type { Category } from "@/modeles/categories";
import type { ProductDetail, ProductImageAdmin, ProductVariantAdmin } from "@/modeles/produits";
import { ProductGrid } from "./components/ProductGrid";
import { ProductFormModal } from "./components/ProductFormModal";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { VariantFormModal } from "./components/VariantFormModal";
import { INITIAL_FORM, buildProductPayload } from "./productsUtils";
import type { ProductFormState, UploadedProductImage } from "./productsUtils";
import Toast from "@/components/notifications/Toast";
import LoadingStyle from "@/components/special/loadingStyle";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import ErrorState from "@/components/special/ErrorState";
import EmptyState from "@/components/special/EmptyState";
import { ProductList } from "./components/ProductList";
import { motion, AnimatePresence } from "framer-motion";

const STOCK_FILTERS = [
  { value: "", label: "Tous les stocks" },
  { value: "IN_STOCK", label: "En stock" },
  { value: "LOW_STOCK", label: "Stock faible" },
  { value: "OUT_OF_STOCK", label: "Rupture" },
];

const TYPE_FILTERS = [
  { value: "", label: "Tous les types" },
  { value: "RAW", label: "Brut" },
  { value: "PROCESSED", label: "Transformé" },
  { value: "EXPORT", label: "Export" },
];

function StatCard({
  icon: Icon, label, value, color, sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-white/20 p-3.5 shadow-sm backdrop-blur-xl",
        "bg-gradient-to-br from-surface/80 to-surface/30 dark:from-surface/20 dark:to-surface/5"
      )}
    >
      {/* Pattern de fond subtil (dots) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "12px 12px" }} />

      {/* Éclairage / Glow */}
      <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl", color)} />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-white/50 dark:bg-black/20 shadow-sm border border-white/10 backdrop-blur-sm")}>
          <Icon className={cn("h-4 w-4", color.replace("bg-", "text-"))} />
        </div>
        {sub && (
          <span className="text-[9px] font-bold text-muted-foreground rounded-full bg-surface/50 backdrop-blur-sm px-2 py-0.5 border border-border/30 shadow-sm">
            {sub}
          </span>
        )}
      </div>
      <div className="relative z-10 mt-3">
        <p className="text-xl font-black text-foreground tracking-tight leading-none">{value}</p>
        <p className="mt-1 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/80">{label}</p>
      </div>
    </motion.div>
  );
}

export default function ProductsSection() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<ProductImageAdmin[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariantAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [filterStock, setFilterStock] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTop, setFilterTop] = useState(false);
  const [showStats, setShowStats] = useState(true);
  // Modale variantes dédiée
  const [variantModalProduct, setVariantModalProduct] = useState<ProductDetail | null>(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, imagesRes, variantsRes] = await Promise.all([
        getAdminProducts(), getAdminCategories(), getAdminProductImages(), getAdminProductVariants(),
      ]);
      if (productsRes.ok) setProducts(productsRes.data);
      if (categoriesRes.ok) setCategories(categoriesRes.data);
      if (imagesRes.ok) setProductImages(imagesRes.data);
      if (variantsRes.ok) setProductVariants(variantsRes.data);
      else setError("Erreur de chargement");
    } catch {
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    const term = search.toLowerCase();
    if (term) result = result.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    if (filterStock) result = result.filter(p => p.is_in_stock === filterStock);
    if (filterType) result = result.filter(p => p.product_type === filterType);
    if (filterCategory) result = result.filter(p => p.category?.id === filterCategory);
    if (filterTop) result = result.filter(p => p.is_top);
    return result;
  }, [products, search, filterStock, filterType, filterCategory, filterTop]);

  const activeFiltersCount = [filterStock, filterType, filterCategory, filterTop].filter(Boolean).length;

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.is_in_stock === "IN_STOCK").length,
    lowStock: products.filter(p => p.is_in_stock === "LOW_STOCK").length,
    variants: productVariants.length,
  };

  const handleSaveProduct = async (form: ProductFormState & { category?: string }, uploadedImages: UploadedProductImage[], variants: any[] = []) => {
    setSaving(true);
    const categoryId = (form as any).category || editingProduct?.category?.id || "";
    const payload = buildProductPayload(form, categoryId);
    const result = editingProduct
      ? await updateAdminProduct(editingProduct.id, payload)
      : await createAdminProduct(payload);
    if (!result.ok) { setToast({ show: true, type: "error", message: result.error.message }); setSaving(false); return; }
    const saved = result.data;
    if (uploadedImages.length) {
      for (let i = 0; i < uploadedImages.length; i++) {
        const isPrimary = uploadedImages[i].is_primary || (i === 0 && !uploadedImages.some(u => u.is_primary));
        await createAdminProductImage({ product: saved.id, image: uploadedImages[i].file, alt_text: uploadedImages[i].alt_text, is_primary: isPrimary });
      }
    }

    // Save locally created variants if it's a new product
    if (!editingProduct && variants && variants.length > 0) {
      for (const v of variants) {
        // remove the temporary id
        const { id, ...variantData } = v;
        await createAdminProductVariant({ ...variantData, product: saved.id });
      }
    }

    setToast({ show: true, type: "success", message: `Produit ${editingProduct ? "modifié" : "créé"} avec succès` });
    await loadData();
    setFormOpen(false);
    setSaving(false);
  };

  const handleAddVariant = async (variant: any) => {
    const productId = variantModalProduct?.id || editingProduct?.id;
    if (!productId) return;
    const res = await createAdminProductVariant({ ...variant, product: productId });
    if (res.ok) { await loadData(); return Promise.resolve(); }
    else { setToast({ show: true, type: "error", message: res.error.message }); return Promise.reject(); }
  };
  const handleUpdateVariant = async (id: string, variant: any) => {
    const res = await updateAdminProductVariant(id, variant);
    if (res.ok) await loadData();
    else setToast({ show: true, type: "error", message: res.error.message });
  };
  const handleDeleteVariant = async (id: string) => {
    await deleteAdminProductVariant(id);
    await loadData();
  };
  const handleDeleteProduct = async () => {
    if (!deletingId) return;
    const res = await deleteAdminProduct(deletingId);
    if (res.ok) { setToast({ show: true, type: "success", message: "Produit supprimé" }); await loadData(); }
    else setToast({ show: true, type: "error", message: res.error.message });
    setDeletingId(null);
  };

  // Ouvrir la modale variante dédiée
  const openVariantModal = (p: ProductDetail) => {
    setVariantModalProduct(p);
    setVariantModalOpen(true);
  };

  const clearFilters = () => {
    setFilterStock(""); setFilterType(""); setFilterCategory(""); setFilterTop(false);
  };

  const variantsForProduct = productVariants.filter(v => v.product === (variantModalProduct?.id || editingProduct?.id));

  if (error && !products.length) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-5">
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast(p => ({ ...p, show: false }))} />
      <ConfirmDialog
        isOpen={!!deletingId}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDeleteProduct}
        title="Supprimer le produit"
        message="Cette action est irréversible. Le produit et toutes ses variantes seront définitivement supprimés."
        confirmText="Supprimer définitivement"
        type="danger"
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">Produits</h1>
          <p className="text-xs text-muted-foreground">{products.length} produit{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowStats(!showStats)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all shadow-sm",
              showStats ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-surface text-muted-foreground hover:bg-surface-alt hover:text-foreground"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{showStats ? "Masquer les stats" : "Afficher les stats"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditingProduct(null); setFormOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un produit</span>
            <span className="sm:hidden">Ajouter</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 py-1">
              <StatCard icon={Package} label="Total" value={stats.total} color="bg-blue-500" />
              <StatCard icon={TrendingUp} label="En stock" value={stats.inStock} color="bg-emerald-500" sub={`${stats.total > 0 ? Math.round((stats.inStock / stats.total) * 100) : 0}%`} />
              <StatCard icon={AlertTriangle} label="Stock faible" value={stats.lowStock} color="bg-amber-500" />
              <StatCard icon={Layers} label="Variantes" value={stats.variants} color="bg-purple-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de recherche + filtres */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou SKU..."
              className="h-10 w-full rounded-xl border border-border/60 bg-surface pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200",
              showFilters || activeFiltersCount > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-surface text-muted-foreground hover:bg-surface-alt hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
          {/* Compteur résultats */}
          <div className="flex h-10 items-center gap-1.5 rounded-xl border border-border/40 bg-surface px-3 text-xs text-muted-foreground whitespace-nowrap">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{filteredProducts.length}</span>
            <span className="hidden sm:inline">résultat{filteredProducts.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Panneau filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border/50 bg-surface-alt/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtres avancés
                  </p>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <X className="h-3 w-3" />Effacer tout
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Filtre stock */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stock</label>
                    <select
                      value={filterStock}
                      onChange={e => setFilterStock(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      {STOCK_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  {/* Filtre type */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      {TYPE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  {/* Filtre catégorie */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Catégorie</label>
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Filtre TOP */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mise en avant</label>
                    <button
                      onClick={() => setFilterTop(!filterTop)}
                      className={cn(
                        "h-9 w-full rounded-xl border flex items-center gap-2 px-3 text-xs font-medium transition-all",
                        filterTop ? "border-amber-400 bg-amber-50 text-amber-700" : "border-border bg-surface text-muted-foreground hover:border-border/80"
                      )}
                    >
                      <Crown className={cn("h-3.5 w-3.5", filterTop ? "text-amber-500" : "")} />
                      {filterTop ? "TOP uniquement" : "Tous les produits"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bouton bascule de vue juste au-dessus de la liste */}
      <div className="flex justify-end">
        <div className="flex items-center rounded-[14px] border border-border/50 bg-surface/60 backdrop-blur-sm p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("rounded-[10px] p-2 transition-all duration-200 flex items-center gap-2",
              viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-surface-alt"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("rounded-[10px] p-2 transition-all duration-200 flex items-center gap-2",
              viewMode === "list" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-surface-alt"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grille / Liste */}
      {loading ? (
        <LoadingStyle label="Chargement des produits..." />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Aucun produit trouvé"
          description={activeFiltersCount > 0 ? "Essayez d'ajuster vos filtres." : "Commencez par créer un produit."}
          actionText={activeFiltersCount > 0 ? "Effacer les filtres" : "Créer un produit"}
          onAction={activeFiltersCount > 0 ? clearFilters : () => { setEditingProduct(null); setFormOpen(true); }}
          icon={Package}
        />
      ) : viewMode === "grid" ? (
        <ProductGrid
          products={filteredProducts}
          onProductClick={(p) => { setSelectedProduct(p); setDetailOpen(true); }}
          onEdit={(p) => { setEditingProduct(p); setFormOpen(true); }}
          onDelete={(id) => setDeletingId(id)}
          onAddVariant={openVariantModal}
        />
      ) : (
        <ProductList
          products={filteredProducts}
          onProductClick={(p) => { setSelectedProduct(p); setDetailOpen(true); }}
          onEdit={(p) => { setEditingProduct(p); setFormOpen(true); }}
          onDelete={(id) => setDeletingId(id)}
          onAddVariant={openVariantModal}
        />
      )}

      {/* Formulaire produit */}
      <ProductFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null); }}
        initialForm={editingProduct ? {
          name: editingProduct.name,
          slug: editingProduct.slug || "",
          sku: editingProduct.sku,
          description: editingProduct.description || "",
          product_type: editingProduct.product_type,
          price: editingProduct.price,
          stock: String(editingProduct.stock),
          weight_grams: String(editingProduct.weight_grams || 0),
          seo_title: editingProduct.seo_title || "",
          seo_description: editingProduct.seo_description || "",
          is_top: editingProduct.is_top || false,
          alt_text: editingProduct.images?.[0]?.alt_text || "",
        } : INITIAL_FORM}
        selectedCategoryId={editingProduct?.category?.id || ""}
        categories={categories}
        existingImages={editingProduct?.images || []}
        existingVariants={productVariants.filter(v => v.product === editingProduct?.id)}
        onSave={handleSaveProduct}
        onAddVariant={handleAddVariant}
        onUpdateVariant={handleUpdateVariant}
        onDeleteVariant={handleDeleteVariant}
        isSaving={saving}
      />

      {/* Modale détail produit */}
      <ProductDetailModal
        product={selectedProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* Modale variantes dédiée (depuis la card) */}
      <VariantFormModal
        open={variantModalOpen}
        onClose={() => { setVariantModalOpen(false); setVariantModalProduct(null); }}
        product={variantModalProduct}
        variants={variantsForProduct}
        onAddVariant={handleAddVariant}
        onUpdateVariant={handleUpdateVariant}
        onDeleteVariant={handleDeleteVariant}
        isSaving={saving}
      />
    </div>
  );
}
