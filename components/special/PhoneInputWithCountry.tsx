"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Search, Phone } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { COUNTRIES, Country } from "@/lib/countries";

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInputWithCountry({
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
}: PhoneInputWithCountryProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  // Parse initial value to separate dialCode and actual phone
  const parseInitial = () => {
    if (!value) return { code: "TG", phone: "" };

    // Sort by length of dialCode descending to match longest prefix first (e.g. +1809 before +1)
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

    // Check if value starts with '+'
    if (value.startsWith("+")) {
      for (const country of sortedCountries) {
        if (value.startsWith(`+${country.dialCode}`)) {
          return {
            code: country.iso2,
            phone: value.substring(`+${country.dialCode}`.length).trim(),
          };
        }
      }
    } else {
      // Sometimes it might not have the plus
      for (const country of sortedCountries) {
        if (value.startsWith(country.dialCode)) {
          return {
            code: country.iso2,
            phone: value.substring(country.dialCode.length).trim(),
          };
        }
      }
    }
    return { code: "TG", phone: value };
  };

  const initial = parseInitial();
  const [selectedIso2, setSelectedIso2] = useState<string>(initial.code);
  const [phoneNumber, setPhoneNumber] = useState<string>(initial.phone);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Sync internal state if value prop completely changes externally
  useEffect(() => {
    const parsed = parseInitial();
    setSelectedIso2(parsed.code);
    setPhoneNumber(parsed.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === selectedIso2) || COUNTRIES.find((c) => c.iso2 === "TG")!,
    [selectedIso2]
  );

  const filteredCountries = useMemo(() => {
    const term = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.dialCode.includes(term) ||
        c.iso2.toLowerCase().includes(term)
    );
  }, [search]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and spaces
    const val = e.target.value.replace(/[^\d\s]/g, "");
    setPhoneNumber(val);
    onChange(`+${selectedCountry.dialCode}${val.replace(/\s+/g, "")}`);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedIso2(country.iso2);
    setIsOpen(false);
    setSearch("");
    onChange(`+${country.dialCode}${phoneNumber.replace(/\s+/g, "")}`);
  };

  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#f8f9f8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const dropdownBg = isDark ? "rgba(20,25,20,0.95)" : "#ffffff";

  return (
    <div
      className={`flex items-stretch w-full rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#1f4d3f]/50 ${className}`}
      style={{ background: inputBg, border: `1px solid ${border}` }}
    >
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-l-xl px-4 py-3.5 outline-none transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
            style={{ borderRight: `1px solid ${border}` }}
          >
            <ReactCountryFlag
              countryCode={selectedCountry.iso2}
              svg
              style={{ width: "1.5em", height: "1.5em", borderRadius: "4px", objectFit: "cover" }}
              title={selectedCountry.name}
            />
            <span className="text-sm font-bold" style={{ color: text }}>
              +{selectedCountry.dialCode}
            </span>
            <ChevronDown className="h-4 w-4" style={{ color: muted }} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 w-[300px] overflow-hidden rounded-2xl shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            style={{
              background: dropdownBg,
              border: `1px solid ${border}`,
              backdropFilter: "blur(12px)",
            }}
            sideOffset={8}
            align="start"
          >
            {/* Barre de recherche */}
            <div className="flex items-center gap-2 px-3 py-3" style={{ borderBottom: `1px solid ${border}` }}>
              <Search className="h-4 w-4 shrink-0" style={{ color: muted }} />
              <input
                type="text"
                placeholder="Rechercher un pays ou indicatif..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: text }}
                autoFocus
              />
            </div>

            {/* Liste des pays */}
            <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
              {filteredCountries.length === 0 ? (
                <div className="py-6 text-center text-sm" style={{ color: muted }}>
                  Aucun pays trouvé
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <DropdownMenu.Item
                    key={country.iso2}
                    onSelect={(e) => {
                      e.preventDefault(); // Garder le menu ouvert si on veut, mais ici on le ferme manuellement
                      handleCountrySelect(country);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-colors hover:bg-black/5 focus:bg-black/5 dark:hover:bg-white/5 dark:focus:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <ReactCountryFlag
                        countryCode={country.iso2}
                        svg
                        style={{ width: "1.5em", height: "1.5em", borderRadius: "4px", objectFit: "cover" }}
                      />
                      <span style={{ color: text }} className="font-medium">
                        {country.name}
                      </span>
                    </div>
                    <span style={{ color: muted }} className="text-xs font-bold">
                      +{country.dialCode}
                    </span>
                  </DropdownMenu.Item>
                ))
              )}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Champ de saisie du numéro */}
      <div className="flex flex-1 items-center px-3">
        <Phone className="mr-3 h-5 w-5 shrink-0" style={{ color: muted }} />
        <input
          type="tel"
          placeholder="77 123 45 67"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required={required}
          disabled={disabled}
          className="w-full bg-transparent py-3.5 text-base outline-none disabled:opacity-50"
          style={{ color: text }}
        />
      </div>
    </div>
  );
}
