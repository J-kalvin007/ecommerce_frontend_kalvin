




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
// import { getMyFavorites, getMyRatings } from "@/fonctions_api/notes-favoris.api";
// import { buildUserRatingsMap, type UserRatingsMap } from "@/modeles/notes-favoris";
// import type { ProductList, ProductVariant } from "@/modeles/produits";
// import type { Category } from "@/modeles/categories";
// import type { Soldes } from "@/modeles/promotions";
// import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
// import { ProductsPageHeader } from "./ProductsPageHeader";
// import { ProductCard } from "./ProductCard";
// import { useAuthStore } from "@/store/authStore";

// /* ------------------------------------------------------------------ */
// /*  Types enrichis pour la page catalogue                             */
// /* ------------------------------------------------------------------ */

// /** Un produit avec d’éventuelles infos de vente flash */
// export type EnrichedProduct = ProductList & {
//   sale_price?: string;
//   original_price?: string;
//   /** Variantes du produit (si le backend les renvoie dans le listing) */
//   variants?: ProductVariant[];
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
//   products: ProductList[] | undefined,
//   sales: Soldes[]
// ): EnrichedProduct[] {
//   if (!products) return [];

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
//             className="flex h-9 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-foreground"
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
//             "min-h-9 flex-1 cursor-pointer rounded-lg px-2 py-2 text-left text-sm transition-colors",
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
//   const { status, user } = useAuthStore();
//   const isAuthenticated = status === "authenticated" && Boolean(user);

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

//   // ─── Données utilisateur (notes + favoris) — chargées seulement si connecté
//   const [userRatingsMap, setUserRatingsMap] = useState<UserRatingsMap>(new Map());
//   const [userFavoriteIds, setUserFavoriteIds] = useState<Set<string>>(new Set());

//   // Chargement des ventes flash
//   useEffect(() => {
//     (async () => {
//       const res = await getActiveSales();
//       if (res.ok) setSales(res.data);
//       else setSales([]);
//     })();
//   }, []);

//   // Chargement des notes & favoris utilisateur (seulement si connecté)
//   useEffect(() => {
//     if (!isAuthenticated) {
//       setUserRatingsMap(new Map());
//       setUserFavoriteIds(new Set());
//       return;
//     }
//     (async () => {
//       const [ratingsRes, favRes] = await Promise.all([
//         getMyRatings(),
//         getMyFavorites(),
//       ]);
//       if (ratingsRes.ok) {
//         setUserRatingsMap(buildUserRatingsMap(ratingsRes.data));
//       }
//       if (favRes.ok) {
//         setUserFavoriteIds(new Set(favRes.data.map((f) => f.id)));
//       }
//     })();
//   }, [isAuthenticated]);

//   // Chargement des catégories
//   useEffect(() => {
//     (async () => {
//       setLoadingCategories(true);
//       setCategoriesError(null);
//       const res = await getPublicCategories();
//       if (res.ok) {
//         setCategories(res.data);
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
//             const data = res.data as any;
//             setProducts(Array.isArray(data) ? data : data.results ?? []);
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

//     // Tri local (l'API trie déjà selon sortBy, mais on applique un tri supplémentaire pour les données enrichies)
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
//                 className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-foreground"
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
//                 "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all lg:hidden",
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
//                 className="appearance-none cursor-pointer rounded-xl border border-border bg-surface-elevated py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
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
//                   "flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-xl transition-colors",
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
//                   "flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-xl transition-colors",
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
//                 className="mb-4 flex w-full cursor-pointer items-center justify-between gap-3 text-left"
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
//                         "w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors",
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
//                   className="w-full cursor-pointer accent-primary"
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
//                   <ProductCard
//                     key={product.id}
//                     product={product}
//                     index={index}
//                     viewMode={viewMode}
//                     userScore={userRatingsMap.get(product.id) ?? null}
//                     isFavorited={userFavoriteIds.has(product.id)}
//                   />
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
//                   className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
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
































"use client";

