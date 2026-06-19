// "use client";

// import { PromoCodeUseButton } from "@/app/(storefront)/promotions/components/PromoCodeUseButton";


// type PromoCodeOfferCardProps = {
//   promo: PublicPromoCode;
//   variant?: "home" | "page";
//   index?: number;
//   className?: string;
// };

// export function PromoCodeOfferCard({
//   promo,
//   variant = "home",
//   index = 0,
//   className,
// }: PromoCodeOfferCardProps) {
//   return (
//     <PromoCodeUseButton
//       promo={promo}
//       variant={variant}
//       showDescription
//       index={index}
//       className={className}
//     />
//   );
// }









"use client";

import { PromoCodeUseButton } from "./PromoCodeUseButton";
import type { PromoCodeList } from "@/modeles/promotions";

type PromoCodeOfferCardProps = {
  promo: PromoCodeList;
  variant?: "home" | "page";
  index?: number;
  className?: string;
};

export function PromoCodeOfferCard({
  promo,
  variant = "home",
  index = 0,
  className,
}: PromoCodeOfferCardProps) {
  return (
    <PromoCodeUseButton
      promo={promo}
      variant={variant}
      showDescription
      index={index}
      className={className}
    />
  );
}