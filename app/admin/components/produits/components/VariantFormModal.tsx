
// components/admin/produits/VariantFormModal.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Edit3, Trash2, Layers, Save, Hash, DollarSign, Package, Weight, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { ProductVariantAdmin, ProductDetail } from "@/modeles/produits";

interface VariantForm {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  weight_grams: string;
  is_active: boolean;
}

interface VariantFormModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductDetail | null;
  variants: ProductVariantAdmin[];
  onAddVariant: (v: Omit<VariantForm, "id">) => Promise<void>;
  onUpdateVariant: (id: string, v: Omit<VariantForm, "id">) => Promise<void>;
  onDeleteVariant: (id: string) => void;
  isSaving?: boolean;
}

const EMPTY_FORM: VariantForm = { name: "", sku: "", price: "", stock: "0", weight_grams: "0", is_active: true };

function InputField({
  label, icon: Icon, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ElementType; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />}
        <input
          {...props}
          className={cn(
            "h-10 w-full rounded-lg border bg-surface text-sm text-foreground outline-none transition-all duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/40",
            Icon ? "pl-9 pr-3" : "px-3",
            error ? "border-red-400" : "border-border"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function VariantFormModal({
  open, onClose, product, variants, onAddVariant, onUpdateVariant, onDeleteVariant, isSaving = false
}: VariantFormModalProps) {
  const [form, setForm] = useState<VariantForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [localSaving, setLocalSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const generateSKU = (name: string) => {
    if (!name) return "";
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "X");
    return `VAR-${prefix}-${Date.now().toString().slice(-4)}`;
  };

  const handleNameChange = (val: string) => {
    setForm((prev) => {
      // If SKU is empty or was previously auto-generated (starts with VAR-), update it
      const shouldUpdateSku = !prev.sku || prev.sku.startsWith("VAR-");
      return {
        ...prev,
        name: val,
        sku: shouldUpdateSku ? generateSKU(val) : prev.sku,
      };
    });
  };

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setEditingId(null);
      setErrors({});
      setDeleteConfirmId(null);
    }
  }, [open]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Le nom est requis";
    if (!form.price.trim() || isNaN(parseFloat(form.price))) e.price = "Le prix est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = (v: ProductVariantAdmin) => {
    setEditingId(v.id);
    setForm({ name: v.name, sku: v.sku || "", price: v.price, stock: String(v.stock), weight_grams: String(v.weight_grams || 0), is_active: v.is_active });
    setErrors({});
  };

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLocalSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        price: form.price.trim(),
        stock: Number(form.stock || 0),
        weight_grams: Number(form.weight_grams || 0) || null,
        is_active: form.is_active,
      };
      if (editingId) {
        await onUpdateVariant(editingId, payload as any);
        setSuccessMessage("Variante modifiée avec succès !");
      } else {
        await onAddVariant(payload as any);
        setSuccessMessage("Nouvelle variante ajoutée !");
      }
      reset();
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setLocalSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col rounded-2xl border border-border/50 bg-surface shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground">Gestion des variantes</h2>
                <p className="text-xs text-muted-foreground truncate">{product?.name || "Ajoutez des déclinaisons à votre produit"}</p>
              </div>
              
              {/* Notification de succès */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 border border-emerald-500/20 text-emerald-600 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold">{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body 2 columns */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Column: Formulaire */}
              <div className="w-full lg:w-5/12 p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-border/50 bg-surface-alt/10">
                <div className="rounded-2xl border border-border/60 bg-surface p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3 border-b border-border/50 pb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {editingId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {editingId ? "Modifier la variante" : "Nouvelle variante"}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">Remplissez les caractéristiques</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                      label="Nom de la variante *"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: 500g, Rouge, XL..."
                      error={errors.name}
                    />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField
                        label="Prix (FCFA) *"
                        icon={DollarSign}
                        type="number"
                        step="any"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="6500"
                        error={errors.price}
                      />
                      <InputField
                        label="Stock"
                        icon={Package}
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField
                        label="SKU"
                        icon={Hash}
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        placeholder="Auto-généré"
                      />
                      <InputField
                        label="Poids (g)"
                        icon={Weight}
                        type="number"
                        min="0"
                        value={form.weight_grams}
                        onChange={(e) => setForm({ ...form, weight_grams: e.target.value })}
                        placeholder="500"
                      />
                    </div>

                    <div className="pt-2">
                      <label className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all hover:bg-surface-alt",
                        form.is_active ? "border-primary/30 bg-primary/5" : "border-border bg-surface"
                      )}>
                        <div className={cn(
                          "relative h-5 w-5 rounded flex items-center justify-center border-2 transition-all shrink-0",
                          form.is_active ? "border-primary bg-primary" : "border-border"
                        )}>
                          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="absolute inset-0 opacity-0 cursor-pointer" />
                          {form.is_active && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Visible en boutique</p>
                          <p className="text-[10px] text-muted-foreground">Activer ou désactiver cette variante</p>
                        </div>
                      </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border/50">
                      {editingId && (
                        <button type="button" onClick={reset} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-alt hover:text-foreground">
                          Annuler
                        </button>
                      )}
                      <motion.button
                        type="submit"
                        disabled={localSaving || isSaving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
                      >
                        {localSaving ? (
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {editingId ? "Mettre à jour" : "Ajouter la variante"}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Liste des variantes */}
              <div className="w-full lg:w-7/12 p-6 overflow-y-auto custom-scrollbar bg-surface/30">
                {variants.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Variantes existantes ({variants.length})
                      </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {variants.map((v, idx) => (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300",
                            editingId === v.id
                              ? "border-primary shadow-md shadow-primary/5 bg-primary/5 ring-1 ring-primary/20"
                              : "border-border/60 bg-surface shadow-sm hover:border-border hover:shadow-md hover:-translate-y-0.5"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={cn(
                                "h-2.5 w-2.5 rounded-full shrink-0 shadow-sm",
                                v.is_active ? "bg-emerald-500 shadow-emerald-500/50" : "bg-gray-300 shadow-gray-400/50"
                              )} />
                              <p className="font-bold text-sm text-foreground truncate" title={v.name}>{v.name}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(v)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-alt text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                title="Modifier"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              {deleteConfirmId === v.id ? (
                                <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-xl bg-surface p-1 shadow-lg border border-border">
                                  <button
                                    onClick={() => { onDeleteVariant(v.id); setDeleteConfirmId(null); }}
                                    className="flex items-center gap-1 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600 transition-colors"
                                  >
                                    <AlertCircle className="h-3 w-3" /> Confirmer
                                  </button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 rounded-lg text-[10px] font-bold text-muted-foreground hover:bg-surface-alt transition-colors">
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(v.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-alt text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-auto pt-2 border-t border-border/50">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Prix unitaire</p>
                              <p className="text-sm font-black text-primary">{formatCurrency(parseFloat(v.price), "FCFA")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Stock</p>
                              <p className={cn(
                                "text-sm font-bold",
                                Number(v.stock) > 10 ? "text-foreground" : Number(v.stock) > 0 ? "text-amber-500" : "text-red-500"
                              )}>
                                {v.stock} <span className="text-[10px] font-normal text-muted-foreground">unités</span>
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-5 transition-opacity">
                            <Layers className="h-16 w-16" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border/50 bg-surface-alt/20 p-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-sm border border-border/50">
                      <Layers className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">Aucune variante pour le moment</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                        Utilisez le formulaire à gauche pour créer la première déclinaison de ce produit.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-surface shrink-0 z-20">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {variants.length} variante{variants.length !== 1 ? "s" : ""} au total
              </div>
              <button onClick={onClose} className="rounded-lg bg-surface px-4 py-2 text-sm font-medium text-foreground border border-border transition-colors hover:bg-surface-alt">
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
