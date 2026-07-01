/**
 * PaysSelector — Dropdown premium de sélection de pays
 *
 * - Liste complète de tous les pays du monde avec drapeaux emoji
 * - Recherche temps réel
 * - Togo (TG) sélectionné par défaut
 * - Full dark/light mode via useThemeStore
 * - Accessible (ARIA labels, navigation clavier)
 *
 * @module components/commandes/PaysSelector
 */

"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { useThemeStore } from "@/store/theme.store";

/* -----------------------------------------------------------------------------
   Données — Liste complète des pays
   --------------------------------------------------------------------------- */

const PAYS_MONDE = [
  { code: "AF", nom: "Afghanistan", drapeau: "🇦🇫" },
  { code: "ZA", nom: "Afrique du Sud", drapeau: "🇿🇦" },
  { code: "AL", nom: "Albanie", drapeau: "🇦🇱" },
  { code: "DZ", nom: "Algérie", drapeau: "🇩🇿" },
  { code: "DE", nom: "Allemagne", drapeau: "🇩🇪" },
  { code: "AD", nom: "Andorre", drapeau: "🇦🇩" },
  { code: "AO", nom: "Angola", drapeau: "🇦🇴" },
  { code: "AG", nom: "Antigua-et-Barbuda", drapeau: "🇦🇬" },
  { code: "SA", nom: "Arabie Saoudite", drapeau: "🇸🇦" },
  { code: "AR", nom: "Argentine", drapeau: "🇦🇷" },
  { code: "AM", nom: "Arménie", drapeau: "🇦🇲" },
  { code: "AU", nom: "Australie", drapeau: "🇦🇺" },
  { code: "AT", nom: "Autriche", drapeau: "🇦🇹" },
  { code: "AZ", nom: "Azerbaïdjan", drapeau: "🇦🇿" },
  { code: "BS", nom: "Bahamas", drapeau: "🇧🇸" },
  { code: "BH", nom: "Bahreïn", drapeau: "🇧🇭" },
  { code: "BD", nom: "Bangladesh", drapeau: "🇧🇩" },
  { code: "BB", nom: "Barbade", drapeau: "🇧🇧" },
  { code: "BE", nom: "Belgique", drapeau: "🇧🇪" },
  { code: "BZ", nom: "Belize", drapeau: "🇧🇿" },
  { code: "BJ", nom: "Bénin", drapeau: "🇧🇯" },
  { code: "BT", nom: "Bhoutan", drapeau: "🇧🇹" },
  { code: "BY", nom: "Biélorussie", drapeau: "🇧🇾" },
  { code: "BO", nom: "Bolivie", drapeau: "🇧🇴" },
  { code: "BA", nom: "Bosnie-Herzégovine", drapeau: "🇧🇦" },
  { code: "BW", nom: "Botswana", drapeau: "🇧🇼" },
  { code: "BR", nom: "Brésil", drapeau: "🇧🇷" },
  { code: "BN", nom: "Brunei", drapeau: "🇧🇳" },
  { code: "BG", nom: "Bulgarie", drapeau: "🇧🇬" },
  { code: "BF", nom: "Burkina Faso", drapeau: "🇧🇫" },
  { code: "BI", nom: "Burundi", drapeau: "🇧🇮" },
  { code: "KH", nom: "Cambodge", drapeau: "🇰🇭" },
  { code: "CM", nom: "Cameroun", drapeau: "🇨🇲" },
  { code: "CA", nom: "Canada", drapeau: "🇨🇦" },
  { code: "CV", nom: "Cap-Vert", drapeau: "🇨🇻" },
  { code: "CF", nom: "Centrafrique", drapeau: "🇨🇫" },
  { code: "CL", nom: "Chili", drapeau: "🇨🇱" },
  { code: "CN", nom: "Chine", drapeau: "🇨🇳" },
  { code: "CY", nom: "Chypre", drapeau: "🇨🇾" },
  { code: "CO", nom: "Colombie", drapeau: "🇨🇴" },
  { code: "KM", nom: "Comores", drapeau: "🇰🇲" },
  { code: "CG", nom: "Congo", drapeau: "🇨🇬" },
  { code: "CD", nom: "Congo (RDC)", drapeau: "🇨🇩" },
  { code: "KR", nom: "Corée du Sud", drapeau: "🇰🇷" },
  { code: "CR", nom: "Costa Rica", drapeau: "🇨🇷" },
  { code: "CI", nom: "Côte d'Ivoire", drapeau: "🇨🇮" },
  { code: "HR", nom: "Croatie", drapeau: "🇭🇷" },
  { code: "CU", nom: "Cuba", drapeau: "🇨🇺" },
  { code: "DK", nom: "Danemark", drapeau: "🇩🇰" },
  { code: "DJ", nom: "Djibouti", drapeau: "🇩🇯" },
  { code: "EG", nom: "Égypte", drapeau: "🇪🇬" },
  { code: "AE", nom: "Émirats arabes unis", drapeau: "🇦🇪" },
  { code: "EC", nom: "Équateur", drapeau: "🇪🇨" },
  { code: "ER", nom: "Érythrée", drapeau: "🇪🇷" },
  { code: "ES", nom: "Espagne", drapeau: "🇪🇸" },
  { code: "EE", nom: "Estonie", drapeau: "🇪🇪" },
  { code: "SZ", nom: "Eswatini", drapeau: "🇸🇿" },
  { code: "ET", nom: "Éthiopie", drapeau: "🇪🇹" },
  { code: "FJ", nom: "Fidji", drapeau: "🇫🇯" },
  { code: "FI", nom: "Finlande", drapeau: "🇫🇮" },
  { code: "FR", nom: "France", drapeau: "🇫🇷" },
  { code: "GA", nom: "Gabon", drapeau: "🇬🇦" },
  { code: "GM", nom: "Gambie", drapeau: "🇬🇲" },
  { code: "GE", nom: "Géorgie", drapeau: "🇬🇪" },
  { code: "GH", nom: "Ghana", drapeau: "🇬🇭" },
  { code: "GR", nom: "Grèce", drapeau: "🇬🇷" },
  { code: "GD", nom: "Grenade", drapeau: "🇬🇩" },
  { code: "GT", nom: "Guatemala", drapeau: "🇬🇹" },
  { code: "GN", nom: "Guinée", drapeau: "🇬🇳" },
  { code: "GW", nom: "Guinée-Bissau", drapeau: "🇬🇼" },
  { code: "GQ", nom: "Guinée équatoriale", drapeau: "🇬🇶" },
  { code: "GY", nom: "Guyana", drapeau: "🇬🇾" },
  { code: "HT", nom: "Haïti", drapeau: "🇭🇹" },
  { code: "HN", nom: "Honduras", drapeau: "🇭🇳" },
  { code: "HU", nom: "Hongrie", drapeau: "🇭🇺" },
  { code: "IN", nom: "Inde", drapeau: "🇮🇳" },
  { code: "ID", nom: "Indonésie", drapeau: "🇮🇩" },
  { code: "IR", nom: "Iran", drapeau: "🇮🇷" },
  { code: "IQ", nom: "Irak", drapeau: "🇮🇶" },
  { code: "IE", nom: "Irlande", drapeau: "🇮🇪" },
  { code: "IS", nom: "Islande", drapeau: "🇮🇸" },
  { code: "IL", nom: "Israël", drapeau: "🇮🇱" },
  { code: "IT", nom: "Italie", drapeau: "🇮🇹" },
  { code: "JM", nom: "Jamaïque", drapeau: "🇯🇲" },
  { code: "JP", nom: "Japon", drapeau: "🇯🇵" },
  { code: "JO", nom: "Jordanie", drapeau: "🇯🇴" },
  { code: "KZ", nom: "Kazakhstan", drapeau: "🇰🇿" },
  { code: "KE", nom: "Kenya", drapeau: "🇰🇪" },
  { code: "KG", nom: "Kirghizistan", drapeau: "🇰🇬" },
  { code: "KI", nom: "Kiribati", drapeau: "🇰🇮" },
  { code: "KW", nom: "Koweït", drapeau: "🇰🇼" },
  { code: "LA", nom: "Laos", drapeau: "🇱🇦" },
  { code: "LS", nom: "Lesotho", drapeau: "🇱🇸" },
  { code: "LV", nom: "Lettonie", drapeau: "🇱🇻" },
  { code: "LB", nom: "Liban", drapeau: "🇱🇧" },
  { code: "LR", nom: "Libéria", drapeau: "🇱🇷" },
  { code: "LY", nom: "Libye", drapeau: "🇱🇾" },
  { code: "LI", nom: "Liechtenstein", drapeau: "🇱🇮" },
  { code: "LT", nom: "Lituanie", drapeau: "🇱🇹" },
  { code: "LU", nom: "Luxembourg", drapeau: "🇱🇺" },
  { code: "MK", nom: "Macédoine du Nord", drapeau: "🇲🇰" },
  { code: "MG", nom: "Madagascar", drapeau: "🇲🇬" },
  { code: "MW", nom: "Malawi", drapeau: "🇲🇼" },
  { code: "MY", nom: "Malaisie", drapeau: "🇲🇾" },
  { code: "MV", nom: "Maldives", drapeau: "🇲🇻" },
  { code: "ML", nom: "Mali", drapeau: "🇲🇱" },
  { code: "MT", nom: "Malte", drapeau: "🇲🇹" },
  { code: "MA", nom: "Maroc", drapeau: "🇲🇦" },
  { code: "MH", nom: "Marshall", drapeau: "🇲🇭" },
  { code: "MR", nom: "Mauritanie", drapeau: "🇲🇷" },
  { code: "MU", nom: "Maurice", drapeau: "🇲🇺" },
  { code: "MX", nom: "Mexique", drapeau: "🇲🇽" },
  { code: "FM", nom: "Micronésie", drapeau: "🇫🇲" },
  { code: "MD", nom: "Moldavie", drapeau: "🇲🇩" },
  { code: "MC", nom: "Monaco", drapeau: "🇲🇨" },
  { code: "MN", nom: "Mongolie", drapeau: "🇲🇳" },
  { code: "ME", nom: "Monténégro", drapeau: "🇲🇪" },
  { code: "MZ", nom: "Mozambique", drapeau: "🇲🇿" },
  { code: "MM", nom: "Myanmar", drapeau: "🇲🇲" },
  { code: "NA", nom: "Namibie", drapeau: "🇳🇦" },
  { code: "NR", nom: "Nauru", drapeau: "🇳🇷" },
  { code: "NP", nom: "Népal", drapeau: "🇳🇵" },
  { code: "NI", nom: "Nicaragua", drapeau: "🇳🇮" },
  { code: "NE", nom: "Niger", drapeau: "🇳🇪" },
  { code: "NG", nom: "Nigeria", drapeau: "🇳🇬" },
  { code: "NO", nom: "Norvège", drapeau: "🇳🇴" },
  { code: "NZ", nom: "Nouvelle-Zélande", drapeau: "🇳🇿" },
  { code: "OM", nom: "Oman", drapeau: "🇴🇲" },
  { code: "UG", nom: "Ouganda", drapeau: "🇺🇬" },
  { code: "UZ", nom: "Ouzbékistan", drapeau: "🇺🇿" },
  { code: "PK", nom: "Pakistan", drapeau: "🇵🇰" },
  { code: "PW", nom: "Palaos", drapeau: "🇵🇼" },
  { code: "PA", nom: "Panama", drapeau: "🇵🇦" },
  { code: "PG", nom: "Papouasie-Nouvelle-Guinée", drapeau: "🇵🇬" },
  { code: "PY", nom: "Paraguay", drapeau: "🇵🇾" },
  { code: "NL", nom: "Pays-Bas", drapeau: "🇳🇱" },
  { code: "PE", nom: "Pérou", drapeau: "🇵🇪" },
  { code: "PH", nom: "Philippines", drapeau: "🇵🇭" },
  { code: "PL", nom: "Pologne", drapeau: "🇵🇱" },
  { code: "PT", nom: "Portugal", drapeau: "🇵🇹" },
  { code: "QA", nom: "Qatar", drapeau: "🇶🇦" },
  { code: "RO", nom: "Roumanie", drapeau: "🇷🇴" },
  { code: "GB", nom: "Royaume-Uni", drapeau: "🇬🇧" },
  { code: "RU", nom: "Russie", drapeau: "🇷🇺" },
  { code: "RW", nom: "Rwanda", drapeau: "🇷🇼" },
  { code: "KN", nom: "Saint-Kitts-et-Nevis", drapeau: "🇰🇳" },
  { code: "LC", nom: "Sainte-Lucie", drapeau: "🇱🇨" },
  { code: "VC", nom: "Saint-Vincent-et-les-Grenadines", drapeau: "🇻🇨" },
  { code: "WS", nom: "Samoa", drapeau: "🇼🇸" },
  { code: "SM", nom: "Saint-Marin", drapeau: "🇸🇲" },
  { code: "ST", nom: "Sao Tomé-et-Principe", drapeau: "🇸🇹" },
  { code: "SN", nom: "Sénégal", drapeau: "🇸🇳" },
  { code: "RS", nom: "Serbie", drapeau: "🇷🇸" },
  { code: "SC", nom: "Seychelles", drapeau: "🇸🇨" },
  { code: "SL", nom: "Sierra Leone", drapeau: "🇸🇱" },
  { code: "SG", nom: "Singapour", drapeau: "🇸🇬" },
  { code: "SK", nom: "Slovaquie", drapeau: "🇸🇰" },
  { code: "SI", nom: "Slovénie", drapeau: "🇸🇮" },
  { code: "SO", nom: "Somalie", drapeau: "🇸🇴" },
  { code: "SD", nom: "Soudan", drapeau: "🇸🇩" },
  { code: "SS", nom: "Soudan du Sud", drapeau: "🇸🇸" },
  { code: "LK", nom: "Sri Lanka", drapeau: "🇱🇰" },
  { code: "SE", nom: "Suède", drapeau: "🇸🇪" },
  { code: "CH", nom: "Suisse", drapeau: "🇨🇭" },
  { code: "SR", nom: "Suriname", drapeau: "🇸🇷" },
  { code: "SY", nom: "Syrie", drapeau: "🇸🇾" },
  { code: "TJ", nom: "Tadjikistan", drapeau: "🇹🇯" },
  { code: "TZ", nom: "Tanzanie", drapeau: "🇹🇿" },
  { code: "TD", nom: "Tchad", drapeau: "🇹🇩" },
  { code: "CZ", nom: "Tchéquie", drapeau: "🇨🇿" },
  { code: "TH", nom: "Thaïlande", drapeau: "🇹🇭" },
  { code: "TL", nom: "Timor-Leste", drapeau: "🇹🇱" },
  { code: "TG", nom: "Togo", drapeau: "🇹🇬" },
  { code: "TO", nom: "Tonga", drapeau: "🇹🇴" },
  { code: "TT", nom: "Trinité-et-Tobago", drapeau: "🇹🇹" },
  { code: "TN", nom: "Tunisie", drapeau: "🇹🇳" },
  { code: "TM", nom: "Turkménistan", drapeau: "🇹🇲" },
  { code: "TR", nom: "Turquie", drapeau: "🇹🇷" },
  { code: "TV", nom: "Tuvalu", drapeau: "🇹🇻" },
  { code: "UA", nom: "Ukraine", drapeau: "🇺🇦" },
  { code: "UY", nom: "Uruguay", drapeau: "🇺🇾" },
  { code: "VU", nom: "Vanuatu", drapeau: "🇻🇺" },
  { code: "VE", nom: "Venezuela", drapeau: "🇻🇪" },
  { code: "VN", nom: "Vietnam", drapeau: "🇻🇳" },
  { code: "YE", nom: "Yémen", drapeau: "🇾🇪" },
  { code: "ZM", nom: "Zambie", drapeau: "🇿🇲" },
  { code: "ZW", nom: "Zimbabwe", drapeau: "🇿🇼" },
  { code: "US", nom: "États-Unis", drapeau: "🇺🇸" },
];

