"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, TrendingDown, Plus, LayoutGrid, List, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getAdminPromoCodes,
    createAdminPromoCode,
    updateAdminPromoCode,
    deleteAdminPromoCode,
    getAdminSales,
    createAdminSale,
    updateAdminSale,
    deleteAdminSale
} from "@/fonctions_api/promotions.api";
import type { AdminPromoCode, AdminSoldes } from "@/modeles/promotions";

// --- Composants spéciaux partagés --------------------------------------------
import Toast from "@/components/notifications/Toast";
import LoadingKalvin from "@/components/special/loadingKalvin";
import EmptyState from "@/components/special/EmptyState";
import ErrorState from "@/components/special/ErrorState";
import ConfirmDialog from "@/components/special/ConfirmDialog";

// --- Sous-composants promotions -----------------------------------------------
import { PromoCodeCard } from "./components/PromoCodeCard";
import { PromoCodeModal } from "./components/PromoCodeModal";
import { PromoCodeDetailModal } from "./components/PromoCodeDetailModal";
import { FlashSaleCard } from "./components/FlashSaleCard";
import { FlashSaleModal } from "./components/FlashSaleModal";
import { FlashSaleDetailModal } from "./components/FlashSaleDetailModal";

type TabType = "codes" | "sales";

export default function PromotionsSection() {
    const [tab, setTab] = useState<TabType>("codes");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Données
    const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
    const [sales, setSales] = useState<AdminSoldes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modales création / édition
    const [codeModalOpen, setCodeModalOpen] = useState(false);
    const [saleModalOpen, setSaleModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<AdminPromoCode | null>(null);
    const [editingSale, setEditingSale] = useState<AdminSoldes | null>(null);
    const [saving, setSaving] = useState(false);

    // Modales détail
    const [detailCode, setDetailCode] = useState<AdminPromoCode | null>(null);
    const [detailSale, setDetailSale] = useState<AdminSoldes | null>(null);

    // Confirmation suppression
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "code" | "sale"; id: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>
        ({ show: false, type: "success", message: "" });

    // Données pour les modales
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [productsList, setProductsList] = useState<{ id: string; name: string }[]>([]);

    // -- Chargement -----------------------------------------------------------
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [codesRes, salesRes] = await Promise.all([getAdminPromoCodes(), getAdminSales()]);

            if (codesRes.ok) {
                const d = (codesRes as any).results ?? codesRes.data;
                setPromoCodes(Array.isArray(d) ? d : []);
            } else {
                setError(codesRes.error.message || "Erreur codes promo");
            }

            if (salesRes.ok) {
                const d = (salesRes as any).results ?? salesRes.data;
                setSales(Array.isArray(d) ? d : []);
            }

            // Chargement silencieux catégories + produits pour les formulaires
            try {
                const { getAdminCategories } = await import("@/fonctions_api/categories.api");
                const { getAdminProducts } = await import("@/fonctions_api/produits.api");
                const [catRes, prodRes] = await Promise.all([getAdminCategories(), getAdminProducts()]);
                if (catRes.ok) setCategories(((catRes as any).results ?? catRes.data) || []);
                if (prodRes.ok) setProductsList(((prodRes as any).results ?? prodRes.data) || []);
            } catch { /* silencieux */ }

        } catch {
            setError("Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // -- Statistiques ---------------------------------------------------------
    const stats = useMemo(() => ({
        activeCodes: promoCodes.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length,
        totalUses: promoCodes.reduce((acc, c) => acc + (c.number_times_used || 0), 0),
        activeSales: sales.filter(s => s.is_active && new Date(s.ends_at) > new Date()).length,
    }), [promoCodes, sales]);

    // -- Handlers codes promo --------------------------------------------------
    const handleSaveCode = async (data: any) => {
        setSaving(true);
        const res = editingCode
            ? await updateAdminPromoCode(editingCode.id, data)
            : await createAdminPromoCode(data);
        if (res.ok) {
            setToast({ show: true, type: "success", message: `Code promo ${editingCode ? "modifié" : "créé"} avec succès` });
            setCodeModalOpen(false);
            loadData();
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Une erreur est survenue" });
        }
        setSaving(false);
    };

    // -- Handlers ventes flash -------------------------------------------------
    const handleSaveSale = async (data: any) => {
        setSaving(true);
        const res = editingSale
            ? await updateAdminSale(editingSale.id, data)
            : await createAdminSale(data);
        if (res.ok) {
            setToast({ show: true, type: "success", message: `Vente en solde ${editingSale ? "modifiée" : "créée"} avec succès` });
            setSaleModalOpen(false);
            loadData();
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Une erreur est survenue" });
        }
        setSaving(false);
    };

    // -- Handler suppression ---------------------------------------------------
    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        const res = deleteConfirm.type === "code"
            ? await deleteAdminPromoCode(deleteConfirm.id)
            : await deleteAdminSale(deleteConfirm.id);
        if (res.ok) {
            setToast({ show: true, type: "success", message: "Promotion supprimée" });
            loadData();
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Erreur de suppression" });
        }
        setDeleting(false);
        setDeleteConfirm(null);
    };

    // -- Erreur totale ---------------------------------------------------------
    if (error && !promoCodes.length && !sales.length) {
        return <ErrorState message={error} onRetry={loadData} />;
    }

    return (
        <div className="space-y-8 px-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* -- Toast ------------------------------------------------------- */}
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(p => ({ ...p, show: false }))}
            />

            {/* -- Confirm suppression ----------------------------------------- */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Supprimer la promotion"
                message="Êtes-vous sûr de vouloir supprimer définitivement cette promotion ? Cette action est irréversible."
                confirmText="Supprimer"
                type="danger"
                isLoading={deleting}
            />

            {/* -- Modales Détail ---------------------------------------------- */}
            <PromoCodeDetailModal
                promo={detailCode}
                onClose={() => setDetailCode(null)}
                onEdit={() => {
                    if (detailCode) { setEditingCode(detailCode); setDetailCode(null); setCodeModalOpen(true); }
                }}
            />
            <FlashSaleDetailModal
                sale={detailSale}
                onClose={() => setDetailSale(null)}
                onEdit={() => {
                    if (detailSale) { setEditingSale(detailSale); setDetailSale(null); setSaleModalOpen(true); }
                }}
            />

            {/* -- Modales Création / Édition ---------------------------------- */}
            <PromoCodeModal
                open={codeModalOpen}
                onClose={() => setCodeModalOpen(false)}
                onSave={handleSaveCode}
                initialData={editingCode || {}}
                isEditing={!!editingCode}
                isSaving={saving}
                products={productsList}
                categories={categories}
            />

            <FlashSaleModal
                open={saleModalOpen}
                onClose={() => setSaleModalOpen(false)}
                onSave={handleSaveSale}
                initialData={editingSale || {}}
                isEditing={!!editingSale}
                isSaving={saving}
                products={productsList}
            />

            {/* -- En-tête ----------------------------------------------------- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">





                {/* -- En-tête avec effet premium -- */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex items-center gap-4">
                        {/* Icône principale sobre */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20">
                            <Tag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2
                                className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl"
                                style={{ color: "#0D1F17", letterSpacing: "-0.025em" }}
                            >
                                Promotions
                            </h2>
                            <span
                                className="block text-[11px] font-semibold uppercase tracking-[0.25em] mt-0.5"
                                style={{ color: "#8A9080" }}
                            >
                                Gérez vos codes de réduction et ventes en solde
                            </span>
                        </div>
                    </div>
                </motion.div>





                <button
                    onClick={() => {
                        if (tab === "codes") { setEditingCode(null); setCodeModalOpen(true); }
                        else { setEditingSale(null); setSaleModalOpen(true); }
                    }}
                    className="flex items-center cursor-pointer gap-2 cursor-pointers rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    {tab === "codes" ? "Nouveau code promo" : "Nouvelle vente en solde"}
                </button>

            </div>

            {/* -- KPI -------------------------------------------------------- */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                    {
                        icon: <Tag className="h-5 w-5" />,
                        value: stats.activeCodes,
                        label: "Codes promo actifs",
                        color: "text-primary",
                        bg: "bg-primary/8",
                    },
                    {
                        icon: <BarChart3 className="h-5 w-5" />,
                        value: stats.totalUses,
                        label: "Utilisations totales",
                        color: "text-slate-600 dark:text-slate-300",
                        bg: "bg-slate-100 dark:bg-slate-800",
                    },
                    {
                        icon: <TrendingDown className="h-5 w-5" />,
                        value: stats.activeSales,
                        label: "Ventes en solde en cours",
                        color: "text-primary",
                        bg: "bg-primary/8",
                    },
                ].map((kpi, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden rounded-2xl border border-border/60 bg-white dark:bg-[#1e1e1e] p-6 shadow-sm"
                    >
                        {/* Liseré discret */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                        <div className="flex items-center justify-between">
                            <p className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", kpi.bg, kpi.color)}>
                                {kpi.icon}
                            </div>
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* -- Onglets + vue ----------------------------------------------- */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-elevated p-2 rounded-2xl border border-border shadow-sm">

                <div className="flex gap-2 w-full sm:w-auto">

                    {([
                        { key: "codes", label: "Codes Promo", icon: <Tag className="h-5 w-5" />, count: promoCodes.length },
                        { key: "sales", label: "Ventes en solde", icon: <TrendingDown className="h-5 w-5" />, count: sales.length },
                    ] as const).map(t => (

                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                "flex-1 sm:flex-none flex cursor-pointer items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[18px] font-semibold transition-all",
                                tab === t.key ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                            )}
                        >
                            {t.icon} {t.label}
                            <span className={cn(
                                "rounded-md px-1.5 py-0.5 text-[14px] font-bold",
                                tab === t.key ? "bg-white/20" : "bg-surface-alt"
                            )}>{t.count}</span>

                        </button>

                    ))}

                </div>


                <div className="flex rounded-xl border border-border bg-surface p-1 pr-2">

                    <button onClick={() => setViewMode("grid")} className={cn("rounded-lg p-2 cursor-pointer transition-colors", viewMode === "grid" ? "bg-surface-alt text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <LayoutGrid className="h-4 w-4" />
                    </button>

                    <button onClick={() => setViewMode("list")} className={cn("rounded-lg p-2 cursor-pointer transition-colors", viewMode === "list" ? "bg-surface-alt text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <List className="h-4 w-4" />
                    </button>

                </div>

            </div>

            {/* -- Contenu ----------------------------------------------------- */}
            {loading ? (

                <LoadingKalvin />

            ) : tab === "codes" ? (

                promoCodes.length === 0 ? (

                    <EmptyState
                        title="Aucun code promo"
                        description="Vous n'avez pas encore créé de code de réduction pour vos clients."
                        actionText="Créer un code promo"
                        onAction={() => { setEditingCode(null); setCodeModalOpen(true); }}
                        icon={Tag}
                    />

                ) : (

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            viewMode === "grid"
                                ? "grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                                : "flex flex-col gap-2"
                        )}
                    >
                        <AnimatePresence>
                            {promoCodes.map(p => (
                                <PromoCodeCard
                                    key={p.id}
                                    promo={p}
                                    viewMode={viewMode}
                                    onView={() => setDetailCode(p)}
                                    onEdit={() => { setEditingCode(p); setCodeModalOpen(true); }}
                                    onDelete={() => setDeleteConfirm({ type: "code", id: p.id })}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )

            ) : (

                sales.length === 0 ? (

                    <EmptyState
                        title="Aucune vente en solde"
                        description="Créez une vente en solde pour mettre en avant un produit à prix réduit pendant un temps limité."
                        actionText="Lancer une vente en solde"
                        onAction={() => { setEditingSale(null); setSaleModalOpen(true); }}
                        icon={Zap}
                    />

                ) : (

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            viewMode === "grid"
                                ? "grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-5 "
                                : "flex flex-col gap-2"
                        )}
                    >
                        <AnimatePresence>
                            {sales.map(s => (
                                <FlashSaleCard
                                    key={s.id}
                                    sale={s}
                                    viewMode={viewMode}
                                    onView={() => setDetailSale(s)}
                                    onEdit={() => { setEditingSale(s); setSaleModalOpen(true); }}
                                    onDelete={() => setDeleteConfirm({ type: "sale", id: s.id })}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )
            )}
        </div>
    );
}