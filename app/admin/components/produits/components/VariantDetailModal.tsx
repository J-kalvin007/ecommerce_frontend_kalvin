
// components/admin/produits/VariantDetailModal.tsx
"use client";
import { X, Layers, Hash, Package, Weight, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { ProductVariant } from "@/modeles/produits";
import { Dialog, DialogContent, DialogTitle } from "@/components/widgets_originaux/special/ui/Dialog";

interface VariantDetailModalProps {
  open: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  productName: string;
}

function DetailRow({ icon: Icon, label, value, accent }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt border border-border/50">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground min-w-[90px]">{label}</span>
      <span className={cn("ml-auto text-sm font-semibold text-right", accent ? "text-primary" : "text-foreground")}>
        {value || <span className="text-muted-foreground/50 font-normal">—</span>}
      </span>
    </div>
  );
}

export function VariantDetailModal({ open, onClose, variant, productName }: VariantDetailModalProps) {
  if (!variant) return null;

  const stockStatus = variant.stock === 0
    ? { label: "Rupture de stock", color: "bg-red-500/10 text-red-600 border-red-200" }
    : variant.stock < 10
      ? { label: "Stock faible", color: "bg-amber-500/10 text-amber-600 border-amber-200" }
      : { label: "En stock", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/* Hide the default radix close button so we can use our custom styled one */}
      <DialogContent className="w-[95vw] sm:max-w-sm max-h-[85vh] flex flex-col p-0 overflow-hidden border border-border/40 shadow-2xl rounded-2xl bg-surface [&>button]:hidden">
        <DialogTitle className="sr-only">Détails de la variante {variant.name}</DialogTitle>

        {/* Gradient header */}
        <div className="shrink-0 relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 py-5">
          {/* Decorative circle */}
          <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-primary/8 blur-xl" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-surface/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-surface hover:text-foreground z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{productName}</p>
              <h2 className="text-base font-bold text-foreground truncate">{variant.name}</h2>
            </div>
          </div>
          {/* Prix prominent */}
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-3xl font-black text-primary tracking-tight">
              {formatCurrency(parseFloat(variant.price), "FCFA")}
            </span>
            <span className={cn("mb-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold", stockStatus.color)}>
              {stockStatus.label}
            </span>
          </div>
        </div>

        {/* Statut actif */}
        <div className={cn(
          "shrink-0 flex items-center gap-2 px-6 py-2.5 text-xs font-semibold border-b border-border/30",
          variant.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-gray-50 text-gray-500 dark:bg-gray-500/10 dark:text-gray-400"
        )}>
          {variant.is_active
            ? <><CheckCircle2 className="h-3.5 w-3.5" />Variante active — visible en boutique</>
            : <><XCircle className="h-3.5 w-3.5" />Variante inactive — masquée en boutique</>
          }
        </div>

        {/* Détails */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
          <DetailRow icon={Hash} label="SKU" value={<span className="font-mono text-xs">{variant.sku || "—"}</span>} />
          <div className="h-px bg-border/40" />
          <DetailRow icon={Package} label="Stock" value={<span className={variant.stock === 0 ? "text-red-500" : ""}>{variant.stock} unité{variant.stock !== 1 ? "s" : ""}</span>} accent />
          {variant.weight_grams && (
            <DetailRow icon={Weight} label="Poids" value={`${variant.weight_grams} g`} />
          )}
          <div className="h-px bg-border/40" />
          <DetailRow
            icon={Calendar}
            label="Créé le"
            value={<span className="text-xs font-medium">{formatDate(variant.created_at)}</span>}
          />
          <DetailRow
            icon={Clock}
            label="Modifié le"
            value={<span className="text-xs font-medium">{formatDate(variant.updated_at)}</span>}
          />
          {/* ID */}
          <div className="mt-4 rounded-lg border border-border/40 bg-surface-alt/40 px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Identifiant unique</p>
            <p className="text-[10px] font-mono text-muted-foreground break-all">{variant.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/30 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-surface-alt py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-border/40 active:scale-95"
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
