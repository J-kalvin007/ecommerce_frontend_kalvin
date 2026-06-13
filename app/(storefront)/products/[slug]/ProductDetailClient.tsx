/**
 * ProductDetailClient - Vue detaillee d'un produit.
 * @module app/products/[slug]/ProductDetailClient
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RefreshCw,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { getPublicProductById as getProductBySlug } from "@/fonctions_api/produits.api";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/modeles";

const DEFAULT_PRODUCT = {
  id: "0",
  name: "Produit",
  slug: "produit",
  price: "12500",
  compare_at_price: null as string | null,
  currency: "FCFA",
  description: "Produit du catalogue.",
  images: ["/assets/images/img_06.png", "/assets/images/img_01.png"],
  category_name: "Catalogue",
  avg_rating: 0,
  review_count: 0,
  stock_status: "IN_STOCK",
  labels: [] as string[],
  origin: "",
  weight: "",
};

interface Props {
  slug: string;
}

function buildFallbackProduct(slug: string) {
  return {
    ...DEFAULT_PRODUCT,
    slug,
    name: slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  };
}

function mapDisplayProduct(product: Product | null, slug: string) {
  const fallback = buildFallbackProduct(slug);

  if (!product) {
    return fallback;
  }

  const productImages = product.images?.map((image) => image.image).filter(Boolean) ?? [];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compare_at_price: product.compare_at_price,
    currency: product.currency,
    description: product.description,
    images: productImages.length > 0 ? productImages : fallback.images,
    category_name: product.category_detail?.name || "Catalogue",
    avg_rating: product.avg_rating,
    review_count: product.review_count,
    stock_status: product.stock_status,
    labels: product.labels,
    origin: product.country_of_origin || "",
    weight: product.weight_g ? `${product.weight_g}g` : "",
  };
}

export default function ProductDetailClient({ slug }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isfavorised, setIsfavorised] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        const response = await getProductBySlug(slug);
        if (isMounted) {
          if (response.ok) {
            setProduct(response.data as any);
            setSelectedImage(0);
          } else {
            setProduct(null);
          }
        }
      } catch {
        if (isMounted) {
          setProduct(null);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const displayProduct = useMemo(() => mapDisplayProduct(product, slug), [product, slug]);
  const hasDiscount =
    displayProduct.compare_at_price &&
    parseFloat(displayProduct.compare_at_price) > parseFloat(displayProduct.price);
  const discountPct = hasDiscount
    ? Math.round(
      (1 - parseFloat(displayProduct.price) / parseFloat(displayProduct.compare_at_price!)) * 100
    )
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: displayProduct.id,
      variantId: null,
      name: displayProduct.name,
      sku: displayProduct.slug || "",
      price: displayProduct.price,
      compareAtPrice: displayProduct.compare_at_price,
      image: displayProduct.images[0],
      quantity,
      maxStock: 99,
      currency: displayProduct.currency,
      slug: displayProduct.slug || "",
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="page-transition">
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto flex max-w-[var(--content-max-width)] items-center gap-2 px-[var(--spacing-page-x)] py-3 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-primary">Boutique</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-foreground">{displayProduct.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated">
              <Image
                src={displayProduct.images[selectedImage]}
                alt={displayProduct.name}
                width={700}
                height={700}
                className="h-auto w-full object-cover"
                priority
              />
              {hasDiscount && (
                <span className="absolute left-4 top-4 badge-promo text-sm shadow-lg">-{discountPct}%</span>
              )}
              {displayProduct.labels?.includes("bio") && (
                <span className="absolute left-4 top-12 rounded-full bg-success/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Bio
                </span>
              )}
            </div>

            {displayProduct.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {displayProduct.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all",
                      selectedImage === index
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <Image src={img} alt={`Vue ${index + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {displayProduct.category_name}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight lg:text-3xl">
              {displayProduct.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(displayProduct.avg_rating)
                        ? "fill-highlight text-highlight"
                        : "fill-border text-border"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {displayProduct.avg_rating} ({displayProduct.review_count} avis)
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(displayProduct.price, displayProduct.currency)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted line-through">
                  {formatCurrency(displayProduct.compare_at_price!, displayProduct.currency)}
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  -{discountPct}%
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-muted">{displayProduct.description}</p>

            {(displayProduct.origin || displayProduct.weight) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {displayProduct.origin && (
                  <span className="rounded-lg bg-surface-alt px-3 py-1.5">
                    Origine {displayProduct.origin}
                  </span>
                )}
                {displayProduct.weight && (
                  <span className="rounded-lg bg-surface-alt px-3 py-1.5">
                    Poids {displayProduct.weight}
                  </span>
                )}
              </div>
            )}

            <div className="my-6 border-t border-border" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-xl border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-12 w-12 items-center justify-center rounded-l-xl transition-colors hover:bg-surface-alt">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-12 w-14 items-center justify-center border-x border-border font-semibold">
                  {quantity}
                </span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex h-12 w-12 items-center justify-center rounded-r-xl transition-colors hover:bg-surface-alt">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold shadow-lg transition-all",
                  isAdded
                    ? "bg-success text-white"
                    : "bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-glow-strong"
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="h-5 w-5" /> Ajoute au panier
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" /> Ajouter au panier
                  </>
                )}
              </button>

              <button onClick={() => setIsfavorised(!isfavorised)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-border transition-all hover:border-primary/30">
                <Heart className={cn("h-5 w-5", isfavorised ? "fill-primary text-primary" : "text-muted")} />
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-border transition-all hover:border-primary/30">
                <Share2 className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Livraison mondiale" },
                { icon: Shield, label: "Paiement securise" },
                { icon: RefreshCw, label: "Retour 30 jours" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface-elevated p-3 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
