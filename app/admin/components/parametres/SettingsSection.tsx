/**
 * SettingsSection — Configuration globale de la plateforme
 * @module app/admin/components/SettingsSection
 */

"use client";

import { Save, Settings2, Globe, CreditCard, Mail, Truck, Shield } from "lucide-react";

export default function SettingsSection() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings2 className="h-6 w-6 text-orange-400" /> Paramètres</h1>
          <p className="text-sm text-white/40">Configuration globale de l'e-commerce.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
          <Save className="h-4 w-4" /> Enregistrer
        </button>
      </div>

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
