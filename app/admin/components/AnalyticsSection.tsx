/**
 * AnalyticsSection — Métriques et performances
 * @module app/admin/components/AnalyticsSection
 */

"use client";

import { BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Download, Calendar } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const METRICS = [
  { label: "Chiffre d'affaires (30j)", value: 45230, prev: 42100, format: "currency" },
  { label: "Commandes (30j)", value: 842, prev: 790, format: "number" },
  { label: "Panier moyen", value: 53.71, prev: 53.29, format: "currency" },
  { label: "Nouveaux clients", value: 156, prev: 180, format: "number" },
];

export default function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-white/40">Performances globales de la plateforme (données consolidées par DailyMetric).</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
            <Calendar className="h-4 w-4" /> 30 derniers jours
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
            <Download className="h-4 w-4" /> Exporter le rapport
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => {
          const diff = m.value - m.prev;
          const pct = (diff / m.prev) * 100;
          const isPos = pct > 0;
          return (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <p className="text-sm text-white/40 mb-2">{m.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">
                  {m.format === "currency" ? formatCurrency(m.value, "FCFA") : m.value}
                </p>
                <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md", isPos ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                  {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(pct).toFixed(1)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder pour un graphique */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white">Évolution du CA</h3>
            <BarChart3 className="h-5 w-5 text-white/30" />
          </div>
          <div className="h-64 flex items-end gap-2">
            {[40, 70, 45, 90, 65, 85, 110, 60, 50, 95, 80, 100].map((h, i) => (
              <div key={i} className="w-full bg-orange-500/20 rounded-t-sm hover:bg-orange-500/40 transition-colors group relative" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] py-1 px-2 rounded pointer-events-none transition-opacity">
                   {formatCurrency(h * 100, "FCFA")}
                 </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-white/30 font-mono">
            <span>01 Avr</span>
            <span>15 Avr</span>
            <span>30 Avr</span>
          </div>
        </div>

        {/* Top Produits */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="font-bold text-white mb-6">Produits Phares</h3>
          <div className="space-y-4">
            {[
              { n: "Huile d'Olive Extra...", s: 234, v: 5826.60 },
              { n: "Safran Pure de la...", s: 189, v: 2362.50 },
              { n: "Thé Matcha Cérém...", s: 156, v: 4664.40 },
              { n: "Miel de Manuka...", s: 134, v: 6686.60 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">{p.n}</span>
                  <span className="text-[10px] text-white/40">{p.s} ventes</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{formatCurrency(p.v, "FCFA")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
