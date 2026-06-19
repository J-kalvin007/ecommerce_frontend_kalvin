"use client";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/widgets_originaux/special/ui/Dialog";
import { Save, Loader2, Image as ImageIcon, Link2, Type, Calendar, Target, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminBanner, BannerTypeEnum, CreateAdminBannerPayload } from "@/modeles/bannieres";
import { BANNER_TYPE_LABELS, BANNER_TYPE_COLORS } from "@/modeles/bannieres";

interface BannerFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: CreateAdminBannerPayload) => Promise<void>;
    initialData?: AdminBanner | null;
    isSaving?: boolean;
}

const INITIAL_FORM: CreateAdminBannerPayload = {
    title: "",
    subtitle: "",
    image: "",
    cta_label: "",
    cta_url: "",
    banner_type: "hero",
    position: 0,
    starts_at: "",
    ends_at: "",
    is_active: true,
};

export function BannerFormModal({ open, onClose, onSave, initialData, isSaving }: BannerFormModalProps) {
    const [form, setForm] = useState<CreateAdminBannerPayload>(INITIAL_FORM);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setForm({
                    title: initialData.title,
                    subtitle: initialData.subtitle || "",
                    image: initialData.image, // Will be string URL
                    cta_label: initialData.cta_label || "",
                    cta_url: initialData.cta_url || "",
                    banner_type: initialData.banner_type,
                    position: initialData.position,
                    starts_at: initialData.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : "",
                    ends_at: initialData.ends_at ? new Date(initialData.ends_at).toISOString().slice(0, 16) : "",
                    is_active: initialData.is_active,
                });
                setPreviewUrl(initialData.image);
            } else {
                setForm(INITIAL_FORM);
                setPreviewUrl(null);
            }
        }
    }, [open, initialData]);

    const handleChange = (field: keyof CreateAdminBannerPayload, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleChange("image", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data
        const payload: CreateAdminBannerPayload = {
            ...form,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        };

        await onSave(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-border/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <div className="relative flex flex-col max-h-[90vh]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-[80px] pointer-events-none rounded-t-full" />

                    <DialogHeader className="p-8 pb-4 relative z-10 border-b border-border/40">
                        <DialogTitle className="text-2xl font-extrabold flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 text-primary shadow-inner">
                                <LayoutGrid className="h-5 w-5" />
                            </div>
                            {initialData ? "Modifier la bannière" : "Créer une nouvelle bannière"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-2">
                            Configurez l'apparence et le comportement de votre bannière publicitaire.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Colonne Gauche : Visuel & Type */}
                            <div className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <ImageIcon className="h-3.5 w-3.5 text-primary" /> Visuel de la bannière *
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-surface-alt transition-all hover:bg-surface-elevated hover:border-primary/50",
                                            previewUrl ? "h-64 border-transparent bg-transparent" : "h-48 border-border"
                                        )}
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity hover:opacity-100 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Changer l'image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6">
                                                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                                                <p className="text-sm font-bold text-foreground">Cliquez pour uploader</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP optimisé</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required={!initialData}
                                        />
                                    </div>
                                </div>

                                {/* Banner Type */}
                                <div>
                                    <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <Target className="h-3.5 w-3.5 text-primary" /> Emplacement / Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(Object.keys(BANNER_TYPE_LABELS) as BannerTypeEnum[]).map(type => {
                                            const cfg = BANNER_TYPE_COLORS[type];
                                            const isSelected = form.banner_type === type;
                                            return (
                                                <label
                                                    key={type}
                                                    className={cn(
                                                        "flex cursor-pointer items-center justify-center rounded-xl border p-3 text-sm font-bold transition-all text-center",
                                                        isSelected ? cn(cfg.bg, cfg.text, cfg.border, "ring-2 ring-primary/20 shadow-sm") : "bg-surface border-border text-muted-foreground hover:border-primary/40 hover:bg-surface-elevated"
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        className="sr-only"
                                                        name="banner_type"
                                                        checked={isSelected}
                                                        onChange={() => handleChange("banner_type", type)}
                                                    />
                                                    {BANNER_TYPE_LABELS[type]}
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Colonne Droite : Textes, Liens & Paramètres */}
                            <div className="space-y-6">

                                {/* Titre & Sous-titre */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <Type className="h-3.5 w-3.5 text-primary" /> Titre *
                                        </label>
                                        <input
                                            value={form.title}
                                            onChange={e => handleChange("title", e.target.value)}
                                            className="h-12 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                            placeholder="Ex: Soldes d'Hiver"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Sous-titre</label>
                                        <textarea
                                            value={form.subtitle || ""}
                                            onChange={e => handleChange("subtitle", e.target.value)}
                                            className="h-20 w-full resize-none rounded-xl border border-border/80 bg-surface/80 p-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                            placeholder="Texte descriptif court..."
                                        />
                                    </div>
                                </div>

                                {/* Call to action */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Label du Bouton
                                        </label>
                                        <input
                                            value={form.cta_label || ""}
                                            onChange={e => handleChange("cta_label", e.target.value)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                            placeholder="Ex: Découvrir"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <Link2 className="h-3.5 w-3.5 text-primary" /> URL de Destination
                                        </label>
                                        <input
                                            value={form.cta_url || ""}
                                            onChange={e => handleChange("cta_url", e.target.value)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Position & Activation */}
                                <div className="grid grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Position (Ordre)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.position}
                                            onChange={e => handleChange("position", parseInt(e.target.value) || 0)}
                                            className="h-11 w-full rounded-xl border border-border/80 bg-surface/80 px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    <label className="flex h-11 items-center gap-3 px-4 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface-elevated transition-colors cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={e => handleChange("is_active", e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="h-5 w-9 rounded-full bg-surface-alt border border-border transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                                            <div className="absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4"></div>
                                        </div>
                                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Activer</span>
                                    </label>
                                </div>

                                {/* Dates */}
                                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-surface-alt p-5 shadow-inner">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <h4 className="text-sm font-bold">Période d'affichage</h4>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-[10px] font-bold uppercase text-muted-foreground">Début</label>
                                            <input
                                                type="datetime-local"
                                                value={form.starts_at || ""}
                                                onChange={e => handleChange("starts_at", e.target.value)}
                                                className="h-10 w-full rounded-xl border border-border/80 bg-surface px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-[10px] font-bold uppercase text-muted-foreground">Fin</label>
                                            <input
                                                type="datetime-local"
                                                value={form.ends_at || ""}
                                                onChange={e => handleChange("ends_at", e.target.value)}
                                                className="h-10 w-full rounded-xl border border-border/80 bg-surface px-3 text-sm font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-8 pb-2 mt-4 border-t border-border/40">
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
                                {initialData ? "Mettre à jour" : "Publier la bannière"}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
