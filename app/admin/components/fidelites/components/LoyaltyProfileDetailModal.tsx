// // app/admin/components/fidelites/LoyaltyProfileDetailModal.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     X, Zap, Calendar, TrendingUp, Star, Hash,
//     Percent, Award, ChevronRight, Trash2, Loader2
// } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import { getLoyaltyHistory } from "@/fonctions_api/fidelites.api";
// import { getTierConfig } from "@/modeles/fidelites";
// import type { LoyaltyProfile, LoyaltyEvent, Tier } from "@/modeles/fidelites";
// import { LoyaltyTierBadge } from "./LoyaltyTierBadge";
// import { LoyaltyTierProgressBar } from "./LoyaltyTierProgressBar";
// import { LoyaltyEventTimeline } from "./LoyaltyEventTimeline";
// import { LoyaltyTiersPanel } from "./LoyaltyTiersPanel";

// interface LoyaltyProfileDetailModalProps {
//     profile: LoyaltyProfile | null;
//     tiers: Tier[];
//     onClose: () => void;
//     onAdjust: () => void;
//     onDelete: () => void;
// }

// type ModalTab = "overview" | "history" | "tiers";

// export function LoyaltyProfileDetailModal({
//     profile, tiers, onClose, onAdjust, onDelete
// }: LoyaltyProfileDetailModalProps) {
//     const [tab, setTab] = useState<ModalTab>("overview");
//     const [events, setEvents] = useState<LoyaltyEvent[]>([]);
//     const [loadingEvents, setLoadingEvents] = useState(false);
//     const cfg = profile ? getTierConfig(profile.tier_name) : null;

//     useEffect(() => {
//         if (!profile) return;
//         setTab("overview");
//         setEvents([]);
//     }, [profile?.id]);

//     useEffect(() => {
//         if (tab !== "history" || !profile) return;
//         setLoadingEvents(true);
//         getLoyaltyHistory().then(res => {
//             if (res.ok) setEvents(res.data);
//         }).finally(() => setLoadingEvents(false));
//     }, [tab, profile?.id]);

//     if (!profile || !cfg) return null;

//     const months = Math.max(0, Math.round(
//         (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
//     ));
    
//     const userInitials = profile.user.name ? profile.user.name.substring(0, 2).toUpperCase() : profile.user.email.substring(0, 2).toUpperCase();

//     const TABS: { key: ModalTab; label: string }[] = [
//         { key: "overview", label: "Vue d'ensemble" },
//         { key: "history",  label: "Historique" },
//         { key: "tiers",    label: "Paliers" },
//     ];

//     return (
//         <AnimatePresence>
//             {profile && (
//                 <>
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         onClick={onClose}
//                         className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
//                     />
//                     <motion.div
//                         initial={{ opacity: 0, x: "100%" }}
//                         animate={{ opacity: 1, x: 0 }}
//                         exit={{ opacity: 0, x: "100%" }}
//                         transition={{ type: "spring", stiffness: 250, damping: 27 }}
//                         className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-surface-elevated border-l border-border/50 shadow-2xl"
//                     >
//                         {/* Header */}
//                         <div className="relative overflow-hidden border-b border-border/40 p-8">
//                             <div className={cn("absolute -right-10 -top-10 h-64 w-64 rounded-full blur-3xl opacity-20 bg-gradient-to-br", cfg.gradient)} />
//                             <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", cfg.gradient)} />

//                             <div className="relative flex items-start justify-between gap-4">
//                                 <div className="flex items-center gap-6">
//                                     {/* Avatar */}
//                                     <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-surface-alt shadow-xl">
//                                         {profile.user.profile_image ? (
//                                             <img src={profile.user.profile_image} alt={profile.user.name || profile.user.email} className="h-full w-full object-cover" />
//                                         ) : (
//                                             <div className={cn("flex h-full w-full items-center justify-center text-2xl font-black", cfg.textColor, cfg.bg)}>
//                                                 {userInitials}
//                                             </div>
//                                         )}
//                                         <div className={cn("absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px] border-surface", profile.user.is_active ? "bg-emerald-500" : "bg-red-500")} />
//                                     </div>
                                    
