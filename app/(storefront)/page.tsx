// /**
//  * Page d'accueil — Hero ultra-premium + sections dynamiques
//  *
//  * Sections :
//  * 1. Hero cinématique avec CTA double
//  * 2. Bande de confiance (stats clés)
//  * 3. Catégories visuelles
//  * 4. Produits tendances / boostés
//  * 5. Bannière promotionnelle
//  * 6. Produits best-sellers
//  * 7. Section avantages / fonctionnalités
//  * 8. Témoignages clients
//  * 9. Newsletter
//  *
//  * @module app/page
//  */

// import type { Metadata } from "next";
// import HeroSection from "@/components/home/HeroSection";
// import AgriShowcaseSection from "@/components/home/AgriShowcaseSection";
// // import TrendingProducts from "@/components/home/TrendingProducts";
// import FermeSolimeSection from "@/components/home/FermeSolimeSection";
// import TrustBand from "@/components/home/TrustBand";
// import FeaturesSection from "@/components/home/FeaturesSection";
// import TestimonialsSection from "@/components/home/TestimonialsSection";

// export const metadata: Metadata = {
//   title: "Atelier du terroir — Épicerie Fine Mondiale | Saveurs du Monde",
//   description:
//     "Découvrez les meilleurs produits alimentaires du monde entier. Épices rares, huiles d'exception, chocolats artisanaux. Livraison mondiale, portefeuille intégré, programme de fidélité.",
// };

// /**
//  * Home — Page d'accueil de la plateforme Atelier du terroir.
//  */
// export default function Home() {

//   return (

//     <div className="page-transition bg-[#fbf7e8]">

//       <HeroSection />

//       <TrustBand />

//       <AgriShowcaseSection />

//       {/* <TrendingProducts /> */}

//       <FermeSolimeSection />

//       <FeaturesSection />

//       <TestimonialsSection />

//     </div>

//   );

// }
































import type { Metadata } from "next";
import AgriShowcaseSection from "@/app/(storefront)/components/AgriShowcaseSection";
import FermeSolimeSection from "@/app/(storefront)/components/FermeSolimeSection";
import FeaturesSection from "@/app/(storefront)/components/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import HomePromotionsSection from "@/app/(storefront)/promotions/components/HomePromotionsSection";
import HomeTrendingProducts from "@/components/home/HomeTrendingProducts";
import TestimonialsSection from "@/app/(storefront)/components/TestimonialsSection";
import TrustBand from "@/app/(storefront)/components/TrustBand";

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
