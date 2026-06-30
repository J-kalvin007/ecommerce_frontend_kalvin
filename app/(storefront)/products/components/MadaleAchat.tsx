

/**
 * ════════════════════════════════════════════════════════════════════════════
 * @file        PurchaseModal.tsx
 * @description Modal d'achat ultra-premium — sélection de variantes, mise en
 *              valeur des différentiels prix/poids, animations fluides Framer
 *              Motion, expérience utilisateur de niveau fintech haut de gamme.
 *
 * @architecture  Functional Component + React Hooks + Framer Motion
 * @dependencies  framer-motion · lucide-react · next/image
 * @pattern       Composition de sous-composants purs + mémoïsation sélective
 *
 * @preserves     ✔ Noms de variables identiques à l'original
 *                ✔ Signatures de fonctions identiques à l'original
 *                ✔ Structure d'état (useState/useMemo) identique à l'original
 *                ✔ Signature onConfirm identique à l'original
 *
 * @changelog     + Badges PriceDeltaBadge et WeightDeltaBadge par variante
 *                + Détection automatique de la "meilleure valeur" (rapport qualité/poids)
 *                + Jauge de stock animée StockIndicator
 *                + Animation d'entrée staggerée par section
 *                + Shimmer sur le bouton CTA
 *                + Reset de quantité au changement de variante
 *                ~ ChevronRight → ChevronDown (dropdown plus sémantique)
 * ════════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
    X,
    Check,
    ChevronDown,
    Minus,
    Plus,
    ShoppingBag,
    Package,
    Weight,
    ArrowUp,
    ArrowDown,
    Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function formatWeight(grams: number | null | undefined): string {
    if (!grams) return "";
    if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
    return `${grams} g`;
}

// ─────────────────────────────────────────────────────────────────────────────
// §0 — TYPES (à adapter selon votre fichier de types global)
//      Ces interfaces documentent la forme attendue des données.
//      Si elles existent déjà dans votre projet, supprimez ce bloc.
// ─────────────────────────────────────────────────────────────────────────────

interface ProductVariant {
    id: string;
    name: string;
    price: string;          // string parsable en float ("12500")
    weight_grams: number | null;
    stock: number;
    is_active: boolean;
}

interface Product {
    name: string;
    price: string;
    weight_grams: number | null;
    stock: number;
    variants?: ProductVariant[];
    category?: { name: string };
}

interface FlashSale {
    sale_price: string;
}

interface PurchaseModalProps {
    product: Product;
    images: string[];
    flashSale?: FlashSale | null;
    onClose: () => void;
    onConfirm: (
        variantId: string | null,
        variantName: string | null,
        price: string,
        quantity: number,
        weight: number | null | undefined
    ) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// §1 — CONSTANTES D'ANIMATION
//      Physique spring unifiée pour une cohérence perceptuelle maximale.
//      Ne pas modifier sans tester sur des appareils lents (reduce-motion).
// ─────────────────────────────────────────────────────────────────────────────

/** Réponse snap — interactions tactiles immédiates (boutons, selections, toggles) */
const SPRING_SNAPPY = {
    type: "spring",
    stiffness: 500,
    damping: 34,
    mass: 0.75,
} as const;

/** Réponse douce — transitions de contenu et entrées modales */
const SPRING_SMOOTH = {
    type: "spring",
    stiffness: 280,
    damping: 26,
    mass: 1.1,
} as const;

/** Courbe ease-out cubic-bezier — sentiment de fluidité organique */
const EASE_OUT_CUBIC: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─────────────────────────────────────────────────────────────────────────────
// §2 — VARIANTES D'ANIMATION FRAMER MOTION
//      Centralisées hors du JSX pour lisibilité et réutilisabilité.
// ─────────────────────────────────────────────────────────────────────────────

/** Backdrop — fondu simple, opacité uniquement */
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
} as const;

/** Modal — entrée avec blur + scale + y, enfants staggerés */
const modalVariants = {
    hidden: { opacity: 0, scale: 0.86, y: 40, filter: "blur(12px)" },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            ...SPRING_SMOOTH,
            delayChildren: 0.08,
            staggerChildren: 0.055,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.94,
        y: 14,
        filter: "blur(6px)",
        transition: { duration: 0.2, ease: EASE_OUT_CUBIC },
    },
} as const;

/** Section enfant — chaque bloc entre en décalé (orchestration stagger parent) */
const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT_CUBIC } },
} as const;

/** Dropdown — scale Y depuis le haut + légère translation */
const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scaleY: 0.90, transformOrigin: "top center" },
    visible: { opacity: 1, y: 0, scaleY: 1, transition: SPRING_SNAPPY },
    exit: { opacity: 0, y: -4, scaleY: 0.94, transition: { duration: 0.15 } },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §3 — SOUS-COMPOSANTS PURS
//      Aucune dépendance aux closures du parent — facilement testables et
//      réutilisables dans d'autres contextes de l'application.
// ─────────────────────────────────────────────────────────────────────────────

// ── §3.1 PriceDeltaBadge ─────────────────────────────────────────────────────
/**
 * Affiche la différence de prix d'une variante par rapport au produit de base.
 *
 * Palette sémantique :
 *   • Économie (delta < 0)  → vert émeraude, flèche vers le bas
 *   • Supplément (delta > 0) → ambre, flèche vers le haut
 *   • Égalité (|delta| < 1) → invisible (rendu null)
 *
 * @param delta — différence en valeur monétaire brute (unité identique au prix)
 */
function PriceDeltaBadge({ delta }: { delta: number }) {
    if (Math.abs(delta) < 1) return null;

    const isSaving = delta < 0;

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_SNAPPY}
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold tabular-nums leading-none ${isSaving
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70"
                : "bg-amber-50  text-amber-700  ring-1 ring-amber-200/70"
                }`}
        >
            {isSaving
                ? <ArrowDown className="h-2.5 w-2.5 shrink-0" />
                : <ArrowUp className="h-2.5 w-2.5 shrink-0" />
            }
            {formatCurrency(Math.abs(delta), "FCFA")}
        </motion.span>
    );
}

// ── §3.2 WeightDeltaBadge ────────────────────────────────────────────────────
/**
 * Affiche la différence de poids d'une variante par rapport au produit de base.
 *
 * Palette sémantique :
 *   • Plus lourd (delta > 0) → bleu ciel, flèche vers le haut
 *   • Plus léger (delta < 0) → orange, flèche vers le bas
 *   • Données manquantes ou égalité → invisible (rendu null)
 *
 * @param delta — différence en grammes (null si données incomplètes)
 */
function WeightDeltaBadge({ delta }: { delta: number | null }) {
    if (delta === null || delta === 0) return null;

    const isHeavier = delta > 0;



    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.04, ...SPRING_SNAPPY }}
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold tabular-nums leading-none ${isHeavier
                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200/70"
                : "bg-orange-50 text-orange-700 ring-1 ring-orange-200/70"
                }`}
        >
            {isHeavier
                ? <ArrowUp className="h-2.5 w-2.5 shrink-0" />
                : <ArrowDown className="h-2.5 w-2.5 shrink-0" />
            }
            {formatWeight(Math.abs(delta))}
        </motion.span>
    );
}

// ── §3.3 WeightChip ──────────────────────────────────────────────────────────
/**
 * Chip de poids du produit/variante.
 * Couleur adaptée selon l'état de sélection de la variante parente.
 */
function WeightChip({
    weight,
    isSelected = false,
}: {
    weight: number;
    isSelected?: boolean;
}) {


    return (
        <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors duration-200 ${isSelected
                ? "bg-[#1f4d3f]/10 text-[#1f4d3f]"
                : "bg-[#f3ede2] text-[#8b5e34]"
                }`}
        >
            <Weight className="h-3 w-3 shrink-0" />
            {formatWeight(weight)}
        </span>
    );
}

// ── §3.4 StockIndicator ──────────────────────────────────────────────────────
/**
 * Indicateur de stock combinant une jauge visuelle animée et un label textuel.
 *
 * Niveaux de couleur :
 *   • Rupture (stock = 0)  → rouge
 *   • Critique (stock ≤ 3) → ambre, message d'urgence
 *   • Normal (stock > 3)   → vert forêt
 *
 * @param stock — quantité disponible
 * @param max   — seuil considéré "plein" pour la jauge (défaut : 20)
 */
function StockIndicator({ stock, max = 20 }: { stock: number; max?: number }) {
    // Calcule le % de remplissage avec un minimum visuel de 5% pour stock > 0
    const fillPct = stock === 0 ? 0 : Math.max(5, Math.min((stock / max) * 100, 100));
    const isEmpty = stock === 0;
    const isLow = stock > 0 && stock <= 3;
    const gaugeColor = isEmpty ? "#ef4444" : isLow ? "#f59e0b" : "#1f4d3f";
    const textClass = isEmpty ? "text-red-500" : isLow ? "text-amber-600" : "text-[#5d6b58]";
    const label = isEmpty
        ? "Rupture de stock"
        : isLow
            ? `${stock} restant${stock > 1 ? "s" : ""}`
            : `${stock} en stock`;

    return (
        <div className="flex items-center gap-2.5">
            {/* Jauge */}
            <div className="h-1 w-20 overflow-hidden rounded-full bg-[#e7dfd2]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fillPct}%` }}
                    transition={{ duration: 0.55, ease: EASE_OUT_CUBIC, delay: 0.15 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: gaugeColor }}
                />
            </div>
            {/* Label */}
            <span className={`text-[10px] font-semibold ${textClass}`}>{label}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// §4 — COMPOSANT PRINCIPAL : PurchaseModal
// ─────────────────────────────────────────────────────────────────────────────

function PurchaseModal({
    product,
    images,
    flashSale,
    onClose,
    onConfirm,
}: PurchaseModalProps) {

    // ── §4.1 Variantes actives ────────────────────────────────────────────────
    // Identique à l'original — filtre les variantes inactives une seule fois.
    const activeVariants = useMemo(
        () => (product.variants ?? []).filter((v) => v.is_active),
        [product.variants]
    );
    const hasVariants = activeVariants.length > 0;

    // ── §4.2 État local (structure et noms identiques à l'original) ──────────
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        hasVariants ? activeVariants[0] : null
    );
    const [quantity, setQuantity] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // ── §4.3 Valeurs calculées (identiques à l'original) ─────────────────────
    const currentPrice = selectedVariant?.price ?? (flashSale?.sale_price ?? product.price);
    const currentWeight = selectedVariant?.weight_grams ?? product.weight_grams;
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    const isOutOfStock = currentStock === 0;
    const totalPrice = parseFloat(currentPrice) * quantity;

    // ── §4.4 Nouvelles valeurs — différentiels variante / produit de base ─────

    /**
     * Prix de référence du produit principal pour le calcul des deltas.
     * Prend en compte l'éventuel prix flash-sale si aucune variante n'est sélectionnée.
     */
    const basePriceForDelta = useMemo(
        () => parseFloat(flashSale?.sale_price ?? product.price),
        [product.price, flashSale?.sale_price]
    );

    /**
     * Retourne la différence de prix d'une variante vs le produit de base.
     * Positif = supplément (variante plus chère), négatif = économie.
     */
    const getPriceDelta = useCallback(
        (variant: ProductVariant): number =>
            parseFloat(variant.price) - basePriceForDelta,
        [basePriceForDelta]
    );

    /**
     * Retourne la différence de poids d'une variante vs le produit de base.
     * Retourne null si l'une des deux valeurs est absente (données incomplètes).
     */
    const getWeightDelta = useCallback(
        (variant: ProductVariant): number | null => {
            if (!variant.weight_grams || !product.weight_grams) return null;
            return variant.weight_grams - product.weight_grams;
        },
        [product.weight_grams]
    );

    /**
     * Identifie la variante disponible avec le meilleur rapport prix / gramme.
     * Retourne null si moins de 2 variantes éligibles (poids connu + en stock).
     * Utilisé pour afficher le badge "Meilleure valeur" sur la carte concernée.
     */
    const bestValueVariantId = useMemo<string | null>(() => {
        const eligibles = activeVariants.filter(
            (v) => v.stock > 0 && v.weight_grams && parseFloat(v.price) > 0
        );
        if (eligibles.length < 2) return null;

        return eligibles.reduce((best, v) => {
            const ratio = parseFloat(v.price) / v.weight_grams!;
            const bestRatio = parseFloat(best.price) / best.weight_grams!;
            return ratio < bestRatio ? v : best;
        }).id;
    }, [activeVariants]);

    // ── §4.5 Handlers ─────────────────────────────────────────────────────────

    /**
     * Handler de confirmation — signature IDENTIQUE à l'original.
     * Transmet les données de la sélection courante au parent.
     */
    const handleConfirm = () => {
        onConfirm(
            selectedVariant?.id ?? null,
            selectedVariant?.name ?? null,
            currentPrice,
            quantity,
            currentWeight
        );
    };

    /**
     * Sélectionne une variante, ferme le dropdown et réinitialise la quantité à 1.
     * La réinitialisation est nécessaire car chaque variante a son propre stock.
     * Remplace les appels directs à setSelectedVariant dans le JSX.
     */
    const handleVariantSelect = useCallback((variant: ProductVariant) => {
        if (variant.stock === 0) return;
        setSelectedVariant(variant);
        setIsDropdownOpen(false);
        setQuantity(1);
    }, []);



    // ─────────────────────────────────────────────────────────────────────────
    // §4.6 RENDU
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════════════════════════════
          BACKDROP — Fond flou avec fermeture au clic extérieur
      ══════════════════════════════════════════════════════════════════ */}
            <motion.div
                key="purchase-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="purchase-modal-title"
                className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 backdrop-blur-[6px] sm:items-center sm:p-4"
            >
                {/* ════════════════════════════════════════════════════════════════
            MODAL — Conteneur principal
        ════════════════════════════════════════════════════════════════ */}
                <motion.div
                    key="purchase-modal"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                    className={[
                        "relative flex w-full max-w-lg flex-col overflow-hidden",
                        // Coins arrondis : pleine rondeur en bas de l'écran mobile, classique sur desktop
                        "rounded-t-[2rem] sm:rounded-3xl",
                        // Bordure et fond
                        "border border-[#ddd5c5] bg-white",
                        // Ombre premium multi-couches
                        "shadow-[0_40px_100px_-10px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.06)]",
                        // Hauteur max adaptative (svh = small viewport height, plus fiable sur mobile)
                        "max-h-[94svh] sm:max-h-[92vh]",
                    ].join(" ")}
                >

                    {/* Ligne d'accentuation supérieure */}
                    <div className="absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-[#1f4d3f]/65 to-transparent" />

                    {/* Handle de glissement (affordance swipe mobile) */}
                    <div className="pointer-events-none absolute inset-x-0 top-2.5 flex justify-center sm:hidden">
                        <div className="h-1 w-9 rounded-full bg-[#c9bfaf]" />
                    </div>

                    {/* ── Bouton de fermeture ───────────────────────────────────── */}
                    <motion.button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.86 }}
                        transition={SPRING_SNAPPY}
                        className="absolute right-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/[0.06] text-[#5d6b58]"
                    >
                        <X className="h-3.5 w-3.5" />
                    </motion.button>

                    {/* ════════════════════════════════════════════════════════════
              HEADER — Image produit + identité
          ════════════════════════════════════════════════════════════ */}
                    <motion.div
                        variants={sectionVariants}
                        className="relative flex shrink-0 items-center gap-4 border-b border-[#ede5d8] bg-gradient-to-br from-[#fdf9f4] to-[#f4edd9] px-5 pb-4 pt-9 sm:px-6 sm:pt-5"
                    >
                        {/* Image produit avec reflet de surface */}
                        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[1.125rem] border border-[#ddd0bc] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.1)]">
                            {images[0] ? (
                                <Image
                                    src={images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 will-change-transform hover:scale-105"
                                    sizes="72px"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#c4b59b]">
                                    <Package className="h-7 w-7" />
                                </div>
                            )}
                            {/* Reflet de surface (effet premium) */}
                            <div className="pointer-events-none absolute inset-0 rounded-[1.125rem] bg-gradient-to-br from-white/35 via-transparent to-transparent" />
                        </div>

                        {/* Informations textuelles produit */}
                        <div className="min-w-0 flex-1 pr-9">
                            {/* Catégorie — pill discret */}
                            <div className="inline-flex items-center rounded-full border border-[#d8c9b0]/60 bg-[#f3ede2]/80 px-2.5 py-0.5">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8b5e34]">
                                    {product.category?.name ?? "Produit"}
                                </span>
                            </div>

                            {/* Nom du produit */}
                            <h3
                                id="purchase-modal-title"
                                className="mt-1.5 line-clamp-2 text-[17px] font-black leading-tight tracking-[-0.025em] text-[#1f241c] sm:text-lg"
                            >
                                {product.name}
                            </h3>

                            {/* Poids de base (affiché uniquement si aucune variante) */}
                            {product.weight_grams && !hasVariants && (
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#8a9086]">
                                    <Weight className="h-3 w-3 shrink-0" />
                                    {formatWeight(product.weight_grams)}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* ════════════════════════════════════════════════════════════
              CORPS SCROLLABLE
          ════════════════════════════════════════════════════════════ */}
                    <div className="overflow-y-auto overscroll-contain space-y-5 px-5 py-4 sm:px-6 sm:py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#ddd5c5]">

                        {/* ──────────────────────────────────────────────────────────
                SÉLECTEUR DE VARIANTES
                Chaque option affiche explicitement :
                  1. Le poids de la variante (WeightChip)
                  2. La différence de poids vs produit de base (WeightDeltaBadge)
                  3. Le prix de la variante
                  4. La différence de prix vs produit de base (PriceDeltaBadge)
                  5. Le badge "Meilleure valeur" si applicable
            ────────────────────────────────────────────────────────── */}
                        {hasVariants && (
                            <motion.div variants={sectionVariants}>

                                {/* En-tête de section */}
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5d6b58]">
                                        Choisir une variante
                                    </p>
                                    <span className="rounded-full bg-[#f0e8dc] px-2 py-0.5 text-[10px] font-bold text-[#8b5e34]">
                                        {activeVariants.length} option{activeVariants.length > 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* ── Mode dropdown (> 4 variantes) ─────────────────── */}
                                {activeVariants.length > 4 ? (
                                    <div className="relative">
                                        <motion.button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            whileTap={{ scale: 0.99 }}
                                            transition={SPRING_SNAPPY}
                                            className="flex w-full items-center justify-between rounded-2xl border-2 border-[#e0d5c5] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#1f4d3f]/40 focus-visible:border-[#1f4d3f] focus-visible:outline-none"
                                        >
                                            {selectedVariant ? (
                                                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-[#1f241c]">
                                                            {selectedVariant.name}
                                                        </p>
                                                        {/* Ligne de métadonnées : poids + delta poids + prix + delta prix */}
                                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                            {selectedVariant.weight_grams && (
                                                                <WeightChip weight={selectedVariant.weight_grams} isSelected />
                                                            )}
                                                            <WeightDeltaBadge delta={getWeightDelta(selectedVariant)} />
                                                            <span className="text-sm font-black text-[#1f4d3f]">
                                                                {formatCurrency(selectedVariant.price, "FCFA")}
                                                            </span>
                                                            <PriceDeltaBadge delta={getPriceDelta(selectedVariant)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-[#a09585]">Sélectionner une variante…</span>
                                            )}
                                            <motion.div
                                                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: 0.22, ease: EASE_OUT_CUBIC }}
                                                className="ml-2 shrink-0"
                                            >
                                                <ChevronDown className="h-5 w-5 text-[#8b5e34]" />
                                            </motion.div>
                                        </motion.button>

                                        {/* Panneau dropdown */}
                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    variants={dropdownVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#e0d5c5] bg-white p-1.5 shadow-[0_20px_52px_rgba(0,0,0,0.14)] scrollbar-hide"
                                                >
                                                    {activeVariants.map((variant, i) => {
                                                        const isSelected = selectedVariant?.id === variant.id;
                                                        const isOOS = variant.stock === 0;
                                                        const isBestValue = variant.id === bestValueVariantId;
                                                        const priceDelta = getPriceDelta(variant);
                                                        const weightDelta = getWeightDelta(variant);

                                                        return (
                                                            <motion.button
                                                                key={variant.id}
                                                                type="button"
                                                                onClick={() => handleVariantSelect(variant)}
                                                                disabled={isOOS}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.035, ...SPRING_SNAPPY }}
                                                                className={`relative flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors ${isSelected
                                                                    ? "bg-[#1f4d3f]/[0.07]"
                                                                    : isOOS
                                                                        ? "cursor-not-allowed opacity-40"
                                                                        : "hover:bg-[#f6f1e8] active:bg-[#f0e8dc]"
                                                                    }`}
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    {/* Nom + badge top valeur */}
                                                                    <div className="flex items-center gap-2">
                                                                        <p className={`truncate text-sm font-bold ${isSelected ? "text-[#1f4d3f]" : "text-[#1f241c]"}`}>
                                                                            {variant.name}
                                                                        </p>
                                                                        {isBestValue && (
                                                                            <span className="shrink-0 rounded-full bg-gradient-to-r from-[#1f4d3f] to-[#2d6e56] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                                                                                ✦ Top valeur
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Ligne de métadonnées complète */}
                                                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                                        {variant.weight_grams && (
                                                                            <WeightChip weight={variant.weight_grams} isSelected={isSelected} />
                                                                        )}
                                                                        <WeightDeltaBadge delta={weightDelta} />
                                                                        <span className={`text-[13px] font-black ${isSelected ? "text-[#1f4d3f]" : "text-[#1a3530]"}`}>
                                                                            {formatCurrency(variant.price, "FCFA")}
                                                                        </span>
                                                                        <PriceDeltaBadge delta={priceDelta} />
                                                                    </div>
                                                                </div>

                                                                {/* Indicateurs droite : check ou rupture */}
                                                                <div className="ml-2 shrink-0">
                                                                    {isSelected && (
                                                                        <motion.div
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            transition={SPRING_SNAPPY}
                                                                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f4d3f]"
                                                                        >
                                                                            <Check className="h-3 w-3 text-white" />
                                                                        </motion.div>
                                                                    )}
                                                                    {isOOS && (
                                                                        <span className="text-[10px] font-bold text-red-500">Rupture</span>
                                                                    )}
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                ) : (
                                    /* ── Mode grille (≤ 4 variantes) ─────────────────── */
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {activeVariants.map((variant, i) => {
                                            const isSelected = selectedVariant?.id === variant.id;
                                            const isOOS = variant.stock === 0;
                                            const isBestValue = variant.id === bestValueVariantId;
                                            const priceDelta = getPriceDelta(variant);
                                            const weightDelta = getWeightDelta(variant);

                                            return (
                                                <motion.button
                                                    key={variant.id}
                                                    type="button"
                                                    onClick={() => handleVariantSelect(variant)}
                                                    disabled={isOOS}
                                                    // Animation d'entrée staggerée par carte
                                                    initial={{ opacity: 0, y: 14 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.065, ...SPRING_SNAPPY }}
                                                    // Micro-interaction hover (lift subtil) et tap (compression)
                                                    whileHover={
                                                        !isOOS && !isSelected
                                                            ? { y: -2, boxShadow: "0 6px 22px rgba(0,0,0,0.09)", transition: SPRING_SNAPPY }
                                                            : undefined
                                                    }
                                                    whileTap={!isOOS ? { scale: 0.975, transition: SPRING_SNAPPY } : undefined}
                                                    className={[
                                                        "relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
                                                        isSelected
                                                            ? "border-[#1f4d3f] bg-[#1f4d3f]/[0.035] shadow-[0_0_0_3px_rgba(31,77,63,0.1),0_6px_22px_rgba(31,77,63,0.14)]"
                                                            : isOOS
                                                                ? "cursor-not-allowed border-[#e0d5c5] bg-[#f9f6f1] opacity-50"
                                                                : "border-[#e0d5c5] bg-white hover:border-[#8b5e34]/45",
                                                    ].join(" ")}
                                                >

                                                    {/* ── Badge "Meilleure valeur" (centré en haut) */}
                                                    {isBestValue && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.18, ...SPRING_SNAPPY }}
                                                            className="absolute -top-px left-0 right-0 flex justify-center"
                                                        >
                                                            <span className="rounded-b-lg bg-gradient-to-r from-[#1f4d3f] to-[#2d6e56] px-3 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
                                                                ✦ Meilleure valeur
                                                            </span>
                                                        </motion.div>
                                                    )}

                                                    {/* ── Check de sélection (coin supérieur droit) */}
                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0, opacity: 0 }}
                                                                transition={SPRING_SNAPPY}
                                                                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#1f4d3f] shadow-md shadow-[#1f4d3f]/30"
                                                            >
                                                                <Check className="h-3.5 w-3.5 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* ── Nom de la variante ──────────────────── */}
                                                    <p
                                                        className={[
                                                            "pr-8 text-sm font-black leading-snug tracking-[-0.01em]",
                                                            isBestValue ? "mt-3" : "",
                                                            isSelected ? "text-[#1f4d3f]" : "text-[#1f241c]",
                                                        ].join(" ")}
                                                    >
                                                        {variant.name}
                                                    </p>

                                                    {/* ── Séparateur interne ────────────────────── */}
                                                    <div className={`my-2.5 h-px ${isSelected ? "bg-[#1f4d3f]/12" : "bg-[#ede5d8]"}`} />

                                                    {/* ── Bloc poids : poids réel + delta vs base ─── */}
                                                    {variant.weight_grams != null && (
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {/* Poids absolu de la variante */}
                                                            <WeightChip weight={variant.weight_grams} isSelected={isSelected} />
                                                            {/* Différence de poids vs produit principal */}
                                                            <WeightDeltaBadge delta={weightDelta} />
                                                        </div>
                                                    )}

                                                    {/* ── Bloc prix : prix réel + delta vs base ─── */}
                                                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                                                        {/* Prix absolu de la variante */}
                                                        <span className={`text-[1.375rem] font-black tracking-[-0.03em] ${isSelected ? "text-[#1f4d3f]" : "text-[#1a3530]"}`}>
                                                            {formatCurrency(variant.price, "FCFA")}
                                                        </span>
                                                        {/* Différence de prix vs produit principal */}
                                                        <PriceDeltaBadge delta={priceDelta} />
                                                    </div>

                                                    {/* ── Mention de rupture ──────────────────── */}
                                                    {isOOS && (
                                                        <div className="mt-2.5 flex items-center gap-1">
                                                            <X className="h-3 w-3 shrink-0 text-red-500" />
                                                            <span className="text-[10px] font-bold text-red-500">Indisponible</span>
                                                        </div>
                                                    )}

                                                    {/* ── Fond de sélection animé (layoutId) ────── */}
                                                    {isSelected && (
                                                        <motion.div
                                                            layoutId="variant-card-selected-glow"
                                                            className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#1f4d3f]/[0.04] to-transparent"
                                                            transition={SPRING_SMOOTH}
                                                        />
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ──────────────────────────────────────────────────────────
                AFFICHAGE DU PRIX ACTIF
                Le prix unitaire s'anime à chaque changement de variante
                via la key prop (react key === identity === remount).
                Le total apparaît/disparaît en slide selon la quantité.
            ────────────────────────────────────────────────────────── */}
                        <motion.div variants={sectionVariants}>
                            <div className="relative overflow-hidden rounded-2xl border border-[#ddd5c5] bg-gradient-to-br from-[#faf6ef] via-[#f5efe2] to-[#eee5d3] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_8px_rgba(0,0,0,0.04)]">

                                {/* Texture pointillée discrète — profondeur visuelle premium */}
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage: "radial-gradient(circle at 1px 1px, #8b5e34 1px, transparent 0)",
                                        backgroundSize: "20px 20px",
                                    }}
                                />

                                <div className="relative flex items-start justify-between gap-4">

                                    {/* Prix unitaire */}
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#a09585]">
                                            Prix unitaire
                                        </p>
                                        {/* Animation de changement de prix (key déclenche un remount léger) */}
                                        <motion.p
                                            key={`price-${currentPrice}`}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
                                            className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#1a3530] sm:text-[1.75rem]"
                                        >
                                            {formatCurrency(currentPrice, "FCFA")}
                                        </motion.p>
                                        {currentWeight && (
                                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#8a9086]">
                                                <Weight className="h-3.5 w-3.5 shrink-0" />
                                                {formatWeight(currentWeight)}
                                            </p>
                                        )}
                                        {/* Flash sale indicator */}
                                        {flashSale && !selectedVariant && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 flex items-center gap-2"
                                            >
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                                                    <Zap className="h-2.5 w-2.5" /> Promo
                                                </span>
                                                <span className="text-xs text-[#a09585] line-through">
                                                    {formatCurrency(product.price, "FCFA")}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Total — apparaît/disparaît en slide lateral quand quantité > 1 */}
                                    <AnimatePresence>
                                        {quantity > 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 16, scale: 0.88 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: 16, scale: 0.88 }}
                                                transition={SPRING_SNAPPY}
                                                className="text-right"
                                            >
                                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#a09585]">
                                                    Total
                                                </p>
                                                <p className="mt-1 text-xl font-black tracking-[-0.025em] text-[#8b5e34] sm:text-2xl">
                                                    {formatCurrency(totalPrice, "FCFA")}
                                                </p>
                                                <p className="mt-0.5 text-[10px] font-medium text-[#a09585]">
                                                    {quantity} × {formatCurrency(currentPrice, "FCFA")}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        {/* ──────────────────────────────────────────────────────────
                SÉLECTEUR DE QUANTITÉ
                Stepper pill avec boutons circulaires, valeur animée,
                et jauge de stock contextualisée.
            ────────────────────────────────────────────────────────── */}
                        <motion.div variants={sectionVariants}>
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5d6b58]">
                                Quantité
                            </p>

                            <div className="flex items-center justify-between">
                                {/* Stepper pill */}
                                <div className="flex items-center gap-1 rounded-2xl border border-[#ddd5c5] bg-[#faf7f2] p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]">

                                    {/* Bouton décrémenter */}
                                    <motion.button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={isOutOfStock || quantity <= 1}
                                        whileTap={{ scale: 0.82 }}
                                        transition={SPRING_SNAPPY}
                                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white text-[#5d6b58] shadow-sm transition-colors hover:bg-[#f0e8dc] hover:text-[#1f4d3f] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </motion.button>

                                    {/* Valeur — animée à chaque changement via key */}
                                    <motion.span
                                        key={`qty-${quantity}`}
                                        initial={{ opacity: 0.3, scale: 0.72 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={SPRING_SNAPPY}
                                        className="flex h-10 w-12 items-center justify-center text-lg font-black tabular-nums text-[#1f241c]"
                                    >
                                        {quantity}
                                    </motion.span>

                                    {/* Bouton incrémenter */}
                                    <motion.button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                        disabled={isOutOfStock || quantity >= currentStock}
                                        whileTap={{ scale: 0.82 }}
                                        transition={SPRING_SNAPPY}
                                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white text-[#5d6b58] shadow-sm transition-colors hover:bg-[#f0e8dc] hover:text-[#1f4d3f] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </motion.button>
                                </div>

                                {/* Indicateur de stock avec jauge visuelle */}
                                <StockIndicator stock={currentStock} />
                            </div>
                        </motion.div>

                    </div>{/* /corps scrollable */}

                    {/* ════════════════════════════════════════════════════════════
              FOOTER — Bouton CTA principal
              Effet shimmer animé en boucle sur fond gradient vert forêt.
          ════════════════════════════════════════════════════════════ */}
                    <motion.div
                        variants={sectionVariants}
                        className="shrink-0 border-t border-[#ede5d8] bg-gradient-to-b from-[#fdf9f4] to-[#f5edd8] px-5 py-4 sm:px-6"
                    >
                        <motion.button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={handleConfirm}
                            whileHover={
                                !isOutOfStock
                                    ? {
                                        scale: 1.016,
                                        boxShadow: "0 18px 44px rgba(31,77,63,0.34)",
                                        transition: SPRING_SNAPPY,
                                    }
                                    : undefined
                            }
                            whileTap={!isOutOfStock ? { scale: 0.974, transition: SPRING_SNAPPY } : undefined}
                            className={[
                                "relative flex w-full cursor-pointer items-center justify-center gap-3",
                                "overflow-hidden rounded-2xl px-6 py-4 text-sm font-bold text-white",
                                "transition-all disabled:cursor-not-allowed disabled:opacity-45",
                                isOutOfStock
                                    ? "bg-[#8a9086] shadow-none"
                                    : "bg-gradient-to-r from-[#183d32] via-[#1f4d3f] to-[#183d32] shadow-[0_10px_30px_rgba(31,77,63,0.3)]",
                            ].join(" ")}
                        >
                            {/* Effet shimmer — lumière qui traverse de gauche à droite */}
                            {!isOutOfStock && (
                                <motion.div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%)",
                                    }}
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3.2,
                                        ease: "linear",
                                        repeatDelay: 1.2,
                                    }}
                                />
                            )}

                            <ShoppingBag className="relative h-5 w-5 shrink-0" />

                            <span className="relative font-bold tracking-[-0.01em]">
                                {isOutOfStock ? (
                                    "Produit indisponible"
                                ) : (
                                    <>
                                        Ajouter au panier
                                        <span className="mx-1.5 opacity-40">·</span>
                                        <span className="font-black">{formatCurrency(totalPrice, "FCFA")}</span>
                                    </>
                                )}
                            </span>
                        </motion.button>
                    </motion.div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default PurchaseModal;