/**
 * LoyaltyTiersPanel — Affichage premium des paliers VIP (Admin)
 *
 * @module app/admin/components/fidelites/components/LoyaltyTiersPanel
 */
"use client";

import { motion } from "framer-motion";
import { Medal, Star, Crown, Gem, ChevronRight, Edit3, Trash2, Plus } from "lucide-react";
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
    Bronze: Medal, Silver: Star, Gold: Crown, Platinum: Gem, Diamond: Star,
};

export function LoyaltyTiersPanel({ tiers, currentTierName, isAdmin, onAdd, onEdit, onDelete }: LoyaltyTiersPanelProps) {
    const sorted = [...tiers].sort((a, b) => a.min_points - b.min_points);

    return (
        <div className="space-y-6">
            {/* Header / Actions Admin */}
            {isAdmin && onAdd && (
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Paliers VIP</h3>
                        <p className="text-sm font-medium text-muted-foreground">Gérez les niveaux de fidélité et leurs avantages exclusifs.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAdd}
                        className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        <Plus className="h-4 w-4" />
                        Nouveau Palier
                    </motion.button>
                </div>
            )}

            {/* Grille des paliers */}
            <div className="grid gap-4">
                {sorted.map((tier, i) => {
                    const cfg = getTierConfig(tier.name);
                    const Icon = ICONS[tier.name] ?? Medal;
                    const isCurrent = tier.name === currentTierName;

                    return (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                                "group relative overflow-hidden rounded-[20px] border p-5 transition-all hover:-translate-y-1 hover:shadow-xl",
                                isCurrent
                                    ? `border-${cfg.color.replace('text-', '')}/30 bg-${cfg.color.replace('text-', '')}/5`
                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a]"
                            )}
                        >
                            {/* Liseré gradient dynamique */}
                            <div className={cn("absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b", cfg.gradient)} />
                            
                            {/* Halo de fond si actuel */}
                            {isCurrent && (
                                <div className={cn("absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px] opacity-20 bg-gradient-to-br pointer-events-none", cfg.gradient)} />
                            )}

                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 ml-4">
                                
                                {/* Info principale */}
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border transition-transform duration-500 group-hover:scale-110",
                                        cfg.bg, cfg.border
                                    )}>
                                        <Icon className={cn("h-7 w-7 drop-shadow-sm", cfg.textColor)} />
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                                {tier.name}
                                            </h3>
                                            {isCurrent && (
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                                                    cfg.border, cfg.textColor, cfg.bg
                                                )}>
                                                    Palier actuel
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                                            Débloqué à partir de <strong className="text-slate-700 dark:text-slate-300">{tier.min_points.toLocaleString("fr-FR")} pts</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Stats & Actions */}
                                <div className="flex items-center gap-8 sm:gap-10 sm:pr-2">
                                    {/* Dépenses */}
                                    <div className="hidden md:block text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Dépenses Min.</p>
                                        <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                                            {formatCurrency(parseFloat(tier.min_solde || "0"), "FCFA")}
                                        </p>
                                    </div>
                                    
                                    {/* Réduction */}
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Avantage</p>
                                        <p className={cn("text-2xl font-black tracking-tighter", cfg.textColor)}>
                                            {parseFloat(tier.discount_percent || "0")}% <span className="text-sm font-bold opacity-60">off</span>
                                        </p>
                                    </div>

                                    {/* Flèche mode client */}
                                    {i < sorted.length - 1 && !isAdmin && (
                                        <ChevronRight className="h-6 w-6 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
                                    )}

                                    {/* Actions Admin */}
                                    {isAdmin && (
                                        <div className="flex items-center gap-2 pl-4 border-l border-slate-100 dark:border-slate-800">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(tier)}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(tier)}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 transition-all hover:bg-red-500/20 hover:text-red-600"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
