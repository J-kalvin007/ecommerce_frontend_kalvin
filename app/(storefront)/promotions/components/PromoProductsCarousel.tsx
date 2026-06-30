



/**
 * @file PromoProductsCarousel.tsx
 * @description Carrousel promotionnel ultra-premium — édition luxe.
 *
 * Architecture :
 *  ┌─ PromoProductsCarousel  (orchestrateur état + rendu adaptatif)
 *  │   ├─ MobileCarousel      (scroll-snap natif, une carte centrée)
 *  │   ├─ DesktopCoverflow    (coverflow Framer Motion, swipe souris)
 *  │   └─ PaginationDots      (dots animés communs mobile + desktop)
 *  │
 *  └─ Hooks internes
 *      ├─ useIsMobile         (breakpoint 640px, ResizeObserver)
 *      └─ useAutoPlay         (rotation automatique avec pause au survol)
 *
 * Design tokens :
 *  --forest-deep   : #0D2E1E   (fond principal)
 *  --jade-glow     : #2F9E6F   (accentuation verte)
 *  --champagne     : #F5E6C8   (texte lumineux)
 *  --ember         : #E8711A   (CTA / badges)
 *  --glass-border  : rgba(255,255,255,0.08)
 *
 * Principes d'implémentation :
 *  - Aucune dépendance externe ajoutée ; Framer Motion déjà présent
 *  - Tous les timings en constantes nommées pour faciliter l'ajustement
 *  - useCallback / useMemo sur tous les handlers pour éviter les re-renders
 *  - Accessibilité : rôle region, aria-live, aria-current, aria-labels
 *  - Performance : AnimatePresence mode="wait", layout animations
 *  - Responsive : mobile < 640px utilise le scroll natif (performant)
 */

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  type PanInfo,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PromoOfferCard } from "./CardProduitSolde";
import { PromoProductCard } from "./PromotionsPage";
import { cn } from "@/lib/utils";

/* ─── Constantes de configuration ────────────────────────────────────────── */

/** Seuil en pixels pour détecter un swipe intentionnel */
const SWIPE_THRESHOLD = 60;

/** Délai de l'auto-play (ms) */
const AUTOPLAY_DELAY = 4200;

/** Durée de la transition entre les layouts mobile/desktop (ms) */
const LAYOUT_TRANSITION_MS = 250;

/* ─── Types ───────────────────────────────────────────────────────────────── */

