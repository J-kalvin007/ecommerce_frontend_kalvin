/**
 * @file PromoCodeUseButton.tsx
 * @description Carte / bouton de code promo ultra-premium edition luxe.
 *
 * Fonctionnalites :
 *  - Apparence de ticket (tirets decoratifs, decoupes circulaires)
 *  - Animation d'entree staggeree (spring physics)
 *  - Effet hover : elevation + halo lumineux
 *  - Animation burst de confettis au succes
 *  - Indicateur en temps reel (Applying / Active / Idle)
 *  - Feedback textuel accessibilite (aria-live)
 *
 * Design tokens :
 *  - Fond actif  : emerald-50 => white => emerald-50
 *  - Fond idle   : #fff8f0 => white => #fff3e6
 *  - Accent CTA  : #ef8219
 *  - Success     : emerald-500
 *
 * @module promotions/PromoCodeUseButton
 */

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Star, Tag, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useApplyPromoCode } from "@/hooks/useApplyPromoCode";
import type { PromoCodeList } from "@/modeles/promotions";

/* --- Types ----------------------------------------------------------------- */

type PromoCodeUseButtonProps = {
  promo: PromoCodeList;
  className?: string;
  variant?: "home" | "page";
  showDescription?: boolean;
  index?: number;
  layoutMode?: "grid" | "list";
};

/* --- Utilitaires ----------------------------------------------------------- */

/** Genere le label human-readable de la reduction */
function promoLabel(promo: PromoCodeList): string {
  if (promo.type === "percentage") return `-${parseFloat(promo.value)}%`;
  if (promo.type === "free_shipping") return "Livraison offerte";
  return formatCurrency(parseFloat(promo.value), "FCFA");
}

/** Positions des particules decoratives sur la carte */
const SPARKLE_POSITIONS = [
  { top: "12%", left: "8%" },
  { top: "18%", right: "10%" },
  { top: "72%", left: "14%" },
  { top: "65%", right: "12%" },
] as const;

/* --- Composant principal --------------------------------------------------- */

