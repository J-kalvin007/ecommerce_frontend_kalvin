/**
 * PromotionsClient - Offres, ventes flash et reductions
 * @module app/promotions/PromotionsClient
 */

"use client";

import { useUIStore } from "@/store/uiStore";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tag, Clock, Zap, ArrowRight, Star, Percent, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPublicProducts as getProducts } from "@/fonctions_api/produits.api";
import type { ProductListItem } from "@/modeles";

function computeDiscount(product: ProductListItem) {
  if (!product.compare_at_price) return 0;
  const current = parseFloat(product.price);
  const original = parseFloat(product.compare_at_price);
  if (!original || original <= current) return 0;
  return Math.round((1 - current / original) * 100);
}

export default function PromotionsClient() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const response = await getProducts({ page_size: 100, ordering: "-created_at" });
        if (response.ok) {
          setProducts(response.data.results || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.warn("Impossible de charger les promotions catalogue.", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const discountedProducts = useMemo(
    () => products.filter((p) => p.compare_at_price && computeDiscount(p) > 0),
    [products]
  );

  const spotlightOffers = discountedProducts.slice(0, 3);
  const flashOffers = discountedProducts.slice(0, 8);

  return (
    <div className="page-transition">

      {/* -- Hero ------------------------------------------- */}
      <section className="bg-primary py-20 text-white">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            Offres du moment
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight lg:text-5xl">
            Promotions Exclusives
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-white/65">
            Retrouvez les produits actuellement en promotion directement depuis notre catalogue.
          </p>
        </div>
      </section>

      {/* -- Page body -------------------------------------- */}
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-14">

        {/* -- Offres actives (spotlight) ----------------- */}
        <section className="mb-14">
          <div className="mb-7 flex items-center gap-3">
            <Tag className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Offres actives</h2>
          </div>

          {loading ? (
            <LoadingPlaceholder label="Chargement des offres…" />
          ) : spotlightOffers.length === 0 ? (
            <EmptyPlaceholder label="Aucun produit en promotion pour le moment." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spotlightOffers.map((product) => {
                const discount = computeDiscount(product);
                return (
                  <div
                    key={product.id}
                    className="relative overflow-hidden rounded-xl border border-border bg-surface-elevated"
                  >
                    {/* left accent bar in primary */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary" />

                    <div className="py-5 pr-5 pl-6">
                      <span className="text-3xl font-extrabold tabular-nums text-primary">
                        -{discount}%
                      </span>
                      <p className="mt-1.5 text-sm font-semibold text-foreground leading-snug">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.category_name || "Catalogue"} · {product.review_count} avis
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="rounded-lg bg-primary/8 px-3 py-2 text-sm font-bold text-primary">
                          {formatCurrency(product.price, "FCFA")}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted line-through">
                            {formatCurrency(product.compare_at_price, "FCFA")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* -- Produits en promotion (grid) --------------- */}
        <section>
          <div className="mb-7 flex items-center gap-3">
            <Zap className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Produits en promotion
            </h2>
            <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Percent className="h-3 w-3" />
              Offres catalogue
            </span>
          </div>

          {loading ? (
            <LoadingPlaceholder label="Chargement des produits…" />
          ) : flashOffers.length === 0 ? (
            <EmptyPlaceholder label="Aucun produit en réduction disponible actuellement." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flashOffers.map((product) => {
                const discount = computeDiscount(product);
                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group overflow-hidden rounded-xl border border-border bg-surface-elevated transition-shadow hover:shadow-md"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} onClick={() => useUIStore.getState().setActiveProductId(product.id)}
                      className="relative block aspect-square overflow-hidden bg-surface-alt"
                    >
                      {product.primary_image ? (
                        <Image
                          src={typeof product.primary_image === "string" ? product.primary_image : product.primary_image.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width:640px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted">
                          Pas d&apos;image
                        </div>
                      )}
                      {/* Discount badge — primary only */}
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-white shadow">
                        -{discount}%
                      </span>
                    </Link>

                    {/* Card body */}
                    <div className="p-4">
                      <Link href={`/products/${product.slug}`} onClick={() => useUIStore.getState().setActiveProductId(product.id)}
                        className="line-clamp-2 text-[0.85rem] font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-primary">
                          {formatCurrency(product.price, "FCFA")}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted line-through">
                            {formatCurrency(product.compare_at_price, "FCFA")}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                        <span>Réduction appliquée</span>
                        <span className="flex items-center gap-1 font-semibold text-primary/80">
                          <Clock className="h-3 w-3" />
                          En cours
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* -- Fidélité CTA ------------------------------- */}
        <div className="mt-14 rounded-2xl border border-primary/15 bg-primary/5 px-8 py-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">
            Rejoignez le programme fidélité
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[0.88rem] leading-6 text-muted">
            Accumulez des points à chaque achat et débloquez des réductions encore plus importantes.
          </p>
          <Link
            href="/auth/register"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
          >
            S&apos;inscrire gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -- Shared micro-components ------------------------------- */

function LoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-surface-elevated py-16 text-sm text-muted">
      <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  );
}

function EmptyPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-8 py-12 text-center text-sm text-muted">
      {label}
    </div>
  );
}































