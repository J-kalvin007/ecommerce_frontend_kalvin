
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   Search,
//   SlidersHorizontal,
//   Grid3X3,
//   List,
//   X,
//   ChevronDown,
//   ChevronRight,
//   Filter,
//   Loader2,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { getPublicProducts } from "@/fonctions_api/produits.api";
// import { getPublicCategories } from "@/fonctions_api/categories.api";
// import { getActiveSales } from "@/fonctions_api/promotions.api";
// import type { ProductList } from "@/modeles/produits";
// import type { Category } from "@/modeles/categories";
// import type { Soldes } from "@/modeles/promotions";
// import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
// import { ProductsPageHeader } from "./ProductsPageHeader";
// import { ProductCard } from "./ProductCard";

// /* ------------------------------------------------------------------ */
// /*  Types enrichis pour la page catalogue                             */
// /* ------------------------------------------------------------------ */

// /** Un produit avec d’éventuelles infos de vente flash */
// export type EnrichedProduct = ProductList & {
//   sale_price?: string;
//   original_price?: string;
// };

// /* ------------------------------------------------------------------ */
// /*  Constantes                                                         */
// /* ------------------------------------------------------------------ */

// const SORT_OPTIONS = [
//   { value: "-created_at", label: "Nouveautés" },
//   { value: "price", label: "Prix croissant" },
//   { value: "-price", label: "Prix décroissant" },
//   { value: "-note_produit", label: "Mieux notés" },
// ] as const;

// /* ------------------------------------------------------------------ */
// /*  Fonctions utilitaires                                             */
// /* ------------------------------------------------------------------ */

// /** Compte récursivement les catégories */
// function countCategories(categories: Category[]): number {
//   return categories.reduce(
//     (total, cat) =>
//       total + 1 + (cat.children ? countCategories(cat.children) : 0),
//     0
//   );
// }

// /** Trouve une catégorie par son slug */
// function findCategoryBySlug(
//   categories: Category[],
//   slug: string
// ): Category | undefined {
//   for (const cat of categories) {
//     if (cat.slug === slug) return cat;
//     if (cat.children?.length) {
//       const found = findCategoryBySlug(cat.children, slug);
//       if (found) return found;
//     }
//   }
//   return undefined;
// }

// /** Récupère les IDs des ancêtres d’une catégorie (pour l’expansion automatique) */
// function collectAncestorIds(
//   categories: Category[],
//   slug: string
// ): string[] {
//   function walk(nodes: Category[], ancestors: string[]): string[] | null {
//     for (const node of nodes) {
//       if (node.slug === slug) return ancestors;
//       if (node.children?.length) {
//         const found = walk(node.children, [...ancestors, node.id]);
//         if (found) return found;
//       }
//     }
//     return null;
//   }
//   return walk(categories, []) ?? [];
// }

// /** Enrichit la liste de produits avec les prix des ventes flash */
// function enrichProductsWithSales(
//   products: ProductList[],
//   sales: Soldes[]
// ): EnrichedProduct[] {
//   const salesBySlug = new Map<string, Soldes>();
//   for (const s of sales) {
//     salesBySlug.set(s.product_slug, s);
//   }

//   return products.map((product) => {
//     const sale = salesBySlug.get(product.slug ?? "");
//     if (sale) {
//       return {
//         ...product,
//         sale_price: sale.sale_price,
//         original_price: sale.original_price,
//       };
//     }
//     return product;
//   });
// }

// /* ------------------------------------------------------------------ */
// /*  Composant CategoryTreeItem                                        */
// /* ------------------------------------------------------------------ */

// type CategoryTreeItemProps = {
//   category: Category;
//   depth?: number;
//   selectedCategory: string | null;
//   expandedIds: Set<string>;
//   onToggleExpand: (id: string) => void;
//   onSelect: (slug: string) => void;
// };

// function CategoryTreeItem({
//   category,
//   depth = 0,
//   selectedCategory,
//   expandedIds,
//   onToggleExpand,
//   onSelect,
// }: CategoryTreeItemProps) {
//   const hasChildren = Boolean(category.children?.length);
//   const isExpanded = expandedIds.has(category.id);
//   const isSelected = selectedCategory === category.slug;

//   return (
//     <li>
//       <div
//         className="flex items-stretch gap-0.5"
//         style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : undefined }}
//       >
//         {hasChildren ? (
//           <button
//             type="button"
//             onClick={() => onToggleExpand(category.id)}
//             aria-expanded={isExpanded}
//             aria-label={isExpanded ? `Replier ${category.name}` : `Déplier ${category.name}`}
//             className="flex h-9 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-foreground"
//           >
//             <ChevronRight
//               className={cn(
//                 "h-4 w-4 transition-transform duration-200",
//                 isExpanded && "rotate-90"
//               )}
//             />
//           </button>
//         ) : (
//           <span className="w-7 shrink-0" aria-hidden="true" />
//         )}
//         <button
//           type="button"
//           onClick={() => onSelect(category.slug || "-")}
//           className={cn(
//             "min-h-9 flex-1 rounded-lg px-2 py-2 text-left text-sm transition-colors",
//             isSelected
//               ? "bg-primary/10 font-medium text-primary"
//               : "text-muted hover:bg-surface-alt hover:text-foreground"
//           )}
//         >
//           {category.name}
//         </button>
//       </div>
//       {hasChildren && isExpanded && (
//         <ul className="mt-1 space-y-1">
//           {category.children!.map((child) => (
//             <CategoryTreeItem
//               key={child.id}
//               category={child}
//               depth={depth + 1}
//               selectedCategory={selectedCategory}
//               expandedIds={expandedIds}
//               onToggleExpand={onToggleExpand}
//               onSelect={onSelect}
//             />
//           ))}
//         </ul>
//       )}
//     </li>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Composant principal                                               */
// /* ------------------------------------------------------------------ */

// export function ProductsCatalogClient() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [sortBy, setSortBy] = useState("-created_at");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [showFilters, setShowFilters] = useState(false);
//   const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

//   const [products, setProducts] = useState<ProductList[]>([]);
//   const [sales, setSales] = useState<Soldes[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());
//   const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(true);

//   const [loading, setLoading] = useState(true);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [productsError, setProductsError] = useState<string | null>(null);
//   const [categoriesError, setCategoriesError] = useState<string | null>(null);

//   // Chargement des ventes flash
//   useEffect(() => {
//     (async () => {
//       const res = await getActiveSales();
//       if (res.ok) setSales(res.data);
//       else setSales([]);
//     })();
//   }, []);

//   // Chargement des catégories
//   useEffect(() => {
//     (async () => {
//       setLoadingCategories(true);
//       setCategoriesError(null);
//       const res = await getPublicCategories();
//       if (res.ok) {
//         setCategories(res.data);
//         // Expansion initiale des catégories parentes
//         setExpandedCategoryIds(
//           new Set(
//             res.data
//               .filter((cat) => cat.children?.length)
//               .map((cat) => cat.id)
//           )
//         );
//       } else {
//         setCategories([]);
//         setCategoriesError(res.error?.message || "Impossible de charger les catégories.");
//       }
//       setLoadingCategories(false);
//     })();
//   }, []);

//   // Chargement des produits (avec debounce)
//   useEffect(() => {
//     const timeout = window.setTimeout(() => {
//       (async () => {
//         setLoading(true);
//         setProductsError(null);
//         try {
//           const params: any = {
//             ordering: sortBy,
//             page_size: 100,
//           };
//           if (searchQuery.trim().length >= 3) {
//             params.search = searchQuery.trim();
//           }
//           if (selectedCategory) {
//             params.category = selectedCategory;
//           }

//           const res = await getPublicProducts(params);
//           if (res.ok) {
//             setProducts(res.data.results);
//           } else {
//             setProducts([]);
//             setProductsError(res.error?.message || "Erreur de chargement des produits.");
//           }
//         } catch {
//           setProducts([]);
//           setProductsError("Impossible de charger les produits.");
//         } finally {
//           setLoading(false);
//         }
//       })();
//     }, 300);

