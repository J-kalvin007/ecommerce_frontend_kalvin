// // app/admin/components/fidelites/LoyaltyTierProgressBar.tsx
// "use client";
// import { useEffect, useRef } from "react";
// import { motion, useMotionValue, useSpring, animate } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { getTierConfig } from "@/modeles/fidelites";
// import type { Tier } from "@/modeles/fidelites";

// interface LoyaltyTierProgressBarProps {
//     currentPoints: number;
//     currentTierName: string;
//     tiers?: Tier[];
//     compact?: boolean;
// }

// export function LoyaltyTierProgressBar({
//     currentPoints,
//     currentTierName,
//     tiers = [],
//     compact = false,
// }: LoyaltyTierProgressBarProps) {
//     const cfg = getTierConfig(currentTierName);

//     // Trouver le palier suivant
//     const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);
//     const currentTierObj = sortedTiers.find(t => t.name === currentTierName);
//     const nextTier = sortedTiers.find(t => t.min_points > (currentTierObj?.min_points ?? 0));
//     const nextCfg = nextTier ? getTierConfig(nextTier.name) : null;

//     const ptsForNext = nextTier ? nextTier.min_points : currentPoints;
//     const ptsBase    = currentTierObj?.min_points ?? 0;
//     const range      = ptsForNext - ptsBase;
//     const progress   = range > 0 ? Math.min(((currentPoints - ptsBase) / range) * 100, 100) : 100;
//     const ptsNeeded  = nextTier ? Math.max(nextTier.min_points - currentPoints, 0) : 0;

//     if (compact) {
//         return (
//             <div className="w-full space-y-1.5">
//                 <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-alt">
//                     <motion.div
//                         initial={{ width: 0 }}
//                         animate={{ width: `${progress}%` }}
//                         transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
//                         className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", cfg.gradient)}
//                     />
//                 </div>
//                 {nextTier && (
//                     <p className="text-[10px] font-medium text-muted-foreground">
//                         <span className={cn("font-bold", nextCfg?.textColor)}>{ptsNeeded} pts</span> pour {nextTier.name}
//                     </p>
//                 )}
//                 {!nextTier && (
//                     <p className={cn("text-[10px] font-bold", cfg.textColor)}>Palier maximum atteint ✓</p>
//                 )}
//             </div>
//         );
//     }

//     return (
//         <div className="w-full space-y-3">
//             <div className="flex items-center justify-between text-xs font-semibold">
//                 <span className={cn(cfg.textColor)}>{currentPoints.toLocaleString("fr-FR")} pts</span>
//                 {nextTier ? (
//                     <span className="text-muted-foreground">{nextTier.min_points.toLocaleString("fr-FR")} pts → {nextTier.name}</span>
//                 ) : (
//                     <span className={cn("font-bold", cfg.textColor)}>Niveau maximum</span>
//                 )}
//             </div>

//             <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-surface-alt border border-border/30">
//                 <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${progress}%` }}
//                     transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.3 }}
//                     className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r shadow-sm", cfg.gradient)}
//                 />
//                 {/* Jalon lumineux */}
//                 <div
//                     className="absolute inset-y-0 rounded-full opacity-40"
//                     style={{ width: `${progress}%`, background: "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.4) 100%)" }}
//                 />
//             </div>

//             <div className="flex items-center justify-between">
//                 <span className="text-xs text-muted-foreground">{progress.toFixed(0)}% du prochain palier</span>
//                 {nextTier && ptsNeeded > 0 && (
//                     <span className="text-xs font-bold">
//                         <span className={cn(nextCfg?.textColor)}>{ptsNeeded.toLocaleString("fr-FR")} pts</span>
//                         <span className="text-muted-foreground"> manquants</span>
//                     </span>
//                 )}
//             </div>
//         </div>
//     );
// }


































// app/admin/components/fidelites/LoyaltyTierProgressBar.tsx
"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/modeles/fidelites";
import type { Tier } from "@/modeles/fidelites";

