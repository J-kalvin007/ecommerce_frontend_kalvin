// app/admin/components/fidelites/LoyaltySection.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Crown, Search, LayoutGrid, List, Settings } from "lucide-react";
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
import LoadingKalvin from "@/components/special/loadingKalvin";
import EmptyState from "@/components/special/EmptyState";
import ErrorState from "@/components/special/ErrorState";
import ConfirmDialog from "@/components/special/ConfirmDialog";

// ─── Sous-composants fidélité ────────────────────────────────────────────────
import { LoyaltyStatsBar } from "./components/LoyaltyStatsBar";
import { LoyaltyProfileGrid } from "./components/LoyaltyProfileGrid";
import { LoyaltyProfileDetailModal } from "./components/LoyaltyProfileDetailModal";
import { LoyaltyAdjustPointsModal } from "./components/LoyaltyAdjustPointsModal";
import { LoyaltyTiersPanel } from "./components/LoyaltyTiersPanel";
import { LoyaltyTierFormModal } from "./components/LoyaltyTierFormModal";
import { LoyaltyPointValuePanel } from "./components/LoyaltyPointValuePanel";

type TabType = "profiles" | "tiers" | "config";

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
        <div className="space-y-8 px-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
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





            {/* ── En-tête avec effet premium ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-2"
            >
                <div className="relative inline-block group">
                    <h2
                        className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
                        style={{
                            letterSpacing: "-0.025em",
                            backgroundImage:
                                "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
                            backgroundSize: "220% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        <Crown className="h-8 w-8 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
                        Programme de Fidélité
                    </h2>

                    {/* Kicker discret en lettres espacées doré, signature premium */}
                    <span
                        className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
                        style={{ color: "#B8924A", opacity: 0.85 }}
                    >
                        Supervisez les points de vos clients, analysez la répartition par paliers.
                    </span>

                    {/* Gradient SVG caché pour l'icône */}
                    <svg width="0" height="0" className="absolute">
                        <defs>
                            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FDE68A" />
                                <stop offset="50%" stopColor="#D97706" />
                                <stop offset="100%" stopColor="#B45309" />
                            </linearGradient>
                        </defs>
                    </svg>


                    {/* Animations scoppées, avec respect du prefers-reduced-motion */}
                    <style>{`
                @keyframes premium-title-shine-anim {
                0%, 100% { background-position: 0% center; }
                50% { background-position: 100% center; }
                }
                .premium-title-shine {
                animation: premium-title-shine-anim 6s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                .premium-title-shine {
                    animation: none;
                }
                }
            `}</style>
                </div>
            </motion.div>











            {/* ── Stats globales ────────────────────────────────────────────── */}
            <LoyaltyStatsBar stats={stats} />

            {/* ── Onglets ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-elevated p-2 rounded-2xl border border-border shadow-sm">
                <div className="flex gap-2 w-full sm:w-auto">
                    {([
                        { key: "profiles", label: "Profils clients", icon: <Star className="h-4 w-4" /> },
                        { key: "tiers", label: "Paliers & Avantages", icon: <Crown className="h-4 w-4" /> },
                        { key: "config", label: "Valeur des Points", icon: <Settings className="h-4 w-4" /> },
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
                <LoadingKalvin message="Chargement des utilisateurs.." />
            ) : tab === "profiles" ? (
                filteredProfiles.length === 0 ? (
                    <EmptyState
                        title="Aucun profil de fidélité"
                        description={search ? `Aucun résultat pour "${search}".` : "Il n'y a pas encore de clients inscrits au programme de fidélité."}
                        icon={Star}
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
            ) : tab === "tiers" ? (
                <div className="max-w-4xl">
                    <LoyaltyTiersPanel
                        tiers={tiers}
                        isAdmin={true}
                        onAdd={() => { setEditingTier(null); setTierFormOpen(true); }}
                        onEdit={(tier) => { setEditingTier(tier); setTierFormOpen(true); }}
                        onDelete={(tier) => setDeleteTierConfirm(tier)}
                    />
                </div>
            ) : (
                <div className="max-w-2xl">
                    <LoyaltyPointValuePanel
                        onToast={(type, message) => setToast({ show: true, type, message })}
                    />
                </div>
            )}
        </div>
    );
}
