


/**
 * LoyaltyTiersGrid.tsx
 * -----------------------------------------------------------------------------
 * Grille visuelle de tous les paliers de fidélité disponibles — version premium.
 *
 * Direction artistique :
 *   La fidélité est un parcours de distinction. On emprunte l'esthétique de la
 *   haute joaillerie : surfaces sobres, matières précieuses suggérées par la
 *   lumière plutôt qu'exhibées, typographie d'envergure.
 *
 *   Signature visuelle — le risque délibéré de ce composant :
 *   Un faisceau lumineux (shimmer beam) balaie diagonalement la carte du grade
 *   actuel une seule fois au montage, comme la lumière qui accroche une pierre
 *   taillée. Ce micro-moment de révélation est propre à l'univers des gemmes —
 *   il ne peut pas appartenir à un autre composant.
 *
 * Ce qui reste strictement inchangé par rapport à la version d'origine :
 *   - Toutes les props (tiers, currentTierName, currentPoints)
 *   - Toutes les fonctions utilitaires (formatPoints, formatAmount)
 *   - La map TIER_ICONS et la logique de dérivation des états
 *   - L'import de getTierConfig et des types
 *   - La structure du composant principal LoyaltyTiersGrid (grille sortedTiers)
 *
 * @module app/customer/fidelites/components/LoyaltyTiersGrid
 */

"use client";

import React, { useId, useState } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import {
  Medal,
  Star,
  Crown,
  Gem,
  Award,
  CheckCircle2,
  Lock,
  TrendingUp,
  Zap,
  LayoutGrid,
  List,
} from "lucide-react";
import type { Tier } from "@/modeles/fidelites";
import { getTierConfig } from "@/modeles/fidelites";

/* -- Jetons de design premium (partagés avec CommandesClient) ------------- */

/** Vert forêt de marque — couleur primaire de l'écosystème Kalvin. */
const BRAND_FOREST = "#1f4d3f";

/**
 * Or champagne — accent de précision.
 * Réservé au badge "Mon grade" et aux détails de finition.
 * Ne doit jamais servir à remplir de larges surfaces.
 */
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_SOFT = "rgba(201,168,118,0.14)";

/* -- Map des icônes de palier ---------------------------------------------- */
const TIER_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Bronze: Medal,
  Silver: Star,
  Gold: Crown,
  Platinum: Gem,
  Diamond: Star,
};

/* -- Utilitaires (identiques à la version d'origine) --------------------- */

function formatPoints(pts: number): string {
  return new Intl.NumberFormat("fr-FR").format(pts);
}

function formatAmount(amount: string): string {
  const num = parseFloat(amount || "0");
  if (isNaN(num)) return "0 FCFA";
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " FCFA"
  );
}

/* -- Variants d'animation partagés --------------------------------------- */

/**
 * Conteneur de la grille : orchestre l'apparition en cascade des cartes.
 * staggerChildren garantit que les cartes s'ouvrent l'une après l'autre,
 * pas toutes en même temps — c'est ce qui crée le sentiment de défilé.
 */
const gridContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

/** Variant de chaque carte : glissement vertical + fondu. */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* -- Props ---------------------------------------------------------------- */
interface LoyaltyTiersGridProps {
  tiers: Tier[];
  currentTierName: string;
  currentPoints: number;
}

/**
 * LoyaltyTiersGrid
 *
 * Grille des paliers de fidélité avec :
 *   - Révélation en cascade orchestrée (stagger)
 *   - Shimmer beam sur le grade actuel (signature visuelle)
 *   - Barre de progression enrichie pour les paliers verrouillés
 *   - Mise en exergue du grade courant via un halo et un badge or
 */
