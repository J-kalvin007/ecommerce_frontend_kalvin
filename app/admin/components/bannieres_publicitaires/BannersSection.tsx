"use client";
import { useState, useEffect } from "react";
import { Plus, LayoutGrid, LayoutList, MonitorPlay, AlertTriangle, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { AdminBanner, BannerTypeEnum, CreateAdminBannerPayload } from "@/modeles/bannieres";
import { BANNER_TYPE_LABELS } from "@/modeles/bannieres";
import { 
    getAdminBanners, 
    createAdminBanner, 
    updateAdminBanner, 
    deleteAdminBanner 
} from "@/fonctions_api/bannieres.api";

import { BannerCard } from "./components/BannerCard";
import { BannerFormModal } from "./components/BannerFormModal";
import { BannerDetailModal } from "./components/BannerDetailModal";

import EmptyState from "@/components/special/EmptyState";
import LoadingStyle from "@/components/special/loadingStyle";
import Toast from "@/components/special/Toast";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function BannersSection() {
    const [banners, setBanners] = useState<AdminBanner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<BannerTypeEnum | "all">("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [formOpen, setFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [detailBanner, setDetailBanner] = useState<AdminBanner | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<AdminBanner | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [toast, setToast] = useState<{ show: boolean, type: "success" | "error" | "info", message: string }>({ show: false, type: "info", message: "" });

    const loadBanners = async () => {
        setIsLoading(true);
        const res = await getAdminBanners();
        if (res.ok) {
            setBanners(res.data);
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Erreur de chargement des bannières" });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const handleSave = async (payload: CreateAdminBannerPayload) => {
        setIsSaving(true);
        let res;
        if (editingBanner) {
            res = await updateAdminBanner(editingBanner.id, payload);
        } else {
            res = await createAdminBanner(payload);
        }
        setIsSaving(false);

        if (res.ok) {
            setToast({ show: true, type: "success", message: `Bannière ${editingBanner ? "mise à jour" : "créée"} avec succès.` });
            setFormOpen(false);
            setEditingBanner(null);
            loadBanners();
        } else {
            setToast({ show: true, type: "error", message: res.error?.message || "Erreur lors de la sauvegarde." });
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setIsDeleting(true);
        const res = await deleteAdminBanner(deleteConfirm.id);
        setIsDeleting(false);

        if (res.ok) {
            setToast({ show: true, type: "success", message: "Bannière supprimée avec succès." });
            setDeleteConfirm(null);
            if (detailBanner?.id === deleteConfirm.id) {
                setDetailBanner(null);
            }
            loadBanners();
        } else {
            setToast({ show: true, type: "error", message: res.error?.message || "Erreur lors de la suppression." });
        }
    };

    const openCreate = () => {
        setEditingBanner(null);
        setFormOpen(true);
    };

    const openEdit = (banner: AdminBanner) => {
        setEditingBanner(banner);
        setFormOpen(true);
    };

    const filteredBanners = banners
        .filter(b => filterType === "all" ? true : b.banner_type === filterType)
        .sort((a, b) => a.position - b.position);

    if (isLoading) return <LoadingStyle label="Chargement des bannières publicitaires..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Toast */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                title="Supprimer cette bannière"
                message={`Êtes-vous sûr de vouloir supprimer la bannière "${deleteConfirm?.title}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                type="danger"
                isLoading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* Form Modal */}
            <BannerFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                initialData={editingBanner}
                isSaving={isSaving}
            />

            {/* Detail Modal */}
            <BannerDetailModal
                open={!!detailBanner}
                onClose={() => setDetailBanner(null)}
                banner={detailBanner}
                onEdit={() => detailBanner && openEdit(detailBanner)}
                onDelete={() => detailBanner && setDeleteConfirm(detailBanner)}
            />

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-sm">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <MonitorPlay className="h-8 w-8 text-primary" />
                            Bannières & Recommandations
                        </h1>
                        <p className="text-muted-foreground max-w-2xl font-medium">
                            Gérez les bannières publicitaires affichées sur le site. Attirez l'attention de vos clients sur vos nouvelles offres, vos promotions ou vos annonces importantes.
                        </p>
                    </div>
                    
                    <button
                        onClick={openCreate}
                        className="group flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-primary/30 active:scale-95"
                    >
                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                        Nouvelle Bannière
                    </button>
                </div>
            </div>

            {/* Filters & Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface-elevated border border-border w-fit shadow-sm">
                    <button
                        onClick={() => setFilterType("all")}
                        className={cn(
                            "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                            filterType === "all" ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                        )}
                    >
                        <Layers className="h-4 w-4" />
                        Toutes
                    </button>
                    {(Object.entries(BANNER_TYPE_LABELS) as [BannerTypeEnum, string][]).map(([type, label]) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                                filterType === type ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated border border-border shadow-sm">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === "grid" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                        )}
                        title="Vue Grille"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === "list" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                        )}
                        title="Vue Liste"
                    >
                        <LayoutList className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {filteredBanners.length === 0 ? (
                <EmptyState
                    icon={AlertTriangle}
                    title="Aucune bannière trouvée"
                    description={filterType === "all" ? "Vous n'avez pas encore créé de bannière publicitaire." : `Aucune bannière du type ${BANNER_TYPE_LABELS[filterType]} n'a été trouvée.`}
                    actionText="Créer une bannière"
                    onAction={openCreate}
                />
            ) : (
                <motion.div 
                    layout
                    className={cn(
                        "grid gap-6",
                        viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
                    )}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredBanners.map(banner => (
                            <BannerCard
                                key={banner.id}
                                banner={banner}
                                viewMode={viewMode}
                                onView={() => setDetailBanner(banner)}
                                onEdit={(e) => {
                                    e.stopPropagation();
                                    openEdit(banner);
                                }}
                                onDelete={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm(banner);
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
