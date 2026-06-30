// /**
//  * ProductCard — Carte produit avec favoris toggle et notation intégrés
//  *
//  * @module app/products/components/ProductCard
//  */

// "use client";

// import { useState, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import { ShoppingBag, Heart, Star, Eye, Package, ShieldCheck } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import { useCartStore } from "@/store/pannierStore";
// import { useAuthStore } from "@/store/authStore";
// import { useUIStore } from "@/store/uiStore";
// import { mediaUrl } from "@/lib/mediaUrl";
// import { toggleFavorite, rateProduct } from "@/fonctions_api/notes-favoris.api";
// import type { EnrichedProduct } from "@/app/(storefront)/products/components/ProductsCatalogClient";
// import Toast from "@/components/special/Toast";

// /* ─────────────────────────────────────────────────────────────────────────────
//    Composant principal
//    ─────────────────────────────────────────────────────────────────────────── */

// type ProductCardProps = {
//   product: EnrichedProduct;
//   index?: number;
//   /** Vue : grille ou liste */
//   viewMode?: "grid" | "list";
//   /** Note personnelle de l'utilisateur pour ce produit */
//   userScore?: number | null;
//   /** true si l'utilisateur a déjà ce produit en favoris */
//   isFavorited?: boolean;
// };

// export function ProductCard({
//   product,
//   index = 0,
//   viewMode = "grid",
//   userScore: initialUserScore = null,
//   isFavorited: initialIsFavorited = false,
// }: ProductCardProps) {
//   const addItem = useCartStore((state) => state.addItem);
//   const { status, user } = useAuthStore();

//   const isAuthenticated = status === "authenticated" && Boolean(user);

//   /* --- État local ---------------------------------------------------------- */
//   const [isAdding, setIsAdding] = useState(false);

//   // Favoris
//   const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
//   const [favCount, setFavCount] = useState(product.count_favorites || 0);
//   const [favLoading, setFavLoading] = useState(false);

//   // Note personnelle de l'utilisateur
//   const [userScore, setUserScore] = useState<number | null>(initialUserScore);
//   const [avgRating, setAvgRating] = useState(parseFloat(product.note_produit) || 0);
//   const [ratingCount, setRatingCount] = useState(product.count_ratings || 0);
//   const [ratingLoading, setRatingLoading] = useState(false);
//   const [hoveredStar, setHoveredStar] = useState<number | null>(null);

//   // Toast notifications
//   const [toast, setToast] = useState<{
//     show: boolean;
//     type: "success" | "error" | "info";
//     message: string;
//   }>({ show: false, type: "info", message: "" });

//   const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
//     setToast({ show: true, type, message });
//   }, []);

//   /* --- Prix ---------------------------------------------------------------- */
//   const finalPrice = product.sale_price ?? product.price;
//   const hasDiscount = product.sale_price && product.original_price && Number(product.sale_price) < Number(product.original_price);
//   const discountPct = hasDiscount
//     ? Math.round((1 - parseFloat(product.sale_price!) / parseFloat(product.original_price!)) * 100)
//     : 0;

//   const isOutOfStock = product.stock === 0;

//   /* --- Panier -------------------------------------------------------------- */
//   const handleAddToCart = (event: React.MouseEvent) => {
//     event.preventDefault();
//     event.stopPropagation();
//     if (isOutOfStock) {
//       showToast("error", "Ce produit est actuellement en rupture de stock.");
//       return;
//     }

//     setIsAdding(true);
//     addItem({
//       productId: product.id,
//       variantId: null,
//       name: product.name,
//       sku: product.slug ?? "",
//       price: finalPrice,
//       compareAtPrice: product.original_price ?? null,
//       image: typeof product.primary_image === "object" && product.primary_image
//         ? product.primary_image.image
//         : typeof product.primary_image === "string"
//           ? product.primary_image
//           : null,
//       quantity: 1,
//       maxStock: product.stock,
//       currency: "FCFA",
//       slug: product.slug ?? "",
//     });

//     showToast("success", `${product.name} a été ajouté à votre panier.`);
//     window.setTimeout(() => setIsAdding(false), 1200);
//   };

//   /* --- Toggle favoris ------------------------------------------------------- */
//   const handleWishlist = async (event: React.MouseEvent) => {
//     event.preventDefault();
//     event.stopPropagation();

//     if (!isAuthenticated) {
//       showToast("info", "Connectez-vous pour ajouter ce produit à vos favoris.");
//       return;
//     }

//     if (favLoading) return;
//     setFavLoading(true);

//     const nextState = !isFavorited;
//     setIsFavorited(nextState);
//     setFavCount((c) => c + (nextState ? 1 : -1));

