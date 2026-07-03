/**
 * LoyaltyEventTimeline — Affichage luxueux de l'historique des événements de points
 *
 * @module app/admin/components/fidelites/components/LoyaltyEventTimeline
 */
"use client";
import { motion } from "framer-motion";
import {
    ShoppingBag, RotateCcw, Users, Star, Cake,
    Clock, Settings, Percent, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoyaltyEvent, LoyaltyEventReason } from "@/modeles/fidelites";
import { LOYALTY_EVENT_LABELS, LOYALTY_EVENT_CONFIG } from "@/modeles/fidelites";

interface LoyaltyEventTimelineProps {
    events: LoyaltyEvent[];
    loading?: boolean;
}

const EVENT_ICONS: Record<LoyaltyEventReason, React.ElementType> = {
    purchase:         ShoppingBag,
    refund:           RotateCcw,
    referral_bonus:   Users,
    first_purchase:   Star,
    birthday_bonus:   Cake,
    points_expiry:    Clock,
    admin_adjustment: Settings,
    order_discount:   Percent,
};

function groupByPeriod(events: LoyaltyEvent[]) {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today); week.setDate(today.getDate() - 7);
    const month = new Date(today); month.setDate(today.getDate() - 30);

    const groups: Array<{ label: string; events: LoyaltyEvent[] }> = [
        { label: "Aujourd'hui",      events: [] },
        { label: "Cette semaine",    events: [] },
        { label: "Ce mois-ci",      events: [] },
        { label: "Plus anciens",    events: [] },
    ];

    for (const e of events) {
        const d = new Date(e.created_at);
        if (d >= today)       groups[0].events.push(e);
        else if (d >= week)   groups[1].events.push(e);
        else if (d >= month)  groups[2].events.push(e);
        else                  groups[3].events.push(e);
    }
    return groups.filter(g => g.events.length > 0);
}

export function LoyaltyEventTimeline({ events, loading }: LoyaltyEventTimelineProps) {
    if (loading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }
    if (!events.length) {
        return (
            <div className="flex flex-col h-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-muted-foreground p-6 text-center">
                <Clock className="h-8 w-8 mb-3 opacity-20" />
                Aucun historique d'événement de points enregistré.
            </div>
        );
    }

    const groups = groupByPeriod(events);

    return (
        <div className="space-y-8">
            {groups.map((group, gi) => (
                <div key={group.label}>
                    <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/80 pl-8">
                        {group.label}
                    </p>
                    <div className="relative pl-6">
                        {/* Ligne verticale timeline */}
                        <div className="absolute left-2 top-3 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                        
                        <div className="space-y-4">
                            {group.events.map((event, i) => {
                                const reason  = event.reason as LoyaltyEventReason;
                                const ecfg    = LOYALTY_EVENT_CONFIG[reason] ?? LOYALTY_EVENT_CONFIG.purchase;
                                const Icon    = EVENT_ICONS[reason] ?? ShoppingBag;
                                const isGain  = event.points_delta >= 0;

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (gi * 3 + i) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                        className="group relative flex items-start gap-4"
                                    >
                                        {/* Point sur la timeline */}
                                        <div className="absolute -left-[22px] top-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[3px] border-white dark:border-[#1a1a1a] bg-slate-100 dark:bg-slate-800 transition-colors group-hover:border-primary/20 group-hover:bg-primary z-10">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-white transition-colors" />
                                        </div>

                                        {/* Carte événement */}
                                        <div className="flex flex-1 items-start justify-between gap-3 rounded-[16px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700">
                                            
                                            <div className="flex items-start gap-3">
                                                {/* Icône */}
                                                <div className={cn(
                                                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105",
                                                    ecfg.bg, ecfg.border
                                                )}>
                                                    <Icon className={cn("h-5 w-5", ecfg.color)} />
                                                </div>
                                                
                                                {/* Textes */}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {event.reason_display || LOYALTY_EVENT_LABELS[reason]}
                                                    </p>
                                                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5 line-clamp-2 pr-2">
                                                        {event.description}
                                                    </p>
                                                    <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(event.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Points */}
                                            <div className="shrink-0 text-right flex flex-col items-end justify-center">
                                                <div className={cn(
                                                    "inline-flex items-baseline gap-1 rounded-lg px-2.5 py-1 text-sm font-extrabold",
                                                    isGain 
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                )}>
                                                    <span>{isGain ? "+" : ""}</span>
                                                    <span className="text-base">{event.points_delta}</span>
                                                    <span className="text-[10px]">pts</span>
                                                </div>
                                                <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                                                    Solde final: {event.new_points_balance_after.toLocaleString("fr-FR")}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
