"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MapPin, DollarSign } from "lucide-react";
import type { FraisLivraison } from "@/modeles/livraisons";
import { createFraisLivraison, partialUpdateFraisLivraison } from "@/fonctions_api/livraisons.api";

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

  useEffect(() => {
    if (fraisConfig) {
      setPrixLivraison(fraisConfig.prix_livraison);
      setCoordonneeAdmin(fraisConfig.coordonnee_admin || "");
    } else {
      setPrixLivraison("");
      setCoordonneeAdmin("Lomé");
    }
    setError(null);
  }, [fraisConfig, isOpen]);

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
      setError(res.error?.message || "Une erreur est survenue.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative z-50 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E8E3D8] bg-[#F7F5F0] px-6 py-4">
              <h3 className="text-lg font-bold text-[#1f241c]">Configuration des Frais</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#8A9080] transition-colors hover:bg-[#E8E3D8] hover:text-[#1f241c]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#1f241c]">Prix de Livraison Standard</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prixLivraison}
                    onChange={(e) => setPrixLivraison(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
                    placeholder="Ex: 1500.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#1f241c]">Coordonnées Admin (Point de départ)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9080]" />
                  <input
                    type="text"
                    required
                    value={coordonneeAdmin}
                    onChange={(e) => setCoordonneeAdmin(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E3D8] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#1f4d3f] focus:ring-1 focus:ring-[#1f4d3f]/20"
                    placeholder="Ex: Lomé, Togo ou Lat/Lng"
                  />
                </div>
                <p className="text-[11px] text-[#8A9080]">Utilisé pour calculer les distances de livraison si activé.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-[#8A9080] transition-colors hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#16332b] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
