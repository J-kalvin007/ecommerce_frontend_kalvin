// app/admin/components/fidelites/LoyaltySection.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Crown, Search, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    getAdminLoyaltyProfiles,
    getLoyaltyTiers,
    deleteAdminLoyaltyProfile,
    deleteAdminLoyaltyTier,
} from "@/fonctions_api/fidelites.api";
import type { LoyaltyProfile, Tier } from "@/modeles/fidelites";
import { computeLoyaltyStats } from "@/modeles/fidelites";

// ─── Composants spéciaux partagés ────────────────────────────────────────────
import Toast from "@/components/notifications/Toast";
import LoadingKalvin from "@/components/widgets_originaux/special/loadingKalvin";
import EmptyState from "@/components/widgets_originaux/special/EmptyState";
import ErrorState from "@/components/widgets_originaux/special/ErrorState";
import ConfirmDialog from "@/components/widgets_originaux/special/ConfirmDialog";

// ─── Sous-composants fidélité ────────────────────────────────────────────────
import { LoyaltyStatsBar } from "./components/LoyaltyStatsBar";
import { LoyaltyProfileGrid } from "./components/LoyaltyProfileGrid";
import { LoyaltyProfileDetailModal } from "./components/LoyaltyProfileDetailModal";
import { LoyaltyAdjustPointsModal } from "./components/LoyaltyAdjustPointsModal";
import { LoyaltyTiersPanel } from "./components/LoyaltyTiersPanel";
import { LoyaltyTierFormModal } from "./components/LoyaltyTierFormModal";

type TabType = "profiles" | "tiers";