//     return () => window.clearTimeout(timeout);
//   }, [searchQuery, selectedCategory, sortBy]);

//   // Enrichissement avec les soldes + filtrage local par prix
//   const enrichedProducts = useMemo(() => {
//     let result = enrichProductsWithSales(products, sales);

//     // Si recherche textuelle ET catégorie sélectionnée, on filtre aussi par catégorie
//     // (l'API a déjà filtré par catégorie si on a passé le paramètre, donc ce filtre est redondant sauf si on veut double vérification)
//     if (selectedCategory && searchQuery.trim().length >= 3) {
//       const cat = findCategoryBySlug(categories, selectedCategory);
//       if (cat) {
//         result = result.filter(
//           (p) => p.category_name?.toLowerCase() === cat.name.toLowerCase()
//         );
//       }
//     }

//     // Filtre par prix (sur le prix final, c'est-à-dire sale_price s'il existe, sinon price)
//     result = result.filter((p) => {
//       const finalPrice = parseFloat(p.sale_price ?? p.price);
//       return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
//     });

//     // Tri local (l'API trie déjà selon sortBy, mais on applique un tri supplémentaire si besoin pour les données enrichies)
//     // Comme l'API gère le tri, on peut se contenter de laisser l'ordre de l'API. On garde le tri local pour les cas où on modifie côté client.
//     switch (sortBy) {
//       case "price":
//         result.sort(
//           (a, b) =>
//             parseFloat(a.sale_price ?? a.price) - parseFloat(b.sale_price ?? b.price)
//         );
//         break;
//       case "-price":
//         result.sort(
//           (a, b) =>
//             parseFloat(b.sale_price ?? b.price) - parseFloat(a.sale_price ?? a.price)
//         );
//         break;
//       case "-note_produit":
//         result.sort(
//           (a, b) => parseFloat(b.note_produit) - parseFloat(a.note_produit)
//         );
//         break;
//       // "-created_at" déjà trié par l'API
//       default:
//         break;
//     }

//     return result;
//   }, [products, sales, categories, priceRange, searchQuery, selectedCategory, sortBy]);

//   const totalCategoryCount = useMemo(() => countCategories(categories), [categories]);

//   const toggleCategoryExpand = (id: string) => {
//     setExpandedCategoryIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const handleSelectCategory = (slug: string | null) => {
//     setSelectedCategory(slug);
//     if (!slug) return;

//     // Expansion automatique des ancêtres
//     setExpandedCategoryIds((prev) => {
//       const next = new Set(prev);
//       collectAncestorIds(categories, slug).forEach((id) => next.add(id));
//       const selected = findCategoryBySlug(categories, slug);
//       if (selected?.children?.length) next.add(selected.id);
//       return next;
//     });
//   };

//   return (
//     <div className="page-transition bg-[#fbf7e8]">
//       <ProductsPageHeader
//         productCount={enrichedProducts.length}
//         categoryCount={totalCategoryCount}
//       />

//       <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
//         {(categoriesError || productsError) && (
//           <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {productsError || categoriesError}
//           </div>
//         )}

//         {/* Barre d'outils */}
//         <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div className="relative max-w-md flex-1">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//             <input
//               type="text"
//               placeholder="Rechercher un produit..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//             />
//             {loading ? (
//               <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
//             ) : searchQuery ? (
//               <button
//                 type="button"
//                 onClick={() => setSearchQuery("")}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             ) : null}
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               onClick={() => setShowFilters(!showFilters)}
//               className={cn(
//                 "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all lg:hidden",
//                 showFilters
//                   ? "border-primary bg-primary/5 text-primary"
//                   : "border-border hover:border-primary/30"
//               )}
//             >
//               <Filter className="h-4 w-4" />
//               Filtres
//             </button>

//             <div className="relative">
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="appearance-none rounded-xl border border-border bg-surface-elevated py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
//               >
//                 {SORT_OPTIONS.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//             </div>

//             <div className="hidden items-center rounded-xl border border-border sm:flex">
//               <button
//                 type="button"
//                 onClick={() => setViewMode("grid")}
//                 className={cn(
//                   "flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors",
//                   viewMode === "grid" ? "bg-primary text-white" : "hover:bg-surface-alt"
//                 )}
//                 aria-label="Vue grille"
//               >
//                 <Grid3X3 className="h-4 w-4" />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setViewMode("list")}
//                 className={cn(
//                   "flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors",
//                   viewMode === "list" ? "bg-primary text-white" : "hover:bg-surface-alt"
//                 )}
//                 aria-label="Vue liste"
//               >
//                 <List className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-8">
//           {/* Sidebar filtres */}
//           <aside
//             className={cn(
//               "w-64 shrink-0 space-y-6 transition-all lg:block",
//               showFilters ? "block" : "hidden"
//             )}
//           >
//             {/* Catégories */}
//             <div className="rounded-2xl border border-border bg-surface-elevated p-5">
//               <button
//                 type="button"
//                 onClick={() => setCategoriesPanelOpen((v) => !v)}
//                 className="mb-4 flex w-full items-center justify-between gap-3 text-left"
//                 aria-expanded={categoriesPanelOpen}
//               >
//                 <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
//                   Catégories
//                 </h3>
//                 <ChevronDown
//                   className={cn(
//                     "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
//                     categoriesPanelOpen && "rotate-180"
//                   )}
//                 />
//               </button>

//               {categoriesPanelOpen && (
//                 <ul className="space-y-1">
//                   <li>
//                     <button
//                       type="button"
//                       onClick={() => handleSelectCategory(null)}
//                       className={cn(
//                         "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
//                         !selectedCategory
//                           ? "bg-primary/10 font-medium text-primary"
//                           : "text-muted hover:bg-surface-alt hover:text-foreground"
//                       )}
//                     >
//                       Tous les produits
//                     </button>
//                   </li>
//                   {loadingCategories ? (
//                     <li className="px-3 py-2 text-sm text-muted">Chargement...</li>
//                   ) : (
//                     categories.map((cat) => (
//                       <CategoryTreeItem
//                         key={cat.id}
//                         category={cat}
//                         selectedCategory={selectedCategory}
//                         expandedIds={expandedCategoryIds}
//                         onToggleExpand={toggleCategoryExpand}
//                         onSelect={(slug) => handleSelectCategory(slug)}
//                       />
//                     ))
//                   )}
//                 </ul>
//               )}
//             </div>

//             {/* Prix */}
//             <div className="rounded-2xl border border-border bg-surface-elevated p-5">
//               <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
//                 Prix
//               </h3>
//               <div className="space-y-3">
//                 <input
//                   type="range"
//                   min={0}
//                   max={100000}
//                   step={500}
//                   value={priceRange[1]}
//                   onChange={(e) =>
//                     setPriceRange([priceRange[0], parseInt(e.target.value, 10)])
//                   }
//                   className="w-full accent-primary"
//                 />
//                 <div className="flex items-center justify-between text-sm text-muted">
//                   <span>{priceRange[0]} FCFA</span>
//                   <span>{priceRange[1]} FCFA</span>
//                 </div>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="rounded-2xl border border-border bg-surface-elevated p-5">
//               <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
//                 Catalogue
//               </h3>
//               <div className="space-y-2 text-sm text-muted">
//                 <p>{totalCategoryCount} catégorie(s)</p>
//                 <p>{products.length} produit(s) chargés</p>
//               </div>
//             </div>
//           </aside>

//           {/* Grille produits */}
//           <div className="flex-1">
//             <p className="mb-4 text-sm text-muted">
//               {enrichedProducts.length} produit{enrichedProducts.length !== 1 ? "s" : ""} trouvé
//               {enrichedProducts.length !== 1 ? "s" : ""}
//             </p>

