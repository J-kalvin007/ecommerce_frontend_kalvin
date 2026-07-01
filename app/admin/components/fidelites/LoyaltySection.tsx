"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Crown, Search, LayoutGrid, List, Settings, Gift, RefreshCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    getAdminLoyaltyProfiles,
    getLoyaltyTiers,
    deleteAdminLoyaltyProfile,
    deleteAdminLoyaltyTier,
} from "@/fonctions_api/fidelites.api";
import type { LoyaltyProfile, Tier } from "@/modeles/fidelites";
import { computeLoyaltyStats } from "@/modeles/fidelites";

// --- Composants spéciaux partagés --------------------------------------------
import Toast from "@/components/notifications/Toast";
import LoadingKalvin from "@/components/special/loadingKalvin";
import EmptyState from "@/components/special/EmptyState";
import ErrorState from "@/components/special/ErrorState";
import ConfirmDialog from "@/components/special/ConfirmDialog";

// --- Sous-composants fidélité ------------------------------------------------
import { LoyaltyStatsBar } from "./components/LoyaltyStatsBar";
import { LoyaltyProfileGrid } from "./components/LoyaltyProfileGrid";
import { LoyaltyProfileDetailModal } from "./components/LoyaltyProfileDetailModal";
import { LoyaltyAdjustPointsModal } from "./components/LoyaltyAdjustPointsModal";
import { LoyaltyTiersPanel } from "./components/LoyaltyTiersPanel";
import { LoyaltyTierFormModal } from "./components/LoyaltyTierFormModal";
import { LoyaltyPointValuePanel } from "./components/LoyaltyPointValuePanel";
import { LoyaltyRewardRulePanel } from "./components/LoyaltyRewardRulePanel";

type TabType = "profiles" | "tiers" | "rewards" | "config";

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

    // -- Chargement -----------------------------------------------------------
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

    // -- Stats ----------------------------------------------------------------
    const stats = useMemo(() => computeLoyaltyStats(profiles), [profiles]);

    // -- Filtrage -------------------------------------------------------------
    const filteredProfiles = useMemo(() => {
        if (!search) return profiles;
        const q = search.toLowerCase();
        return profiles.filter(p =>
            p.id.toLowerCase().includes(q) ||
            p.tier_name.toLowerCase().includes(q)
        );
    }, [profiles, search]);

    // -- Handler suppression ---------------------------------------------------
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

    // -- Erreur totale ---------------------------------------------------------
    if (error && !profiles.length) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <RefreshCcw className="h-8 w-8" />
                    </div>
                    <p className="font-bold text-[#0F2D20]">{error}</p>
                    <button onClick={loadData} className="rounded-xl bg-[#0F2D20] cursor-pointer px-6 py-2 text-sm font-bold text-gray-100 transition-all hover:bg-[#1a4a30]">
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 px-8 py-8 xl:px-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                title="Supprimer le profil"
                message="Êtes-vous sûr de vouloir supprimer définitivement ce profil de fidélité ? Ses points et avantages seront perdus. Cette action est irréversible."
                confirmText="Supprimer"
                type="danger"
                isLoading={deleting}
            />

            {/* -- Confirm suppression Palier ----------------------------------------- */}
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

            {/* -- Formulaire Palier ----------------------------------------- */}
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

            {/* -- Modales ----------------------------------------------------- */}
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

            {/* -- En-tête avec effet premium -- */}
            {/* <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-2 relative overflow-hidden rounded-[2.5rem] bg-[#0F2D20] p-10 md:p-12 shadow-2xl"
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('/noise.png')" }}></div>
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#C9963A]/20 blur-3xl pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-[#1a4a30]/80 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
                            <Crown className="h-4 w-4 text-[#C9963A]" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9963A]">Fidélité & Récompenses</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-100 tracking-tight">
                            Atelier du <span className="text-[#C9963A]">Terroir</span>
                        </h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-gray-100/70 font-medium">
                            Pilotez l'intégralité du programme de fidélité, définissez vos récompenses sur mesure, ajustez les paliers VIP et administrez les points de vos clients avec une précision absolue.
                        </p>
                    </div>
                </div>
            </motion.div> */}




            {/* -- En-tête avec effet premium -- */}
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
                        <Crown className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
                        Points de Fidélité
                    </h2>

                    {/* Kicker discret en lettres espacées doré, signature premium */}
                    <span
                        className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
                        style={{ color: "#B8924A", opacity: 0.85 }}
                    >
                        Pilotez l'intégralité du programme de fidélité.
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

            {/* -- Stats globales ---------------------------------------------- */}
            <LoyaltyStatsBar stats={stats} />

            {/* -- Navigation (Onglets) ----------------------------------------------------- */}
            <div className="flex flex-col xl:flex-row gap-5 items-center justify-between rounded-3xl bg-white p-3 shadow-[0_8px_30px_rgba(15,45,32,0.04)] border border-[#dde5d8]">
                <div className="flex w-full xl:w-auto gap-2 overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
                    {([
                        { key: "profiles", label: "Profils Clients", icon: <Star className="h-4 w-4" /> },
                        { key: "tiers", label: "Paliers VIP", icon: <Crown className="h-4 w-4" /> },
                        { key: "rewards", label: "Règles & Bénéfices", icon: <Gift className="h-4 w-4" /> },
                        { key: "config", label: "Taux de Conversion", icon: <Settings className="h-4 w-4" /> },

                    ] as const).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                "flex-shrink-0 flex items-center cursor-pointer justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-[13px] font-bold tracking-wide uppercase transition-all duration-300",
                                tab === t.key
                                    ? "bg-[#0F2D20] text-gray-100 shadow-[0_8px_20px_rgba(15,45,32,0.2)]"
                                    : "text-[#6b7a65] hover:bg-[#f8faf6] hover:text-[#0F2D20]"
                            )}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>


                {tab === "profiles" && (
                    <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
                        <div className="relative flex-1 xl:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9685]" />
                            <input
                                type="text"
                                placeholder="Rechercher un profil..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 w-full rounded-2xl border-2 border-[#f0f3ed] bg-[#f8faf6] pl-11 pr-4 text-sm font-semibold text-[#0F2D20] outline-none transition-all placeholder:text-[#8a9685] focus:border-[#C9963A] focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-[#f8faf6] rounded-2xl p-1.5 border-2 border-[#f0f3ed]">

                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "flex h-9 w-10 items-center cursor-pointer justify-center rounded-xl transition-all duration-300",
                                    viewMode === "grid" ? "bg-white text-[#0F2D20] shadow-sm" : "text-[#8a9685] hover:text-[#0F2D20]"
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "flex h-9 w-10 items-center cursor-pointer justify-center rounded-xl transition-all duration-300",
                                    viewMode === "list" ? "bg-white text-[#0F2D20] shadow-sm" : "text-[#8a9685] hover:text-[#0F2D20]"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>

                        </div>

                    </div>
                )}
            </div>

            {/* -- Contenu Principal ----------------------------------------------------- */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                >
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-[#C9963A]" />
                                <p className="text-sm font-semibold tracking-widest text-[#8a9685] uppercase">Chargement des données...</p>
                            </div>
                        </div>
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
                        <div className="mx-auto max-w-5xl">
                            <LoyaltyTiersPanel
                                tiers={tiers}
                                isAdmin={true}
                                onAdd={() => { setEditingTier(null); setTierFormOpen(true); }}
                                onEdit={(tier) => { setEditingTier(tier); setTierFormOpen(true); }}
                                onDelete={(tier) => setDeleteTierConfirm(tier)}
                            />
                        </div>
                    ) : tab === "rewards" ? (
                        <div className="mx-auto max-w-5xl">
                            <LoyaltyRewardRulePanel
                                onToast={(type, message) => setToast({ show: true, type, message })}
                            />
                        </div>
                    ) : (
                        <div className="mx-auto max-w-3xl">
                            <LoyaltyPointValuePanel
                                onToast={(type, message) => setToast({ show: true, type, message })}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
