




// app/admin/components/fidelites/LoyaltyTierBadge.tsx
"use client";
import { motion } from "framer-motion";
import { Medal, Star, Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/modeles/fidelites";

interface LoyaltyTierBadgeProps {
  tierName: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  Bronze: Medal,
  Silver: Star,
  Gold: Crown,
  Platinum: Gem,
  Diamond: Star,
};

const SIZES = {
  sm: { wrap: "h-6 px-2.5 gap-1 text-[10px]", icon: "h-3 w-3" },
  md: { wrap: "h-8 px-3 gap-1.5 text-[11px]", icon: "h-3.5 w-3.5" },
  lg: { wrap: "h-10 px-5 gap-2 text-sm", icon: "h-4.5 w-4.5" },
};

const PREMIUM_TIERS = new Set(["Gold", "Platinum", "Diamond"]);

export function LoyaltyTierBadge({ tierName, size = "md", animate = true }: LoyaltyTierBadgeProps) {
  const cfg = getTierConfig(tierName);
  const Icon = ICONS[tierName] ?? Medal;
  const sz = SIZES[size];
  const isPremium = animate && PREMIUM_TIERS.has(tierName);

  return (
    <div
      className={cn(
        "relative overflow-hidden inline-flex items-center rounded-full border font-bold shadow-sm",
        sz.wrap, cfg.border, cfg.bg
      )}
    >
      {/* Shimmer sweep */}
      {isPremium && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            repeatDelay: 2.8,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Diamond sparkle glow */}
      {animate && tierName === "Diamond" && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: `inset 0 0 8px rgba(255,255,255,0.25)` }}
        />
      )}

      <Icon className={cn("relative z-10 shrink-0", sz.icon, cfg.textColor)} />
      <span className={cn("relative z-10 font-black tracking-wide", cfg.textColor)}>
        {tierName}
      </span>
    </div>
  );
}