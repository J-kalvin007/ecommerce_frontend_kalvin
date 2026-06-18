// app/admin/components/fidelites/LoyaltyStatsBar.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, Star, TrendingUp, BarChart3 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getTierConfig } from "@/modeles/fidelites";
import type { LoyaltyStats } from "@/modeles/fidelites";

interface LoyaltyStatsBarProps { stats: LoyaltyStats; }

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) return;
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay ?? 0, duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm"
        >
            <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-60", accent)} />
            <div className="relative">
                <div className={cn("mb-3 inline-flex items-center justify-center rounded-xl p-2.5", accent, "bg-opacity-20")}>
                    {icon}
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
                {sub && <p className="mt-0.5 text-[10px] text-muted-foreground/60">{sub}</p>}
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
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KPICard
                    delay={0}
                    icon={<Users className="h-5 w-5 text-primary" />}
                    label="Membres inscrits"
                    value={<AnimatedCounter target={stats.totalMembers} />}
                    accent="bg-primary/10"
                />
                <KPICard
                    delay={0.08}
                    icon={<Star className="h-5 w-5 text-amber-400" />}
                    label="Points distribués"
                    value={<AnimatedCounter target={stats.totalPointsEarned} suffix=" pts" />}
                    accent="bg-amber-400/10"
                    sub="Total lifetime cumulé"
                />
                <KPICard
                    delay={0.16}
                    icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
                    label="Dépenses cumulées"
                    value={<AnimatedCounter target={Math.round(stats.totalSpend)} suffix=" F" />}
                    accent="bg-emerald-400/10"
                    sub="Toutes commandes livrées"
                />
                <KPICard
                    delay={0.24}
                    icon={<BarChart3 className="h-5 w-5 text-blue-400" />}
                    label="Points disponibles"
                    value={<AnimatedCounter target={stats.totalPointsBalance} suffix=" pts" />}
                    accent="bg-blue-400/10"
                    sub="Solde actuel total"
                />
            </div>

            {/* Répartition par palier */}
            {tierEntries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl border border-border bg-surface-elevated p-4"
                >
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Répartition par palier</p>
                    <div className="flex h-3 w-full overflow-hidden rounded-full">
                        {tierEntries.map(([tier, count]) => {
                            const cfg = getTierConfig(tier);
                            const pct = (count / totalByTier) * 100;
                            return (
                                <motion.div
                                    key={tier}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
                                    className={cn("h-full bg-gradient-to-r first:rounded-l-full last:rounded-r-full", cfg.gradient)}
                                    title={`${tier}: ${count} membres (${pct.toFixed(0)}%)`}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {tierEntries.map(([tier, count]) => {
                            const cfg = getTierConfig(tier);
                            return (
                                <div key={tier} className="flex items-center gap-1.5">
                                    <div className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-r", cfg.gradient)} />
                                    <span className={cn("text-xs font-semibold", cfg.textColor)}>{tier}</span>
                                    <span className="text-xs text-muted-foreground">({count})</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
