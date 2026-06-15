/**
 * BannersSection — Gestion des bannières marketing
 * @module app/admin/components/BannersSection
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Plus, Monitor, Smartphone, Globe, Eye, Edit3, Trash2, Power } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_BANNERS = [
  { id: "1", title: "Nouvelle Collection Safran", position: "HOMEPAGE_HERO", image: "/assets/images/img_10.png", active: true, starts: "2026-04-01", ends: "2026-05-31", countries: ["FR", "MA"] },
  { id: "2", title: "Livraison Offerte", position: "POPUP", image: "/assets/images/img_08.jpg", active: false, starts: "2026-03-01", ends: "2026-03-15", countries: [] },
  { id: "3", title: "Promo -20% Thés", position: "CATEGORY_TOP", image: "/assets/images/img_11.png", active: true, starts: "2026-04-15", ends: "2026-04-30", countries: ["FR", "BE", "CH"] },
];

const POSITIONS: Record<string, string> = {
  HOMEPAGE_HERO: "Hero Accueil",
  HOMEPAGE_SECONDARY: "Secondaire Accueil",
  CATEGORY_TOP: "Haut Catégorie",
  SIDEBAR: "Barre Latérale",
  POPUP: "Popup",
};

export default function BannersSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ImageIcon className="h-6 w-6 text-orange-400" /> Bannières</h1>
          <p className="text-sm text-white/40">Gérez les visuels publicitaires et popups.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
          <Plus className="h-4 w-4" /> Ajouter une bannière
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BANNERS.map((banner) => (
          <div key={banner.id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            {/* Image Preview */}
            <div className="relative h-48 w-full bg-black/50 overflow-hidden">
              <Image src={banner.image} alt={banner.title} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
              
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold uppercase backdrop-blur-md", banner.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50")}>
                  {banner.active ? "En ligne" : "Inactif"}
                </span>
                <span className="rounded-full bg-black/40 backdrop-blur-md px-2 py-1 text-[9px] font-bold text-white uppercase">
                  {POSITIONS[banner.position]}
                </span>
              </div>
              
              <div className="absolute top-3 right-3 flex gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/50 hover:bg-black/80 hover:text-white backdrop-blur-md transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/50 hover:bg-black/80 hover:text-red-400 backdrop-blur-md transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 relative">
              <h3 className="text-lg font-bold text-white mb-2">{banner.title}</h3>
              
              <div className="flex flex-col gap-2 text-xs text-white/50">
                <div className="flex items-center gap-2"><ClockIcon className="h-3.5 w-3.5" /> {banner.starts} → {banner.ends}</div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> 
                  {banner.countries.length > 0 ? banner.countries.join(", ") : "Global (Tous pays)"}
                </div>
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5">
                   <div className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5 text-white/30" /> <span className="text-emerald-400">Prêt</span></div>
                   <div className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5 text-white/30" /> <span className="text-emerald-400">Prêt</span></div>
                </div>
              </div>
              
              <button className={cn("absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors", banner.active ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white")}>
                 <Power className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClockIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
