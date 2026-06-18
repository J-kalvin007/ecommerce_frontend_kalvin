// app/admin/components/promotions/components/FlashSaleModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/special/ui/Dialog";
import { Save, Loader2, Search, Zap, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface FlashSaleModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
    isEditing?: boolean;
    isSaving?: boolean;
    products?: { id: string; name: string }[];
}

const INITIAL_FORM = {
    product: "",
    variant: "",
    sale_price: "",
    quota_stock_limit: "",
    starts_at: "",
    ends_at: "",
    is_active: true,
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

export function FlashSaleModal({
    open,
    onClose,
    onSave,
    initialData = {},
    isEditing = false,
    isSaving = false,
    products = [],
}: FlashSaleModalProps) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [searchProduct, setSearchProduct] = useState("");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({
                product: initialData.product || "",
                variant: initialData.variant || "",
                sale_price: initialData.sale_price || "",
                quota_stock_limit: initialData.quota_stock_limit?.toString() || "",
                starts_at: initialData.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : "",
                ends_at: initialData.ends_at ? new Date(initialData.ends_at).toISOString().slice(0, 16) : "",
                is_active: initialData.is_active ?? true,
            });
            setSearchProduct("");
            setIsProductDropdownOpen(false);
        }
    }, [open, initialData]);

    const handleChange = (field: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            product: form.product,
            variant: form.variant || null,
            sale_price: form.sale_price,
            quota_stock_limit: form.quota_stock_limit ? parseInt(form.quota_stock_limit) : null,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
            is_active: form.is_active,
        });
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()));
    const selectedProductName = products.find(p => p.id === form.product)?.name;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-border/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <div className="relative flex flex-col max-h-[90vh]">
                    {/* Glowing effect in background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[80px] pointer-events-none rounded-t-full" />
                    
                    <DialogHeader className="p-8 pb-4 relative z-10 border-b border-border/40">
                        <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 text-primary shadow-inner">
                                <Zap className="h-5 w-5" />
                            </div>
                            {isEditing ? "Modifier la vente flash" : "Lancer une vente flash"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-2">
                            Configurez une promotion exclusive et éphémère pour générer de l'urgence.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 relative z-10">
                        <motion.div variants={formVariants} initial="hidden" animate="show" className="space-y-6">
                            
                            {/* Produit Selection (Custom Dropdown) */}
                            <motion.div variants={itemVariants} className="relative z-50">
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    <Tag className="h-3.5 w-3.5 text-primary" />
                                    Produit éligible *
                                </label>
                                
                                {products.length > 0 ? (
                                    <div className="relative">
                                        <div 
                                            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                                            className={cn(
                                                "flex items-center justify-between w-full h-12 rounded-xl border border-border/80 bg-surface/80 px-4 text-sm cursor-pointer transition-all hover:bg-surface-elevated hover:border-primary/50",
                                                isProductDropdownOpen && "ring-2 ring-primary/20 border-primary bg-surface-elevated"
                                            )}
                                        >
                                            <span className={cn("truncate font-medium", !form.product && "text-muted-foreground")}>
                                                {selectedProductName || "Sélectionnez un produit exceptionnel..."}
                                            </span>
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isProductDropdownOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full left-0 mt-2 w-full bg-surface-elevated border border-border/80 rounded-xl shadow-2xl shadow-black/10 overflow-hidden z-50"
                                                >
                                                    <div className="p-2 border-b border-border/50">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Rechercher un produit..." 
                                                            value={searchProduct}
                                                            onChange={(e) => setSearchProduct(e.target.value)}
                                                            className="w-full bg-surface rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-primary/50 transition-colors"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto p-1">
                                                        {filteredProducts.length === 0 ? (
                                                            <div className="p-4 text-center text-xs text-muted-foreground">Aucun produit trouvé</div>
                                                        ) : (
                                                            filteredProducts.map(p => (
                                                                <div 
                                                                    key={p.id}
                                                                    onClick={() => { handleChange("product", p.id); setIsProductDropdownOpen(false); }}
                                                                    className={cn(
                                                                        "px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors hover:bg-primary/10 hover:text-primary font-medium",
                                                                        form.product === p.id && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                                                                    )}
                                                                >
                                                                    {p.name}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <input
                                        value={form.product}
                                        onChange={(e) => handleChange("product", e.target.value)}
                                        placeholder="UUID du produit"
                                        className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                        required
                                    />
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Variante spécifique (UUID) - Optionnel
                                </label>
                                <input
                                    value={form.variant}
                                    onChange={(e) => handleChange("variant", e.target.value)}
                                    placeholder="Laissez vide pour appliquer au produit entier"
                                    className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                />
                            </motion.div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Nouveau prix soldé * (FCFA)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            value={form.sale_price}
                                            onChange={(e) => handleChange("sale_price", e.target.value)}
                                            className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 pr-16 text-lg font-bold text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm placeholder:text-muted-foreground/40 placeholder:font-normal"
                                            placeholder="0.00"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-surface-alt px-2 py-1 rounded-md">
                                            FCFA
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Stock alloué (Quota)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.quota_stock_limit}
                                        onChange={(e) => handleChange("quota_stock_limit", e.target.value)}
                                        placeholder="Illimité"
                                        className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                    />
                                    <p className="mt-1.5 text-[10px] font-medium text-muted-foreground/70">
                                        Laissez vide pour vendre jusqu'à épuisement du stock réel.
                                    </p>
                                </motion.div>
                            </div>

                            <motion.div variants={itemVariants} className="p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-surface-alt shadow-inner">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <h4 className="text-sm font-bold">Période d'activation</h4>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                                            Début
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={form.starts_at}
                                            onChange={(e) => handleChange("starts_at", e.target.value)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                                            Fin *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={form.ends_at}
                                            onChange={(e) => handleChange("ends_at", e.target.value)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface px-4 text-sm font-medium outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.label variants={itemVariants} className="flex items-center gap-3 p-4 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface-elevated transition-colors cursor-pointer group">
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
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Activer immédiatement</p>
                                    <p className="text-xs text-muted-foreground">Rend la vente visible et applicable sur le site.</p>
                                </div>
                            </motion.label>
                        </motion.div>

                        <div className="flex items-center justify-end gap-3 pt-8 pb-2">
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
                                {isEditing ? "Mettre à jour" : "Lancer la vente flash"}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}