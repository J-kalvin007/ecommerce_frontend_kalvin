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
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useUIStore } from "@/store/uiStore";
import { mediaUrl } from "@/lib/mediaUrl";
import { getMyFavorites, toggleFavorite } from "@/fonctions_api/notes-favoris.api";
import { getMyRatings } from "@/fonctions_api/notes-favoris.api";
import {
  buildUserRatingsMap,
  type FavoriteProduct,
  type UserRatingsMap,
} from "@/modeles/notes-favoris";

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
                const imageUrl = item.image ? mediaUrl(item.image) || item.image : null;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -120, transition: { duration: 0.25 } }}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center"
                  >
                    {/* Image produit */}
                    <Link
                      onClick={() => useUIStore.getState().setActiveProductId(item.id)}
                      href={`/products/${item.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-alt"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </Link>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <Link
                        onClick={() => useUIStore.getState().setActiveProductId(item.id)}
                        href={`/products/${item.slug}`}
                        className="mt-0.5 block text-sm font-semibold text-foreground hover:text-primary line-clamp-2 transition-colors"
                      >
                        {item.name}
                      </Link>

                      {/* Étoiles de notation personnelle */}
                      <StarRating score={userScore} />

                      {/* Badge stock */}
                      <span
                        className={cn(
                          "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          item.is_in_stock
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {item.is_in_stock ? "En stock" : "Rupture de stock"}
                      </span>
                    </div>

                    {/* Prix */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">
                        {formatCurrency(item.price, "FCFA")}
                      </span>
                      {item.count_favorites > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted">
                          <Heart className="h-3 w-3 fill-primary/40 text-primary/40" />
                          {item.count_favorites}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.is_in_stock}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                          item.is_in_stock
                            ? "bg-primary text-white hover:bg-primary-hover active:scale-95"
                            : "cursor-not-allowed bg-surface-alt text-muted"
                        )}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {item.is_in_stock ? "Ajouter" : "Rupture"}
                      </button>

                      {/* Bouton retrait favori */}
                      <button
                        onClick={() => void handleRemove(item)}
                        disabled={isRemoving}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-error/30 hover:bg-error-light hover:text-error disabled:opacity-50"
                        aria-label={`Retirer ${item.name} des favoris`}
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
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