export function PromoCodeUseButton({
  promo,
  className,
  variant = "page",
  showDescription = true,
  index = 0,
  layoutMode = "grid",
}: PromoCodeUseButtonProps) {
  /* -- Stores et hooks -- */
  const { applyCode, applyingCode, activePromoCode } = useApplyPromoCode();
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  /* -- Etat local -- */
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [burst, setBurst] = useState(false);

  /* -- Derivations -- */
  const isApplying = applyingCode === promo.code.toUpperCase();
  const isActive = activePromoCode === promo.code.toUpperCase();
  const label = promoLabel(promo);

  /* -- Handler principal -- */
  async function handleUse(): Promise<void> {
    if (isApplying) return;

    /* Code deja applique : ouvrir le panier */
    if (isActive) {
      toggleDrawer(true);
      setFeedback({ type: "success", message: "Code deja applique - panier ouvert." });
      return;
    }

    setFeedback(null);
    const result = await applyCode(promo.code, { promo });

    if (result.ok) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 1_200);
      setFeedback({ type: "success", message: result.message });
    } else if (result.reason !== "login") {
      setFeedback({ type: "error", message: result.message || "Impossible d'appliquer le code." });
    }
  }

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      {/* -- Conteneur avec animation d'entree -- */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          delay: index * 0.08,
        }}
        className="flex-1 flex flex-col w-full"
      >
        {/* -- Bouton principal : apparence ticket -- */}
        <motion.button
          type="button"
          onClick={() => void handleUse()}
          disabled={isApplying}
          aria-pressed={isActive}
          aria-label={`Appliquer le code promo ${promo.code} - ${label}`}
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "group relative flex flex-1 w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed text-left",
            layoutMode === "grid" ? "flex-col min-h-[200px]" : "flex-col sm:flex-row min-h-[140px] sm:items-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8219]/40 focus-visible:ring-offset-2",
            "disabled:cursor-wait disabled:opacity-80",
            "shadow-[0_8px_28px_rgba(15,23,42,0.07)] transition-shadow hover:shadow-[0_16px_48px_rgba(15,23,42,0.12)]",
            isActive
              ? "border-emerald-300/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/80"
              : variant === "home"
                ? "border-[#ef8219]/45 bg-gradient-to-br from-[#fff8f0] via-white to-[#fff3e6] hover:border-[#ef8219]/70"
                : "border-[#ef8219]/40 bg-gradient-to-br from-[#fff8f0] via-white to-[#fff3e6] hover:border-[#ef8219]/70"
          )}
        >
          {/* -- Particules decoratives (Star) -- */}
          {SPARKLE_POSITIONS.map((pos, i) => (
            <span
              key={i}
              className="pointer-events-none absolute h-1 w-1 rounded-full opacity-20 transition-opacity duration-300 group-hover:opacity-40"
              style={{
                ...pos,
                background: isActive ? "#10b981" : "#ef8219",
              }}
              aria-hidden="true"
            />
          ))}

          {/* -- Burst de confettis au succes -- */}
          <AnimatePresence>
            {burst && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.span
                    key={`burst-${promo.id}-${i}`}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1.2, 0],
                      x: Math.cos((i / 8) * Math.PI * 2) * 48,
                      y: Math.sin((i / 8) * Math.PI * 2) * 48,
                      opacity: [1, 0.7, 0],
                    }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                    style={{ background: i % 2 === 0 ? "#ef8219" : "#10b981" }}
                    aria-hidden="true"
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* -- Contenu de la carte -- */}
          <div className={cn(
            "relative z-10 flex h-full gap-3 p-5",
            layoutMode === "grid" ? "flex-col" : "flex-col sm:flex-row sm:items-center w-full"
          )}>
            {/* En-tete : type de remise */}
            <div className={cn(
              "flex items-start justify-between gap-2",
              layoutMode === "list" && "sm:min-w-[180px] sm:shrink-0"
            )}>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "linear-gradient(135deg, #ef8219, #f5a623)",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(16,185,129,0.35)"
                      : "0 4px 12px rgba(239,130,25,0.35)",
                  }}
                >
                  {isActive
                    ? <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    : <Tag className="h-4 w-4 text-white" aria-hidden="true" />
                  }
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a9086]">
                    Code promo
                  </p>
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.12em]",
                      isActive ? "text-emerald-600" : "text-[#ef8219]"
                    )}
                  >
                    {/* {label} */}
                    Reduction
                  </p>
                </div>
              </div>

              {/* Badge remise */}
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-black uppercase tracking-wide text-white"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #ef8219, #f5a623)",
                  boxShadow: isActive
                    ? "0 3px 10px rgba(16,185,129,0.4)"
                    : "0 3px 10px rgba(239,130,25,0.4)",
                }}
              >
                <Zap className="h-4 w-4 fill-current" aria-hidden="true" />
                {label}
              </span>
            </div>

            {/* Separateur style ticket */}
            {layoutMode === "grid" ? (
              <div className="relative my-1 flex items-center gap-2">
                <div className="h-[1px] flex-1 border-t-2 border-dashed border-[#e8ddd0]" />
                <div
                  className="h-3 w-3 rounded-full border border-[#e8ddd0]"
                  style={{ background: "#f9f6ee" }}
                  aria-hidden="true"
                />
                <div className="h-[1px] flex-1 border-t-2 border-dashed border-[#e8ddd0]" />
              </div>
            ) : (
              <div className="hidden sm:block h-16 w-[2px] border-l-2 border-dashed border-[#e8ddd0] mx-2 shrink-0" />
            )}

            {/* Code en gros */}
            <div className={cn(
              "text-center",
              layoutMode === "list" && "sm:text-left sm:flex-1"
            )}>
              <p className={cn(
                "font-mono font-black tracking-[0.28em] text-[#1f241c]",
                layoutMode === "grid" ? "text-2xl" : "text-xl"
              )}>
                {promo.code}
              </p>
              {/* Description optionnelle pour mode list */}
              {layoutMode === "list" && showDescription && promo.description && (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#5c6a59]">
                  {promo.description}
                </p>
              )}
            </div>

            {/* Description optionnelle pour mode grid */}
            {layoutMode === "grid" && showDescription && promo.description && (
              <p className="line-clamp-2 text-center text-[12px] leading-relaxed text-[#5c6a59]">
                {promo.description}
              </p>
            )}

            {/* CTA */}
            <div className={cn(
              layoutMode === "grid" ? "mt-auto w-full" : "mt-auto w-full sm:mt-0 sm:w-auto sm:ml-auto sm:shrink-0"
            )}>
              <motion.div
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-black uppercase tracking-[0.2em]",
                  layoutMode === "grid" ? "w-full" : "w-full sm:px-6",
                  isActive
                    ? "bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
                    : "text-white shadow-[0_4px_14px_rgba(239,130,25,0.35)] hover:shadow-[0_6px_20px_rgba(239,130,25,0.5)]"
                )}
                style={
                  !isActive
                    ? { background: "linear-gradient(135deg, #ef8219, #f5a623)" }
                    : undefined
                }
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Application...
                  </>
                ) : isActive ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Code actif
                  </>
                ) : (
                  <>
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    Utiliser sur mon panier actuel
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* -- Feedback -- */}
      <div className="h-4 w-full flex items-start justify-center">
        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={cn(
                "text-center text-[11px] font-semibold leading-none",
                feedback.type === "success" ? "text-emerald-600" : "text-red-500"
              )}
              role="alert"
              aria-live="polite"
            >
              {feedback.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
