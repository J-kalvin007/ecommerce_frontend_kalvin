// // app/admin/components/fidelites/LoyaltyProfileCard.tsx
// "use client";
// import { useRef, useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Eye, Zap, Calendar, TrendingUp } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import { getTierConfig } from "@/modeles/fidelites";
// import type { LoyaltyProfile, Tier } from "@/modeles/fidelites";
// import { LoyaltyTierBadge } from "./LoyaltyTierBadge";
// import { LoyaltyTierProgressBar } from "./LoyaltyTierProgressBar";

// interface LoyaltyProfileCardProps {
//     profile: LoyaltyProfile;
//     tiers: Tier[];
//     onView: () => void;
//     onAdjust: () => void;
//     viewMode?: "grid" | "list";
// }

// function useCountUp(target: number, duration = 1000) {
//     const [val, setVal] = useState(0);
//     const raf = useRef<number | null>(null);
//     useEffect(() => {
//         if (!target) return;
//         const start = performance.now();
//         const tick = (now: number) => {
//             const t = Math.min((now - start) / duration, 1);
//             setVal(Math.round((1 - Math.pow(1 - t, 3)) * target));
//             if (t < 1) raf.current = requestAnimationFrame(tick);
//         };
//         raf.current = requestAnimationFrame(tick);
//         return () => { if (raf.current) cancelAnimationFrame(raf.current); };
//     }, [target, duration]);
//     return val;
// }

// export function LoyaltyProfileCard({ profile, tiers, onView, onAdjust, viewMode = "grid" }: LoyaltyProfileCardProps) {
//     const cfg    = getTierConfig(profile.tier_name);
//     const count  = useCountUp(profile.points_balance, 900);
//     const months = Math.max(0, Math.round(
//         (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
//     ));
    
//     const userInitials = profile.user.name ? profile.user.name.substring(0, 2).toUpperCase() : profile.user.email.substring(0, 2).toUpperCase();

//     if (viewMode === "list") {
//         return (
//             <motion.div
//                 layout
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.98 }}
//                 whileHover={{ scale: 1.005 }}
//                 className={cn(
//                     "group relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border bg-surface-elevated px-4 py-3 shadow-sm transition-all hover:shadow-md cursor-pointer",
//                     cfg.border
//                 )}
//                 onClick={onView}
//             >
//                 <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", cfg.gradient)} />
                
//                 <div className="flex items-center gap-3 min-w-[220px]">
//                     <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface-alt shadow-sm">
//                         {profile.user.profile_image ? (
//                             <img src={profile.user.profile_image} alt={profile.user.name || profile.user.email} className="h-full w-full object-cover" />
//                         ) : (
//                             <div className={cn("flex h-full w-full items-center justify-center text-xs font-bold", cfg.textColor, cfg.bg)}>
//                                 {userInitials}
//                             </div>
//                         )}
//                         <div className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface-elevated", profile.user.is_active ? "bg-emerald-500" : "bg-red-500")} />
//                     </div>
//                     <div className="flex min-w-0 flex-col pr-2">
//                         <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
//                             {profile.user.name || "Client Anonyme"}
//                         </p>
//                         <p className="truncate text-[10px] font-medium text-muted-foreground">
//                             {profile.user.email}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="hidden lg:flex items-center w-[110px]">
//                     <LoyaltyTierBadge tierName={profile.tier_name} size="sm" />
//                 </div>

//                 <div className="flex-1 px-4 hidden md:block">
//                     <LoyaltyTierProgressBar
//                         currentPoints={profile.total_points_earned}
//                         currentTierName={profile.tier_name}
//                         tiers={tiers}
//                         compact
//                     />
//                 </div>

