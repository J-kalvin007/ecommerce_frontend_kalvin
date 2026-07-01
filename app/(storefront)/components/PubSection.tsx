





/**
 * @file PubSection.tsx  (HomePromotionsSection)
 * @description Section promotions de la page d'accueil — édition ultra-premium.
 *
 * Cohérence design system avec PromoOfferCard & PromoProductsCarousel :
 *  - Palette identique : Forest ink #0D2E1E · Jade #2F9E6F · Ember #E8711A
 *  - Keyframe `shimmerBeam` : même famille que shimmerSweep des cartes produits
 *  - Spring Framer Motion : stiffness/damping alignés avec le carousel
 *  - Glassmorphism : backdrop-blur + border rgba identiques aux flèches nav
 *
 * Architecture :
 *  ┌- HomePromotionsSection   (orchestrateur : fetch, état, rendu)
 *  │   ├- SectionHeader       (eyebrow + titre + CTA "Toutes les offres")
 *  │   ├- LoadingSkeleton     (squelette forest pulsé, pas de gris générique)
 *  │   ├- PromoBanner         (bannière immersive avec beam animé)
 *  │   └- PromoProductsCarousel (déjà redesigné)
 *
 * Patterns :
 *  - Promise.allSettled : resilience si une API échoue
 *  - Cleanup flag `active` : évite les setState sur composant démonté
 *  - useCallback sur mapSaleToCard pour lisibilité (inline dans le module)
 *  - Séparation stricte UI / logique fetch / types
 *  - Accessibilité : landmarks, aria-busy, aria-label, rôles sémantiques
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Zap, Star, CircleCheckBig } from "lucide-react";
import { PromoProductsCarousel } from "@/app/(storefront)/promotions/components/PromoProductsCarousel";
import {
  getActiveSales,
  getActiveRecommendations,
} from "@/fonctions_api/promotions.api";
import type { Banner, Soldes } from "@/modeles/promotions";
import { mediaUrl } from "@/lib/mediaUrl";

/* --- Types publics --------------------------------------------------------- */

/**
 * Shape normalisée d'un produit en promotion — utilisée par PromoOfferCard
 * et PromoProductsCarousel. À déplacer dans `/types/promotions.ts` si partagée.
 */
export interface PromoProductCard {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: string;
  comparePrice: string | null;
  discountPercent: number;
  image: string | null;
  reviewCount: number;
  rating: number;
}

/* --- Constantes & keyframes ------------------------------------------------ */

/**
 * Keyframe `shimmerBeam` : même famille que shimmerSweep des cartes produits.
 * Rayon diagonal qui traverse la bannière — signature premium cohérente.
 */
const BANNER_KEYFRAMES = `
  @keyframes shimmerBeam {
    0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
    12%  { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateX(230%) skewX(-18deg); opacity: 0; }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.12; }
    50%       { opacity: 0.22; }
  }
  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,113,26,0); }
    50%       { box-shadow: 0 0 0 6px rgba(232,113,26,0.18); }
  }
`;

/* --- Variants Framer Motion ------------------------------------------------ */

/** Conteneur : stagger d'entrée orchestré de haut en bas */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

/** Enfant : slide-up + fade — même courbe que PromoOfferCard */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.52,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* --- Mapper Soldes → PromoProductCard -------------------------------------- */

/**
 * Transforme un objet `Soldes` (API) en `PromoProductCard` (UI).
 * Centralisé ici pour éviter la duplication avec PromotionsPage.
 */
