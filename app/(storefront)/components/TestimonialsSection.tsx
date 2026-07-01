"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Marie Dupont",
    location: "Paris, France",
    avatar: "MD",
    rating: 5,
    comment:
      "La qualite des produits du terroir est incomparable. Les legumes frais et la viande blanche ont transforme ma cuisine. Le programme de fidelite est un vrai plus — j'ai deja atteint le palier Or !",
    tier: "GOLD",
  },
  {
    id: 2,
    name: "Amadou Diallo",
    location: "Dakar, Senegal",
    avatar: "AD",
    rating: 5,
    comment:
      "Enfin une plateforme qui accepte le Mobile Money ! La recharge du wallet est instantanee et la livraison au Senegal est rapide. Je recommande a 100%.",
    tier: "SILVER",
  },
  {
    id: 3,
    name: "Sophie Chen",
    location: "Montreal, Canada",
    avatar: "SC",
    rating: 5,
    comment:
      "Les produits transformes et seches sont d'une qualite remarquable. L'emballage est soigne et la livraison internationale s'est faite en 5 jours.",
    tier: "PLATINUM",
  },
  {
    id: 4,
    name: "Luca Rossi",
    location: "Milan, Italie",
    avatar: "LR",
    rating: 4,
    comment:
      "Des produits authentiques et de qualite premium. Les epices et cereales locales sont excellentes. Un vrai pont entre l'Afrique et le reste du monde.",
    tier: "BRONZE",
  },
] as const;

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () =>
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () =>
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="bg-surface/30 py-16 lg:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)]">


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
              Temoignages
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a96e]" />
          </div>

          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Ce Que Disent Nos {" "}
            <span className="relative inline-block">
              <span className="text-[#c9a96e]">Clients</span>
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


        </motion.div>






        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-lg sm:p-12"
            >
              <Quote className="absolute right-8 top-8 h-12 w-12 text-primary/10" />

              <div className="mb-6 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= TESTIMONIALS[activeIndex].rating
                        ? "fill-highlight text-highlight"
                        : "fill-border text-border"
                    )}
                  />
                ))}
              </div>

              <blockquote className="text-lg leading-relaxed text-foreground sm:text-xl">
                &ldquo;{TESTIMONIALS[activeIndex].comment}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white",
                    TESTIMONIALS[activeIndex].tier === "PLATINUM"
                      ? "bg-gradient-to-br from-gray-300 to-gray-500"
                      : TESTIMONIALS[activeIndex].tier === "GOLD"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-600"
                        : TESTIMONIALS[activeIndex].tier === "SILVER"
                          ? "bg-gradient-to-br from-gray-300 to-gray-400"
                          : "bg-gradient-to-br from-amber-600 to-amber-800"
                  )}
                >
                  {TESTIMONIALS[activeIndex].avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {TESTIMONIALS[activeIndex].name}
                  </p>
                  <p className="text-sm text-muted">{TESTIMONIALS[activeIndex].location}</p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-3 py-1 text-xs font-semibold",
                    `tier-${TESTIMONIALS[activeIndex].tier.toLowerCase()}`
                  )}
                  style={{
                    background: "var(--tier-gradient)",
                    color: "white",
                  }}
                >
                  {TESTIMONIALS[activeIndex].tier}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all hover:border-primary/30 hover:bg-surface-alt"
              aria-label="Temoignage precedent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === activeIndex ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/30"
                  )}
                  aria-label={`Temoignage ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all hover:border-primary/30 hover:bg-surface-alt"
              aria-label="Temoignage suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}







































// "use client";

// /**
//  * TestimonialsSection — Redesign luxe ultra-premium
//  *
//  * Architecture :
//  *  - Carousel orchestré avec AnimatePresence (framer-motion)
//  *  - Micro-interactions sur chaque tier badge (glow pulsé)
//  *  - Progress bar dorée animée entre les slides
//  *  - Fond blanc velours avec grain CSS subtil
//  *  - Responsive : stack vertical sur mobile, layout centré sur desktop
//  *
//  * Variables & fonctions originales conservées intégralement.
//  */

// import { useCallback, useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { cn } from "@/lib/utils";

// /* -------------------------------------------------------------
//    DONNÉES — structure d'origine conservée, enrichie de subtilTitle
//    ------------------------------------------------------------- */
// const TESTIMONIALS = [
//   {
//     id: 1,
//     name: "Marie Dupont",
//     location: "Paris, France",
//     avatar: "MD",
//     rating: 5,
//     comment:
//       "La qualité des produits du terroir est incomparable. Les légumes frais et la viande blanche ont transformé ma cuisine. Le programme de fidélité est un vrai plus — j'ai déjà atteint le palier Or !",
//     tier: "GOLD",
//   },
//   {
//     id: 2,
//     name: "Amadou Diallo",
//     location: "Dakar, Sénégal",
//     avatar: "AD",
//     rating: 5,
//     comment:
//       "Enfin une plateforme qui accepte le Mobile Money ! La recharge du wallet est instantanée et la livraison au Sénégal est rapide. Je recommande à 100%.",
//     tier: "SILVER",
//   },
//   {
//     id: 3,
//     name: "Sophie Chen",
//     location: "Montréal, Canada",
//     avatar: "SC",
//     rating: 5,
//     comment:
//       "Les produits transformés et séchés sont d'une qualité remarquable. L'emballage est soigné et la livraison internationale s'est faite en 5 jours. Une expérience d'exception.",
//     tier: "PLATINUM",
//   },
//   {
//     id: 4,
//     name: "Luca Rossi",
//     location: "Milan, Italie",
//     avatar: "LR",
//     rating: 4,
//     comment:
//       "Des produits authentiques et de qualité premium. Les épices et céréales locales sont excellentes. Un vrai pont entre l'Afrique et le reste du monde.",
//     tier: "BRONZE",
//   },
// ] as const;

// /* -------------------------------------------------------------
//    CONFIGURATION DES TIERS — couleurs, gradients et libellés
//    ------------------------------------------------------------- */
// const TIER_CONFIG = {
//   PLATINUM: {
//     gradient: "linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 50%, #d4d4d4 100%)",
//     glow: "rgba(200,200,200,0.35)",
//     label: "Platine",
//     ring: "rgba(180,180,180,0.4)",
//   },
//   GOLD: {
//     gradient: "linear-gradient(135deg, #f5d98b 0%, #c9931b 50%, #f0c853 100%)",
//     glow: "rgba(201,147,27,0.4)",
//     label: "Or",
//     ring: "rgba(201,163,110,0.45)",
//   },
//   SILVER: {
//     gradient: "linear-gradient(135deg, #d8d8d8 0%, #9090a0 50%, #c8c8d0 100%)",
//     glow: "rgba(140,140,160,0.3)",
//     label: "Argent",
//     ring: "rgba(160,160,180,0.35)",
//   },
//   BRONZE: {
//     gradient: "linear-gradient(135deg, #e0a86a 0%, #a05a20 50%, #d08840 100%)",
//     glow: "rgba(160,90,32,0.35)",
//     label: "Bronze",
//     ring: "rgba(180,120,70,0.35)",
//   },
// } as const;

// /* -------------------------------------------------------------
//    VARIANTS FRAMER-MOTION — orchestration précise
//    ------------------------------------------------------------- */
// const SLIDE_VARIANTS: Variants = {
//   enter: (dir: number) => ({
//     opacity: 0,
//     x: dir > 0 ? 60 : -60,
//     scale: 0.97,
//     filter: "blur(4px)",
//   }),
//   center: {
//     opacity: 1,
//     x: 0,
//     scale: 1,
//     filter: "blur(0px)",
//     transition: {
//       duration: 0.55,
//       ease: [0.22, 1, 0.36, 1],
//     },
//   },
//   exit: (dir: number) => ({
//     opacity: 0,
//     x: dir > 0 ? -60 : 60,
//     scale: 0.97,
//     filter: "blur(4px)",
//     transition: {
//       duration: 0.35,
//       ease: [0.4, 0, 1, 0.6],
//     },
//   }),
// };

// /* -------------------------------------------------------------
//    SOUS-COMPOSANT : StarRating — étoiles avec fill animé
//    ------------------------------------------------------------- */
// function StarRating({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-1" role="img" aria-label={`Note : ${rating} sur 5`}>
//       {Array.from({ length: 5 }).map((_, i) => (
//         <motion.svg
//           key={i}
//           initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
//           animate={{ opacity: 1, scale: 1, rotate: 0 }}
//           transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
//           width="18"
//           height="18"
//           viewBox="0 0 24 24"
//           fill={i < rating ? "#c9a96e" : "none"}
//           stroke={i < rating ? "#c9a96e" : "#d1c7b8"}
//           strokeWidth="1.5"
//           aria-hidden="true"
//         >
//           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//         </motion.svg>
//       ))}
//     </div>
//   );
// }

// /* -------------------------------------------------------------
//    SOUS-COMPOSANT : TierBadge — badge avec halo pulsé
//    ------------------------------------------------------------- */
// function TierBadge({ tier }: { tier: keyof typeof TIER_CONFIG }) {
//   const cfg = TIER_CONFIG[tier];
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.7 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ delay: 0.3, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
//       className="relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
//       style={{ background: cfg.gradient }}
//     >
//       {/* Halo pulsé */}
//       <motion.span
//         className="absolute inset-0 rounded-full"
//         style={{ boxShadow: `0 0 0 0 ${cfg.glow}` }}
//         animate={{ boxShadow: [`0 0 0 0 ${cfg.glow}`, `0 0 12px 5px ${cfg.glow}`, `0 0 0 0 ${cfg.glow}`] }}
//         transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <span className="relative text-[11px] font-semibold tracking-[0.12em] text-white/95 uppercase">
//         {cfg.label}
//       </span>
//     </motion.div>
//   );
// }

// /* -------------------------------------------------------------
//    SOUS-COMPOSANT : AvatarCircle — initiales avec ring tier
//    ------------------------------------------------------------- */
// function AvatarCircle({
//   avatar,
//   tier,
// }: {
//   avatar: string;
//   tier: keyof typeof TIER_CONFIG;
// }) {
//   const cfg = TIER_CONFIG[tier];
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.6 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//       className="relative flex-shrink-0"
//     >
//       {/* Ring décoratif tier */}
//       <span
//         className="absolute -inset-1 rounded-full"
//         style={{ background: cfg.gradient, opacity: 0.6 }}
//         aria-hidden
//       />
//       <div
//         className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
//         style={{ background: cfg.gradient }}
//       >
//         {avatar}
//       </div>
//     </motion.div>
//   );
// }

// /* -------------------------------------------------------------
//    SOUS-COMPOSANT : ProgressDots — indicateur de slide actif
//    ------------------------------------------------------------- */
// function ProgressDots({
//   total,
//   active,
//   onSelect,
// }: {
//   total: number;
//   active: number;
//   onSelect: (i: number) => void;
// }) {
//   return (
//     <div className="flex items-center gap-2.5" role="tablist" aria-label="Navigation témoignages">
//       {Array.from({ length: total }).map((_, i) => (
//         <button
//           key={i}
//           type="button"
//           role="tab"
//           aria-selected={i === active}
//           aria-label={`Témoignage ${i + 1}`}
//           onClick={() => onSelect(i)}
//           className="relative flex h-2 items-center focus-visible:outline-none"
//         >
//           <motion.span
//             className="block h-[3px] rounded-full"
//             animate={{
//               width: i === active ? 28 : 8,
//               backgroundColor: i === active ? "#c9a96e" : "#e5e0d5",
//             }}
//             transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }

// /* -------------------------------------------------------------
//    COMPOSANT PRINCIPAL
//    ------------------------------------------------------------- */
// export default function TestimonialsSection() {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const prefersReducedMotion = useReducedMotion();
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   /* Auto-avance toutes les 6 secondes */
//   const startAutoplay = useCallback(() => {
//     intervalRef.current = setInterval(() => {
//       setDirection(1);
//       setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
//     }, 6000);
//   }, []);

//   useEffect(() => {
//     if (!prefersReducedMotion) startAutoplay();
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [prefersReducedMotion, startAutoplay]);

//   /* Réinitialise l'autoplay à chaque interaction manuelle */
//   const resetAutoplay = useCallback(() => {
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     if (!prefersReducedMotion) startAutoplay();
//   }, [prefersReducedMotion, startAutoplay]);

//   /* Fonctions de navigation — noms d'origine conservés */
//   const nextTestimonial = useCallback(() => {
//     setDirection(1);
//     setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
//     resetAutoplay();
//   }, [resetAutoplay]);

//   const prevTestimonial = useCallback(() => {
//     setDirection(-1);
//     setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
//     resetAutoplay();
//   }, [resetAutoplay]);

//   const current = TESTIMONIALS[activeIndex];
//   const tierCfg = TIER_CONFIG[current.tier];

//   return (
//     <section
//       className="relative overflow-hidden bg-surface/30 py-20 lg:py-32"
//       aria-labelledby="testimonials-heading"
//     >
//       {/* -- Grain de texture subtil -- */}
//       <div
//         className="pointer-events-none absolute inset-0 opacity-[0.02]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
//           backgroundSize: "200px 200px",
//         }}
//         aria-hidden
//       />

//       {/* -- Halo doré ambiant centré -- */}
//       <div
//         className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-[0.03]"
//         style={{ background: "radial-gradient(circle, #c9a96e 0%, transparent 70%)" }}
//         aria-hidden
//       />

//       <div className="relative mx-auto max-w-[var(--content-max-width,1200px)] px-[var(--spacing-page-x,1.5rem)]">

//         {/* -- En-tête -- */}
//         <motion.div
//           initial={{ opacity: 0, y: 24 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//           className="mb-16 text-center"
//         >
//           {/* Séparateur doré décoratif */}
//           <div className="mx-auto mb-5 flex items-center justify-center gap-3">
//             <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c9a96e]" />
//             <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
//               Témoignages
//             </span>
//             <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c9a96e]" />
//           </div>

//           <h2
//             id="testimonials-heading"
//             className="font-display text-3xl font-bold tracking-tight text-[#0a0a0a] lg:text-5xl"
//           >
//             Ce que disent{" "}
//             <span className="italic text-[#c9a96e]">nos clients</span>
//           </h2>
//         </motion.div>

//         {/* -- Carousel principal -- */}
//         <div className="relative mx-auto max-w-3xl">

//           {/* Carte témoignage */}
//           <div className="relative overflow-hidden rounded-3xl">

//             {/* Bordure tier animée */}
//             <motion.div
//               className="absolute inset-0 rounded-3xl"
//               animate={{ opacity: [0.2, 0.5, 0.2] }}
//               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//               style={{
//                 background: `linear-gradient(135deg, transparent 0%, ${tierCfg.glow} 50%, transparent 100%)`,
//                 padding: "1px",
//               }}
//               aria-hidden
//             />

//             <AnimatePresence mode="wait" custom={direction}>
//               <motion.article
//                 key={current.id}
//                 custom={direction}
//                 variants={prefersReducedMotion ? {} : SLIDE_VARIANTS}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 className="relative z-10 rounded-3xl border border-[#e5e0d5] bg-white p-8 sm:p-12"
//                 style={{ boxShadow: `0 20px 40px -10px rgba(0,0,0,0.05), 0 0 0 1px #e5e0d5` }}
//               >
//                 {/* Guillemet décoratif */}
//                 <div
//                   className="absolute right-8 top-8 select-none font-display text-[120px] leading-none text-[#c9a96e] opacity-[0.08]"
//                   aria-hidden
//                 >
//                   "
//                 </div>

//                 {/* Étoiles */}
//                 <StarRating rating={current.rating} />

//                 {/* Citation */}
//                 <motion.blockquote
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//                   className="relative mt-6 font-display text-xl font-light leading-[1.7] text-[#222222] sm:text-2xl"
//                 >
//                   &ldquo;{current.comment}&rdquo;
//                 </motion.blockquote>

//                 {/* Ligne séparatrice */}
//                 <motion.div
//                   initial={{ scaleX: 0 }}
//                   animate={{ scaleX: 1 }}
//                   transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//                   className="mt-8 h-px origin-left bg-gradient-to-r from-[#c9a96e]/40 via-[#c9a96e]/10 to-transparent"
//                 />

//                 {/* Auteur */}
//                 <div className="mt-6 flex flex-wrap items-center gap-4">
//                   <AvatarCircle avatar={current.avatar} tier={current.tier} />

//                   <div className="min-w-0 flex-1">
//                     <motion.p
//                       initial={{ opacity: 0, x: -8 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.2, duration: 0.45 }}
//                       className="font-semibold text-[#0a0a0a]"
//                     >
//                       {current.name}
//                     </motion.p>
//                     <motion.p
//                       initial={{ opacity: 0, x: -8 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.26, duration: 0.45 }}
//                       className="text-sm text-[#777777]"
//                     >
//                       {current.location}
//                     </motion.p>
//                   </div>

//                   <TierBadge tier={current.tier} />
//                 </div>
//               </motion.article>
//             </AnimatePresence>
//           </div>

//           {/* -- Contrôles de navigation -- */}
//           <div className="mt-8 flex items-center justify-between">

//             {/* Bouton précédent */}
//             <motion.button
//               type="button"
//               onClick={prevTestimonial}
//               whileHover={{ scale: 1.08 }}
//               whileTap={{ scale: 0.95 }}
//               className={cn(
//                 "flex h-11 w-11 items-center justify-center rounded-full",
//                 "border border-[#e0dcd0] bg-white text-[#555555]",
//                 "transition-colors duration-200",
//                 "hover:border-[#c9a96e]/60 hover:text-[#c9a96e]",
//                 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50",
//               )}
//               aria-label="Témoignage précédent"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </motion.button>

//             {/* Dots de progression */}
//             <ProgressDots
//               total={TESTIMONIALS.length}
//               active={activeIndex}
//               onSelect={(i) => {
//                 setDirection(i > activeIndex ? 1 : -1);
//                 setActiveIndex(i);
//                 resetAutoplay();
//               }}
//             />

//             {/* Bouton suivant */}
//             <motion.button
//               type="button"
//               onClick={nextTestimonial}
//               whileHover={{ scale: 1.08 }}
//               whileTap={{ scale: 0.95 }}
//               className={cn(
//                 "flex h-11 w-11 items-center justify-center rounded-full",
//                 "border border-[#e0dcd0] bg-white text-[#555555]",
//                 "transition-colors duration-200",
//                 "hover:border-[#c9a96e]/60 hover:text-[#c9a96e]",
//                 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/50",
//               )}
//               aria-label="Témoignage suivant"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </motion.button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }