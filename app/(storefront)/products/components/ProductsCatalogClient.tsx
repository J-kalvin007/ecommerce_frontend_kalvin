
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



















"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicProducts } from "@/fonctions_api/produits.api";
import { getPublicCategories } from "@/fonctions_api/categories.api";
import { getActiveSales } from "@/fonctions_api/promotions.api";
import type { ProductList } from "@/modeles/produits";
import type { Category } from "@/modeles/categories";
import type { Soldes } from "@/modeles/promotions";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProductsPageHeader } from "./ProductsPageHeader";
import { ProductCard } from "./ProductCard";

/* ------------------------------------------------------------------ */
/*  Types enrichis pour la page catalogue                             */
/* ------------------------------------------------------------------ */

/** Un produit avec d’éventuelles infos de vente flash */
export type EnrichedProduct = ProductList & {
  sale_price?: string;
  original_price?: string;
};

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const SORT_OPTIONS = [
  { value: "-created_at", label: "Nouveautés" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix décroissant" },
  { value: "-note_produit", label: "Mieux notés" },
] as const;

/* ------------------------------------------------------------------ */
/*  Fonctions utilitaires                                             */
/* ------------------------------------------------------------------ */

/** Compte récursivement les catégories */
function countCategories(categories: Category[]): number {
  return categories.reduce(
    (total, cat) =>
      total + 1 + (cat.children ? countCategories(cat.children) : 0),
    0
  );
}

/** Trouve une catégorie par son slug */
function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children?.length) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}

/** Récupère les IDs des ancêtres d’une catégorie (pour l’expansion automatique) */
function collectAncestorIds(
  categories: Category[],
  slug: string
): string[] {
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
  for (const s of sales) {
    salesBySlug.set(s.product_slug, s);
  }

  return products.map((product) => {
    const sale = salesBySlug.get(product.slug ?? "");
    if (sale) {
      return {
        ...product,
        sale_price: sale.sale_price,
        original_price: sale.original_price,
      };
    }
    return product;
  });
}

