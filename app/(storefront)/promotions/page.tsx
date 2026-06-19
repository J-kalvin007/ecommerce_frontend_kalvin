/**
 * Promotions — Page des offres et ventes flash
 * @module app/promotions/page
 */

import type { Metadata } from "next";
// import PromotionsClient from "./PromotionsClient";
import PromotionsPage from "./components/PromotionsPage";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Profitez de nos offres exclusives, ventes flash et codes promo. Économisez sur les meilleurs produits alimentaires du monde.",
};

export default function Page() {
  // return <PromotionsClient />;
  return <PromotionsPage />;
}