//             {loading ? (
//               <ProductGridSkeleton count={6} />
//             ) : enrichedProducts.length > 0 ? (
//               <div
//                 className={cn(
//                   "grid gap-6",
//                   viewMode === "grid"
//                     ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
//                     : "grid-cols-1"
//                 )}
//               >
//                 {enrichedProducts.map((product, index) => (
//                   <ProductCard key={product.id} product={product} index={index} />
//                 ))}
//               </div>
//             ) : (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20"
//               >
//                 <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30" />
//                 <div className="text-center">
//                   <p className="text-lg font-semibold">Aucun produit trouvé</p>
//                   <p className="mt-1 text-sm text-muted">
//                     Essayez de modifier vos filtres ou votre recherche
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSearchQuery("");
//                     handleSelectCategory(null);
//                     setPriceRange([0, 100000]);
//                   }}
//                   className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
//                 >
//                   Réinitialiser les filtres
//                 </button>
//               </motion.div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





















// /**
//  * ProductDetailClient — Page de détail produit connectée au backend Django DRF
//  *
//  * ┌─────────────────────────────────────────────────────────────────────────────┐
//  * │  Design System Kalvin — Premium Luxury Edition                              │
//  * │  ─────────────────────────────────────────────────────────────────────────  │
//  * │  Palette   : Forêt #1f4d3f · Or #c9a96e · Ambre #8b5e34 · Ivoire #faf7f2  │
//  * │  Layout    : Galerie sticky gauche · Panel info scrollable droite           │
//  * │  Motion    : Entrance stagger · Crossfade images · Spring modal             │
//  * │  Signature : Filet or sous le titre + galerie sticky + modale glassmorphic  │
//  * └─────────────────────────────────────────────────────────────────────────────┘
//  *
//  * Workflow :
//  *  - Stratégie 1 : GET /api/v1/catalog/products/?slug=... (prioritaire)
//  *  - Stratégie 2 : GET /api/v1/catalog/products/:id/     (fallback par ID)
//  *  - GET /api/v1/promotions/sales/active/                → ventes flash
//  *
//  * @module app/(storefront)/products/[slug]/ProductDetailClient
//  */

// "use client";

// import { useEffect, useMemo, useState, useCallback } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   motion,
//   AnimatePresence,
//   useReducedMotion,
//   type Variants,
// } from "framer-motion";
// import {
//   Check,
//   ChevronRight,
//   Heart,
//   Minus,
//   Plus,
//   ShoppingBag,
//   Star,
//   X,
//   Package,
//   Weight,
//   Layers,
//   ArrowRight,
//   Shield,
//   Truck,
//   RotateCcw,
//   Tag,
// } from "lucide-react";
// import { formatCurrency } from "@/lib/utils";
// import { useCartStore } from "@/store/pannierStore";
// import { useUIStore } from "@/store/uiStore";
// import { getPublicProductById, getPublicProducts } from "@/fonctions_api/produits.api";
// import { getActiveSales } from "@/fonctions_api/promotions.api";
// import { mediaUrl } from "@/lib/mediaUrl";
// import type { ProductDetail, ProductVariant, ProductList } from "@/modeles/produits";
// import type { Soldes } from "@/modeles/promotions";
// import Toast from "@/components/special/Toast";
// import LoadingSpinner from "@/components/special/LoadingSpinner";

// /* ═══════════════════════════════════════════════════════════════════════════════
//    TYPES
//    ═══════════════════════════════════════════════════════════════════════════════ */

// type Props = {
//   slug: string;
//   id?: string | null;
// };

// /* ═══════════════════════════════════════════════════════════════════════════════
//    VARIANTES D'ANIMATION — Centralisées, réutilisables, performantes
//    ═══════════════════════════════════════════════════════════════════════════════ */

// /**
//  * Bibliothèque d'animations Framer Motion partagées entre tous les sous-composants.
//  * Utiliser `prefersReducedMotion` pour passer `undefined` en prop `variants`
//  * quand l'utilisateur demande des animations réduites.
//  */
// const MOTION = {
//   /** Entrée fluide depuis la gauche — galerie */
//   slideInLeft: {
//     hidden: { opacity: 0, x: -28 },
//     show: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
//     },
//   } satisfies Variants,

//   /** Entrée fluide depuis la droite — panel info */
//   slideInRight: {
//     hidden: { opacity: 0, x: 28 },
//     show: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
//     },
//   } satisfies Variants,

//   /** Fondu vers le haut — états vide/erreur, section produits associés */
//   fadeUp: {
//     hidden: { opacity: 0, y: 22 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
//     },
//   } satisfies Variants,

//   /**
//    * Entrée du modal — spring physique pour un sentiment premium.
//    * Le mode "exit" est déclaré ici pour être utilisé avec AnimatePresence.
//    */
//   modalPanel: {
//     hidden: { opacity: 0, scale: 0.93, y: 28 },
//     show: {
//       opacity: 1,
//       scale: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 360, damping: 26, mass: 0.9 },
//     },
//     exit: {
//       opacity: 0,
//       scale: 0.96,
//       y: 14,
//       transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
//     },
//   } satisfies Variants,

//   /** Badge flottant sur l'image — glissé depuis la gauche avec délai */
//   badge: (delay: number): Variants => ({
//     hidden: { opacity: 0, x: -14 },
//     show: {
//       opacity: 1,
//       x: 0,
//       transition: { type: "spring", stiffness: 280, damping: 22, delay },
//     },
//   }),
// } as const;

// /* ═══════════════════════════════════════════════════════════════════════════════
//    UTILITAIRES
//    ═══════════════════════════════════════════════════════════════════════════════ */

// /**
//  * Formate un poids en grammes vers une représentation lisible.
//  * @example formatWeight(1500) → "1.5 kg"
//  * @example formatWeight(500)  → "500 g"
//  */
// function formatWeight(grams: number | null | undefined): string {
//   if (!grams) return "";
//   if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
//   return `${grams} g`;
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//    SOUS-COMPOSANT : PurchaseModal
//    ─ Modale de configuration d'achat : sélection variante + quantité + confirmation
//    ═══════════════════════════════════════════════════════════════════════════════ */

// type PurchaseModalProps = {
//   product: ProductDetail;
//   images: string[];
//   flashSale: Soldes | null;
//   onClose: () => void;
//   onConfirm: (
//     variantId: string | null,
//     variantName: string | null,
//     price: string,
//     quantity: number,
//     weight: number | null
//   ) => void;
// };

// function PurchaseModal({
//   product,
//   images,
//   flashSale,
//   onClose,
//   onConfirm,
// }: PurchaseModalProps) {
//   /* ── Dérivés ─────────────────────────────────────────────────────────────── */
//   const activeVariants = useMemo(
//     () => (product.variants ?? []).filter((v) => v.is_active),
//     [product.variants]
//   );
//   const hasVariants = activeVariants.length > 0;

//   /* ── État local ──────────────────────────────────────────────────────────── */
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
//     hasVariants ? activeVariants[0] : null
//   );
//   const [quantity, setQuantity] = useState(1);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   /* ── Dérivés calculés depuis la sélection ────────────────────────────────── */
//   const currentPrice = selectedVariant?.price ?? (flashSale?.sale_price ?? product.price);
//   const currentWeight = selectedVariant?.weight_grams ?? product.weight_grams;
//   const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
//   const isOutOfStock = currentStock === 0;
//   const totalPrice = parseFloat(currentPrice) * quantity;

//   const handleConfirm = () => {
//     onConfirm(
//       selectedVariant?.id ?? null,
//       selectedVariant?.name ?? null,
//       currentPrice,
//       quantity,
//       currentWeight
//     );
//   };

//   return (
//     <AnimatePresence>
//       {/* ── Backdrop ──────────────────────────────────────────────────────── */}
//       <motion.div
//         key="purchase-backdrop"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.22 }}
//         className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4"
//         onClick={onClose}
//       >
//         {/* ── Panel modal ───────────────────────────────────────────────── */}
//         <motion.div
//           key="purchase-modal"
//           variants={MOTION.modalPanel}
//           initial="hidden"
//           animate="show"
//           exit="exit"
//           onClick={(e) => e.stopPropagation()}
//           className="relative flex max-h-[96vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white sm:rounded-[28px]"
//           style={{
//             boxShadow:
//               "0 40px 100px rgba(0,0,0,0.24), 0 8px 28px rgba(0,0,0,0.10)",
//           }}
//         >
//           {/* Filet vert signature en haut du modal */}
//           <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[28px] bg-gradient-to-r from-transparent via-[#1f4d3f] to-transparent opacity-80" />

//           {/* Bouton fermeture */}
//           <motion.button
//             type="button"
//             onClick={onClose}
//             whileHover={{ scale: 1.08, backgroundColor: "#e8dfd0" }}
//             whileTap={{ scale: 0.92 }}
//             className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#f3ede4] text-[#5d6b58] transition-colors"
//             aria-label="Fermer"
//           >
//             <X className="h-4 w-4" />
//           </motion.button>

//           {/* ── En-tête : vignette + identité produit ─────────────────────── */}
//           <div className="flex shrink-0 items-center gap-4 border-b border-[#f0e8dc] bg-[#faf7f2] px-5 py-4 sm:px-6 sm:py-5">
//             {/* Vignette produit */}
//             <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white shadow-sm">
//               {images[0] ? (
//                 <Image
//                   src={images[0]}
//                   alt={product.name}
//                   fill
//                   className="object-cover"
//                   sizes="64px"
//                 />
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center">
//                   <Package className="h-6 w-6 text-[#c4b59b]" />
//                 </div>
//               )}
//             </div>

//             {/* Titre + catégorie */}
//             <div className="min-w-0 flex-1 pr-10">
//               <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#c9a96e]">
//                 {product.category?.name ?? "Produit"}
//               </p>
//               <h3 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-[#0e1f19] sm:text-lg">
//                 {product.name}
//               </h3>
//               {product.weight_grams && !hasVariants && (
//                 <span className="mt-1 flex items-center gap-1 text-xs text-[#8a9086]">
//                   <Weight className="h-3 w-3" />
//                   {formatWeight(product.weight_grams)}
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* ── Corps scrollable ──────────────────────────────────────────── */}
//           <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#e8dfd0]">

//             {/* ── Sélecteur de variantes ──────────────────────────────────── */}
//             {hasVariants && (
//               <div>
//                 <div className="mb-3 flex items-center gap-2">
//                   <Layers className="h-3.5 w-3.5 text-[#c9a96e]" />
//                   <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d6b58]">
//                     Choisir une variante
//                   </label>
//                 </div>

