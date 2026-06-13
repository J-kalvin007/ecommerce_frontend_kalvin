/**
 * Catalogue / Boutique — Page de listing des produits
 *
 * Fonctionnalités :
 * 1. Grille de produits avec filtres latéraux
 * 2. Barre de tri et vue (grille/liste)
 * 3. Filtres : catégorie, prix, stock, labels
 * 4. Pagination
 * 5. Recherche par URL params
 *
 * @module app/products/page
 */

import type { Metadata } from "next";
import ProductsClient from "./components/ProductsClient";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Parcourez notre catalogue de produits alimentaires premium. Épices, huiles, chocolats, thés et bien plus encore.",
};

/**
 * Page Boutique — Affiche la grille de produits avec filtres.
 */
export default function ProductsPage() {
  return <ProductsClient />;
}