interface LoyaltyTierProgressBarProps {
  currentPoints: number;
  currentTierName: string;
  tiers?: Tier[];
  compact?: boolean;
}

export function LoyaltyTierProgressBar({
  currentPoints,
  currentTierName,
  tiers = [],
  compact = false,
}: LoyaltyTierProgressBarProps) {
  const cfg = getTierConfig(currentTierName);

  const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);
  const currentTierObj = sortedTiers.find((t) => t.name === currentTierName);
  const nextTier = sortedTiers.find(
    (t) => t.min_points > (currentTierObj?.min_points ?? 0)
  );
  const nextCfg = nextTier ? getTierConfig(nextTier.name) : null;

  const ptsBase   = currentTierObj?.min_points ?? 0;
  const ptsForNext = nextTier ? nextTier.min_points : currentPoints;
  const range     = ptsForNext - ptsBase;
  const progress  = range > 0 ? Math.min(((currentPoints - ptsBase) / range) * 100, 100) : 100;
  const ptsNeeded = nextTier ? Math.max(nextTier.min_points - currentPoints, 0) : 0;

  // Compact mode
  if (compact) {
    return (
      <div className="w-full space-y-1.5">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", cfg.gradient)}
          />
          {/* Glint */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.5) 100%)",
            }}
          />
        </div>
        {nextTier ? (
          <p className="text-[10px] font-medium text-muted-foreground">
            <span className={cn("font-black", nextCfg?.textColor)}>
              {ptsNeeded.toLocaleString("fr-FR")} pts
            </span>{" "}
            pour{" "}
            <span className={cn("font-bold", nextCfg?.textColor)}>
              {nextTier.name}
            </span>
          </p>
        ) : (
          <p className={cn("text-[10px] font-black", cfg.textColor)}>
            Palier maximum ✓
          </p>
        )}
      </div>
    );
  }

  // Full mode with milestone markers
  const maxPts = nextTier ? nextTier.min_points : currentPoints;

  return (
    <div className="w-full space-y-3">
      {/* Labels */}
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className={cn(cfg.textColor)}>
          {currentPoints.toLocaleString("fr-FR")} pts
        </span>
        {nextTier ? (
          <span className="text-muted-foreground">
            {nextTier.min_points.toLocaleString("fr-FR")} pts →{" "}
            <span className={cn("font-black", nextCfg?.textColor)}>
              {nextTier.name}
            </span>
          </span>
        ) : (
          <span className={cn("font-black", cfg.textColor)}>Niveau maximum</span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-3 w-full">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full bg-border/25 border border-border/20" />

        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 14, delay: 0.2 }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r shadow-sm",
            cfg.gradient
          )}
        />

        {/* Glint overlay */}
        <div
          className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.35) 100%)",
            transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        />

        {/* Milestone markers */}
        {sortedTiers
          .filter((t) => t.min_points > ptsBase && t.min_points <= maxPts)
          .map((t) => {
            const markerPct =
              range > 0 ? Math.min(((t.min_points - ptsBase) / range) * 100, 100) : 100;
            const mCfg = getTierConfig(t.name);
            const reached = currentPoints >= t.min_points;
            return (
              <div
                key={t.name}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${markerPct}%` }}
                title={`${t.name}: ${t.min_points.toLocaleString("fr-FR")} pts`}
              >
                <div
                  className={cn(
                    "h-3.5 w-1 rounded-full border",
                    reached
                      ? cn("border-transparent", mCfg.bg)
                      : "border-border/40 bg-surface"
                  )}
                />
              </div>
            );
          })}

        {/* Thumb dot at current position */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${progress}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 14, delay: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-surface shadow-md"
          style={{ background: `var(--color-primary)` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60 font-medium">
          {progress.toFixed(0)}% du palier suivant
        </span>
        {nextTier && ptsNeeded > 0 && (
          <span className="text-[10px] font-bold">
            <span className={cn(nextCfg?.textColor)}>
              {ptsNeeded.toLocaleString("fr-FR")} pts
            </span>
            <span className="text-muted-foreground"> manquants</span>
          </span>
        )}
      </div>
    </div>
  );
}