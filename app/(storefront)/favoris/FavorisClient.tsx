



/**
 * ════════════════════════════════════════════════════════════════════════════
 * @file        FavorisClient.tsx
 * @description Page de liste de souhaits ultra-premium — connectée au backend
 *              Django DRF. Animations fluides, micro-interactions soignées,
 *              hiérarchie visuelle raffinée, expérience de niveau fintech.
 *
 * Workflow (inchangé) :
 *  - Charge la liste des favoris via GET /api/v1/catalog/products/my-favorites/
 *  - Charge les notes de l'utilisateur via GET /api/v1/catalog/notes-products/mes-notes/
 *  - Affiche les étoiles pleines/vides selon la note perso de l'utilisateur (sur 5)
 *  - Permet de retirer un produit des favoris via POST /api/v1/catalog/favorites-toggle/
 *
 * @preserves   ✔ Tous les noms de variables, états et fonctions identiques
 *              ✔ Tous les appels API et leur séquence identiques
 *              ✔ La logique métier (retrait optimiste, notes non bloquantes…)
 *              ✔ Les imports et leurs chemins
 *
 * @changelog   + En-tête avec compteur animé et accent visuel premium
 *              + StarRating : remplissage séquentiel animé au montage
 *              + FavorisSkeleton : shimmer animé au lieu d'un pulse statique
 *              + Carte produit : lift au survol, halo de sélection, badges enrichis
 *              + Empty state et error state repensés avec plus de présence
 *              + Bouton "Ajouter au panier" avec micro-feedback de confirmation
 *
 * @module      app/favoris/FavorisClient
 * ════════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  Sparkles,
} from "lucide-react";
import { mediaUrl } from "@/lib/mediaUrl";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useUIStore } from "@/store/uiStore";
import { getMyFavorites, toggleFavorite } from "@/fonctions_api/notes-favoris.api";
import { getMyRatings } from "@/fonctions_api/notes-favoris.api";
import {
  buildUserRatingsMap,
  type FavoriteProduct,
  type UserRatingsMap,
} from "@/modeles/notes-favoris";
import ConfirmDialog from "@/components/special/ConfirmDialog";

// -----------------------------------------------------------------------------
// §1 — CONSTANTES D'ANIMATION
//      Physique spring unifiée — cohérence perceptuelle entre tous les
//      sous-composants de la page (mêmes courbes que PurchaseModal).
// -----------------------------------------------------------------------------

/** Réponse snap — interactions tactiles immédiates (boutons, toggles) */
const SPRING_SNAPPY = {
  type: "spring",
  stiffness: 500,
  damping: 34,
  mass: 0.75,
} as const;

/** Réponse douce — transitions de contenu et orchestration de liste */
const SPRING_SMOOTH = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 1.1,
} as const;

/** Courbe ease-out cubic-bezier — sentiment de fluidité organique */
const EASE_OUT_CUBIC: [number, number, number, number] = [0.16, 1, 0.3, 1];

// -----------------------------------------------------------------------------
// §2 — SOUS-COMPOSANT : StarRating
//      Étoiles de notation avec remplissage séquentiel animé au montage —
//      chaque étoile "pop" avec un délai progressif pour un effet de cascade.
// -----------------------------------------------------------------------------