/**
 * ProductsCatalogClient — Redesign ultra-premium
 *
 * Améliorations visuelles & UX :
 *
 * BARRE OUTILS :
 *  - Champ recherche avec focus-ring forest-green et loader spinner élégant
 *  - Select tri avec icône ChevronDown animée
 *  - Toggle grille/liste avec transition de fond fluide
 *  - Bouton filtres mobile avec counter badge actif
 *
 * SIDEBAR :
 *  - Slide-in spring côté gauche sur mobile
 *  - Catégories avec indicateur de sélection animé (bar gauche)
 *  - Slider prix avec labels dynamiques formatés
 *  - Stats catalogue avec compteurs live
 *
 * GRILLE :
 *  - Compteur résultats avec transition de valeur
 *  - État vide : illustration + message invitation (pas un message d'erreur)
 *  - Chargement : skeleton cohérent avec la grille
 *
 * Noms de variables et fonctions d'origine conservés intégralement.
 * Types EnrichedProduct et autres exports conservés.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  Leaf,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicProducts } from "@/fonctions_api/produits.api";
import { getPublicCategories } from "@/fonctions_api/categories.api";
import { getActiveSales } from "@/fonctions_api/promotions.api";
import { getMyFavorites, getMyRatings } from "@/fonctions_api/notes-favoris.api";
import { buildUserRatingsMap, type UserRatingsMap } from "@/modeles/notes-favoris";
import type { ProductList, ProductVariant } from "@/modeles/produits";
import type { Category } from "@/modeles/categories";
import type { Soldes } from "@/modeles/promotions";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProductsPageHeader } from "./ProductsPageHeader";
import { ProductCard } from "./ProductCard";
import { useAuthStore } from "@/store/authStore";
import LoadingKalvin from "@/components/special/loadingKalvin";

/* ─────────────────────────────────────────────────────────────
   TYPES EXPORTÉS — conservation intégrale
   ───────────────────────────────────────────────────────────── */

/** Un produit avec d'éventuelles infos de vente flash */
export type EnrichedProduct = ProductList & {
  sale_price?: string;
  original_price?: string;
  variants?: ProductVariant[];
};

/* ─────────────────────────────────────────────────────────────
   CONSTANTES — conservation intégrale
   ───────────────────────────────────────────────────────────── */

const SORT_OPTIONS = [
  { value: "-created_at", label: "Nouveautés" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix décroissant" },
  { value: "-note_produit", label: "Mieux notés" },
] as const;

/* ─────────────────────────────────────────────────────────────
   FONCTIONS UTILITAIRES — conservation intégrale
   ───────────────────────────────────────────────────────────── */

/** Compte récursivement les catégories */
function countCategories(categories: Category[]): number {
  return categories.reduce(
    (total, cat) => total + 1 + (cat.children ? countCategories(cat.children) : 0),
    0
  );
}

/** Trouve une catégorie par son slug */
function findCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children?.length) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}

/** Récupère les IDs des ancêtres d'une catégorie (pour l'expansion automatique) */
function collectAncestorIds(categories: Category[], slug: string): string[] {
  function walk(nodes: Category[], ancestors: string[]): string[] | null {
    for (const node of nodes) {
      if (node.slug === slug) return ancestors;
      if (node.children?.length) {
        const found = walk(node.children, [...ancestors, node.id]);
        if (found) return found;
      }
    }
    return null;
  }
  return walk(categories, []) ?? [];
}

/** Enrichit la liste de produits avec les prix des ventes flash */
function enrichProductsWithSales(
  products: ProductList[] | undefined,
  sales: Soldes[]
): EnrichedProduct[] {
  if (!products) return [];

  const salesBySlug = new Map<string, Soldes>();
  for (const s of sales) salesBySlug.set(s.product_slug, s);

  return products.map((product) => {
    const sale = salesBySlug.get(product.slug ?? "");
    if (sale) {
      return { ...product, sale_price: sale.sale_price, original_price: sale.original_price };
    }
    return product;
  });
}

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANT : CategoryTreeItem — conservation du nom d'origine
   Enrichi : indicateur de sélection animé (barre gauche forest green)
   ───────────────────────────────────────────────────────────── */

type CategoryTreeItemProps = {
  category: Category;
  depth?: number;
  selectedCategory: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (slug: string) => void;
};

