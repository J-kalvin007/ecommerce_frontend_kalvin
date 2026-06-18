"use client";
import { X, Calendar, Link as LinkIcon, Target, Power, PowerOff, LayoutGrid } from "lucide-react";
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
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-border/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
                <DialogTitle className="sr-only">Détails de la bannière: {banner.title}</DialogTitle>
                {/* Hero Image Section */}
                <div className="relative h-64 w-full bg-surface-alt flex items-center justify-center overflow-hidden">
                    {banner.image ? (
                        <img 
                            src={banner.image} 
                            alt={banner.title} 
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Target className="h-16 w-16 text-muted-foreground/30" />
                    )}
                    
                    {/* Gradient Overlay for Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Top Right Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Bottom Left Content Over Image */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border", typeConfig.bg, typeConfig.text, typeConfig.border, "bg-black/40")}>
                                {BANNER_TYPE_LABELS[banner.banner_type] || banner.banner_type}
                            </span>
                            <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 backdrop-blur-md border",
                                banner.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"
                            )}>
                                {banner.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                                {banner.is_active ? "Actif" : "Inactif"}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white line-clamp-2">
                            {banner.title}
                        </h2>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Subtitle */}
                    {banner.subtitle && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Sous-titre / Description</h4>
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                {banner.subtitle}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 p-5 rounded-2xl bg-surface-alt border border-border">
                        <div>
                            <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                <LinkIcon className="h-3.5 w-3.5" /> Call-To-Action
                            </h4>
                            {banner.cta_url ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">{banner.cta_label || "Aucun label défini"}</p>
                                    <a href={banner.cta_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">
                                        {banner.cta_url}
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-muted-foreground italic">Aucune action configurée</p>
                            )}
                        </div>

                        <div>
                            <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                <Calendar className="h-3.5 w-3.5" /> Affichage
                            </h4>
                            <div className="space-y-1 text-xs font-medium text-foreground">
                                <p className="flex items-center gap-1">
                                    <span className="text-muted-foreground w-12">Début :</span>
                                    {banner.starts_at ? new Date(banner.starts_at).toLocaleString("fr-FR") : "Immédiat"}
                                </p>
                                <p className="flex items-center gap-1">
                                    <span className="text-muted-foreground w-12">Fin :</span>
                                    {banner.ends_at ? new Date(banner.ends_at).toLocaleString("fr-FR") : "Jamais"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-alt border border-border">
                                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Position</h4>
                                <p className="text-sm font-black text-foreground">Ordre #{banner.position}</p>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    onClose();
                                    onDelete();
                                }}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                            >
                                Supprimer
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    onEdit();
                                }}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                            >
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
