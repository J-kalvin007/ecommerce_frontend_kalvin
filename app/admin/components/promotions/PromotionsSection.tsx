"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Zap, Plus, LayoutGrid, List, Sparkles } from "lucide-react";
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

// ─── Composants spéciaux partagés ────────────────────────────────────────────
import Toast from "@/components/notifications/Toast";
import LoadingKalvin from "@/components/special/loadingKalvin";
import EmptyState from "@/components/special/EmptyState";
import ErrorState from "@/components/special/ErrorState";
import ConfirmDialog from "@/components/special/ConfirmDialog";

// ─── Sous-composants promotions ───────────────────────────────────────────────
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

    // ── Chargement ───────────────────────────────────────────────────────────
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
                const { getAdminProducts }   = await import("@/fonctions_api/produits.api");
                const [catRes, prodRes] = await Promise.all([getAdminCategories(), getAdminProducts()]);
                if (catRes.ok)  setCategories(((catRes as any).results ?? catRes.data) || []);
                if (prodRes.ok) setProductsList(((prodRes as any).results ?? prodRes.data) || []);
            } catch { /* silencieux */ }

        } catch {
            setError("Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── Statistiques ─────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        activeCodes:  promoCodes.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length,
        totalUses:    promoCodes.reduce((acc, c) => acc + (c.number_times_used || 0), 0),
        activeSales:  sales.filter(s => s.is_active && new Date(s.ends_at) > new Date()).length,
    }), [promoCodes, sales]);

    // ── Handlers codes promo ──────────────────────────────────────────────────
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

    // ── Handlers ventes flash ─────────────────────────────────────────────────
    const handleSaveSale = async (data: any) => {
        setSaving(true);
        const res = editingSale
            ? await updateAdminSale(editingSale.id, data)
            : await createAdminSale(data);
        if (res.ok) {
            setToast({ show: true, type: "success", message: `Vente flash ${editingSale ? "modifiée" : "créée"} avec succès` });
            setSaleModalOpen(false);
            loadData();
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Une erreur est survenue" });
        }
        setSaving(false);
    };

    // ── Handler suppression ───────────────────────────────────────────────────
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

    // ── Erreur totale ─────────────────────────────────────────────────────────
    if (error && !promoCodes.length && !sales.length) {
        return <ErrorState message={error} onRetry={loadData} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Toast ─────────────────────────────────────────────────────── */}
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(p => ({ ...p, show: false }))}
            />

            {/* ── Confirm suppression ───────────────────────────────────────── */}
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

            {/* ── Modales Détail ────────────────────────────────────────────── */}
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

            {/* ── Modales Création / Édition ────────────────────────────────── */}
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

            {/* ── En-tête ───────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Promotions
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
                        Gérez vos codes de réduction, lancez des ventes flash exclusives et boostez vos ventes.
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (tab === "codes") { setEditingCode(null); setCodeModalOpen(true); }
                        else { setEditingSale(null); setSaleModalOpen(true); }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    {tab === "codes" ? "Nouveau code promo" : "Nouvelle vente flash"}
                </button>
            </div>

            {/* ── KPI ──────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                    { icon: <Tag className="h-6 w-6 text-primary" />, value: stats.activeCodes,  label: "Codes promo actifs",      glow: "bg-primary/10" },
                    { icon: <Tag className="h-6 w-6 text-blue-500" />, value: stats.totalUses,   label: "Utilisations totales",     glow: "bg-blue-500/10" },
                    { icon: <Zap className="h-6 w-6 text-amber-500" />, value: stats.activeSales, label: "Ventes flash en cours",   glow: "bg-amber-500/10" },
                ].map((kpi, i) => (
                    <motion.div key={i} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm">
                        <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl", kpi.glow)} />
                        {kpi.icon}
                        <p className="mt-3 text-4xl font-extrabold text-foreground">{kpi.value}</p>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Onglets + vue ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-elevated p-2 rounded-2xl border border-border shadow-sm">
                <div className="flex gap-2 w-full sm:w-auto">
                    {([
                        { key: "codes", label: "Codes Promo", icon: <Tag className="h-4 w-4" />, count: promoCodes.length },
                        { key: "sales", label: "Ventes Flash", icon: <Zap className="h-4 w-4" />, count: sales.length },
                    ] as const).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                                tab === t.key ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                            )}
                        >
                            {t.icon} {t.label}
                            <span className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                                tab === t.key ? "bg-white/20" : "bg-surface-alt"
                            )}>{t.count}</span>
                        </button>
                    ))}
                </div>

                <div className="flex rounded-xl border border-border bg-surface p-1 pr-2">
                    <button onClick={() => setViewMode("grid")} className={cn("rounded-lg p-2 transition-colors", viewMode === "grid" ? "bg-surface-alt text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("list")} className={cn("rounded-lg p-2 transition-colors", viewMode === "list" ? "bg-surface-alt text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Contenu ───────────────────────────────────────────────────── */}
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
                                ? "grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
                        title="Aucune vente flash"
                        description="Créez une vente flash pour mettre en avant un produit à prix réduit pendant un temps limité."
                        actionText="Lancer une vente flash"
                        onAction={() => { setEditingSale(null); setSaleModalOpen(true); }}
                        icon={Zap}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            viewMode === "grid"
                                ? "grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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