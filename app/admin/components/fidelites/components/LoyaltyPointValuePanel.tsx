/**
 * LoyaltyPointValuePanel.tsx
 * Admin panel to configure point value and validity.
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Loader2, CheckCircle2, AlertCircle, Coins, Clock, Info } from "lucide-react";
import { getPointValue } from "@/fonctions_api/fidelites.api";
import { apiPrivate } from "@/lib/axios";
import type { PointValue } from "@/modeles/fidelites";

interface LoyaltyPointValuePanelProps {
    onToast: (type: "success" | "error", message: string) => void;
}

export function LoyaltyPointValuePanel({ onToast }: LoyaltyPointValuePanelProps) {
    const [config, setConfig] = useState<PointValue | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [valeurUnPoint, setValeurUnPoint] = useState("");
    const [nombreDePoint, setNombreDePoint] = useState("");
    const [dureeValidite, setDureeValidite] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            const res = await getPointValue();
            if (res.ok) {
                setConfig(res.data);
                setValeurUnPoint(String(res.data.valeur_un_point_frcfa));
                setNombreDePoint(String(res.data.nombre_de_point));
                setDureeValidite(String(res.data.duree_validite));
            } else {
                setError("Impossible de charger la configuration des points.");
            }
            setLoading(false);
        };
        fetchConfig();
    }, []);

    const ratio = parseFloat(nombreDePoint) > 0
        ? parseFloat(valeurUnPoint) / parseFloat(nombreDePoint) : 0;

    const handleSave = async () => {
        setSaving(true);
        try {
            const endpoint = config?.id
                ? `/api/v1/fidelites/valeur-des-points/${config.id}/`
                : `/api/v1/fidelites/valeur-des-points/`;
            const method = config?.id ? "patch" : "post";
            const payload = {
                valeur_un_point_frcfa: parseFloat(valeurUnPoint),
                nombre_de_point: parseFloat(nombreDePoint),
                duree_validite: parseInt(dureeValidite, 10),
            };
            const res = await apiPrivate[method]<PointValue>(endpoint, payload);
            setConfig(res.data);
            onToast("success", "Configuration de la valeur des points sauvegardee.");
        } catch {
            onToast("error", "Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !config) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">Valeur des Points</h2>
                    <p className="text-sm text-muted-foreground">
                        Definissez le taux de conversion et la duree de validite des points.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Valeur (FCFA)
                        </label>
                        <div className="relative">
                            <Coins className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={valeurUnPoint}
                                onChange={(e) => setValeurUnPoint(e.target.value)}
                                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">Montant en FCFA pour la quantite ci-dessous</p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Quantite de points
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={nombreDePoint}
                            onChange={(e) => setNombreDePoint(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">Ex: 10 points pour 100 FCFA</p>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Duree de validite des points (jours)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={dureeValidite}
                                onChange={(e) => setDureeValidite(e.target.value)}
                                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Mettre 0 pour des points sans expiration.
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {ratio > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-5 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                                <Info className="h-4 w-4 shrink-0 text-primary" />
                                <p className="text-[13px] font-semibold text-foreground">
                                    Taux actuel :{" "}
                                    <span className="text-primary font-black">
                                        1 point = {new Intl.NumberFormat("fr-FR").format(ratio)} FCFA
                                    </span>
                                    {parseFloat(dureeValidite) > 0 && (
                                        <span className="ml-3 font-medium text-muted-foreground">
                                            Expire apres <span className="font-bold">{dureeValidite} jours</span>
                                        </span>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6 flex justify-end">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSave}
                        disabled={saving || !valeurUnPoint || !nombreDePoint}
                        className="flex items-center gap-2.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 hover:opacity-90"
                    >
                        {saving ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde...</>
                        ) : (
                            <><Save className="h-4 w-4" /> Sauvegarder</>
                        )}
                    </motion.button>
                </div>
            </div>

            {config && (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-[12px] font-semibold text-emerald-700">
                        Configuration active - mise a jour le{" "}
                        <span className="font-black">
                            {new Date(config.updated_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
