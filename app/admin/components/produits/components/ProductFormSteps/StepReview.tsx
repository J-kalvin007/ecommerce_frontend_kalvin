
// components/admin/produits/ProductFormSteps/StepReview.tsx
"use client";
import { formatCurrency } from "@/lib/utils";
import type { ProductImageAdmin } from "@/modeles/produits";
import type { ProductFormState, UploadedProductImage } from "../../productsUtils";
import { CheckCircle2, Image as ImageIcon, Layers, Star, Package, Tag, DollarSign, Hash } from "lucide-react";

interface StepReviewProps {
  form: ProductFormState;
  selectedCategoryName: string;
  uploadedImages: UploadedProductImage[];
  existingImages: ProductImageAdmin[];
  variants: any[];
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  RAW: "Brut",
  PROCESSED: "Transformé",
  EXPORT: "Export",
};

function ReviewItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-xs text-muted-foreground min-w-[80px]">{label}</span>
      <span className="ml-auto text-sm font-semibold text-foreground text-right">{value || "—"}</span>
    </div>
  );
}

export function StepReview({ form, selectedCategoryName, uploadedImages, existingImages, variants }: StepReviewProps) {
  const totalImages = uploadedImages.length + existingImages.length;
  const variantsCount = variants.length;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-5 py-4">
        <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
        <div>
          <p className="font-bold text-foreground">Récapitulatif — tout est prêt !</p>
          <p className="text-xs text-muted-foreground">Vérifiez les informations avant d'enregistrer</p>
        </div>
      </div>

      {/* Infos générales */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Informations générales</h4>
        <div className="space-y-2">
          <ReviewItem icon={Tag} label="Nom" value={form.name} />
          <ReviewItem icon={Hash} label="SKU" value={<span className="font-mono text-xs">{form.sku}</span>} />
          <ReviewItem icon={Package} label="Catégorie" value={selectedCategoryName || "—"} />
          <ReviewItem icon={DollarSign} label="Prix" value={<span className="text-primary">{formatCurrency(parseFloat(form.price) || 0, "FCFA")}</span>} />
          <ReviewItem icon={Package} label="Stock" value={form.stock} />
          <ReviewItem icon={Package} label="Type" value={PRODUCT_TYPE_LABELS[form.product_type] || form.product_type} />
          {Number(form.weight_grams) > 0 && (
            <ReviewItem icon={Package} label="Poids" value={`${form.weight_grams} g`} />
          )}
          {form.is_top && (
            <ReviewItem icon={Star} label="Mis en avant" value={<span className="text-amber-600 font-bold">TOP ✓</span>} />
          )}
        </div>
      </div>

      {/* Médias & Variantes */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Médias & Variantes</h4>
        <div className="space-y-2">
          <ReviewItem icon={ImageIcon} label="Images" value={`${totalImages} fichier(s)`} />
          <ReviewItem icon={Layers} label="Variantes" value={variantsCount > 0 ? `${variantsCount} variante(s)` : "Aucune (à ajouter plus tard)"} />
        </div>
      </div>

      {/* Description */}
      {form.description && (
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
          <div className="rounded-xl border border-border/50 bg-surface-alt/50 px-4 py-3">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{form.description}</p>
          </div>
        </div>
      )}

      {/* Aperçu images uploadées */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Images à uploader</h4>
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border shadow-sm">
                <img src={img.preview} alt={img.alt_text || "Image"} className="h-full w-full object-cover" />
                {img.is_primary && <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-center text-[8px] font-bold text-white py-0.5">Principale</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des variantes */}
      {variants.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Aperçu des variantes</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {variants.map((v, i) => (
              <div key={v.id || i} className="flex flex-col gap-1 rounded-xl border border-border/50 bg-surface-alt/30 p-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-foreground">{v.name}</span>
                  <span className="text-xs font-bold text-primary">{formatCurrency(parseFloat(v.price) || 0, "FCFA")}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  <span>Stock: {v.stock}</span>
                  {v.sku && <span>SKU: {v.sku}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
