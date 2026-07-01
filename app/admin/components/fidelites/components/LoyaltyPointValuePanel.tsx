"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Loader2, CheckCircle2, AlertCircle, Coins, Clock, Info, Plus, Star } from "lucide-react";
import { getAdminPointValues, createAdminPointValue, updateAdminPointValue } from "@/fonctions_api/fidelites.api";
import type { PointValue } from "@/modeles/fidelites";
import { cn } from "@/lib/utils";

interface LoyaltyPointValuePanelProps {
    onToast: (type: "success" | "error", message: string) => void;
}

export function LoyaltyPointValuePanel({ onToast }: LoyaltyPointValuePanelProps) {
    const [configs, setConfigs] = useState<PointValue[]>([]);
    const [activeConfig, setActiveConfig] = useState<PointValue | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [valeurUnPoint, setValeurUnPoint] = useState("");
    const [nombreDePoint, setNombreDePoint] = useState("");
    const [dureeValidite, setDureeValidite] = useState("");

    const loadConfigs = async () => {
        setLoading(true);
        setError(null);
        const res = await getAdminPointValues();
        if (res.ok) {
            setConfigs(res.data);
            const active = res.data.find(c => c.is_active) || res.data[0];
            if (active) {
                setActiveConfig(active);
                setValeurUnPoint(String(active.valeur_un_point_frcfa));
                setNombreDePoint(String(active.nombre_de_point));
                setDureeValidite(String(active.duree_validite));
            } else {
                setValeurUnPoint("");
                setNombreDePoint("");
                setDureeValidite("");
            }
        } else {
            setError("Impossible de charger la configuration de la valeur des points.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadConfigs();
    }, []);

    const ratio = parseFloat(nombreDePoint) > 0
        ? parseFloat(valeurUnPoint) / parseFloat(nombreDePoint) : 0;

    const handleSave = async () => {
        setSaving(true);

        const payload = {
            valeur_un_point_frcfa: parseFloat(valeurUnPoint),
            nombre_de_point: parseFloat(nombreDePoint),
            duree_validite: parseInt(dureeValidite, 10),
            is_active: true,
        };

        const res = activeConfig?.id
            ? await updateAdminPointValue(activeConfig.id, payload)
            : await createAdminPointValue(payload);

        if (res.ok) {
            onToast("success", "Configuration de la valeur des points sauvegardée avec succès.");
            loadConfigs();
        } else {
            onToast("error", res.error.message || "Erreur lors de la sauvegarde.");
        }
        setSaving(false);
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

    if (error && !activeConfig) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-500">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4 border-b border-[#dde5d8] pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9963A]/20 to-[#C9963A]/5 border border-[#C9963A]/20">
                    <Settings className="h-6 w-6 text-[#C9963A]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#0F2D20]">Paramétrage du Taux de Conversion</h2>
                    <p className="text-sm font-medium text-[#6b7a65]">
                        Définissez la valeur exacte en FCFA de chaque point gagné.
                    </p>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#dde5d8] bg-white p-8 shadow-[0_20px_60px_rgba(15,45,32,0.05)]">
                {/* Accent luxueux haut */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#C9963A] via-[#E2C37E] to-[#C9963A]" />

                <div className="grid gap-8 sm:grid-cols-2 mt-2">
                    {/* Montant FCFA */}
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a9685]">
                            Valeur Equivalent (FCFA)
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Coins className="h-5 w-5 text-[#C9963A] transition-transform group-focus-within:scale-110" />
                            </div>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={valeurUnPoint}
                                onChange={(e) => setValeurUnPoint(e.target.value)}
                                className="h-14 w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] pl-12 pr-4 text-lg font-black text-[#0F2D20] outline-none transition-all focus:border-[#C9963A] focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,150,58,0.1)]"
                            />
                        </div>
                        <p className="mt-2 text-xs font-medium text-[#6b7a65]">Ex: 100 FCFA</p>
                    </motion.div>

                    {/* Quantité Points */}
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a9685]">
                            Quantité de Points
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Star className="h-5 w-5 text-[#C9963A] transition-transform group-focus-within:scale-110" />
                            </div>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={nombreDePoint}
                                onChange={(e) => setNombreDePoint(e.target.value)}
                                className="h-14 w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] pl-12 pr-4 text-lg font-black text-[#0F2D20] outline-none transition-all focus:border-[#C9963A] focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,150,58,0.1)]"
                            />
                        </div>
                        <p className="mt-2 text-xs font-medium text-[#6b7a65]">Ex: 10 points (pour obtenir les 100 FCFA ci-contre)</p>
                    </motion.div>

                    {/* Expiration */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sm:col-span-2">
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a9685]">
                            Durée de Validité (en jours)
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Clock className="h-5 w-5 text-[#C9963A] transition-transform group-focus-within:scale-110" />
                            </div>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={dureeValidite}
                                onChange={(e) => setDureeValidite(e.target.value)}
                                className="h-14 w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] pl-12 pr-4 text-lg font-black text-[#0F2D20] outline-none transition-all focus:border-[#C9963A] focus:bg-white focus:shadow-[0_0_0_4px_rgba(201,150,58,0.1)]"
                            />
                        </div>
                        <p className="mt-2 text-xs font-medium text-[#6b7a65]">
                            Laissez à <strong className="text-[#0F2D20]">0</strong> si les points n'expirent jamais.
                        </p>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {ratio > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: "auto", scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className="mt-8 overflow-hidden"
                        >
                            <div className="relative flex items-center gap-4 rounded-2xl border border-[#C9963A]/30 bg-gradient-to-r from-[#C9963A]/10 to-transparent p-5">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C9963A] rounded-l-2xl" />
                                <Info className="h-6 w-6 shrink-0 text-[#C9963A]" />
                                <div>
                                    <p className="text-sm font-bold text-[#0F2D20]">
                                        Taux effectif calculé
                                    </p>
                                    <p className="mt-0.5 text-[15px] font-black text-[#C9963A]">
                                        1 point = {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(ratio)} FCFA
                                    </p>
                                    {parseFloat(dureeValidite) > 0 && (
                                        <p className="mt-1 text-xs font-semibold text-[#8a9685]">
                                            Expiration après {dureeValidite} jours
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        {activeConfig && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b7a65]">
                                    Mis à jour le {new Date(activeConfig.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving || !valeurUnPoint || !nombreDePoint}
                        className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#0F2D20] px-8 py-4 text-sm font-bold text-white shadow-[0_12px_32px_rgba(15,45,32,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_16px_40px_rgba(15,45,32,0.35)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[premium-title-shine-anim_1.5s_infinite]" />
                        {saving ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Enregistrement...</>
                        ) : (
                            <><Save className="h-5 w-5" /> Enregistrer la Configuration</>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