//                 <div className="flex items-center gap-6 text-right">
//                     <div>
//                         <p className="text-[10px] font-bold uppercase text-muted-foreground">Solde</p>
//                         <p className={cn("text-base font-extrabold", cfg.textColor)}>
//                             {count.toLocaleString("fr-FR")} <span className="text-xs font-medium">pts</span>
//                         </p>
//                     </div>
//                     <div className="hidden sm:block">
//                         <p className="text-[10px] font-bold uppercase text-muted-foreground">Lifetime</p>
//                         <p className="text-sm font-bold text-foreground">{profile.total_points_earned.toLocaleString("fr-FR")} pts</p>
//                     </div>
//                     <div className="hidden md:block">
//                         <p className="text-[10px] font-bold uppercase text-muted-foreground">Dépenses</p>
//                         <p className="text-sm font-bold text-foreground">{formatCurrency(parseFloat(profile.total_solde || "0"), "FCFA")}</p>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button
//                         onClick={e => { e.stopPropagation(); onAdjust(); }}
//                         className={cn(
//                             "flex items-center justify-center rounded-lg p-2 text-white shadow-sm transition-all hover:scale-105",
//                             cfg.gradient
//                         )}
//                         title="Ajuster les points"
//                     >
//                         <Zap className="h-4 w-4" />
//                     </button>
//                     <button
//                         onClick={e => { e.stopPropagation(); onView(); }}
//                         className="flex items-center justify-center rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:bg-surface-alt hover:text-foreground transition-all hover:scale-105"
//                         title="Voir le détail"
//                     >
//                         <Eye className="h-4 w-4" />
//                     </button>
//                 </div>
//             </motion.div>
//         );
//     }

//     return (
//         <motion.div
//             layout
//             initial={{ opacity: 0, y: 15, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -10, scale: 0.98 }}
//             whileHover={{ y: -2, transition: { duration: 0.2 } }}
//             className={cn(
//                 "group relative overflow-hidden rounded-2xl border bg-surface-elevated shadow-sm transition-shadow hover:shadow-lg cursor-pointer",
//                 cfg.border
//             )}
//             onClick={onView}
//         >
//             {/* Fond dégradé top */}
//             <div className={cn("absolute top-0 left-0 right-0 h-16 bg-gradient-to-b opacity-[0.03]", cfg.gradient)} />
//             <div className={cn("absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r", cfg.gradient)} />

//             <div className="relative p-5">
//                 {/* Header: badge + user */}
//                 <div className="flex items-start justify-between">
//                     <div className="flex items-center gap-3 min-w-0 pr-2">
//                         <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-surface-elevated bg-surface-alt shadow-sm">
//                             {profile.user.profile_image ? (
//                                 <img src={profile.user.profile_image} alt={profile.user.name || profile.user.email} className="h-full w-full object-cover" />
//                             ) : (
//                                 <div className={cn("flex h-full w-full items-center justify-center text-sm font-bold", cfg.textColor, cfg.bg)}>
//                                     {userInitials}
//                                 </div>
//                             )}
//                             <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-elevated", profile.user.is_active ? "bg-emerald-500" : "bg-red-500")} />
//                         </div>
//                         <div className="min-w-0">
//                             <p className="truncate text-sm font-extrabold text-foreground transition-colors group-hover:text-primary">
//                                 {profile.user.name || "Client Anonyme"}
//                             </p>
//                             <p className="truncate text-[10px] font-medium text-muted-foreground">
//                                 {profile.user.email}
//                             </p>
//                         </div>
//                     </div>
//                     <div className="shrink-0 flex flex-col items-end">
//                         <LoyaltyTierBadge tierName={profile.tier_name} size="sm" />
//                         <div className="flex items-center gap-1 text-[9px] text-muted-foreground/70 mt-1">
//                             <Calendar className="h-2.5 w-2.5" />
//                             <span>{months > 0 ? `${months} mois` : "Nouveau"}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Points balance — héros */}
//                 <div className="mt-4">
//                     <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">Solde disponible</p>
//                     <div className="flex items-baseline gap-1 mt-0.5">
//                         <span className={cn("text-3xl font-extrabold tracking-tight", cfg.textColor)}>
//                             {count.toLocaleString("fr-FR")}
//                         </span>
//                         <span className="text-xs font-bold text-muted-foreground">pts</span>
//                     </div>
//                 </div>