//                 {/* Dropdown si > 4 variantes */}
//                 {activeVariants.length > 4 ? (
//                   <div className="relative">
//                     <button
//                       type="button"
//                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                       className="flex w-full items-center justify-between rounded-2xl border-2 border-[#e8dfd0] bg-white px-4 py-3.5 text-left transition-all hover:border-[#1f4d3f]/40 focus:border-[#1f4d3f] focus:outline-none"
//                     >
//                       {selectedVariant ? (
//                         <div className="flex-1">
//                           <p className="text-sm font-bold text-[#0e1f19]">
//                             {selectedVariant.name}
//                           </p>
//                           <div className="mt-1 flex items-center gap-2">
//                             {selectedVariant.weight_grams && (
//                               <span className="flex items-center gap-1 rounded-md bg-[#f3ede4] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#8b5e34]">
//                                 <Weight className="h-2.5 w-2.5" />
//                                 {formatWeight(selectedVariant.weight_grams)}
//                               </span>
//                             )}
//                             <span className="text-sm font-black text-[#1f4d3f]">
//                               {formatCurrency(selectedVariant.price, "FCFA")}
//                             </span>
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-sm text-[#8a9086]">
//                           Sélectionner une variante
//                         </span>
//                       )}
//                       <ChevronRight
//                         className={`h-4 w-4 text-[#c9a96e] transition-transform duration-300 ${isDropdownOpen ? "rotate-90" : "rotate-0"
//                           }`}
//                       />
//                     </button>

//                     <AnimatePresence>
//                       {isDropdownOpen && (
//                         <motion.div
//                           initial={{ opacity: 0, y: -8 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -8 }}
//                           transition={{ duration: 0.18, ease: "easeOut" }}
//                           className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-[#e8dfd0] bg-white p-1.5 shadow-[0_20px_48px_rgba(0,0,0,0.14)] scrollbar-hide"
//                         >
//                           {activeVariants.map((variant) => {
//                             const isSelected = selectedVariant?.id === variant.id;
//                             const variantOutOfStock = variant.stock === 0;
//                             return (
//                               <button
//                                 key={variant.id}
//                                 type="button"
//                                 onClick={() => {
//                                   if (!variantOutOfStock) {
//                                     setSelectedVariant(variant);
//                                     setIsDropdownOpen(false);
//                                   }
//                                 }}
//                                 disabled={variantOutOfStock}
//                                 className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${isSelected
//                                     ? "bg-[#f2f7f5] text-[#1f4d3f]"
//                                     : variantOutOfStock
//                                       ? "cursor-not-allowed opacity-40"
//                                       : "hover:bg-[#faf7f2]"
//                                   }`}
//                               >
//                                 <div>
//                                   <p className="text-sm font-bold">{variant.name}</p>
//                                   <div className="mt-0.5 flex items-center gap-2">
//                                     {variant.weight_grams && (
//                                       <span className="text-[10px] text-[#8a9086]">
//                                         {formatWeight(variant.weight_grams)}
//                                       </span>
//                                     )}
//                                     <span className="text-xs font-black text-[#1f4d3f]">
//                                       {formatCurrency(variant.price, "FCFA")}
//                                     </span>
//                                   </div>
//                                 </div>
//                                 {isSelected && (
//                                   <Check className="h-4 w-4 text-[#1f4d3f]" />
//                                 )}
//                                 {variantOutOfStock && (
//                                   <span className="text-[10px] font-bold text-red-500">
//                                     Rupture
//                                   </span>
//                                 )}
//                               </button>
//                             );
//                           })}
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 ) : (
//                   /* Grille de cartes si ≤ 4 variantes */
//                   <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
//                     {activeVariants.map((variant) => {
//                       const isSelected = selectedVariant?.id === variant.id;
//                       const variantOutOfStock = variant.stock === 0;
//                       return (
//                         <motion.button
//                           key={variant.id}
//                           type="button"
//                           onClick={() =>
//                             !variantOutOfStock && setSelectedVariant(variant)
//                           }
//                           disabled={variantOutOfStock}
//                           whileHover={!variantOutOfStock ? { y: -2 } : undefined}
//                           whileTap={!variantOutOfStock ? { scale: 0.98 } : undefined}
//                           transition={{ type: "spring", stiffness: 320, damping: 22 }}
//                           className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 ${isSelected
//                               ? "border-[#1f4d3f] bg-[#f2f7f5] shadow-[0_4px_16px_rgba(31,77,63,0.16)]"
//                               : variantOutOfStock
//                                 ? "cursor-not-allowed border-[#e8dfd0] opacity-40"
//                                 : "border-[#e8dfd0] bg-white hover:border-[#1f4d3f]/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
//                             }`}
//                         >
//                           {/* Check sélectionné */}
//                           {isSelected && (
//                             <motion.div
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               transition={{ type: "spring", stiffness: 400 }}
//                               className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f4d3f]"
//                             >
//                               <Check className="h-3 w-3 text-white" />
//                             </motion.div>
//                           )}

//                           <p className="pr-7 text-sm font-bold text-[#0e1f19]">
//                             {variant.name}
//                           </p>
//                           <div className="mt-2 flex flex-col gap-1.5">
//                             {variant.weight_grams && (
//                               <span
//                                 className={`w-fit flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-colors ${isSelected
//                                     ? "bg-[#1f4d3f]/10 text-[#1f4d3f]"
//                                     : "bg-[#f3ede4] text-[#8b5e34]"
//                                   }`}
//                               >
//                                 <Weight className="h-2.5 w-2.5" />
//                                 {formatWeight(variant.weight_grams)}
//                               </span>
//                             )}
//                             <span className="text-lg font-black tracking-tight text-[#1f4d3f]">
//                               {formatCurrency(variant.price, "FCFA")}
//                             </span>
//                           </div>

//                           {variantOutOfStock && (
//                             <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
//                               <X className="h-3 w-3" /> Indisponible
//                             </span>
//                           )}
//                         </motion.button>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── Bloc prix actif + total ──────────────────────────────────── */}
//             <div className="overflow-hidden rounded-2xl border border-[#e8dfd0] bg-[#faf7f2]">
//               <div className="flex items-center justify-between px-5 py-4">
//                 <div>
//                   <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8a9086]">
//                     Prix unitaire
//                   </p>
//                   <p className="mt-1 text-2xl font-black tracking-tight text-[#1f4d3f] sm:text-3xl">
//                     {formatCurrency(currentPrice, "FCFA")}
//                   </p>
//                   {currentWeight && (
//                     <span className="mt-1 flex items-center gap-1 text-xs text-[#8a9086]">
//                       <Weight className="h-3 w-3" />
//                       {formatWeight(currentWeight)}
//                     </span>
//                   )}
//                 </div>

//                 {/* Total animé si quantité > 1 */}
//                 <AnimatePresence>
//                   {quantity > 1 && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.85, x: 12 }}
//                       animate={{ opacity: 1, scale: 1, x: 0 }}
//                       exit={{ opacity: 0, scale: 0.85, x: 12 }}
//                       transition={{ type: "spring", stiffness: 320, damping: 22 }}
//                       className="text-right"
//                     >
//                       <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8a9086]">
//                         Total
//                       </p>
//                       <p className="mt-1 text-2xl font-black tracking-tight text-[#c9a96e] sm:text-3xl">
//                         {formatCurrency(totalPrice, "FCFA")}
//                       </p>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>

//             {/* ── Sélecteur de quantité ───────────────────────────────────── */}
//             <div>
//               <label className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d6b58]">
//                 Quantité
//               </label>
//               <div className="flex items-center gap-4">
//                 {/* Compteur +/- */}
//                 <div className="flex items-center overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white">
//                   <button
//                     type="button"
//                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                     disabled={isOutOfStock || quantity <= 1}
//                     className="flex h-12 w-12 items-center justify-center text-[#5d6b58] transition-colors hover:bg-[#f3ede4] hover:text-[#1f4d3f] disabled:cursor-not-allowed disabled:opacity-40"
//                   >
//                     <Minus className="h-4 w-4" />
//                   </button>
//                   <span className="flex h-12 w-14 items-center justify-center border-x border-[#e8dfd0] text-center text-lg font-black tabular-nums text-[#0e1f19]">
//                     {quantity}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setQuantity(Math.min(currentStock, quantity + 1))
//                     }
//                     disabled={isOutOfStock || quantity >= currentStock}
//                     className="flex h-12 w-12 items-center justify-center text-[#5d6b58] transition-colors hover:bg-[#f3ede4] hover:text-[#1f4d3f] disabled:cursor-not-allowed disabled:opacity-40"
//                   >
//                     <Plus className="h-4 w-4" />
//                   </button>
//                 </div>

//                 {/* Info stock avec couleur contextuelle */}
//                 <span
//                   className={`text-sm font-semibold ${currentStock === 0
//                       ? "text-red-500"
//                       : currentStock < 5
//                         ? "text-amber-600"
//                         : "text-[#5d6b58]"
//                     }`}
//                 >
//                   {currentStock > 0
//                     ? `${currentStock} disponible${currentStock > 1 ? "s" : ""}`
//                     : "Indisponible"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* ── Pied de modal : CTA ───────────────────────────────────────── */}
//           <div className="shrink-0 border-t border-[#f0e8dc] bg-[#faf7f2] px-5 py-4 sm:px-6">
//             <motion.button
//               type="button"
//               disabled={isOutOfStock}
//               onClick={handleConfirm}
//               whileHover={!isOutOfStock ? { scale: 1.015 } : undefined}
//               whileTap={!isOutOfStock ? { scale: 0.985 } : undefined}
//               className="relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#1f4d3f] px-6 py-4 text-sm font-bold text-white transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
//               style={{
//                 boxShadow: isOutOfStock
//                   ? "none"
//                   : "0 10px 30px rgba(31,77,63,0.34)",
//               }}
//             >
//               <ShoppingBag className="h-5 w-5 shrink-0" />
//               {isOutOfStock
//                 ? "Produit indisponible"
//                 : `Ajouter au panier · ${formatCurrency(totalPrice, "FCFA")}`}
//             </motion.button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//    SOUS-COMPOSANT : RelatedProductCard
//    ─ Carte produit associé avec hover lift et image zoom
//    ═══════════════════════════════════════════════════════════════════════════════ */

// function RelatedProductCard({ product }: { product: ProductList }) {
//   /* Résolution de l'image compatible avec les deux formes de `primary_image` */
//   const imgSrc =
//     typeof product.primary_image === "object" && product.primary_image
//       ? mediaUrl(product.primary_image.image)
//       : typeof product.primary_image === "string"
//         ? mediaUrl(product.primary_image)
//         : null;

//   return (
//     <motion.div
//       whileHover={{ y: -4 }}
//       transition={{ type: "spring", stiffness: 300, damping: 22 }}
//     >
//       <Link
//         onClick={() => useUIStore.getState().setActiveProductId(product.id)}
//         href={`/products/${product.slug}`}
//         className="group block w-48 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white transition-all duration-300 hover:border-[#c9a96e]/40 hover:shadow-[0_14px_36px_rgba(0,0,0,0.10)]"
//       >
//         {/* Zone image */}
//         <div className="relative aspect-square overflow-hidden bg-[#f3ede4]">
//           {imgSrc ? (
//             <Image
//               src={imgSrc}
//               alt={product.name}
//               fill
//               className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
//               sizes="192px"
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center">
//               <Package className="h-8 w-8 text-[#c4b59b]" />
//             </div>
//           )}
//           {/* Voile hover vert très subtil */}
//           <div className="absolute inset-0 bg-[#1f4d3f] opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]" />
//         </div>

//         {/* Infos */}
//         <div className="p-3.5">
//           <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a96e]">
//             {product.category_name}
//           </p>
//           <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#0e1f19] transition-colors group-hover:text-[#1f4d3f]">
//             {product.name}
//           </h4>
//           <p className="mt-2 text-base font-black tracking-tight text-[#1f4d3f]">
//             {formatCurrency(product.price, "FCFA")}
//           </p>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════════
//    COMPOSANT PRINCIPAL : ProductDetailClient
//    ═══════════════════════════════════════════════════════════════════════════════ */

// export default function ProductDetailClient({ slug, id }: Props) {
//   const activeProductId = useUIStore((state) => state.activeProductId);
//   const prefersReducedMotion = useReducedMotion();

//   /* ── État ─────────────────────────────────────────────────────────────────── */
//   const [product, setProduct] = useState<ProductDetail | null>(null);
//   const [flashSale, setFlashSale] = useState<Soldes | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<{ title: string; message: string } | null>(
//     null
//   );
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
//   const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

//   const addItem = useCartStore((state) => state.addItem);

//   /* ── Toast ────────────────────────────────────────────────────────────────── */
//   const [toast, setToast] = useState<{
//     show: boolean;
//     type: "success" | "error" | "info";
//     message: string;
//   }>({ show: false, type: "info", message: "" });

//   /* ── Chargement du produit ────────────────────────────────────────────────── */
//   useEffect(() => {
//     let active = true;

//     async function loadProduct() {
//       try {
//         setLoading(true);
//         setError(null);

//         // ── Stratégie 1 : par slug (prioritaire) ──────────────────────────
//         const slugRes = await getPublicProducts({ slug });
//         let resolvedProduct: ProductDetail | null = null;

//         if (slugRes.ok && slugRes.data) {
//           const items = Array.isArray(slugRes.data)
//             ? slugRes.data
//             : (slugRes.data as any).results;
//           if (items && items.length > 0) {
//             resolvedProduct = items[0] as unknown as ProductDetail;
//           }
//         }

//         // ── Stratégie 2 : fallback par ID ────────────────────────────────
//         if (!resolvedProduct) {
//           const productId = id || activeProductId;
//           if (productId) {
//             const detailRes = await getPublicProductById(productId);
//             if (detailRes.ok) resolvedProduct = detailRes.data;
//           }
//         }

//         const salesRes = await getActiveSales();

//         if (!active) return;
//         if (!resolvedProduct) throw new Error("404");

//         setProduct(resolvedProduct);
//         setSelectedImage(0);

//         if (salesRes.ok) {
//           const sale = salesRes.data.find((s) => s.product_slug === slug);
//           setFlashSale(sale || null);
//         } else {
//           setFlashSale(null);
//         }
//       } catch (err) {
//         if (!active) return;
//         const errMsg = err instanceof Error ? err.message : "Erreur inconnue.";

//         if (errMsg.includes("500") || errMsg.includes("Internal Server Error")) {
//           setError({
//             title: "Erreur serveur",
//             message:
//               "Une erreur inattendue s'est produite. Notre équipe a été alertée. Veuillez réessayer.",
//           });
//         } else if (errMsg.includes("404") || errMsg.includes("Not Found")) {
//           setError({
//             title: "Produit introuvable",
//             message:
//               "Ce produit n'est plus disponible ou a été retiré du catalogue.",
//           });
//         } else if (
//           errMsg.includes("Network Error") ||
//           errMsg.includes("Failed to fetch") ||
//           errMsg.includes("502")
//         ) {
//           setError({
//             title: "Connexion impossible",
//             message:
//               "Impossible de joindre le serveur. Vérifiez votre connexion internet.",
//           });
//         } else {
//           setError({ title: "Erreur", message: errMsg });
//         }
//         setProduct(null);
//       } finally {
//         if (active) setLoading(false);
//       }
//     }

//     loadProduct();
//     return () => {
//       active = false;
//     };
//   }, [slug]);

//   /* ── Résolution des images ────────────────────────────────────────────────── */
//   const images = useMemo(() => {
//     if (!product) return [];
//     const gallery = (product.images ?? [])
//       .map((img) => mediaUrl(img.image))
//       .filter(Boolean) as string[];
//     if (gallery.length > 0) return gallery;
//     const fallback =
//       product.primary_image ||
//       product.image ||
//       product.image_url ||
//       product.thumbnail;
//     const resolved = mediaUrl(fallback);
//     return resolved ? [resolved] : [];
//   }, [product]);

//   /* ── Dérivés produit ──────────────────────────────────────────────────────── */
//   const categoryName = product?.category?.name || "Catalogue";
//   const displayPrice = flashSale?.sale_price ?? product?.price ?? "0";
//   const comparePrice = flashSale ? product?.price : null;
//   const hasDiscount =
//     flashSale !== null &&
//     Number(displayPrice) < Number(product?.price ?? 0);
//   const isOutOfStock = product ? product.stock === 0 : false;

//   const activeVariants = useMemo(
//     () => (product?.variants ?? []).filter((v) => v.is_active),
//     [product?.variants]
//   );

//   const variantPriceRange = useMemo(() => {
//     if (activeVariants.length === 0) return null;
//     const prices = activeVariants.map((v) => parseFloat(v.price));
//     return { min: Math.min(...prices), max: Math.max(...prices) };
//   }, [activeVariants]);

//   /* ── Handler d'ajout au panier ───────────────────────────────────────────── */
//   const handleAddToCart = useCallback(
//     (
//       variantId: string | null,
//       variantName: string | null,
//       price: string,
//       quantity: number,
//       weight: number | null
//     ) => {
//       if (!product) return;

//       if (quantity > (product.stock || 0) && !variantId) {
//         setToast({
//           show: true,
//           type: "error",
//           message: "Stock insuffisant pour la quantité demandée.",
//         });
//         return;
//       }

//       addItem({
//         productId: product.id,
//         variantId,
//         name: variantName
//           ? `${product.name} — ${variantName}`
//           : product.name,
//         sku: product.sku,
//         price,
//         compareAtPrice: comparePrice!,
//         image: images[0] ?? null,
//         quantity,
//         maxStock: Math.max(product.stock, 1),
//         currency: "FCFA",
//         slug: product.slug ?? "",
//       });

//       setIsPurchaseModalOpen(false);
//       setToast({
//         show: true,
//         type: "success",
//         message: variantName
//           ? `${product.name} — ${variantName} (×${quantity}) ajouté au panier`
//           : `${product.name} (×${quantity}) ajouté au panier`,
//       });
//     },
//     [product, addItem, comparePrice, images]
//   );

//   /* ════════════════════════════════════════════════════════════════════════════
//      RENDU
//      ════════════════════════════════════════════════════════════════════════════ */
//   return (
//     <main className="min-h-screen bg-[#faf7f2] text-[#0e1f19]">

//       {/* Toast de notification */}
//       <Toast
//         show={toast.show}
//         type={toast.type}
//         message={toast.message}
//         onClose={() => setToast({ ...toast, show: false })}
//         duration={4000}
//       />

//       {/* Modale d'achat */}
//       {isPurchaseModalOpen && product && (
//         <PurchaseModal
//           product={product}
//           images={images}
//           flashSale={flashSale}
//           onClose={() => setIsPurchaseModalOpen(false)}
//           onConfirm={handleAddToCart}
//         />
//       )}

//       {/* ── Fil d'Ariane ──────────────────────────────────────────────────────── */}
//       <div className="border-b border-[#e8dfd0]/60 bg-white/70 backdrop-blur-md">
//         <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3.5 text-xs sm:px-6">
//           <Link
//             href="/"
//             className="text-[#8a9086] transition-colors hover:text-[#1f4d3f]"
//           >
//             Accueil
//           </Link>
//           <ChevronRight className="h-3 w-3 shrink-0 text-[#c4b59b]" />
//           <Link
//             href="/products"
//             className="text-[#8a9086] transition-colors hover:text-[#1f4d3f]"
//           >
//             Boutique
//           </Link>
//           <ChevronRight className="h-3 w-3 shrink-0 text-[#c4b59b]" />
//           <span className="max-w-[180px] truncate font-semibold text-[#0e1f19] sm:max-w-xs">
//             {product?.name ?? slug}
//           </span>
//         </div>
//       </div>

//       <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

//         {/* ── État : chargement ─────────────────────────────────────────────── */}
//         {loading && (
//           <div className="flex min-h-[60vh] items-center justify-center">
//             <LoadingSpinner size="lg" variant="luxury" label="Chargement du produit" />
//           </div>
//         )}

//         {/* ── État : erreur ou produit manquant ─────────────────────────────── */}
//         {!loading && (error || !product) && (
//           <motion.div
//             variants={MOTION.fadeUp}
//             initial="hidden"
//             animate="show"
//             className="flex flex-col items-center justify-center gap-8 rounded-3xl border border-[#e8dfd0] bg-white px-8 py-24 text-center"
//             style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
//           >
//             {/* Icône décorative concentriques */}
//             <div className="relative flex h-24 w-24 items-center justify-center">
//               <div className="absolute inset-0 rounded-full bg-[#f3ede4] opacity-70" />
//               <div className="absolute inset-4 rounded-full bg-[#e8dfd0] opacity-60" />
//               <Package className="relative h-10 w-10 text-[#c4b59b]" />
//             </div>

//             <div>
//               <p className="text-xl font-bold text-[#0e1f19]">
//                 {error?.title ?? "Produit introuvable"}
//               </p>
//               <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#8a9086]">
//                 {error?.message ??
//                   "Ce produit n'est plus disponible ou a été retiré du catalogue."}
//               </p>
//             </div>

//             <Link
//               href="/products"
//               className="group flex items-center gap-2.5 rounded-2xl bg-[#1f4d3f] px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(31,77,63,0.28)] transition-shadow hover:shadow-[0_12px_32px_rgba(31,77,63,0.36)]"
//             >
//               Retour au catalogue
//               <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
//             </Link>
//           </motion.div>
//         )}

//         {/* ── État : produit chargé ─────────────────────────────────────────── */}
//         {!loading && !error && product && (
//           <div className="space-y-16">

//             {/* ════════════════════════════════════════════════════════════════
//                 GRILLE PRINCIPALE : Galerie + Panel info
//                 ════════════════════════════════════════════════════════════════ */}
//             <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">

//               {/* ──────────────────────────────────────────────────────────────
//                   COLONNE GAUCHE — Galerie d'images (sticky sur desktop)
//                   ────────────────────────────────────────────────────────────── */}
//               <motion.div
//                 variants={
//                   !prefersReducedMotion ? MOTION.slideInLeft : undefined
//                 }
//                 initial="hidden"
//                 animate="show"
//                 className="space-y-4 lg:sticky lg:top-24 lg:self-start"
//               >
//                 {/* ── Image principale ──────────────────────────────────── */}
//                 <div
//                   className="group relative aspect-square overflow-hidden rounded-3xl border border-[#e8dfd0] bg-white"
//                   style={{
//                     boxShadow: "0 24px 64px rgba(14,31,25,0.10)",
//                   }}
//                 >
//                   <AnimatePresence mode="wait">
//                     {images[selectedImage] && !failedImages.has(selectedImage) ? (
//                       <motion.div
//                         key={selectedImage}
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.3, ease: "easeInOut" }}
//                         className="relative h-full w-full"
//                       >
//                         <Image
//                           src={images[selectedImage]}
//                           alt={product.name}
//                           fill
//                           className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
//                           sizes="(max-width: 1024px) 100vw, 50vw"
//                           priority
//                           onError={() => {
//                             setFailedImages((prev) =>
//                               new Set(prev).add(selectedImage)
//                             );
//                           }}
//                         />
//                         {/* Voile très subtil au hover */}
//                         <div className="absolute inset-0 bg-[#0e1f19] opacity-0 transition-opacity duration-500 group-hover:opacity-[0.025]" />
//                       </motion.div>
//                     ) : (
//                       <motion.div
//                         key="fallback"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="flex h-full items-center justify-center bg-[#f3ede4]"
//                       >
//                         <Package className="h-16 w-16 text-[#c4b59b]" />
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Badges flottants (promotion + tendance) */}
//                   <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
//                     {hasDiscount && flashSale && (
//                       <motion.span
//                         variants={MOTION.badge(0.4)}
//                         initial="hidden"
//                         animate="show"
//                         className="flex items-center gap-1.5 rounded-full bg-[#ef8219] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white"
//                         style={{
//                           boxShadow: "0 4px 14px rgba(239,130,25,0.45)",
//                         }}
//                       >
//                         <Tag className="h-3 w-3" />
//                         -{flashSale.discount_percent}%
//                       </motion.span>
//                     )}
//                     {product.is_top && (
//                       <motion.span
//                         variants={MOTION.badge(hasDiscount ? 0.5 : 0.4)}
//                         initial="hidden"
//                         animate="show"
//                         className="flex items-center gap-1.5 rounded-full bg-[#1f4d3f] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white"
//                         style={{
//                           boxShadow: "0 4px 14px rgba(31,77,63,0.45)",
//                         }}
//                       >
//                         <Star className="h-3 w-3 fill-[#c9a96e] text-[#c9a96e]" />
//                         Tendance
//                       </motion.span>
//                     )}
//                   </div>

