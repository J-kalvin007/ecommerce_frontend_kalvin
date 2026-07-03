"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MapPin, DollarSign, Navigation2, Loader2, AlertCircle } from "lucide-react";
import type { FraisLivraison } from "@/modeles/livraisons";
import { createFraisLivraison, partialUpdateFraisLivraison } from "@/fonctions_api/livraisons.api";
import CarteGoogleMaps from "@/app/(storefront)/commandes/components/CarteGoogleMaps";
import { cn } from "@/lib/utils";

interface FraisLivraisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  fraisConfig: FraisLivraison | null;
  onSuccess: () => void;
}

export default function FraisLivraisonModal({ isOpen, onClose, fraisConfig, onSuccess }: FraisLivraisonModalProps) {
  const [prixLivraison, setPrixLivraison] = useState("");
  const [coordonneeAdmin, setCoordonneeAdmin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const parseCoords = (coordsStr: string) => {
    if (!coordsStr) return null;
    const parts = coordsStr.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return null;
  };

  useEffect(() => {
    if (fraisConfig) {
      setPrixLivraison(fraisConfig.prix_livraison);
      setCoordonneeAdmin(fraisConfig.coordonnee_admin || "");
    } else {
      setPrixLivraison("");
      setCoordonneeAdmin("Lomé");
    }
    setError(null);
    setLocationSuccess(false);
  }, [fraisConfig, isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    
    setIsLocating(true);
    setError(null);
    setLocationSuccess(false);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordonneeAdmin(`${position.coords.latitude}, ${position.coords.longitude}`);
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      },
      (err) => {
        setError("Erreur lors de la récupération de votre position. Vérifiez vos permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      prix_livraison: prixLivraison,
      coordonnee_admin: coordonneeAdmin,
      is_active: true,
    };

    let res;
    if (fraisConfig) {
      res = await partialUpdateFraisLivraison(fraisConfig.id, payload);
    } else {
      res = await createFraisLivraison(payload);
    }

    setIsSubmitting(false);

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      setError(res.error?.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop avec flou élégant */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl dark:bg-[#1e1e1e]"
          >
            {/* Décoration supérieure */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1f4d3f] via-[#c9a876] to-[#1f4d3f]" />

            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-7 py-5 dark:border-slate-800 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4d3f]/10 dark:bg-[#1f4d3f]/20">
                  <MapPin className="h-5 w-5 text-[#1f4d3f] dark:text-[#2d7a63]" />
                </div>
                <h3 className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Configuration des Frais
                </h3>
              </div>
              <button
                onClick={onClose}
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Corps du formulaire */}
            <form onSubmit={handleSubmit} className="px-7 py-6">
              <div className="space-y-6">
                
                {/* Alerte d'erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <p className="text-[13px] font-medium text-red-700 dark:text-red-400">
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Champ: Prix de Livraison */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Prix de Livraison Standard
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <DollarSign className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#1f4d3f]" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prixLivraison}
                      onChange={(e) => setPrixLivraison(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-[#1f4d3f] focus:ring-4 focus:ring-[#1f4d3f]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="Ex: 1500.00"
                    />
                  </div>
                </div>

                {/* Champ: Coordonnées Admin */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-[13px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <span>Point de départ (Coordonnées)</span>
                  </label>
                  
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1 group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <MapPin className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#1f4d3f]" />
                      </div>
                      <input
                        type="text"
                        required
                        value={coordonneeAdmin}
                        onChange={(e) => setCoordonneeAdmin(e.target.value)}
                        className={cn(
                          "w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition-all focus:border-[#1f4d3f] focus:ring-4 focus:ring-[#1f4d3f]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
                          locationSuccess ? "border-emerald-500 ring-4 ring-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "text-slate-900"
                        )}
                        placeholder="Ex: 6.1375, 1.2123"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(true)}
                      className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 hover:shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <MapPin className="h-4 w-4" />
                      Carte
                    </button>
                  </div>

                  {/* Bouton de géolocalisation automatique */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#1f4d3f]/30 bg-[#1f4d3f]/5 py-3 text-[13px] font-semibold text-[#1f4d3f] transition-all hover:bg-[#1f4d3f]/10 hover:border-[#1f4d3f]/50 disabled:opacity-50 dark:border-[#2d7a63]/30 dark:bg-[#2d7a63]/10 dark:text-[#2d7a63]"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Recherche de la position...
                        </>
                      ) : (
                        <>
                          <Navigation2 className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          Utiliser ma position actuelle
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Ces coordonnées servent à calculer automatiquement les distances de livraison avec les adresses des clients. (Format: latitude, longitude)
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-2xl bg-slate-100 px-6 py-3.5 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 py-3.5 text-[14px] font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-50 sm:w-auto"
                  style={{
                    background: `linear-gradient(135deg, #1f4d3f, #2d7a63)`,
                  }}
                >
                  {/* Shimmer effect */}
                  {!isSubmitting && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                  
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "Enregistrement..." : "Enregistrer"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      <CarteGoogleMaps
        open={isMapOpen}
        initialCoords={parseCoords(coordonneeAdmin)}
        onConfirm={(lat, lng) => {
          setCoordonneeAdmin(`${lat}, ${lng}`);
          setIsMapOpen(false);
        }}
        onClose={() => setIsMapOpen(false)}
      />
    </AnimatePresence>
  );
}
