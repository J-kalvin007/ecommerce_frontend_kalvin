// app/admin/components/fidelites/LoyaltyEventTimeline.tsx
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
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                Aucun événement de points enregistré.
            </div>
        );
    }

    const groups = groupByPeriod(events);

    return (
        <div className="space-y-6">
            {groups.map((group, gi) => (
                <div key={group.label}>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pl-7">
                        {group.label}
                    </p>
                    <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 rounded-full bg-border/60" />
                        <div className="space-y-3">
                            {group.events.map((event, i) => {
                                const reason  = event.reason as LoyaltyEventReason;
                                const ecfg    = LOYALTY_EVENT_CONFIG[reason] ?? LOYALTY_EVENT_CONFIG.purchase;
                                const Icon    = EVENT_ICONS[reason] ?? ShoppingBag;
                                const isGain  = event.points_delta >= 0;

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (gi * 3 + i) * 0.04 }}
                                        className="relative flex items-start gap-3"
                                    >
                                        {/* Bullet */}
                                        <div className={cn(
                                            "absolute -left-6 top-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-surface-elevated",
                                            ecfg.bg, ecfg.border
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full", ecfg.color.replace("text-", "bg-"))} />
                                        </div>

                                        <div className="flex flex-1 items-start justify-between gap-2 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-elevated">
                                            <div className="flex items-start gap-2.5">
                                                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", ecfg.bg)}>
                                                    <Icon className={cn("h-4 w-4", ecfg.color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{event.reason_display || LOYALTY_EVENT_LABELS[reason]}</p>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{event.description}</p>
                                                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                                                        {new Date(event.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className={cn("text-sm font-extrabold", isGain ? "text-emerald-400" : "text-red-400")}>
                                                    {isGain ? "+" : ""}{event.points_delta} pts
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60">
                                                    → {event.new_points_balance_after.toLocaleString("fr-FR")}
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
