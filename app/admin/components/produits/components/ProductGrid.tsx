

// components/admin/produits/ProductGrid.tsx
"use client";
import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { ProductDetail } from "@/modeles/produits";

interface ProductGridProps {
  products: ProductDetail[];
  onProductClick: (product: ProductDetail) => void;
  onEdit: (product: ProductDetail) => void;
  onDelete: (id: string) => void;
  onAddVariant: (product: ProductDetail) => void;
}

export function ProductGrid({ products, onProductClick, onEdit, onDelete, onAddVariant }: ProductGridProps) {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
      {products.map((p) => (
        <motion.div key={p.id} variants={item}>
          <ProductCard product={p} onClick={() => onProductClick(p)} onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)} onAddVariant={() => onAddVariant(p)} />
        </motion.div>
      ))}
    </motion.div>
  );
}