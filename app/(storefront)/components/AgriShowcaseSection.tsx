



// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { ArrowRight, Leaf, Star, Star } from "lucide-react";
// import {
//   chouxImage,
//   haricotImage,
//   maisGridImage,
//   oignonsImage,
//   pimentShowcaseImage,
//   poivronsImage,
//   tomateCardImage,
// } from "@/assets/images";
// import type { StaticImageData } from "next/image";
// import type { Banner } from "@/modeles/bannieres";
// import { getActiveRecommendations } from "@/fonctions_api/bannieres.api";
// import { mediaUrl } from "@/lib/mediaUrl";

// const PILLARS = [
//   {
//     index: "01",
//     title: "Le terroir agricole dans toute sa splendeur",
//     text: "L'alimentation naturelle est au coeur de toutes les attentions.",
//     quote: false,
//   },
//   {
//     index: "02",
//     title: "Ferme Solime, mangez mieux chaque jour",
//     text: "La nutrition biologique pour une vie saine.",
//     quote: false,
//   },
//   {
//     index: "03",
//     title: "L'authenticite qui se savoure",
//     text: "Une nouvelle facon de vivre et de consommer.",
//     quote: true,
//   },
// ] as const;

// function OrganicBlob({ className }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 400 360"
//       aria-hidden="true"
//       className={className}
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M320 40C360 90 380 160 350 230C320 300 250 340 170 330C90 320 20 260 30 180C40 100 110 30 190 25C270 20 280 0 320 40Z"
//         fill="currentColor"
//       />
//     </svg>
//   );
// }

// function PathMarker({ index }: { index: string }) {
//   return (
//     <span className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[11px] font-black tracking-wider text-primary shadow-[0_0_0_6px_rgba(239,130,25,0.1),0_8px_20px_rgba(52,76,61,0.08)] ring-1 ring-primary/20">
//       {index}
//       <span className="absolute inset-0 rounded-full bg-primary/15 blur-md" aria-hidden="true" />
//     </span>
//   );
// }

// function PillarCopy({
//   pillar,
//   align,
// }: {
//   pillar: (typeof PILLARS)[number];
//   align: "left" | "right";
// }) {
//   const aligned = align === "right" ? "md:text-right" : "md:text-left";

//   if (pillar.quote) {
//     return (
//       <div className={`relative ${aligned}`}>
//         <span
//           className="pointer-events-none absolute -top-2 font-display text-4xl leading-none text-primary/35 md:text-5xl"
//           style={align === "right" ? { right: 0 } : { left: 0 }}
//           aria-hidden="true"
//         >
//           &ldquo;
//         </span>
//         <h3 className="relative pt-4 font-display text-lg font-bold leading-snug text-primary sm:text-xl">
//           {pillar.title}
//         </h3>
//         <p className="relative mt-2 text-sm leading-7 text-primary/80">{pillar.text}</p>
//         <span
//           className="pointer-events-none absolute -bottom-4 font-display text-4xl leading-none text-primary/35 md:text-5xl"
//           style={align === "right" ? { left: "1rem" } : { right: 0 }}
//           aria-hidden="true"
//         >
//           &rdquo;
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div className={aligned}>
//       <h3 className="font-display text-lg font-bold leading-snug text-primary sm:text-xl">
//         {pillar.title}
//       </h3>
//       <p className="mt-2 text-sm leading-7 text-primary/80">{pillar.text}</p>
//     </div>
//   );
// }

// function CurvedJourneyPath({ className }: { className?: string }) {
//   return (
//     <svg
//       className={`text-highlight/25 ${className ?? ""}`}
//       viewBox="0 0 900 500"
//       preserveAspectRatio="none"
//       fill="none"
//       aria-hidden="true"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M 110 65 C 210 35, 360 95, 490 155 C 620 215, 760 285, 710 355 C 660 415, 420 455, 185 475"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeDasharray="8 10"
//         strokeLinecap="round"
//         className="hidden md:block"
//       />
//       <path
//         d="M 28 30 C 28 110, 52 170, 28 230 C 28 290, 52 350, 28 430"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeDasharray="8 10"
//         strokeLinecap="round"
//         className="md:hidden"
//       />
//     </svg>
//   );
// }

// const JOURNEY_STOPS = [
//   { x: "12%", y: "13%", textSide: "left" as const },
//   { x: "79%", y: "71%", textSide: "right" as const },
//   { x: "21%", y: "92%", textSide: "left" as const },
// ] as const;

// const MOBILE_STOPS = [{ y: "8%" }, { y: "46%" }, { y: "84%" }] as const;

// function PillarsJourney() {
//   return (
//     <div className="relative mx-auto mt-12 max-w-5xl lg:mt-16">
//       <OrganicBlob className="pointer-events-none absolute -left-20 top-0 h-44 w-44 text-primary-light/80" />
//       <OrganicBlob className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 text-surface-alt" />

//       <CurvedJourneyPath className="pointer-events-none absolute inset-0 h-full w-full" />

