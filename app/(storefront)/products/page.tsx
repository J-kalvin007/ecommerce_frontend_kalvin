import type { Metadata } from "next";
import { ProductsCatalogClient } from "./components/ProductsCatalogClient";

export const metadata: Metadata = {
  title: "Boutique — Atelier du Terroir",
  description:
    "Parcourez notre catalogue de produits du terroir. Fruits, legumes, epices et produits transformes.",
};

export default function ProductsPage() {
  return (
    <>

      <main>
        <ProductsCatalogClient />
      </main>

    </>
  );
}