//                                     {/* Infos */}
//                                     <div className="space-y-1.5">
//                                         <div className="flex items-center gap-3">
//                                             <h2 className="text-2xl font-black tracking-tight text-foreground">
//                                                 {profile.user.name || "Client Anonyme"}
//                                             </h2>
//                                             <LoyaltyTierBadge tierName={profile.tier_name} size="sm" />
//                                         </div>
//                                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
//                                             <span className="flex items-center gap-1.5">
//                                                 <Hash className="h-3.5 w-3.5 text-muted-foreground/60" />
//                                                 {profile.user.email}
//                                             </span>
//                                             {profile.user.phone_number && (
//                                                 <span className="flex items-center gap-1.5">
//                                                     <div className="h-1 w-1 rounded-full bg-border" />
//                                                     {profile.user.phone_number}
//                                                 </span>
//                                             )}
//                                             <span className="flex items-center gap-1.5">
//                                                 <div className="h-1 w-1 rounded-full bg-border" />
//                                                 <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
//                                                 Membre depuis {months > 0 ? `${months} mois` : "récemment"}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <button onClick={onClose} className="shrink-0 rounded-xl border border-border/50 bg-surface/50 p-2 text-muted-foreground backdrop-blur-sm transition-all hover:bg-surface-elevated hover:text-foreground hover:shadow-sm">
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Tabs */}
//                         <div className="flex border-b border-border/40 px-6 pt-2">
//                             {TABS.map(t => (
//                                 <button
//                                     key={t.key}
//                                     onClick={() => setTab(t.key)}
//                                     className={cn(
//                                         "relative pb-3 pr-6 text-sm font-semibold transition-colors",
//                                         tab === t.key ? cfg.textColor : "text-muted-foreground hover:text-foreground"
//                                     )}
//                                 >
//                                     {t.label}
//                                     {tab === t.key && (
//                                         <motion.div
//                                             layoutId="loyalty-tab-indicator"
//                                             className={cn("absolute bottom-0 left-0 right-4 h-0.5 rounded-full bg-gradient-to-r", cfg.gradient)}
//                                         />
//                                     )}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Body */}
//                         <div className="flex-1 overflow-y-auto p-6">
//                             <AnimatePresence mode="wait">
//                                 {tab === "overview" && (
//                                     <motion.div
//                                         key="overview"
//                                         initial={{ opacity: 0, y: 10 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         exit={{ opacity: 0, y: -10 }}
//                                         className="space-y-6"
//                                     >
//                                         {/* Points Hero */}
//                                         <div className={cn(
//                                             "relative overflow-hidden rounded-2xl border p-6",
//                                             cfg.border, cfg.bg
//                                         )}>
//                                             <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br", cfg.gradient)} />
//                                             <div className="relative grid grid-cols-2 gap-4">
//                                                 <div>
//                                                     <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", cfg.textColor, "opacity-70")}>Solde disponible</p>
//                                                     <div className="flex items-baseline gap-1.5">
//                                                         <p className={cn("text-4xl font-extrabold tracking-tight", cfg.textColor)}>
//                                                             {profile.points_balance.toLocaleString("fr-FR")}
//                                                         </p>
//                                                         <p className={cn("text-xs font-bold", cfg.textColor, "opacity-60")}>pts</p>
//                                                     </div>
//                                                 </div>
//                                                 <div>
//                                                     <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", cfg.textColor, "opacity-70")}>Lifetime total</p>
//                                                     <div className="flex items-baseline gap-1.5">
//                                                         <p className={cn("text-2xl font-extrabold tracking-tight", cfg.textColor)}>
//                                                             {profile.total_points_earned.toLocaleString("fr-FR")}
//                                                         </p>
//                                                         <p className={cn("text-xs font-bold", cfg.textColor, "opacity-60")}>pts gagnés</p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Progression */}
//                                         <div className="rounded-2xl border border-border/50 bg-surface p-5">
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
//                                                 Progression vers le palier suivant
//                                             </h3>
//                                             <LoyaltyTierProgressBar
//                                                 currentPoints={profile.total_points_earned}
//                                                 currentTierName={profile.tier_name}
//                                                 tiers={tiers}
//                                                 compact={false}
//                                             />
//                                         </div>

//                                         {/* Avantages + Infos */}
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div className="rounded-2xl border border-border/50 bg-surface/50 p-5 shadow-sm">
//                                                 <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
//                                                     <Percent className="h-3 w-3" /> Avantage actif
//                                                 </h3>
//                                                 <p className={cn("text-2xl font-extrabold", cfg.textColor)}>
//                                                     {parseFloat(profile.tier?.discount_percent || "0")}%
//                                                 </p>
//                                                 <p className="text-[11px] text-muted-foreground mt-1">Réduction automatique</p>
//                                             </div>
//                                             <div className="rounded-2xl border border-border/50 bg-surface/50 p-5 shadow-sm">
//                                                 <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
//                                                     <TrendingUp className="h-3 w-3" /> Dépenses totales
//                                                 </h3>
//                                                 <p className="text-xl font-extrabold text-foreground tracking-tight">
//                                                     {formatCurrency(parseFloat(profile.total_solde || "0"), "FCFA")}
//                                                 </p>
//                                                 <p className="text-[11px] text-muted-foreground mt-1">Commandes livrées</p>
//                                             </div>
//                                         </div>

