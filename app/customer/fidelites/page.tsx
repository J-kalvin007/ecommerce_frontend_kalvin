

/**
 * page.tsx — Programme de Fidélité Client
 * ─────────────────────────────────────────────────────────────────────────────
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
} from "@/fonctions_api/fidelites.api";
import type { LoyaltyProfile, Tier, LoyaltyEvent } from "@/modeles/fidelites";

import LoyaltyProfileCard from "./components/LoyaltyProfileCard";
import LoyaltyTiersGrid from "./components/LoyaltyTiersGrid";
import LoyaltyHistoryList from "./components/LoyaltyHistoryList";
import RedeemPointsModal from "./components/RedeemPointsModal";

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CustomerFidelitesPage() {
  /* ── État : Profil de fidélité ──────────────────────────────────────── */
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ── État : Paliers ─────────────────────────────────────────────────── */
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(true);

  /* ── État : Historique ──────────────────────────────────────────────── */
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  /* ── État : Modale de dépense ───────────────────────────────────────── */
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  /* ── État : Toast de notification ──────────────────────────────────── */
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  /* ── Helper toast ─────────────────────────────────────────────────── */
  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      setToast({ show: true, type, message });
    },
    []
  );

  /* ── Fetch : Profil de fidélité ──────────────────────────────────── */
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

  /* ── Fetch : Paliers ─────────────────────────────────────────────── */
  const fetchTiers = useCallback(async () => {
    setIsLoadingTiers(true);
    const result = await getLoyaltyTiers();
    if (result.ok) setTiers(result.data);
    setIsLoadingTiers(false);
  }, []);

  /* ── Fetch : Historique ──────────────────────────────────────────── */
  const fetchHistory = useCallback(async () => {
    setIsLoadingEvents(true);
    const result = await getLoyaltyHistory();
    if (result.ok) setEvents(result.data);
    setIsLoadingEvents(false);
  }, []);

  /* ── Chargement initial en parallèle ────────────────────────────── */
  useEffect(() => {
    fetchProfile();
    fetchTiers();
    fetchHistory();
  }, [fetchProfile, fetchTiers, fetchHistory]);

  /* ── Callback de succès après dépense de points ─────────────────── */
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">

        {/* ── En-tête ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border"
              style={{
                background: "rgba(201,150,58,0.08)",
                borderColor: "rgba(201,150,58,0.15)",
              }}
            >
              <Crown
                className="h-4.5 w-4.5 text-amber-500"
                style={{ width: 18, height: 18 }}
                strokeWidth={1.75}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1f241c]">
              Mes points de Fidélité
            </h1>
          </div>
          <p className="text-[14px] text-[#8A9080]">
            Suivez vos points, progressez dans les grades et profitez de vos avantages exclusifs.
          </p>
        </motion.div>

        {/* ── État chargement global ── */}
        {isLoadingProfile ? (
          <div className="flex justify-center py-20">
            <LoadingStyle label="Chargement de votre profil fidélité…" size={16} />
          </div>
        ) : profileError ? (
          /* ── État erreur ── */
          <ErrorState
            title="Impossible de charger le profil"
            message={profileError}
            buttonText="Réessayer"
            onRetry={() => fetchProfile()}
          />
        ) : profile ? (
          /* ── Contenu principal ── */
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

      {/* ── Modale de dépense de points ── */}
      {profile && (
        <RedeemPointsModal
          isOpen={showRedeemModal}
          profile={profile}
          onClose={() => setShowRedeemModal(false)}
          onSuccess={handleRedeemSuccess}
        />
      )}

      {/* ── Toast de notification ── */}
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