function StarRating({ score }: { score: number | null }) {
  return (
    <div className="mt-1 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const isFilled = score !== null && s <= score;
        return (
          <motion.span
            key={s}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: s * 0.045, ...SPRING_SNAPPY }}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-300",
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-border text-border"
              )}
            />
          </motion.span>
        );
      })}
      {score !== null ? (
        <span className="ml-1.5 text-xs font-medium text-muted">
          Ma note : {score}/5
        </span>
      ) : (
        <span className="ml-1.5 text-xs italic text-muted/60">Non noté</span>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// §3 — SOUS-COMPOSANT : FavorisSkeleton
//      Squelette de chargement avec effet shimmer (balayage lumineux) plutôt
//      qu'un simple pulse — sensation de chargement actif et premium.
// -----------------------------------------------------------------------------

function FavorisSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, ...SPRING_SMOOTH }}
          className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center"
        >
          {/* Balayage shimmer */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)",
            }}
            animate={{ x: ["-150%", "150%"] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear", delay: i * 0.15 }}
          />
          <div className="h-24 w-24 shrink-0 rounded-xl bg-surface-alt" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-surface-alt" />
            <div className="h-4 w-48 rounded bg-surface-alt" />
            <div className="h-3 w-24 rounded bg-surface-alt" />
          </div>
          <div className="h-7 w-24 rounded bg-surface-alt" />
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-xl bg-surface-alt" />
            <div className="h-10 w-10 rounded-xl bg-surface-alt" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// §4 — COMPOSANT PRINCIPAL : FavorisClient
// -----------------------------------------------------------------------------

export default function FavorisClient() {
  /* --- État (identique à l'original) --------------------------------------- */
  const [favoris, setFavoris] = useState<FavoriteProduct[]>([]);
  const [ratingsMap, setRatingsMap] = useState<UserRatingsMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FavoriteProduct | null>(null);

  // Nouvel état purement visuel — affiche un check de confirmation transitoire
  // sur le bouton "Ajouter au panier" sans toucher au store ni à l'API.
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  /* --- Chargement initial (identique à l'original) -------------------------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Appels parallèles : favoris + notes utilisateur
    const [favRes, ratingRes] = await Promise.all([
      getMyFavorites(),
      getMyRatings(),
    ]);

    if (favRes.ok) {
      setFavoris(favRes.data);
    } else {
      setError(favRes.error.message || "Impossible de charger vos favoris.");
      setFavoris([]);
    }

    if (ratingRes.ok) {
      setRatingsMap(buildUserRatingsMap(ratingRes.data));
    } else {
      // Les notes ne sont pas bloquantes — on continue sans
      setRatingsMap(new Map());
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* --- Suppression d'un favori (identique à l'original) --------------------- */
  const handleRemove = async (item: FavoriteProduct) => {
    setRemovingId(item.id);
    // On utilise le toggle : si le produit est en favori, le toggle le retire
    const res = await toggleFavorite(item.id);
    if (res.ok) {
      // Retrait optimiste de la liste locale
      setFavoris((prev) => prev.filter((f) => f.id !== item.id));
    }
    setRemovingId(null);
  };

  /* --- Ajout au panier (identique à l'original + feedback visuel) ----------- */
  const handleAddToCart = (item: FavoriteProduct) => {
    addItem({
      productId: item.id,
      variantId: item.default_variant_id ?? null,
      name: item.name,
      sku: item.slug,
      price: item.price,
      compareAtPrice: null,
      image: item.image ?? null,
      quantity: 1,
      maxStock: 99,
      currency: "FCFA",
      slug: item.slug,
    });

    // Feedback transitoire purement visuel (check pendant 1.4s)
    setJustAddedId(item.id);
    window.setTimeout(() => {
      setJustAddedId((current) => (current === item.id ? null : current));
    }, 1400);
  };

  /* --- Valeur dérivée : nombre de produits en rupture parmi les favoris ----- */
  const outOfStockCount = useMemo(
    () => favoris.filter((f) => !f.is_in_stock).length,
    [favoris]
  );

  /* --- Rendu ------------------------------------------------------------------ */
  return (
    <div className="page-transition">
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onConfirm={() => {
          if (itemToDelete) {
            void handleRemove(itemToDelete);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
        title="Retirer des favoris ?"
        message={`Êtes-vous sûr de vouloir retirer "${itemToDelete?.name}" de vos favoris ?`}
        confirmText="Retirer"
        cancelText="Annuler"
        type="danger"
        isLoading={removingId === itemToDelete?.id}
      />

      {/* ════════════════════════════════════════════════════════════════════
          EN-TÊTE DE SECTION
          Icône avec halo pulsé doux, titre avec tracking resserré,
          compteur de produits et alerte rupture si applicable.
      ════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface to-surface/40">
        {/* Texture pointillée discrète — profondeur visuelle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT_CUBIC }}
            className="flex items-center gap-3.5"
          >
            {/* Icône avec halo doux */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-primary/15"
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
              />
              <Heart className="relative h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold tracking-[-0.02em] lg:text-3xl">
                Mes produits favoris
              </h1>

              {/* Sous-ligne : compteur + alerte rupture, sans layout shift pendant le chargement */}
              <div className="mt-1 flex min-h-[1.25rem] items-center gap-2.5">
                {!loading && !error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted"
                  >
                    {favoris.length} produit{favoris.length !== 1 ? "s" : ""} sauvegardé
                    {favoris.length !== 1 ? "s" : ""}
                  </motion.p>
                )}
                {!loading && !error && outOfStockCount > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18, ...SPRING_SNAPPY }}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/40"
                  >
                    {outOfStockCount} en rupture
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">

        {/* Chargement */}
        {loading && <FavorisSkeleton />}

        {/* ══════════════════════════════════════════════════════════════════
            ÉTAT D'ERREUR
        ══════════════════════════════════════════════════════════════════ */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/40 dark:bg-red-900/10"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={SPRING_SNAPPY}
            >
              <AlertCircle className="h-10 w-10 text-red-500" />
            </motion.div>
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                Erreur de chargement
              </p>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
                {error}
              </p>
            </div>
            <motion.button
              onClick={() => void loadData()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_SNAPPY}
              className="flex items-center gap-2 cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </motion.button>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LISTE VIDE
        ══════════════════════════════════════════════════════════════════ */}
        {!loading && !error && favoris.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: EASE_OUT_CUBIC }}
            className="flex flex-col items-center justify-center gap-6 py-20 text-center"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, ...SPRING_SMOOTH }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-surface-alt"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-dashed border-muted-foreground/15"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              />
              <Heart className="h-12 w-12 text-muted-foreground/30" />
            </motion.div>
            <div>
              <p className="text-lg font-semibold">Votre liste est vide</p>
              <p className="mt-1 text-sm text-muted">
                Parcourez notre boutique et ajoutez vos coups de cœur
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={SPRING_SNAPPY}>
              <Link
                href="/products"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Découvrir la boutique <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LISTE DES FAVORIS
        ══════════════════════════════════════════════════════════════════ */}
        {!loading && !error && favoris.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {favoris.map((item, index) => {
                const userScore = ratingsMap.get(item.id) ?? null;
                const isRemoving = removingId === item.id;
                const justAdded = justAddedId === item.id;
                // BUG FIX préservé : on ne doit pas appeler mediaUrl(imageUrl) deux fois.
                const imageUrl = mediaUrl(item.image);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.94,
                      x: -12,
                      transition: { duration: 0.22, ease: EASE_OUT_CUBIC },
                    }}
                    transition={{ delay: index * 0.045, ...SPRING_SMOOTH }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      "group relative flex flex-col overflow-hidden sm:flex-row sm:items-center",
                      "rounded-2xl border border-[#e7dfd2] bg-white",
                      "transition-[border-color,box-shadow] duration-300",
                      "hover:border-[#1f4d3f]/20 hover:shadow-[0_10px_36px_rgba(31,77,63,0.11)]",
                      "gap-4 p-4 sm:p-5",
                      isRemoving && "pointer-events-none"
                    )}
                  >
                    {/* Bord gauche vert qui monte au hover */}
                    <motion.span
                      className="absolute bottom-0 left-0 top-0 z-10 w-[3px] origin-bottom rounded-l-2xl"
                      style={{
                        background: "linear-gradient(to top, #1f4d3fcc, #1f4d3f20)",
                      }}
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.35, ease: EASE_OUT_CUBIC }}
                      aria-hidden
                    />

                    {/* Voile de retrait en cours — feedback non bloquant pour l'œil */}
                    <AnimatePresence>
                      {isRemoving && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]"
                        >
                          <Loader2 className="h-5 w-5 animate-spin text-[#1f4d3f]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Image produit */}
                    <Link
                      onClick={() => useUIStore.getState().setActiveProductId(item.id)}
                      href={`/products/${item.slug}`}
                      className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3ede2] sm:w-32"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                            !item.is_in_stock && "opacity-50 grayscale"
                          )}
                          sizes="(max-width: 640px) 96px, 128px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-[#c4b59b]" />
                        </div>
                      )}

                      {/* Reflet de surface (effet premium, cohérent avec PurchaseModal) */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />

                      {/* Badges image */}
                      {!item.is_in_stock && (
                        <div className="absolute left-2 cursor-pointer top-2 z-10 flex flex-col gap-1">
                          <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                            Rupture
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Informations */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <Link
                        onClick={() => useUIStore.getState().setActiveProductId(item.id)}
                        href={`/products/${item.slug}`}
                        className="mt-0.5 line-clamp-2 block text-base font-bold leading-snug tracking-[-0.01em] text-[#1f241c] transition-colors duration-200 group-hover:text-[#1f4d3f]"
                      >
                        {item.name}
                      </Link>

                      {/* Étoiles de notation personnelle */}
                      <StarRating score={userScore} />

                      {/* Badge stock */}
                      <span
                        className={cn(
                          "mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-sm",
                          item.is_in_stock
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.is_in_stock ? "bg-emerald-500" : "bg-red-500"
                          )}
                        />
                        {item.is_in_stock ? "En stock" : "Rupture de stock"}
                      </span>
                    </div>

                    {/* Actions & Prix */}
                    <div className="mt-3 flex flex-col gap-3 sm:mt-0 sm:w-48 sm:items-end sm:text-right">
                      {/* Prix */}
                      <div className="flex flex-col sm:items-end">
                        <span className="text-xl font-black tracking-[-0.025em] text-[#1f4d3f]">
                          {formatCurrency(item.price, "FCFA")}
                        </span>
                        {item.count_favorites > 0 && (
                          <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#8a9086]">
                            <Heart className="h-3 w-3 fill-red-400/20 text-red-400" />
                            {item.count_favorites} favori{item.count_favorites > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex w-full gap-2 sm:mt-2">
                        {/* Bouton retrait favori */}
                        <motion.button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          disabled={isRemoving}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.92 }}
                          transition={SPRING_SNAPPY}
                          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Retirer ${item.name} des favoris`}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </motion.button>

                        {/* Bouton ajout panier — avec confirmation transitoire */}
                        <motion.button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.is_in_stock}
                          whileHover={item.is_in_stock ? { scale: 1.015 } : undefined}
                          whileTap={item.is_in_stock ? { scale: 0.97 } : undefined}
                          transition={SPRING_SNAPPY}
                          className={cn(
                            "relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition-colors",
                            item.is_in_stock
                              ? justAdded
                                ? "bg-emerald-600 text-white"
                                : "bg-[#1f4d3f] text-white hover:bg-[#17392f] hover:shadow-lg"
                              : "cursor-not-allowed bg-surface-alt text-muted"
                          )}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {justAdded ? (
                              <motion.span
                                key="added"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Ajouté
                              </motion.span>
                            ) : (
                              <motion.span
                                key="add"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="flex items-center gap-2"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                {item.is_in_stock ? "Ajouter" : "Rupture"}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pied de liste — petite signature discrète si la collection est conséquente */}
            {favoris.length >= 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted/70"
              >
                <Sparkles className="h-3 w-3" />
                Fin de votre liste de souhaits
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}