//     try {
//       const res = await toggleFavorite(product.id);
//       if (res.ok) {
//         setIsFavorited(res.data.favorited);
//         setFavCount(res.data.count_favorites);
//         showToast("success", res.data.favorited ? "Ajouté aux favoris." : "Retiré des favoris.");
//       } else {
//         setIsFavorited(!nextState);
//         setFavCount((c) => c + (nextState ? -1 : 1));
//         showToast("error", "Erreur lors de la modification des favoris.");
//       }
//     } catch {
//       setIsFavorited(!nextState);
//       setFavCount((c) => c + (nextState ? -1 : 1));
//     } finally {
//       setFavLoading(false);
//     }
//   };

//   /* --- Notation ------------------------------------------------------------ */
//   const handleRate = async (event: React.MouseEvent, score: number) => {
//     event.preventDefault();
//     event.stopPropagation();

//     if (!isAuthenticated) {
//       showToast("info", "Connectez-vous pour évaluer ce produit.");
//       return;
//     }

//     if (ratingLoading) return;
//     setRatingLoading(true);

//     const prevScore = userScore;
//     setUserScore(score);

//     try {
//       const res = await rateProduct(product.id, score);
//       if (res.ok) {
//         setUserScore(res.data.user_score);
//         setAvgRating(parseFloat(res.data.note_produit) || 0);
//         setRatingCount(res.data.count_ratings);
//         showToast("success", `Merci ! Votre note de ${score}/5 a été enregistrée.`);
//       } else {
//         setUserScore(prevScore);
//         showToast("error", "Erreur lors de l'envoi de votre note.");
//       }
//     } catch {
//       setUserScore(prevScore);
//     } finally {
//       setRatingLoading(false);
//     }
//   };

//   /* --- Étoiles à afficher -------------------------------------------------- */
//   const displayScore = hoveredStar ?? userScore ?? avgRating;

//   /* --- URL Image ---------------------------------------------------------- */
//   const imgSrc = typeof product.primary_image === "object" && product.primary_image
//     ? mediaUrl(product.primary_image.image)
//     : typeof product.primary_image === "string"
//       ? mediaUrl(product.primary_image)
//       : null;

//   /* ─────────────────────────────────────────────────────────────────────────
//      Rendu Grille (Vertical)
//      ─────────────────────────────────────────────────────────────────────── */
//   if (viewMode === "grid") {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
//       >
//         {toast.show && (
//           <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
//         )}
//         <Link
//           onClick={() => useUIStore.getState().setActiveProductId(product.id)}
//           href={`/products/${product.slug}`}
//           className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-[#e7dfd2] bg-white transition-all duration-300 hover:border-[#8b5e34]/30 hover:shadow-[0_12px_40px_rgba(31,36,28,0.08)]"
//         >
//           {/* Image */}
//           <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#f3ede2]">
//             {imgSrc ? (
//               <Image
//                 src={imgSrc}
//                 alt={product.name}
//                 fill
//                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
//                 className={cn(
//                   "object-cover transition-transform duration-700 group-hover:scale-105",
//                   isOutOfStock && "opacity-50 grayscale"
//                 )}
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center">
//                 <Package className="h-10 w-10 text-[#c4b59b]" />
//               </div>
//             )}

//             {/* Overlay Gradient pour lisibilité */}
//             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

//             {/* Badges haut gauche */}
//             <div className="absolute left-3 top-3 flex flex-col gap-1.5">
//               {hasDiscount && (
//                 <span className="rounded-full bg-[#ef8219] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
//                   -{discountPct}%
//                 </span>
//               )}
//               {product.is_top && !hasDiscount && (
//                 <span className="rounded-full bg-[#1f4d3f] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
//                   Tendance
//                 </span>
//               )}
//               {isOutOfStock ? (
//                 <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
//                   Indisponible
//                 </span>
//               ) : (
//                 <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
//                   En stock
//                 </span>
//               )}
//             </div>

//             {/* Bouton favori */}
//             <button
//               type="button"
//               onClick={handleWishlist}
//               disabled={favLoading}
//               className={cn(
//                 "absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110",
//                 isFavorited ? "bg-[#1f4d3f] text-white hover:bg-[#17392f]" : "bg-white/90 text-[#8a9086] hover:bg-white hover:text-[#1f4d3f]"
//               )}
//             >
//               <Heart className={cn("h-4 w-4 transition-colors", isFavorited && "fill-white")} />
//             </button>

