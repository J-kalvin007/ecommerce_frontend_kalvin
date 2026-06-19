// app/admin/components/fidelites/LoyaltyAdjustPointsModal.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Zap, AlertTriangle, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/widgets_originaux/special/Dialog";
import { cn } from "@/lib/utils";
import { adjustAdminLoyaltyPoints } from "@/fonctions_api/fidelites.api";
import type { LoyaltyProfile } from "@/modeles/fidelites";

interface LoyaltyAdjustPointsModalProps {
    open: boolean;
    onClose: () => void;
    profile: LoyaltyProfile | null;
    onSuccess: () => void;
}

const PRESET_REASONS = [
    "Correction manuelle",
    "Bonus événement spécial",
    "Récompense fidélité exceptionnelle",
    "Annulation d'un mouvement incorrect",
    "Bonus parrainage manuel",
    "Autre",
];

export function LoyaltyAdjustPointsModal({ open, onClose, profile, onSuccess }: LoyaltyAdjustPointsModalProps) {
    const [mode, setMode] = useState<"add" | "remove">("add");
    const [points, setPoints] = useState("");
    const [reason, setReason] = useState(PRESET_REASONS[0]);
    const [customReason, setCustomReason] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<{ email: string; newBalance: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setPoints(""); setReason(PRESET_REASONS[0]);
            setCustomReason(""); setSaving(false); setSuccess(null); setError(null); setMode("add");
        }
    }, [open]);

    if (!profile) return null;

    const pointsNum = parseInt(points) || 0;
    const delta = mode === "add" ? pointsNum : -pointsNum;
    const projected = profile.points_balance + delta;
    const isNegative = projected < 0;
    const finalReason = reason === "Autre" ? customReason : reason;

    const handleSubmit = async () => {
        if (!pointsNum || !finalReason.trim() || isNegative) return;
        setSaving(true);
        setError(null);
        const res = await adjustAdminLoyaltyPoints({
            user_id: profile.id,
            points: delta,
            reason: finalReason,
        });
        if (res.ok) {
            setSuccess({ email: res.data.user_email, newBalance: res.data.new_balance });
            onSuccess();
        } else {
            setError(res.error.message || "Une erreur est survenue.");
        }
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <div className="relative flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[80px] pointer-events-none" />

                    <DialogHeader className="p-8 pb-4 relative z-10 border-b border-border/40">
                        <DialogTitle className="flex items-center gap-3 text-xl font-extrabold">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <Zap className="h-5 w-5" />
                            </div>
                            Ajustement de points
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1">
                            Profil <strong>{profile.id.slice(0, 8)}…</strong> — Solde actuel :
                            <span className="ml-1 font-black text-primary">{profile.points_balance.toLocaleString("fr-FR")} pts</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6 relative z-10">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-4 py-8 text-center"
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <Check className="h-8 w-8 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-foreground">Ajustement appliqué !</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{success.email}</p>
                                </div>
                                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-8 py-4 text-center">
                                    <p className="text-xs font-bold uppercase text-primary/70">Nouveau solde</p>
                                    <p className="text-4xl font-extrabold text-primary">{success.newBalance.toLocaleString("fr-FR")} pts</p>
                                </div>
                                <button onClick={onClose} className="mt-2 rounded-xl border border-border px-6 py-2 text-sm font-bold text-muted-foreground hover:bg-surface-alt transition-colors">
                                    Fermer
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Mode +/- */}
                                <div className="flex gap-2">
                                    {([["add", Plus, "Ajouter des points", "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"],
                                    ["remove", Minus, "Retirer des points", "bg-red-500/10 border-red-500/30 text-red-400"]] as const).map(([m, Icon, label, cls]) => (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={cn(
                                                "flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all",
                                                mode === m ? cls : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" /> {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Quantité */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre de points</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={points}
                                        onChange={e => setPoints(e.target.value)}
                                        placeholder="Ex: 500"
                                        className="h-14 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-2xl font-black text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>

                                {/* Nouveau solde projeté */}
                                <div className={cn(
                                    "flex items-center justify-between rounded-xl border p-4 transition-all",
                                    isNegative ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-surface"
                                )}>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-muted-foreground">Solde projeté</p>
                                        <p className={cn("text-2xl font-extrabold mt-0.5", isNegative ? "text-red-400" : "text-foreground")}>
                                            {projected.toLocaleString("fr-FR")} pts
                                        </p>
                                    </div>
                                    {isNegative && (
                                        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
                                            <AlertTriangle className="h-4 w-4" /> Solde négatif impossible
                                        </div>
                                    )}
                                </div>

                                {/* Raison */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Raison de l'ajustement *</label>
                                    <select
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    >
                                        {PRESET_REASONS.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    {reason === "Autre" && (
                                        <motion.input
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            type="text"
                                            value={customReason}
                                            onChange={e => setCustomReason(e.target.value)}
                                            placeholder="Précisez la raison..."
                                            className="mt-3 h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-400">
                                        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-muted-foreground hover:bg-surface-alt transition-colors">
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving || isNegative || !pointsNum || !finalReason.trim()}
                                        className="relative flex-1 overflow-hidden rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
                                        {saving
                                            ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</span>
                                            : `Appliquer ${mode === "add" ? "+" : "−"}${pointsNum || "—"} pts`
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
