/**
 * SettingsSection — Configuration globale de la plateforme
 * @module app/admin/components/SettingsSection
 */

"use client";

import { motion } from "framer-motion";
import { Save, Settings2, Globe, CreditCard, Mail, Truck, Shield } from "lucide-react";

export default function SettingsSection() {
  return (
    <div className="space-y-6 max-w-4xl px-20">









      {/* ── En-tête avec effet premium ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-2"
      >
        <div className="relative inline-block group">
          <h2
            className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
            style={{
              letterSpacing: "-0.025em",
              backgroundImage:
                "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
              backgroundSize: "220% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <Settings2 className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
            Paramètres
          </h2>

          {/* Kicker discret en lettres espacées doré, signature premium */}
          <span
            className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
            style={{ color: "#B8924A", opacity: 0.85 }}
          >
            Configuration globale de l'e-commerce.
          </span>

          {/* Gradient SVG caché pour l'icône */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>


          {/* Animations scoppées, avec respect du prefers-reduced-motion */}
          <style>{`
            @keyframes premium-title-shine-anim {
              0%, 100% { background-position: 0% center; }
              50% { background-position: 100% center; }
            }
            .premium-title-shine {
              animation: premium-title-shine-anim 6s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .premium-title-shine {
                animation: none;
              }
            }
          `}</style>
        </div>
      </motion.div>












      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: "general", icon: Globe, label: "Général" },
            { id: "payment", icon: CreditCard, label: "Paiements" },
            { id: "shipping", icon: Truck, label: "Livraison" },
            { id: "emails", icon: Mail, label: "Emails" },
            { id: "security", icon: Shield, label: "Sécurité" },
          ].map((tab, idx) => (
            <button key={tab.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${idx === 0 ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-4">Informations de la boutique</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Nom de la boutique</label>
                <input defaultValue="Atelier du terroir Royal" className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Email de contact</label>
                <input defaultValue="contact@Atelier du terroir-royal.com" className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Description (SEO)</label>
              <textarea defaultValue="Boutique de produits luxueux et épices." className="h-24 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-orange-500/50 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Devise par défaut</label>
                <select className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-orange-500/50">
                  <option value="FCFA">Franc CFA (FCFA)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="MAD">Dirham (MAD)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Langue principale</label>
                <select className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-orange-500/50">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