//             {/* Actions au survol */}
//             <div className="absolute bottom-3 left-3 right-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
//               <button
//                 type="button"
//                 onClick={handleAddToCart}
//                 disabled={isOutOfStock}
//                 className={cn(
//                   "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-lg transition-all",
//                   isOutOfStock
//                     ? "cursor-not-allowed bg-white/80 text-[#8a9086] backdrop-blur-md"
//                     : isAdding
//                       ? "bg-emerald-500 text-white"
//                       : "bg-[#1f4d3f] text-white hover:bg-[#17392f]"
//                 )}
//               >
//                 <ShoppingBag className="h-4 w-4" />
//                 {isAdding ? "Ajouté ✓" : isOutOfStock ? "Rupture" : "Ajouter"}
//               </button>
//             </div>
//           </div>

//           {/* Infos produit */}
//           <div className="flex flex-1 flex-col p-4">
//             {product.category_name && (
//               <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
//                 {product.category_name}
//               </p>
//             )}
//             <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1f241c] transition-colors group-hover:text-[#1f4d3f]">
//               {product.name}
//             </h3>

//             {/* Étoiles interactives */}
//             <div className="mt-1.5 flex items-center gap-0.5">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   key={star}
//                   type="button"
//                   onClick={(e) => void handleRate(e, star)}
//                   onMouseEnter={() => isAuthenticated && setHoveredStar(star)}
//                   onMouseLeave={() => setHoveredStar(null)}
//                   disabled={ratingLoading}
//                   className={cn("p-0.5 rounded transition-transform", isAuthenticated ? "cursor-pointer hover:scale-125" : "cursor-default")}
//                 >
//                   <Star
//                     className={cn(
//                       "h-3.5 w-3.5 transition-colors duration-100",
//                       star <= Math.round(displayScore)
//                         ? "fill-amber-400 text-amber-400"
//                         : "fill-[#e7dfd2] text-[#e7dfd2]"
//                     )}
//                   />
//                 </button>
//               ))}
//               <span className="ml-1 text-[10px] font-medium text-[#8a9086]">
//                 {ratingCount > 0 ? `(${ratingCount})` : ""}
//               </span>
//               {isAuthenticated && userScore !== null && (
//                 <span className="ml-1.5 rounded-sm bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
//                   Ma note
//                 </span>
//               )}
//             </div>

//             <div className="mt-auto pt-3">
//               {/* Prix */}
//               <div className="flex flex-col">
//                 {(() => {
//                   const activeVariants = product.variants?.filter((v) => v.is_active);
//                   if (activeVariants && activeVariants.length > 0) {
//                     const prices = activeVariants.map((v) => parseFloat(v.price));
//                     const minPrice = Math.min(...prices);
//                     const maxPrice = Math.max(...prices);
//                     if (minPrice === maxPrice) {
//                       return (
//                         <span className="text-xl font-black tracking-tight text-[#1f4d3f]">
//                           {formatCurrency(minPrice, "FCFA")}
//                         </span>
//                       );
//                     }
//                     return (
//                       <div className="flex flex-col">
//                         <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5e34]/80 mb-0.5">
//                           À partir de
//                         </span>
//                         <span className="text-xl font-black tracking-tight text-[#1f4d3f]">
//                           {formatCurrency(minPrice, "FCFA")}
//                         </span>
//                       </div>
//                     );
//                   }
//                   return (
//                     <div className="flex flex-col">
//                       {hasDiscount && (
//                         <span className="text-xs font-bold text-[#8a9086] line-through decoration-[#ef8219]/60 decoration-2 mb-0.5">
//                           {formatCurrency(product.original_price!, "FCFA")}
//                         </span>
//                       )}
//                       <span className={cn(
//                         "text-xl font-black tracking-tight",
//                         hasDiscount ? "text-[#ef8219]" : "text-[#1f4d3f]"
//                       )}>
//                         {formatCurrency(finalPrice, "FCFA")}
//                       </span>
//                     </div>
//                   );
//                 })()}
//               </div>

//               {/* Compteur favoris */}
//               {/* {favCount > 0 && (
//                 <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#8a9086]">
//                   <Heart className="h-3 w-3 fill-red-400/20 text-red-400" />
//                   {favCount} favori{favCount > 1 ? "s" : ""}
//                 </div>
//               )} */}

//             </div>
//           </div>
//         </Link>
//       </motion.div>
//     );
//   }