//                 {/* Barre de progression */}
//                 <div className="mt-3">
//                     <LoyaltyTierProgressBar
//                         currentPoints={profile.total_points_earned}
//                         currentTierName={profile.tier_name}
//                         tiers={tiers}
//                         compact
//                     />
//                 </div>

//                 {/* Métriques secondaires */}
//                 <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
//                     <div>
//                         <p className="text-[9px] font-bold uppercase text-muted-foreground/80">Lifetime</p>
//                         <p className="text-xs font-extrabold text-foreground mt-0.5">
//                             {profile.total_points_earned.toLocaleString("fr-FR")} pts
//                         </p>
//                     </div>
//                     <div className="text-right">
//                         <p className="text-[9px] font-bold uppercase text-muted-foreground/80">Dépenses</p>
//                         <p className="text-xs font-extrabold text-foreground mt-0.5">
//                             {formatCurrency(parseFloat(profile.total_solde || "0"), "FCFA")}
//                         </p>
//                     </div>
//                 </div>

//                 {/* CTA Hover */}
//                 <div className="mt-3 grid grid-cols-2 gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
//                     <button
//                         onClick={e => { e.stopPropagation(); onView(); }}
//                         className="flex items-center justify-center gap-1.5 rounded-lg bg-surface py-1.5 text-[11px] font-bold text-foreground border border-border hover:border-primary/50 hover:text-primary transition-colors"
//                     >
//                         <Eye className="h-3.5 w-3.5" /> Détail
//                     </button>
//                     <button
//                         onClick={e => { e.stopPropagation(); onAdjust(); }}
//                         className={cn(
//                             "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold text-white border transition-all shadow-sm bg-gradient-to-r hover:opacity-90",
//                             cfg.gradient, cfg.border
//                         )}
//                     >
//                         <Zap className="h-3 w-3" /> Ajuster
//                     </button>
//                 </div>
//             </div>
//         </motion.div>
//     );
// }













































// app/admin/components/fidelites/LoyaltyProfileCard.tsx
"use client";
import { useRef, useEffect, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Zap, Calendar, TrendingUp, Percent } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { mediaUrl } from "@/lib/mediaUrl";
import { getTierConfig } from "@/modeles/fidelites";
import type { LoyaltyProfile, Tier } from "@/modeles/fidelites";
import { LoyaltyTierBadge } from "./LoyaltyTierBadge";
import { LoyaltyTierProgressBar } from "./LoyaltyTierProgressBar";

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 950) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

// ─── Holographic ring (SVG conic for premium tiers) ──────────────────────────
const PREMIUM_TIERS = new Set(["Gold", "Platinum", "Diamond"]);