//                   {/* Overlay rupture de stock sur l'image */}
//                   {isOutOfStock && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
//                       <span className="rounded-full bg-white/92 px-6 py-2.5 text-sm font-bold text-red-600 shadow-lg">
//                         Rupture de stock
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* ── Bande de miniatures ───────────────────────────────── */}
//                 {images.length > 1 && (
//                   <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
//                     {images.map((img, index) => {
//                       if (failedImages.has(index)) return null;
//                       return (
//                         <motion.button
//                           key={`${img}-${index}`}
//                           type="button"
//                           onClick={() => setSelectedImage(index)}
//                           whileHover={{ scale: 1.04 }}
//                           whileTap={{ scale: 0.96 }}
//                           transition={{
//                             type: "spring",
//                             stiffness: 340,
//                             damping: 20,
//                           }}
//                           className={`relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 ${selectedImage === index
//                               ? "border-[#1f4d3f] shadow-[0_4px_14px_rgba(31,77,63,0.22)]"
//                               : "border-[#e8dfd0] hover:border-[#c9a96e]/60"
//                             }`}
//                         >
//                           <Image
//                             src={img}
//                             alt={`Vue ${index + 1}`}
//                             fill
//                             className="object-cover"
//                             sizes="80px"
//                             onError={() => {
//                               setFailedImages((prev) =>
//                                 new Set(prev).add(index)
//                               );
//                               if (selectedImage === index) {
//                                 const valid = images
//                                   .map((_, i) => i)
//                                   .filter(
//                                     (i) =>
//                                       i !== index && !failedImages.has(i)
//                                   );
//                                 if (valid.length > 0) setSelectedImage(valid[0]);
//                               }
//                             }}
//                           />
//                           {/* Voile indicateur actif */}
//                           {selectedImage === index && (
//                             <div className="absolute inset-0 bg-[#1f4d3f]/6" />
//                           )}
//                         </motion.button>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {/* ── Grille des variantes sous la galerie ──────────────── */}
//                 {activeVariants.length > 0 && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 12 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
//                   >
//                     <div className="mb-3 flex items-center gap-2">
//                       <Layers className="h-3.5 w-3.5 text-[#c9a96e]" />
//                       <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5d6b58]">
//                         {activeVariants.length} variante
//                         {activeVariants.length > 1 ? "s" : ""} disponible
//                         {activeVariants.length > 1 ? "s" : ""}
//                       </h3>
//                     </div>