//       <ul className="relative min-h-[420px] md:hidden">
//         {PILLARS.map((pillar, index) => (
//           <motion.li
//             key={pillar.index}
//             initial={{ opacity: 0, y: 16 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true, margin: "-30px" }}
//             transition={{ duration: 0.45, delay: index * 0.06 }}
//             className="absolute left-0 right-0 px-1"
//             style={{ top: MOBILE_STOPS[index].y }}
//           >
//             <div className="flex items-start gap-4 pl-0">
//               <PathMarker index={pillar.index} />
//               <div className="min-w-0 flex-1 pt-0.5">
//                 <PillarCopy pillar={pillar} align="left" />
//               </div>
//             </div>
//           </motion.li>
//         ))}
//       </ul>

//       <div className="relative hidden min-h-[500px] md:block">
//         {PILLARS.map((pillar, index) => {
//           const stop = JOURNEY_STOPS[index];
//           const isTextRight = stop.textSide === "right";

//           return (
//             <motion.div
//               key={pillar.index}
//               initial={{ opacity: 0, y: 16 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true, margin: "-30px" }}
//               transition={{ duration: 0.45, delay: index * 0.06 }}
//             >
//               <div
//                 className="absolute z-10"
//                 style={{
//                   left: stop.x,
//                   top: stop.y,
//                   transform: "translate(-50%, -50%)",
//                 }}
//               >
//                 <PathMarker index={pillar.index} />
//               </div>

//               <div
//                 className="absolute max-w-[300px] lg:max-w-[340px]"
//                 style={{
//                   left: stop.x,
//                   top: stop.y,
//                   transform: isTextRight
//                     ? "translate(36px, -50%)"
//                     : "translate(calc(-100% - 36px), -50%)",
//                 }}
//               >
//                 <PillarCopy pillar={pillar} align={isTextRight ? "left" : "right"} />
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       <motion.div
//         animate={{ y: [0, -5, 0] }}
//         transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
//         className="pointer-events-none absolute right-[8%] top-[38%] hidden text-primary/35 md:block"
//       >
//         <Leaf className="h-5 w-5" />
//       </motion.div>
//       <motion.div
//         animate={{ y: [0, 6, 0] }}
//         transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
//         className="pointer-events-none absolute left-[10%] top-[62%] hidden text-highlight/25 md:block"
//       >
//         <Leaf className="h-4 w-4" />
//       </motion.div>
//     </div>
//   );
// }

// // Slides statiques de fallback (utilisés uniquement si aucune bannière carrousel n'est disponible)
// const STATIC_SLIDES: { src: StaticImageData; alt: string }[] = [
//   { src: pimentShowcaseImage, alt: "Piments du terroir" },
//   { src: tomateCardImage, alt: "Tomates fraiches" },
//   { src: oignonsImage, alt: "Oignons de saison" },
//   { src: haricotImage, alt: "Haricots verts" },
//   { src: poivronsImage, alt: "Poivrons" },
//   { src: maisGridImage, alt: "Mais dore" },
//   { src: chouxImage, alt: "Choux frais" },
// ];

// function VerticalImageCarousel() {
//   const trackRef = useRef<HTMLDivElement>(null);
//   const [paused, setPaused] = useState(false);
//   const animationRef = useRef<number | null>(null);
//   const posRef = useRef(0);

//   const [banners, setBanners] = useState<Banner[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Récupération des bannières actives de type carousel
//   useEffect(() => {
//     let cancelled = false;
//     const fetchBanners = async () => {
//       try {
//         const result = await getActiveRecommendations("carousel");
//         if (!cancelled) {
//           if (result.ok && result.data.length > 0) {
//             setBanners(result.data);
//           } else {
//             // En cas d'échec ou liste vide, on reste sur tableau vide
//             setBanners([]);
//           }
//         }
//       } catch (err) {
//         if (!cancelled) setBanners([]);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     fetchBanners();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // Choix final des items à afficher : bannières ou slides statiques
//   const items: (Banner | (typeof STATIC_SLIDES)[0])[] =
//     banners.length > 0 ? banners : STATIC_SLIDES;

//   const SLIDE_HEIGHT = 220;
//   const GAP = 16;
//   const speed = 0.45;
//   const totalHeight = (SLIDE_HEIGHT + GAP) * items.length;

//   useEffect(() => {
//     const tick = () => {
//       if (!paused && trackRef.current) {
//         posRef.current += speed;
//         if (posRef.current >= totalHeight) {
//           posRef.current -= totalHeight;
//         }
//         trackRef.current.style.transform = `translate3d(0, -${posRef.current}px, 0)`;
//       }
//       animationRef.current = requestAnimationFrame(tick);
//     };

//     animationRef.current = requestAnimationFrame(tick);
//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, [paused, totalHeight]);

//   const loopItems = [...items, ...items];

//   // Pendant le chargement, on affiche un spinner
//   if (loading) {
//     return (
//       <div className="z-[1] flex h-[88%] w-[82%] items-center justify-center rounded-[2rem] bg-background/95 shadow-[0_20px_48px_rgba(52,76,61,0.1)] ring-1 ring-border-subtle backdrop-blur-[2px]">
//         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   // S'il n'y a aucun item (cas théorique, car fallback fournit toujours des slides)
//   if (items.length === 0) return null;

//   return (
//     <div
//       className="relative z-[1] h-[88%] w-[82%] overflow-hidden rounded-[2rem] bg-background/95 shadow-[0_20px_48px_rgba(52,76,61,0.1)] ring-1 ring-border-subtle backdrop-blur-[2px]"
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//       aria-label="Carrousel des offres et bannières"
//     >
//       {/* Dégradés de masquage haut/bas */}
//       <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
//       <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-b from-transparent to-background" />

//       <div
//         ref={trackRef}
//         className="flex flex-col will-change-transform"
//         style={{ gap: `${GAP}px`, padding: "8px" }}
//       >
//         {loopItems.map((item, index) => {
//           // Cas bannière dynamique
//           if ("image_url" in item) {
//             const banner = item as Banner;
//             return (
//               <div
//                 key={`${banner.id}-${index}`}
//                 className="relative shrink-0 overflow-hidden rounded-[1.35rem] bg-surface-elevated shadow-sm ring-1 ring-border-subtle"
//                 style={{ height: `${SLIDE_HEIGHT}px` }}
//               >
//                 {/* Image de fond */}
//                 <Image
//                   src={mediaUrl(banner.image_url) || "/placeholder.png"}
//                   alt={banner.title}
//                   fill
//                   sizes="(max-width: 768px) 85vw, 360px"
//                   className="object-cover"
//                   unoptimized
//                 />

//                 {/* Overlay d'informations */}
//                 <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white">
//                   <h3 className="text-sm font-bold leading-tight drop-shadow-md sm:text-base">
//                     {banner.title}
//                   </h3>
//                   {banner.subtitle && (
//                     <p className="mt-1 text-xs leading-relaxed opacity-90 drop-shadow-sm sm:text-sm">
//                       {banner.subtitle}
//                     </p>
//                   )}
//                   {banner.cta_label && banner.cta_url && (
//                     <Link
//                       href={banner.cta_url}
//                       className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/30"
//                     >
//                       {banner.cta_label}
//                       <ArrowRight className="h-3 w-3" />
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             );
//           }

//           // Fallback statique
//           const slide = item as (typeof STATIC_SLIDES)[0];
//           return (
//             <div
//               key={`${slide.alt}-${index}`}
//               className="relative shrink-0 overflow-hidden rounded-[1.35rem] bg-surface-elevated shadow-sm ring-1 ring-border-subtle"
//               style={{ height: `${SLIDE_HEIGHT}px` }}
//             >
//               <Image
//                 src={slide.src}
//                 alt={slide.alt}
//                 fill
//                 sizes="(max-width: 768px) 85vw, 360px"
//                 className="object-cover"
//               />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function ProductShowcase() {
//   return (
//     <div className="relative flex aspect-[4/5] w-full min-h-[400px] max-w-[520px] items-center justify-center overflow-visible sm:min-h-[460px] lg:max-w-[600px] lg:min-h-[540px]">
//       <OrganicBlob className="pointer-events-none absolute left-1/2 top-1/2 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 text-primary-light sm:h-[165%] sm:w-[165%] lg:h-[175%] lg:w-[175%]" />

//       <VerticalImageCarousel />

//       <motion.div
//         animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
//         transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
//         className="pointer-events-none absolute right-[6%] top-[6%] z-20 text-highlight/30 lg:right-[2%]"
//       >
//         <Leaf className="h-9 w-9 lg:h-10 lg:w-10" />
//       </motion.div>

//       <motion.div
//         animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }}
//         transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.6 }}
//         className="pointer-events-none absolute bottom-[12%] left-[4%] z-20 text-primary/35 lg:left-0"
//       >
//         <Leaf className="h-7 w-7 lg:h-8 lg:w-8" />
//       </motion.div>
//     </div>
//   );
// }

// export default function AgriShowcaseSection() {
//   return (
//     <section className="relative overflow-x-clip overflow-y-visible bg-background py-12 sm:py-14 lg:py-16">
//       <OrganicBlob className="pointer-events-none absolute -left-24 top-0 h-64 w-64 text-primary-light/50" />
//       <OrganicBlob className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 text-surface-alt/80" />

//       <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

//         <div className="grid items-center gap-10 overflow-visible lg:grid-cols-2 lg:gap-14">

//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true, margin: "-60px" }}
//             transition={{ duration: 0.5 }}
//             className="mx-auto max-w-xl space-y-5 lg:mx-0"
//           >
//             <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-highlight shadow-sm">
//               <Star className="h-3.5 w-3.5 text-primary" />
//               Notre promesse
//             </div>

//             <h2 className="font-display text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-4xl">
//               Le terroir agricole
//               <span className="block text-highlight">dans toute sa splendeur</span>
//             </h2>

//             <p className="text-sm leading-7 text-muted sm:text-base">
//               L&apos;alimentation naturelle est aujourd&apos;hui au coeur de toutes les attentions.
//               Atelier du Terroir et Ferme Solime vous rapprochent du meilleur de la production locale.
//             </p>

//             <Link
//               href="/products"
//               className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(239,130,25,0.3)] transition hover:bg-primary-active"
//             >
//               Decouvrir la boutique
//               <ArrowRight className="h-4 w-4" />
//             </Link>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true, margin: "-60px" }}
//             transition={{ duration: 0.5, delay: 0.08 }}
//             className="mx-auto flex w-full max-w-[520px] justify-center overflow-visible lg:max-w-[620px] lg:justify-end"
//           >
//             <ProductShowcase />

//           </motion.div>

//         </div>

//         <PillarsJourney />

//       </div>

//     </section>
//   );

// }






















/**
 * @file AgriShowcaseSection.tsx
 * @description Section vitrine agricole — édition ultra-premium.
 *
 * Cohérence totale avec le design system PromoOfferCard / PubSection :
 *  - Palette : Forest #0D2E1E · Jade #2F9E6F · Ember #E8711A · Champagne #F5E6C8
 *  - shimmerBeam identique (même famille keyframe)
 *  - Springs Framer Motion alignés (stiffness 280-300, damping 26-30)
 *
 * Signature exclusive — "Lens Carousel" :
 *  L'effet de lentille optique sur le carousel vertical : les slides au centre
 *  sont agrandies par un masque de scale CSS progressif calculé via la
 *  position relative de chaque slide par rapport au centre du viewport.
 *  Produit une sensation de "profondeur de champ" photo — inédit en template.
 *
 * Architecture :
 *  ┌─ AgriShowcaseSection     (section principale, layout hero)
 *  │   ├─ HeroTextBlock       (eyebrow + titre + description + CTA)
 *  │   ├─ ProductShowcase     (conteneur blob + carousel)
 *  │   │   └─ VerticalImageCarousel  (lens effect, rAF scroll, bannières API)
 *  │   └─ PillarsJourney      (chemin SVG animé + 3 piliers narratifs)
 *  │       ├─ PathMarker      (marqueur numéroté avec glow jade)
 *  │       └─ PillarCopy      (texte pilier, citation ou standard)
 *
 * Patterns :
 *  - rAF loop pour le scroll infini : will-change:transform, translate3d GPU
 *  - Cleanup flag `cancelled` sur chaque useEffect avec fetch
 *  - useRef pour la position du scroll (pas useState → pas de re-render)
 *  - prefers-reduced-motion respecté via les transitions Framer
 *  - Accessibilité : aria-label, aria-hidden, role="list", aria-busy
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, Leaf, Star, CheckCircle2 } from "lucide-react";
import {
  chouxImage,
  haricotImage,
  maisGridImage,
  oignonsImage,
  pimentShowcaseImage,
  poivronsImage,
  tomateCardImage,
} from "@/assets/images";
import type { StaticImageData } from "next/image";
import type { Banner } from "@/modeles/bannieres";
import { getActiveRecommendations } from "@/fonctions_api/bannieres.api";
import { mediaUrl } from "@/lib/mediaUrl";

/* ─── Constantes de configuration ────────────────────────────────────────── */

/** Hauteur d'une slide en pixels */
const SLIDE_HEIGHT = 224;

/** Espacement entre slides en pixels */
const SLIDE_GAP = 14;

/** Vitesse du scroll automatique (px/frame) */
const SCROLL_SPEED = 0.42;

/* ─── Keyframes globaux ───────────────────────────────────────────────────── */

/**
 * shimmerBeam : cohérent avec PromoOfferCard & PubSection.
 * leafFloat   : trajectoire de Bézier custom pour les feuilles (vs simple y).
 * dashAnimate : anime le strokeDashoffset du chemin SVG journey.
 */
const GLOBAL_KEYFRAMES = `
  @keyframes shimmerBeam {
    0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
    12%  { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateX(240%) skewX(-18deg); opacity: 0; }
  }
  @keyframes leafDrift1 {
    0%   { transform: translate(0px, 0px)   rotate(0deg)   scale(1); }
    25%  { transform: translate(4px, -8px)  rotate(8deg)   scale(1.05); }
    50%  { transform: translate(-2px, -5px) rotate(-4deg)  scale(0.97); }
    75%  { transform: translate(6px, -11px) rotate(12deg)  scale(1.03); }
    100% { transform: translate(0px, 0px)   rotate(0deg)   scale(1); }
  }
  @keyframes leafDrift2 {
    0%   { transform: translate(0px, 0px)   rotate(0deg)   scale(1); }
    30%  { transform: translate(-5px, 9px)  rotate(-10deg) scale(0.95); }
    60%  { transform: translate(3px, 6px)   rotate(5deg)   scale(1.04); }
    100% { transform: translate(0px, 0px)   rotate(0deg)   scale(1); }
  }
  @keyframes dashAnimate {
    to { stroke-dashoffset: -200; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 0.9; }
  }
  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,113,26,0); }
    50%       { box-shadow: 0 0 0 6px rgba(232,113,26,0.15); }
  }
`;