function mapSaleToCard(sale: Soldes): PromoProductCard {
  return {
    id: sale.id,
    productId: sale.id,
    name: sale.product_name,
    slug: sale.product_slug,
    price: sale.sale_price,
    comparePrice: sale.original_price,
    discountPercent: sale.discount_percent,
    image: sale.product_image || null,
    reviewCount: 0,
    rating: 5.0,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : LoadingSkeleton
   Squelette forest pulsé — cohérent avec le fond sombre du design system.
   Évite le contraste brutal d'un squelette gris sur fond clair.
═══════════════════════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Chargement des promotions…"
    >
      {/* Squelette bannière */}
      <div
        className="h-52 rounded-[1.4rem] sm:h-56"
        style={{
          background:
            "linear-gradient(145deg, #12422D 0%, #0D2E1E 50%, #162E22 100%)",
          animation: "pulse 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
          border: "1px solid rgba(47,158,111,0.12)",
        }}
      />
      {/* Squelettes cartes produits */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`promo-skeleton-${index}`}
            className="h-48 rounded-[1.35rem]"
            style={{
              background:
                "linear-gradient(145deg, #12422D 0%, #0D2E1E 50%, #162E22 100%)",
              animation: `pulse 1.8s cubic-bezier(0.4,0,0.6,1) ${index * 0.12}s infinite`,
              border: "1px solid rgba(47,158,111,0.1)",
              opacity: 1 - index * 0.12,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : SectionHeader
   En-tête de section avec eyebrow animé, titre, description et CTA.
   Cohérent typographiquement avec le reste du design system.
═══════════════════════════════════════════════════════════════════════════ */
function SectionHeader() {
  return (
    <motion.div
      variants={itemVariants}
      className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
    >
      {/* Bloc texte */}
      <div className="max-w-5xl">





        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          {/* Eyebrow avec ligne dorée */}
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9a96e]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9a96e]">
              Promotions &amp; partenaires
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a96e]" />
          </div>

          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Offres du moment{" "}
            <span className="relative inline-block">
              <span className="text-[#c9a96e]">exceptionnelles</span>
              {/* Soulignement doré dessiné */}
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] rounded-full"
                style={{ background: "linear-gradient(to right, #c9a96e, #f5d98b)" }}
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              />
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-gray-500">
            Des produits du terroir en soldes, à prix réduits pour une
            durée limitée.
          </p>
        </motion.div>









      </div>

      {/* CTA "Toutes les offres" */}
      <Link
        href="/promotions"
        className="group inline-flex items-center gap-2.5 self-start rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300"
        style={{
          background: "rgba(13,46,30,0.06)",
          border: "1px solid rgba(13,46,30,0.12)",
          color: "#0D2E1E",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "linear-gradient(135deg, #12422D, #0D2E1E)";
          (e.currentTarget as HTMLElement).style.color = "#fff";
          (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 16px rgba(13,46,30,0.25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(13,46,30,0.06)";
          (e.currentTarget as HTMLElement).style.color = "#0D2E1E";
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(13,46,30,0.12)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <span>Toutes les offres</span>
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : PromoBanner
   Bannière immersive avec beam lumineux diagonal animé (signature premium).
   Gestion des deux modes : avec image (overlay) / sans image (couleur).
═══════════════════════════════════════════════════════════════════════════ */
function PromoBanner({ banner }: { banner: Banner }) {
  /* -- Contenu interne partagé (avec ou sans lien) -- */
  const content = (
    <div
      className="group relative overflow-hidden rounded-[1.4rem]"
      style={{
        background:
          "linear-gradient(145deg, #12422D 0%, #0D2E1E 45%, #162E22 100%)",
        border: "1px solid rgba(47,158,111,0.18)",
        boxShadow:
          "0 20px 60px rgba(13,46,30,0.2), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* -- Image de fond -- */}
      {banner.image_url ? (
        <div className="relative h-48 sm:h-56">
          <Image
            src={mediaUrl(banner.image_url) || "/placeholder.png"}
            alt={banner.title}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          {/* Overlay dégradé directionnel */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(13,46,30,0.93) 0%, rgba(13,46,30,0.72) 40%, rgba(13,46,30,0.15) 100%)",
            }}
            aria-hidden="true"
          />
        </div>
      ) : null}

      {/* -- Beam lumineux animé (signature) -- */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.4rem]"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
            animation: "shimmerBeam 3.6s ease-in-out 0.8s infinite",
          }}
        />
      </div>

      {/* -- Halo de couleur jade en bas à droite -- */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full opacity-[0.15] blur-3xl"
        style={{
          background: "radial-gradient(circle, #2F9E6F, transparent 70%)",
          animation: "pulseGlow 4s ease-in-out infinite",
        }}
        aria-hidden="true"
      />

      {/* -- Contenu textuel -- */}
      <div
        className={
          banner.image_url
            ? "absolute inset-0 flex items-center"
            : "relative z-10 p-8"
        }
      >
        <div className="relative z-10 max-w-xl px-6 py-6 sm:px-8">
          {/* Surtitre */}
          <p
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: "rgba(245,230,200,0.55)" }}
          >
            {banner.subtitle || "Offre spéciale"}
          </p>

          {/* Titre de la bannière */}
          <h3
            className="mt-2 text-2xl font-black leading-tight sm:text-3xl"
            style={{
              color: "#fff",
              textShadow: "0 2px 12px rgba(0,0,0,0.35)",
              letterSpacing: "-0.02em",
            }}
          >
            {banner.title}
          </h3>

          {/* CTA de la bannière */}
          {banner.cta_label ? (
            <span
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white"
              style={{
                background:
                  "linear-gradient(135deg, #E8711A 0%, #F5A623 60%, #E8711A 100%)",
                boxShadow:
                  "0 4px 16px rgba(232,113,26,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                letterSpacing: "0.01em",
              }}
            >
              <CircleCheckBig className="h-3.5 w-3.5" aria-hidden="true" />
              {banner.cta_label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      </div>

      {/* -- Border gradient au hover (via pseudo-overlay) -- */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          border: "1.5px solid rgba(47,158,111,0.45)",
          boxShadow: "inset 0 0 32px rgba(47,158,111,0.06)",
        }}
        aria-hidden="true"
      />
    </div>
  );

  /* -- Wrapper conditionnel : lien ou div -- */
  if (banner.cta_url) {
    return (
      <Link
        href={banner.cta_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`${banner.title} — ${banner.cta_label ?? "En savoir plus"}`}
      >
        {content}
      </Link>
    );
  }

  return <div role="region" aria-label={banner.title}>{content}</div>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : ProduitsEnPromoHeader
   Titre de la sous-section "Produits en promotion" avec accent visuel.
═══════════════════════════════════════════════════════════════════════════ */
function ProduitsEnPromoHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      {/* Accent vertical jade */}
      <div
        className="h-6 w-[3px] rounded-full"
        style={{
          background: "linear-gradient(180deg, #2F9E6F, #7EDBB4)",
          boxShadow: "0 0 8px rgba(47,158,111,0.5)",
        }}
        aria-hidden="true"
      />
      <h3
        className="text-[25px] font-semibold tracking-tight"
        style={{ color: "#0D2E1E", letterSpacing: "0.01em" }}
      >
        Produits en promotion
      </h3>
      {/* Trait de séparation */}
      <div
        className="flex-1"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, rgba(47,158,111,0.2), transparent)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT PRINCIPAL : HomePromotionsSection
   Orchestrateur : fetch données, gestion état, rendu adaptatif.
═══════════════════════════════════════════════════════════════════════════ */
export default function HomePromotionsSection() {
  const [promoProducts, setPromoProducts] = useState<PromoProductCard[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  /* -- Fetch données en parallèle avec gestion d'erreur individuelle -- */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [salesRes, bannersRes] = await Promise.allSettled([
          getActiveSales(),
          getActiveRecommendations(),
        ]);

        if (!active) return;

        const sales: Soldes[] =
          salesRes.status === "fulfilled" && salesRes.value.ok
            ? salesRes.value.data
            : [];

        const fetchedBanners: Banner[] =
          bannersRes.status === "fulfilled" && bannersRes.value.ok
            ? bannersRes.value.data
            : [];

        setPromoProducts(sales.map(mapSaleToCard));
        setBanners(fetchedBanners);
      } finally {
        if (active) setLoading(false);
      }
    })();

    /* Cleanup : évite setState sur composant démonté */
    return () => {
      active = false;
    };
  }, []);

  /* -- Masque la section si rien à afficher (après chargement) -- */
  const hasContent = promoProducts.length > 0 || banners.length > 0;
  if (!loading && !hasContent) return null;

  return (
    <section
      className="relative overflow-visible py-14 sm:py-16 lg:py-20"
      aria-label="Section promotions et offres du moment"
      aria-busy={loading}
    >
      {/* Injection unique des keyframes */}
      <style dangerouslySetInnerHTML={{ __html: BANNER_KEYFRAMES }} />

      {/* -- Halos d'ambiance (cohérents avec PromoOfferCard) -- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Halo ember gauche */}
        <div
          className="absolute left-[4%] top-12 h-56 w-56 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(232,113,26,0.08), transparent 70%)",
          }}
        />
        {/* Halo jade droite */}
        <div
          className="absolute bottom-8 right-[8%] h-64 w-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(47,158,111,0.07), transparent 70%)",
          }}
        />
        {/* Halo forest centré — profondeur subtile */}
        <div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(13,46,30,0.04), transparent 70%)",
          }}
        />
      </div>

      {/* -- Conteneur principal -- */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* -- En-tête de section -- */}
          <SectionHeader />

          {/* -- État de chargement -- */}
          {loading ? (
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              className="space-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* -- Grille de bannières (max 2) -- */}
              {banners.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"
                >
                  {banners.slice(0, 2).map((banner) => (
                    <PromoBanner key={banner.id} banner={banner} />
                  ))}
                </motion.div>
              )}

              {/* -- Carousel produits en promotion -- */}
              {promoProducts.length > 0 && (
                <motion.div variants={itemVariants}>
                  <ProduitsEnPromoHeader />
                  <div className="overflow-visible">
                    <PromoProductsCarousel items={promoProducts} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}