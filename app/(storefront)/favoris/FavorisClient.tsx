/**
 * FavorisClient — Page de liste de souhaits connectée au backend Django DRF
 *
 * Workflow :
 *  - Charge la liste des favoris via GET /api/v1/catalog/products/my-favorites/
 *  - Charge les notes de l'utilisateur via GET /api/v1/catalog/notes-products/mes-notes/
 *  - Affiche les étoiles pleines/vides selon la note perso de l'utilisateur (sur 5)
 *  - Permet de retirer un produit des favoris via POST /api/v1/catalog/favorites-toggle/
 *
 * @module app/favoris/FavorisClient
 */

"use client";

import { useEffect, useState, useCallback } from "react";
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

/* ─────────────────────────────────────────────────────────────────────────────
   Sous-composant : étoiles de notation
   ─────────────────────────────────────────────────────────────────────────── */

function StarRating({ score }: { score: number | null }) {
  return (
    <div className="mt-1 flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            score !== null && s <= score
              ? "fill-amber-400 text-amber-400"
              : "fill-border text-border"
          )}
        />
      ))}
      {score !== null ? (
        <span className="ml-1.5 text-xs font-medium text-muted">
          Ma note : {score}/5
        </span>
      ) : (
        <span className="ml-1.5 text-xs text-muted/60 italic">Non noté</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sous-composant : squelette de chargement
   ─────────────────────────────────────────────────────────────────────────── */

function FavorisSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center animate-pulse"
        >
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
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Composant principal
   ─────────────────────────────────────────────────────────────────────────── */

export default function FavorisClient() {
  /* --- État ---------------------------------------------------------------- */
  const [favoris, setFavoris] = useState<FavoriteProduct[]>([]);
  const [ratingsMap, setRatingsMap] = useState<UserRatingsMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FavoriteProduct | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  /* --- Chargement initial -------------------------------------------------- */
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

  /* --- Suppression d'un favori --------------------------------------------- */
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

  /* --- Ajout au panier ----------------------------------------------------- */
  const handleAddToCart = (item: FavoriteProduct) => {
    addItem({
      productId: item.id,
      variantId: null,
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
  };

  /* --- Rendu --------------------------------------------------------------- */
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
      {/* En-tête de section */}
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold lg:text-3xl">
              Ma liste de souhaits
            </h1>
          </div>
          {!loading && !error && (
            <p className="mt-2 text-muted">
              {favoris.length} produit{favoris.length !== 1 ? "s" : ""} sauvegardé
              {favoris.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        {/* Chargement */}
        {loading && <FavorisSkeleton />}

        {/* Erreur */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/40 dark:bg-red-900/10"
          >
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                Erreur de chargement
              </p>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
                {error}
              </p>
            </div>
            <button
              onClick={() => void loadData()}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          </motion.div>
        )}

        {/* Liste vide */}
        {!loading && !error && favoris.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-20 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-alt">
              <Heart className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-lg font-semibold">Votre liste est vide</p>
              <p className="mt-1 text-sm text-muted">
                Parcourez notre boutique et ajoutez vos coups de cœur
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Découvrir la boutique <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {/* Liste des favoris */}
        {!loading && !error && favoris.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {favoris.map((item) => {
                const userScore = ratingsMap.get(item.id) ?? null;
                const isRemoving = removingId === item.id;
                // BUG FIX: On ne doit pas appeler mediaUrl(imageUrl) deux fois.
                const imageUrl = mediaUrl(item.image);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={cn(
                      "group relative flex flex-col sm:flex-row sm:items-center overflow-hidden",
                      "rounded-2xl border border-[#e7dfd2] bg-white",
                      "transition-all duration-300",
                      "hover:border-[#1f4d3f]/20 hover:shadow-[0_8px_32px_rgba(31,77,63,0.10)]",
                      "gap-4 p-4 sm:p-5"
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
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      aria-hidden
                    />

                    {/* Image produit */}
                    <Link
                      onClick={() => useUIStore.getState().setActiveProductId(item.id)}
                      href={`/products/${item.slug}`}
                      className="relative aspect-square w-24 shrink-0 overflow-hidden bg-[#f3ede2] rounded-xl sm:w-32"
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
                      
                      {/* Badges image */}
                      {!item.is_in_stock && (
                        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                          <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                            Rupture
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Informations */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <Link
                        onClick={() => useUIStore.getState().setActiveProductId(item.id)}
                        href={`/products/${item.slug}`}
                        className="mt-0.5 block text-base font-bold leading-snug text-[#1f241c] transition-colors duration-200 group-hover:text-[#1f4d3f] line-clamp-2"
                      >
                        {item.name}
                      </Link>

                      {/* Étoiles de notation personnelle */}
                      <StarRating score={userScore} />

                      {/* Badge stock */}
                      <span
                        className={cn(
                          "mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-sm",
                          item.is_in_stock
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {item.is_in_stock ? "En stock" : "Rupture de stock"}
                      </span>
                    </div>

                    {/* Actions & Prix */}
                    <div className="mt-3 flex flex-col sm:mt-0 sm:w-48 sm:items-end sm:text-right gap-3">
                      {/* Prix */}
                      <div className="flex flex-col sm:items-end">
                        <span className="text-xl font-black tracking-tight text-[#1f4d3f]">
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
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Retirer ${item.name} des favoris`}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </motion.button>
                        
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.is_in_stock}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition-all",
                            item.is_in_stock
                              ? "bg-[#1f4d3f] text-white hover:bg-[#17392f] hover:shadow-lg active:scale-95"
                              : "cursor-not-allowed bg-surface-alt text-muted"
                          )}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          {item.is_in_stock ? "Ajouter" : "Rupture"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
