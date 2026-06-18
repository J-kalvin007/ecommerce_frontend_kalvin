
// components/admin/produits/ProductDetailModal.tsx
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/special/ui/Dialog";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { VariantDetailModal } from "./VariantDetailModal";
import { formatCurrency } from "@/lib/utils";
import type { ProductDetail, ProductVariant } from "@/modeles/produits";
import { Star, Package, Tag, Layers, Calendar, Globe, Box, Weight, TrendingUp, Heart, Info, Clock, ExternalLink, Crown, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PRODUCT_TYPE_FR: Record<string, string> = {
  RAW: "Brut",
  PROCESSED: "Transformé",
  EXPORT: "Export",
};

interface ProductDetailModalProps {
  product: ProductDetail | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

function InfoBadge({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface-alt/60 px-4 py-3 hover:bg-surface-alt transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground truncate">{value}</span>
      </div>
    </div>
  );
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantDetailOpen, setVariantDetailOpen] = useState(false);

  if (!product) return null;

  const avgRating = parseFloat(product.note_produit) || 0;
  const fullStars = Math.floor(avgRating);
  const hasHalfStar = avgRating - fullStars >= 0.5;

  const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as any) || 0;
  let stockLabel = "";
  let stockColor = "";
  let stockDot = "";

  if (stock === 0) {
    stockLabel = "Épuisé";
    stockColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    stockDot = "bg-red-500";
  } else if (stock <= 5) {
    stockLabel = "Alerte critique";
    stockColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    stockDot = "bg-rose-500 animate-pulse";
  } else if (stock <= 10) {
    stockLabel = "Stock bas";
    stockColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    stockDot = "bg-amber-500";
  } else {
    stockLabel = "En stock";
    stockColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    stockDot = "bg-emerald-500";
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const handleVariantClick = (v: ProductVariant) => {
    setSelectedVariant(v);
    setVariantDetailOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:max-w-5xl p-4 md:p-8 overflow-hidden border-none shadow-2xl rounded-2xl md:rounded-[2.5rem] bg-surface">
          <DialogTitle className="sr-only">Détails du produit {product.name}</DialogTitle>

          <div className="relative flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar gap-6 md:gap-8 pr-1 md:pr-2">
            {/* Header Split Layout */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch shrink-0">
              {/* Gauche : Image / Carousel & Galerie */}
              <div className="w-full md:w-[45%] shrink-0 flex flex-col gap-5">
                <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-gradient-to-br from-surface-alt/80 to-surface-alt/30 border border-border/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.03)] flex flex-col">
                  <div className="flex-1 relative min-h-[300px] md:min-h-[400px]">
                    {/* Assuming ProductImageCarousel handles filling its container. If not, we wrap it. */}
                    <ProductImageCarousel images={product.images} altText={product.name} />
                  </div>
                  {/* Badges superposés */}
                  <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
                    {product.is_top && (
                      <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[10px] font-extrabold text-white shadow-md backdrop-blur-sm">
                        <Crown className="h-3 w-3" />TOP
                      </span>
                    )}
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md", stockColor)}>
                      <div className={cn("h-2 w-2 rounded-full", stockDot)} />
                      {stockLabel}
                    </span>
                  </div>
                </div>

                {/* Galerie d'images */}
                {product.images?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-3">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Galerie d'images
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {product.images.map((img) => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border/50 shadow-sm bg-surface-alt">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.image.startsWith("http") ? img.image : `${process.env.NEXT_PUBLIC_API_URL || ""}${img.image}`}
                            alt={img.alt_text || "Image produit"}
                            className="h-16 w-16 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {img.is_primary && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[8px] text-white shadow-md backdrop-blur-sm font-bold">
                              ★
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sublime Divider */}
              <div className="hidden md:block w-px border-l-2 border-dashed border-border/60 my-4" />

              {/* Droite : Infos clés */}
              <div className="flex-1 flex flex-col justify-start py-2 pr-2 min-w-0 space-y-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm leading-tight mb-2">
                    {product.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Étoiles */}
                    <div className="flex items-center gap-2 bg-surface-alt px-3 py-1.5 rounded-full border border-border/50">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("h-3.5 w-3.5", i < fullStars ? "fill-amber-400 text-amber-400" : "text-border")} />
                        ))}
                        {hasHalfStar && <Star className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400" />}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{avgRating.toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">({product.count_ratings} avis)</span>
                    </div>
                    {/* Favoris */}
                    <div className="flex items-center gap-1.5 bg-surface-alt px-3 py-1.5 rounded-full border border-border/50">
                      <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                      <span className="text-xs font-bold text-muted-foreground">{product.count_favorites}</span>
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Prix de vente</span>
                  <div className="text-3xl font-black text-primary tracking-tight drop-shadow-sm">
                    {formatCurrency(parseFloat(product.price), "FCFA")}
                  </div>
                </div>

                {/* Grille de badges d'info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <InfoBadge icon={Package} label="SKU" value={<span className="font-mono">{product.sku}</span>} />
                  <InfoBadge icon={Tag} label="Catégorie" value={product.category?.name || "—"} />
                  <InfoBadge icon={Box} label="Type" value={PRODUCT_TYPE_FR[product.product_type] || product.product_type} />
                  <InfoBadge icon={TrendingUp} label="Stock" value={`${product.stock} unités`} />
                  {product.weight_grams && <InfoBadge icon={Weight} label="Poids" value={`${product.weight_grams} g`} />}
                  {product.slug && <InfoBadge icon={Globe} label="Slug" value={<span className="font-mono text-xs">{product.slug}</span>} />}
                  <InfoBadge icon={Calendar} label="Créé le" value={formatDate(product.created_at)} />
                  <InfoBadge icon={Clock} label="Mis à jour" value={formatDate(product.updated_at)} />
                </div>
              </div>
            </div>

            {/* Sublime Divider Horizontal */}
            <div className="w-full border-t-2 border-dashed border-border/50 shrink-0" />

            {/* Sections du bas */}
            <div className="flex flex-col gap-10 shrink-0">
              
              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                    <Info className="h-4 w-4" />
                    Description détaillée
                  </h4>
                  <div className="rounded-2xl bg-surface-elevated p-6 border border-border/50 shadow-sm">
                    <p className="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Variantes */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Variantes du produit
                  </h4>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {product.variants?.length || 0}
                  </div>
                </div>

                {product.variants?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {product.variants.map((v, idx) => (
                      <motion.button
                        key={v.id}
                        onClick={() => handleVariantClick(v)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -4, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex flex-col text-left overflow-hidden rounded-[20px] border border-border/50 bg-surface shadow-sm hover:border-primary/40 transition-all duration-300"
                      >
                        {/* En-tête variante */}
                        <div className="bg-gradient-to-br from-surface-alt to-surface-alt/40 p-5 border-b border-border/40 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{v.name}</h5>
                            <p className="text-[11px] font-mono text-muted-foreground mt-1.5 truncate bg-surface px-2 py-0.5 rounded-md border border-border/50 inline-block shadow-sm">{v.sku || "Sans SKU"}</p>
                          </div>
                          <div className={cn("h-3 w-3 rounded-full shrink-0 shadow-sm mt-1 border border-white/20", v.is_active ? "bg-emerald-500" : "bg-gray-300")} />
                        </div>
                        
                        {/* Contenu variante */}
                        <div className="p-5 flex flex-col gap-4">
                          <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider mb-1">Prix</span>
                              <span className="font-black text-lg text-primary leading-none">{formatCurrency(parseFloat(v.price), "FCFA")}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider mb-1">Stock</span>
                              <span className={cn("font-bold text-sm", v.stock > 0 ? "text-foreground" : "text-red-500")}>
                                {v.stock} {v.stock > 0 ? "u." : "(Épuisé)"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Icône d'action au hover */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-border/60 bg-surface-alt/30 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary/60 mb-4 border border-primary/10">
                      <Layers className="h-8 w-8" />
                    </div>
                    <p className="text-base font-bold text-foreground">Aucune variante</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">Ce produit ne possède aucune déclinaison (taille, couleur, etc).</p>
                  </div>
                )}
              </div>

              {/* Produits associés & SEO en grille si présents */}
              {(product.related_products?.length > 0 || product.seo_title) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Produits associés */}
                  {product.related_products?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                        <ExternalLink className="h-4 w-4" />
                        Produits associés
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {product.related_products.map((rp) => (
                          <span key={rp.id} className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-alt px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-surface-elevated transition-colors cursor-default shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-primary/40" />
                            {rp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SEO */}
                  {(product.seo_title || product.seo_description) && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                        <Globe className="h-4 w-4" />
                        Métadonnées SEO
                      </h4>
                      <div className="rounded-2xl border border-border/50 bg-surface-alt/50 p-5 space-y-3 shadow-sm">
                        {product.seo_title && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Titre SEO</span>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{product.seo_title}</p>
                          </div>
                        )}
                        {product.seo_description && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description SEO</span>
                            <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{product.seo_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale détail variante */}
      <VariantDetailModal
        open={variantDetailOpen}
        onClose={() => setVariantDetailOpen(false)}
        variant={selectedVariant}
        productName={product.name}
      />
    </>
  );
}









































// // components/admin/produits/ProductDetailModal.tsx
// "use client";
// import { useState } from "react";
// import { Dialog, DialogContent, DialogTitle } from "@/components/special/ui/Dialog";
// import { ProductImageCarousel } from "./ProductImageCarousel";
// import { VariantDetailModal } from "./VariantDetailModal";
// import { formatCurrency } from "@/lib/utils";
// import type { ProductDetail, ProductVariant } from "@/modeles/produits";
// import { Star, Package, Tag, Layers, Calendar, Globe, Box, Weight, TrendingUp, Heart, Info, Clock, ExternalLink, Crown, ChevronRight, Image as ImageIcon } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { motion } from "framer-motion";

// const PRODUCT_TYPE_FR: Record<string, string> = {
//   RAW: "Brut",
//   PROCESSED: "Transformé",
//   EXPORT: "Export",
// };

// interface ProductDetailModalProps {
//   product: ProductDetail | null;
//   open: boolean;
//   onClose: () => void;
//   onEdit?: () => void;
// }

// function InfoBadge({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
//   return (
//     <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface-alt/60 px-4 py-3 hover:bg-surface-alt transition-colors">
//       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
//         <Icon className="h-4 w-4" />
//       </div>
//       <div className="flex flex-col min-w-0 flex-1">
//         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
//         <span className="text-sm font-semibold text-foreground truncate">{value}</span>
//       </div>
//     </div>
//   );
// }

// export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
//   const [variantDetailOpen, setVariantDetailOpen] = useState(false);

//   if (!product) return null;

//   const avgRating = parseFloat(product.note_produit) || 0;
//   const fullStars = Math.floor(avgRating);
//   const hasHalfStar = avgRating - fullStars >= 0.5;

//   const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as any) || 0;
//   let stockLabel = "";
//   let stockColor = "";
//   let stockDot = "";

//   if (stock === 0) {
//     stockLabel = "Épuisé";
//     stockColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
//     stockDot = "bg-red-500";
//   } else if (stock <= 5) {
//     stockLabel = "Alerte critique";
//     stockColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
//     stockDot = "bg-rose-500 animate-pulse";
//   } else if (stock <= 10) {
//     stockLabel = "Stock bas";
//     stockColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
//     stockDot = "bg-amber-500";
//   } else {
//     stockLabel = "En stock";
//     stockColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
//     stockDot = "bg-emerald-500";
//   }

//   const formatDate = (d: string) =>
//     new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

//   const handleVariantClick = (v: ProductVariant) => {
//     setSelectedVariant(v);
//     setVariantDetailOpen(true);
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onClose}>
//         <DialogContent className="w-[95vw] sm:max-w-5xl p-4 md:p-8 overflow-hidden border-none shadow-2xl rounded-2xl md:rounded-[2.5rem] bg-surface">
//           <DialogTitle className="sr-only">Détails du produit {product.name}</DialogTitle>

//           <div className="relative flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar gap-6 md:gap-8 pr-1 md:pr-2">
//             {/* Header Split Layout */}
//             <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch shrink-0">
//               {/* Gauche : Image / Carousel */}
//               <div className="relative w-full md:w-[45%] shrink-0 rounded-2xl md:rounded-[2rem] overflow-hidden bg-gradient-to-br from-surface-alt/80 to-surface-alt/30 border border-border/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.03)] flex flex-col">
//                 <div className="flex-1 relative min-h-[300px] md:min-h-[400px]">
//                   {/* Assuming ProductImageCarousel handles filling its container. If not, we wrap it. */}
//                   <ProductImageCarousel images={product.images} altText={product.name} />
//                 </div>
//                 {/* Badges superposés */}
//                 <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
//                   {product.is_top && (
//                     <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-md backdrop-blur-sm">
//                       <Crown className="h-3.5 w-3.5" />TOP
//                     </span>
//                   )}
//                   <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-sm backdrop-blur-md", stockColor)}>
//                     <div className={cn("h-2 w-2 rounded-full", stockDot)} />
//                     {stockLabel}
//                   </span>
//                 </div>
//               </div>

//               {/* Sublime Divider */}
//               <div className="hidden md:block w-px border-l-2 border-dashed border-border/60 my-4" />

//               {/* Droite : Infos clés */}
//               <div className="flex-1 flex flex-col justify-start py-2 pr-2 min-w-0 space-y-6">
//                 <div>
//                   <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm leading-tight mb-3">
//                     {product.name}
//                   </h2>
//                   <div className="flex flex-wrap items-center gap-3">
//                     {/* Étoiles */}
//                     <div className="flex items-center gap-2 bg-surface-alt px-3 py-1.5 rounded-full border border-border/50">
//                       <div className="flex items-center gap-0.5">
//                         {[...Array(5)].map((_, i) => (
//                           <Star key={i} className={cn("h-3.5 w-3.5", i < fullStars ? "fill-amber-400 text-amber-400" : "text-border")} />
//                         ))}
//                         {hasHalfStar && <Star className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400" />}
//                       </div>
//                       <span className="text-xs font-bold text-muted-foreground">{avgRating.toFixed(1)}</span>
//                       <span className="text-[10px] text-muted-foreground">({product.count_ratings} avis)</span>
//                     </div>
//                     {/* Favoris */}
//                     <div className="flex items-center gap-1.5 bg-surface-alt px-3 py-1.5 rounded-full border border-border/50">
//                       <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
//                       <span className="text-xs font-bold text-muted-foreground">{product.count_favorites}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Prix */}
//                 <div className="flex flex-col">
//                   <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Prix de vente</span>
//                   <div className="text-4xl font-black text-primary tracking-tight drop-shadow-sm">
//                     {formatCurrency(parseFloat(product.price), "FCFA")}
//                   </div>
//                 </div>

//                 {/* Grille de badges d'info */}
//                 <div className="grid grid-cols-2 gap-3 mt-4">
//                   <InfoBadge icon={Package} label="SKU" value={<span className="font-mono">{product.sku}</span>} />
//                   <InfoBadge icon={Tag} label="Catégorie" value={product.category?.name || "—"} />
//                   <InfoBadge icon={Box} label="Type" value={PRODUCT_TYPE_FR[product.product_type] || product.product_type} />
//                   <InfoBadge icon={TrendingUp} label="Stock" value={`${product.stock} unités`} />
//                   {product.weight_grams && <InfoBadge icon={Weight} label="Poids" value={`${product.weight_grams} g`} />}
//                   {product.slug && <InfoBadge icon={Globe} label="Slug" value={<span className="font-mono text-xs">{product.slug}</span>} />}
//                   <InfoBadge icon={Calendar} label="Créé le" value={formatDate(product.created_at)} />
//                   <InfoBadge icon={Clock} label="Mis à jour" value={formatDate(product.updated_at)} />
//                 </div>
//               </div>
//             </div>

//             {/* Sublime Divider Horizontal */}
//             <div className="w-full border-t-2 border-dashed border-border/50 shrink-0" />

//             {/* Sections du bas */}
//             <div className="flex flex-col gap-10 shrink-0">
              
//               {/* Description */}
//               {product.description && (
//                 <div>
//                   <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
//                     <Info className="h-4 w-4" />
//                     Description détaillée
//                   </h4>
//                   <div className="rounded-2xl bg-surface-elevated p-6 border border-border/50 shadow-sm">
//                     <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
//                       {product.description}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Variantes */}
//               <div>
//                 <div className="flex items-center justify-between mb-5">
//                   <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
//                     <Layers className="h-4 w-4" />
//                     Variantes du produit
//                   </h4>
//                   <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
//                     {product.variants?.length || 0}
//                   </div>
//                 </div>

//                 {product.variants?.length ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                     {product.variants.map((v, idx) => (
//                       <motion.button
//                         key={v.id}
//                         onClick={() => handleVariantClick(v)}
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: idx * 0.05 }}
//                         whileHover={{ y: -4, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.15)" }}
//                         whileTap={{ scale: 0.98 }}
//                         className="group relative flex flex-col text-left overflow-hidden rounded-[20px] border border-border/50 bg-surface shadow-sm hover:border-primary/40 transition-all duration-300"
//                       >
//                         {/* En-tête variante */}
//                         <div className="bg-gradient-to-br from-surface-alt to-surface-alt/40 p-5 border-b border-border/40 flex items-start justify-between gap-4">
//                           <div className="min-w-0">
//                             <h5 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">{v.name}</h5>
//                             <p className="text-[11px] font-mono text-muted-foreground mt-1.5 truncate bg-surface px-2 py-0.5 rounded-md border border-border/50 inline-block shadow-sm">{v.sku || "Sans SKU"}</p>
//                           </div>
//                           <div className={cn("h-3 w-3 rounded-full shrink-0 shadow-sm mt-1 border border-white/20", v.is_active ? "bg-emerald-500" : "bg-gray-300")} />
//                         </div>
                        
//                         {/* Contenu variante */}
//                         <div className="p-5 flex flex-col gap-4">
//                           <div className="flex items-end justify-between">
//                             <div className="flex flex-col">
//                               <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider mb-1">Prix</span>
//                               <span className="font-black text-xl text-primary leading-none">{formatCurrency(parseFloat(v.price), "FCFA")}</span>
//                             </div>
//                             <div className="flex flex-col items-end">
//                               <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider mb-1">Stock</span>
//                               <span className={cn("font-bold text-[15px]", v.stock > 0 ? "text-foreground" : "text-red-500")}>
//                                 {v.stock} {v.stock > 0 ? "u." : "(Épuisé)"}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* Icône d'action au hover */}
//                         <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
//                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg">
//                             <ChevronRight className="h-5 w-5" />
//                           </div>
//                         </div>
//                       </motion.button>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-border/60 bg-surface-alt/30 text-center">
//                     <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary/60 mb-4 border border-primary/10">
//                       <Layers className="h-8 w-8" />
//                     </div>
//                     <p className="text-base font-bold text-foreground">Aucune variante</p>
//                     <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">Ce produit ne possède aucune déclinaison (taille, couleur, etc).</p>
//                   </div>
//                 )}
//               </div>

//               {/* Produits associés & SEO en grille si présents */}
//               {(product.related_products?.length > 0 || product.seo_title) && (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                   {/* Produits associés */}
//                   {product.related_products?.length > 0 && (
//                     <div>
//                       <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
//                         <ExternalLink className="h-4 w-4" />
//                         Produits associés
//                       </h4>
//                       <div className="flex flex-wrap gap-2.5">
//                         {product.related_products.map((rp) => (
//                           <span key={rp.id} className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-alt px-4 py-2 text-[13px] font-semibold text-foreground hover:bg-surface-elevated transition-colors cursor-default shadow-sm">
//                             <div className="h-2 w-2 rounded-full bg-primary/40" />
//                             {rp.name}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* SEO */}
//                   {(product.seo_title || product.seo_description) && (
//                     <div>
//                       <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
//                         <Globe className="h-4 w-4" />
//                         Métadonnées SEO
//                       </h4>
//                       <div className="rounded-2xl border border-border/50 bg-surface-alt/50 p-5 space-y-3 shadow-sm">
//                         {product.seo_title && (
//                           <div>
//                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Titre SEO</span>
//                             <p className="text-sm font-semibold text-foreground mt-0.5">{product.seo_title}</p>
//                           </div>
//                         )}
//                         {product.seo_description && (
//                           <div>
//                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description SEO</span>
//                             <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{product.seo_description}</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Galerie d'images */}
//               {product.images?.length > 0 && (
//                 <div>
//                   <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
//                     <ImageIcon className="h-4 w-4" />
//                     Galerie d'images
//                   </h4>
//                   <div className="flex flex-wrap gap-4">
//                     {product.images.map((img) => (
//                       <div key={img.id} className="relative group rounded-[1rem] overflow-hidden border border-border/50 shadow-sm bg-surface-alt">
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img
//                           src={img.image.startsWith("http") ? img.image : `${process.env.NEXT_PUBLIC_API_URL || ""}${img.image}`}
//                           alt={img.alt_text || "Image produit"}
//                           className="h-24 w-24 object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                         {img.is_primary && (
//                           <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] text-white shadow-md backdrop-blur-sm font-bold">
//                             ★
//                           </span>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Modale détail variante */}
//       <VariantDetailModal
//         open={variantDetailOpen}
//         onClose={() => setVariantDetailOpen(false)}
//         variant={selectedVariant}
//         productName={product.name}
//       />
//     </>
//   );
// }