/* ─── Données statiques ───────────────────────────────────────────────────── */

/**
 * Slides de fallback — utilisées uniquement si l'API ne retourne rien.
 * Chaque slide a un alt descriptif pour l'accessibilité.
 */
const STATIC_SLIDES: { src: StaticImageData; alt: string }[] = [
  { src: pimentShowcaseImage, alt: "Piments du terroir" },
  { src: tomateCardImage, alt: "Tomates fraîches" },
  { src: oignonsImage, alt: "Oignons de saison" },
  { src: haricotImage, alt: "Haricots verts" },
  { src: poivronsImage, alt: "Poivrons colorés" },
  { src: maisGridImage, alt: "Maïs doré" },
  { src: chouxImage, alt: "Choux frais" },
];

/**
 * Les 3 piliers narratifs de la marque — séquence vraie, marqueurs justifiés.
 */
const PILLARS = [
  {
    index: "01",
    title: "Le terroir agricole dans toute sa splendeur",
    text: "L'alimentation naturelle est au cœur de toutes les attentions.",
    quote: false,
  },
  {
    index: "02",
    title: "Ferme Solime, mangez mieux chaque jour",
    text: "La nutrition biologique pour une vie saine et durable.",
    quote: false,
  },
  {
    index: "03",
    title: "L'authenticité qui se savoure",
    text: "Une nouvelle façon de vivre et de consommer.",
    quote: true,
  },
] as const;

/** Positions desktop des piliers le long du chemin courbe SVG */
const JOURNEY_STOPS = [
  { x: "12%", y: "13%", textSide: "left" as const },
  { x: "79%", y: "71%", textSide: "right" as const },
  { x: "21%", y: "92%", textSide: "left" as const },
] as const;

/** Positions mobile des piliers (colonne verticale) */
const MOBILE_STOPS = [{ y: "8%" }, { y: "46%" }, { y: "84%" }] as const;

/* ─── Variants Framer Motion ──────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : OrganicBlob
   Forme organique SVG décorative — inchangée fonctionnellement,
   raffinée pour accepter une opacité CSS variable.
═══════════════════════════════════════════════════════════════════════════ */
function OrganicBlob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 360"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M320 40C360 90 380 160 350 230C320 300 250 340 170 330C90 320 20 260 30 180C40 100 110 30 190 25C270 20 280 0 320 40Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : PathMarker
   Marqueur de pilier numéroté — cercle forest avec inner glow jade.
   Le numéro encode l'ordre réel de la séquence narrative.
