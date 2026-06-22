/**
 * LocalisationCarte — Bouton de localisation + intégration CarteGoogleMaps
 *
 * - Bouton "Localiser sur la carte" ouvrant CarteGoogleMaps
 * - Bouton "Ma position actuelle" via Geolocation API
 * - Stockage au format : "{adresse_texte}|{lat}&{lng}"
 * - Affichage du résumé de la position sélectionnée
 *
 * @module components/commandes/LocalisationCarte
 */

"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Loader2, CheckCircle2, X } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import dynamic from "next/dynamic";

/** Chargement dynamique pour éviter le SSR de Google Maps */
const CarteGoogleMaps = dynamic(
  () => import("@/app/(storefront)/commandes/components/CarteGoogleMaps"),
  { ssr: false, loading: () => null }
);

/* ─────────────────────────────────────────────────────────────────────────────
   Format de stockage de l'adresse
   "{adresse_texte}|{latitude}&{longitude}"
   Exemple : "Rue du Commerce, Lomé|6.1375&1.2123"
   ─────────────────────────────────────────────────────────────────────────── */

interface LocalisationCarteProps {
  /** Valeur courante du champ adresse (format texte|lat&lng) */
  value: string;
  /** Callback de mise à jour du champ adresse */
  onChange: (valeur: string) => void;
}

/** Parse la coordonnée depuis le format stocké */
function parseCoords(valeur: string): { lat: number; lng: number } | null {
  const parts = valeur.split("|");
  if (parts.length < 2) return null;
  const coordParts = parts[1].split("&");
  if (coordParts.length < 2) return null;
  const lat = parseFloat(coordParts[0]);
  const lng = parseFloat(coordParts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

/** Extrait le texte de l'adresse depuis le format stocké */
function parseAdresseTexte(valeur: string): string {
  return valeur.split("|")[0] ?? "";
}

export default function LocalisationCarte({ value, onChange }: LocalisationCarteProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [carteOuverte, setCarteOuverte] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const coordsCourantes = parseCoords(value);
  const adresseTexte = parseAdresseTexte(value);
  const aPosition = coordsCourantes !== null;

  /**
   * Appelé quand l'utilisateur confirme une position sur la carte.
   * On effectue un reverse geocoding léger pour obtenir l'adresse texte.
   */
  const handleConfirmCarte = useCallback(
    async (lat: number, lng: number) => {
      let adresse = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      // Tentative de reverse geocoding via API navigateur Nominatim (gratuit, no key)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
        );
        if (res.ok) {
          const data = await res.json();
          adresse = data.display_name ?? adresse;
        }
      } catch {
        // Fallback silencieux
      }

      onChange(`${adresse}|${lat}&${lng}`);
    },
    [onChange]
  );

  /**
   * Géolocalisation via l'API du navigateur
   */
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Géolocalisation non supportée par votre navigateur");
      return;
    }
    setIsGeolocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setIsGeolocating(false);
        await handleConfirmCarte(coords.latitude, coords.longitude);
      },
      (err) => {
        setIsGeolocating(false);
        setGeoError(
          err.code === 1
            ? "Permission refusée. Autorisez la localisation dans votre navigateur."
            : "Impossible de récupérer votre position. Réessayez."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [handleConfirmCarte]);

  /** Effacer la position sélectionnée */
  const handleEffacer = useCallback(() => {
    onChange("");
  }, [onChange]);

  /* Thème */
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const bg = isDark ? "rgba(255,255,255,0.04)" : "#fafaf9";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div className="space-y-3">
      {/* Boutons d'action */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Ouvrir la carte */}
        <button
          type="button"
          onClick={() => setCarteOuverte(true)}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.01]"
          style={{
            background: isDark ? "rgba(31,77,63,0.15)" : "rgba(31,77,63,0.07)",
            border: `1.5px solid ${aPosition ? "#1f4d3f" : border}`,
            color: aPosition ? "#1f4d3f" : text,
          }}
        >
          <MapPin className="h-4 w-4" />
          {aPosition ? "Modifier la position sur la carte" : "Localiser sur la carte"}
        </button>

        {/* Ma position actuelle */}
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isGeolocating}
          className="cursor-pointer flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 sm:flex-initial"
          style={{
            background: isDark ? "rgba(139,94,52,0.12)" : "rgba(139,94,52,0.07)",
            border: `1.5px solid ${border}`,
            color: isDark ? "#d4a966" : "#8b5e34",
          }}
        >
          {isGeolocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {isGeolocating ? "Localisation…" : "Ma position"}
        </button>
      </div>

      {/* Erreur géolocalisation */}
      <AnimatePresence>
        {geoError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium text-red-500"
          >
            {geoError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Affichage de la position sélectionnée */}
      <AnimatePresence>
        {aPosition && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(31,77,63,0.12)" }}
            >
              <CheckCircle2 className="h-4 w-4" style={{ color: "#1f4d3f" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#1f4d3f" }}>
                Position confirmée
              </p>
              <p className="mt-0.5 truncate text-xs" style={{ color: muted }}>
                {adresseTexte || "Coordonnées GPS enregistrées"}
              </p>
              {coordsCourantes && (
                <p className="mt-0.5 font-mono text-[10px]" style={{ color: muted }}>
                  {coordsCourantes.lat.toFixed(6)}, {coordsCourantes.lng.toFixed(6)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleEffacer}
              className="cursor-pointer shrink-0 rounded-full p-1 transition-all hover:scale-110"
              style={{ color: muted }}
              aria-label="Effacer la position"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de la carte */}
      <CarteGoogleMaps
        open={carteOuverte}
        initialCoords={coordsCourantes}
        onConfirm={handleConfirmCarte}
        onClose={() => setCarteOuverte(false)}
      />
    </div>
  );
}
