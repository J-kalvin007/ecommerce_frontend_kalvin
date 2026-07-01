






"use client";

/**
 * FeaturesSection — Redesign luxe ultra-premium
 *
 * Architecture :
 *  - Fond ivoire chaud #fbf7e8 conservé, enrichi d'un grain subtil
 *  - Chaque card révèle un accent doré sur le bord gauche au hover
 *  - Icône principale avec halo coloré par feature
 *  - Stagger d'entrée orchestré (delay progressif par index)
 *  - Counter animé sur le titre de section (ligne dorée qui se dessine)
 *  - Décoration de fond épurée — 3 éléments max, bien positionnés
 *  - Responsive : 1 col mobile → 2 col tablette → 3 col desktop
 *
 * Variables & fonctions originales conservées intégralement.
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  Wallet,
  Star,
  ShoppingBag,
  Globe,
  Headphones,
  RefreshCw,
  Apple,
  Leaf,
  Rabbit,
  Cherry,
  Flower2,
  Bird,
} from "lucide-react";

/* -------------------------------------------------------------
   DONNÉES — structure d'origine conservée
   ------------------------------------------------------------- */
const FEATURES = [
  {
    icon: Wallet,
    title: "Portefeuille Intégré",
    description:
      "Rechargez votre wallet via carte bancaire ou Mobile Money. Payez instantanément vos commandes sans friction.",
    iconColor: "text-primary",
    accentColor: "#c9a96e",   // or
    bgIcon: <Cherry className="absolute -bottom-3 -right-3 h-16 w-16 text-rose-200/50" />,
  },
  {
    icon: Star,
    title: "Programme de Fidélité",
    description:
      "Gagnez des points à chaque achat. Montez en palier : Bronze → Argent → Or → Platine.",
    iconColor: "text-highlight",
    accentColor: "#6db87a",   // vert
    bgIcon: <Flower2 className="absolute -top-3 -left-3 h-14 w-14 text-emerald-200/55" />,
  },
  {
    icon: ShoppingBag,
    title: "Checkout Express",
    description:
      "Commandez en tant qu'invité ou avec votre compte. 3 étapes et c'est validé — aucune friction.",
    iconColor: "text-emerald-500",
    accentColor: "#3b9e6b",   // émeraude
    bgIcon: <Rabbit className="absolute -bottom-2 -right-2 h-14 w-14 text-highlight/18" />,
  },
  {
    icon: Globe,
    title: "Livraison Mondiale",
    description:
      "Présents dans plus de 120 pays. Suivi en temps réel avec DHL, FedEx et Colissimo.",
    iconColor: "text-blue-500",
    accentColor: "#4a90d9",   // bleu
    bgIcon: <Apple className="absolute -top-3 -right-3 h-14 w-14 text-pink-200/55" />,
  },
  {
    icon: Headphones,
    title: "Support 24 / 7",
    description:
      "Une équipe dédiée répond à vos questions. Chat, e-mail et téléphone, à toute heure.",
    iconColor: "text-purple-500",
    accentColor: "#9370d8",   // violet
    bgIcon: <Leaf className="absolute -bottom-3 -left-3 h-14 w-14 text-green-200/55" />,
  },
  {
    icon: RefreshCw,
    title: "Retours Simplifiés",
    description:
      "Pas satisfait ? Retour gratuit sous 30 jours. Remboursement immédiat sur votre wallet.",
    iconColor: "text-rose-500",
    accentColor: "#e05a6a",   // rose
    bgIcon: <Bird className="absolute -top-2 -right-2 h-14 w-14 text-sky-200/55" />,
  },
] as const;

/* -------------------------------------------------------------
   DÉCORATION DE FOND — seulement 4 éléments, bien espacés
   ------------------------------------------------------------- */
const BG_DECORATIONS = [
  { Icon: Apple, cls: "left-6 top-20 h-9 w-9 rotate-12 text-rose-200/40" },
  { Icon: Leaf, cls: "right-8 bottom-28 h-11 w-11 -rotate-6 text-emerald-200/40" },
  { Icon: Rabbit, cls: "bottom-8 left-1/3 h-12 w-12 text-amber-200/25" },
  { Icon: Flower2, cls: "right-1/4 top-36 h-8 w-8 text-purple-200/40" },
] as const;

/* -------------------------------------------------------------
   SOUS-COMPOSANT : FeatureCard
   ------------------------------------------------------------- */
interface FeatureCardProps {
  feature: (typeof FEATURES)[number];
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: prefersReducedMotion ? 0 : index * 0.09,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={prefersReducedMotion ? {} : { y: -6, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className="group relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Bord gauche doré — révélé au hover */}
      <motion.span
        className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl origin-bottom"
        style={{ background: `linear-gradient(to top, ${feature.accentColor}cc, ${feature.accentColor}22)` }}
        initial={{ scaleY: 0 }}
        whileHover={{ scaleY: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />

      {/* Icône décorative de fond */}
      <div aria-hidden>{feature.bgIcon}</div>

      {/* Icône principale + titre */}
      <div className="relative z-10 flex items-start justify-between">
        <h3 className="pr-4 text-[17px] font-semibold leading-snug text-gray-900">
          {feature.title}
        </h3>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${feature.accentColor}14` }}
        >
          <feature.icon
            className={`h-5 w-5 ${feature.iconColor}`}
            aria-hidden
          />
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 mt-4 text-[14px] leading-relaxed text-gray-500">
        {feature.description}
      </p>

      {/* Trait décoratif qui s'étend au hover */}
      <motion.div
        className="relative z-10 mt-5 h-[2px] rounded-full origin-left"
        style={{ background: `linear-gradient(to right, ${feature.accentColor}55, ${feature.accentColor}11)` }}
        initial={{ width: "2.5rem" }}
        whileHover={{ width: "4rem" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
    </motion.article>
  );
}

/* -------------------------------------------------------------
   COMPOSANT PRINCIPAL
   ------------------------------------------------------------- */
export default function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#fbf7e8] py-20 lg:py-28"
      aria-labelledby="features-heading"
    >
      {/* -- Décoration de fond épurée -- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {BG_DECORATIONS.map(({ Icon, cls }, i) => (
          <Icon key={i} className={`absolute ${cls}`} />
        ))}
      </div>

      {/* -- Halo ivoire chaud centré en haut -- */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-[700px] opacity-50"
        style={{ background: "radial-gradient(ellipse at top, #e8d9b8 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* -- En-tête -- */}
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
              Pourquoi Atelier du Terroir
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a96e]" />
          </div>

          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Une expérience{" "}
            <span className="relative inline-block">
              <span className="text-[#c9a96e]">d&apos;exception</span>
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
            Plus qu&apos;une boutique en ligne, un écosystème complet pour les amoureux du terroir.
          </p>
        </motion.div>

        {/* -- Grille de features -- */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}