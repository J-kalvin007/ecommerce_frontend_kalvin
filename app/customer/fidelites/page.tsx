

/**
 * page.tsx — Programme de Fidélité Client
 * -----------------------------------------------------------------------------
 * Page principale de gestion du programme de fidélité du client.
 * Intégrée dans le CustomerShell.
 *
 * Architecture de la page :
 *   1. Carte hero du profil et grade (LoyaltyProfileCard)
 *   2. Grille des paliers disponibles (LoyaltyTiersGrid)
 *   3. Journal des événements filtrable (LoyaltyHistoryList)
 *
 * Orchestration :
 *   - Chargement parallèle du profil, des paliers et de l'historique
 *   - Modale de dépense de points (RedeemPointsModal)
 *   - Toast de notification global
 *   - Gestion robuste des états loading / erreur / vide
 *
 * @module app/customer/fidelites/page
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

import CustomerShell from "@/app/customer/components/CustomerShell";
import ErrorState from "@/components/special/ErrorState";
import LoadingStyle from "@/components/special/loadingStyle";
import Toast from "@/components/special/Toast";

import {
  getMyLoyaltyProfile,
  getLoyaltyTiers,
  getLoyaltyHistory,
  getPointValue,
} from "@/fonctions_api/fidelites.api";
import type { LoyaltyProfile, Tier, LoyaltyEvent, PointValue } from "@/modeles/fidelites";

import LoyaltyProfileCard from "./components/LoyaltyProfileCard";
import LoyaltyTiersGrid from "./components/LoyaltyTiersGrid";
import LoyaltyHistoryList from "./components/LoyaltyHistoryList";
import RedeemPointsModal from "./components/RedeemPointsModal";

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CustomerFidelitesPage() {
  /* -- État : Profil de fidélité ---------------------------------------- */
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* -- État : Paliers --------------------------------------------------- */
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  /* -- État : Historique ------------------------------------------------ */
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  /* -- État : Valeur de points ------------------------------------------ */
  const [pointValueConfig, setPointValueConfig] = useState<PointValue | null>(null);

  /* -- État : Modale de dépense ----------------------------------------- */
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  /* -- État : Toast de notification ------------------------------------ */
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  /* -- Helper toast --------------------------------------------------- */
  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      setToast({ show: true, type, message });
    },
    []
  );

  /* -- Fetch : Profil de fidélité ------------------------------------ */
  const fetchProfile = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoadingProfile(true);
        setProfileError(null);
      } else {
        setIsRefreshing(true);
      }

      const result = await getMyLoyaltyProfile();

      if (result.ok) {
        setProfile(result.data);
        if (silent) showToast("success", "Profil actualisé avec succès.");
      } else {
        setProfileError(
          result.error?.message || "Impossible de charger votre profil de fidélité."
        );
      }

      setIsLoadingProfile(false);
      setIsRefreshing(false);
    },
    [showToast]
  );

  /* -- Fetch : Paliers ----------------------------------------------- */
  const fetchTiers = useCallback(async () => {
    setIsLoadingTiers(true);
    const result = await getLoyaltyTiers();
    if (result.ok) setTiers(result.data);
    setIsLoadingTiers(false);
  }, []);

  /* -- Fetch : Historique -------------------------------------------- */
  const fetchHistory = useCallback(async () => {
    setIsLoadingEvents(true);
    const result = await getLoyaltyHistory();
    if (result.ok) setEvents(result.data);
    setIsLoadingEvents(false);
  }, []);

  /* -- Fetch : Valeur de points -------------------------------------- */
  const fetchPointValue = useCallback(async () => {
    const result = await getPointValue();
    if (result.ok) setPointValueConfig(result.data);
  }, []);

  /* -- Chargement initial en parallèle ------------------------------ */
  useEffect(() => {
    fetchProfile();
    fetchTiers();
    fetchHistory();
    fetchPointValue();
  }, [fetchProfile, fetchTiers, fetchHistory, fetchPointValue]);

  /* -- Callback de succès après dépense de points ------------------- */
  const handleRedeemSuccess = useCallback(
    (message: string) => {
      showToast("success", message);
      // Rafraîchir le profil (nouveau solde) et l'historique
      fetchProfile(true);
      fetchHistory();
    },
    [showToast, fetchProfile, fetchHistory]
  );

  /* ═══════════════════════════════════════════════════════════════════
     Rendu
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <CustomerShell activeSection="loyalty">
      <div className="mx-auto max-w-8xl px-20 py-8 sm:px-6 lg:px-20 space-y-10">

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
              Mes points de Fidélité
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Suivez vos points, progressez dans les grades et profitez de vos avantages exclusifs.
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




        {/* -- État chargement global -- */}
        {isLoadingProfile ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement de votre profil fidélité…" size={16} />
          </div>
        ) : profileError ? (
          /* -- État erreur -- */
          <ErrorState
            title="Impossible de charger le profil"
            message={profileError}
            buttonText="Réessayer"
            onRetry={() => fetchProfile()}
          />
        ) : profile ? (
          /* -- Contenu principal -- */
          <AnimatePresence mode="wait">
            <motion.div
              key="fidelite-content"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10"
            >
              {/* 1. Carte hero du profil + grade */}
              <LoyaltyProfileCard
                profile={profile}
                tiers={tiers}
                pointValueConfig={pointValueConfig}
                isRefreshing={isRefreshing}
                onRedeem={() => setShowRedeemModal(true)}
                onRefresh={() => fetchProfile(true)}
              />

              {/* 2. Grille des paliers (masquée pendant le chargement) */}
              {!isLoadingTiers && tiers.length > 0 && (
                <LoyaltyTiersGrid
                  tiers={tiers}
                  currentTierName={profile.tier_name}
                  currentPoints={profile.points_balance}
                />
              )}

              {/* 3. Journal des événements */}
              <LoyaltyHistoryList
                events={events}
                isLoading={isLoadingEvents}
              />
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>

      {/* -- Modale de dépense de points -- */}
      {profile && (
        <RedeemPointsModal
          isOpen={showRedeemModal}
          profile={profile}
          pointValueConfig={pointValueConfig}
          onClose={() => setShowRedeemModal(false)}
          onSuccess={handleRedeemSuccess}
        />
      )}

      {/* -- Toast de notification -- */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
        position="bottom-right"
      />
    </CustomerShell>
  );
}
