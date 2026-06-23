// app/admin/components/promotions/components/PromoCodeModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/widgets_originaux/special/ui/Dialog";
import { Save, Loader2, Tag, Percent, Banknote, Truck, Clock, Sparkles, Check, Search, Layers, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPromoCode, DiscountType } from "@/modeles/promotions";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface PromoCodeModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: Partial<AdminPromoCode>;
    isEditing?: boolean;
    isSaving?: boolean;
    products?: any[];
    categories?: any[];
}

const INITIAL_FORM = {
    code: "",
    description: "",
    type: "percentage" as DiscountType,
    value: "",
    starts_at: "",
    expires_at: "",
    is_active: true,
    applicable_products: [] as string[],
    applicable_categories: [] as string[],
};

// Variants d'animation pour les champs du formulaire (staggered effect)
const formVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function PromoCodeModal({
    open,
    onClose,
    onSave,
    initialData = {},
    isEditing = false,
    isSaving = false,
    products = [],
    categories = []
}: PromoCodeModalProps) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [searchProduct, setSearchProduct] = useState("");
    const [searchCategory, setSearchCategory] = useState("");

    const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())) || [];
    const filteredCategories = categories?.filter(c => c.name.toLowerCase().includes(searchCategory.toLowerCase())) || [];

    useEffect(() => {
        if (open) {
            setForm({
                code: initialData.code || "",
                description: initialData.description || "",
                type: (initialData.type as DiscountType) || "percentage",
                value: initialData.value || "",
                starts_at: initialData.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : "",
                expires_at: initialData.expires_at ? new Date(initialData.expires_at).toISOString().slice(0, 16) : "",
                is_active: initialData.is_active ?? true,
                applicable_products: initialData.applicable_products?.map(p => typeof p === 'string' ? p : p.id) || [],
                applicable_categories: initialData.applicable_categories?.map(c => typeof c === 'string' ? c : c.id) || [],
            });
        }
    }, [open, initialData]);

    const handleChange = (field: keyof typeof form, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field: "applicable_products" | "applicable_categories", id: string) => {
        setForm((prev) => {
            const current = prev[field];
            const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
            return { ...prev, [field]: updated };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            ...form,
            value: form.value,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
            expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
            applicable_products: form.applicable_products,
            applicable_categories: form.applicable_categories,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-border/50 bg-white backdrop-blur-xl shadow-2xl shadow-primary/10">
                <div className="relative flex flex-col max-h-[90vh]">
                    {/* Glowing effect in background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-primary/10 blur-[100px] pointer-events-none rounded-t-full" />

                    <DialogHeader className="p-8 pb-4 relative z-10 border-b border-border/40">
                        <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 text-primary shadow-inner">
                                <Tag className="h-5 w-5" />
                            </div>
                            {isEditing ? "Modifier le code promo" : "Créer un code promo VIP"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-2">
                            Configurez une offre irrésistible pour vos clients avec des conditions précises.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 relative z-10">
                        <motion.div variants={formVariants} initial="hidden" animate="show" className="space-y-8">

                            {/* Section 1: Informations principales */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        Code Promo *
                                    </label>
                                    <input
                                        value={form.code}
                                        onChange={(e) => handleChange("code", e.target.value.toUpperCase().replace(/\s/g, ''))}
                                        className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-lg font-black tracking-widest text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm uppercase placeholder:text-muted-foreground/30 placeholder:font-normal placeholder:tracking-normal"
                                        placeholder="EX: SUMMER2024"
                                        required
                                    />
                                    <p className="mt-1.5 text-[10px] font-medium text-muted-foreground/70">
                                        Ce code sera saisi par vos clients lors du paiement.
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Type de réduction
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={form.type}
                                            onChange={(e) => handleChange("type", e.target.value)}
                                            className="h-12 w-full appearance-none rounded-xl border border-border/80 bg-surface/80 px-4 pr-10 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm cursor-pointer"
                                        >
                                            <option value="percentage">Pourcentage (%)</option>
                                            <option value="fixed_amount">Montant fixe (FCFA)</option>
                                            <option value="free_shipping">Livraison gratuite</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                            {form.type === 'percentage' && <Percent className="h-4 w-4" />}
                                            {form.type === 'fixed_amount' && <Banknote className="h-4 w-4" />}
                                            {form.type === 'free_shipping' && <Truck className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Valeur de la réduction *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            value={form.value}
                                            onChange={(e) => handleChange("value", e.target.value)}
                                            className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 pr-16 text-lg font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm placeholder:text-muted-foreground/40 placeholder:font-normal"
                                            placeholder="0"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-surface-alt px-2 py-1 rounded-md">
                                            {form.type === 'percentage' ? '%' : form.type === 'free_shipping' ? '---' : 'FCFA'}
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Description / Usage interne
                                    </label>
                                    <input
                                        value={form.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm placeholder:text-muted-foreground/40"
                                        placeholder="Ex: Opération rentrée scolaire..."
                                    />
                                </motion.div>
                            </div>

                            {/* Section 2: Période */}
                            <motion.div variants={itemVariants} className="p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-surface-alt shadow-inner">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <h4 className="text-sm font-bold">Validité dans le temps</h4>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                                            Début (Optionnel)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={form.starts_at}
                                            onChange={(e) => handleChange("starts_at", e.target.value)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface px-4 text-sm font-medium outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                                            Fin / Expiration (Optionnel)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={form.expires_at}
                                            onChange={(e) => handleChange("expires_at", e.target.value)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface px-4 text-sm font-medium outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 3: Restrictions multiples */}
                            <motion.div variants={itemVariants}>
                                <div className="mb-4 flex flex-col">
                                    <h4 className="text-sm font-bold text-foreground">Règles d'application</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Sélectionnez les catégories et produits spécifiques sur lesquels ce code fonctionne. Laissez vide pour qu'il s'applique à tout le panier.</p>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    {/* Catégories Multi-select UI */}
                                    <div className="flex flex-col">
                                        <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> Catégories spécifiques</span>
                                            {form.applicable_categories.length > 0 && (
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">{form.applicable_categories.length} sélectionnées</span>
                                            )}
                                        </label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                value={searchCategory}
                                                onChange={e => setSearchCategory(e.target.value)}
                                                placeholder="Rechercher une catégorie..."
                                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/80 bg-surface/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                            />
                                        </div>
                                        <div className="h-64 overflow-y-auto rounded-xl border border-border/80 bg-surface/30 p-2 shadow-inner custom-scrollbar">
                                            <div className="grid grid-cols-2 gap-2">
                                                {filteredCategories.length === 0 ? (
                                                    <div className="col-span-2 flex h-32 flex-col items-center justify-center text-xs text-muted-foreground">
                                                        <Layers className="h-8 w-8 mb-2 opacity-20" />
                                                        Aucune catégorie trouvée
                                                    </div>
                                                ) : (
                                                    filteredCategories.map(c => {
                                                        const isSelected = form.applicable_categories.includes(c.id);
                                                        return (
                                                            <label
                                                                key={c.id}
                                                                className={cn(
                                                                    "relative flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 border overflow-hidden group text-center",
                                                                    isSelected
                                                                        ? "bg-primary/5 border-primary shadow-[0_0_0_1px_rgba(var(--primary),1)]"
                                                                        : "bg-surface border-border hover:border-primary/40 hover:bg-surface-elevated"
                                                                )}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={isSelected}
                                                                    onChange={() => handleMultiSelect("applicable_categories", c.id)}
                                                                />
                                                                {/* Image ou Icon */}
                                                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-alt flex items-center justify-center">
                                                                    {c.image ? (
                                                                        <img src={c.image} alt={c.name} className={cn("w-full h-full object-cover transition-transform duration-500", isSelected ? "scale-105" : "group-hover:scale-105")} />
                                                                    ) : (
                                                                        <Layers className="h-8 w-8 text-muted-foreground/30" />
                                                                    )}
                                                                    <div className={cn(
                                                                        "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 backdrop-blur-md",
                                                                        isSelected ? "bg-primary text-white scale-100 opacity-100" : "bg-black/20 text-transparent scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                                                                    )}>
                                                                        <Check className="h-3 w-3" />
                                                                    </div>
                                                                </div>
                                                                <span className={cn("text-xs font-bold line-clamp-2 transition-colors", isSelected ? "text-primary" : "text-foreground")}>{c.name}</span>
                                                            </label>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Produits Multi-select UI */}
                                    <div className="flex flex-col">
                                        <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Package className="h-4 w-4" /> Produits spécifiques</span>
                                            {form.applicable_products.length > 0 && (
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">{form.applicable_products.length} sélectionnés</span>
                                            )}
                                        </label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <input
                                                value={searchProduct}
                                                onChange={e => setSearchProduct(e.target.value)}
                                                placeholder="Rechercher un produit..."
                                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/80 bg-surface/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                            />
                                        </div>
                                        <div className="h-64 overflow-y-auto rounded-xl border border-border/80 bg-surface/30 p-2 shadow-inner custom-scrollbar">
                                            <div className="grid grid-cols-1 gap-2">
                                                {filteredProducts.length === 0 ? (
                                                    <div className="flex h-32 flex-col items-center justify-center text-xs text-muted-foreground">
                                                        <Package className="h-8 w-8 mb-2 opacity-20" />
                                                        Aucun produit trouvé
                                                    </div>
                                                ) : (
                                                    filteredProducts.map(p => {
                                                        const isSelected = form.applicable_products.includes(p.id);
                                                        const primaryImageObj = p.images?.find((img: any) => img.is_primary) || p.images?.[0];
                                                        const imageSrc = primaryImageObj ? primaryImageObj.image : (p.primary_image ? (typeof p.primary_image === 'string' ? p.primary_image : p.primary_image.image) : null);
                                                        const catName = p.category?.name || p.category_name || "Sans catégorie";
                                                        const variantsCount = p.variants?.length || 0;
                                                        return (
                                                            <label
                                                                key={p.id}
                                                                className={cn(
                                                                    "relative flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300 border overflow-hidden group",
                                                                    isSelected
                                                                        ? "bg-primary/5 border-primary shadow-[0_0_0_1px_rgba(var(--primary),1)]"
                                                                        : "bg-surface border-border hover:border-primary/40 hover:bg-surface-elevated"
                                                                )}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={isSelected}
                                                                    onChange={() => handleMultiSelect("applicable_products", p.id)}
                                                                />
                                                                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-surface-alt flex items-center justify-center">
                                                                    {imageSrc ? (
                                                                        <img src={imageSrc} alt={p.name} className={cn("w-full h-full object-cover transition-transform duration-500", isSelected ? "scale-105" : "group-hover:scale-105")} />
                                                                    ) : (
                                                                        <Package className="h-6 w-6 text-muted-foreground/30" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0 pr-8">
                                                                    <p className={cn("text-sm font-bold truncate transition-colors", isSelected ? "text-primary" : "text-foreground")}>{p.name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <p className="text-[10px] text-muted-foreground truncate">{catName}</p>
                                                                        {variantsCount > 0 && (
                                                                            <span className="bg-surface-alt text-muted-foreground px-1.5 py-0.5 rounded text-[8px] font-bold">
                                                                                {variantsCount} variante{variantsCount > 1 ? 's' : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className={cn(
                                                                    "absolute right-3 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300",
                                                                    isSelected ? "bg-primary text-white scale-100 opacity-100" : "bg-surface-alt text-transparent scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:bg-black/10"
                                                                )}>
                                                                    <Check className="h-3 w-3" />
                                                                </div>
                                                            </label>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 4: Statut */}
                            <motion.label variants={itemVariants} className="flex items-center gap-3 p-4 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface-elevated transition-colors cursor-pointer group mt-4">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => handleChange("is_active", e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="h-6 w-10 rounded-full bg-surface-alt border border-border transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20"></div>
                                    <div className="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Code actif et disponible</p>
                                    <p className="text-xs text-muted-foreground">Si décoché, le code sera refusé lors du paiement.</p>
                                </div>
                            </motion.label>

                        </motion.div>

                        <div className="flex items-center justify-end gap-3 pt-10 pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-surface-alt transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="relative overflow-hidden flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isEditing ? "Enregistrer les modifications" : "Créer le code promo"}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}