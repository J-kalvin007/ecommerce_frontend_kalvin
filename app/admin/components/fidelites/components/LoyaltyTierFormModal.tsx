/**
 * LoyaltyTierFormModal — Formulaire premium de création/édition d'un palier VIP
 *
 * Utilise le composant Dialog partagé et un design épuré avec animations
 * Framer Motion, palette sobre vert forêt / blanc.
 *
 * API : POST /api/v1/fidelites/admin/tiers/ | PATCH /api/v1/fidelites/admin/tiers/{id}/
 *
 * @module app/admin/components/fidelites/components/LoyaltyTierFormModal
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Crown, AlertTriangle, Banknote, Percent, Star, ArrowRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/widgets_originaux/special/Dialog";
import { cn } from "@/lib/utils";
import type { Tier } from "@/modeles/fidelites";
import { createAdminLoyaltyTier, updateAdminLoyaltyTier } from "@/fonctions_api/fidelites.api";

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface LoyaltyTierFormModalProps {
    open: boolean;
    onClose: () => void;
    tier: Tier | null;
    onSuccess: () => void;
}

/* ─────────────────────────────────────────────────────────────── */
/* Sous-composant — Champ de formulaire stylisé                   */
/* ─────────────────────────────────────────────────────────────── */
function FormField({
    label,
    hint,
    icon,
    required,
    children,
}: {
    label: string;
    hint?: string;
    icon?: React.ReactNode;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {icon}
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {hint && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────── */
/* Composant principal                                            */
/* ─────────────────────────────────────────────────────────────── */
export function LoyaltyTierFormModal({
    open,
    onClose,
    tier,
    onSuccess,
}: LoyaltyTierFormModalProps) {
    const [name, setName]                         = useState("");
    const [minPoints, setMinPoints]               = useState("");
    const [minSolde, setMinSolde]                 = useState("");
    const [discountPercent, setDiscountPercent]   = useState("");
    const [saving, setSaving]                     = useState(false);
    const [error, setError]                       = useState<string | null>(null);

    /* Pré-remplissage en mode édition */
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

    /* Soumission */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            name,
            min_points:       parseInt(minPoints) || 0,
            min_solde:        minSolde,
            discount_percent: discountPercent,
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

    /* Style partagé pour les inputs */
    const inputCls = "h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)] placeholder:text-slate-300 dark:placeholder:text-slate-600";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/40 bg-white dark:bg-[#1a1a1a] shadow-2xl">
                <div className="relative flex flex-col">
                    {/* Liseré supérieur signature */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                    {/* Halo ambiant */}
                    <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

                    {/* En-tête */}
                    <DialogHeader className="relative z-10 px-7 pt-8 pb-5 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-slate-900 dark:text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                <Crown className="h-5 w-5 text-primary" />
                            </div>
                            {tier ? "Modifier le palier" : "Nouveau palier VIP"}
                        </DialogTitle>
                        <DialogDescription className="mt-1.5 text-sm font-medium text-muted-foreground">
                            {tier
                                ? "Ajustez les conditions et avantages de ce palier de fidélité."
                                : "Définissez un nouveau niveau de récompense pour vos clients fidèles."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="relative z-10 px-7 py-6 space-y-5">

                        {/* Nom du palier */}
                        <FormField
                            label="Nom du palier"
                            hint="Ex: Bronze, Silver, Gold, Platinum, Diamond"
                            icon={<Star className="h-3 w-3" />}
                            required
                        >
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex: Gold"
                                required
                                className={inputCls}
                            />
                        </FormField>

                        {/* Points minimum */}
                        <FormField
                            label="Points minimum requis"
                            hint="Nombre de points lifetime nécessaires pour atteindre ce palier."
                            icon={<Star className="h-3 w-3" />}
                            required
                        >
                            <input
                                type="number"
                                min={0}
                                value={minPoints}
                                onChange={e => setMinPoints(e.target.value)}
                                placeholder="Ex: 1000"
                                required
                                className={inputCls}
                            />
                        </FormField>

                        {/* Dépenses min + Réduction */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="Dépenses min. (FCFA)"
                                icon={<Banknote className="h-3 w-3" />}
                            >
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={minSolde}
                                    onChange={e => setMinSolde(e.target.value)}
                                    placeholder="Ex: 50000"
                                    className={inputCls}
                                />
                            </FormField>
                            <FormField
                                label="Réduction (%)"
                                icon={<Percent className="h-3 w-3" />}
                            >
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.01"
                                    value={discountPercent}
                                    onChange={e => setDiscountPercent(e.target.value)}
                                    placeholder="Ex: 5"
                                    className={inputCls}
                                />
                            </FormField>
                        </div>

                        {/* Erreur */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-500"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                            </motion.div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl cursor-pointer px-5 py-3 text-sm font-bold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={saving || !name.trim()}
                                className="group relative flex flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                {saving ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</>
                                ) : (
                                    <>Sauvegarder <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
