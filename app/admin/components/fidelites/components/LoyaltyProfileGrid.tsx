// app/admin/components/fidelites/LoyaltyProfileGrid.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { LoyaltyProfileCard } from "./LoyaltyProfileCard";
import type { LoyaltyProfile, Tier } from "@/modeles/fidelites";

interface LoyaltyProfileGridProps {
    profiles: LoyaltyProfile[];
    tiers: Tier[];
    onView: (profile: LoyaltyProfile) => void;
    onAdjust: (profile: LoyaltyProfile) => void;
    viewMode?: "grid" | "list";
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

export function LoyaltyProfileGrid({ profiles, tiers, onView, onAdjust, viewMode = "grid" }: LoyaltyProfileGridProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={viewMode === "grid" 
                ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" 
                : "flex flex-col gap-3"}
        >
            <AnimatePresence>
                {profiles.map(profile => (
                    <LoyaltyProfileCard
                        key={profile.id}
                        profile={profile}
                        tiers={tiers}
                        onView={() => onView(profile)}
                        onAdjust={() => onAdjust(profile)}
                        viewMode={viewMode}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
