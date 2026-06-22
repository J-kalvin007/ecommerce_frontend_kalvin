



// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight, ShoppingBag, Sparkles, Star } from "lucide-react";
// import { formatCurrency } from "@/lib/utils";
// import { getPublicProducts } from "@/fonctions_api/produits.api";
// import type { ProductList } from "@/modeles/produits";

// /** Squelette de chargement */
// function TrendingProductSkeleton() {
//   return (
//     <div className="overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
//       <div className="aspect-square animate-pulse bg-[#f3efe6]" />
//       <div className="space-y-2 p-3">
//         <div className="h-3 w-16 animate-pulse rounded bg-[#f3efe6]" />
//         <div className="h-4 w-3/4 animate-pulse rounded bg-[#f3efe6]" />
//         <div className="h-3 w-full animate-pulse rounded bg-[#f3efe6]" />
//         <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
//           <div className="h-4 w-20 animate-pulse rounded bg-[#f3efe6]" />
//           <div className="h-7 w-16 animate-pulse rounded-full bg-[#f3efe6]" />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function HomeTrendingProducts() {
//   const [products, setProducts] = useState<ProductList[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const result = await getPublicProducts({
//           ordering: "-count_ratings",
//           page_size: 4,
//         });

//         if (result.ok) {
//           // 🔥 Correction : fallback à [] si results est undefined
//           setProducts(result.data.results ?? []);
//         } else {
//           throw new Error(result.error?.message || "Erreur de chargement");
//         }
//       } catch (fetchError) {
//         console.error("Error loading trending products:", fetchError);
//         setError("Impossible de charger les produits les plus demandés.");
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   return (
//     <section className="relative overflow-hidden bg-transparent py-10 sm:py-12">
//       {/* ... le reste du JSX est inchangé ... */}
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute left-[10%] top-10 h-32 w-32 rounded-full bg-highlight/10 blur-3xl" />
//         <div className="absolute right-[8%] top-24 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 18 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: "-80px" }}
//           transition={{ duration: 0.45, ease: "easeOut" }}
//           className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
//         >
//           <div className="max-w-xl">
//             <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-highlight/15 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-highlight backdrop-blur-sm">
//               <Star className="h-3 w-3" />
//               Sélection
//             </div>
//             <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
//               Les plus demandés
//             </h2>
//             <p className="mt-1.5 text-sm leading-6 text-gray-600">
//               Une sélection rigoureuse de produits qui ont conquis notre communauté.
//             </p>
//           </div>

//           <Link
//             href="/products"
//             className="inline-flex items-center gap-1.5 self-start rounded-full border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-highlight/20 hover:text-highlight"
//           >
//             <span>Voir tout</span>
//             <ArrowRight className="h-3.5 w-3.5" />
//           </Link>
//         </motion.div>

//         {error ? (
//           <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         ) : null}

//         <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
//           {loading
//             ? Array.from({ length: 4 }).map((_, index) => (
//               <TrendingProductSkeleton key={`trending-skeleton-${index}`} />
//             ))
//             : products.map((product, idx) => {
//               const avgRating = parseFloat(product.note_produit) || 0;
//               const reviewCount = product.count_ratings;
//               const currency = "FCFA";
//               const isOutOfStock = product.stock === 0;

//               return (
//                 <motion.article
//                   key={product.id}
//                   initial={{ opacity: 0, y: 18 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true, margin: "-60px" }}
//                   transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
//                   className="group overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
//                 >
//                   <Link href={`/products/${product.slug}`} className="block">
//                     <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
//                       {product.primary_image?.image ? (
//                         <Image
//                           src={product.primary_image.image}
//                           alt={product.name}
//                           fill
//                           sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
//                           className="object-cover transition-transform duration-700 group-hover:scale-105"
//                         />
//                       ) : (
//                         <div className="flex h-full items-center justify-center text-xs text-gray-400">
//                           Aucune image
//                         </div>
//                       )}

//                       <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
//                         {product.category_name ? (
//                           <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-700 shadow-sm">
//                             {product.category_name}
//                           </span>
//                         ) : (
//                           <span />
//                         )}
//                         {!isOutOfStock ? (
//                           <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
//                             Disponible
//                           </span>
//                         ) : (
//                           <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
//                             Indisponible
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </Link>

//                   <div className="p-3">
//                     {avgRating > 0 ? (
//                       <div className="mb-1.5 flex items-center gap-0.5 text-primary">
//                         {Array.from({ length: 5 }).map((_, index) => (
//                           <Star
//                             key={index}
//                             className={`h-3 w-3 ${index < Math.floor(avgRating) ? "fill-current" : ""}`}
//                           />
//                         ))}
//                         <span className="ml-0.5 text-[10px] font-medium text-gray-700">
//                           {avgRating.toFixed(1)}
//                         </span>
//                         {reviewCount > 0 ? (
//                           <span className="text-[10px] text-gray-400">({reviewCount})</span>
//                         ) : null}
//                       </div>
//                     ) : null}

//                     <Link href={`/products/${product.slug}`}>
//                       <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
//                         {product.name}
//                       </h3>
//                     </Link>

//                     <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
//                       {product.category_name
//                         ? `Produit ${product.category_name.toLowerCase()} sélectionné pour sa qualité et sa fraîcheur.`
//                         : "Produit du terroir sélectionné pour sa qualité et sa fraîcheur."}
//                     </p>

//                     <div className="mt-3 flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
//                       <div>
//                         <p className="text-sm font-bold text-gray-900">
//                           {formatCurrency(product.price, currency)}
//                         </p>
//                       </div>

//                       <Link
//                         href={`/products/${product.slug}`}
//                         className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-primary"
//                       >
//                         <ShoppingBag className="h-3 w-3" />
//                         <span>Voir</span>
//                       </Link>
//                     </div>
//                   </div>
//                 </motion.article>
//               );
//             })}
//         </div>

//         {!loading && products.length === 0 ? (
//           <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-10 text-center">
//             <p className="text-sm font-medium text-gray-700">Aucun produit disponible pour le moment.</p>
//             <p className="mt-1 text-xs text-gray-500">
//               Les produits marqués comme top dans l&apos;admin apparaîtront ici en priorité.
//             </p>
//           </div>
//         ) : null}

//         <div className="mt-6 text-center">
//           <Link
//             href="/products"
//             className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
//           >
//             <span>Explorer la collection</span>
//             <ArrowRight className="h-4 w-4" />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

















"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, ShoppingBag, Star, X, Scale, Package, Leaf, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPublicProducts, getPublicProductById } from "@/fonctions_api/produits.api";
import type { ProductList, ProductDetail } from "@/modeles/produits";

/** Squelette de chargement */
function TrendingProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="aspect-square animate-pulse bg-[#f3efe6]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-16 animate-pulse rounded bg-[#f3efe6]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#f3efe6]" />
        <div className="h-3 w-full animate-pulse rounded bg-[#f3efe6]" />
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
          <div className="h-4 w-20 animate-pulse rounded bg-[#f3efe6]" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-[#f3efe6]" />
        </div>
      </div>
    </div>
  );
}