//                                         {/* Prochain palier */}
//                                         {profile.next_tier && (
//                                             <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
//                                                 <Award className="h-4 w-4 shrink-0 text-primary" />
//                                                 <p>{profile.next_tier}</p>
//                                             </div>
//                                         )}
//                                     </motion.div>
//                                 )}

//                                 {tab === "history" && (
//                                     <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
//                                         <LoyaltyEventTimeline events={events} loading={loadingEvents} />
//                                     </motion.div>
//                                 )}

//                                 {tab === "tiers" && (
//                                     <motion.div key="tiers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
//                                         <LoyaltyTiersPanel tiers={tiers} currentTierName={profile.tier_name} />
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>
//                         </div>

//                         {/* Footer */}
//                         <div className="border-t border-border/40 p-5 flex gap-3">
//                             <button
//                                 onClick={onDelete}
//                                 className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20"
//                             >
//                                 <Trash2 className="h-4 w-4" /> Supprimer
//                             </button>
//                             <button
//                                 onClick={onAdjust}
//                                 className={cn(
//                                     "relative flex-1 overflow-hidden rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-95 group bg-gradient-to-r",
//                                     cfg.gradient
//                                 )}
//                             >
//                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
//                                 <span className="flex items-center justify-center gap-2">
//                                     <Zap className="h-4 w-4" /> Ajuster les points
//                                 </span>
//                             </button>
//                         </div>
//                     </motion.div>
//                 </>
//             )}
//         </AnimatePresence>
//     );
// }
































// app/admin/components/fidelites/LoyaltyProfileDetailModal.tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, Calendar, TrendingUp, Hash,
  Percent, Award, Trash2, Loader2, Phone,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getLoyaltyHistory } from "@/fonctions_api/fidelites.api";
import { getTierConfig } from "@/modeles/fidelites";
import type { LoyaltyProfile, LoyaltyEvent, Tier } from "@/modeles/fidelites";
import { LoyaltyTierBadge } from "./LoyaltyTierBadge";
import { LoyaltyTierProgressBar } from "./LoyaltyTierProgressBar";
import { LoyaltyEventTimeline } from "./LoyaltyEventTimeline";
import { LoyaltyTiersPanel } from "./LoyaltyTiersPanel";

interface LoyaltyProfileDetailModalProps {
  profile: LoyaltyProfile | null;
  tiers: Tier[];
  onClose: () => void;
  onAdjust: () => void;
  onDelete: () => void;
}

type ModalTab = "overview" | "history" | "tiers";

const TABS: { key: ModalTab; label: string }[] = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "history",  label: "Historique" },
  { key: "tiers",    label: "Paliers" },
];

