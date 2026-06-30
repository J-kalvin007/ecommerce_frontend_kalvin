




"use client";

import { PromoCodeUseButton } from "./CardFinaleCodePromo";
import type { PromoCodeList } from "@/modeles/promotions";

type PromoCodeOfferCardProps = {
  promo: PromoCodeList;
  variant?: "home" | "page";
  index?: number;
  className?: string;
  layoutMode?: "grid" | "list";
};

export function PromoCodeOfferCard({
  promo,
  variant = "home",
  index = 0,
  className,
  layoutMode = "grid",
}: PromoCodeOfferCardProps) {
  return (
    <PromoCodeUseButton
      promo={promo}
      variant={variant}
      showDescription
      index={index}
      className={className}
      layoutMode={layoutMode}
    />
  );
}