/** Conversion du grammage */
function formatWeight(grams: number | null | undefined): string {
  if (!grams || grams <= 0) return "";
  if (grams >= 1000) {
    const kg = (grams / 1000).toFixed(1).replace(/\.0$/, "");
    return `${kg} kg`;
  }
  return `${grams} g`;
}

/** Récupération de l'URL d'image principale (support objet ou string) */
function getPrimaryImageUrl(product: ProductList): string | null {
  const img = product.primary_image;
  if (!img) return null;
  if (typeof img === "string") return img;
  // objet avec champ image
  return (img as any).image ?? null;
}

/** Composant modal de détail produit */
function ProductDetailModal({
  product,
  onClose,
}: {
  product: ProductDetail;
  onClose: () => void;
}) {
  const avgRating = parseFloat(product.note_produit) || 0;
  const reviewCount = product.count_ratings;
  const favoritesCount = product.count_favorites;
  const currency = "FCFA";
  const mainImage = product.primary_image || product.images?.[0]?.image || null;
  const weightDisplay = formatWeight(product.weight_grams);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Contenu */}
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-black"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col overflow-y-auto md:flex-row">
          {/* Galerie d'images simplifiée */}
          <div className="relative w-full bg-[#faf7f2] md:w-1/2">
            <div className="aspect-square w-full overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Aucune image
                </div>
              )}
            </div>
            {/* Indicateur de type */}
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-700 shadow-sm">
              {product.product_type === "RAW"
                ? "Brut"
                : product.product_type === "PROCESSED"
                ? "Transformé"
                : "Export"}
            </div>
            {/* Poids mis en avant */}
            {weightDisplay && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                <Scale className="h-3.5 w-3.5" />
                <span>{weightDisplay}</span>
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="flex flex-col justify-start p-5 sm:p-6 md:w-1/2">
            {product.category?.name && (
              <div className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full border border-highlight/15 bg-highlight/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-highlight">
                <Tag className="h-3 w-3" />
                {product.category.name}
              </div>
            )}

            <h2 className="font-display text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
              {product.name}
            </h2>

            {product.description && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(avgRating)
                        ? "fill-primary text-primary"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                {avgRating > 0 && (
                  <span className="ml-1 text-sm font-semibold text-gray-800">
                    {avgRating.toFixed(1)}
                  </span>
                )}
                {reviewCount > 0 && (
                  <span className="text-xs text-gray-500">({reviewCount} avis)</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-rose-500">
                <Heart className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{favoritesCount}</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">
                {formatCurrency(product.price, currency)}
              </span>
              {product.stock > 0 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  En stock
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  Rupture
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
              {product.weight_grams && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Scale className="h-4 w-4 text-primary" />
                  <span className="font-medium">Poids</span>
                  <span className="text-gray-900">
                    {formatWeight(product.weight_grams)}
                  </span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium">SKU</span>
                  <span className="text-gray-900">{product.sku}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="font-medium">Stock disponible</span>
                  <span className="text-gray-900">{product.stock} unités</span>
                </div>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Variantes disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <span
                      key={variant.id}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {variant.name}
                      {variant.weight_grams && (
                        <span className="text-gray-500">
                          ({formatWeight(variant.weight_grams)})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(239,130,25,0.3)] transition hover:bg-primary-active"
              >
                <ShoppingBag className="h-4 w-4" />
                Voir la fiche complète
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HomeTrendingProducts() {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalProduct, setModalProduct] = useState<ProductDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getPublicProducts({
          ordering: "-count_ratings",
          page_size: 4,
          is_top: true,
        });

        if (result.ok) {
          const data = result.data;
          // L'API peut renvoyer directement un tableau ou un objet paginé avec results
          if (Array.isArray(data)) {
            setProducts(data);
          } else if (data && Array.isArray((data as any).results)) {
            setProducts((data as any).results);
          } else {
            setProducts([]);
          }
        } else {
          throw new Error(result.error?.message || "Erreur de chargement");
        }
      } catch (fetchError) {
        console.error("Error loading trending products:", fetchError);
        setError("Impossible de charger les produits les plus demandés.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openModal = async (productId: string) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const result = await getPublicProductById(productId);
      if (result.ok) {
        setModalProduct(result.data);
      } else {
        setModalError(result.error?.message || "Erreur de chargement du détail");
      }
    } catch (e) {
      setModalError("Erreur réseau lors du chargement du produit.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalProduct(null);
    setModalError(null);
  };

  return (
    <section className="relative overflow-hidden bg-transparent py-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-10 h-32 w-32 rounded-full bg-highlight/10 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-highlight/15 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-highlight backdrop-blur-sm">
              <Star className="h-3 w-3" />
              Sélection
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Les plus demandés
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-gray-600">
              Une sélection rigoureuse de produits qui ont conquis notre communauté.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-highlight/20 hover:text-highlight"
          >
            <span>Voir tout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <TrendingProductSkeleton key={`trending-skeleton-${index}`} />
              ))
            : products.map((product, idx) => {
                const avgRating = parseFloat(product.note_produit) || 0;
                const reviewCount = product.count_ratings;
                const favoritesCount = product.count_favorites;
                const currency = "FCFA";
                const isOutOfStock = product.stock === 0;
                const imageUrl = getPrimaryImageUrl(product);

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
                    onClick={() => openModal(product.id)}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  >
                    <div className="block">
                      <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            Aucune image
                          </div>
                        )}

                        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
                          {product.category_name ? (
                            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-700 shadow-sm">
                              {product.category_name}
                            </span>
                          ) : (
                            <span />
                          )}
                          {!isOutOfStock ? (
                            <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                              Disponible
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                              Indisponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        {avgRating > 0 ? (
                          <div className="flex items-center gap-0.5 text-primary">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-3 w-3 ${
                                  index < Math.floor(avgRating) ? "fill-current" : ""
                                }`}
                              />
                            ))}
                            <span className="ml-0.5 text-[10px] font-medium text-gray-700">
                              {avgRating.toFixed(1)}
                            </span>
                            {reviewCount > 0 && (
                              <span className="text-[10px] text-gray-400">
                                ({reviewCount})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div />
                        )}

                        {favoritesCount > 0 && (
                          <div className="flex items-center gap-0.5 text-gray-500">
                            <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
                            <span className="text-[10px] font-medium">
                              {favoritesCount}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                        {product.category_name
                          ? `Produit ${product.category_name.toLowerCase()} sélectionné pour sa qualité et sa fraîcheur.`
                          : "Produit du terroir sélectionné pour sa qualité et sa fraîcheur."}
                      </p>

                      <div className="mt-3 flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(product.price, currency)}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-primary">
                          <ShoppingBag className="h-3 w-3" />
                          <span>Voir</span>
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
        </div>

        {!loading && products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              Aucun produit disponible pour le moment.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Les produits marqués comme top dans l&apos;admin apparaîtront ici en priorité.
            </p>
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
          >
            <span>Explorer la collection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalLoading && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </motion.div>
        )}
        {modalError && !modalProduct && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <div className="rounded-xl bg-white p-6 text-center shadow-xl">
              <p className="text-red-600">{modalError}</p>
              <button
                onClick={closeModal}
                className="mt-3 text-sm font-medium text-primary underline"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
        {modalProduct && (
          <ProductDetailModal product={modalProduct} onClose={closeModal} />
        )}
      </AnimatePresence>
    </section>
  );
}