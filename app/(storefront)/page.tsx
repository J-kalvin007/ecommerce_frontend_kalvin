



import type { Metadata } from "next";
import AgriShowcaseSection from "@/app/(storefront)/components/AgriShowcaseSection";
import FermeSolimeSection from "@/app/(storefront)/components/FermeSolimeSection";
import FeaturesSection from "@/app/(storefront)/components/FeaturesSection";
import TestimonialsSection from "@/app/(storefront)/components/TestimonialsSection";
import TrustBand from "@/app/(storefront)/components/BandeCodePromo";
import HomeTrendingProducts from "./components/ProduitsFavoris";
import HomePromotionsSection from "./components/PubSection";
import HeroSection from "./components/HeroSection";

export const metadata: Metadata = {
  title: "Atelier du Terroir — Produits agricoles frais et authentiques",
  description:
    "Decouvrez les meilleurs produits du terroir : fruits frais, viande blanche, epices et produits transformes. Livraison locale et internationale, wallet integre, programme de fidelite.",
};

export default function HomePage() {
  return (
    <>

      <main className="page-transition bg-[#fbf7e8] text-[#1f241c]">
        <HeroSection />
        <TrustBand />
        <HomePromotionsSection />
        <AgriShowcaseSection />
        <HomeTrendingProducts />
        <FermeSolimeSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>

    </>
  );
}