type PromoProductsCarouselProps = {
  items: PromoProductCard[];
  className?: string;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Hook : useIsMobile
   Détecte si l'écran est mobile (< 640px) via MediaQueryList.
═══════════════════════════════════════════════════════════════════════════ */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Hook : useAutoPlay
   Rotation automatique pausée au survol / focus.
═══════════════════════════════════════════════════════════════════════════ */
function useAutoPlay(
  goTo: (index: number) => void,
  activeIndex: number,
  count: number,
  enabled: boolean
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  const pause = useCallback(() => {
    isPaused.current = true;
  }, []);

  const resume = useCallback(() => {
    isPaused.current = false;
  }, []);

  useEffect(() => {
    if (!enabled || count <= 1) return;

    timerRef.current = setInterval(() => {
      if (!isPaused.current) {
        goTo(activeIndex + 1);
      }
    }, AUTOPLAY_DELAY);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, count, activeIndex, goTo]);

  return { pause, resume };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : NavigationArrow
   Flèche de navigation gauche / droite avec effet glassmorphism.
═══════════════════════════════════════════════════════════════════════════ */
function NavigationArrow({
  direction,
  onClick,
  ariaLabel,
}: {
  direction: "left" | "right";
  onClick: () => void;
  ariaLabel: string;
}) {
  const isLeft = direction === "left";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.1, y: -1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "absolute top-1/2 z-30 -translate-y-1/2",
        "inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full",
        "border transition-colors duration-200",
        isLeft ? "left-1" : "right-1"
      )}
      style={{
        // background: "rgba(13,46,30,0.75)",
        background: "rgba(13,46,30,0.75)",
        borderColor: "rgba(47,158,111,0.25)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
        color: "#ffff",
      }}
    >
      {isLeft ? (
        <ChevronLeft className="h-8 w-8" aria-hidden="true" />
      ) : (
        <ChevronRight className="h-8 w-8" aria-hidden="true" />
      )}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : PaginationDots
   Points de pagination animés — communs mobile + desktop.
═══════════════════════════════════════════════════════════════════════════ */
function PaginationDots({
  items,
  activeIndex,
  goTo,
}: {
  items: PromoProductCard[];
  activeIndex: number;
  goTo: (i: number) => void;
}) {
  return (
    <div
      className="mt-5 flex items-center justify-center gap-2"
      role="tablist"
      aria-label="Navigation entre les promotions"
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <motion.button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Afficher ${item.name}`}
            onClick={() => goTo(index)}
            animate={{
              width: isActive ? 28 : 8,
              opacity: isActive ? 1 : 0.38,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="h-2 rounded-full"
            style={{
              background: isActive
                ? "linear-gradient(90deg, #2F9E6F, #7EDBB4)"
                : "rgba(255,255,255,0.25)",
              boxShadow: isActive
                ? "0 0 8px rgba(47,158,111,0.6)"
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : MobileCarousel
   Scroll-snap natif — une carte centrée à la fois, performant sur mobile.
═══════════════════════════════════════════════════════════════════════════ */
function MobileCarousel({
  items,
  activeIndex,
  setActiveIndex,
}: {
  items: PromoProductCard[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  /* Synchronise le scroll quand activeIndex change via les dots */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[activeIndex] as HTMLElement | undefined;
    if (!child) return;

    isSyncing.current = true;
    child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

    // Relâche le verrou après la transition
    const timeout = setTimeout(() => {
      isSyncing.current = false;
    }, 600);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  /* Met à jour activeIndex lors du scroll utilisateur */
  const handleScroll = useCallback(() => {
    if (isSyncing.current) return;
    const el = scrollRef.current;
    if (!el) return;

    const center = el.scrollLeft + el.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement;
      const childCenter = c.offsetLeft + c.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  }, [setActiveIndex]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="list"
      aria-label="Offres promotionnelles"
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 pt-2"
      style={{
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        paddingLeft: "clamp(16px, 8vw, 32px)",
        paddingRight: "clamp(16px, 8vw, 32px)",
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="listitem"
          className="w-[min(80vw,320px)] flex-shrink-0 snap-center"
        >
          <PromoOfferCard
            item={item}
            index={index}
            disableEntrance
            dimmed={false}
          />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sous-composant : DesktopCoverflow
   Coverflow Framer Motion — carte active centrée, voisines partiellement
   visibles avec scale + blur, swipe souris et clavier supportés.
═══════════════════════════════════════════════════════════════════════════ */
function DesktopCoverflow({
  items,
  activeIndex,
  goTo,
}: {
  items: PromoProductCard[];
  activeIndex: number;
  goTo: (i: number) => void;
}) {
  const count = items.length;

  /**
   * Calcule l'offset circulaire d'une carte par rapport à la carte active.
   * Permet un carousel infini sans index négatif hors bornes.
   */
  const getOffset = useCallback(
    (index: number): number => {
      let offset = index - activeIndex;
      if (offset > count / 2) offset -= count;
      if (offset < -count / 2) offset += count;
      return offset;
    },
    [activeIndex, count]
  );

  /** Gestion du swipe souris via Framer Motion PanInfo */
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
      else if (info.offset.x > SWIPE_THRESHOLD) goTo(activeIndex - 1);
    },
    [activeIndex, goTo]
  );

  /** Gestion du clavier (←/→) pour l'accessibilité */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
    },
    [activeIndex, goTo]
  );

  return (
    <div
      className="relative select-none"
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Carousel des offres promotionnelles"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* ── Flèches de navigation ── */}
      {count > 1 && (
        <>

          <NavigationArrow
            direction="left"
            onClick={() => goTo(activeIndex - 1)}
            ariaLabel="Produit précédent"
          />

          <NavigationArrow
            direction="right"
            onClick={() => goTo(activeIndex + 1)}
            ariaLabel="Produit suivant"
          />

        </>
      )}

      {/* ── Piste des slides ── */}
      <motion.div
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.06}
        onDragEnd={handleDragEnd}
        className="flex cursor-grab items-end justify-center gap-4 overflow-visible px-16 py-8 active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
      >
        {items.map((item, index) => {
          const offset = getOffset(index);
          const isActive = offset === 0;
          const absOffset = Math.abs(offset);

          /* N'affiche que la carte active et ses voisines immédiates */
          if (absOffset > 1) return null;

          return (
            <motion.div
              key={item.id}
              layout
              animate={{
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : 0.55,
                y: isActive ? 0 : 24,
                filter: isActive ? "blur(0px) saturate(1)" : "blur(0.6px) saturate(0.8)",
                zIndex: isActive ? 20 : 10 - absOffset,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
                mass: 0.9,
              }}
              onClick={() => {
                if (!isActive) goTo(index);
              }}
              aria-current={isActive ? "true" : undefined}
              className="flex-shrink-0 cursor-pointer"
              style={{
                width: isActive ? 308 : 268,
              }}
            >
              <PromoOfferCard
                item={item}
                index={index}
                disableEntrance
                dimmed={!isActive}
              />

            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT PRINCIPAL : PromoProductsCarousel
   Orchestrateur : gère l'état actif, l'auto-play et le rendu adaptatif.
═══════════════════════════════════════════════════════════════════════════ */
export function PromoProductsCarousel({
  items,
  className,
}: PromoProductsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = items.length;
  const isMobile = useIsMobile();

  /** Navigation circulaire infinie */
  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count]
  );

  /** Remet à zéro si les items changent et que l'index dépasse les bornes */
  useEffect(() => {
    if (activeIndex >= count && count > 0) setActiveIndex(0);
  }, [activeIndex, count]);

  /** Auto-play avec pause au hover */
  const { pause, resume } = useAutoPlay(goTo, activeIndex, count, !isMobile);

  if (count === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      {/* ── Rendu conditionnel Mobile / Desktop ── */}
      <AnimatePresence mode="wait" initial={false}>
        {isMobile ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: LAYOUT_TRANSITION_MS / 1000 }}
          >
            <MobileCarousel
              items={items}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          </motion.div>
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: LAYOUT_TRANSITION_MS / 1000 }}
          >
            <DesktopCoverflow
              items={items}
              activeIndex={activeIndex}
              goTo={goTo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dots de pagination (communs mobile + desktop) ── */}
      {count > 1 && (
        <PaginationDots items={items} activeIndex={activeIndex} goTo={goTo} />
      )}
    </div>
  );
}