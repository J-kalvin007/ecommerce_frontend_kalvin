


// // app/admin/components/promotions/PromotionsSection.tsx
// "use client";
// import { useEffect, useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Tag, Zap, Plus, LayoutGrid, List, RefreshCw } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { getAdminPromoCodes, createAdminPromoCode, updateAdminPromoCode, deleteAdminPromoCode, getAdminSales, createAdminSale, updateAdminSale, deleteAdminSale } from "@/fonctions_api/promotions.api";
// import type { AdminPromoCode, AdminSoldes } from "@/modeles/promotions";
// import Toast from "@/components/notifications/Toast";
// import LoadingStyle from "@/components/special/loadingStyle";
// import ConfirmDialog from "@/components/special/ConfirmDialog";
// import ErrorState from "@/components/special/ErrorState";
// import EmptyState from "@/components/special/EmptyState";
// import { PromoCodeCard } from "./PromoCodeCard";
// import { PromoCodeModal } from "./PromoCodeModal";
// import { FlashSaleCard } from "./FlashSaleCard";

// type TabType = "codes" | "sales";

// export default function PromotionsSection() {
//     const [tab, setTab] = useState<TabType>("codes");
//     const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//     const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
//     const [sales, setSales] = useState<AdminSoldes[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // États modales
//     const [codeModalOpen, setCodeModalOpen] = useState(false);
//     const [saleModalOpen, setSaleModalOpen] = useState(false);
//     const [editingCode, setEditingCode] = useState<AdminPromoCode | null>(null);
//     const [editingSale, setEditingSale] = useState<AdminSoldes | null>(null);
//     const [saving, setSaving] = useState(false);

//     // État confirmation suppression
//     const [deleteConfirm, setDeleteConfirm] = useState<{ type: "code" | "sale"; id: string } | null>(null);
//     const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });

//     const loadData = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const [codesRes, salesRes] = await Promise.all([getAdminPromoCodes(), getAdminSales()]);
//             if (codesRes.ok) setPromoCodes(codesRes.data);
//             else setError(codesRes.error.message);
//             if (salesRes.ok) setSales(salesRes.data);
//         } catch (err) {
//             setError("Impossible de charger les données.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { loadData(); }, []);

//     const stats = useMemo(() => ({
//         activeCodes: promoCodes.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length,
//         totalUses: promoCodes.reduce((acc, c) => acc + c.number_times_used, 0),
//         activeSales: sales.filter(s => s.is_active && new Date(s.ends_at) > new Date()).length,
//     }), [promoCodes, sales]);

//     const handleSaveCode = async (data: any) => {
//         setSaving(true);
//         const result = editingCode ? await updateAdminPromoCode(editingCode.id, data) : await createAdminPromoCode(data);
//         if (result.ok) {
//             setToast({ show: true, type: "success", message: `Code promo ${editingCode ? "modifié" : "créé"} avec succès` });
//             setCodeModalOpen(false);
//             loadData();
//         } else {
//             setToast({ show: true, type: "error", message: result.error.message });
//         }
//         setSaving(false);
//     };

//     const handleDeleteCode = async () => {
//         if (!deleteConfirm || deleteConfirm.type !== "code") return;
//         const res = await deleteAdminPromoCode(deleteConfirm.id);
//         if (res.ok) {
//             setToast({ show: true, type: "success", message: "Code promo supprimé" });
//             loadData();
//         } else {
//             setToast({ show: true, type: "error", message: res.error.message });
//         }
//         setDeleteConfirm(null);
//     };

//     // Mêmes fonctions pour les ventes sales (handleSaveSale, handleDeleteSale)

//     if (error && !promoCodes.length && !sales.length) return <ErrorState message={error} onRetry={loadData} />;

//     return (
//         <div className="space-y-6">
//             <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast(p => ({ ...p, show: false }))} />
//             <ConfirmDialog isOpen={!!deleteConfirm} onCancel={() => setDeleteConfirm(null)} onConfirm={deleteConfirm?.type === "code" ? handleDeleteCode : handleDeleteSale} title="Supprimer" message="Cette action est irréversible." confirmText="Supprimer" type="danger" />

//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div><h1 className="text-2xl font-bold text-foreground">Promotions</h1><p className="text-sm text-muted-foreground">Gérez vos codes promo et ventes flash.</p></div>
//                 <div className="flex items-center gap-3">
//                     <div className="flex rounded-lg border border-border bg-surface p-1">
//                         <button onClick={() => setViewMode("grid")} className={cn("rounded-md p-1.5", viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground")}><LayoutGrid className="h-4 w-4" /></button>
//                         <button onClick={() => setViewMode("list")} className={cn("rounded-md p-1.5", viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground")}><List className="h-4 w-4" /></button>
//                     </div>
//                     <button onClick={() => { setEditingCode(null); setCodeModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90"><Plus className="h-4 w-4" /> Nouveau</button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//                 <div className="rounded-2xl border border-border bg-surface p-4"><Tag className="h-4 w-4 text-primary" /><p className="mt-2 text-xl font-bold">{stats.activeCodes}</p><p className="text-xs text-muted-foreground">Codes actifs</p></div>
//                 <div className="rounded-2xl border border-border bg-surface p-4"><Tag className="h-4 w-4 text-primary" /><p className="mt-2 text-xl font-bold">{stats.totalUses}</p><p className="text-xs text-muted-foreground">Utilisations totales</p></div>
//                 <div className="rounded-2xl border border-border bg-surface p-4"><Zap className="h-4 w-4 text-primary" /><p className="mt-2 text-xl font-bold">{stats.activeSales}</p><p className="text-xs text-muted-foreground">Ventes flash actives</p></div>
//             </div>

//             <div className="flex gap-2 border-b border-border">
//                 <button onClick={() => setTab("codes")} className={cn("pb-2 text-sm font-semibold transition-colors", tab === "codes" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>Codes promo</button>
//                 <button onClick={() => setTab("sales")} className={cn("pb-2 text-sm font-semibold transition-colors", tab === "sales" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>Ventes flash</button>
//             </div>

//             {loading ? <LoadingStyle label="Chargement des promotions..." /> : (
//                 tab === "codes" ? (
//                     promoCodes.length === 0 ? <EmptyState title="Aucun code promo" description="Créez votre premier code de réduction." actionText="Créer" onAction={() => setCodeModalOpen(true)} icon={Tag} /> : (
//                         <div className={cn("grid gap-5", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
//                             {promoCodes.map(p => <PromoCodeCard key={p.id} promo={p} onEdit={() => { setEditingCode(p); setCodeModalOpen(true); }} onDelete={() => setDeleteConfirm({ type: "code", id: p.id })} />)}
//                         </div>
//                     )
//                 ) : (
//                     sales.length === 0 ? <EmptyState title="Aucune vente flash" description="Lancez votre première promotion éphémère." actionText="Créer" onAction={() => setSaleModalOpen(true)} icon={Zap} /> : (
//                         <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//                             {sales.map(s => <FlashSaleCard key={s.id} sale={s} onEdit={() => { setEditingSale(s); setSaleModalOpen(true); }} onDelete={() => setDeleteConfirm({ type: "sale", id: s.id })} />)}
//                         </div>
//                     )
//                 )
//             )}

//             <PromoCodeModal open={codeModalOpen} onClose={() => setCodeModalOpen(false)} onSave={handleSaveCode} initialData={editingCode || {}} isEditing={!!editingCode} isSaving={saving} />
//             <FlashSaleModal open={saleModalOpen} onClose={() => setSaleModalOpen(false)} onSave={handleSaveSale} initialData={editingSale || {}} isEditing={!!editingSale} isSaving={saving} />
//         </div>
//     );
// }