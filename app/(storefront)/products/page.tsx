import type { Metadata } from "next";
import { ProductsCatalogClient } from "@/components/product/ProductsCatalogClient";
import { LegacyFooter } from "@/components/layout/LegacyFooter";
import { LegacyHeader } from "@/components/layout/LegacyHeader";

export const metadata: Metadata = {
  title: "Boutique — Atelier du Terroir",
  description:
    "Parcourez notre catalogue de produits du terroir. Fruits, legumes, epices et produits transformes.",
};

export default function ProductsPage() {
  return (
    <>
      <LegacyHeader />
      <main>
        <ProductsCatalogClient />
      </main>
      <LegacyFooter />
    </>
  );
}
