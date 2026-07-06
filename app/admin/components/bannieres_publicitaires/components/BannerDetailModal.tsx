"use client";
import { X, Calendar, Link as LinkIcon, Target, Power, PowerOff, LayoutGrid, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/special/ui/Dialog";
import { cn } from "@/lib/utils";
import type { AdminBanner } from "@/modeles/bannieres";
import { BANNER_TYPE_LABELS, BANNER_TYPE_COLORS } from "@/modeles/bannieres";

interface BannerDetailModalProps {
    open: boolean;
    onClose: () => void;
    banner: AdminBanner | null;
    onEdit: () => void;
    onDelete: () => void;
}

export function BannerDetailModal({ open, onClose, banner, onEdit, onDelete }: BannerDetailModalProps) {
    if (!banner) return null;

    const typeConfig = BANNER_TYPE_COLORS[banner.banner_type] || { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20" };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[950px] p-0 overflow-hidden border border-border/40 bg-surface/95 dark:bg-[#0f0f0f]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.4)]">
                <DialogTitle className="sr-only">Détails de la bannière: {banner.title}</DialogTitle>
                
                <div className="flex flex-col-reverse md:flex-row h-full">
                    
                    {/* Colonne Gauche : Informations Détaillées */}
                    <div className="flex-1 flex flex-col justify-between p-8 md:p-10 relative">
                        {/* Bouton de fermeture (Mobile uniquement) */}
                        <button
                            onClick={onClose}
                            className="md:hidden absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <span className={cn("px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", typeConfig.bg, typeConfig.text, typeConfig.border)}>
                                    {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
                                </span>
                                <span className={cn(
                                    "px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm",
                                    banner.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                )}>
                                    {banner.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                                    {banner.is_active ? "Actif" : "Inactif"}
                                </span>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4 pr-10 md:pr-0">
                                {banner.title}
                            </h2>
                            
                            {banner.subtitle && (
                                <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
                                    {banner.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Informations secondaires */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-8">
                            {/* Call to Action */}
                            <div className="p-5 rounded-2xl bg-surface-alt/50 border border-border/50 transition-all hover:bg-surface-alt hover:shadow-sm">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                                    <LinkIcon className="h-3.5 w-3.5 text-primary" /> Call-To-Action
                                </h4>
                                {banner.cta_url ? (
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-bold text-foreground">{banner.cta_label || "Aucun label défini"}</p>
                                        <a href={banner.cta_url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary hover:text-primary/80 hover:underline font-semibold break-all cursor-pointer inline-block transition-colors">
                                            {banner.cta_url}
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-[13px] font-medium text-muted-foreground italic">Aucune action configurée</p>
                                )}
                            </div>

                            {/* Période d'affichage */}
                            <div className="p-5 rounded-2xl bg-surface-alt/50 border border-border/50 transition-all hover:bg-surface-alt hover:shadow-sm">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                                    <Calendar className="h-3.5 w-3.5 text-primary" /> Période d'affichage
                                </h4>
                                <div className="space-y-2.5 text-[13px] font-semibold text-foreground">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground font-medium">Début</span>
                                        <span>{banner.starts_at ? new Date(banner.starts_at).toLocaleString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Immédiat"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground font-medium">Fin</span>
                                        <span>{banner.ends_at ? new Date(banner.ends_at).toLocaleString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Jamais"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Position et Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 mt-auto border-t border-border/50">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
                                    <LayoutGrid className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position d'affichage</h4>
                                    <p className="text-lg font-black text-foreground">Ordre #{banner.position}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        onClose();
                                        onDelete();
                                    }}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Supprimer</span>
                                </button>
                                <button
                                    onClick={() => {
                                        onClose();
                                        onEdit();
                                    }}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[13px] font-bold text-white bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]"
                                >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite : Image de la bannière avec padding léger */}
                    <div className="w-full md:w-[45%] lg:w-[40%] p-4 md:p-6 bg-surface-alt/30 border-b md:border-b-0 md:border-l border-border/40 relative flex flex-col">
                        
                        {/* Bouton de fermeture Desktop */}
                        <button
                            onClick={onClose}
                            className="hidden md:flex absolute top-4 right-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/20 dark:bg-black/20 text-slate-700 dark:text-white backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/40 border border-white/30 dark:border-white/10 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex-1 min-h-[250px] md:min-h-[400px] w-full relative rounded-3xl overflow-hidden bg-surface-alt shadow-lg border border-border/50 group">
                            {banner.image ? (
                                <>
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Dégradé subtil pour accentuer le côté premium */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                                </>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-surface-alt">
                                    <div className="p-5 rounded-full bg-surface-elevated shadow-inner">
                                        <Target className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">Aucune image fournie</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                </div>
            </DialogContent>
        </Dialog>
    );
}