//                     <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
//                       {activeVariants.map((variant) => (
//                         <div
//                           key={variant.id}
//                           className="group relative overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white p-3.5 transition-all duration-300 hover:border-[#c9a96e]/50 hover:shadow-[0_6px_20px_rgba(201,169,110,0.14)]"
//                         >
//                           <p className="truncate text-xs font-bold text-[#0e1f19]">
//                             {variant.name}
//                           </p>
//                           <div className="mt-2 flex flex-col gap-1.5">
//                             {variant.weight_grams && (
//                               <span className="flex w-fit items-center gap-1 rounded-md bg-[#f3ede4] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#8b5e34]">
//                                 <Weight className="h-2.5 w-2.5" />
//                                 {formatWeight(variant.weight_grams)}
//                               </span>
//                             )}
//                             <span className="text-base font-black tracking-tight text-[#1f4d3f]">
//                               {formatCurrency(variant.price, "FCFA")}
//                             </span>
//                           </div>
//                           {variant.stock === 0 && (
//                             <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
//                               <X className="h-3 w-3" /> Indisponible
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>

//               {/* ──────────────────────────────────────────────────────────────
//                   COLONNE DROITE — Informations produit
//                   ────────────────────────────────────────────────────────────── */}
//               <motion.div
//                 variants={
//                   !prefersReducedMotion ? MOTION.slideInRight : undefined
//                 }
//                 initial="hidden"
//                 animate="show"
//                 className="space-y-7"
//               >
//                 {/* ── Catégorie + Titre + Ligne or (signature) ─────────── */}
//                 <div>
//                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9a96e]">
//                     {categoryName}
//                   </p>
//                   <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[#0e1f19] lg:text-4xl">
//                     {product.name}
//                   </h1>
//                   {/* Filet or — signature visuelle premium */}
//                   <motion.div
//                     className="mt-3 h-[2px] rounded-full bg-[#c9a96e]"
//                     initial={{ width: 0 }}
//                     animate={{ width: "4rem" }}
//                     transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//                   />

//                   {/* ── Étoiles de notation + favoris ──────────────────── */}
//                   <div className="mt-4 flex flex-wrap items-center gap-3">
//                     <div className="flex items-center gap-0.5">
//                       {[1, 2, 3, 4, 5].map((star) => (
//                         <Star
//                           key={star}
//                           className={`h-4 w-4 ${star <=
//                               Math.round(parseFloat(product.note_produit || "0"))
//                               ? "fill-[#c9a96e] text-[#c9a96e]"
//                               : "fill-[#e8dfd0] text-[#e8dfd0]"
//                             }`}
//                         />
//                       ))}
//                     </div>
//                     {parseFloat(product.note_produit) > 0 ? (
//                       <span className="text-sm font-semibold text-[#5d6b58]">
//                         {parseFloat(product.note_produit).toFixed(1)}
//                         <span className="ml-1 font-normal text-[#8a9086]">
//                           ({product.count_ratings} avis)
//                         </span>
//                       </span>
//                     ) : (
//                       <span className="text-sm text-[#8a9086]">Aucun avis</span>
//                     )}
//                     {product.count_favorites > 0 && (
//                       <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-500">
//                         <Heart className="h-3 w-3 fill-red-400 text-red-400" />
//                         {product.count_favorites}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* ── Bloc prix ─────────────────────────────────────────── */}
//                 <div className="overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white">
//                   <div className="px-5 py-5">
//                     {variantPriceRange ? (
//                       /* Gamme si variantes multiples */
//                       <>
//                         <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8a9086]">
//                           Gamme de prix
//                         </p>
//                         <div className="mt-1.5 flex items-baseline gap-2.5">
//                           <span className="text-3xl font-black tracking-tight text-[#1f4d3f]">
//                             {formatCurrency(variantPriceRange.min, "FCFA")}
//                           </span>
//                           {variantPriceRange.min !== variantPriceRange.max && (
//                             <>
//                               <span className="text-xl font-light text-[#c4b59b]">
//                                 —
//                               </span>
//                               <span className="text-3xl font-black tracking-tight text-[#1f4d3f]">
//                                 {formatCurrency(variantPriceRange.max, "FCFA")}
//                               </span>
//                             </>
//                           )}
//                         </div>
//                         <p className="mt-1 text-xs text-[#8a9086]">
//                           Prix selon la variante sélectionnée
//                         </p>
//                       </>
//                     ) : (
//                       /* Prix simple */
//                       <div className="flex flex-wrap items-baseline gap-3">
//                         <span className="text-3xl font-black tracking-tight text-[#1f4d3f] lg:text-4xl">
//                           {formatCurrency(displayPrice, "FCFA")}
//                         </span>
//                         {hasDiscount && comparePrice && (
//                           <span className="text-lg text-[#a89e8e] line-through">
//                             {formatCurrency(comparePrice, "FCFA")}
//                           </span>
//                         )}
//                         {flashSale && (
//                           <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-[#ef8219]">
//                             -{flashSale.discount_percent}%
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* ── Description produit ───────────────────────────────── */}
//                 {product.description && (
//                   <div>
//                     <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#5d6b58]">
//                       Description
//                     </h2>
//                     <p className="text-[15px] leading-7 text-[#586657]">
//                       {product.description}
//                     </p>
//                   </div>
//                 )}

//                 {/* ── Grille d'informations produit ─────────────────────── */}
//                 <div className="grid grid-cols-2 gap-2.5">
//                   {/* Stock */}
//                   <div className="rounded-2xl border border-[#e8dfd0] bg-white px-4 py-3.5">
//                     <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8a9086]">
//                       Stock
//                     </p>
//                     <div className="mt-1.5 flex items-center gap-2">
//                       <span
//                         className={`h-2 w-2 shrink-0 rounded-full ${isOutOfStock ? "bg-red-400" : "bg-emerald-400"
//                           }`}
//                       />
//                       <span
//                         className={`text-sm font-bold ${isOutOfStock ? "text-red-600" : "text-[#1f4d3f]"
//                           }`}
//                       >
//                         {isOutOfStock
//                           ? "Indisponible"
//                           : `${product.stock} en stock`}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Poids (conditionnel) */}
//                   {product.weight_grams ? (
//                     <div className="rounded-2xl border border-[#e8dfd0] bg-white px-4 py-3.5">
//                       <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8a9086]">
//                         Poids
//                       </p>
//                       <p className="mt-1.5 text-sm font-bold text-[#0e1f19]">
//                         {formatWeight(product.weight_grams)}
//                       </p>
//                     </div>
//                   ) : null}

//                   {/* Type produit */}
//                   <div className="rounded-2xl border border-[#e8dfd0] bg-white px-4 py-3.5">
//                     <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8a9086]">
//                       Type
//                     </p>
//                     <p className="mt-1.5 text-sm font-bold text-[#0e1f19]">
//                       {product.product_type === "RAW"
//                         ? "Brut"
//                         : product.product_type === "PROCESSED"
//                           ? "Transformé"
//                           : "Export"}
//                     </p>
//                   </div>

//                   {/* SKU */}
//                   <div className="rounded-2xl border border-[#e8dfd0] bg-white px-4 py-3.5">
//                     <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#8a9086]">
//                       Référence
//                     </p>
//                     <p className="mt-1.5 font-mono text-xs font-bold text-[#0e1f19]">
//                       {product.sku}
//                     </p>
//                   </div>
//                 </div>

//                 {/* ── Bouton CTA principal ──────────────────────────────── */}
//                 <motion.button
//                   type="button"
//                   disabled={isOutOfStock}
//                   onClick={() => setIsPurchaseModalOpen(true)}
//                   whileHover={
//                     !isOutOfStock && !prefersReducedMotion
//                       ? { scale: 1.015 }
//                       : undefined
//                   }
//                   whileTap={
//                     !isOutOfStock && !prefersReducedMotion
//                       ? { scale: 0.985 }
//                       : undefined
//                   }
//                   className="relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#1f4d3f] px-6 py-4.5 text-base font-bold text-white transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
//                   style={{
//                     boxShadow: isOutOfStock
//                       ? "none"
//                       : "0 16px 42px rgba(31,77,63,0.32)",
//                   }}
//                 >
//                   <ShoppingBag className="h-5 w-5 shrink-0" />
//                   {isOutOfStock
//                     ? "Produit indisponible"
//                     : "Configurer et ajouter au panier"}
//                 </motion.button>

//                 {/* ── Garanties ─────────────────────────────────────────── */}
//                 <div className="grid grid-cols-3 gap-2.5">
//                   {(
//                     [
//                       { Icon: Shield, label: "Paiement sécurisé" },
//                       { Icon: Truck, label: "Livraison rapide" },
//                       { Icon: RotateCcw, label: "Retour sous 7j" },
//                     ] as const
//                   ).map(({ Icon, label }) => (
//                     <div
//                       key={label}
//                       className="flex flex-col items-center gap-2 rounded-2xl border border-[#e8dfd0] bg-white px-2 py-3.5 text-center"
//                     >
//                       <Icon className="h-4 w-4 text-[#1f4d3f]" />
//                       <span className="text-[10px] font-semibold leading-tight text-[#8a9086]">
//                         {label}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>
//             </div>

//             {/* ════════════════════════════════════════════════════════════════
//                 SECTION : Produits associés
//                 — whileInView pour déclencher l'animation à l'entrée dans le viewport
//                 ════════════════════════════════════════════════════════════════ */}
//             {product.related_products && product.related_products.length > 0 && (
//               <motion.section
//                 variants={!prefersReducedMotion ? MOTION.fadeUp : undefined}
//                 initial="hidden"
//                 whileInView="show"
//                 viewport={{ once: true, margin: "-80px" }}
//               >
//                 {/* En-tête de section */}
//                 <div className="mb-6 flex items-end justify-between">
//                   <div>
//                     <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#c9a96e]">
//                       Sélection personnalisée
//                     </p>
//                     <h2 className="mt-1 text-2xl font-black text-[#0e1f19]">
//                       Vous aimerez aussi
//                     </h2>
//                   </div>
//                   <Link
//                     href="/products"
//                     className="group flex items-center gap-1.5 text-sm font-bold text-[#1f4d3f] transition-colors hover:text-[#c9a96e]"
//                   >
//                     Tout voir
//                     <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
//                   </Link>
//                 </div>

//                 {/* Carrousel horizontal */}
//                 <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
//                   {product.related_products.map((rp) => (
//                     <RelatedProductCard key={rp.id} product={rp} />
//                   ))}
//                 </div>
//               </motion.section>
//             )}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }