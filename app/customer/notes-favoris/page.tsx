/**
 * page.tsx — Favoris & Notes Client
 * -----------------------------------------------------------------------------
 * Page principale avec tabulation animée entre :
 *   - Onglet 1 « ❤️ Mes Favoris »  : grille des produits favoris
 *   - Onglet 2 « ⭐ Mes Notes »    : grille des produits notés
 *
 * Architecture :
 *   - Chargement parallèle des favoris et des notes au montage
 *   - Jointure côté client : ratings par product_id pour afficher les scores
 *     sur les cartes de favoris ET les cartes de notes
 *   - Barre de filtres par statut de stock + recherche par nom (favoris)
 *   - Barre de filtre par note (⭐ 1–5) + recherche (notes)
 *   - Actions : toggle favori, re-noter, supprimer note
 *   - Toast notification global
 *
 * @module app/customer/notes-favoris/page
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Inbox,
} from "lucide-react";

import CustomerShell from "@/app/customer/components/CustomerShell";
import { cn } from "@/lib/utils";
import Toast from "@/components/special/Toast";
import LoadingStyle from "@/components/special/loadingStyle";
import ErrorState from "@/components/special/ErrorState";
import EmptyState from "@/components/special/EmptyState";

import {
  getMyFavorites,
  toggleFavorite,
  getMyRatings,
  rateProduct,
  deleteRating,
} from "@/fonctions_api/notes-favoris.api";
import type { FavoriteProduct, MyRating } from "@/modeles/notes-favoris";
import { buildUserRatingsMap } from "@/modeles/notes-favoris";

import FavoriteProductCard from "./components/FavoriteProductCard";
import RatingProductCard from "./components/RatingProductCard";

/* -- Types internes ------------------------------------------------------- */
type ActiveTab = "favorites" | "ratings";
type StockFilter = "all" | "in_stock" | "out_of_stock";

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CustomerNotesFavorisPage() {
  /* -- État : Onglet actif ---------------------------------------------- */
  const [activeTab, setActiveTab] = useState<ActiveTab>("favorites");

  /* -- État : Vue ------------------------------------------------------- */
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  /* -- État : Favoris --------------------------------------------------- */
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  /* -- État : Notes ----------------------------------------------------- */
  const [ratings, setRatings] = useState<MyRating[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);

  /* -- État : Filtres Favoris -------------------------------------------- */
  const [favSearch, setFavSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  /* -- État : Filtres Notes ---------------------------------------------- */
  const [ratingSearch, setRatingSearch] = useState("");
  const [ratingScoreFilter, setRatingScoreFilter] = useState<number | "all">("all");
  const [showAdvancedNotes, setShowAdvancedNotes] = useState(false);

  /* -- État : Toast ----------------------------------------------------- */
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      setToast({ show: true, type, message });
    },
    []
  );

  /* -- Fetch : Favoris --------------------------------------------------- */
  const fetchFavorites = useCallback(async () => {
    setIsLoadingFavorites(true);
    setFavoritesError(null);
    const result = await getMyFavorites();
    if (result.ok) {
      setFavorites(result.data);
    } else {
      setFavoritesError(
        result.error?.message || "Impossible de charger vos favoris."
      );
    }
    setIsLoadingFavorites(false);
  }, []);

  /* -- Fetch : Notes ----------------------------------------------------- */
  const fetchRatings = useCallback(async () => {
    setIsLoadingRatings(true);
    const result = await getMyRatings();
    if (result.ok) setRatings(result.data);
    setIsLoadingRatings(false);
  }, []);

  /* -- Chargement initial parallèle -------------------------------------- */
  useEffect(() => {
    fetchFavorites();
    fetchRatings();
  }, [fetchFavorites, fetchRatings]);

  /* -- Map O(1) des notes de l'utilisateur ----------------------------- */
  const userRatingsMap = useMemo(() => buildUserRatingsMap(ratings), [ratings]);

  /* -- Favoris filtrés --------------------------------------------------- */
  const filteredFavorites = useMemo(() => {
    return favorites.filter((p) => {
      if (stockFilter === "in_stock" && !p.is_in_stock) return false;
      if (stockFilter === "out_of_stock" && p.is_in_stock) return false;
      if (favSearch.trim()) {
        if (!p.name.toLowerCase().includes(favSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [favorites, stockFilter, favSearch]);

  /* -- Produits notés (jointure favoris × notes) ------------------------ */
  const ratedProducts = useMemo(() => {
    // On ne peut afficher que les produits dont on a l'objet complet (via favoris)
    // Pour les produits notés qui ne sont plus en favoris, on n'a pas les métadonnées.
    // On enrichit les favoris avec les notes présentes.
    return favorites
      .filter((p) => userRatingsMap.has(p.id))
      .filter((p) => {
        if (ratingScoreFilter !== "all" && userRatingsMap.get(p.id) !== ratingScoreFilter) return false;
        if (ratingSearch.trim()) {
          if (!p.name.toLowerCase().includes(ratingSearch.toLowerCase())) return false;
        }
        return true;
      });
  }, [favorites, userRatingsMap, ratingScoreFilter, ratingSearch]);

  /* -- Action : Toggle Favori -------------------------------------------- */
  const handleToggleFavorite = useCallback(
    async (productId: string) => {
      const result = await toggleFavorite(productId);
      if (result.ok) {
        if (!result.data.favorited) {
          setFavorites((prev) => prev.filter((p) => p.id !== productId));
          showToast("info", "Produit retiré de vos favoris.");
        }
      } else {
        showToast("error", "Impossible de modifier le favori.");
      }
    },
    [showToast]
  );

  /* -- Action : Noter un produit ----------------------------------------- */
  const handleRate = useCallback(
    async (productId: string, score: number) => {
      const result = await rateProduct(productId, score);
      if (result.ok) {
        setRatings((prev) => {
          const exists = prev.find((r) => r.product_id === productId);
          if (exists) {
            return prev.map((r) =>
              r.product_id === productId ? { ...r, score } : r
            );
          }
          return [...prev, { product_id: productId, score }];
        });
        showToast("success", `Note de ${score}/5 enregistrée !`);
      } else {
        showToast("error", "Impossible d'enregistrer la note.");
      }
    },
    [showToast]
  );

  /* -- Action : Supprimer une note --------------------------------------- */
  const handleDeleteRating = useCallback(
    async (productId: string) => {
      const rating = ratings.find((r) => r.product_id === productId);
      if (!rating) return;
      // La suppression nécessite l'UUID de la note — comme le backend renvoie
      // { product_id, score }, nous utilisons product_id comme fallback.
      const result = await deleteRating(productId);
      if (result.ok) {
        setRatings((prev) => prev.filter((r) => r.product_id !== productId));
        showToast("info", "Note supprimée avec succès.");
      } else {
        showToast("error", "Impossible de supprimer la note.");
      }
    },
    [ratings, showToast]
  );

  /* ═══════════════════════════════════════════════════════════════════════
     Rendu
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <CustomerShell activeSection="favorites">
      <div className="mx-auto max-w-8xl px-20 py-8 sm:px-6 lg:px-20 space-y-8">

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
              <Heart className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Favoris & Notes
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Retrouvez vos produits préférés et gérez vos évaluations.
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

        {/* -- Tabulation -- */}
        <div className="relative flex rounded-2xl border border-[#E8E3D8] bg-[#F7F5F0] p-1">
          {/* Indicateur glissant */}
          <motion.div
            layoutId="tab-indicator"
            className="absolute rounded-xl bg-white shadow-sm"
            style={{
              top: 4,
              bottom: 4,
              left: activeTab === "favorites" ? 4 : "50%",
              right: activeTab === "favorites" ? "50%" : 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />

          {/* Onglet Favoris */}
          <button
            onClick={() => setActiveTab("favorites")}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[15px] font-bold transition-colors cursor-pointer ${activeTab === "favorites" ? "text-[#1f241c]" : "text-[#8A9080] hover:text-[#4A5540]"
              }`}
          >
            <Heart
              className="h-4 w-4"
              style={{
                fill: activeTab === "favorites" ? "#ef4444" : "none",
                color: activeTab === "favorites" ? "#ef4444" : "currentColor",
              }}
              strokeWidth={2}
            />
            Mes Favoris
            {favorites.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[12px] font-black ${activeTab === "favorites"
                  ? "bg-red-100 text-red-600"
                  : "bg-[#E8E3D8] text-[#8A9080]"
                  }`}
              >
                {favorites.length}
              </span>
            )}
          </button>

          {/* Onglet Notes */}
          <button
            onClick={() => setActiveTab("ratings")}
            className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[15px] font-bold transition-colors cursor-pointer ${activeTab === "ratings" ? "text-[#1f241c]" : "text-[#8A9080] hover:text-[#4A5540]"
              }`}
          >
            <Star
              className="h-4 w-4"
              style={{
                fill: activeTab === "ratings" ? "#f59e0b" : "none",
                color: activeTab === "ratings" ? "#f59e0b" : "currentColor",
              }}
              strokeWidth={2}
            />
            Mes Notes
            {ratings.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[12px] font-black ${activeTab === "ratings"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-[#E8E3D8] text-[#8A9080]"
                  }`}
              >
                {ratings.length}
              </span>
            )}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            CONTENU DES ONGLETS
            ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">

          {/* -- ONGLET FAVORIS -- */}
          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {isLoadingFavorites ? (
                <div className="flex justify-center py-20">
                  <LoadingStyle label="Chargement de vos favoris…" size={14} />
                </div>
              ) : favoritesError ? (
                <ErrorState
                  title="Erreur de chargement"
                  message={favoritesError}
                  buttonText="Réessayer"
                  onRetry={fetchFavorites}
                />
              ) : (
                <>
                  {/* Barre de contrôle */}
                  {favorites.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      {/* Filtres stock */}
                      <div className="flex gap-1.5">
                        {(
                          [
                            { value: "all", label: "Tous" },
                            { value: "in_stock", label: "En stock" },
                            { value: "out_of_stock", label: "Épuisés" },
                          ] as Array<{ value: StockFilter; label: string }>
                        ).map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setStockFilter(f.value)}
                            className={`rounded-xl px-3 py-1.5 text-[14px] font-semibold transition-all cursor-pointer ${stockFilter === f.value
                              ? "bg-[#1f4d3f] text-white shadow-sm"
                              : "bg-[#F7F5F0] text-[#8A9080] hover:bg-[#EEE9E0] hover:text-[#1f241c]"
                              }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {/* Recherche et Toggle Vue */}
                      <div className="flex ml-auto items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8A9080]" />
                          <input
                            type="text"
                            placeholder="Rechercher un produit…"
                            value={favSearch}
                            onChange={(e) => setFavSearch(e.target.value)}
                            className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2 pl-9 pr-3 text-[14px] text-[#1f241c] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/15 placeholder:text-[#8A9080]/60"
                          />
                        </div>
                        <div className="flex items-center rounded-xl bg-[#F7F5F0] border border-[#E8E3D8] p-1 shrink-0">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white text-[#1f4d3f] shadow-sm" : "text-[#8A9080] hover:text-[#1f241c]"}`}
                          >
                            <Grid className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-white text-[#1f4d3f] shadow-sm" : "text-[#8A9080] hover:text-[#1f241c]"}`}
                          >
                            <List className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grille Favoris */}
                  {favorites.length === 0 ? (
                    <EmptyState
                      icon={Heart}
                      title="Aucun favori pour l'instant"
                      description="Ajoutez des produits à vos favoris pour les retrouver ici. Explorez la boutique et cliquez sur le cœur ❤️ pour sauvegarder vos coups de cœur."
                      actionText="Explorer la boutique"
                      onAction={() => window.location.href = "/"}
                    />
                  ) : filteredFavorites.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="Aucun résultat"
                      description="Aucun favori ne correspond à vos critères de recherche ou de filtre. Essayez de modifier vos filtres."
                    />
                  ) : (
                    <motion.div
                      className={cn(
                        viewMode === "grid"
                          ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                          : "flex flex-col gap-4"
                      )}
                      layout
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredFavorites.map((product, idx) => (
                          <FavoriteProductCard
                            key={product.id}
                            product={product}
                            index={idx}
                            onToggle={handleToggleFavorite}
                            viewMode={viewMode}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* -- ONGLET NOTES -- */}
          {activeTab === "ratings" && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {isLoadingRatings || isLoadingFavorites ? (
                <div className="flex justify-center py-20">
                  <LoadingStyle label="Chargement de vos notes…" size={14} />
                </div>
              ) : (
                <>
                  {/* Barre de contrôle */}
                  {ratings.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {/* Filtres par note */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => setRatingScoreFilter("all")}
                            className={`rounded-xl px-3 py-1.5 text-[14px] font-semibold transition-all cursor-pointer ${ratingScoreFilter === "all"
                              ? "bg-amber-400 text-white shadow-sm"
                              : "bg-[#F7F5F0] text-[#8A9080] hover:bg-amber-50"
                              }`}
                          >
                            Tout
                          </button>
                          {[5, 4, 3, 2, 1].map((score) => (
                            <button
                              key={score}
                              onClick={() =>
                                setRatingScoreFilter(
                                  ratingScoreFilter === score ? "all" : score
                                )
                              }
                              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[14px] font-semibold transition-all cursor-pointer ${ratingScoreFilter === score
                                ? "bg-amber-400 text-white shadow-sm"
                                : "bg-[#F7F5F0] text-[#8A9080] hover:bg-amber-50"
                                }`}
                            >
                              <Star
                                className="h-3 w-3"
                                style={{
                                  fill:
                                    ratingScoreFilter === score
                                      ? "white"
                                      : "#f59e0b",
                                  color:
                                    ratingScoreFilter === score
                                      ? "white"
                                      : "#f59e0b",
                                }}
                              />
                              {score}
                            </button>
                          ))}
                        </div>

                        {/* Bouton filtres avancés */}
                        <button
                          onClick={() => setShowAdvancedNotes(!showAdvancedNotes)}
                          className={`ml-auto flex items-center gap-1.5 rounded-xl border p-2 transition-colors cursor-pointer ${showAdvancedNotes
                            ? "border-amber-400 bg-amber-400 text-white"
                            : "border-[#E8E3D8] bg-white text-[#1f241c] hover:bg-[#F7F5F0]"
                            }`}
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                        </button>

                        {/* Toggle Vue */}
                        <div className="flex items-center rounded-xl bg-[#F7F5F0] border border-[#E8E3D8] p-1 shrink-0 ml-1">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white text-amber-500 shadow-sm" : "text-[#8A9080] hover:text-[#1f241c]"}`}
                          >
                            <Grid className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-white text-amber-500 shadow-sm" : "text-[#8A9080] hover:text-[#1f241c]"}`}
                          >
                            <List className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Filtres avancés : Recherche */}
                      <AnimatePresence>
                        {showAdvancedNotes && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] p-3">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8A9080]" />
                                <input
                                  type="text"
                                  placeholder="Rechercher un produit noté…"
                                  value={ratingSearch}
                                  onChange={(e) => setRatingSearch(e.target.value)}
                                  className="w-full rounded-xl border border-[#E8E3D8] bg-white py-2 pl-9 pr-3 text-[14px] text-[#1f241c] outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/15 placeholder:text-[#8A9080]/60"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Grille Notes */}
                  {ratings.length === 0 ? (
                    <EmptyState
                      icon={Star}
                      title="Vous n'avez noté aucun produit"
                      description="Notez vos achats pour aider la communauté et retrouver facilement vos expériences. Votre avis compte !"
                      actionText="Explorer la boutique"
                      onAction={() => window.location.href = "/"}
                    />
                  ) : ratedProducts.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="Aucun résultat"
                      description="Aucun produit noté ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                    />
                  ) : (
                    <motion.div
                      className={cn(
                        viewMode === "grid"
                          ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                          : "flex flex-col gap-4"
                      )}
                      layout
                    >
                      <AnimatePresence mode="popLayout">
                        {ratedProducts.map((product, idx) => (
                          <RatingProductCard
                            key={product.id}
                            product={product}
                            userScore={userRatingsMap.get(product.id) ?? 0}
                            index={idx}
                            onRate={handleRate}
                            onDelete={handleDeleteRating}
                            viewMode={viewMode}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* -- Toast global -- */}
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
