/**
 * LoyaltyPointValuePanel — Paramétrage du taux de conversion points/FCFA
 *
 * Logique upsert : si une configuration active existe en base (récupérée via GET),
 * on la pré-remplit dans le formulaire. Lors de la sauvegarde :
 *  - PATCH {id} si la config existe déjà → il n'y a toujours qu'une seule ligne
 *  - POST sinon → crée la première configuration
 *
 * @module app/admin/components/fidelites/components/LoyaltyPointValuePanel
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, Save, Loader2, CheckCircle2, AlertCircle,
    Coins, Clock, Info, Star, ArrowRight, RefreshCcw, Sparkles,
} from "lucide-react";
import {
    getAdminPointValues,
    createAdminPointValue,
    updateAdminPointValue,
} from "@/fonctions_api/fidelites.api";
import type { PointValue } from "@/modeles/fidelites";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────── */
/* Props                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface LoyaltyPointValuePanelProps {
    onToast: (type: "success" | "error", message: string) => void;
}

/* ─────────────────────────────────────────────────────────────── */
/* Composant                                                       */
/* ─────────────────────────────────────────────────────────────── */
export function LoyaltyPointValuePanel({ onToast }: LoyaltyPointValuePanelProps) {
    /* -- État principal ----------------------------------------- */
    const [configs, setConfigs]           = useState<PointValue[]>([]);
    const [activeConfig, setActiveConfig] = useState<PointValue | null>(null);
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState<string | null>(null);

    /* -- Champs de formulaire ----------------------------------- */
    const [valeurUnPoint, setValeurUnPoint]   = useState("");
    const [nombreDePoint, setNombreDePoint]   = useState("");
    const [dureeValidite, setDureeValidite]   = useState("");

    /* ── Chargement (GET) — pré-remplissage de la config active ── */
    const loadConfigs = async () => {
        setLoading(true);
        setError(null);
        const res = await getAdminPointValues();
        if (res.ok) {
            setConfigs(res.data);
            /* On sélectionne la config active, ou la première disponible */
            const active = res.data.find(c => c.is_active) ?? res.data[0] ?? null;
            if (active) {
                setActiveConfig(active);
                setValeurUnPoint(String(active.valeur_un_point_frcfa));
                setNombreDePoint(String(active.nombre_de_point));
                setDureeValidite(String(active.duree_validite));
            } else {
                /* Aucune configuration en base → formulaire vide */
                setActiveConfig(null);
                setValeurUnPoint("");
                setNombreDePoint("");
                setDureeValidite("");
            }
        } else {
            setError("Impossible de charger la configuration de la valeur des points.");
        }
        setLoading(false);
    };

    useEffect(() => { loadConfigs(); }, []);

    /* ── Taux effectif calculé en live ─────────────────────────── */
    const ratio = parseFloat(nombreDePoint) > 0
        ? parseFloat(valeurUnPoint) / parseFloat(nombreDePoint)
        : 0;

    /* ── Sauvegarde — Logique UPSERT ────────────────────────────
     * - PATCH si activeConfig.id existe  → met à jour l'unique ligne
     * - POST sinon                        → crée la première ligne
     * ──────────────────────────────────────────────────────────── */
    const handleSave = async () => {
        setSaving(true);

        const payload = {
            valeur_un_point_frcfa: parseFloat(valeurUnPoint),
            nombre_de_point:       parseInt(nombreDePoint, 10),
            duree_validite:        parseInt(dureeValidite, 10) || 0,
            is_active:             true,
        };

        const res = activeConfig?.id
            ? await updateAdminPointValue(activeConfig.id, payload)   // PATCH
            : await createAdminPointValue(payload);                    // POST

        if (res.ok) {
            onToast("success", "Configuration du taux de conversion sauvegardée avec succès.");
            loadConfigs(); /* Recharge pour synchroniser l'état */
        } else {
            onToast("error", res.error.message || "Erreur lors de la sauvegarde.");
        }
        setSaving(false);
    };

    /* ── États de chargement / erreur ─────────────────────────── */
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                        Synchronisation...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !activeConfig) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center"
            >
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-sm font-semibold text-red-500">{error}</p>
                <button
                    onClick={loadConfigs}
                    className="flex items-center gap-2 rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-500/20 cursor-pointer"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Réessayer
                </button>
            </motion.div>
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
            {/* En-tête */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Paramétrage du Taux de Conversion
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                        Définissez la valeur exacte en FCFA de chaque point gagné par vos clients.
                    </p>
                </div>
            </div>

            {/* Carte principale */}
            <div className="relative overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] shadow-xl">
                {/* Liseré supérieur signature */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                {/* Halos ambiants */}
                <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-slate-100/80 dark:bg-slate-800/30 blur-3xl" />

                <div className="relative z-10 p-7">

                    {/* Badge de mode — création ou mise à jour */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        {activeConfig ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Configuration existante — mise à jour (PATCH)</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span className="text-primary">Aucune config — première création (POST)</span>
                            </>
                        )}
                    </div>

                    {/* Champs */}
                    <div className="grid gap-6 sm:grid-cols-2">

                        {/* Valeur FCFA */}
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Valeur Équivalente (FCFA)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Coins className="h-5 w-5 text-primary transition-transform group-focus-within:scale-110" />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={valeurUnPoint}
                                    onChange={e => setValeurUnPoint(e.target.value)}
                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-12 pr-4 text-lg font-black text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                />
                            </div>
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Ex : <strong className="text-slate-700 dark:text-slate-300">100</strong> FCFA
                            </p>
                        </motion.div>

                        {/* Quantité de points */}
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Quantité de Points
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Star className="h-5 w-5 text-primary transition-transform group-focus-within:scale-110" />
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={nombreDePoint}
                                    onChange={e => setNombreDePoint(e.target.value)}
                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-12 pr-4 text-lg font-black text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                />
                            </div>
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Ex : <strong className="text-slate-700 dark:text-slate-300">10</strong> points pour obtenir les {valeurUnPoint || "100"} FCFA
                            </p>
                        </motion.div>

                        {/* Durée de validité */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sm:col-span-2"
                        >
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Durée de Validité (en jours)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Clock className="h-5 w-5 text-primary transition-transform group-focus-within:scale-110" />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={dureeValidite}
                                    onChange={e => setDureeValidite(e.target.value)}
                                    className="h-14 w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-12 pr-4 text-lg font-black text-slate-900 dark:text-white outline-none transition-all focus:border-primary/60 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_4px_rgba(15,45,32,0.08)]"
                                />
                            </div>
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Laissez à{" "}
                                <strong className="text-slate-700 dark:text-slate-300">0</strong>{" "}
                                si les points n&apos;expirent jamais.
                            </p>
                        </motion.div>
                    </div>

                    {/* Aperçu du taux effectif */}
                    <AnimatePresence>
                        {ratio > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="mt-6 overflow-hidden"
                            >
                                <div className="relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />
                                    <Info className="h-6 w-6 shrink-0 text-primary" />
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                                            Taux effectif calculé
                                        </p>
                                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                                            1 point ={" "}
                                            <span className="text-primary">
                                                {new Intl.NumberFormat("fr-FR", {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                }).format(ratio)} FCFA
                                            </span>
                                        </p>
                                        {parseFloat(dureeValidite) > 0 && (
                                            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                                                Expiration après {dureeValidite} jours
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer : date MAJ + bouton enregistrer */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <div className="flex-1">
                            {activeConfig && (
                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>
                                        Mis à jour le{" "}
                                        {new Date(activeConfig.updated_at).toLocaleString("fr-FR", {
                                            day: "2-digit", month: "long", year: "numeric",
                                            hour: "2-digit", minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving || !valeurUnPoint || !nombreDePoint}
                            className="group relative flex w-full cursor-pointer sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            {saving ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Enregistrement...</>
                            ) : (
                                <><Save className="h-5 w-5" /> {activeConfig ? "Mettre à jour la configuration" : "Créer la configuration"}</>
                            )}
                            {!saving && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
