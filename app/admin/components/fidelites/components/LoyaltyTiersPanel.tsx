// app/admin/components/fidelites/LoyaltyTiersPanel.tsx
"use client";
import { motion } from "framer-motion";
import { Medal, Star, Crown, Gem, Sparkles, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getTierConfig } from "@/modeles/fidelites";
import type { Tier } from "@/modeles/fidelites";

interface LoyaltyTiersPanelProps {
    tiers: Tier[];
    currentTierName?: string;
    isAdmin?: boolean;
    onAdd?: () => void;
    onEdit?: (tier: Tier) => void;
    onDelete?: (tier: Tier) => void;
}

const ICONS: Record<string, React.ElementType> = {
    Bronze: Medal, Silver: Star, Gold: Crown, Platinum: Gem, Diamond: Sparkles,
};

export function LoyaltyTiersPanel({ tiers, currentTierName, isAdmin, onAdd, onEdit, onDelete }: LoyaltyTiersPanelProps) {
    const sorted = [...tiers].sort((a, b) => a.min_points - b.min_points);

    return (
        <div className="space-y-3">
            {isAdmin && onAdd && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors"
                    >
                        + Ajouter un palier
                    </button>
                </div>
            )}
            {sorted.map((tier, i) => {
                const cfg  = getTierConfig(tier.name);
                const Icon = ICONS[tier.name] ?? Medal;
                const isCurrent = tier.name === currentTierName;

                return (
                    <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className={cn(
                            "relative overflow-hidden rounded-2xl border p-5 transition-all",
                            isCurrent
                                ? `${cfg.border} ${cfg.bg} shadow-md`
                                : "border-border bg-surface-elevated hover:border-border/60"
                        )}
                    >
                        {/* Gradient strip */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b", cfg.gradient)} />

                        <div className="ml-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner border",
                                    cfg.gradient, cfg.border
                                )}>
                                    <Icon className="h-6 w-6 text-white drop-shadow" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn("text-base font-extrabold", cfg.textColor)}>{tier.name}</h3>
                                        {isCurrent && (
                                            <span className={cn(
                                                "rounded-full border px-2 py-0.5 text-[10px] font-black",
                                                cfg.border, cfg.textColor, cfg.bg
                                            )}>
                                                Palier actuel
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        À partir de <strong>{tier.min_points.toLocaleString("fr-FR")} pts lifetime</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-right">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Dépenses min.</p>
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(parseFloat(tier.min_solde || "0"), "FCFA")}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Réduction</p>
                                    <p className={cn("text-lg font-extrabold", cfg.textColor)}>
                                        {parseFloat(tier.discount_percent || "0")}%
                                    </p>
                                </div>
                                {i < sorted.length - 1 && !isAdmin && (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                                )}
                                {isAdmin && (
                                    <div className="flex items-center gap-2 ml-4">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(tier)}
                                                className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:bg-surface-alt hover:text-foreground transition-colors"
                                                title="Modifier"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(tier)}
                                                className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20 transition-colors"
                                                title="Supprimer"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
