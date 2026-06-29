/**
 * @file PromoCodesGrid.tsx
 * @description Grille responsive des codes promo — wrapper de mise en page.
 *
 * Layout :
 *  - 1 colonne  (<sm)
 *  - 2 colonnes (sm)
 *  - 3 colonnes (xl)
 *
 * Chaque cellule a une hauteur egalisee (flex stretch via h-full sur les enfants).
 *
 * @module promotions/PromoCodesGrid
 */

"use client";

import { PromoCodeOfferCard } from "./PromoCodeOfferCard";
import type { PromoCodeList } from "@/modeles/promotions";

/* ─── Types ───────────────────────────────────────────────────────────────── */

type PromoCodesGridProps = {
  promos: PromoCodeList[];
};

/* ─── Composant ───────────────────────────────────────────────────────────── */

export function PromoCodesGrid({ promos }: PromoCodesGridProps) {
  if (promos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {promos.map((promo, index) => (
        <PromoCodeOfferCard
          key={promo.id}
          promo={promo}
          variant="page"
          index={index}
        />
      ))}
    </div>
  );
}