export function LoyaltyProfileDetailModal({
  profile, tiers, onClose, onAdjust, onDelete,
}: LoyaltyProfileDetailModalProps) {
  const [tab, setTab] = useState<ModalTab>("overview");
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const cfg = profile ? getTierConfig(profile.tier_name) : null;

  useEffect(() => {
    if (!profile) return;
    setTab("overview");
    setEvents([]);
  }, [profile?.id]);

  useEffect(() => {
    if (tab !== "history" || !profile) return;
    setLoadingEvents(true);
    getLoyaltyHistory()
      .then((res) => { if (res.ok) setEvents(res.data); })
      .finally(() => setLoadingEvents(false));
  }, [tab, profile?.id]);

  if (!profile || !cfg) return null;

  const months = Math.max(0, Math.round(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));
  const initials = (profile.user.name || profile.user.email || "?")
    .split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AnimatePresence>
      {profile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-surface border-l border-border/40 shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="relative overflow-hidden flex-shrink-0">
              {/* Gradient wash */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.07]", cfg.gradient)} />
              <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r", cfg.gradient)} />
              {/* Orb */}
              <div
                className={cn("absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-15 bg-gradient-to-br", cfg.gradient)}
              />

              <div className="relative px-6 pt-6 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Large avatar */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-surface shadow-lg">
                      {profile.user.profile_image ? (
                        <img
                          src={profile.user.profile_image}
                          alt={profile.user.name || profile.user.email}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className={cn("flex h-full w-full items-center justify-center text-xl font-black", cfg.bg, cfg.textColor)}>
                          {initials}
                        </div>
                      )}
                      <div
                        className={cn(
                          "absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface",
                          profile.user.is_active ? "bg-emerald-500" : "bg-rose-500"
                        )}
                      />
                    </div>

                    {/* Infos */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black tracking-tight text-foreground leading-none">
                          {profile.user.name || "Client Anonyme"}
                        </h2>
                        <LoyaltyTierBadge tierName={profile.tier_name} size="sm" />
                      </div>
                      <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 opacity-50" />
                          {profile.user.email}
                        </span>
                        {profile.user.phone_number && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 opacity-50" />
                            {profile.user.phone_number}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 opacity-50" />
                          Membre {months > 0 ? `depuis ${months} mois` : "récemment"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Close */}
                  <motion.button
                    whileHover={{ scale: 1.08, rotate: 90 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={onClose}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 bg-surface/60 text-muted-foreground backdrop-blur-sm hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Points headline in header */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={cn("text-3xl font-black tabular-nums", cfg.textColor)}>
                    {profile.points_balance.toLocaleString("fr-FR")}
                  </span>
                  <span className={cn("text-sm font-bold opacity-60", cfg.textColor)}>pts disponibles</span>
                </div>
              </div>

              {/* ── Tabs ── */}
              <div className="relative flex border-t border-border/30 px-6">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "relative pb-3 pt-3 pr-6 text-[12px] font-bold transition-colors",
                      tab === t.key ? cfg.textColor : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                    {tab === t.key && (
                      <motion.div
                        layoutId="modal-tab-indicator"
                        className={cn("absolute bottom-0 left-0 right-4 h-0.5 rounded-full bg-gradient-to-r", cfg.gradient)}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                {tab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
                  >
                    {/* Points card */}
                    <div className={cn("relative overflow-hidden rounded-2xl border p-5", cfg.border, cfg.bg)}>
                      <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-25 bg-gradient-to-br", cfg.gradient)} />
                      <div className="relative grid grid-cols-2 gap-4">
                        <div>
                          <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] opacity-60 mb-1", cfg.textColor)}>Solde disponible</p>
                          <div className="flex items-baseline gap-1">
                            <span className={cn("text-3xl font-black tabular-nums", cfg.textColor)}>
                              {profile.points_balance.toLocaleString("fr-FR")}
                            </span>
                            <span className={cn("text-[11px] font-bold opacity-50", cfg.textColor)}>pts</span>
                          </div>
                        </div>
                        <div>
                          <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] opacity-60 mb-1", cfg.textColor)}>Lifetime total</p>
                          <div className="flex items-baseline gap-1">
                            <span className={cn("text-xl font-black tabular-nums", cfg.textColor)}>
                              {profile.total_points_earned.toLocaleString("fr-FR")}
                            </span>
                            <span className={cn("text-[10px] font-bold opacity-50", cfg.textColor)}>pts</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="rounded-2xl border border-border/40 bg-surface p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 mb-3">
                        Progression vers le palier suivant
                      </p>
                      <LoyaltyTierProgressBar
                        currentPoints={profile.total_points_earned}
                        currentTierName={profile.tier_name}
                        tiers={tiers}
                        compact={false}
                      />
                    </div>

                    {/* Stats 2x2 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/40 bg-surface p-4">
                        <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-2">
                          <Percent className="h-2.5 w-2.5" />Avantage actif
                        </p>
                        <p className={cn("text-2xl font-black", cfg.textColor)}>
                          {parseFloat(profile.tier?.discount_percent || "0")}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Réduction auto</p>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-surface p-4">
                        <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-2">
                          <TrendingUp className="h-2.5 w-2.5" />Dépenses totales
                        </p>
                        <p className="text-lg font-black text-foreground tracking-tight">
                          {formatCurrency(parseFloat(profile.total_solde || "0"), "FCFA")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Commandes livrées</p>
                      </div>
                    </div>

                    {/* Next tier hint */}
                    {profile.next_tier && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-surface px-4 py-3 text-xs text-muted-foreground">
                        <Award className="h-4 w-4 shrink-0 text-primary" />
                        <p>{profile.next_tier}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {tab === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    {loadingEvents ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <LoyaltyEventTimeline events={events} loading={loadingEvents} />
                    )}
                  </motion.div>
                )}

                {tab === "tiers" && (
                  <motion.div
                    key="tiers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <LoyaltyTiersPanel tiers={tiers} currentTierName={profile.tier_name} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer actions ── */}
            <div className="flex-shrink-0 border-t border-border/30 p-4 flex gap-2.5">
              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onDelete}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-rose-500/15 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </motion.button>

              {/* Adjust — shimmer CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onAdjust}
                className={cn(
                  "relative flex-1 overflow-hidden rounded-xl py-2.5 text-[12px] font-bold text-white shadow-md bg-gradient-to-r",
                  cfg.gradient
                )}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Ajuster les points
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}