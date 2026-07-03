/**
 * LoyaltyRewardRulePanel — Gestion des règles de gain de points (Admin)
 *
 * Affiche la liste des règles de gain (tranches de montant → points)
 * et expose un formulaire inline premium pour créer ou éditer une règle.
 *
 * API utilisée :
 *  GET  /api/v1/fidelites/admin/reward-rules/
 *  POST /api/v1/fidelites/admin/reward-rules/
 *  PATCH /api/v1/fidelites/admin/reward-rules/{id}/
 *  DELETE /api/v1/fidelites/admin/reward-rules/{id}/
 *
 * @module app/admin/components/fidelites/components/LoyaltyRewardRulePanel
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gift, Plus, Pencil, Trash2, Loader2, AlertCircle,
    Save, X, ArrowRight, TrendingUp, Hash, Banknote,
    ToggleLeft, ToggleRight, BadgeCheck, Package,
} from "lucide-react";
import {
    getAdminRewardRules,
    createAdminRewardRule,
    updateAdminRewardRule,
    deleteAdminRewardRule,
} from "@/fonctions_api/fidelites.api";
import type { LoyaltyRewardRule, LoyaltyRewardRulePayload } from "@/modeles/fidelites";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface LoyaltyRewardRulePanelProps {
    onToast: (type: "success" | "error", message: string) => void;
}

/* ─────────────────────────────────────────────────────────────── */
/* Valeur initiale d'un formulaire vide                           */
/* ─────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
    level: "",
    montant_min: "",
    montant_max: "",
    nombre_point_gagner: "",
    is_active: true,
};

/* ─────────────────────────────────────────────────────────────── */
/* Composant                                                       */
/* ─────────────────────────────────────────────────────────────── */
export function LoyaltyRewardRulePanel({ onToast }: LoyaltyRewardRulePanelProps) {
    /* -- State principal ---------------------------------------- */
    const [rules, setRules] = useState<LoyaltyRewardRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* -- Formulaire --------------------------------------------- */
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<LoyaltyRewardRule | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    /* -- Confirmation suppression -------------------------------- */
    const [deleteConfirm, setDeleteConfirm] = useState<LoyaltyRewardRule | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ── Chargement des données ────────────────────────────────── */
    const loadRules = async () => {
        setLoading(true);
        setError(null);
        const res = await getAdminRewardRules();
        if (res.ok) {
            setRules(res.data);
        } else {
            setError("Impossible de charger les règles de gain.");
        }
        setLoading(false);
    };

    useEffect(() => { loadRules(); }, []);

    /* ── Gestion du formulaire ─────────────────────────────────── */
    const openForm = (rule?: LoyaltyRewardRule) => {
        if (rule) {
            setEditingRule(rule);
            setForm({
                level: String(rule.level),
                montant_min: rule.montant_min,
                montant_max: rule.montant_max || "",
                nombre_point_gagner: String(rule.nombre_point_gagner),
                is_active: rule.is_active,
            });
        } else {
            setEditingRule(null);
            setForm(EMPTY_FORM);
        }
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingRule(null);
        setForm(EMPTY_FORM);
    };

    /** Met à jour un champ du formulaire de manière typée */
    const setField = <K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    /* ── Sauvegarde ────────────────────────────────────────────── */
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload: LoyaltyRewardRulePayload = {
            level: parseInt(form.level, 10) || 1,
            montant_min: form.montant_min,
            montant_max: form.montant_max || undefined,
            nombre_point_gagner: parseInt(form.nombre_point_gagner, 10) || 0,
            is_active: form.is_active,
        };

        const res = editingRule
            ? await updateAdminRewardRule(editingRule.id, payload)
            : await createAdminRewardRule(payload);

        if (res.ok) {
            onToast("success", `Règle de gain ${editingRule ? "modifiée" : "créée"} avec succès.`);
            closeForm();
            loadRules();
        } else {
            onToast("error", res.error.message || "Erreur lors de la sauvegarde.");
        }
        setSaving(false);
    };

    /* ── Suppression ───────────────────────────────────────────── */
    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        const res = await deleteAdminRewardRule(deleteConfirm.id);
        if (res.ok) {
            onToast("success", "Règle de gain supprimée.");
            loadRules();
        } else {
            onToast("error", res.error.message || "Erreur lors de la suppression.");
        }
        setDeleting(false);
        setDeleteConfirm(null);
    };

    /* ── Chargement ────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Synchronisation...</p>
                </div>
            </div>
        );
    }

    /* ── Rendu principal ───────────────────────────────────────── */
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            {/* Confirmation suppression */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Supprimer la règle de gain"
                message={`Voulez-vous vraiment supprimer cette règle de gain (Niveau ${deleteConfirm?.level}) ? Cette action est irréversible.`}
                confirmText="Supprimer"
                type="danger"
                isLoading={deleting}
            />

            {/* En-tête de section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                        <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Règles de Gain de Points
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground">
                            Définissez les tranches de montant et les points attribués à chaque achat.
                        </p>
                    </div>
                </div>
                {!isFormOpen && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openForm()}
                        className="group flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        <Plus className="h-4 w-4" />
                        Nouvelle Règle
                    </motion.button>
                )}
            </div>

            {/* Erreur */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-500"
                >
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <p className="text-sm font-semibold">{error}</p>
                </motion.div>
            )}

            {/* Formulaire ou liste */}
            <AnimatePresence mode="wait">
                {isFormOpen ? (
                    /* ─── FORMULAIRE ──────────────────────────────────────── */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    >
                        <form
                            onSubmit={handleSave}
                            className="relative overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] shadow-xl"
                        >
                            {/* Liseré supérieur signature */}
                            {/* <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" /> */}

                            <div className="p-7">
                                {/* En-tête formulaire */}
                                <div className="flex items-center justify-between mb-7">
                                    <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900 dark:text-white">
                                        <span className="h-6 w-1.5 rounded-full bg-primary shrink-0" />
                                        {editingRule ? "Modifier la Règle de Gain" : "Créer une Règle de Gain"}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground transition-all hover:rotate-90 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Champs */}
                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* Niveau */}
                                    <div>
                                        <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            <Hash className="h-3 w-3" />
                                            Niveau de la règle *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={form.level}
                                            onChange={e => setField("level", e.target.value)}
                                            placeholder="Ex: 1"
                                            className="h-13 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 text-[15px] font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                        />
                                        <p className="mt-1.5 text-xs text-muted-foreground">Ordre de priorité de la règle.</p>
                                    </div>

                                    {/* Points à gagner */}
                                    <div>
                                        <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            <TrendingUp className="h-3 w-3" />
                                            Points à attribuer *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={form.nombre_point_gagner}
                                            onChange={e => setField("nombre_point_gagner", e.target.value)}
                                            placeholder="Ex: 10"
                                            className="h-13 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 text-[15px] font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                        />
                                        <p className="mt-1.5 text-xs text-muted-foreground">Nombre de points attribués si la règle correspond.</p>
                                    </div>

                                    {/* Montant min */}
                                    <div>
                                        <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            <Banknote className="h-3 w-3" />
                                            Montant minimum (FCFA) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            step="0.01"
                                            value={form.montant_min}
                                            onChange={e => setField("montant_min", e.target.value)}
                                            placeholder="Ex: 0"
                                            className="h-13 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 text-[15px] font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                        />
                                        <p className="mt-1.5 text-xs text-muted-foreground">Montant d'achat minimum déclenchant cette règle.</p>
                                    </div>

                                    {/* Montant max */}
                                    <div>
                                        <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            <Banknote className="h-3 w-3" />
                                            Montant maximum (FCFA)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={form.montant_max}
                                            onChange={e => setField("montant_max", e.target.value)}
                                            placeholder="Ex: 50000 (vide = illimité)"
                                            className="h-13 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 text-[15px] font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                        />
                                        <p className="mt-1.5 text-xs text-muted-foreground">Laisser vide si la règle s'applique sans plafond.</p>
                                    </div>

                                    {/* Règle active (toggle) */}
                                    <div className="sm:col-span-2 flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={form.is_active}
                                            onClick={() => setField("is_active", !form.is_active)}
                                            className={cn(
                                                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                form.is_active ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                                            )}
                                        >
                                            <span className={cn(
                                                "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                form.is_active ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </button>

                                        <div>
                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                {form.is_active
                                                    ? <><ToggleRight className="h-4 w-4 text-primary" /> Règle active</>
                                                    : <><ToggleLeft className="h-4 w-4 text-muted-foreground" /> Règle inactive</>
                                                }
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {form.is_active
                                                    ? "Les points seront attribués automatiquement selon cette règle."
                                                    : "La règle est désactivée et n'attribuera aucun point."}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* Aperçu calculé */}
                                {form.montant_min && form.nombre_point_gagner && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-5 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
                                    >
                                        <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            Achat entre{" "}
                                            <span className="text-primary">
                                                {formatCurrency(parseFloat(form.montant_min) || 0, "FCFA")}
                                            </span>
                                            {form.montant_max
                                                ? <> et <span className="text-primary">{formatCurrency(parseFloat(form.montant_max), "FCFA")}</span></>
                                                : " et +"
                                            }
                                            {" → "}
                                            <span className="text-primary font-extrabold">
                                                {form.nombre_point_gagner} point{parseInt(form.nombre_point_gagner) > 1 ? "s" : ""} attribué{parseInt(form.nombre_point_gagner) > 1 ? "s" : ""}
                                            </span>
                                        </p>
                                    </motion.div>
                                )}

                                {/* Actions formulaire */}
                                <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="rounded-xl px-6 py-3 cursor-pointer text-sm font-bold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={saving || !form.montant_min || !form.nombre_point_gagner}
                                        className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Enregistrer
                                    </motion.button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    /* ─── LISTE des règles ────────────────────────────────── */
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
                                className={cn(
                                    "group relative flex flex-col justify-between overflow-hidden rounded-[20px] border bg-white dark:bg-[#1e1e1e] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
                                    rule.is_active
                                        ? "border-primary/20"
                                        : "border-slate-200 dark:border-slate-800 opacity-75"
                                )}
                            >
                                {/* Liseré top */}
                                {/* <div className={cn(
                                    "absolute inset-x-0 top-0 h-[2px] rounded-t-[20px]",
                                    rule.is_active
                                        ? "bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                                        : "bg-gradient-to-r from-transparent via-slate-300 to-transparent"
                                )} /> */}

                                {/* Badge inactif */}
                                {/* {!rule.is_active && (
                                    <span className="absolute top-3 right-3 rounded-full bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Inactif
                                    </span>
                                )} */}

                                {/* Corps */}
                                <div className="space-y-4">
                                    {/* Niveau + Badge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                                <span className="text-sm font-extrabold text-primary">#{rule.level}</span>
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Niveau {rule.level}
                                            </p>
                                        </div>
                                        {rule.is_active && (
                                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                Actif
                                            </span>
                                        )}
                                    </div>

                                    {/* Points hero */}
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Points attribués</p>
                                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                            {rule.nombre_point_gagner}
                                            <span className="text-base font-bold text-primary ml-1">pts</span>
                                        </p>
                                    </div>

                                    {/* Tranche de montant */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800">
                                            <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Min</p>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                {formatCurrency(parseFloat(rule.montant_min || "0"), "FCFA")}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800">
                                            <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5">Max</p>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                {rule.montant_max
                                                    ? formatCurrency(parseFloat(rule.montant_max), "FCFA")
                                                    : <span className="text-muted-foreground italic">Illimité</span>
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <button
                                        onClick={() => openForm(rule)}
                                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(rule)}
                                        className="shrink-0 cursor-pointer rounded-xl bg-red-50 dark:bg-red-500/10 p-2.5 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-500/20"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* État vide */}
                        {rules.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                    <Package className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Aucune règle configurée
                                </h3>
                                <p className="mt-2 text-sm font-medium text-muted-foreground max-w-xs">
                                    Créez votre première règle de gain pour attribuer automatiquement des points à vos clients.
                                </p>
                                <button
                                    onClick={() => openForm()}
                                    className="group relative mt-6 flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter une règle
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