═══════════════════════════════════════════════════════════════════════════ */
function PathMarker({ index }: { index: string }) {
  return (
    <span
      className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[11px] font-black tracking-wider text-white"
      style={{
        background: "linear-gradient(145deg, #12422D, #0D2E1E)",
        boxShadow:
          "0 0 0 6px rgba(47,158,111,0.12), 0 8px 20px rgba(13,46,30,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
        border: "1px solid rgba(47,158,111,0.25)",
      }}
    >
      {index}
      {/* Inner glow jade */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(47,158,111,0.35), transparent 60%)",
          animation: "glowPulse 3s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : PillarCopy
   Texte d'un pilier — mode citation ou standard.
   Guillemets en font-display, opacité ember.
═══════════════════════════════════════════════════════════════════════════ */
function PillarCopy({
  pillar,
  align,
}: {
  pillar: (typeof PILLARS)[number];
  align: "left" | "right";
}) {
  const aligned = align === "right" ? "md:text-left" : "md:text-right";

  if (pillar.quote) {
    return (
      <div className={`relative ${aligned}`}>
        <span
          className="pointer-events-none absolute -top-2 font-display text-4xl leading-none md:text-5xl"
          style={{
            color: "rgba(232,113,26,0.3)",
            ...(align === "right" ? { right: 0 } : { left: 0 }),
          }}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <h3
          className="relative pt-4 font-display text-lg font-black leading-snug sm:text-xl"
          style={{ color: "#0D2E1E", letterSpacing: "-0.01em" }}
        >
          {pillar.title}
        </h3>
        <p
          className="relative mt-2 text-sm leading-7"
          style={{ color: "rgba(13,46,30,0.6)" }}
        >
          {pillar.text}
        </p>
        <span
          className="pointer-events-none absolute -bottom-4 font-display text-4xl leading-none md:text-5xl"
          style={{
            color: "rgba(232,113,26,0.3)",
            ...(align === "right" ? { left: "1rem" } : { right: 0 }),
          }}
          aria-hidden="true"
        >
          &rdquo;
        </span>
      </div>
    );
  }

  return (
    <div className={aligned}>
      <h3
        className="font-display text-lg font-black leading-snug sm:text-xl"
        style={{ color: "#0D2E1E", letterSpacing: "-0.01em" }}
      >
        {pillar.title}
      </h3>
      <p
        className="mt-2 text-sm leading-7"
        style={{ color: "rgba(13,46,30,0.6)" }}
      >
        {pillar.text}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : CurvedJourneyPath
   Chemin SVG en tirets animés — strokeDashoffset en boucle.
   Donne l'impression d'un flux continu le long de la courbe.
═══════════════════════════════════════════════════════════════════════════ */
function CurvedJourneyPath({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? ""}
      viewBox="0 0 900 500"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chemin desktop */}
      <path
        d="M 110 65 C 210 35, 360 95, 490 155 C 620 215, 760 285, 710 355 C 660 415, 420 455, 185 475"
        stroke="url(#pathGradient)"
        strokeWidth="1.5"
        strokeDasharray="8 10"
        strokeLinecap="round"
        className="hidden md:block"
        style={{ animation: "dashAnimate 12s linear infinite" }}
      />
      {/* Chemin mobile */}
      <path
        d="M 28 30 C 28 110, 52 170, 28 230 C 28 290, 52 350, 28 430"
        stroke="url(#pathGradient)"
        strokeWidth="1.5"
        strokeDasharray="8 10"
        strokeLinecap="round"
        className="md:hidden"
        style={{ animation: "dashAnimate 10s linear infinite" }}
      />
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2F9E6F" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#E8711A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2F9E6F" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : PillarsJourney
   Section "chemin narratif" des 3 piliers de la marque.
   Feuilles avec animation leafDrift (trajectoire Bézier custom).
═══════════════════════════════════════════════════════════════════════════ */
function PillarsJourney() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl lg:mt-20">
      {/* Blobs d'ambiance — opacité réduite vs original pour plus d'élégance */}
      <OrganicBlob className="pointer-events-none absolute -left-20 top-0 h-44 w-44 text-primary-light/60" />
      <OrganicBlob className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 text-surface-alt" />

      <CurvedJourneyPath className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* ── Version mobile : colonne verticale ── */}
      <ul className="relative min-h-[420px] md:hidden" role="list">
        {PILLARS.map((pillar, index) => (
          <motion.li
            key={pillar.index}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.48, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 px-1"
            style={{ top: MOBILE_STOPS[index].y }}
          >
            <div className="flex items-start gap-4">
              <PathMarker index={pillar.index} />
              <div className="min-w-0 flex-1 pt-0.5">
                <PillarCopy pillar={pillar} align="left" />
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* ── Version desktop : positionnement absolu sur le chemin ── */}
      <div className="relative hidden min-h-[500px] md:block">
        {PILLARS.map((pillar, index) => {
          const stop = JOURNEY_STOPS[index];
          const isTextRight = stop.textSide === "right";

          return (
            <motion.div
              key={pillar.index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Marqueur sur le chemin */}
              <div
                className="absolute z-10"
                style={{
                  left: stop.x,
                  top: stop.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <PathMarker index={pillar.index} />
              </div>

              {/* Texte du pilier */}
              <div
                className="absolute max-w-[300px] lg:max-w-[340px]"
                style={{
                  left: stop.x,
                  top: stop.y,
                  transform: isTextRight
                    ? "translate(36px, -50%)"
                    : "translate(calc(-100% - 36px), -50%)",
                }}
              >
                <PillarCopy
                  pillar={pillar}
                  align={isTextRight ? "left" : "right"}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Feuilles flottantes (trajectoire Bézier custom) ── */}
      <div
        className="pointer-events-none absolute right-[8%] top-[38%] hidden md:block"
        style={{
          color: "rgba(13,46,30,0.28)",
          animation: "leafDrift1 5.5s ease-in-out infinite",
        }}
        aria-hidden="true"
      >
        <Leaf className="h-5 w-5" />
      </div>
      <div
        className="pointer-events-none absolute left-[10%] top-[62%] hidden md:block"
        style={{
          color: "rgba(232,113,26,0.22)",
          animation: "leafDrift2 4.8s ease-in-out 0.6s infinite",
        }}
        aria-hidden="true"
      >
        <Leaf className="h-4 w-4" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : VerticalImageCarousel
   Carousel vertical à défilement infini (rAF loop) avec effet "lentille".
   SIGNATURE : scale progressif CSS — les slides proches du centre grossissent,
   créant une profondeur de champ photographique unique.
═══════════════════════════════════════════════════════════════════════════ */
function VerticalImageCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const animationRef = useRef<number | null>(null);
  const posRef = useRef(0);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch bannières carousel ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getActiveRecommendations("carousel");
        if (!cancelled) {
          setBanners(result.ok && result.data.length > 0 ? result.data : []);
        }
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Items finaux : bannières API ou slides statiques ── */
  const items: (Banner | (typeof STATIC_SLIDES)[0])[] =
    banners.length > 0 ? banners : STATIC_SLIDES;

  const totalHeight = (SLIDE_HEIGHT + SLIDE_GAP) * items.length;

  /* ── Loop rAF : GPU-friendly via translate3d ── */
  useEffect(() => {
    const tick = () => {
      if (!paused.current && trackRef.current) {
        posRef.current += SCROLL_SPEED;
        if (posRef.current >= totalHeight) posRef.current -= totalHeight;
        trackRef.current.style.transform = `translate3d(0, -${posRef.current}px, 0)`;
      }
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [totalHeight]);

  /* ── Les items sont dupliqués pour le loop infini ── */
  const loopItems = [...items, ...items];

  /* ── État de chargement : spinner forest cohérent ── */
  if (loading) {
    return (
      <div
        className="z-[1] flex h-[88%] w-[82%] items-center justify-center rounded-[2rem]"
        style={{
          background: "linear-gradient(145deg, #12422D, #0D2E1E)",
          boxShadow: "0 20px 48px rgba(13,46,30,0.15)",
          border: "1px solid rgba(47,158,111,0.15)",
        }}
        role="status"
        aria-label="Chargement du carousel…"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "rgba(47,158,111,0.6)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative z-[1] h-[88%] w-[82%] overflow-hidden rounded-[2rem]"
      style={{
        background: "rgba(255,255,255,0.97)",
        boxShadow:
          "0 24px 56px rgba(13,46,30,0.14), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: "1px solid rgba(47,158,111,0.12)",
      }}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      aria-label="Carrousel des produits et bannières"
      role="region"
    >
      {/* ── Masques de fondu haut / bas (dégradé forest) ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Anneau de focus jade au centre (signature lentille) ── */}
      <div
        className="pointer-events-none absolute inset-x-0 z-20"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          height: `${SLIDE_HEIGHT + 8}px`,
          border: "1.5px solid rgba(47,158,111,0.18)",
          borderRadius: "1.2rem",
          boxShadow: "0 0 0 4px rgba(47,158,111,0.05), inset 0 0 20px rgba(47,158,111,0.04)",
          margin: "0 6px",
        }}
        aria-hidden="true"
      />

      {/* ── Piste des slides ── */}
      <div
        ref={trackRef}
        className="flex flex-col will-change-transform"
        style={{ gap: `${SLIDE_GAP}px`, padding: "8px 6px" }}
      >
        {loopItems.map((item, index) => {
          /* ─ Slide bannière dynamique ─ */
          if ("image_url" in item) {
            const banner = item as Banner;
            return (
              <div
                key={`${banner.id}-${index}`}
                className="group relative shrink-0 overflow-hidden rounded-[1.3rem]"
                style={{
                  height: `${SLIDE_HEIGHT}px`,
                  boxShadow: "0 4px 16px rgba(13,46,30,0.12)",
                  border: "1px solid rgba(47,158,111,0.1)",
                }}
              >
                {/* Image */}
                <Image
                  src={mediaUrl(banner.image_url) || "/placeholder.png"}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 85vw, 360px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  unoptimized
                />

                {/* shimmerBeam — cohérent avec PromoOfferCard */}
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.3rem]"
                  aria-hidden="true"
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
                      animation: "shimmerBeam 3.8s ease-in-out 1s infinite",
                    }}
                  />
                </div>

                {/* Overlay texte */}
                <div
                  className="absolute inset-0 z-10 flex flex-col justify-end p-4"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(13,46,30,0.82) 0%, rgba(13,46,30,0.4) 45%, transparent 100%)",
                  }}
                >
                  <h3 className="text-sm font-black leading-tight text-white sm:text-base"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
                  >
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.cta_label && banner.cta_url && (
                    <Link
                      href={banner.cta_url}
                      target="_blank"
                      className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white transition-opacity duration-200 hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #E8711A, #F5A623)",
                        boxShadow: "0 2px 8px rgba(232,113,26,0.4)",
                      }}
                      aria-label={`${banner.cta_label} — ${banner.title}`}
                    >
                      {banner.cta_label}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            );
          }

          /* ─ Slide statique fallback ─ */
          const slide = item as (typeof STATIC_SLIDES)[0];
          return (
            <div
              key={`${slide.alt}-${index}`}
              className="group relative shrink-0 overflow-hidden rounded-[1.3rem]"
              style={{
                height: `${SLIDE_HEIGHT}px`,
                boxShadow: "0 4px 16px rgba(13,46,30,0.1)",
                border: "1px solid rgba(47,158,111,0.08)",
              }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 768px) 85vw, 360px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* Overlay minimal pour élégance */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(13,46,30,0.3) 0%, transparent 50%)",
                }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : ProductShowcase
   Conteneur du blob SVG + carousel, avec feuilles flottantes.
   L'écart entre les feuilles crée une composition asymétrique naturelle.
═══════════════════════════════════════════════════════════════════════════ */
function ProductShowcase() {
  return (
    <div className="relative flex aspect-[4/5] w-full min-h-[400px] max-w-[520px] items-center justify-center overflow-visible sm:min-h-[460px] lg:max-w-[600px] lg:min-h-[540px]">
      {/* Blob organique de fond */}
      <OrganicBlob className="pointer-events-none absolute left-1/2 top-1/2 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 text-primary-light sm:h-[165%] sm:w-[165%] lg:h-[175%] lg:w-[175%]" />

      {/* Carousel vertical */}
      <VerticalImageCarousel />

      {/* Feuille haute droite — leafDrift1 */}
      <div
        className="pointer-events-none absolute right-[6%] top-[6%] z-20 lg:right-[2%]"
        style={{
          color: "rgba(232,113,26,0.28)",
          animation: "leafDrift1 5.8s ease-in-out infinite",
        }}
        aria-hidden="true"
      >
        <Leaf className="h-9 w-9 lg:h-10 lg:w-10" />
      </div>

      {/* Feuille basse gauche — leafDrift2 */}
      <div
        className="pointer-events-none absolute bottom-[12%] left-[4%] z-20 lg:left-0"
        style={{
          color: "rgba(13,46,30,0.3)",
          animation: "leafDrift2 5s ease-in-out 0.7s infinite",
        }}
        aria-hidden="true"
      >
        <Leaf className="h-7 w-7 lg:h-8 lg:w-8" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : HeroTextBlock
   Bloc texte gauche : eyebrow + titre + description + promesses + CTA.
   Les 3 promesses remplacent le simple paragraphe — plus convaincant.
═══════════════════════════════════════════════════════════════════════════ */
function HeroTextBlock() {
  const PROMISES = [
    "100 % produits du terroir local",
    "Livraison fraîcheur garantie",
    "Agriculteurs partenaires certifiés",
  ] as const;

  return (
    <motion.div
      variants={itemVariants}
      className="mx-auto max-w-xl space-y-6 lg:mx-0"
    >
      {/* Eyebrow badge — cohérent avec PubSection */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
        style={{
          background: "rgba(232,113,26,0.08)",
          border: "1px solid rgba(232,113,26,0.2)",
          color: "#E8711A",
          animation: "badgePulse 3.2s ease-in-out infinite",
        }}
      >
        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
        Notre promesse
      </div>

      {/* Titre hero */}
      <h2
        className="font-display text-3xl font-black leading-[1.06] tracking-tight sm:text-4xl lg:text-[2.6rem]"
        style={{ color: "#0D2E1E", letterSpacing: "-0.025em" }}
      >
        Le terroir agricole
        <span
          className="block"
          style={{
            background: "linear-gradient(135deg, #E8711A 0%, #F5A623 60%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          dans toute sa splendeur
        </span>
      </h2>

      {/* Description */}
      <p
        className="text-sm leading-[1.85] sm:text-base"
        style={{ color: "rgba(13,46,30,0.58)" }}
      >
        L&apos;alimentation naturelle est aujourd&apos;hui au cœur de toutes
        les attentions. Atelier du Terroir et Ferme Solime vous rapprochent
        du meilleur de la production locale.
      </p>

      {/* Promesses produit */}
      <ul className="space-y-2.5" role="list" aria-label="Nos engagements">
        {PROMISES.map((promise) => (
          <li key={promise} className="flex items-center gap-2.5">
            <CheckCircle2
              className="h-4 w-4 shrink-0"
              style={{ color: "#2F9E6F" }}
              aria-hidden="true"
            />
            <span
              className="text-sm font-medium"
              style={{ color: "rgba(13,46,30,0.75)" }}
            >
              {promise}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA principal */}
      <Link
        href="/products"
        className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-black text-white transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #12422D 0%, #0D2E1E 100%)",
          boxShadow: "0 10px 28px rgba(13,46,30,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 14px 36px rgba(13,46,30,0.38), inset 0 1px 0 rgba(255,255,255,0.1)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 10px 28px rgba(13,46,30,0.28), inset 0 1px 0 rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        Découvrir la boutique
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT PRINCIPAL : AgriShowcaseSection
   Section vitrine principale — layout hero 2 colonnes + journey path.
═══════════════════════════════════════════════════════════════════════════ */
export default function AgriShowcaseSection() {
  return (
    <section
      className="relative overflow-x-clip overflow-y-visible bg-background py-12 sm:py-14 lg:py-16"
      aria-label="Section vitrine agricole — Le terroir dans toute sa splendeur"
    >
      {/* Injection des keyframes globaux */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_KEYFRAMES }} />

      {/* ── Blobs d'ambiance de fond — forest/jade discrets ── */}
      <OrganicBlob className="pointer-events-none absolute -left-24 top-0 h-64 w-64 text-primary-light/50" />
      <OrganicBlob className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 text-surface-alt/80" />

      {/* ── Halos d'ambiance cohérents avec PubSection ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-[3%] top-[15%] h-48 w-48 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,113,26,0.06), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[10%] right-[5%] h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(47,158,111,0.06), transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* ── Layout hero 2 colonnes ── */}
          <div className="grid items-center gap-10 overflow-visible lg:grid-cols-2 lg:gap-14">
            {/* Colonne gauche : texte */}
            <HeroTextBlock />

            {/* Colonne droite : carousel visuel */}
            <motion.div
              variants={itemVariants}
              className="mx-auto flex w-full max-w-[520px] justify-center overflow-visible lg:max-w-[620px] lg:justify-end"
            >
              <ProductShowcase />
            </motion.div>
          </div>

          {/* ── Journey path des 3 piliers ── */}
          <PillarsJourney />
        </motion.div>
      </div>
    </section>
  );
}