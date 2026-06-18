// /**
//  * ProductsSection - Gestion des produits admin
//  * @module app/admin/components/ProductsSection
//  */

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   AlertTriangle,
//   Edit3,
//   Eye,
//   Filter,
//   Package,
//   Plus,
//   Save,
//   Search,
//   Trash2,
//   TrendingUp,
//   Upload,
//   X,
//   Layers,
// } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import { getAdminCategories } from "@/fonctions_api/categories.api";
// import {
//   getAdminProducts,
//   getAdminProductImages,
//   getAdminProductVariants,
//   createAdminProduct,
//   updateAdminProduct,
//   deleteAdminProduct,
//   createAdminProductImage,
//   createAdminProductVariant,
//   updateAdminProductVariant,
//   deleteAdminProductVariant,
// } from "@/fonctions_api/produits.api";
// import type { Category } from "@/modeles/categories";
// import type {
//   ProductDetail,
//   ProductImageAdmin,
//   ProductVariantAdmin,
//   ProductCreateUpdatePayload,
// } from "@/modeles/produits";

// import Toast from "@/components/notifications/Toast";
// import LoadingStyle from "@/components/special/loadingStyle";
// import ConfirmDialog from "@/components/special/ConfirmDialog";
// import ErrorState from "@/components/special/ErrorState";
// import EmptyState from "@/components/special/EmptyState";
// import LoadingSpinner from "@/components/special/ui/LoadingSpinner";

// interface ProductRow {
//   id: string;
//   name: string;
//   sku: string;
//   price: string;
//   stock: number;
//   status: string;
//   categoryName: string;
//   image: string;
//   productType: string;
//   variantsCount: number;
//   isTop: boolean;
// }

// interface ProductFormState {
//   name: string;
//   slug: string;
//   sku: string;
//   description: string;
//   product_type: string;
//   price: string;
//   stock: string;
//   weight_grams: string;
//   seo_title: string;
//   seo_description: string;
//   is_top: boolean;
//   alt_text: string;
// }

// interface VariantFormState {
//   id?: string;
//   name: string;
//   sku: string;
//   price: string;
//   stock: string;
//   weight_grams: string;
//   is_active: boolean;
// }

// interface UploadedProductImage {
//   id: string;
//   file: File;
//   preview: string;
//   alt_text: string;
// }

// interface ProductFormErrors {
//   name?: string;
//   sku?: string;
//   description?: string;
//   price?: string;
//   stock?: string;
//   category?: string;
// }

// const INITIAL_FORM: ProductFormState = {
//   name: "",
//   slug: "",
//   sku: "",
//   description: "",
//   product_type: "RAW",
//   price: "",
//   stock: "0",
//   weight_grams: "0",
//   seo_title: "",
//   seo_description: "",
//   is_top: false,
//   alt_text: "",
// };

// const INITIAL_VARIANT_FORM: VariantFormState = {
//   name: "",
//   sku: "",
//   price: "",
//   stock: "0",
//   weight_grams: "0",
//   is_active: true,
// };

// const STOCK_BADGE: Record<string, { label: string; className: string }> = {
//   IN_STOCK: { label: "En stock", className: "bg-emerald-50 text-emerald-700" },
//   LOW_STOCK: { label: "Stock faible", className: "bg-amber-50 text-amber-700" },
//   OUT_OF_STOCK: { label: "Rupture", className: "bg-red-50 text-red-700" },
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

// function makeSku(value: string) {
//   const base = slugify(value).toUpperCase().replace(/-/g, "-");
//   return (base || "PRODUIT").slice(0, 20);
// }

// function validateProductForm(
//   form: ProductFormState,
//   selectedCategoryId: string
// ): ProductFormErrors {
//   const errors: ProductFormErrors = {};

//   if (!form.name.trim()) errors.name = "Le nom est obligatoire.";
//   if (!form.sku.trim()) errors.sku = "Le SKU est obligatoire.";
//   if (!form.description.trim()) errors.description = "La description est obligatoire.";
//   if (!form.price.trim()) errors.price = "Le prix est obligatoire.";
//   if (!form.stock.trim()) errors.stock = "Le stock est obligatoire.";
//   if (!selectedCategoryId) errors.category = "La catégorie est obligatoire.";