/* -----------------------------------------------------------------------------
   Props
   --------------------------------------------------------------------------- */

interface PaysSelectorProps {
  /** Code pays ISO 3166-1 alpha-2 (ex: "TG") */
  value: string;
  /** Callback appelé à chaque sélection */
  onChange: (code: string) => void;
  /** État d'erreur optionnel */
  error?: string;
}

/* -----------------------------------------------------------------------------
   Composant principal
   --------------------------------------------------------------------------- */

export default function PaysSelector({ value, onChange, error }: PaysSelectorProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [recherche, setRecherche] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /** Pays actuellement sélectionné */
  const paysCourant = useMemo(
    () => PAYS_MONDE.find((p) => p.code === value) ?? PAYS_MONDE.find((p) => p.code === "TG")!,
    [value]
  );

  /** Liste filtrée selon la recherche */
  const paysFiltres = useMemo(() => {
    const q = recherche.toLowerCase().trim();
    if (!q) return PAYS_MONDE;
    return PAYS_MONDE.filter(
      (p) => p.nom.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }, [recherche]);

  /** Ferme si clic extérieur */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setRecherche("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Focus le champ de recherche à l'ouverture */
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [isOpen]);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setIsOpen(false);
      setRecherche("");
    },
    [onChange]
  );

  /* Thème */
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const dropdownBg = isDark ? "rgba(14,26,17,0.98)" : "#ffffff";
  const hoverBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(31,77,63,0.06)";
  const selectedBg = isDark ? "rgba(31,77,63,0.25)" : "rgba(31,77,63,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Bouton trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Pays sélectionné : ${paysCourant.nom}`}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left transition-all duration-200 focus:outline-none"
        style={{
          background: bg,
          border: `1.5px solid ${error ? "#ef4444" : isOpen ? "#1f4d3f" : border}`,
          boxShadow: isOpen ? "0 0 0 3px rgba(31,77,63,0.1)" : "none",
          color: text,
        }}
      >
        <span className="flex items-center gap-3">
          <ReactCountryFlag countryCode={paysCourant.code} svg style={{ width: "1.5em", height: "1.5em", borderRadius: "2px" }} />
          <span className="text-sm font-semibold">{paysCourant.nom}</span>
          <span
            className="hidden rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:block"
            style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: muted }}
          >
            {paysCourant.code}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-300"
          style={{ color: muted, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Message d'erreur */}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="listbox"
            aria-label="Liste des pays"
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl"
            style={{
              background: dropdownBg,
              border: `1px solid ${border}`,
              boxShadow: isDark
                ? "0 24px 48px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06) inset"
                : "0 16px 40px rgba(0,0,0,0.12)",
            }}
          >
            {/* Champ de recherche */}
            <div className="p-3" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: muted }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher un pays…"
                  className="w-full rounded-xl py-2.5 pl-9 pr-9 text-sm outline-none transition-all"
                  style={{
                    background: inputBg,
                    border: `1px solid ${border}`,
                    color: text,
                  }}
                  aria-label="Rechercher un pays"
                />
                {recherche && (
                  <button
                    type="button"
                    onClick={() => setRecherche("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3.5 w-3.5" style={{ color: muted }} />
                  </button>
                )}
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-56 overflow-y-auto py-1.5 scrollbar-thin">
              {paysFiltres.length === 0 ? (
                <p className="py-6 text-center text-sm" style={{ color: muted }}>
                  Aucun pays trouvé
                </p>
              ) : (
                paysFiltres.map((pays) => {
                  const isSelected = pays.code === value;
                  return (
                    <button
                      key={pays.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(pays.code)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 cursor-pointer"
                      style={{
                        background: isSelected ? selectedBg : "transparent",
                        color: isSelected ? "#1f4d3f" : text,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      <ReactCountryFlag countryCode={pays.code} svg style={{ width: "1.5em", height: "1.5em", borderRadius: "2px" }} />
                      <span className="flex-1 text-sm font-medium">{pays.nom}</span>
                      <span
                        className="text-[10px] font-bold uppercase"
                        style={{ color: isSelected ? "#1f4d3f" : muted }}
                      >
                        {pays.code}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
