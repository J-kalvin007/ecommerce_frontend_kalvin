"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Plus, Pencil, Trash2, Loader2, AlertCircle, Save, X, Check, EyeOff, Star } from "lucide-react";
import { getAdminRewardRules, createAdminRewardRule, updateAdminRewardRule, deleteAdminRewardRule } from "@/fonctions_api/fidelites.api";
import type { LoyaltyRewardRule, LoyaltyRewardRulePayload } from "@/modeles/fidelites";
import ConfirmDialog from "@/components/special/ConfirmDialog";

interface LoyaltyRewardRulePanelProps {
    onToast: (type: "success" | "error", message: string) => void;
}

export function LoyaltyRewardRulePanel({ onToast }: LoyaltyRewardRulePanelProps) {
    const [rules, setRules] = useState<LoyaltyRewardRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<LoyaltyRewardRule | null>(null);
    const [saving, setSaving] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [deleteConfirm, setDeleteConfirm] = useState<LoyaltyRewardRule | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadRules = async () => {
        setLoading(true);
        setError(null);
        const res = await getAdminRewardRules();
        if (res.ok) {
            setRules(res.data);
        } else {
            setError("Impossible de charger les règles de récompenses.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRules();
    }, []);

    const openForm = (rule?: LoyaltyRewardRule) => {
        if (rule) {
            setEditingRule(rule);
            setName(rule.name);
            setDescription(rule.description);
            setCost(String(rule.cost_in_points));
            setIsActive(rule.is_active);
        } else {
            setEditingRule(null);
            setName("");
            setDescription("");
            setCost("");
            setIsActive(true);
        }
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingRule(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        const payload: LoyaltyRewardRulePayload = {
            name,
            description,
            cost_in_points: parseInt(cost, 10),
            is_active: isActive,
        };

        const res = editingRule 
            ? await updateAdminRewardRule(editingRule.id, payload)
            : await createAdminRewardRule(payload);

        if (res.ok) {
            onToast("success", `Bénéfice ${editingRule ? "modifié" : "créé"} avec succès.`);
            closeForm();
            loadRules();
        } else {
            onToast("error", res.error.message || "Erreur lors de la sauvegarde.");
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        const res = await deleteAdminRewardRule(deleteConfirm.id);
        if (res.ok) {
            onToast("success", "Règle de récompense supprimée.");
            loadRules();
        } else {
            onToast("error", res.error.message || "Erreur lors de la suppression.");
        }
        setDeleting(false);
        setDeleteConfirm(null);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#C9963A]" />
                    <p className="text-sm font-semibold tracking-widest text-[#8a9685] uppercase">Synchronisation...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Supprimer la récompense"
                message={`Voulez-vous vraiment supprimer le bénéfice "${deleteConfirm?.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                type="danger"
                isLoading={deleting}
            />

            <div className="flex items-center justify-between border-b border-[#dde5d8] pb-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F2D20] to-[#1f4d34] border border-[#C9963A]/20 shadow-lg">
                        <Gift className="h-6 w-6 text-[#C9963A]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#0F2D20]">Règles de Récompenses</h2>
                        <p className="text-sm font-medium text-[#6b7a65]">
                            Gérez les cadeaux et réductions offerts contre des points.
                        </p>
                    </div>
                </div>
                {!isFormOpen && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openForm()}
                        className="flex items-center gap-2 rounded-xl bg-[#0F2D20] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1a4a30]"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau Bénéfice
                    </motion.button>
                )}
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-500">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <p className="text-sm font-semibold">{error}</p>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {isFormOpen ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleSave} className="relative rounded-[2rem] border border-[#dde5d8] bg-white p-8 shadow-[0_20px_60px_rgba(15,45,32,0.05)]">
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0F2D20] via-[#1a4a30] to-[#0F2D20]" />
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-[#0F2D20] flex items-center gap-2">
                                    <span className="h-8 w-2 rounded-full bg-[#C9963A]"></span>
                                    {editingRule ? "Modifier le Bénéfice" : "Créer un Nouveau Bénéfice"}
                                </h3>
                                <button type="button" onClick={closeForm} className="rounded-full bg-[#f8faf6] p-2 text-[#8a9685] transition-colors hover:bg-[#f0f3ed] hover:text-[#0F2D20]">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a9685]">
                                        Nom de la récompense
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Tasse Atelier du Terroir"
                                        className="h-14 w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] px-5 text-[15px] font-semibold text-[#0F2D20] outline-none transition-all focus:border-[#C9963A] focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a9685]">
                                        Coût (en points)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        placeholder="Ex: 500"
                                        className="h-14 w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] px-5 text-[15px] font-semibold text-[#0F2D20] outline-none transition-all focus:border-[#C9963A] focus:bg-white"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a9685]">
                                        Description détaillée
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Décrivez précisément les conditions ou le contenu de ce bénéfice."
                                        className="w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] p-5 text-[15px] font-semibold text-[#0F2D20] outline-none transition-all focus:border-[#C9963A] focus:bg-white resize-none"
                                    />
                                </div>
                                <div className="sm:col-span-2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isActive}
                                        onClick={() => setIsActive(!isActive)}
                                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? "bg-[#0F2D20]" : "bg-[#dde5d8]"}`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? "translate-x-5" : "translate-x-0"}`} />
                                    </button>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#0F2D20]">Règle Active</p>
                                        <p className="text-[11px] text-[#6b7a65]">Rend ce bénéfice disponible immédiatement pour les clients.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-[#f0f3ed]">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-xl px-6 py-3.5 text-sm font-bold text-[#6b7a65] hover:bg-[#f8faf6]"
                                >
                                    Annuler
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-xl bg-[#C9963A] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#b88530] disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Enregistrer
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {rules.map((rule, idx) => (
                            <motion.div
                                key={rule.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border ${rule.is_active ? "border-[#C9963A]/20 bg-white" : "border-[#dde5d8] bg-[#f8faf6] opacity-80"} p-6 shadow-sm transition-all hover:shadow-[0_12px_24px_rgba(15,45,32,0.06)]`}
                            >
                                {!rule.is_active && (
                                    <div className="absolute top-0 right-0 rounded-bl-[1.5rem] bg-[#dde5d8] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8a9685] flex items-center gap-1">
                                        <EyeOff className="h-3 w-3" /> Inactif
                                    </div>
                                )}
                                <div>
                                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#C9963A]/10 px-3 py-1">
                                        <Star className="h-3.5 w-3.5 text-[#C9963A]" />
                                        <span className="text-xs font-black text-[#C9963A]">{rule.cost_in_points} points</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#0F2D20] line-clamp-1">{rule.name}</h4>
                                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#6b7a65] line-clamp-3">
                                        {rule.description}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-[#f0f3ed]">
                                    <button
                                        onClick={() => openForm(rule)}
                                        className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-[#f8faf6] py-2 text-xs font-bold text-[#0F2D20] transition-colors hover:bg-[#eaf0e6]"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(rule)}
                                        className="flex-shrink-0 rounded-xl bg-red-50 p-2.5 text-red-500 transition-colors hover:bg-red-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {rules.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#dde5d8] py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f8faf6]">
                                    <Gift className="h-8 w-8 text-[#8a9685]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0F2D20]">Aucune règle configurée</h3>
                                <p className="mt-2 text-sm font-medium text-[#6b7a65]">Créez votre première récompense pour vos clients fidèles.</p>
                                <button
                                    onClick={() => openForm()}
                                    className="mt-6 flex items-center gap-2 rounded-xl bg-[#0F2D20] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1a4a30]"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter un bénéfice
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