/* ------------------------------------------------------------------ */
/*  Composant CategoryTreeItem                                        */
/* ------------------------------------------------------------------ */

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
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(category.id)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Replier ${category.name}` : `Déplier ${category.name}`}
            className="flex h-9 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-foreground"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-7 shrink-0" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={() => onSelect(category.slug || "-")}
          className={cn(
            "min-h-9 flex-1 rounded-lg px-2 py-2 text-left text-sm transition-colors",
            isSelected
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted hover:bg-surface-alt hover:text-foreground"
          )}
        >
          {category.name}
        </button>
      </div>
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

/* ------------------------------------------------------------------ */
/*  Composant principal                                               */
/* ------------------------------------------------------------------ */

export function ProductsCatalogClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("-created_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const [products, setProducts] = useState<ProductList[]>([]);
  const [sales, setSales] = useState<Soldes[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Chargement des ventes flash
  useEffect(() => {
    (async () => {
      const res = await getActiveSales();
      if (res.ok) setSales(res.data);
      else setSales([]);
    })();
  }, []);

  // Chargement des catégories
  useEffect(() => {
    (async () => {
      setLoadingCategories(true);
      setCategoriesError(null);
      const res = await getPublicCategories();
      if (res.ok) {
        setCategories(res.data);
        setExpandedCategoryIds(
          new Set(
            res.data
              .filter((cat) => cat.children?.length)
              .map((cat) => cat.id)
          )
        );
      } else {
        setCategories([]);
        setCategoriesError(res.error?.message || "Impossible de charger les catégories.");
      }
      setLoadingCategories(false);
    })();
  }, []);

  // Chargement des produits (avec debounce)
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      (async () => {
        setLoading(true);
        setProductsError(null);
        try {
          const params: any = {
            ordering: sortBy,
            page_size: 100,
          };
          if (searchQuery.trim().length >= 3) {
            params.search = searchQuery.trim();
          }
          if (selectedCategory) {
            params.category = selectedCategory;
          }

          const res = await getPublicProducts(params);
          if (res.ok) {
            setProducts(res.data.results ?? []);
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

  // Enrichissement avec les soldes + filtrage local par prix
  const enrichedProducts = useMemo(() => {
    let result = enrichProductsWithSales(products, sales);

    // Si recherche textuelle ET catégorie sélectionnée, on filtre aussi par catégorie
    if (selectedCategory && searchQuery.trim().length >= 3) {
      const cat = findCategoryBySlug(categories, selectedCategory);
      if (cat) {
        result = result.filter(
          (p) => p.category_name?.toLowerCase() === cat.name.toLowerCase()
        );
      }
    }

    // Filtre par prix (sur le prix final, c'est-à-dire sale_price s'il existe, sinon price)
    result = result.filter((p) => {
      const finalPrice = parseFloat(p.sale_price ?? p.price);
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

    // Tri local (l'API trie déjà selon sortBy, mais on applique un tri supplémentaire pour les données enrichies)
    switch (sortBy) {
      case "price":
        result.sort(
          (a, b) =>
            parseFloat(a.sale_price ?? a.price) - parseFloat(b.sale_price ?? b.price)
        );
        break;
      case "-price":
        result.sort(
          (a, b) =>
            parseFloat(b.sale_price ?? b.price) - parseFloat(a.sale_price ?? a.price)
        );
        break;
      case "-note_produit":
        result.sort(
          (a, b) => parseFloat(b.note_produit) - parseFloat(a.note_produit)
        );
        break;
      default:
        break;
    }

    return result;
  }, [products, sales, categories, priceRange, searchQuery, selectedCategory, sortBy]);

  const totalCategoryCount = useMemo(() => countCategories(categories), [categories]);

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

  return (
    <div className="page-transition bg-[#fbf7e8]">
      <ProductsPageHeader
        productCount={enrichedProducts.length}
        categoryCount={totalCategoryCount}
      />

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        {(categoriesError || productsError) && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {productsError || categoriesError}
          </div>
        )}

        {/* Barre d'outils */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {loading ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all lg:hidden",
                showFilters
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/30"
              )}
            >
              <Filter className="h-4 w-4" />
              Filtres
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-xl border border-border bg-surface-elevated py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>

            <div className="hidden items-center rounded-xl border border-border sm:flex">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors",
                  viewMode === "grid" ? "bg-primary text-white" : "hover:bg-surface-alt"
                )}
                aria-label="Vue grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors",
                  viewMode === "list" ? "bg-primary text-white" : "hover:bg-surface-alt"
                )}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filtres */}
          <aside
            className={cn(
              "w-64 shrink-0 space-y-6 transition-all lg:block",
              showFilters ? "block" : "hidden"
            )}
          >
            {/* Catégories */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <button
                type="button"
                onClick={() => setCategoriesPanelOpen((v) => !v)}
                className="mb-4 flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={categoriesPanelOpen}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Catégories
                </h3>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
                    categoriesPanelOpen && "rotate-180"
                  )}
                />
              </button>

              {categoriesPanelOpen && (
                <ul className="space-y-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(null)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        !selectedCategory
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted hover:bg-surface-alt hover:text-foreground"
                      )}
                    >
                      Tous les produits
                    </button>
                  </li>
                  {loadingCategories ? (
                    <li className="px-3 py-2 text-sm text-muted">Chargement...</li>
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
              )}
            </div>

            {/* Prix */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Prix
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
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{priceRange[0]} FCFA</span>
                  <span>{priceRange[1]} FCFA</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Catalogue
              </h3>
              <div className="space-y-2 text-sm text-muted">
                <p>{totalCategoryCount} catégorie(s)</p>
                <p>{products.length} produit(s) chargés</p>
              </div>
            </div>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            <p className="mb-4 text-sm text-muted">
              {enrichedProducts.length} produit{enrichedProducts.length !== 1 ? "s" : ""} trouvé
              {enrichedProducts.length !== 1 ? "s" : ""}
            </p>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : enrichedProducts.length > 0 ? (
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {enrichedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20"
              >
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30" />
                <div className="text-center">
                  <p className="text-lg font-semibold">Aucun produit trouvé</p>
                  <p className="mt-1 text-sm text-muted">
                    Essayez de modifier vos filtres ou votre recherche
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    handleSelectCategory(null);
                    setPriceRange([0, 100000]);
                  }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
                >
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