/**
 * LoyaltyStatsBar — Bar de KPIs premium pour la fidélité
 *
 * @module app/admin/components/fidelites/components/LoyaltyStatsBar
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, Star, TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getTierConfig } from "@/modeles/fidelites";
import type { LoyaltyStats } from "@/modeles/fidelites";

interface LoyaltyStatsBarProps { stats: LoyaltyStats; }

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) {
            setDisplay(0);
            return;
        }
        const duration = 1200;
        const start = performance.now();
        const step = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setDisplay(Math.round(eased * target));
            if (elapsed < 1) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target]);

    return <span>{prefix}{display.toLocaleString("fr-FR")}{suffix}</span>;
}

function KPICard({
    icon, label, value, accent, sub, delay
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    accent: string;
    sub?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay ?? 0, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            {/* Ambient glow caché derrière */}
            <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full blur-[50px] opacity-20 transition-opacity duration-500 group-hover:opacity-40", accent)} />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-start justify-between">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border bg-white dark:bg-slate-900 shadow-sm", accent.replace('bg-', 'border-').replace('/10', '/20'))}>
                        <div className={cn("text-current opacity-80", accent.replace('bg-', 'text-').replace('/10', ''))}>
                            {icon}
                        </div>
                    </div>
                    {sub && (
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                            {sub}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm mb-1">{value}</p>
                    <p className="text-xs font-bold text-muted-foreground">{label}</p>
                </div>
            </div>
        </motion.div>
    );
}

export function LoyaltyStatsBar({ stats }: LoyaltyStatsBarProps) {
    const tierEntries = Object.entries(stats.byTier).sort(
        ([a], [b]) => (getTierConfig(a).rank ?? 0) - (getTierConfig(b).rank ?? 0)
    );
    const totalByTier = tierEntries.reduce((s, [, n]) => s + n, 0) || 1;

    return (
        <div className="space-y-6">
            {/* KPIs Principaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    delay={0.05}
                    icon={<Users className="h-6 w-6" />}
                    label="Membres du programme"
                    value={<AnimatedCounter target={stats.totalMembers} />}
                    accent="bg-blue-500/10 border-blue-500/20 text-blue-500"
                    sub="Inscrits"
                />
                <KPICard
                    delay={0.10}
                    icon={<Star className="h-6 w-6" />}
                    label="Total des points distribués"
                    value={<><AnimatedCounter target={stats.totalPointsEarned} /><span className="text-base font-bold text-muted-foreground ml-1">pts</span></>}
                    accent="bg-amber-500/10 border-amber-500/20 text-amber-500"
                    sub="Lifetime"
                />
                <KPICard
                    delay={0.15}
                    icon={<TrendingUp className="h-6 w-6" />}
                    label="Chiffre d'affaires fidélité"
                    value={<AnimatedCounter target={Math.round(stats.totalSpend)} suffix=" F" />}
                    accent="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    sub="Généré"
                />
                <KPICard
                    delay={0.20}
                    icon={<BarChart3 className="h-6 w-6" />}
                    label="Solde total en circulation"
                    value={<><AnimatedCounter target={stats.totalPointsBalance} /><span className="text-base font-bold text-muted-foreground ml-1">pts</span></>}
                    accent="bg-purple-500/10 border-purple-500/20 text-purple-500"
                    sub="Actif"
                />
            </div>

            {/* Répartition par palier */}
            {tierEntries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] p-6 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                Répartition par Niveau VIP
                            </h3>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                Vue d'ensemble de la distribution de vos membres.
                            </p>
                        </div>
                    </div>

                    {/* Barre de progression multi-segments */}
                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner flex">
                        {tierEntries.map(([tier, count], idx) => {
                            const cfg = getTierConfig(tier);
                            const pct = (count / totalByTier) * 100;
                            return (
                                <motion.div
                                    key={tier}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 1, delay: 0.4 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className={cn("h-full border-r border-white/20 last:border-0 bg-gradient-to-r", cfg.gradient)}
                                    title={`${tier}: ${count} membres (${pct.toFixed(0)}%)`}
                                >
                                    {/* Effet reflet */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Légende */}
                    <div className="mt-6 flex flex-wrap gap-4">
                        {tierEntries.map(([tier, count]) => {
                            const cfg = getTierConfig(tier);
                            const pct = ((count / totalByTier) * 100).toFixed(1);
                            return (
                                <div key={tier} className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                                    <div className={cn("h-3 w-3 rounded-full shadow-sm bg-gradient-to-br", cfg.gradient)} />
                                    <div>
                                        <p className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                            {tier}
                                        </p>
                                        <p className="text-[10px] font-semibold text-muted-foreground">
                                            {count} membres <span className="opacity-50">({pct}%)</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
