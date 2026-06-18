// app/admin/components/fidelites/components/LoyaltyTierFormModal.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Crown, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/special/Dialog";
import { cn } from "@/lib/utils";
import type { Tier } from "@/modeles/fidelites";
import { createAdminLoyaltyTier, updateAdminLoyaltyTier } from "@/fonctions_api/fidelites.api";

interface LoyaltyTierFormModalProps {
    open: boolean;
    onClose: () => void;
    tier: Tier | null;
    onSuccess: () => void;
}

export function LoyaltyTierFormModal({ open, onClose, tier, onSuccess }: LoyaltyTierFormModalProps) {
    const [name, setName] = useState("");
    const [minPoints, setMinPoints] = useState("");
    const [minSolde, setMinSolde] = useState("");
    const [discountPercent, setDiscountPercent] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            if (tier) {
                setName(tier.name);
                setMinPoints(tier.min_points.toString());
                setMinSolde(tier.min_solde?.toString() || "0");
                setDiscountPercent(tier.discount_percent?.toString() || "0");
            } else {
                setName("");
                setMinPoints("0");
                setMinSolde("0");
                setDiscountPercent("0");
            }
            setError(null);
            setSaving(false);
        }
    }, [open, tier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            name,
            min_points: parseInt(minPoints) || 0,
            min_solde: parseFloat(minSolde) || 0,
            discount_percent: parseFloat(discountPercent) || 0,
        };

        const res = tier
            ? await updateAdminLoyaltyTier(tier.id, payload)
            : await createAdminLoyaltyTier(payload);

        setSaving(false);

        if (res.ok) {
            onSuccess();
        } else {
            setError(res.error.message || "Erreur lors de la sauvegarde du palier.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <div className="relative flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[80px] pointer-events-none" />

                    <DialogHeader className="p-8 pb-4 relative z-10 border-b border-border/40">
                        <DialogTitle className="flex items-center gap-3 text-xl font-extrabold">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <Crown className="h-5 w-5" />
                            </div>
                            {tier ? "Modifier le palier" : "Nouveau palier"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1">
                            {tier ? "Ajustez les conditions de ce palier de fidélité." : "Définissez un nouveau niveau de récompense pour vos clients."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-8 space-y-5 relative z-10">
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom du palier *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Gold"
                                required
                                className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Points minimum requis *</label>
                            <input
                                type="number"
                                min={0}
                                value={minPoints}
                                onChange={e => setMinPoints(e.target.value)}
                                placeholder="Ex: 1000"
                                required
                                className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Dépenses min. (FCFA)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={minSolde}
                                    onChange={e => setMinSolde(e.target.value)}
                                    placeholder="Ex: 50000"
                                    className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Réduction (%)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.01"
                                    value={discountPercent}
                                    onChange={e => setDiscountPercent(e.target.value)}
                                    placeholder="Ex: 5"
                                    className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-400">
                                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-muted-foreground hover:bg-surface-alt transition-colors">
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !name.trim()}
                                className="relative flex-1 overflow-hidden rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
                                {saving
                                    ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</span>
                                    : "Sauvegarder"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
