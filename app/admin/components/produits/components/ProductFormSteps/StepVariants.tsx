
// components/admin/produits/ProductFormSteps/StepVariants.tsx
"use client";
import { useState } from "react";
import { Plus, Edit3, Trash2, Save, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductVariantAdmin } from "@/modeles/produits";

interface VariantForm { id?: string; name: string; sku: string; price: string; stock: string; weight_grams: string; }
interface StepVariantsProps { variants: ProductVariantAdmin[]; onAddVariant: (v: VariantForm) => Promise<void>; onUpdateVariant: (id: string, v: VariantForm) => Promise<void>; onDeleteVariant: (id: string) => void; isSaving?: boolean; }

export function StepVariants({ variants, onAddVariant, onUpdateVariant, onDeleteVariant, isSaving = false }: StepVariantsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VariantForm>({ name: "", sku: "", price: "", stock: "0", weight_grams: "0" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reset = () => { setEditingId(null); setForm({ name: "", sku: "", price: "", stock: "0", weight_grams: "0" }); };

  const generateSKU = (name: string) => {
    if (!name) return "";
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "X");
    return `VAR-${prefix}-${Date.now().toString().slice(-4)}`;
  };

  const handleNameChange = (val: string) => {
    setForm(prev => {
      const shouldUpdateSku = !prev.sku || prev.sku.startsWith("VAR-");
      return {
        ...prev,
        name: val,
        sku: shouldUpdateSku ? generateSKU(val) : prev.sku,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) return;

    if (editingId) {
      await onUpdateVariant(editingId, form);
      setSuccessMessage("Variante modifiée avec succès !");
    } else {
      await onAddVariant(form);
      setSuccessMessage("Nouvelle variante ajoutée !");
    }
    reset();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (v: ProductVariantAdmin) => { setEditingId(v.id); setForm({ name: v.name, sku: v.sku || "", price: v.price, stock: String(v.stock), weight_grams: String(v.weight_grams || 0) }); };
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-5/12 space-y-4">
        {/* Info Box */}
        <div className="flex items-start gap-3 rounded-xl bg-blue-50/50 p-3.5 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold mb-0.5">Section facultative</p>
            <p className="opacity-90">Si votre produit est unique, ignorez cette étape et cliquez sur Suivant.</p>
          </div>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 text-emerald-600 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
        )}

        <div className="rounded-2xl border border-border/60 -alt/30 p-5 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
            {editingId ? <Edit3 className="h-4 w-4 text-amber-500" /> : <Plus className="h-4 w-4 text-primary" />}
            {editingId ? "Modifier la variante" : "Ajouter une variante"}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom *</label>
              <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ex: Rouge, 500g..." className="h-10 w-full rounded-xl border border-border  px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prix (FCFA) *</label>
                <input type="number" step="any" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-10 w-full rounded-xl border border-border  px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="h-10 w-full rounded-xl border border-border  px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Auto" className="h-10 w-full rounded-xl border border-border  px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Poids (g)</label>
                <input type="number" min="0" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} placeholder="0" className="h-10 w-full rounded-xl border border-border  px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              {editingId && <button type="button" onClick={reset} className="rounded-xl border border-border  px-4 py-2 text-sm font-medium text-foreground hover:-alt transition-colors">Annuler</button>}
              <button type="submit" disabled={isSaving || !form.name || !form.price} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4 cursor-pointer" />{editingId ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: List */}
      <div className="w-full lg:w-7/12 rounded-2xl border border-border/60 /30 overflow-hidden flex flex-col h-[500px]">
        <div className="-alt/40 px-5 py-4 border-b border-border/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Variantes créées ({variants.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {variants.length > 0 ? (
            variants.map((v, idx) => (
              <div key={v.id || idx} className="group flex items-center justify-between rounded-xl border border-border  p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-foreground truncate">{v.name}</span>
                    <span className="rounded -alt px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{v.sku || "—"}</span>
                  </div>
                  <div className="flex gap-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className="text-primary">{formatCurrency(parseFloat(v.price), "FCFA")}</span>
                    <span>Stock: <span className={Number(v.stock) > 0 ? "text-amber-500" : "text-red-500"}>{v.stock}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity pl-4">
                  <button onClick={() => handleEdit(v)} className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-lg -alt text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDeleteVariant(v.id)} className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-lg -alt text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center opacity-60">
              <div className="rounded-full -alt p-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Aucune variante ajoutée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}