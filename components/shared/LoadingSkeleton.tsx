/**
 * LoadingSkeleton — Composants de chargement réutilisables
 *
 * Fournit des skeletons élégants pour chaque type de contenu :
 * - ProductCardSkeleton
 * - TextSkeleton
 * - ImageSkeleton
 * - PageSkeleton
 *
 * @module components/shared/LoadingSkeleton
 */

import { cn } from "@/lib/utils";

/** Props communes pour les skeletons */
interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton de base — Rectangle animé shimmer.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton pour une carte produit.
 */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
      {/* Image */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Contenu */}
      <div className="space-y-3 p-4">
        {/* Catégorie */}
        <Skeleton className="h-3 w-16" />
        {/* Titre */}
        <Skeleton className="h-5 w-3/4" />
        {/* Prix */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grille de skeletons produit.
 *
 * @param count - Nombre de skeletons à afficher
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour une page complète (hero + grille).
 */
export function PageSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {/* Hero */}
      <Skeleton className="h-64 w-full rounded-2xl md:h-96" />
      {/* Section titre */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Grille */}
      <ProductGridSkeleton count={4} />
    </div>
  );
}

/**
 * Skeleton pour une stat card (dashboard).
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