export default function LoyaltySection() {
    const [tab, setTab] = useState<TabType>("profiles");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Données
    const [profiles, setProfiles] = useState<LoyaltyProfile[]>([]);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtres
    const [search, setSearch] = useState("");

    // Modales
    const [detailProfile, setDetailProfile] = useState<LoyaltyProfile | null>(null);
    const [adjustProfile, setAdjustProfile] = useState<LoyaltyProfile | null>(null);

    // Confirmation suppression
    const [deleteConfirm, setDeleteConfirm] = useState<LoyaltyProfile | null>(null);
    const [deleteTierConfirm, setDeleteTierConfirm] = useState<Tier | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Formulaire Palier
    const [tierFormOpen, setTierFormOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<Tier | null>(null);

    // Toast
    const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>
        ({ show: false, type: "success", message: "" });

    // ── Chargement ───────────────────────────────────────────────────────────
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [profilesRes, tiersRes] = await Promise.all([getAdminLoyaltyProfiles(), getLoyaltyTiers()]);

            if (profilesRes.ok) {
                setProfiles(profilesRes.data);
            } else {
                setError(profilesRes.error.message || "Erreur lors du chargement des profils");
            }

            if (tiersRes.ok) {
                setTiers(tiersRes.data);
            }
        } catch {
            setError("Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => computeLoyaltyStats(profiles), [profiles]);

    // ── Filtrage ─────────────────────────────────────────────────────────────
    const filteredProfiles = useMemo(() => {
        if (!search) return profiles;
        const q = search.toLowerCase();
        return profiles.filter(p =>
            p.id.toLowerCase().includes(q) ||
            p.tier_name.toLowerCase().includes(q)
        );
    }, [profiles, search]);

    // ── Handler suppression ───────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        const res = await deleteAdminLoyaltyProfile(deleteConfirm.id);
        if (res.ok) {
            setToast({ show: true, type: "success", message: "Profil de fidélité supprimé avec succès." });
            setDetailProfile(null); // Fermer la modale si ouverte
            loadData();
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Erreur lors de la suppression." });
        }
        setDeleting(false);
        setDeleteConfirm(null);
    };

    const handleDeleteTier = async () => {
        if (!deleteTierConfirm) return;
        setDeleting(true);
        const res = await deleteAdminLoyaltyTier(deleteTierConfirm.id);
        if (res.ok) {
            setToast({ show: true, type: "success", message: "Palier supprimé avec succès." });
            loadData();
        } else {
            setToast({ show: true, type: "error", message: res.error.message || "Erreur lors de la suppression." });
        }
        setDeleting(false);
        setDeleteTierConfirm(null);
    };

    // ── Erreur totale ─────────────────────────────────────────────────────────
    if (error && !profiles.length) {
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
                title="Supprimer le profil"
                message="Êtes-vous sûr de vouloir supprimer définitivement ce profil de fidélité ? Ses points et avantages seront perdus. Cette action est irréversible."
                confirmText="Supprimer"
                type="danger"
                isLoading={deleting}
            />

            {/* ── Confirm suppression Palier ───────────────────────────────────────── */}
            <ConfirmDialog
                isOpen={!!deleteTierConfirm}
                onCancel={() => setDeleteTierConfirm(null)}
                onConfirm={handleDeleteTier}
                title="Supprimer le palier"
                message={`Êtes-vous sûr de vouloir supprimer le palier "${deleteTierConfirm?.name}" ? Cette action est irréversible et peut impacter les utilisateurs s'ils y sont rattachés.`}
                confirmText="Supprimer"
                type="danger"
                isLoading={deleting}
            />

            {/* ── Formulaire Palier ───────────────────────────────────────── */}
            <LoyaltyTierFormModal
                open={tierFormOpen}
                onClose={() => setTierFormOpen(false)}
                tier={editingTier}
                onSuccess={() => {
                    setTierFormOpen(false);
                    setToast({ show: true, type: "success", message: "Palier sauvegardé avec succès." });
                    loadData();
                }}
            />

            {/* ── Modales ───────────────────────────────────────────────────── */}
            <LoyaltyProfileDetailModal
                profile={detailProfile}
                tiers={tiers}
                onClose={() => setDetailProfile(null)}
                onAdjust={() => {
                    if (detailProfile) {
                        setAdjustProfile(detailProfile);
                        setDetailProfile(null);
                    }
                }}
                onDelete={() => {
                    if (detailProfile) {
                        setDeleteConfirm(detailProfile);
                    }
                }}
            />

            <LoyaltyAdjustPointsModal
                open={!!adjustProfile}
                onClose={() => setAdjustProfile(null)}
                profile={adjustProfile}
                onSuccess={loadData}
            />

            {/* ── En-tête ───────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <Crown className="h-8 w-8 text-primary" />
                        Programme de Fidélité
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
                        Supervisez les points de vos clients, analysez la répartition par paliers et ajustez manuellement les soldes.
                    </p>
                </div>
            </div>

            {/* ── Stats globales ────────────────────────────────────────────── */}
            <LoyaltyStatsBar stats={stats} />

            {/* ── Onglets ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-elevated p-2 rounded-2xl border border-border shadow-sm">
                <div className="flex gap-2 w-full sm:w-auto">
                    {([
                        { key: "profiles", label: "Profils clients", icon: <Sparkles className="h-4 w-4" /> },
                        { key: "tiers", label: "Paliers & Avantages", icon: <Crown className="h-4 w-4" /> },
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
                        </button>
                    ))}
                </div>

                {tab === "profiles" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64 shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex bg-surface-alt rounded-lg p-1 border border-border">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    viewMode === "grid" ? "bg-surface shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Vue Grille"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    viewMode === "list" ? "bg-surface shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Vue Liste"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Contenu ───────────────────────────────────────────────────── */}
            {loading ? (
                <LoadingKalvin />
            ) : tab === "profiles" ? (
                filteredProfiles.length === 0 ? (
                    <EmptyState
                        title="Aucun profil de fidélité"
                        description={search ? `Aucun résultat pour "${search}".` : "Il n'y a pas encore de clients inscrits au programme de fidélité."}
                        icon={Sparkles}
                    />
                ) : (
                    <LoyaltyProfileGrid
                        profiles={filteredProfiles}
                        tiers={tiers}
                        onView={setDetailProfile}
                        onAdjust={setAdjustProfile}
                        viewMode={viewMode}
                    />
                )
            ) : (
                <div className="max-w-4xl">
                    <LoyaltyTiersPanel
                        tiers={tiers}
                        isAdmin={true}
                        onAdd={() => { setEditingTier(null); setTierFormOpen(true); }}
                        onEdit={(tier) => { setEditingTier(tier); setTierFormOpen(true); }}
                        onDelete={(tier) => setDeleteTierConfirm(tier)}
                    />
                </div>
            )}
        </div>
    );
}
