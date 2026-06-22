'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search, Navigation, Check, Loader2 } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

const LIBRARIES: ['places'] = ['places'];
const DEFAULT_CENTER = { lat: 6.1375, lng: 1.2123 }; // Lomé, Togo

interface MapPickerModalProps {
  open: boolean;
  initialCoords?: { lat: number; lng: number } | null;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function CarteGoogleMaps({ open, initialCoords, onConfirm, onClose }: MapPickerModalProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialCoords || null);
  const [mapCenter, setMapCenter] = useState(initialCoords || DEFAULT_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (initialCoords) { setMarker(initialCoords); setMapCenter(initialCoords); }
  }, [initialCoords]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const handleMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  const initAutocomplete = useCallback(() => {
    if (!searchRef.current || !window.google || autocompleteRef.current) return;
    autocompleteRef.current = new google.maps.places.Autocomplete(searchRef.current);
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        setMapCenter({ lat, lng });
        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(15);
      }
    });
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setMarker({ lat, lng });
        setMapCenter({ lat, lng });
        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(16);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (marker) { onConfirm(marker.lat, marker.lng); onClose(); }
  };

  // Premium dark map styles
  const darkStyles: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#0d1f14' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1f14' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#4a7850' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2e1e' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a4a30' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1a12' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1e' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a3e2e' }] },
    { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#6aaa72' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9abfa0' }] },
  ];

  const accent = '#4a7850';
  const cardBg = isDark ? 'linear-gradient(160deg, rgba(14,26,17,0.98), rgba(6,12,8,0.99))' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const textColor = isDark ? 'rgba(255,255,255,0.92)' : '#1a1f1b';
  const mutedColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#f8f9f8';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="cursor-pointer absolute inset-0 backdrop-blur-md"
            style={{ background: isDark ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.5)' }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-2xl rounded-[2rem] overflow-hidden flex flex-col"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.7)' : '0 30px 60px rgba(0,0,0,0.12)', maxHeight: '90vh' }}
          >
            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-28 opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top, ${accent}, transparent 70%)` }} />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(74,120,80,0.15)', border: '1px solid rgba(74,120,80,0.3)' }}>
                  <MapPin className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: textColor, fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Localisation de la ferme
                  </h3>
                  <p className="text-xs" style={{ color: mutedColor }}>Cliquez sur la carte pour positionner la ferme</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: mutedColor }}>
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative z-10 px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: mutedColor }} />
                <input
                  ref={searchRef}
                  type="text"
                  onFocus={initAutocomplete}
                  placeholder="Rechercher un lieu, un village, une ville..."
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }}
                  onMouseEnter={e => (e.currentTarget.style.border = `1px solid rgba(74,120,80,0.4)`)}
                  onMouseLeave={e => (e.currentTarget.style.border = `1px solid ${inputBorder}`)}
                />
                <button onClick={handleGeolocate} disabled={isLocating} title="Utiliser ma position"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-50"
                  style={{ background: 'rgba(74,120,80,0.15)', color: accent }}>
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="relative z-10 mx-6 rounded-2xl overflow-hidden" style={{ minHeight: 320, border: `1px solid ${inputBorder}` }}>
              {!isLoaded && !loadError && (
                <div className="w-full flex items-center justify-center flex-col gap-3" style={{ height: 320, background: isDark ? 'rgba(74,120,80,0.06)' : 'rgba(74,120,80,0.03)' }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: accent }} />
                  <p className="text-sm" style={{ color: mutedColor }}>Chargement de la carte...</p>
                </div>
              )}
              {loadError && (
                <div className="w-full flex items-center justify-center" style={{ height: 320 }}>
                  <p className="text-sm" style={{ color: '#ef4444' }}>Erreur de chargement Google Maps</p>
                </div>
              )}
              {isLoaded && !loadError && (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '320px' }}
                  center={mapCenter}
                  zoom={marker ? 15 : 10}
                  onClick={handleMapClick}
                  onLoad={handleMapLoad}
                  options={{
                    styles: isDark ? darkStyles : [],
                    disableDefaultUI: true,
                    zoomControl: true,
                    gestureHandling: 'greedy',
                    clickableIcons: false,
                  }}
                 className="cursor-pointer">
                  {marker && (
                    <Marker
                      position={marker}
                      icon={isLoaded ? {
                        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                        fillColor: accent,
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2,
                        scale: 1.8,
                        anchor: new google.maps.Point(12, 24),
                      } : undefined}
                    />
                  )}
                </GoogleMap>
              )}
            </div>

            {/* Tip */}
            {!marker && isLoaded && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center text-xs py-3" style={{ color: mutedColor }}>
                <MapPin className="inline w-3 h-3 mr-1" />
                Cliquez n'importe où sur la carte pour placer le marqueur
              </motion.p>
            )}

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between gap-4 px-6 py-5"
              style={{ borderTop: `1px solid ${inputBorder}` }}>
              <div className="flex-1">
                {marker ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: mutedColor }}>Position sélectionnée</p>
                    <div className="flex items-center gap-2">
                      <motion.div className="w-2 h-2 rounded-full" style={{ background: '#6aaa72' }}
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }} />
                      <code className="text-sm font-mono font-semibold" style={{ color: accent }}>
                        {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                      </code>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic" style={{ color: mutedColor }}>Aucune position sélectionnée</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: mutedColor }}>
                  Annuler
                </button>
                <button onClick={handleConfirm} disabled={!marker}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: accent, boxShadow: marker ? `0 8px 20px -8px ${accent}80` : 'none' }}>
                  <Check className="w-4 h-4" /> Confirmer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