export default function LoyaltyTiersGrid({
  tiers,
  currentTierName,
  currentPoints,
}: LoyaltyTiersGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);

  return (
    <section aria-label="Paliers de fidélité">
      {/* En-tête de section — copy soignée, hiérarchie typographique marquée */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p
            className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: BRAND_GOLD }}
          >
            Programme exclusif
          </p>
          <h2
            className="text-[18px] font-black tracking-tight"
            style={{ color: "#1f241c" }}
          >
            Votre parcours de fidélité
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: "#8A9080" }}>
            Chaque achat vous rapproche d'avantages plus précieux.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E8E3D8] bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center cursor-pointer justify-center rounded-md p-1.5 transition-all ${viewMode === 'grid'
                ? 'bg-[#F2EFE8] text-[#1f4d3f]'
                : 'text-[#8A9080] hover:text-[#1f4d3f]'
              }`}
            aria-label="Vue grille"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center cursor-pointer justify-center rounded-md p-1.5 transition-all ${viewMode === 'list'
                ? 'bg-[#F2EFE8] text-[#1f4d3f]'
                : 'text-[#8A9080] hover:text-[#1f4d3f]'
              }`}
            aria-label="Vue liste"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grille des cartes — cascade orchestrée via staggerChildren */}
      <motion.div
        layout
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className={
          viewMode === 'grid'
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {sortedTiers.map((tier, idx) => {
          const cfg = getTierConfig(tier.name);
          const TierIcon = TIER_ICONS[tier.name] ?? Award;
          const isCurrentTier = tier.name === currentTierName;
          const isUnlocked = currentPoints >= tier.min_points;
          const discountPercent = parseFloat(tier.discount_percent || "0");

          return (
            <TierCard
              key={tier.id}
              tier={tier}
              idx={idx}
              cfg={cfg}
              TierIcon={TierIcon}
              isCurrentTier={isCurrentTier}
              isUnlocked={isUnlocked}
              discountPercent={discountPercent}
              currentPoints={currentPoints}
              totalTiers={sortedTiers.length}
              viewMode={viewMode}
            />
          );
        })}
      </motion.div>
    </section>
  );
}

/* -- Sous-composant TierCard ---------------------------------------------- */

/**
 * Props internes de la carte d'un palier.
 * Extraire la carte dans un sous-composant permet :
 *   1. d'y isoler le `useId` pour le shimmer SVG (qui doit être unique par carte)
 *   2. de garder le rendu du composant principal lisible
 *   3. de `React.memo`-ïser facilement à terme si la liste est longue
 */
interface TierCardProps {
  tier: Tier;
  idx: number;
  cfg: ReturnType<typeof getTierConfig>;
  TierIcon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  isCurrentTier: boolean;
  isUnlocked: boolean;
  discountPercent: number;
  currentPoints: number;
  totalTiers: number;
  viewMode: 'grid' | 'list';
}

/**
 * TierCard
 *
 * Carte individuelle d'un palier. Les trois états visuels sont distincts :
 *   - "unlocked"      → couleur de palier active, icône colorée
 *   - "current"       → tout le précédent + halo de bordure + shimmer beam
 *   - "locked"        → surface monochromatique, icône verrou, barre de progression
 */
