
// // components/admin/produits/ProductCard.tsx
// "use client";
// import Image from "next/image";
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Edit3, Trash2, Layers, Crown, Eye } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import type { ProductDetail } from "@/modeles/produits";

// const PRODUCT_TYPE_FR: Record<string, string> = {
//   RAW: "Brut",
//   PROCESSED: "Transformé",
//   EXPORT: "Export",
// };

// interface ProductCardProps {
//   product: ProductDetail;
//   onClick?: () => void;
//   onEdit: () => void;
//   onDelete: () => void;
//   onAddVariant: () => void;
// }

// export function ProductCard({ product, onClick, onEdit, onDelete, onAddVariant }: ProductCardProps) {
//   const primaryImage = product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image || "";
//   const variantsCount = product.variants?.length || 0;
//   const isTop = product.is_top;
//   const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as any) || 0;
  
//   let stockLabel = "";
//   let stockDot = "";
//   let stockText = "";

//   if (stock === 0) {
//     stockLabel = "Épuisé";
//     stockDot = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
//     stockText = "text-red-600 font-bold";
//   } else if (stock <= 5) {
//     stockLabel = "Alerte critique";
//     stockDot = "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]";
//     stockText = "text-rose-600 font-bold";
//   } else if (stock <= 10) {
//     stockLabel = "Stock bas";
//     stockDot = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
//     stockText = "text-amber-600 font-semibold";
//   } else {
//     stockLabel = "En stock";
//     stockDot = "bg-emerald-500";
//     stockText = "text-emerald-600 font-medium";
//   }

//   const [imgError, setImgError] = useState(false);
//   const resolvedPrimaryImage = primaryImage
//     ? (primaryImage.startsWith("http")
//         ? primaryImage
//         : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${primaryImage.startsWith("/") ? "" : "/"}${primaryImage}`)
//     : null;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
//       onClick={onClick}
//       className="group relative flex flex-col rounded-[24px] border border-border/40 bg-surface shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden h-full min-h-[320px] w-full mx-auto cursor-pointer"
//     >
//       {/* Image Container - Superbe container avec padding */}
//       <div className="relative p-2.5 shrink-0">
//         <div className="relative w-full h-[170px] rounded-xl overflow-hidden bg-gradient-to-br from-surface-alt/80 to-surface-alt/30 border border-border/40 shadow-[inset_0_2px_15px_rgba(0,0,0,0.03)] group-hover:shadow-[inset_0_2px_20px_rgba(0,0,0,0.05)] transition-all duration-500 flex items-center justify-center">
          
//           {resolvedPrimaryImage && !imgError ? (
//             <div className="absolute inset-0">
//               <Image
//                 src={resolvedPrimaryImage}
//                 alt={product.name}
//                 fill
//                 className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
//                 sizes="(max-width: 640px) 100vw, 290px"
//                 onError={() => setImgError(true)}
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             </div>
//           ) : (
//             <div className="flex h-full items-center justify-center text-4xl opacity-30">📦</div>
//           )}

//           {/* Badges overlay */}
//           <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none z-10">
//             <div className="flex justify-between items-start">
//               <div className="flex flex-col gap-1.5">
//                 {isTop && (
//                   <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-1 text-[10px] font-extrabold text-white shadow-md backdrop-blur-sm w-fit">
//                     <Crown className="h-3 w-3" />TOP
//                   </span>
//                 )}
//               </div>
//               <div className="flex flex-col items-end gap-1.5">
//                 <span className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-black/80 px-2 py-1 text-[9px] font-bold shadow-md backdrop-blur-md border border-white/20">
//                   <div className={cn("h-1.5 w-1.5 rounded-full", stockDot)} />
//                   <span className={stockText}>{stockLabel}</span>
//                 </span>
//               </div>
//             </div>
//             <div className="flex justify-start items-end">
//               <span className="inline-flex items-center rounded-lg bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white border border-white/20 shadow-md uppercase tracking-wider">
//                 {product.category?.name || "Sans catégorie"}
//               </span>
//             </div>
//           </div>

//           {/* View overlay icon */}
//           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
//             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-[0_8px_16px_rgba(0,0,0,0.1)] backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out">
//               <Eye className="h-5 w-5" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content en dessous */}
//       <div className="flex flex-col flex-1 p-4 pt-2 gap-3">
//         {/* Header: Nom et Variantes */}
//         <div className="flex items-start justify-between gap-3">
//           <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
//             {product.name}
//           </h3>
//           {variantsCount > 0 && (
//             <span className="shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary border border-primary/20">
//               <Layers className="h-3 w-3" />{variantsCount}
//             </span>
//           )}
//         </div>

//         {/* Ligne Type (optionnel) */}
//         {product.product_type && (
//           <div className="flex items-center">
//             <span className="inline-flex items-center rounded-md bg-surface-alt px-2 py-1 text-[10px] font-semibold text-muted-foreground border border-border/50">
//               {PRODUCT_TYPE_FR[product.product_type] || product.product_type}
//             </span>
//           </div>
//         )}

//         {/* Prix et Actions style Console (Game Boy Color) */}
//         <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50 gap-2">
//           <div className="flex flex-col min-w-0">
//             <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Prix</span>
//             <span className="text-base sm:text-lg font-black text-primary leading-none truncate drop-shadow-sm">
//               {formatCurrency(parseFloat(product.price), "FCFA")}
//             </span>
//           </div>

//           {/* Action buttons type console */}
//           <div className="flex items-center gap-1.5">
//             <button
//               onClick={(e) => { e.stopPropagation(); onAddVariant(); }}
//               title="Gérer les variantes"
//               className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-elevated text-primary shadow-[0_3px_0_0_rgba(229,138,43,0.2)] hover:shadow-[0_2px_0_0_rgba(229,138,43,0.2)] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-150 border border-primary/20"
//             >
//               <Layers className="h-3.5 w-3.5" />
//             </button>
//             <button
//               onClick={(e) => { e.stopPropagation(); onEdit(); }}
//               title="Modifier"
//               className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-elevated text-amber-500 shadow-[0_3px_0_0_rgba(245,158,11,0.2)] hover:shadow-[0_2px_0_0_rgba(245,158,11,0.2)] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-150 border border-amber-500/20"
//             >
//               <Edit3 className="h-3.5 w-3.5" />
//             </button>
//             <button
//               onClick={(e) => { e.stopPropagation(); onDelete(); }}
//               title="Supprimer"
//               className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-elevated text-rose-500 shadow-[0_3px_0_0_rgba(244,63,94,0.2)] hover:shadow-[0_2px_0_0_rgba(244,63,94,0.2)] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-150 border border-rose-500/20"
//             >
//               <Trash2 className="h-3.5 w-3.5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }