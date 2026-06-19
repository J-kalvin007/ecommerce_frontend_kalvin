/**
 * Utils — Fonctions utilitaires partagées
 *
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine des classes CSS avec gestion des conflits Tailwind.
 *
 * @param inputs - Classes CSS conditionnelles
 * @returns Chaîne de classes fusionnée et dédupliquée
 *
 * @example
 * cn("p-4", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant monétaire selon la locale et la devise.
 *
 * @param amount - Montant (string ou number)
 * @param currency - Code devise ISO 4217 (ex: "FCFA")
 * @param locale - Locale BCP 47 (ex: "fr-FR")
 * @returns Chaîne formatée (ex: "24 900 FCFA")
 *
 * @example
 * formatCurrency("24900", "FCFA") // "24 900 FCFA"
 * formatCurrency(1500, "USD", "en-US") // "$1,500.00"
 */
export function formatCurrency(
  amount: string | number,
  currency: string = "FCFA",
  locale: string = "fr-FR"
): string {
  // Nettoyage de la chaîne si c'est un string (ex: "19 000" -> 19000)
  const numAmount = typeof amount === "string"
    ? parseFloat(amount.replace(/\s/g, "").replace(/[^\d.-]/g, ""))
    : amount;

  if (isNaN(numAmount)) return String(amount);

  // Gestion spécifique du FCFA (souvent pas de décimales)
  if (currency === "FCFA" || currency === "XOF" || currency === "XAF") {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount) + " FCFA";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    // Repli si le code devise est invalide
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount) + " " + currency;
  }
}

/**
 * Formate une date ISO en chaîne lisible.
 *
 * @param dateStr - Date ISO 8601 (ex: "2026-04-27T18:30:00Z")
 * @param locale - Locale BCP 47
 * @param options - Options Intl.DateTimeFormat
 * @returns Date formatée (ex: "27 avr. 2026")
 */
export function formatDate(
  dateStr: string | null | undefined,
  locale: string = "fr-FR",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
  } catch {
    return "—";
  }
}

/**
 * Formate une date ISO en chaîne relative (ex: "il y a 3 heures").
 *
 * @param dateStr - Date ISO 8601
 * @param locale - Locale BCP 47
 * @returns Chaîne relative
 */
export function formatRelativeDate(
  dateStr: string | null | undefined,
  locale: string = "fr-FR"
): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffDay > 30) return formatDate(dateStr, locale);
    if (diffDay >= 1) return rtf.format(-diffDay, "day");
    if (diffHour >= 1) return rtf.format(-diffHour, "hour");
    if (diffMin >= 1) return rtf.format(-diffMin, "minute");
    return rtf.format(-diffSec, "second");
  } catch {
    return "—";
  }
}

/**
 * Tronque un texte à la longueur maximale spécifiée.
 *
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale (défaut: 100)
 * @returns Texte tronqué avec "…" si nécessaire
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Génère les initiales d'un nom (pour les avatars).
 *
 * @param name - Nom complet
 * @returns 1-2 lettres majuscules (ex: "MC")
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Retourne le label traduit d'un statut de commande.
 *
 * @param status - Code statut (ex: "DELIVERED")
 * @param locale - Locale ("fr" ou "en")
 * @returns Label lisible
 */
export function getOrderStatusLabel(
  status: string,
  locale: string = "fr"
): string {
  const labels: Record<string, Record<string, string>> = {
    PENDING: { fr: "En attente", en: "Pending" },
    CONFIRMED: { fr: "Confirmée", en: "Confirmed" },
    PREPARING: { fr: "En préparation", en: "Preparing" },
    SHIPPED: { fr: "Expédiée", en: "Shipped" },
    IN_TRANSIT: { fr: "En transit", en: "In Transit" },
    DELIVERED: { fr: "Livrée", en: "Delivered" },
    RETURNED: { fr: "Retournée", en: "Returned" },
    CANCELLED: { fr: "Annulée", en: "Cancelled" },
  };
  return labels[status]?.[locale] || status;
}

/**
 * Retourne la couleur CSS associée à un statut de commande.
 *
 * @param status - Code statut
 * @returns Classe CSS Tailwind pour le badge
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-warning-light text-warning",
    CONFIRMED: "bg-info-light text-info",
    PREPARING: "bg-highlight/20 text-highlight",
    SHIPPED: "bg-primary-light text-primary",
    IN_TRANSIT: "bg-primary-light text-primary",
    DELIVERED: "bg-success-light text-success",
    RETURNED: "bg-error-light text-error",
    CANCELLED: "bg-error-light text-error",
  };
  return colors[status] || "bg-surface-alt text-muted";
}

/**
 * Retourne le label traduit d'un palier de fidélité.
 *
 * @param tier - Code du palier
 * @param locale - Locale
 * @returns Label lisible
 */
export function getLoyaltyTierLabel(
  tier: string,
  locale: string = "fr"
): string {
  const labels: Record<string, Record<string, string>> = {
    BRONZE: { fr: "Bronze", en: "Bronze" },
    SILVER: { fr: "Argent", en: "Silver" },
    GOLD: { fr: "Or", en: "Gold" },
    PLATINUM: { fr: "Platine", en: "Platinum" },
  };
  return labels[tier]?.[locale] || tier;
}

/**
 * Délai configurable (utile pour les animations et les timeouts).
 *
 * @param ms - Délai en millisecondes
 * @returns Promise qui se résout après le délai
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Génère un slug à partir d'un texte.
 *
 * @param text - Texte source
 * @returns Slug URL-safe
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}






// export function formatCurrency(
//   amount: string | number,
//   currency: string = "FCFA",
//   locale: string = "fr-FR"
// ): string {
//   const numAmount =
//     typeof amount === "string"
//       ? parseFloat(amount.replace(/\s/g, "").replace(/[^\d.-]/g, ""))
//       : amount;

//   if (Number.isNaN(numAmount)) {
//     return String(amount);
//   }

//   if (currency === "FCFA" || currency === "XOF" || currency === "XAF") {
//     return (
//       new Intl.NumberFormat(locale, {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       }).format(numAmount) + " FCFA"
//     );
//   }

//   try {
//     return new Intl.NumberFormat(locale, {
//       style: "currency",
//       currency,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(numAmount);
//   } catch {
//     return (
//       new Intl.NumberFormat(locale, {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }).format(numAmount) +
//       " " +
//       currency
//     );
//   }
// }



// export function formatDate(
//   dateStr: string | null | undefined,
//   locale: string = "fr-FR",
//   options: Intl.DateTimeFormatOptions = {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   }
// ): string {
//   if (!dateStr) return "—";
//   try {
//     return new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
//   } catch {
//     return "—";
//   }
// }
