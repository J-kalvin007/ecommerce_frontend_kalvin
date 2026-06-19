
// components/admin/produits/ProductFormSteps/StepGeneralInfo.tsx
"use client";
import { useState } from "react";
import { ChevronDown, Sparkles, Tag, Hash, FileText, DollarSign, Package, Weight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { slugify } from "../../productsUtils";
import type { ProductFormState, ProductFormErrors } from "../../productsUtils";

interface StepGeneralInfoProps {
  form: ProductFormState;
  errors: ProductFormErrors;
  onChange: (field: keyof ProductFormState, value: string | boolean) => void;
  categories: { id: string; name: string }[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
}

const PRODUCT_TYPES = [
  { value: "RAW", label: "Brut", description: "Matière première non transformée" },
  { value: "PROCESSED", label: "Transformé", description: "Produit fini ou semi-fini" },
  { value: "EXPORT", label: "Export", description: "Destiné à l'exportation" },
];

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border px-4 text-sm text-foreground outline-none transition-all duration-200",
        "focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/50",
        error ? "border-red-400 focus:border-red-400 focus:ring-red-400/15" : "border-border hover:border-border/80"
      )}
    />
  );
}

export function StepGeneralInfo({
  form, errors, onChange, categories, selectedCategoryId, onCategoryChange,
}: StepGeneralInfoProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateSKU = (name: string) => {
    if (!name) return "";
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "X");
    return `${prefix}-${Date.now().toString().slice(-4)}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onChange("name", newName);

    // Auto-generate slug if empty or previously matching
    if (!form.slug || form.slug === slugify(form.name)) {
      onChange("slug", slugify(newName));
    }

    // Auto-generate SKU if empty or previously auto-generated
    if (!form.sku || (form.name && form.sku.startsWith(form.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "X")))) {
      onChange("sku", generateSKU(newName));
    }
  };

  return (
    <div className="space-y-6">
      {/* Nom + Catégorie */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom du produit" error={errors.name} required>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={form.name}
              onChange={handleNameChange}
              placeholder="Ex : Poivre de Penja"
              error={errors.name}
              className="pl-10"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </Field>
        <Field label="Catégorie" error={errors.category} required>
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cn(
              "h-11 w-full rounded-xl border  px-4 text-sm text-foreground outline-none transition-all duration-200",
              "focus:border-primary focus:ring-2 focus:ring-primary/15",
              errors.category ? "border-red-400" : "border-border"
            )}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>

      {/* SKU + Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SKU" error={errors.sku} required>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={form.sku}
              onChange={(e) => onChange("sku", e.target.value)}
              placeholder="POIVRE-PENJA-001"
              error={errors.sku}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </Field>
        <Field label="Slug URL">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={form.slug}
              onChange={(e) => onChange("slug", e.target.value)}
              placeholder="poivre-de-penja (optionnel)"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </Field>
      </div>

      {/* Description */}
      <Field label="Description" error={errors.description}>
        <div className="relative">
          <FileText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Description détaillée du produit..."
            className={cn(
              "w-full rounded-xl border  py-3 pr-4 text-sm text-foreground outline-none transition-all duration-200 resize-none",
              "focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/50",
              errors.description ? "border-red-400" : "border-border",
            )}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </Field>

      {/* Prix + Stock + Poids */}
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Prix (FCFA)" error={errors.price} required>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="any"
              min="0"
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
              placeholder="12500"
              error={errors.price}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </Field>
        <Field label="Stock initial" error={errors.stock} required>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => onChange("stock", e.target.value)}
              placeholder="0"
              error={errors.stock}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </Field>
        <Field label="Poids (grammes)">
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              value={form.weight_grams}
              onChange={(e) => onChange("weight_grams", e.target.value)}
              placeholder="500"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </Field>
      </div>

      {/* Type de produit */}
      <Field label="Type de produit">
        <div className="grid grid-cols-3 gap-3">
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange("product_type", type.value)}
              className={cn(
                "flex flex-col cursor-pointer items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200",
                form.product_type === type.value
                  ? "border-primary bg-primary/8 ring-2 ring-primary/20"
                  : "border-border  hover:border-primary/40 hover:-alt"
              )}
            >
              <span className={cn("text-sm font-semibold", form.product_type === type.value ? "text-primary" : "text-foreground")}>
                {type.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">{type.description}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Champs avancés */}
      <div className="overflow-hidden rounded-xl border border-border/60 -alt/50">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:-alt/80"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Options avancées</p>
              <p className="text-xs text-muted-foreground">SEO, mise en avant</p>
            </div>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", showAdvanced && "rotate-180")} />
        </button>
        {showAdvanced && (
          <div className="space-y-4 border-t border-border/50 px-5 pb-5 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Titre SEO">
                <Input
                  value={form.seo_title}
                  onChange={(e) => onChange("seo_title", e.target.value)}
                  placeholder="Titre pour les moteurs de recherche"
                  maxLength={255}
                />
              </Field>
              <div className="flex items-end">
                <label className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-200",
                  form.is_top ? "border-primary bg-primary/8" : "border-border  hover:border-primary/30"
                )}>
                  <div className={cn(
                    "relative h-5 w-5 rounded flex items-center justify-center border-2 transition-all",
                    form.is_top ? "border-primary bg-primary" : "border-border"
                  )}>
                    <input
                      type="checkbox"
                      checked={form.is_top}
                      onChange={(e) => onChange("is_top", e.target.checked)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {form.is_top && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Produit TOP</p>
                    <p className="text-xs text-muted-foreground">Mis en avant sur le site</p>
                  </div>
                </label>
              </div>
            </div>
            <Field label="Description SEO">
              <textarea
                rows={2}
                value={form.seo_description}
                onChange={(e) => onChange("seo_description", e.target.value)}
                placeholder="Description courte pour les moteurs de recherche..."
                className="w-full rounded-xl border border-border  px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none placeholder:text-muted-foreground/50"
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