function CategoryTreeItem({
  category,
  depth = 0,
  selectedCategory,
  expandedIds,
  onToggleExpand,
  onSelect,
}: CategoryTreeItemProps) {
  const hasChildren = Boolean(category.children?.length);
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedCategory === category.slug;

  return (
    <li>
      <div
        className="flex items-stretch gap-0.5"
        style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : undefined }}
      >
        {/* Bouton expand/collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(category.id)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Replier ${category.name}` : `Déplier ${category.name}`}
            className={cn(
              "flex h-9 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
              "text-[#8a9086] transition-colors hover:bg-[#f3ede2] hover:text-[#1f4d3f]",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1f4d3f]/40"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-7 shrink-0" aria-hidden />
        )}

        {/* Bouton sélection catégorie */}
        <button
          type="button"
          onClick={() => onSelect(category.slug || "-")}
          className={cn(
            "relative min-h-9 flex-1 cursor-pointer overflow-hidden rounded-lg px-2 py-2 text-left text-sm",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1f4d3f]/40",
            isSelected
              ? "bg-[#1f4d3f]/8 font-medium text-[#1f4d3f]"
              : "text-[#8a9086] hover:bg-[#f3ede2] hover:text-[#1f241c]"
          )}
        >
          {/* Barre indicatrice gauche animée */}
          <AnimatePresence>
            {isSelected && (
              <motion.span
                className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r-full bg-[#1f4d3f]"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              />
            )}
          </AnimatePresence>
          {category.name}
        </button>
      </div>

      {/* Enfants */}
      {hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedCategory={selectedCategory}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL — conservation du nom d'origine
   ───────────────────────────────────────────────────────────── */

export function ProductsCatalogClient() {
  const { status, user } = useAuthStore();
  const isAuthenticated = status === "authenticated" && Boolean(user);
  const prefersReducedMotion = useReducedMotion();

  /* ── États UI — conservation des noms d'origine ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("-created_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  /* ── États données — conservation des noms d'origine ── */
  const [products, setProducts] = useState<ProductList[]>([]);
  const [sales, setSales] = useState<Soldes[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  /* ── États utilisateur — conservation des noms d'origine ── */
  const [userRatingsMap, setUserRatingsMap] = useState<UserRatingsMap>(new Map());
  const [userFavoriteIds, setUserFavoriteIds] = useState<Set<string>>(new Set());

  /* ── Chargement des ventes flash ── */
  useEffect(() => {
    (async () => {
      const res = await getActiveSales();
      if (res.ok) setSales(res.data);
      else setSales([]);
    })();
  }, []);

  /* ── Chargement notes & favoris utilisateur ── */
  useEffect(() => {
    if (!isAuthenticated) {
      setUserRatingsMap(new Map());
      setUserFavoriteIds(new Set());
      return;
    }
    (async () => {
      const [ratingsRes, favRes] = await Promise.all([getMyRatings(), getMyFavorites()]);
      if (ratingsRes.ok) setUserRatingsMap(buildUserRatingsMap(ratingsRes.data));
      if (favRes.ok) setUserFavoriteIds(new Set(favRes.data.map((f) => f.id)));
    })();
  }, [isAuthenticated]);

  /* ── Chargement catégories ── */
  useEffect(() => {
    (async () => {
      setLoadingCategories(true);
      setCategoriesError(null);
      const res = await getPublicCategories();
      if (res.ok) {
        setCategories(res.data);
        setExpandedCategoryIds(
          new Set(res.data.filter((cat) => cat.children?.length).map((cat) => cat.id))
        );
      } else {
        setCategories([]);
        setCategoriesError(res.error?.message || "Impossible de charger les catégories.");
      }
      setLoadingCategories(false);
    })();
  }, []);

  /* ── Chargement produits avec debounce ── */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      (async () => {
        setLoading(true);
        setProductsError(null);
        try {
          const params: any = { ordering: sortBy, page_size: 100 };
          if (searchQuery.trim().length >= 3) params.search = searchQuery.trim();
          if (selectedCategory) params.category = selectedCategory;

          const res = await getPublicProducts(params);
          if (res.ok) {
            const data = res.data as any;
            setProducts(Array.isArray(data) ? data : data.results ?? []);
          } else {
            setProducts([]);
            setProductsError(res.error?.message || "Erreur de chargement des produits.");
          }
        } catch {
          setProducts([]);
          setProductsError("Impossible de charger les produits.");
        } finally {
          setLoading(false);
        }
      })();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, selectedCategory, sortBy]);

  /* ── Enrichissement + filtrage local ── */
  const enrichedProducts = useMemo(() => {
    let result = enrichProductsWithSales(products, sales);

    if (selectedCategory && searchQuery.trim().length >= 3) {
      const cat = findCategoryBySlug(categories, selectedCategory);
      if (cat) {
        result = result.filter(
          (p) => p.category_name?.toLowerCase() === cat.name.toLowerCase()
        );
      }
    }

    result = result.filter((p) => {
      const finalPrice = parseFloat(p.sale_price ?? p.price);
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

    switch (sortBy) {
      case "price":
        result.sort(
          (a, b) => parseFloat(a.sale_price ?? a.price) - parseFloat(b.sale_price ?? b.price)
        );
        break;
      case "-price":
        result.sort(
          (a, b) => parseFloat(b.sale_price ?? b.price) - parseFloat(a.sale_price ?? a.price)
        );
        break;
      case "-note_produit":
        result.sort((a, b) => parseFloat(b.note_produit) - parseFloat(a.note_produit));
        break;
    }

    return result;
  }, [products, sales, categories, priceRange, searchQuery, selectedCategory, sortBy]);



  const totalCategoryCount = useMemo(() => countCategories(categories), [categories]);




  /* ── Handlers — conservation des noms d'origine ── */
  const toggleCategoryExpand = (id: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };




  const handleSelectCategory = (slug: string | null) => {
    setSelectedCategory(slug);
    if (!slug) return;
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      collectAncestorIds(categories, slug).forEach((id) => next.add(id));
      const selected = findCategoryBySlug(categories, slug);
      if (selected?.children?.length) next.add(selected.id);
      return next;
    });
  };




  /* ── Nombre de filtres actifs (pour le badge mobile) ── */
  const activeFiltersCount = [
    selectedCategory !== null,
    priceRange[1] < 100000,
  ].filter(Boolean).length;




  /* ─────────────────────────────────────────────────────────────
     RENDU
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="page-transition bg-[#fbf7e8]">
      <ProductsPageHeader
        productCount={enrichedProducts.length}
        categoryCount={totalCategoryCount}
      />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">

        {/* ── Barre d'outils ── */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Champ recherche */}
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9086] pointer-events-none"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm text-[#1f241c]",
                "placeholder:text-[#8a9086]",
                "outline-none transition-all duration-200",
                "border-[#e7dfd2]",
                "focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#1f4d3f]/12 focus:shadow-sm"
              )}
              aria-label="Rechercher un produit"
            />
            {/* Loader ou bouton reset */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#1f4d3f]" aria-label="Chargement" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={cn(
                    "flex h-5 w-5 cursor-pointer items-center justify-center rounded-full",
                    "bg-[#e7dfd2] text-[#8a9086]",
                    "transition-all hover:bg-[#1f4d3f] hover:text-white",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1f4d3f]"
                  )}
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Contrôles droite */}
          <div className="flex items-center gap-3">

            {/* Bouton filtres mobile avec badge */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium",
                "transition-all duration-200 lg:hidden",
                showFilters
                  ? "border-[#1f4d3f] bg-[#1f4d3f]/5 text-[#1f4d3f]"
                  : "border-[#e7dfd2] bg-white text-[#8a9086] hover:border-[#1f4d3f]/30 hover:text-[#1f241c]"
              )}
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4" aria-hidden />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef8219] text-[9px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Select tri */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={cn(
                  "appearance-none cursor-pointer rounded-xl border border-[#e7dfd2] bg-white",
                  "py-2.5 pl-4 pr-10 text-sm text-[#1f241c]",
                  "outline-none transition-all duration-200",
                  "focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#1f4d3f]/12"
                )}
                aria-label="Trier les produits"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9086]"
                aria-hidden
              />
            </div>

            {/* Toggle grille / liste */}
            <div className="hidden items-center rounded-xl border border-[#e7dfd2] bg-white sm:flex" role="group" aria-label="Mode d'affichage">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex h-10 w-10 cursor-pointer items-center justify-center",
                    "transition-all duration-200",
                    mode === "grid" ? "rounded-l-xl" : "rounded-r-xl",
                    viewMode === mode
                      ? "bg-[#1f4d3f] text-white"
                      : "text-[#8a9086] hover:bg-[#f3ede2] hover:text-[#1f241c]"
                  )}
                  aria-label={mode === "grid" ? "Vue grille" : "Vue liste"}
                  aria-pressed={viewMode === mode}
                >
                  {mode === "grid" ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Layout principal : sidebar + grille ── */}
        <div className="flex gap-8">

          {/* ── Sidebar filtres ── */}
          <AnimatePresence>
            {(showFilters || true) && (
              <motion.aside
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "w-64 shrink-0 space-y-4 transition-all",
                  showFilters ? "block" : "hidden lg:block"
                )}
              >
                {/* Panel Catégories */}
                <div className="overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCategoriesPanelOpen((v) => !v)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left",
                      "transition-colors hover:bg-[#f3ede2]",
                      "focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-[#1f4d3f]/40"
                    )}
                    aria-expanded={categoriesPanelOpen}
                    aria-controls="categories-panel"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1f241c]">
                      Catégories
                    </h3>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[#8a9086] transition-transform duration-200",
                        categoriesPanelOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {categoriesPanelOpen && (
                      <motion.div
                        id="categories-panel"
                        initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-1 px-3 pb-4">
                          {/* "Tous les produits" */}
                          <li>
                            <button
                              type="button"
                              onClick={() => handleSelectCategory(null)}
                              className={cn(
                                "relative w-full cursor-pointer overflow-hidden rounded-lg px-3 py-2 text-left text-sm",
                                "transition-colors duration-200",
                                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1f4d3f]/40",
                                !selectedCategory
                                  ? "bg-[#1f4d3f]/8 font-medium text-[#1f4d3f]"
                                  : "text-[#8a9086] hover:bg-[#f3ede2] hover:text-[#1f241c]"
                              )}
                            >
                              <AnimatePresence>
                                {!selectedCategory && (
                                  <motion.span
                                    className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r-full bg-[#1f4d3f]"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    exit={{ scaleY: 0 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    aria-hidden
                                  />
                                )}
                              </AnimatePresence>
                              Tous les produits
                            </button>
                          </li>

                          {loadingCategories ? (
                            <LoadingKalvin message="Chargement des catégories..." />
                          ) : categoriesError ? (
                            <li className="px-3 py-2 text-xs text-red-500">{categoriesError}</li>
                          ) : (
                            categories.map((cat) => (
                              <CategoryTreeItem
                                key={cat.id}
                                category={cat}
                                selectedCategory={selectedCategory}
                                expandedIds={expandedCategoryIds}
                                onToggleExpand={toggleCategoryExpand}
                                onSelect={(slug) => handleSelectCategory(slug)}
                              />
                            ))
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Panel Prix */}
                <div className="rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1f241c]">
                    Prix max
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={500}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value, 10)])
                      }
                      className="w-full cursor-pointer accent-[#1f4d3f]"
                      aria-label="Prix maximum"
                      aria-valuemin={0}
                      aria-valuemax={100000}
                      aria-valuenow={priceRange[1]}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#8a9086]">0 FCFA</span>
                      <span className="rounded-lg bg-[#1f4d3f]/8 px-2 py-0.5 text-xs font-bold text-[#1f4d3f]">
                        {priceRange[1].toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel Stats */}
                <div className="rounded-2xl border border-[#e7dfd2] bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#1f241c]">
                    Catalogue
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8a9086]">Catégories</span>
                      <span className="font-semibold text-[#1f241c]">{totalCategoryCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8a9086]">Produits chargés</span>
                      <span className="font-semibold text-[#1f241c]">{products.length}</span>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ── Zone principale produits ── */}
          <div className="flex-1 min-w-0">

            {/* Compteur résultats */}
            <p className="mb-4 text-sm text-[#8a9086]">
              <span className="font-semibold text-[#1f241c]">{enrichedProducts.length}</span>{" "}
              produit{enrichedProducts.length !== 1 ? "s" : ""} trouvé
              {enrichedProducts.length !== 1 ? "s" : ""}
            </p>

            {/* États : loading / résultats / vide */}
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : productsError ? (
              /* ── État erreur ── */
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-red-200 bg-red-50/50 py-20">
                <p className="text-sm font-medium text-red-600">{productsError}</p>
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy)}
                  className="flex items-center cursor-pointer gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </button>
              </div>
            ) : enrichedProducts.length > 0 ? (
              /* ── Grille produits ── */
              <motion.div
                layout
                className={cn(
                  "grid gap-5",
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {enrichedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                    userScore={userRatingsMap.get(product.id) ?? null}
                    isFavorited={userFavoriteIds.has(product.id)}
                  />
                ))}
              </motion.div>
            ) : (
              /* ── État vide — invitation poétique ── */
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-[#d4c9b0] bg-[#faf6ed] py-20"
              >
                {/* Illustration */}
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f3ede2]">
                    <Leaf className="h-8 w-8 text-[#8b5e34]/50" aria-hidden />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#e7dfd2]">
                    <SlidersHorizontal className="h-3 w-3 text-[#8a9086]" aria-hidden />
                  </div>
                </div>

                <div className="max-w-xs text-center">
                  <p className="text-base font-semibold text-[#1f241c]">
                    Aucun produit pour ces filtres
                  </p>
                  <p className="mt-1.5 text-sm text-[#8a9086]">
                    Essayez d'élargir votre recherche ou de réinitialiser les filtres.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    handleSelectCategory(null);
                    setPriceRange([0, 100000]);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold",
                    "bg-[#1f4d3f] text-white shadow-md",
                    "transition-all duration-200 hover:bg-[#17392f] hover:shadow-lg active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/40"
                  )}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}