//   return errors;
// }

// function buildProductPayload(
//   form: ProductFormState,
//   selectedCategoryId: string
// ): ProductCreateUpdatePayload {
//   return {
//     category: selectedCategoryId || null,
//     name: form.name.trim(),
//     slug: form.slug.trim() || slugify(form.name),
//     sku: form.sku.trim(),
//     description: form.description.trim(),
//     product_type: form.product_type || "RAW",
//     price: form.price.trim(),
//     stock: Number(form.stock || 0),
//     weight_grams: Number(form.weight_grams || 0),
//     seo_title: form.seo_title.trim(),
//     seo_description: form.seo_description.trim(),
//     is_top: Boolean(form.is_top),
//     related_products: [],
//   };
// }

// function mapProduct(product: ProductDetail): ProductRow {
//   return {
//     id: product.id,
//     name: product.name,
//     sku: product.sku,
//     price: product.price,
//     stock: product.stock ?? 0,
//     status: product.is_in_stock || "IN_STOCK",
//     categoryName: product.category?.name || "",
//     image:
//       product.images?.find((image) => image.is_primary)?.image ||
//       product.images?.[0]?.image ||
//       product.primary_image ||
//       product.image ||
//       product.image_url ||
//       product.thumbnail ||
//       "",
//     productType: product.product_type || "RAW",
//     variantsCount: product.variants?.length || 0,
//     isTop: Boolean(product.is_top),
//   };
// }

// export default function ProductsSection() {
//   const [search, setSearch] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [activeTab, setActiveTab] = useState<"general" | "images" | "variants">("general");
//   const [showAdvancedFields, setShowAdvancedFields] = useState(false);

//   const [products, setProducts] = useState<ProductDetail[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [productImages, setProductImages] = useState<ProductImageAdmin[]>([]);
//   const [productVariants, setProductVariants] = useState<ProductVariantAdmin[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [catalogLoading, setCatalogLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [editingProductId, setEditingProductId] = useState<string | null>(null);

//   // Dialog state
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   const [confirmDeleteVariantId, setConfirmDeleteVariantId] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [deletingVariant, setDeletingVariant] = useState(false);

//   // Status state
//   const [error, setError] = useState<string | null>(null);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
//     show: false,
//     type: "info",
//     message: "",
//   });

//   const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
//   const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
//   const [selectedCategoryId, setSelectedCategoryId] = useState("");
//   const [selectedImageId, setSelectedImageId] = useState("");
//   const [uploadedImages, setUploadedImages] = useState<UploadedProductImage[]>([]);
//   const [previewImageIndex, setPreviewImageIndex] = useState(0);

//   // Variantes
//   const [variantForm, setVariantForm] = useState<VariantFormState>(INITIAL_VARIANT_FORM);
//   const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
//   const [savingVariant, setSavingVariant] = useState(false);

//   const rows = useMemo(() => products.map(mapProduct), [products]);

//   const filtered = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     if (!term) return rows;
//     return rows.filter((product) =>
//       [product.name, product.sku, product.categoryName, product.productType]
//         .filter(Boolean)
//         .some((value) => String(value).toLowerCase().includes(term))
//     );
//   }, [rows, search]);

//   const stats = useMemo(
//     () => ({
//       total: rows.length,
//       inStock: rows.filter((product) => product.status === "IN_STOCK").length,
//       lowStock: rows.filter((product) => product.status === "LOW_STOCK").length,
//       variants: productVariants.length,
//     }),
//     [rows, productVariants]
//   );

//   const selectedLibraryImage = productImages.find((image) => image.id === selectedImageId);
//   const editingProduct = editingProductId ? products.find((product) => product.id === editingProductId) ?? null : null;
//   const existingProductImages = editingProduct?.images ?? [];
//   const currentUploadedImage = uploadedImages[previewImageIndex];
//   const currentExistingImage =
//     uploadedImages.length === 0 && !selectedLibraryImage
//       ? existingProductImages[previewImageIndex] ?? existingProductImages[0]
//       : null;
//   const currentPreviewImage = currentUploadedImage?.preview || selectedLibraryImage?.image || currentExistingImage?.image || "";
//   const currentPreviewAlt = currentUploadedImage?.alt_text || selectedLibraryImage?.alt_text || currentExistingImage?.alt_text || form.alt_text || form.name || "Prévisualisation";

//   const currentProductVariants = productVariants.filter(v => v.product === editingProductId);

//   const showToast = (type: "success" | "error" | "info", message: string) => {
//     setToast({ show: true, type, message });
//   };

//   const loadProducts = async () => {
//     setLoading(true);
//     try {
//       const result = await getAdminProducts();
//       if (result.ok) setProducts(result.data);
//       else setError(result.error.message);
//     } catch (err) {
//       setError("Impossible de charger les produits.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCatalogData = async () => {
//     setCatalogLoading(true);
//     const [categoriesResult, imagesResult, variantsResult] = await Promise.all([
//       getAdminCategories(),
//       getAdminProductImages(),
//       getAdminProductVariants(),
//     ]);

//     if (categoriesResult.ok) setCategories(categoriesResult.data);
//     if (imagesResult.ok) setProductImages(imagesResult.data);
//     if (variantsResult.ok) setProductVariants(variantsResult.data);

//     setCatalogLoading(false);
//   };

//   useEffect(() => {
//     void (async () => {
//       await Promise.all([loadProducts(), loadCatalogData()]);
//     })();
//   }, []);

//   const resetForm = () => {
//     setForm(INITIAL_FORM);
//     setFormErrors({});
//     setShowAdvancedFields(false);
//     setSelectedCategoryId("");
//     setSelectedImageId("");
//     setUploadedImages([]);
//     setPreviewImageIndex(0);
//     setEditingProductId(null);
//     setActiveTab("general");
//     resetVariantForm();
//   };

//   const resetVariantForm = () => {
//     setVariantForm(INITIAL_VARIANT_FORM);
//     setEditingVariantId(null);
//   };

//   const openCreateModal = () => {
//     resetForm();
//     setShowModal(true);
//   };

//   const openEditModal = (productId: string) => {
//     const product = products.find((item) => item.id === productId);
//     if (!product) return;

//     setEditingProductId(product.id);
//     setForm({
//       name: product.name || "",
//       slug: product.slug || "",
//       sku: product.sku || "",
//       description: product.description || "",
//       product_type: product.product_type || "RAW",
//       price: product.price || "",
//       stock: String(product.stock ?? 0),
//       weight_grams: String(product.weight_grams ?? 0),
//       seo_title: product.seo_title || "",
//       seo_description: product.seo_description || "",
//       is_top: Boolean(product.is_top),
//       alt_text: product.images?.find((image) => image.is_primary)?.alt_text || product.name,
//     });
//     setSelectedCategoryId(product.category?.id || "");
//     const primaryImageIndex = Math.max(product.images?.findIndex((image) => image.is_primary) ?? 0, 0);
//     setSelectedImageId(product.images?.find((image) => image.is_primary)?.id || "");
//     setUploadedImages([]);
//     setPreviewImageIndex(primaryImageIndex);
//     setShowAdvancedFields(true);
//     setActiveTab("general");
//     resetVariantForm();
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     resetForm();
//   };

//   const handleFormChange = (field: keyof ProductFormState, value: string | boolean) => {
//     setFormErrors((prev) => ({ ...prev, [field]: undefined }));
//     setForm((prev) => ({
//       ...prev,
//       [field]: value,
//       ...(field === "name" && !editingProductId
//         ? { slug: slugify(String(value)), sku: makeSku(String(value)) }
//         : {}),
//     }));
//   };

//   const handleVariantFormChange = (field: keyof VariantFormState, value: string | boolean) => {
//     setVariantForm((prev) => ({
//       ...prev,
//       [field]: value,
//       ...(field === "name" && !editingVariantId
//         ? { sku: makeSku(String(value)) }
//         : {}),
//     }));
//   };

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(event.target.files ?? []);
//     if (files.length === 0) return;

//     void Promise.all(
//       files.map(
//         (file) =>
//           new Promise<UploadedProductImage>((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => {
//               const result = typeof reader.result === "string" ? reader.result : "";
//               resolve({
//                 id: `${file.name}-${file.lastModified}`,
//                 file,
//                 preview: result,
//                 alt_text: file.name.replace(/\.[^.]+$/, ""),
//               });
//             };
//             reader.onerror = () => reject(reader.error);
//             reader.readAsDataURL(file);
//           })
//       )
//     ).then((nextImages) => {
//       let hadExistingImages = false;
//       setUploadedImages((prev) => {
//         hadExistingImages = prev.length > 0;
//         const mergedImages = [...prev];
//         nextImages.forEach((image) => {
//           if (!mergedImages.some((existingImage) => existingImage.id === image.id)) {
//             mergedImages.push(image);
//           }
//         });
//         return mergedImages;
//       });
//       setPreviewImageIndex((prev) => (hadExistingImages ? prev : 0));
//       setSelectedImageId("");
//       if (!form.alt_text && nextImages[0]?.alt_text) {
//         setForm((prev) => ({ ...prev, alt_text: nextImages[0].alt_text }));
//       }
//       event.target.value = "";
//     });
//   };

//   const handleSaveProduct = async () => {
//     setSaving(true);
//     const validationErrors = validateProductForm(form, selectedCategoryId);

//     if (Object.keys(validationErrors).length > 0) {
//       setFormErrors(validationErrors);
//       setSaving(false);
//       setActiveTab("general");
//       showToast("error", "Veuillez remplir les champs obligatoires.");
//       return;
//     }

//     try {
//       const payload = buildProductPayload(form, selectedCategoryId);
//       const result = editingProductId
//         ? await updateAdminProduct(editingProductId, payload)
//         : await createAdminProduct(payload);

//       if (!result.ok) {
//         showToast("error", result.error.message);
//         setSaving(false);
//         return;
//       }

//       const savedProduct = result.data;
//       const pendingUploads = uploadedImages.length > 0
//         ? uploadedImages.map((image, index) => ({
//           product: savedProduct.id,
//           image: image.file,
//           alt_text: image.alt_text || form.alt_text || form.name,
//           is_primary: index === 0,
//           is_active: true,
//         }))
//         : [];

//       if (pendingUploads.length > 0) {
//         for (const upload of pendingUploads) {
//           await createAdminProductImage(upload);
//         }
//       }

//       showToast("success", `Produit ${editingProductId ? "modifié" : "créé"} avec succès.`);
//       closeModal();
//       await Promise.all([loadProducts(), loadCatalogData()]);
//     } catch (err) {
//       showToast("error", "Erreur inattendue lors de la sauvegarde.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const executeDeleteProduct = async () => {
//     if (!confirmDeleteId) return;
//     setDeleting(true);
//     try {
//       const result = await deleteAdminProduct(confirmDeleteId);
//       if (result.ok) {
//         showToast("success", "Produit supprimé avec succès.");
//         await loadProducts();
//       } else {
//         showToast("error", result.error.message);
//       }
//     } catch (err) {
//       showToast("error", "Impossible de supprimer le produit.");
//     } finally {
//       setDeleting(false);
//       setConfirmDeleteId(null);
//     }
//   };

//   // --- Variantes ---
//   const handleSaveVariant = async () => {
//     if (!editingProductId) return;
//     setSavingVariant(true);
//     try {
//       const payload = {
//         product: editingProductId,
//         name: variantForm.name,
//         sku: variantForm.sku || null,
//         price: variantForm.price,
//         stock: parseInt(variantForm.stock) || 0,
//         weight_grams: parseInt(variantForm.weight_grams) || 0,
//         is_active: variantForm.is_active,
//       };

//       const result = editingVariantId
//         ? await updateAdminProductVariant(editingVariantId, payload)
//         : await createAdminProductVariant(payload);

//       if (result.ok) {
//         showToast("success", `Variante ${editingVariantId ? "modifiée" : "créée"} avec succès.`);
//         resetVariantForm();
//         await Promise.all([loadProducts(), loadCatalogData()]);
//       } else {
//         showToast("error", result.error.message);
//       }
//     } catch (err) {
//       showToast("error", "Erreur lors de la sauvegarde de la variante.");
//     } finally {
//       setSavingVariant(false);
//     }
//   };

//   const handleEditVariant = (variant: ProductVariantAdmin) => {
//     setEditingVariantId(variant.id);
//     setVariantForm({
//       name: variant.name,
//       sku: variant.sku || "",
//       price: variant.price,
//       stock: String(variant.stock),
//       weight_grams: String(variant.weight_grams || 0),
//       is_active: variant.is_active,
//     });
//   };

//   const executeDeleteVariant = async () => {
//     if (!confirmDeleteVariantId) return;
//     setDeletingVariant(true);
//     try {
//       const result = await deleteAdminProductVariant(confirmDeleteVariantId);
//       if (result.ok) {
//         showToast("success", "Variante supprimée avec succès.");
//         await Promise.all([loadProducts(), loadCatalogData()]);
//       } else {
//         showToast("error", result.error.message);
//       }
//     } catch (err) {
//       showToast("error", "Erreur lors de la suppression de la variante.");
//     } finally {
//       setDeletingVariant(false);
//       setConfirmDeleteVariantId(null);
//     }
//   };

//   if (error && !products.length && !loading) {
//     return <ErrorState message={error} onRetry={loadProducts} />;
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
//         onConfirm={executeDeleteProduct}
//         title="Supprimer le produit"
//         message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action supprimera également ses images et variantes."
//         confirmText="Supprimer"
//         type="danger"
//         isLoading={deleting}
//       />

//       <ConfirmDialog
//         isOpen={!!confirmDeleteVariantId}
//         onCancel={() => setConfirmDeleteVariantId(null)}
//         onConfirm={executeDeleteVariant}
//         title="Supprimer la variante"
//         message="Voulez-vous supprimer cette variante de produit ?"
//         confirmText="Supprimer"
//         type="danger"
//         isLoading={deletingVariant}
//       />

//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Produits</h1>
//           <p className="text-sm text-slate-500">{rows.length} produit(s) enregistrés</p>
//         </div>
//         <button
//           onClick={openCreateModal}
//           className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-primary-hover"
//         >
//           <Plus className="h-4 w-4" /> Ajouter un produit
//         </button>
//       </div>

//       <div className="flex gap-3">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Rechercher par nom, SKU, catégorie..."
//             className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//           />
//         </div>
//         <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 font-medium">
//           <Filter className="h-4 w-4 text-slate-400" /> {filtered.length} résultat(s)
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         {[
//           { label: "Total produits", value: String(stats.total), icon: Package, color: "text-slate-700" },
//           { label: "En stock", value: String(stats.inStock), icon: TrendingUp, color: "text-emerald-600" },
//           { label: "Stock faible", value: String(stats.lowStock), icon: AlertTriangle, color: "text-amber-600" },
//           { label: "Variantes", value: String(stats.variants), icon: Layers, color: "text-primary" },
//         ].map((stat) => (
//           <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
//             <stat.icon className={cn("h-4 w-4", stat.color)} />
//             <p className="mt-2 text-xl font-bold text-slate-900">{stat.value}</p>
//             <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
//           </div>
//         ))}
//       </div>

//       {loading ? (
//         <LoadingStyle label="Chargement du catalogue..." />
//       ) : filtered.length === 0 ? (
//         <EmptyState
//           title="Aucun produit"
//           description={search ? "Aucun produit ne correspond à votre recherche." : "Votre catalogue de produits est actuellement vide. Commencez par en créer un."}
//           actionText={search ? "Effacer la recherche" : "Créer un produit"}
//           onAction={search ? () => setSearch("") : openCreateModal}
//           icon={Package}
//         />
//       ) : (
//         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-slate-200 bg-slate-50">
//                   {["Produit", "SKU", "Prix", "Stock", "Statut", "Variantes", "Actions"].map((header) => (
//                     <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((product) => (
//                   <tr key={product.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60 group">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-alt border border-border/50 shadow-sm">
//                           <SafeProductImage src={product.image} alt={product.name} />
//                         </div>
//                         <div className="min-w-0">
//                           <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">{product.name}</p>
//                           <p className="text-[10px] text-slate-500">{product.categoryName || "Sans catégorie"}</p>
//                         </div>
//                         {product.isTop && (
//                           <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-primary border border-orange-200">TOP</span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-xs font-mono text-slate-500">{product.sku}</td>
//                     <td className="px-4 py-3 text-sm font-semibold text-slate-900">
//                       {formatCurrency(parseFloat(product.price), "FCFA")}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-slate-600">{product.stock}</td>
//                     <td className="px-4 py-3">
//                       <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold border",
//                         STOCK_BADGE[product.status]?.className === "bg-emerald-50 text-emerald-700" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
//                           STOCK_BADGE[product.status]?.className === "bg-amber-50 text-amber-700" ? "border-amber-200 bg-amber-50 text-amber-700" :
//                             "border-red-200 bg-red-50 text-red-700"
//                       )}>
//                         {STOCK_BADGE[product.status]?.label || "En stock"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-sm text-center">
//                       <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">{product.variantsCount}</span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
//                           <Eye className="h-4 w-4" />
//                         </button>
//                         <button onClick={() => openEditModal(product.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-orange-50 hover:text-primary">
//                           <Edit3 className="h-4 w-4" />
//                         </button>
//                         <button onClick={() => setConfirmDeleteId(product.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

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
//               className="fixed left-1/2 top-1/2 z-[70] max-h-[95vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
//             >
//               <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4">
//                 <div>
//                   <h3 className="text-xl font-bold text-slate-900">
//                     {editingProductId ? "Modifier le produit" : "Nouveau produit"}
//                   </h3>
//                 </div>
//                 <button onClick={closeModal} className="text-slate-400 transition-colors hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               {/* Tabs */}
//               <div className="flex border-b border-slate-100 px-6 gap-6 bg-slate-50/50 pt-2">
//                 <button
//                   onClick={() => setActiveTab("general")}
//                   className={cn("pb-3 text-sm font-semibold transition-all border-b-2", activeTab === "general" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800")}
//                 >
//                   Général
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("images")}
//                   className={cn("pb-3 text-sm font-semibold transition-all border-b-2", activeTab === "images" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800")}
//                 >
//                   Images
//                 </button>
//                 {editingProductId && (
//                   <button
//                     onClick={() => setActiveTab("variants")}
//                     className={cn("pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2", activeTab === "variants" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800")}
//                   >
//                     Variantes <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{currentProductVariants.length}</span>
//                   </button>
//                 )}
//               </div>

//               <div className="flex-1 overflow-y-auto p-6">
//                 {activeTab === "general" && (
//                   <div className="space-y-5">
//                     <div className="grid grid-cols-2 gap-5">
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nom du produit *</label>
//                         <input value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} className={cn("h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20", formErrors.name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary")} />
//                         {formErrors.name && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.name}</p>}
//                       </div>
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">Catégorie *</label>
//                         <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className={cn("h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 bg-white", formErrors.category ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary")}>
//                           <option value="">Sélectionner une catégorie</option>
//                           {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                         </select>
//                         {formErrors.category && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.category}</p>}
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-5">
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">SKU *</label>
//                         <input value={form.sku} onChange={(e) => handleFormChange("sku", e.target.value)} className={cn("h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20", formErrors.sku ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary")} />
//                         {formErrors.sku && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.sku}</p>}
//                       </div>
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">Slug</label>
//                         <input value={form.slug} onChange={(e) => handleFormChange("slug", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50" />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description *</label>
//                       <textarea rows={4} value={form.description} onChange={(e) => handleFormChange("description", e.target.value)} className={cn("w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20", formErrors.description ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary")} />
//                       {formErrors.description && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.description}</p>}
//                     </div>

//                     <div className="grid grid-cols-3 gap-5">
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">Prix (FCFA) *</label>
//                         <input type="number" value={form.price} onChange={(e) => handleFormChange("price", e.target.value)} className={cn("h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20", formErrors.price ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary")} />
//                         {formErrors.price && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.price}</p>}
//                       </div>
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">Stock initial *</label>
//                         <input type="number" value={form.stock} onChange={(e) => handleFormChange("stock", e.target.value)} className={cn("h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20", formErrors.stock ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-primary")} />
//                         {formErrors.stock && <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.stock}</p>}
//                       </div>
//                       <div>
//                         <label className="mb-1.5 block text-xs font-semibold text-slate-700">Type de produit</label>
//                         <select value={form.product_type} onChange={(e) => handleFormChange("product_type", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white">
//                           <option value="RAW">RAW</option>
//                           <option value="PROCESSED">PROCESSED</option>
//                           <option value="EXPORT">EXPORT</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 mt-6 transition-all">
//                       <button type="button" onClick={() => setShowAdvancedFields((prev) => !prev)} className="flex w-full items-center justify-between text-left group">
//                         <div>
//                           <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Champs avancés</p>
//                           <p className="text-xs text-slate-500">SEO, mise en avant</p>
//                         </div>
//                         <span className="text-xs font-semibold text-primary bg-orange-50 px-3 py-1.5 rounded-full">{showAdvancedFields ? "Masquer" : "Afficher"}</span>
//                       </button>
//                       {showAdvancedFields && (
//                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 space-y-4 pt-4 border-t border-slate-200">
//                           <div className="grid grid-cols-2 gap-5">
//                             <div>
//                               <label className="mb-1.5 block text-xs font-semibold text-slate-700">Titre SEO</label>
//                               <input value={form.seo_title} onChange={(e) => handleFormChange("seo_title", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
//                             </div>
//                             <div className="flex items-end">
//                               <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 cursor-pointer hover:border-primary/50 transition-colors">
//                                 <input type="checkbox" checked={form.is_top} onChange={(e) => handleFormChange("is_top", e.target.checked)} className="h-4 w-4 rounded text-primary focus:ring-primary/20" />
//                                 Produit mis en avant
//                               </label>
//                             </div>
//                           </div>
//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description SEO</label>
//                             <textarea rows={2} value={form.seo_description} onChange={(e) => handleFormChange("seo_description", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
//                           </div>
//                         </motion.div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "images" && (
//                   <div className="space-y-6">
//                     <label className="flex h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary hover:bg-orange-50 transition-all group">
//                       <div className="text-center">
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
//                           <Upload className="h-6 w-6 text-primary" />
//                         </div>
//                         <p className="mt-3 text-sm font-semibold text-slate-700">Cliquez ou glissez une image ici</p>
//                         <p className="mt-1 text-xs text-slate-500">PNG, JPG ou WEBP acceptés</p>
//                       </div>
//                       <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
//                     </label>

//                     {uploadedImages.length > 0 && (
//                       <div>
//                         <h4 className="text-sm font-bold text-slate-900 mb-3">Nouvelles images ({uploadedImages.length})</h4>
//                         <div className="grid grid-cols-4 gap-4">
//                           {uploadedImages.map((img, i) => (
//                             <div key={i} className="relative h-28 rounded-xl overflow-hidden border-2 border-primary shadow-sm">
//                               <Image src={img.preview} alt="preview" fill className="object-cover" />
//                               {i === 0 && <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Principale</span>}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {existingProductImages.length > 0 && (
//                       <div>
//                         <h4 className="text-sm font-bold text-slate-900 mb-3">Images enregistrées ({existingProductImages.length})</h4>
//                         <div className="grid grid-cols-4 gap-4">
//                           {existingProductImages.map((img) => (
//                             <div key={img.id} className="relative h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
//                               <Image src={img.image} alt={img.alt_text} fill className="object-cover" />
//                               {img.is_primary && <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">Principale</span>}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === "variants" && editingProductId && (
//                   <div className="space-y-6">
//                     {/* Formulaire de variante */}
//                     <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
//                       <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
//                         {editingVariantId ? <Edit3 className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
//                         {editingVariantId ? "Modifier la variante" : "Ajouter une variante"}
//                       </h4>
//                       <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div>
//                           <label className="text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wide">Nom (ex: 500g, Rouge)</label>
//                           <input placeholder="Nom de la variante" value={variantForm.name} onChange={e => handleVariantFormChange("name", e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
//                         </div>
//                         <div>
//                           <label className="text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wide">SKU unique</label>
//                           <input placeholder="SKU-VAR-1" value={variantForm.sku} onChange={e => handleVariantFormChange("sku", e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
//                         </div>
//                         <div>
//                           <label className="text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wide">Prix spécifique</label>
//                           <input type="number" placeholder="Prix" value={variantForm.price} onChange={e => handleVariantFormChange("price", e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
//                         </div>
//                         <div>
//                           <label className="text-[11px] font-semibold text-slate-500 mb-1 block uppercase tracking-wide">Stock</label>
//                           <input type="number" placeholder="Stock disponible" value={variantForm.stock} onChange={e => handleVariantFormChange("stock", e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
//                         </div>
//                       </div>
//                       <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/60 mt-2">
//                         {editingVariantId && <button onClick={resetVariantForm} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3">Annuler</button>}
//                         <button
//                           onClick={handleSaveVariant}
//                           disabled={savingVariant || !variantForm.name || !variantForm.price}
//                           className="bg-primary text-white text-sm px-5 py-2 rounded-xl font-bold shadow-md hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-2"
//                         >
//                           {savingVariant && <LoadingSpinner size="sm" className="border-t-white border-r-white" />}
//                           {savingVariant ? "Sauvegarde..." : (editingVariantId ? "Enregistrer" : "Ajouter")}
//                         </button>
//                       </div>
//                     </div>

//                     {/* Liste des variantes */}
//                     {currentProductVariants.length > 0 ? (
//                       <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
//                         <table className="w-full text-sm text-left">
//                           <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
//                             <tr>
//                               <th className="px-5 py-3">Variante</th>
//                               <th className="px-5 py-3">SKU</th>
//                               <th className="px-5 py-3">Prix</th>
//                               <th className="px-5 py-3">Stock</th>
//                               <th className="px-5 py-3 text-right">Actions</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {currentProductVariants.map(v => (
//                               <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
//                                 <td className="px-5 py-3 font-bold text-slate-900">{v.name}</td>
//                                 <td className="px-5 py-3 text-xs font-mono text-slate-500 bg-slate-50 rounded px-2 py-1 mx-5 my-2 inline-block border border-slate-100">{v.sku}</td>
//                                 <td className="px-5 py-3 font-medium text-emerald-600">{formatCurrency(parseFloat(v.price), "FCFA")}</td>
//                                 <td className="px-5 py-3 font-medium text-slate-700">{v.stock}</td>
//                                 <td className="px-5 py-3 text-right">
//                                   <div className="flex items-center justify-end gap-2">
//                                     <button onClick={() => handleEditVariant(v)} className="p-1.5 text-slate-400 hover:bg-orange-50 hover:text-primary rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
//                                     <button onClick={() => setConfirmDeleteVariantId(v.id)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     ) : (
//                       <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
//                         <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
//                         <p className="text-sm text-slate-500 font-medium">Aucune variante pour ce produit.</p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div className="border-t border-slate-100 bg-white p-6 flex justify-end gap-3 rounded-b-2xl">
//                 <button onClick={closeModal} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
//                   Fermer
//                 </button>
//                 {activeTab !== "variants" && (
//                   <button onClick={handleSaveProduct} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 transition-all hover:scale-[1.02]">
//                     {saving ? <LoadingSpinner size="sm" className="border-t-white border-r-white" /> : <Save className="h-4 w-4" />}
//                     {editingProductId ? "Enregistrer" : "Créer le produit"}
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

