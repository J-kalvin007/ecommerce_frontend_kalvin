/**
 * LoyaltySection — Gestion du programme de fidélité
 * @module app/admin/components/LoyaltySection
 */

"use client";

import { Trophy, Star, Gift, Users, Edit3, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
  { id: "BRONZE", name: "Bronze", min_points: 0, discount: 0, users: 4500, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "SILVER", name: "Argent", min_points: 500, discount: 5, users: 2100, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20" },
  { id: "GOLD", name: "Or", min_points: 2000, discount: 10, users: 850, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "PLATINUM", name: "Platine", min_points: 5000, discount: 15, users: 156, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
];

export default function LoyaltySection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Programme de Fidélité</h1>
          <p className="text-sm text-white/40">Gérez les paliers et les règles d'attribution des points.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
          <Settings className="h-4 w-4" /> Paramètres des points
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <div key={tier.id} className={cn("relative rounded-2xl border bg-white/[0.02] p-5 overflow-hidden", tier.border)}>
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-20", tier.bg)} />

            <div className={cn("mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold", tier.bg, tier.color)}>
              <Trophy className="h-4 w-4" /> {tier.name}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-medium uppercase text-white/40 mb-1">Seuil d'accès</p>
                <p className="text-lg font-bold text-white flex items-center gap-2"><Star className="h-4 w-4 text-orange-400" /> {tier.min_points} pts</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase text-white/40 mb-1">Avantage</p>
                <p className="text-sm font-semibold text-white flex items-center gap-2"><Gift className="h-4 w-4 text-emerald-400" /> -{tier.discount}% sur tout</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-white/60 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Membres</span>
                  <span className="font-bold text-white">{tier.users}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="mb-4 text-lg font-bold text-white">Règles d'acquisition</h3>
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
            <div>
              <p className="font-semibold text-white">Achat de produits</p>
              <p className="text-xs text-white/50">Points gagnés par euro dépensé</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-orange-400">1 f = 10 pts</span>
              <button className="text-white/30 hover:text-white"><Edit3 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
            <div>
              <p className="font-semibold text-white">Inscription</p>
              <p className="text-xs text-white/50">Bonus de bienvenue</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-orange-400">+ 500 pts</span>
              <button className="text-white/30 hover:text-white"><Edit3 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
            <div>
              <p className="font-semibold text-white">Parrainage</p>
              <p className="text-xs text-white/50">Points par filleul ayant commandé</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-orange-400">+ 1000 pts</span>
              <button className="text-white/30 hover:text-white"><Edit3 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