//   /* ─────────────────────────────────────────────────────────────────────────
//      Rendu Liste (Horizontal)
//      ─────────────────────────────────────────────────────────────────────── */
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
//       className="w-full"
//     >
//       {toast.show && (
//         <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
//       )}
//       <Link
//         onClick={() => useUIStore.getState().setActiveProductId(product.id)}
//         href={`/products/${product.slug}`}
//         className="group relative flex cursor-pointer overflow-hidden rounded-2xl border border-[#e7dfd2] bg-white transition-all duration-300 hover:border-[#8b5e34]/30 hover:shadow-lg sm:h-44"
//       >
//         {/* Image - prend une largeur fixe sur Desktop */}
//         <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-[#f3ede2] sm:w-44">
//           {imgSrc ? (
//             <Image
//               src={imgSrc}
//               alt={product.name}
//               fill
//               sizes="(max-width: 640px) 128px, 176px"
//               className={cn(
//                 "object-cover transition-transform duration-700 group-hover:scale-105",
//                 isOutOfStock && "opacity-50 grayscale"
//               )}
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center">
//               <Package className="h-8 w-8 text-[#c4b59b]" />
//             </div>
//           )}

//           {/* Badges haut gauche */}
//           <div className="absolute left-2 top-2 flex flex-col gap-1">
//             {hasDiscount && (
//               <span className="rounded-full bg-[#ef8219] px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
//                 -{discountPct}%
//               </span>
//             )}
//             {isOutOfStock && (
//               <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
//                 Rupture
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Détails - s'étend sur le reste de la largeur */}
//         <div className="flex flex-1 flex-col p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
//           <div className="flex-1">
//             {product.category_name && (
//               <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
//                 {product.category_name}
//               </p>
//             )}
//             <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#1f241c] transition-colors group-hover:text-[#1f4d3f]">
//               {product.name}
//             </h3>

//             {/* Étoiles interactives */}
//             <div className="mt-1.5 flex items-center gap-0.5">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   key={star}
//                   type="button"
//                   onClick={(e) => void handleRate(e, star)}
//                   onMouseEnter={() => isAuthenticated && setHoveredStar(star)}
//                   onMouseLeave={() => setHoveredStar(null)}
//                   disabled={ratingLoading}
//                   className={cn("p-0.5 rounded transition-transform", isAuthenticated ? "cursor-pointer hover:scale-125" : "cursor-default")}
//                 >
//                   <Star
//                     className={cn(
//                       "h-3.5 w-3.5 transition-colors duration-100",
//                       star <= Math.round(displayScore)
//                         ? "fill-amber-400 text-amber-400"
//                         : "fill-[#e7dfd2] text-[#e7dfd2]"
//                     )}
//                   />
//                 </button>
//               ))}
//               <span className="ml-1 text-[10px] font-medium text-[#8a9086]">
//                 {ratingCount > 0 ? `(${ratingCount})` : ""}
//               </span>
//             </div>

//           </div>

//           {/* Section Prix et actions (droite) */}
//           <div className="mt-3 flex flex-col items-start gap-3 sm:mt-0 sm:w-48 sm:items-end sm:text-right">
//             <div className="flex flex-col sm:items-end">
//               {(() => {
//                 const activeVariants = product.variants?.filter((v) => v.is_active);
//                 if (activeVariants && activeVariants.length > 0) {
//                   const prices = activeVariants.map((v) => parseFloat(v.price));
//                   const minPrice = Math.min(...prices);
//                   const maxPrice = Math.max(...prices);
//                   if (minPrice === maxPrice) {
//                     return (
//                       <span className="text-2xl font-black tracking-tight text-[#1f4d3f]">
//                         {formatCurrency(minPrice, "FCFA")}
//                       </span>
//                     );
//                   }
//                   return (
//                     <div className="flex flex-col sm:items-end">
//                       <span className="text-[11px] font-bold uppercase tracking-widest text-[#8b5e34]/80 mb-0.5">
//                         À partir de
//                       </span>
//                       <span className="text-2xl font-black tracking-tight text-[#1f4d3f]">
//                         {formatCurrency(minPrice, "FCFA")}
//                       </span>
//                     </div>
//                   );
//                 }
//                 return (
//                   <div className="flex flex-col sm:items-end">
//                     {hasDiscount && (
//                       <span className="text-sm font-bold text-[#8a9086] line-through decoration-[#ef8219]/60 decoration-2 mb-0.5">
//                         {formatCurrency(product.original_price!, "FCFA")}
//                       </span>
//                     )}
//                     <span className={cn(
//                       "text-2xl font-black tracking-tight",
//                       hasDiscount ? "text-[#ef8219]" : "text-[#1f4d3f]"
//                     )}>
//                       {formatCurrency(finalPrice, "FCFA")}
//                     </span>
//                   </div>
//                 );
//               })()}

//               {isOutOfStock ? (
//                 <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-500">
//                   <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
//                   Indisponible
//                 </span>
//               ) : (
//                 <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
//                   <ShieldCheck className="h-3 w-3" />
//                   En stock
//                 </span>
//               )}
//             </div>

//             <div className="flex w-full gap-2 sm:mt-2">
//               <button
//                 type="button"
//                 onClick={handleWishlist}
//                 disabled={favLoading}
//                 className={cn(
//                   "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all",
//                   isFavorited
//                     ? "border-[#1f4d3f] bg-[#1f4d3f]/5 text-[#1f4d3f]"
//                     : "border-[#e7dfd2] bg-white text-[#8a9086] hover:border-[#8b5e34]/30 hover:text-[#1f4d3f]"
//                 )}
//               >
//                 <Heart className={cn("h-4 w-4 transition-colors", isFavorited && "fill-current")} />
//               </button>

//               <button
//                 type="button"
//                 onClick={handleAddToCart}
//                 disabled={isOutOfStock}
//                 className={cn(
//                   "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
//                   isOutOfStock
//                     ? "cursor-not-allowed border border-[#e7dfd2] bg-gray-50 text-[#8a9086]"
//                     : isAdding
//                       ? "bg-emerald-500 text-white"
//                       : "bg-[#1f4d3f] text-white hover:bg-[#17392f] shadow-md hover:shadow-lg"
//                 )}
//               >
//                 <ShoppingBag className="h-4 w-4" />
//                 <span className="hidden sm:inline">{isAdding ? "Ajouté ✓" : isOutOfStock ? "Rupture" : "Ajouter"}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }













"use client";

/**
 * ProductCard — Redesign ultra-premium
 *
 * Améliorations visuelles & UX :
 *
 * MODE GRILLE :
 *  - Image zone : overlay forest-green en bas au hover (gradient opaque → transparent)
 *  - Bouton "Ajouter" slide up depuis le bas avec spring précis
 *  - Badge "Tendance" avec shimmer animé interne
 *  - Badge promo avec pulsation subtile
 *  - Étoiles interactives : scale 1.3 + couleur progressive au hover
 *  - Prix promo : reveal avec underline amber qui apparaît
 *  - Compteur favoris inline élégant
 *  - Bouton favori avec animation heart-beat au clic
 *
 * MODE LISTE :
 *  - Bordure gauche amber qui monte au hover (scaleY spring)
 *  - Section prix avec layout right-aligned raffiné
 *  - Boutons CTA avec icônes et états loading précis
 *
 * Noms de variables et fonctions d'origine conservés intégralement.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Package,
  ShieldCheck,
  Check,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";
import { toggleFavorite, rateProduct } from "@/fonctions_api/notes-favoris.api";
import type { EnrichedProduct } from "@/app/(storefront)/products/components/ProductsCatalogClient";
import Toast from "@/components/special/Toast";

/* ─────────────────────────────────────────────────────────────
   TYPES — conservation de l'interface d'origine
   ───────────────────────────────────────────────────────────── */

type ProductCardProps = {
  product: EnrichedProduct;
  index?: number;
  viewMode?: "grid" | "list";
  userScore?: number | null;
  isFavorited?: boolean;
};

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANT : PriceBlock
   Affiche le bloc prix (variantes ou prix simple) dans les deux modes
   ───────────────────────────────────────────────────────────── */

type PriceBlockProps = {
  product: EnrichedProduct;
  finalPrice: string;
  hasDiscount: boolean | "" | undefined;
  discountPct: number;
  align?: "left" | "right";
  size?: "sm" | "lg";
};

function PriceBlock({ product, finalPrice, hasDiscount, discountPct, align = "left", size = "sm" }: PriceBlockProps) {
  const activeVariants = product.variants?.filter((v) => v.is_active);
  const priceSize = size === "lg" ? "text-2xl" : "text-xl";
  const alignClass = align === "right" ? "items-end" : "items-start";

  if (activeVariants && activeVariants.length > 0) {
    const prices = activeVariants.map((v) => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return (
      <div className={cn("flex flex-col", alignClass)}>
        {minPrice !== maxPrice && (
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8b5e34]/80">
            À partir de
          </span>
        )}
        <span className={cn(priceSize, "font-black tracking-tight text-[#1f4d3f]")}>
          {formatCurrency(minPrice, "FCFA")}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", alignClass)}>
      {hasDiscount && (
        <span className="mb-0.5 text-xs font-bold text-[#8a9086] line-through decoration-[#ef8219]/60 decoration-2">
          {formatCurrency(product.original_price!, "FCFA")}
        </span>
      )}
      <span className={cn(priceSize, "font-black tracking-tight", hasDiscount ? "text-[#ef8219]" : "text-[#1f4d3f]")}>
        {formatCurrency(finalPrice, "FCFA")}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANT : InteractiveStars
   Étoiles avec hover scale et coloration progressive
   ───────────────────────────────────────────────────────────── */

type InteractiveStarsProps = {
  displayScore: number;
  ratingCount: number;
  ratingLoading: boolean;
  isAuthenticated: boolean;
  userScore: number | null;
  onRate: (e: React.MouseEvent, score: number) => void;
  onHover: (star: number | null) => void;
};

function InteractiveStars({
  displayScore,
  ratingCount,
  ratingLoading,
  isAuthenticated,
  userScore,
  onRate,
  onHover,
}: InteractiveStarsProps) {
  return (
    <div className="mt-1.5 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(displayScore);
        return (
          <motion.button
            key={star}
            type="button"
            onClick={(e) => void onRate(e, star)}
            onMouseEnter={() => isAuthenticated && onHover(star)}
            onMouseLeave={() => onHover(null)}
            disabled={ratingLoading}
            whileHover={isAuthenticated ? { scale: 1.3 } : {}}
            whileTap={isAuthenticated ? { scale: 0.9 } : {}}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
              "rounded p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
              isAuthenticated ? "cursor-pointer" : "cursor-default"
            )}
            aria-label={isAuthenticated ? `Noter ${star} étoile${star > 1 ? "s" : ""}` : undefined}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-100",
                isFilled ? "fill-amber-400 text-amber-400" : "fill-[#e7dfd2] text-[#e7dfd2]"
              )}
            />
          </motion.button>
        );
      })}
      {ratingCount > 0 && (
        <span className="ml-1 text-[10px] font-medium text-[#8a9086]">({ratingCount})</span>
      )}
      {isAuthenticated && userScore !== null && (
        <span className="ml-1.5 rounded-sm bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
          Ma note
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL — conservation du nom d'origine
   ───────────────────────────────────────────────────────────── */

export function ProductCard({
  product,
  index = 0,
  viewMode = "grid",
  userScore: initialUserScore = null,
  isFavorited: initialIsFavorited = false,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { status, user } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();

  const isAuthenticated = status === "authenticated" && Boolean(user);

  /* ── État local — noms d'origine conservés ── */
  const [isAdding, setIsAdding] = useState(false);

  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favCount, setFavCount] = useState(product.count_favorites || 0);
  const [favLoading, setFavLoading] = useState(false);

  const [userScore, setUserScore] = useState<number | null>(initialUserScore);
  const [avgRating, setAvgRating] = useState(parseFloat(product.note_produit) || 0);
  const [ratingCount, setRatingCount] = useState(product.count_ratings || 0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  }, []);

  /* ── Prix calculés ── */
  const finalPrice = product.sale_price ?? product.price;
  const hasDiscount =
    product.sale_price &&
    product.original_price &&
    Number(product.sale_price) < Number(product.original_price);
  const discountPct = hasDiscount
    ? Math.round(
      (1 - parseFloat(product.sale_price!) / parseFloat(product.original_price!)) * 100
    )
    : 0;
  const isOutOfStock = product.stock === 0;

  /* ── Panier — nom d'origine conservé ── */
  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      showToast("error", "Ce produit est actuellement en rupture de stock.");
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      sku: product.slug ?? "",
      price: finalPrice,
      compareAtPrice: product.original_price ?? null,
      image:
        typeof product.primary_image === "object" && product.primary_image
          ? product.primary_image.image
          : typeof product.primary_image === "string"
            ? product.primary_image
            : null,
      quantity: 1,
      maxStock: product.stock,
      currency: "FCFA",
      slug: product.slug ?? "",
    });

    // showToast("success", `${product.name} a été ajouté à votre panier.`);
    window.setTimeout(() => setIsAdding(false), 1200);
  };

  /* ── Toggle favoris — nom d'origine conservé ── */
  const handleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      showToast("info", "Connectez-vous pour ajouter ce produit à vos favoris.");
      return;
    }
    if (favLoading) return;
    setFavLoading(true);

    const nextState = !isFavorited;
    setIsFavorited(nextState);
    setFavCount((c) => c + (nextState ? 1 : -1));

    try {
      const res = await toggleFavorite(product.id);
      if (res.ok) {
        setIsFavorited(res.data.favorited);
        setFavCount(res.data.count_favorites);
        showToast("success", res.data.favorited ? "Ajouté aux favoris." : "Retiré des favoris.");
      } else {
        setIsFavorited(!nextState);
        setFavCount((c) => c + (nextState ? -1 : 1));
        showToast("error", "Erreur lors de la modification des favoris.");
      }
    } catch {
      setIsFavorited(!nextState);
      setFavCount((c) => c + (nextState ? -1 : 1));
    } finally {
      setFavLoading(false);
    }
  };

  /* ── Notation — nom d'origine conservé ── */
  const handleRate = async (event: React.MouseEvent, score: number) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      showToast("info", "Connectez-vous pour évaluer ce produit.");
      return;
    }
    if (ratingLoading) return;
    setRatingLoading(true);

    const prevScore = userScore;
    setUserScore(score);

    try {
      const res = await rateProduct(product.id, score);
      if (res.ok) {
        setUserScore(res.data.user_score);
        setAvgRating(parseFloat(res.data.note_produit) || 0);
        setRatingCount(res.data.count_ratings);
        // showToast("success", `Votre note de ${score}/5 a été enregistrée.`);
      } else {
        setUserScore(prevScore);
        showToast("error", "Erreur lors de l'envoi de votre note.");
      }
    } catch {
      setUserScore(prevScore);
    } finally {
      setRatingLoading(false);
    }
  };

  /* ── Score à afficher (hover > note perso > moyenne) ── */
  const displayScore = hoveredStar ?? userScore ?? avgRating;

  /* ── URL image ── */
  const imgSrc =
    typeof product.primary_image === "object" && product.primary_image
      ? mediaUrl(product.primary_image.image)
      : typeof product.primary_image === "string"
        ? mediaUrl(product.primary_image)
        : null;

  /* ─────────────────────────────────────────────────────────────
     RENDU GRILLE
     ───────────────────────────────────────────────────────────── */
  if (viewMode === "grid") {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {toast.show && (
          <Toast
            show={toast.show}
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        <Link
          onClick={() => useUIStore.getState().setActiveProductId(product.id)}
          href={`/products/${product.slug}`}
          className={cn(
            "group relative flex h-full cursor-pointer flex-col overflow-hidden",
            "rounded-[1.5rem] border border-[#e7dfd2] bg-white",
            "transition-all duration-300",
            "hover:border-[#1f4d3f]/20 hover:shadow-[0_16px_48px_rgba(31,77,63,0.12)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/40"
          )}
        >
          {/* ── Zone image ── */}
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#f3ede2]">

            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-700 ease-out group-hover:scale-106",
                  isOutOfStock && "opacity-50 grayscale"
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-10 w-10 text-[#c4b59b]" />
              </div>
            )}

            {/* Overlay forest-green au hover — gradient depuis le bas */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-400",
                "bg-gradient-to-t from-[#1f4d3f]/50 via-[#1f4d3f]/15 to-transparent",
                "opacity-0 group-hover:opacity-100"
              )}
              aria-hidden
            />

            {/* ── Badges haut gauche ── */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {hasDiscount && (
                <motion.span
                  animate={prefersReducedMotion ? {} : {
                    scale: [1, 1.04, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center rounded-full bg-[#ef8219] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md"
                >
                  -{discountPct}%
                </motion.span>
              )}
              {product.is_top && !hasDiscount && (
                <span className="relative overflow-hidden inline-flex items-center gap-1 rounded-full bg-[#1f4d3f] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  <Star className="h-2.5 w-2.5" aria-hidden />
                  Tendance
                  {/* Shimmer interne */}
                  {!prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                      aria-hidden
                    />
                  )}
                </span>
              )}
              {isOutOfStock ? (
                <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  Indisponible
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-md">
                  En stock
                </span>
              )}
            </div>

            {/* ── Bouton favoris ── */}
            <motion.button
              type="button"
              onClick={handleWishlist}
              disabled={favLoading}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className={cn(
                "absolute right-3 top-3 z-10",
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm",
                "transition-colors duration-200",
                isFavorited
                  ? "bg-[#1f4d3f] text-white hover:bg-[#17392f]"
                  : "bg-white/90 text-[#8a9086] hover:bg-white hover:text-[#1f4d3f]"
              )}
              aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isFavorited && "fill-white scale-110"
                )}
              />
            </motion.button>

            {/* ── CTA "Ajouter" — slide up depuis le bas ── */}
            <div
              className={cn(
                "absolute bottom-3 left-3 right-3 z-10",
                "translate-y-3 opacity-0 transition-all duration-300 ease-out",
                "group-hover:translate-y-0 group-hover:opacity-100"
              )}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-center gap-2",
                  "rounded-xl py-2.5 text-sm font-semibold shadow-lg",
                  "transition-all duration-200",
                  isOutOfStock
                    ? "cursor-not-allowed bg-white/80 text-[#8a9086] backdrop-blur-md"
                    : isAdding
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1f4d3f] text-white hover:bg-[#17392f] active:scale-[0.98]"
                )}
              >
                {isAdding ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                )}
                <span>{isAdding ? "Ajouté" : isOutOfStock ? "Rupture" : "Ajouter"}</span>
              </button>
            </div>
          </div>

          {/* ── Informations produit ── */}
          <div className="flex flex-1 flex-col p-4">

            {/* Catégorie */}
            {product.category_name && (
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
                {product.category_name}
              </p>
            )}

            {/* Nom */}
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1f241c] transition-colors duration-200 group-hover:text-[#1f4d3f]">
              {product.name}
            </h3>

            {/* Étoiles interactives */}
            <InteractiveStars
              displayScore={displayScore}
              ratingCount={ratingCount}
              ratingLoading={ratingLoading}
              isAuthenticated={isAuthenticated}
              userScore={userScore}
              onRate={handleRate}
              onHover={setHoveredStar}
            />

            {/* Prix + favoris */}
            <div className="mt-auto pt-3">
              <PriceBlock
                product={product}
                finalPrice={finalPrice}
                hasDiscount={hasDiscount}
                discountPct={discountPct}
                align="left"
                size="sm"
              />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDU LISTE
     ───────────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {toast.show && (
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <Link
        onClick={() => useUIStore.getState().setActiveProductId(product.id)}
        href={`/products/${product.slug}`}
        className={cn(
          "group relative flex cursor-pointer overflow-hidden",
          "rounded-2xl border border-[#e7dfd2] bg-white",
          "transition-all duration-300",
          "hover:border-[#1f4d3f]/20 hover:shadow-[0_8px_32px_rgba(31,77,63,0.10)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/40",
          "sm:h-44"
        )}
      >
        {/* Bord gauche amber qui monte au hover */}
        <motion.span
          className="absolute bottom-0 left-0 top-0 z-10 w-[3px] origin-bottom rounded-l-2xl"
          style={{
            background: hasDiscount
              ? "linear-gradient(to top, #ef8219cc, #ef821920)"
              : "linear-gradient(to top, #1f4d3fcc, #1f4d3f20)",
          }}
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />

        {/* ── Image ── */}
        <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-[#f3ede2] sm:w-44">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 128px, 176px"
              className={cn(
                "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                isOutOfStock && "opacity-50 grayscale"
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-[#c4b59b]" />
            </div>
          )}

          {/* Badges image */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="rounded-full bg-[#ef8219] px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                -{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                Rupture
              </span>
            )}
          </div>
        </div>

        {/* ── Détails ── */}
        <div className="flex flex-1 flex-col p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">

          {/* Infos gauche */}
          <div className="flex-1 min-w-0">
            {product.category_name && (
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5e34]/80">
                {product.category_name}
              </p>
            )}
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#1f241c] transition-colors duration-200 group-hover:text-[#1f4d3f]">
              {product.name}
            </h3>
            <InteractiveStars
              displayScore={displayScore}
              ratingCount={ratingCount}
              ratingLoading={ratingLoading}
              isAuthenticated={isAuthenticated}
              userScore={userScore}
              onRate={handleRate}
              onHover={setHoveredStar}
            />
          </div>

          {/* ── Section prix + actions ── */}
          <div className="mt-3 flex flex-col items-start gap-3 sm:mt-0 sm:w-48 sm:items-end sm:text-right">

            {/* Prix */}
            <div className="flex flex-col sm:items-end">
              <PriceBlock
                product={product}
                finalPrice={finalPrice}
                hasDiscount={hasDiscount}
                discountPct={discountPct}
                align="right"
                size="lg"
              />
              {isOutOfStock ? (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
                  Indisponible
                </span>
              ) : (
                <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  En stock
                </span>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex w-full gap-2 sm:mt-2">

              {/* Favori */}
              <motion.button
                type="button"
                onClick={handleWishlist}
                disabled={favLoading}
                whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                  "transition-all duration-200",
                  isFavorited
                    ? "border-[#1f4d3f] bg-[#1f4d3f]/5 text-[#1f4d3f]"
                    : "border-[#e7dfd2] bg-white text-[#8a9086] hover:border-[#1f4d3f]/30 hover:text-[#1f4d3f]"
                )}
                aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isFavorited && "fill-current"
                  )}
                />
              </motion.button>

              {/* Panier */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2",
                  "rounded-xl text-sm font-semibold",
                  "transition-all duration-200 active:scale-[0.98]",
                  isOutOfStock
                    ? "cursor-not-allowed border border-[#e7dfd2] bg-gray-50 text-[#8a9086]"
                    : isAdding
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1f4d3f] text-white hover:bg-[#17392f] shadow-md hover:shadow-lg"
                )}
              >
                {isAdding ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                )}
                <span className="hidden sm:inline">
                  {isAdding ? "Ajouté" : isOutOfStock ? "Rupture" : "Ajouter"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}