"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Minus as MinusIcon,
  Plus,
  Plus as PlusIcon,
  ShoppingBag,
  Star,
  X,
  Package,
  Weight,
  Layers,
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useUIStore } from "@/store/uiStore";
import { getPublicProductById, getPublicProducts } from "@/fonctions_api/produits.api";
import { getActiveSales } from "@/fonctions_api/promotions.api";
import { mediaUrl } from "@/lib/mediaUrl";
import type { ProductDetail, ProductVariant, ProductList } from "@/modeles/produits";
import type { Soldes } from "@/modeles/promotions";
import Toast from "@/components/special/Toast";
import LoadingSpinner from "@/components/special/LoadingSpinner";
import PurchaseModal from "../components/MadaleAchat";
import LoadingKalvin from "@/components/special/loadingKalvin";

type Props = {
  slug: string;
  id?: string | null;
};

/* ──────────────────────────────────────────────────────────────────────────────
   Utilitaires
   ────────────────────────────────────────────────────────────────────────── */

function formatWeight(grams: number | null | undefined): string {
  if (!grams) return "";
  if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
  return `${grams} g`;
}




/* ──────────────────────────────────────────────────────────────────────────────
   Carte produit associé
   ────────────────────────────────────────────────────────────────────────── */

function RelatedProductCard({ product }: { product: ProductList }) {
  const imgSrc = typeof product.primary_image === "object" && product.primary_image
    ? mediaUrl(product.primary_image.image)
    : typeof product.primary_image === "string"
      ? mediaUrl(product.primary_image)
      : null;

  return (
    <Link
      onClick={() => useUIStore.getState().setActiveProductId(product.id)}
      href={`/products/${product.slug}`}
      className="group block w-48 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white transition-all duration-300 hover:border-[#8b5e34]/30 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f3ede2]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="192px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-[#c4b59b]" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b5e34]/70">
          {product.category_name}
        </p>
        <h4 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[#1f241c] transition-colors group-hover:text-[#1f4d3f]">
          {product.name}
        </h4>
        <p className="mt-1.5 text-sm font-bold text-[#1f4d3f]">
          {formatCurrency(product.price, "FCFA")}
        </p>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Composant principal
   ────────────────────────────────────────────────────────────────────────── */

export default function ProductDetailClient({ slug, id }: Props) {
  const activeProductId = useUIStore((state) => state.activeProductId);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [flashSale, setFlashSale] = useState<Soldes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  /* --- Toast state -------------------------------------------------------- */
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  /* --- Chargement du produit ---------------------------------------------- */
  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        // ─── Stratégie 1 : recherche par slug (prioritaire) ───────────────
        // L'endpoint ?slug=... retourne déjà les images, variantes, etc.
        // On l'utilise directement sans passer par getPublicProductById.
        const slugRes = await getPublicProducts({ slug });
        let resolvedProduct: ProductDetail | null = null;

        if (slugRes.ok && slugRes.data) {
          const items = Array.isArray(slugRes.data) ? slugRes.data : (slugRes.data as any).results;
          if (items && items.length > 0) {
            resolvedProduct = items[0] as unknown as ProductDetail;
          }
        }

        // ─── Stratégie 2 : fallback par ID si le slug n'a rien retourné ───
        if (!resolvedProduct) {
          const productId = id || activeProductId;
          if (productId) {
            const detailRes = await getPublicProductById(productId);
            if (detailRes.ok) {
              resolvedProduct = detailRes.data;
            }
          }
        }

        const salesRes = await getActiveSales();

        if (!active) return;

        if (!resolvedProduct) {
          throw new Error("404");
        }

        setProduct(resolvedProduct);
        setSelectedImage(0);

        if (salesRes.ok) {
          const sale = salesRes.data.find((s) => s.product_slug === slug);
          setFlashSale(sale || null);
        } else {
          setFlashSale(null);
        }
      } catch (err) {
        if (!active) return;
        const errMsg = err instanceof Error ? err.message : "Erreur inconnue.";
        if (errMsg.includes("500") || errMsg.includes("Internal Server Error")) {
          setError({
            title: "Erreur Serveur (500)",
            message: "Une erreur inattendue s'est produite au niveau de nos serveurs. Notre équipe technique a été alertée. Veuillez réessayer plus tard.",
          });
        } else if (errMsg.includes("404") || errMsg.includes("Not Found")) {
          setError({
            title: "Produit introuvable",
            message: "Le produit que vous cherchez n'est plus disponible ou a été retiré du catalogue.",
          });
        } else if (errMsg.includes("Network Error") || errMsg.includes("Failed to fetch") || errMsg.includes("502")) {
          setError({
            title: "Problème de connexion",
            message: "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet et réessayer.",
          });
        } else {
          setError({
            title: "Erreur",
            message: errMsg,
          });
        }
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  /* --- Images ------------------------------------------------------------- */
  const images = useMemo(() => {
    if (!product) return [];
    const gallery = (product.images ?? [])
      .map((img) => mediaUrl(img.image))
      .filter(Boolean) as string[];
    if (gallery.length > 0) return gallery;

    const fallback = product.primary_image || product.image || product.image_url || product.thumbnail;
    const resolved = mediaUrl(fallback);
    return resolved ? [resolved] : [];
  }, [product]);

  /* --- Dérivés ------------------------------------------------------------ */
  const categoryName = product?.category?.name || "Catalogue";
  const displayPrice = flashSale?.sale_price ?? product?.price ?? "0";
  const comparePrice = flashSale ? product?.price : null;
  const hasDiscount = flashSale !== null && Number(displayPrice) < Number(product?.price ?? 0);
  const isOutOfStock = product ? product.stock === 0 : false;

  const activeVariants = useMemo(
    () => (product?.variants ?? []).filter((v) => v.is_active),
    [product?.variants]
  );

  const variantPriceRange = useMemo(() => {
    if (activeVariants.length === 0) return null;
    const prices = activeVariants.map((v) => parseFloat(v.price));
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [activeVariants]);

  /* --- Handler d'ajout au panier ------------------------------------------ */
  const handleAddToCart = useCallback(
    (
      variantId: string | null,
      variantName: string | null,
      price: string,
      quantity: number,
      weight: number | null | undefined
    ) => {
      if (!product) return;

      const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
      const selectedVariant = variantId ? product.variants.find((v) => v.id === variantId) : defaultVariant;
      const actualStock = selectedVariant ? selectedVariant.stock : product.stock;

      if (quantity > (actualStock || 0)) {
        setToast({ show: true, type: "error", message: "Stock insuffisant pour la quantité demandée." });
        return;
      }

      addItem({
        productId: product.id,
        variantId: selectedVariant ? selectedVariant.id : null,
        name: selectedVariant ? `${product.name} — ${selectedVariant.name}` : product.name,
        sku: selectedVariant?.sku || product.sku,
        price: selectedVariant ? selectedVariant.price : price,
        compareAtPrice: comparePrice!,
        image: images[0] ?? null,
        quantity,
        maxStock: Math.max(actualStock, 1),
        currency: "FCFA",
        slug: product.slug ?? "",
      });

      setIsPurchaseModalOpen(false);
      // setToast({
      //   show: true,
      //   type: "success",
      //   message: variantName
      //     ? `${product.name} — ${variantName} (×${quantity}) ajouté au panier`
      //     : `${product.name} (×${quantity}) ajouté au panier`,
      // });
    },
    [product, addItem, comparePrice, images]
  );

  /* ────────────────────────────────────────────────────────────────────────
     Rendu
     ──────────────────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#f6f1e8] pt-24 text-[#1f241c]">
      {/* Toast notifications */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
        duration={4000}
      />

      {/* Purchase modal */}
      {isPurchaseModalOpen && product && (
        <PurchaseModal
          product={product}
          images={images}
          flashSale={flashSale}
          onClose={() => setIsPurchaseModalOpen(false)}
          onConfirm={handleAddToCart}
        />
      )}

      {/* Fil d'Ariane */}
      <div className="border-b border-[#e7dfd2]/80 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3.5 text-sm">
          <Link href="/" className="text-[#8a9086] transition-colors hover:text-[#1f4d3f]">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#c4b59b]" />
          <Link href="/products" className="text-[#8a9086] transition-colors hover:text-[#1f4d3f]">
            Boutique
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#c4b59b]" />
          <span className="truncate font-medium text-[#1f241c]">
            {product?.name ?? slug}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* États de chargement / erreur */}
        {loading ? (

          <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingKalvin message="Chargement des details du produit..." />
          </div>

        ) : error || !product ? (

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-[#e7dfd2] bg-white px-8 py-20 text-center shadow-sm"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f3ede2]">
              <Package className="h-9 w-9 text-[#c4b59b]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1f241c]">
                {error?.title ?? "Produit introuvable"}
              </p>
              <p className="mt-2 text-sm text-[#8a9086]">
                {error?.message ?? "Le produit que vous cherchez n'est plus disponible ou a été retiré du catalogue."}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1f4d3f] to-[#17392f] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Retour au catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* ═══════════════════════════════════════════════════════════════
               Section principale : Galerie + Détails
               ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
              {/* ── Galerie d'images ─────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Image principale */}
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-[#e7dfd2] bg-white shadow-[0_20px_50px_rgba(31,36,28,0.08)]">
                  <AnimatePresence mode="wait">
                    {images[selectedImage] && !failedImages.has(selectedImage) ? (
                      <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full"
                      >
                        <Image
                          src={images[selectedImage]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(selectedImage));
                          }}
                        />
                      </motion.div>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#f3ede2]">
                        <Package className="h-16 w-16 text-[#c4b59b]" />
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    {hasDiscount && flashSale && (
                      <span className="rounded-full bg-[#ef8219] px-3 py-1 text-xs font-bold text-white shadow-lg">
                        -{flashSale.discount_percent}%
                      </span>
                    )}
                    {product.is_top && (
                      <span className="flex items-center gap-1 rounded-full bg-[#1f4d3f] px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <Star className="h-3 w-3" /> Tendance
                      </span>
                    )}
                  </div>
                </div>

                {/* Miniatures */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {images.map((img, index) => {
                      if (failedImages.has(index)) return null;
                      return (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${selectedImage === index
                            ? "border-[#1f4d3f] shadow-md ring-2 ring-[#1f4d3f]/20"
                            : "border-[#e7dfd2] hover:border-[#8b5e34]/40"
                            }`}
                        >
                          <Image
                            src={img}
                            alt={`Vue ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            onError={() => {
                              setFailedImages((prev) => new Set(prev).add(index));
                              if (selectedImage === index) {
                                const validImages = images.map((_, i) => i).filter(i => i !== index && !failedImages.has(i));
                                if (validImages.length > 0) setSelectedImage(validImages[0]);
                              }
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Variantes visuelles sous la galerie */}
                {activeVariants.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#8b5e34]" />
                      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5d6b58]">
                        {activeVariants.length} Variante{activeVariants.length > 1 ? "s" : ""} disponible{activeVariants.length > 1 ? "s" : ""}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {activeVariants.map((variant) => (
                        <div
                          key={variant.id}
                          className="group relative overflow-hidden rounded-2xl border border-[#e7dfd2] bg-gradient-to-b from-white to-[#faf6ef] p-3.5 transition-all hover:border-[#8b5e34]/50 hover:shadow-[0_8px_20px_rgba(139,94,52,0.12)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <p className="text-xs font-bold text-[#1f241c] truncate">{variant.name}</p>
                          <div className="mt-2 flex flex-col gap-1">
                            {variant.weight_grams && (
                              <span className="flex items-center gap-1.5 w-fit rounded-md bg-[#f3ede2]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8b5e34]">
                                <Weight className="h-3 w-3" />
                                {formatWeight(variant.weight_grams)}
                              </span>
                            )}
                            <span className="mt-0.5 text-lg font-black tracking-tight text-[#1f4d3f]">
                              {formatCurrency(variant.price, "FCFA")}
                            </span>
                          </div>
                          {variant.stock === 0 && (
                            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50/80 px-2 py-1 text-[10px] font-bold text-red-600">
                              <X className="h-3 w-3" /> Indisponible
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── Détails produit ──────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="space-y-7"
              >
                {/* Catégorie + Titre */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                    {categoryName}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f241c] md:text-4xl">
                    {product.name}
                  </h1>

                  {/* Note */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(parseFloat(product.note_produit || "0"))
                            ? "fill-amber-400 text-amber-400"
                            : "fill-[#e7dfd2] text-[#e7dfd2]"
                            }`}
                        />
                      ))}
                    </div>
                    {parseFloat(product.note_produit) > 0 ? (
                      <span className="text-sm text-[#5d6b58]">
                        {parseFloat(product.note_produit).toFixed(1)} ({product.count_ratings} avis)
                      </span>
                    ) : (
                      <span className="text-sm text-[#8a9086]">Aucun avis</span>
                    )}
                    {product.count_favorites > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                        <Heart className="h-3 w-3 fill-red-400" />
                        {product.count_favorites}
                      </span>
                    )}
                  </div>
                </div>

                {/* Prix */}
                <div className="rounded-2xl border border-[#e7dfd2] bg-gradient-to-br from-white to-[#faf6ef] px-6 py-5">
                  {variantPriceRange ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a9086]">
                        Gamme de prix
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[#1f4d3f]">
                          {formatCurrency(variantPriceRange.min, "FCFA")}
                        </span>
                        {variantPriceRange.min !== variantPriceRange.max && (
                          <>
                            <span className="text-lg text-[#c4b59b]">—</span>
                            <span className="text-3xl font-bold text-[#1f4d3f]">
                              {formatCurrency(variantPriceRange.max, "FCFA")}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#8a9086]">
                        Selon la variante sélectionnée
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-[#1f4d3f]">
                        {formatCurrency(displayPrice, "FCFA")}
                      </span>
                      {hasDiscount && comparePrice && (
                        <span className="text-lg text-[#8a9086] line-through">
                          {formatCurrency(comparePrice, "FCFA")}
                        </span>
                      )}
                      {flashSale && (
                        <span className="rounded-full bg-[#ef8219]/10 px-3 py-1 text-sm font-bold text-[#ef8219]">
                          -{flashSale.discount_percent}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d6b58]">
                      Description
                    </h2>
                    <p className="leading-7 text-[#586657]">{product.description}</p>
                  </div>
                )}

                {/* Infos produit */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e7dfd2] bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9086]">Stock</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isOutOfStock ? "bg-red-400" : "bg-emerald-400"}`} />
                      <span className={`text-sm font-bold ${isOutOfStock ? "text-red-600" : "text-emerald-700"}`}>
                        {isOutOfStock ? "Indisponible" : `${product.stock} en stock`}
                      </span>
                    </div>
                  </div>
                  {product.weight_grams && (
                    <div className="rounded-xl border border-[#e7dfd2] bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9086]">Poids</p>
                      <p className="mt-1 text-sm font-bold text-[#1f241c]">{formatWeight(product.weight_grams)}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-[#e7dfd2] bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9086]">Type</p>
                    <p className="mt-1 text-sm font-bold text-[#1f241c]">
                      {product.product_type === "RAW" ? "Brut" : product.product_type === "PROCESSED" ? "Transformé" : "Export"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e7dfd2] bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a9086]">Réf.</p>
                    <p className="mt-1 text-sm font-bold text-[#1f241c]">{product.sku}</p>
                  </div>
                </div>

                {/* Bouton d'achat principal */}
                <motion.button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setIsPurchaseModalOpen(true)}
                  whileHover={{ scale: isOutOfStock ? 1 : 1.01 }}
                  whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#1f4d3f] to-[#17392f] px-6 py-4.5 text-base font-bold text-white shadow-[0_16px_40px_rgba(31,77,63,0.28)] transition-all hover:shadow-[0_20px_50px_rgba(31,77,63,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {isOutOfStock ? "Produit indisponible" : "Configurer et ajouter au panier"}
                </motion.button>

                {/* Garanties */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Shield, label: "Paiement sécurisé" },
                    { icon: Truck, label: "Livraison rapide" },
                    { icon: RotateCcw, label: "Retour sous 7j" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e7dfd2] bg-white px-2 py-3 text-center">
                      <Icon className="h-4 w-4 text-[#1f4d3f]" />
                      <span className="text-[10px] font-semibold leading-tight text-[#8a9086]">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
               Produits associés
               ═══════════════════════════════════════════════════════════════ */}
            {product.related_products && product.related_products.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b5e34]">
                      Recommandations
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-[#1f241c]">Vous aimerez aussi</h2>
                  </div>
                  <Link
                    href="/products"
                    className="flex items-center gap-1 text-sm font-semibold text-[#1f4d3f] transition-colors hover:text-[#8b5e34]"
                  >
                    Voir tout
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {product.related_products.map((rp) => (
                    <RelatedProductCard key={rp.id} product={rp} />
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}









