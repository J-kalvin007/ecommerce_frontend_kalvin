/**
 * ProductsClient - Composant client de la page catalogue
 *
 * @module app/products/ProductsClient
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Filter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCard from "@/app/(storefront)/products/components/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { getPublicCategories } from "@/fonctions_api/categories.api";
import { getPublicProducts } from "@/fonctions_api/produits.api";
import type { Category } from "@/modeles/categories";
import type { ProductListItem } from "@/modeles/produits";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Nouveautes" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix decroissant" },
  { value: "-avg_rating", label: "Mieux notes" },
  { value: "-total_sold", label: "Populaires" },
] as const;

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children ? flattenCategories(category.children) : []),
  ]);
}

export default function ProductsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("-created_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadingCategories(true);
      setCategoriesError(null);
      try {
        const result = await getPublicCategories();
        if (result.ok) {
          setCategories(flattenCategories(result.data));
        } else {
          throw new Error(result.error.message);
        }
      } catch (error) {
        console.warn("Impossible de charger les categories du catalogue.", error);
        setCategories([]);
        setCategoriesError("Impossible de charger les catégories depuis le backend.");
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setProductsError(null);
        try {
          const params: Record<string, any> = { page_size: 100 };
          if (searchQuery.trim().length >= 3) {
            params.search = searchQuery.trim();
          } else {
            if (selectedCategory) params.category = selectedCategory;
            if (sortBy) params.ordering = sortBy;
          }

          const result = await getPublicProducts(params);
          if (result.ok) {
            setProducts(result.data.results || []);
          } else {
            throw new Error(result.error.message);
          }
        } catch (error) {
          console.warn("Impossible de charger les produits du catalogue.", error);
          setProducts([]);
          setProductsError("Impossible de charger les produits depuis le backend.");
        } finally {
          setLoading(false);
        }
      })();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && searchQuery.trim().length >= 3) {
      const selectedCategoryName =
        categories.find((category) => category.slug === selectedCategory)?.name.toLowerCase() || "";
      result = result.filter(
        (product) => product.category_name?.toLowerCase() === selectedCategoryName
      );
    }

    result = result.filter((product) => {
      const price = parseFloat(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case "price":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "-price":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "-avg_rating":
        result.sort((a, b) => parseFloat(b.note_produit || "0") - parseFloat(a.note_produit || "0"));
        break;
      case "-total_sold":
        result.sort((a, b) => (b.count_ratings || 0) - (a.count_ratings || 0));
        break;
      default:
        break;
    }

    return result;
  }, [categories, priceRange, products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="page-transition">
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
          <h1 className="font-display text-3xl font-bold lg:text-4xl">Notre Boutique</h1>
          <p className="mt-2 text-muted">
            Decouvrez notre selection de {filteredProducts.length} produits disponibles
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        {categoriesError || productsError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {productsError || categoriesError}
          </div>
        ) : null}

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
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
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
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>

            <div className="hidden items-center rounded-xl border border-border sm:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors",
                  viewMode === "grid" ? "bg-primary text-white" : "hover:bg-surface-alt"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors",
                  viewMode === "list" ? "bg-primary text-white" : "hover:bg-surface-alt"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside
            className={cn(
              "w-64 shrink-0 space-y-6 transition-all lg:block",
              showFilters ? "block" : "hidden"
            )}
          >
            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
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
                  categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.slug)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          selectedCategory === category.slug
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted hover:bg-surface-alt hover:text-foreground"
                        )}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

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
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                  className="w-full accent-primary"
                />
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{priceRange[0]} FCFA</span>
                  <span>{priceRange[1]} FCFA</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Catalogue
              </h3>
              <div className="space-y-2 text-sm text-muted">
                <p>{categories.length} categorie(s)</p>
                <p>{products.length} produit(s) charges</p>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="mb-4 text-sm text-muted">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouve
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredProducts.length > 0 ? (
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}
              >
                {filteredProducts.map((product, index) => (
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
                  <p className="text-lg font-semibold">Aucun produit trouve</p>
                  <p className="mt-1 text-sm text-muted">
                    Essayez de modifier vos filtres ou votre recherche
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                    setPriceRange([0, 100000]);
                  }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
                >
                  Reinitialiser les filtres
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