function HoloRing({ tierName, size, hovered }: { tierName: string; size: number; hovered: boolean }) {
  const uid = useId();
  const isPremium = PREMIUM_TIERS.has(tierName);
  const cfg = getTierConfig(tierName);

  if (!isPremium) {
    // Simple static ring for Bronze/Silver
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 pointer-events-none">
        <circle
          cx={size / 2} cy={size / 2} r={(size - 3) / 2}
          fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={2.5}
          className={cfg.textColor}
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 pointer-events-none">
      <defs>
        <linearGradient id={`holo-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.6" />
          <stop offset="25%"  stopColor={tierName === "Diamond" ? "#a5f3fc" : tierName === "Platinum" ? "#c4b5fd" : "#fde68a"} stopOpacity="0.9" />
          <stop offset="50%"  stopColor={tierName === "Diamond" ? "#818cf8" : tierName === "Platinum" ? "#8b5cf6" : "#f59e0b"} stopOpacity="1" />
          <stop offset="75%"  stopColor={tierName === "Diamond" ? "#34d399" : tierName === "Platinum" ? "#ec4899" : "#ef4444"} stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <motion.circle
        cx={size / 2} cy={size / 2} r={(size - 3) / 2}
        fill="none"
        stroke={`url(#holo-${uid})`}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="3 4"
        animate={{ rotate: hovered ? 360 : 0 }}
        transition={{ duration: 4, repeat: hovered ? Infinity : 0, ease: "linear" }}
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      />
    </svg>
  );
}

// ─── Avatar with holo ring ────────────────────────────────────────────────────
function MemberAvatar({
  profile,
  size = 52,
  hovered,
  ringSize = 64,
}: {
  profile: LoyaltyProfile;
  size?: number;
  hovered: boolean;
  ringSize?: number;
}) {
  const cfg = getTierConfig(profile.tier_name);
  const initials = (profile.user.name || profile.user.email || "?")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative" style={{ width: ringSize, height: ringSize }}>
      <HoloRing tierName={profile.tier_name} size={ringSize} hovered={hovered} />
      <div
        className="absolute rounded-full overflow-hidden border border-border/20 shadow-md"
        style={{
          inset: (ringSize - size) / 2,
          width: size,
          height: size,
        }}
      >
        {profile.user.profile_image ? (
          <img
            src={mediaUrl(profile.user.profile_image) || ''}
            alt={profile.user.name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={cn("h-full w-full flex items-center justify-center text-sm font-black", cfg.bg, cfg.textColor)}>
            {initials}
          </div>
        )}
      </div>
      {/* Status dot */}
      <div
        className={cn(
          "absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-surface",
          profile.user.is_active ? "bg-emerald-500" : "bg-rose-500"
        )}
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoyaltyProfileCardProps {
  profile: LoyaltyProfile;
  tiers: Tier[];
  onView: () => void;
  onAdjust: () => void;
  viewMode?: "grid" | "list";
}

// ═════════════════════════════════════════════════════════════════════════════
// LIST MODE
// ═════════════════════════════════════════════════════════════════════════════
function ListCard({ profile, tiers, onView, onAdjust }: Omit<LoyaltyProfileCardProps, "viewMode">) {
  const [hovered, setHovered] = useState(false);
  const cfg   = getTierConfig(profile.tier_name);
  const count = useCountUp(profile.points_balance, 900);
  const months = Math.max(0, Math.round(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onView}
      className={cn(
        "group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border bg-surface px-4 py-3",
        cfg.border
      )}
      style={{
        boxShadow: hovered ? "0 8px 24px -8px rgba(0,0,0,0.12)" : "0 1px 4px -2px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Left tier accent */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b", cfg.gradient)} />

      {/* Avatar */}
      <div className="pl-1">
        <MemberAvatar profile={profile} size={36} ringSize={46} hovered={hovered} />
      </div>

      {/* Name + email */}
      <div className="flex min-w-[160px] flex-col min-w-0">
        <p className={cn("truncate text-sm font-bold text-foreground transition-colors duration-200", hovered && "text-primary")}>
          {profile.user.name || "Client Anonyme"}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">{profile.user.email}</p>
      </div>

      {/* Badge */}
      <div className="hidden lg:flex shrink-0 w-[100px]">
        <LoyaltyTierBadge tierName={profile.tier_name} size="sm" />
      </div>

      {/* Progress compact */}
      <div className="hidden md:block flex-1 px-2">
        <LoyaltyTierProgressBar
          currentPoints={profile.total_points_earned}
          currentTierName={profile.tier_name}
          tiers={tiers}
          compact
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 text-right shrink-0">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">Solde</p>
          <p className={cn("text-sm font-black tabular-nums", cfg.textColor)}>
            {count.toLocaleString("fr-FR")}{" "}
            <span className="text-[10px] font-semibold">pts</span>
          </p>
        </div>
        <div className="hidden sm:block">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">Lifetime</p>
          <p className="text-xs font-bold text-foreground">{profile.total_points_earned.toLocaleString("fr-FR")} pts</p>
        </div>
        <div className="hidden md:block">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">Dépenses</p>
          <p className="text-xs font-bold text-foreground">{formatCurrency(parseFloat(profile.total_solde || "0"), "FCFA")}</p>
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onAdjust(); }}
              title="Ajuster les points"
              className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br", cfg.gradient)}
            >
              <Zap className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onView(); }}
              title="Voir le détail"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 bg-surface text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GRID MODE — membership card
// ═════════════════════════════════════════════════════════════════════════════
function GridCard({ profile, tiers, onView, onAdjust }: Omit<LoyaltyProfileCardProps, "viewMode">) {
  const [hovered, setHovered] = useState(false);
  const cfg    = getTierConfig(profile.tier_name);
  const count  = useCountUp(profile.points_balance, 950);
  const months = Math.max(0, Math.round(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onView}
      className={cn(
        "group relative flex flex-col cursor-pointer overflow-hidden rounded-[22px] border bg-surface",
        cfg.border
      )}
      style={{
        boxShadow: hovered
          ? "0 20px 48px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)"
          : "0 2px 12px -4px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "box-shadow 0.42s ease, transform 0.42s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* ── Top gradient wash ── */}
      <div className={cn("absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r", cfg.gradient)} />
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.03), transparent)` }}
      />

      {/* ── Header ── */}
      <div className="relative flex flex-col items-center pt-6 pb-4 px-5 gap-3">
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ background: `var(--color-primary)` }}
        />

        {/* Avatar + holo ring */}
        <MemberAvatar profile={profile} size={52} ringSize={66} hovered={hovered} />

        {/* Name + email */}
        <div className="text-center min-w-0 w-full">
          <h3
            className={cn(
              "text-sm font-black text-foreground truncate leading-tight transition-colors duration-200",
              hovered && "text-primary"
            )}
          >
            {profile.user.name || "Client Anonyme"}
          </h3>
          <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
            {profile.user.email}
          </p>
        </div>

        {/* Tier badge + member duration */}
        <div className="flex items-center gap-2">
          <LoyaltyTierBadge tierName={profile.tier_name} size="sm" />
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60 font-medium">
            <Calendar className="h-2.5 w-2.5" />
            {months > 0 ? `${months} mois` : "Nouveau"}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-border/30" />

      {/* ── Points hero ── */}
      <div className="flex flex-col items-center px-5 py-4 gap-1">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
          Solde disponible
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-3xl font-black tabular-nums tracking-tight", cfg.textColor)}>
            {count.toLocaleString("fr-FR")}
          </span>
          <span className={cn("text-xs font-bold", cfg.textColor, "opacity-60")}>pts</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-5 pb-3">
        <LoyaltyTierProgressBar
          currentPoints={profile.total_points_earned}
          currentTierName={profile.tier_name}
          tiers={tiers}
          compact
        />
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-border/30" />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-px bg-border/20 mx-5 my-3 rounded-xl overflow-hidden border border-border/20">
        <div className="flex flex-col items-center py-2.5 bg-surface gap-0.5">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
            <TrendingUp className="h-2.5 w-2.5" />Lifetime
          </div>
          <p className="text-xs font-black text-foreground tabular-nums">
            {profile.total_points_earned.toLocaleString("fr-FR")} pts
          </p>
        </div>
        <div className="flex flex-col items-center py-2.5 bg-surface gap-0.5">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
            <Percent className="h-2.5 w-2.5" />Dépenses
          </div>
          <p className="text-xs font-black text-foreground tabular-nums">
            {formatCurrency(parseFloat(profile.total_solde || "0"), "FCFA")}
          </p>
        </div>
      </div>

      {/* ── Actions (revealed on hover) ── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-2 px-5 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-surface border border-border/50 py-2 text-[11px] font-bold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Détail
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); onAdjust(); }}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold text-white shadow-sm overflow-hidden bg-gradient-to-r",
                cfg.gradient
              )}
            >
              {/* Shimmer on button */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              />
              <Zap className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">Ajuster</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding if no actions visible */}
      {!hovered && <div className="pb-4" />}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export function LoyaltyProfileCard({ viewMode = "grid", ...props }: LoyaltyProfileCardProps) {
  return viewMode === "list" ? <ListCard {...props} /> : <GridCard {...props} />;
}