function TierCard({
  tier,
  idx,
  cfg,
  TierIcon,
  isCurrentTier,
  isUnlocked,
  discountPercent,
  currentPoints,
  totalTiers,
  viewMode,
}: TierCardProps) {
  const prefersReducedMotion = useReducedMotion();

  /**
   * Identifiant unique par carte — nécessaire pour le gradient SVG du shimmer.
   * useId garantit la stabilité SSR/hydratation.
   */
  const shimmerGradientId = `shimmer-grad-${useId().replace(/:/g, "")}`;

  /** Avancement en % vers ce palier (plafonné à 100). */
  const progressPercent = Math.min(100, Math.round((currentPoints / tier.min_points) * 100));

  /** Points manquants pour atteindre ce palier. */
  const pointsNeeded = Math.max(0, tier.min_points - currentPoints);

  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover={
        prefersReducedMotion
          ? {}
          : { y: -4, boxShadow: `0 16px 40px -8px ${isCurrentTier ? cfg.color + "30" : "rgba(0,0,0,0.12)"}` }
      }
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border bg-white"
      style={{
        borderColor: isCurrentTier ? cfg.color + "55" : "#E8E3D8",
        boxShadow: isCurrentTier
          ? `0 0 0 2.5px ${cfg.color}22, 0 8px 28px -6px ${cfg.color}28`
          : "0 2px 12px -4px rgba(0,0,0,0.06)",
      }}
    >
      {/* --------------------------------------------------------------------
       *  Barre supérieure — "lisseuse" chromatique du palier.
       *  Sur un palier verrouillé, elle reste neutre (warm grey) pour
       *  signifier l'inaccessibilité sans être agressive.
       * ------------------------------------------------------------------- */}
      <div
        className="h-1.5 w-full"
        style={{
          background: isUnlocked
            ? `linear-gradient(90deg, ${cfg.color}55, ${cfg.color}, ${cfg.color}55)`
            : "linear-gradient(90deg, #E8E3D8, #D4CFC5, #E8E3D8)",
        }}
      />

      {/* --------------------------------------------------------------------
       *  Shimmer beam — signature visuelle du grade actuel.
       *
       *  Un SVG transparent (position:absolute, inset-0) contient un
       *  rectangle rempli d'un gradient linéaire diagonal très doux.
       *  Une animation CSS (keyframes injectée via <style>) déplace ce
       *  rectangle de gauche à droite une seule fois au montage.
       *
       *  Justification du choix :
       *    Emprunter la métaphore de la lumière sur une pierre taillée est
       *    spécifique à l'univers joaillier de ce composant. Sur n'importe
       *    quel autre composant, ce serait hors-sujet. Ici, c'est juste.
       *
       *  Respect de prefers-reduced-motion : l'animation n'est appliquée
       *  que si prefersReducedMotion est false.
       * ------------------------------------------------------------------- */}
      {isCurrentTier && !prefersReducedMotion && (
        <>
          <style>{`
            @keyframes shimmer-sweep-${idx} {
              0%   { transform: translateX(-110%); }
              100% { transform: translateX(210%); }
            }
          `}</style>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            style={{ zIndex: 1 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "translateX(-110%)",
                animation: `shimmer-sweep-${idx} 1.4s cubic-bezier(0.22,1,0.36,1) 0.6s 1 forwards`,
                background: `linear-gradient(
                  105deg,
                  transparent 35%,
                  rgba(255,255,255,0.22) 48%,
                  rgba(255,255,255,0.38) 52%,
                  transparent 65%
                )`,
              }}
            />
          </div>
        </>
      )}

      {/* --------------------------------------------------------------------
       *  Badge "Mon grade" — or champagne, position absolue en haut à droite.
       *  N'apparaît que sur le palier courant.
       * ------------------------------------------------------------------- */}
      {isCurrentTier && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.35 }}
          className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{
            background: BRAND_GOLD_SOFT,
            color: BRAND_GOLD,
            border: `1px solid ${BRAND_GOLD}30`,
          }}
        >
          <CheckCircle2 className="h-2.5 w-2.5" />
          Mon grade
        </motion.div>
      )}

      {/* --------------------------------------------------------------------
       *  Corps de la carte (Basé sur le viewMode)
       * ------------------------------------------------------------------- */}
      {viewMode === 'list' ? (
        <div className="relative z-[2] p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          {/* Left section: Icon + Info */}
          <div className="flex items-center gap-5 min-w-[220px]">
            <TierIconFrame
              TierIcon={TierIcon}
              isUnlocked={isUnlocked}
              isCurrentTier={isCurrentTier}
              cfg={cfg}
              prefersReducedMotion={!!prefersReducedMotion}
            />
            <div>
              <p
                className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: isUnlocked ? cfg.color + "80" : "#C4BFB6" }}
              >
                Niveau {String(idx + 1).padStart(2, "0")}
              </p>
              <h3
                className="text-[20px] font-black tracking-tight leading-none"
                style={{ color: isUnlocked ? cfg.color : "#C4BFB6" }}
              >
                {tier.name}
              </h3>
              <p className="mt-1.5 text-[12px]" style={{ color: "#8A9080" }}>
                À partir de{" "}
                <span className="font-bold" style={{ color: isUnlocked ? "#4A5540" : "#C4BFB6" }}>
                  {formatPoints(tier.min_points)} pts
                </span>
              </p>
            </div>
          </div>

          {/* Middle section: Benefits */}
          <div className="hidden md:flex flex-col justify-center gap-2 flex-1 min-w-[180px]">
            {discountPercent > 0 && (
              <TierBenefit
                label="Réduction"
                value={`−${discountPercent} %`}
                valueColor={isUnlocked ? cfg.color : "#C4BFB6"}
                icon={Zap}
              />
            )}
            <TierBenefit
              label="Solde requis"
              value={formatAmount(tier.min_solde)}
              valueColor={isUnlocked ? "#4A5540" : "#C4BFB6"}
            />
          </div>

          {/* Right section: Progress / Current Tier Status */}
          <div className="w-full md:w-auto md:min-w-[220px] flex flex-col justify-center">
            {!isUnlocked && (
              <ProgressToTier
                progressPercent={progressPercent}
                pointsNeeded={pointsNeeded}
                tierColor={cfg.color}
                idx={idx}
                prefersReducedMotion={!!prefersReducedMotion}
                className="mt-0"
              />
            )}
            {isCurrentTier && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 md:ml-auto w-full md:w-auto mt-2 md:mt-0"
                style={{ background: cfg.color + "0d", border: `1px solid ${cfg.color}22` }}
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                <span className="text-[11.5px] font-semibold" style={{ color: cfg.color }}>
                  Vous avez {formatPoints(currentPoints)} pts
                </span>
              </motion.div>
            )}
          </div>

          {/* Mobile Benefits (Visible only on small screens) */}
          <div className="md:hidden flex flex-col gap-2 mt-2 pt-4 border-t border-[#F2EFE8]">
            {discountPercent > 0 && (
              <TierBenefit
                label="Réduction"
                value={`−${discountPercent} %`}
                valueColor={isUnlocked ? cfg.color : "#C4BFB6"}
                icon={Zap}
              />
            )}
            <TierBenefit
              label="Solde requis"
              value={formatAmount(tier.min_solde)}
              valueColor={isUnlocked ? "#4A5540" : "#C4BFB6"}
            />
          </div>
        </div>
      ) : (
        <div className="relative z-[2] p-5 sm:p-6">
          {/* Rang ordinal discret — encodage de la séquence, justifié car les
           *  paliers SONT une hiérarchie ordonnée. Taille 10px, texte neutre. */}
          <p
            className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: isUnlocked ? cfg.color + "80" : "#C4BFB6" }}
          >
            Niveau {String(idx + 1).padStart(2, "0")}
          </p>

          {/* Icône du palier dans un "châton" joaillier */}
          <TierIconFrame
            TierIcon={TierIcon}
            isUnlocked={isUnlocked}
            isCurrentTier={isCurrentTier}
            cfg={cfg}
            prefersReducedMotion={!!prefersReducedMotion}
          />

          {/* Nom du palier — titre "marchandise" de la carte */}
          <h3
            className="mt-4 text-[22px] font-black tracking-tight leading-none"
            style={{ color: isUnlocked ? cfg.color : "#C4BFB6" }}
          >
            {tier.name}
          </h3>

          {/* Seuil d'entrée */}
          <p className="mt-1.5 text-[12px]" style={{ color: "#8A9080" }}>
            À partir de{" "}
            <span className="font-bold" style={{ color: isUnlocked ? "#4A5540" : "#C4BFB6" }}>
              {formatPoints(tier.min_points)} pts
            </span>
          </p>

          {/* Séparateur — hairline warm */}
          <div className="my-4 h-px" style={{ background: "#F2EFE8" }} />

          {/* Avantages */}
          <div className="space-y-2.5">
            {/* Réduction — affiché uniquement si > 0 */}
            {discountPercent > 0 && (
              <TierBenefit
                label="Réduction sur vos achats"
                value={`−${discountPercent} %`}
                valueColor={isUnlocked ? cfg.color : "#C4BFB6"}
                icon={Zap}
              />
            )}

            {/* Solde minimum requis */}
            <TierBenefit
              label="Solde requis"
              value={formatAmount(tier.min_solde)}
              valueColor={isUnlocked ? "#4A5540" : "#C4BFB6"}
            />
          </div>

          {/* Barre de progression vers ce palier */}
          {!isUnlocked && (
            <ProgressToTier
              progressPercent={progressPercent}
              pointsNeeded={pointsNeeded}
              tierColor={cfg.color}
              idx={idx}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          )}

          {/* Indicateur "Grade actuel" en bas de carte — complément du badge */}
          {isCurrentTier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-5 flex items-center gap-1.5 rounded-xl px-3 py-2.5"
              style={{ background: cfg.color + "0d", border: `1px solid ${cfg.color}22` }}
            >
              <TrendingUp className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
              <span className="text-[11.5px] font-semibold" style={{ color: cfg.color }}>
                Vous avez {formatPoints(currentPoints)} points
              </span>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* -- Sous-composant TierIconFrame ----------------------------------------- */

/**
 * Châton joaillier qui encadre l'icône de chaque palier.
 *
 * Sur un palier débloqué : fond dégradé en couleur du palier, icône colorée,
 * légère rotation au survol (comme tourner un bijou pour qu'il accroche la lumière).
 * Sur un palier verrouillé : fond neutre, icône verrou monochromatique.
 */
function TierIconFrame({
  TierIcon,
  isUnlocked,
  isCurrentTier,
  cfg,
  prefersReducedMotion,
}: {
  TierIcon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  isUnlocked: boolean;
  isCurrentTier: boolean;
  cfg: ReturnType<typeof getTierConfig>;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.div
      whileHover={
        prefersReducedMotion
          ? {}
          : isUnlocked
            ? { rotate: 45 + 12, scale: 1.15 }
            : { rotate: [45, 41, 49, 45] } // léger tremblement = "pas encore"
      }
      initial={{ rotate: 45 }}
      animate={{ rotate: 45 }}
      transition={
        isUnlocked
          ? { type: "spring", stiffness: 400, damping: 15 }
          : { duration: 0.35, ease: "easeInOut" }
      }
      className="flex h-16 w-16 items-center justify-center rounded-[14px]"
      style={{
        background: isUnlocked
          ? `linear-gradient(135deg, ${cfg.color}35 0%, ${cfg.color}08 100%)`
          : "rgba(0,0,0,0.03)",
        border: `1.5px solid ${isUnlocked ? cfg.color + "80" : "#E8E3D8"}`,
        boxShadow: isCurrentTier
          ? `0 0 25px ${cfg.color}55, inset 0 2px 10px rgba(255,255,255,0.9)`
          : "inset 0 2px 5px rgba(255,255,255,0.6)",
      }}
    >
      <div style={{ transform: "rotate(-45deg)" }} className="flex items-center justify-center">
        {isUnlocked ? (
          <TierIcon
            className="h-7 w-7"
            style={{ 
              color: isCurrentTier ? cfg.color : cfg.color,
              filter: `drop-shadow(0 2px 4px ${cfg.color}66)`
            }}
            strokeWidth={1.75}
          />
        ) : (
          <Lock className="h-6 w-6" style={{ color: "#C4BFB6" }} strokeWidth={1.75} />
        )}
      </div>
    </motion.div>
  );
}

/* -- Sous-composant TierBenefit ------------------------------------------- */

/**
 * Ligne d'avantage : label à gauche, valeur à droite.
 * Le séparateur est une ligne pointillée légère plutôt qu'une règle pleine —
 * détail de joaillier qui allège l'espace sans perdre la lisibilité tabulaire.
 */
function TierBenefit({
  label,
  value,
  valueColor,
  icon: Icon,
}: {
  label: string;
  value: string;
  valueColor: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 shrink-0" style={{ color: valueColor }} />}
        <span className="truncate text-[12px]" style={{ color: "#8A9080" }}>
          {label}
        </span>
      </div>
      {/* Trait pointillé flexible — occupe l'espace disponible */}
      <div
        className="mx-1 min-w-[20px] flex-1 border-b border-dashed"
        style={{ borderColor: "#E8E3D8" }}
        aria-hidden
      />
      <span className="shrink-0 text-[13px] font-black" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

/* -- Sous-composant ProgressToTier ---------------------------------------- */

/**
 * Indicateur de progression vers un palier verrouillé.
 *
 * Enrichissements par rapport à la version d'origine :
 *   - Affichage du nombre de points manquants (pas uniquement le %)
 *   - Dégradé de la barre : warm grey → couleur du palier cible
 *   - Micro-label d'encouragement (ex : « Encore 1 200 pts »)
 */
function ProgressToTier({
  progressPercent,
  pointsNeeded,
  tierColor,
  idx,
  prefersReducedMotion,
  className = "mt-5",
}: {
  progressPercent: number;
  pointsNeeded: number;
  tierColor: string;
  idx: number;
  prefersReducedMotion: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Ligne méta : label + points manquants */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "#8A9080" }}>
          Progression
        </span>
        <span className="text-[10.5px] font-bold" style={{ color: "#8A9080" }}>
          {pointsNeeded > 0
            ? `Encore ${formatPoints(pointsNeeded)} pts`
            : `${progressPercent} %`}
        </span>
      </div>

      {/* Rail + barre animée */}
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "#F2EFE8" }}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={prefersReducedMotion ? false : { width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.1,
            ease: [0.22, 1, 0.36, 1],
            delay: prefersReducedMotion ? 0 : idx * 0.1 + 0.4,
          }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #D4CFC5, ${tierColor}90)`,
          }}
        />
      </div>
    </div>
  );
}