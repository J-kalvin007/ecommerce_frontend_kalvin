

/**
 * page.tsx — Page de succès de paiement de commande — ultra premium
 * ─────────────────────────────────────────────────────────────────────────────
 * Affichée après un paiement de commande réussi via PayDunya ou Wallet.
 *
 * Ce moment est le plus chargé émotionnellement de tout le parcours Kalvin.
 * L'achat est finalisé. La commande est confirmée. Cette page doit générer
 * de la sérénité, de la fierté et une envie immédiate de revenir.
 *
 * Direction artistique — "le sceau de confirmation" :
 *   Là où la wallet success page utilise la métaphore "pièce touchant l'eau"
 *   (recharge = dépôt de fonds), cette page utilise celle du SCEAU OFFICIEL :
 *   un tampon de commande qui "s'imprime" avec un spring overshoot, entouré
 *   de trois ondes concentriques (Triple Coin Ripple, plus ample que la wallet).
 *   L'idée : votre commande a été "tamponnée", validée, enregistrée dans notre
 *   système. C'est définitif, précis, institutionnel — comme un bordereau de
 *   livraison ou un bon de commande signé.
 *
 * Nouveaux éléments vs wallet/success :
 *   - Triple Coin Ripple (3 anneaux au lieu de 2, amplitude augmentée)
 *   - OrderReferenceBadge : la référence s'imprime avec un spring animé
 *   - NextStepsStrip : mini-timeline "Ce qui arrive ensuite" (spécifique aux
 *     commandes — n'existerait pas sur une page de recharge)
 *   - REDIRECT_DELAY_SECONDS = 7 (plus de contenu à lire)
 *
 * Éléments réutilisés du design system Kalvin (wallet/success) :
 *   - FloatingOrbs, CircularCountdown, shimmer, liseré doré, halos ambiants
 *   - BRAND_FOREST, BRAND_GOLD, FLOATING_ORBS, logique de décompte
 *   - Wrapper Suspense, isMounted guard, useThemeStore, Lottie
 *
 * @module app/(storefront)/paiement/commande/success/page
 */

"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Star,
  Shield,
  Package,
  Truck,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";

// Chargement dynamique de Lottie pour SSR — même pattern que wallet/success
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import successAnimation from "@/public/assets/lottis/success.json";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/* ── Constantes globales ─────────────────────────────────────────────────── */

/** 7 secondes : plus de contenu à lire qu'une simple recharge de wallet. */
const REDIRECT_DELAY_SECONDS = 500;
const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_SOFT = "rgba(201,168,118,0.14)";

/* ── Configuration des orbes flottants — identique à wallet/success ─────── */
const FLOATING_ORBS = [
  { id: 1, left: "8%", bottom: "18%", size: 10, color: BRAND_GOLD, delay: 0, dur: 5.2 },
  { id: 2, left: "22%", bottom: "8%", size: 6, color: BRAND_FOREST, delay: 0.8, dur: 4.5 },
  { id: 3, left: "58%", bottom: "22%", size: 14, color: BRAND_GOLD, delay: 1.5, dur: 6.0 },
  { id: 4, left: "76%", bottom: "12%", size: 8, color: BRAND_FOREST, delay: 0.4, dur: 4.8 },
  { id: 5, left: "90%", bottom: "28%", size: 5, color: BRAND_GOLD, delay: 2.0, dur: 5.5 },
  { id: 6, left: "44%", bottom: "4%", size: 12, color: BRAND_GOLD, delay: 1.1, dur: 4.2 },
] as const;

/* ── Configuration de la mini-timeline "Ce qui arrive ensuite" ───────────
 *
 *  Spécifique à une commande — n'existerait pas sur une page de recharge.
 *  Étape 1 déjà réalisée (done=true), les deux suivantes en attente.
 */
const NEXT_STEPS = [
  {
    id: 1,
    icon: Mail,
    label: "Confirmation envoyée par email",
    sub: "Vérifiez votre boîte de réception",
    done: true,
  },
  {
    id: 2,
    icon: Package,
    label: "Préparation de votre commande",
    sub: "Notre équipe s'en occupe",
    done: false,
    active: true,
  },
  {
    id: 3,
    icon: Truck,
    label: "Livraison à votre adresse",
    sub: "Selon le délai estimé",
    done: false,
    active: false,
  },
] as const;

/* ════════════════════════════════════════════════════════════════════════════
   Composant principal
   ════════════════════════════════════════════════════════════════════════════ */

function SuccessCommandeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  /** Référence de commande transmise en query param (?reference=REF-XXXX). */
  const reference = searchParams?.get("reference") || null;

  /** État de copie de la référence dans le presse-papier. */
  const [copied, setCopied] = useState(false);

  /** Décompte avant redirection — IDENTIQUE à wallet/success. */
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
  const [isMounted, setIsMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => { setIsMounted(true); }, []);

  /** Logique de décompte et redirection — même pattern que wallet/success. */
  useEffect(() => {
    if (!isMounted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            const targetUrl = reference
              ? `/commandes/${reference}`
              : "/customer/dashboard_client?tab=orders";
            router.push(targetUrl);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, reference, router]);

  /** Copie la référence dans le presse-papier avec feedback visuel. */
  const copyReference = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  /* ── Jetons de thème — même pattern que wallet/success ──────────────── */
  const bg = isDark
    ? "linear-gradient(135deg, #030a05 0%, #0a1a0e 50%, #050d07 100%)"
    : "linear-gradient(135deg, #f0faf5 0%, #e8f5ed 50%, #f5faf7 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "rgba(255,255,255,0.95)" : "#0f1a10";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";

  /** URL de destination après le décompte. */
  const targetUrl = reference
    ? `/commandes/${reference}`
    : "/customer/dashboard_client?tab=orders";

  /** Ratio de progression [0 → 1] — identique à wallet/success. */
  const progressRatio = (REDIRECT_DELAY_SECONDS - countdown) / REDIRECT_DELAY_SECONDS;

  if (!isMounted) return null;

  /* ── Rendu ─────────────────────────────────────────────────────────────── */
  return (
    <div
      className="relative flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: bg }}
    >
        {/* ── Halos ambiants — identiques à wallet/success ────────────────── */}
        {/* <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "rgba(31,77,63,0.22)" }} />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(201,168,118,0.12)" }} /> */}

        {/* ── Orbes flottants ambiants — identiques à wallet/success ───────── */}
        <FloatingOrbs isDark={isDark} />

        {/* ════════════════════════════════════════════════════════════════════
        *  Carte principale — max-w-xl (plus large que wallet pour NextSteps)
        * ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
          className="relative z-10 w-full max-w-xl"
        >
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              backdropFilter: "blur(24px)",
              boxShadow: isDark
                ? "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
                : "0 40px 80px -20px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)",
            }}
          >
            {/* Shimmer de validation (identique à wallet/success) */}
            <style>{`
                  @keyframes commandeSweep {
                    0%   { transform: translateX(-110%); }
                    100% { transform: translateX(210%); }
                  }
                `}</style>
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" style={{ zIndex: 1 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "translateX(-110%)",
                  animation: "commandeSweep 1.8s cubic-bezier(0.22,1,0.36,1) 0.9s 1 forwards",
                  background: `linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.14) 46%, rgba(255,255,255,0.26) 52%, transparent 68%)`,
                }} />
            </div>

            {/* Liseré doré supérieur — signature Kalvin */}
            {/* <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-10 h-1"
          style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})` }}
        /> */}

            <div className="relative z-[2] px-8 pb-10 pt-10 text-center">

              {/* ── Zone Lottie + TRIPLE COIN RIPPLE (signature visuelle) ───────
        *
        *  3 anneaux au lieu de 2 (vs wallet/success) — amplitude
        *  augmentée pour marquer l'importance supérieure de ce moment.
        *  Même métaphore "pièce/onde" mais plus dramatique :
        *    Anneau 1 : le plus externe, lent, ample  (300px, 2.2s)
        *    Anneau 2 : intermédiaire               (220px, 1.6s)
        *    Anneau 3 : interne, rapide, concentré  (150px, 1.0s)
        * ─────────────────────────────────────────────────────────────── */}
              <div className="relative mx-auto mb-6 flex h-44 w-44 items-center justify-center">

                {/* Halo ambiant */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${BRAND_GOLD}1e 0%, transparent 70%)` }} />

                {/* Anneau externe — onde lente, très ample */}
                <motion.div
                  aria-hidden
                  className="absolute rounded-full"
                  style={{ border: `1px solid ${BRAND_GOLD}90`, pointerEvents: "none" }}
                  initial={{ width: 88, height: 88, opacity: 0.7 }}
                  animate={{ width: 320, height: 320, opacity: 0 }}
                  transition={{ duration: 2.2, ease: "easeOut", delay: 0.4 }} />

                {/* Anneau intermédiaire */}
                <motion.div
                  aria-hidden
                  className="absolute rounded-full"
                  style={{ border: `1.5px solid ${BRAND_GOLD}`, pointerEvents: "none" }}
                  initial={{ width: 88, height: 88, opacity: 0.8 }}
                  animate={{ width: 230, height: 230, opacity: 0 }}
                  transition={{ duration: 1.6, ease: "easeOut", delay: 0.6 }} />

                {/* Anneau interne — rapide, concentré */}
                <motion.div
                  aria-hidden
                  className="absolute rounded-full"
                  style={{ border: `2px solid ${BRAND_GOLD}`, pointerEvents: "none" }}
                  initial={{ width: 88, height: 88, opacity: 0.95 }}
                  animate={{ width: 155, height: 155, opacity: 0 }}
                  transition={{ duration: 1.0, ease: "easeOut", delay: 0.8 }} />

                {/* Animation Lottie */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
                  className="relative z-10 h-full w-full"
                >
                  <Lottie
                    animationData={successAnimation}
                    loop={false}
                    autoplay={true}
                    style={{ width: "100%", height: "100%" }} />
                </motion.div>
              </div>

              {/* ── En-tête du message ──────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
              >
                {/* Eyebrow */}
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Star className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />
                  <span className="text-[10.5px] font-black uppercase tracking-[0.22em]" style={{ color: BRAND_GOLD }}>
                    Commande confirmée
                  </span>
                  <Star className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />
                </div>

                <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: textPrimary }}>
                  Merci pour votre commande !
                </h1>

                <p className="mx-auto mt-3 max-w-xs text-[14.5px] leading-relaxed" style={{ color: textMuted }}>
                  Votre paiement a été validé. Nous préparons votre commande avec le plus grand soin.
                </p>
              </motion.div>

              {/* ── Tampon de référence commande (OrderReferenceBadge) ─────────
        *  SIGNATURE SECONDAIRE : la référence "s'imprime" avec un spring
        *  (scale: 1.3 → 0.95 → 1) comme un tampon officiel.
        *  Visible uniquement si la référence est disponible en query param.
        * ─────────────────────────────────────────────────────────────── */}
              {reference && (
                <OrderReferenceBadge
                  reference={reference}
                  copied={copied}
                  onCopy={copyReference}
                  isDark={isDark} />
              )}

              {/* ── Mini-timeline "Ce qui arrive ensuite" ──────────────────────
        *  Spécifique à une commande — n'existerait pas sur une recharge.
        *  3 étapes : confirmation (faite) → préparation → livraison.
        * ─────────────────────────────────────────────────────────────── */}
              <NextStepsStrip isDark={isDark} cardBorder={cardBorder} />

              {/* ── Décompte — ring SVG + barre (identiques à wallet/success) ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="my-6 flex flex-col items-center gap-4"
              >
                <CircularCountdown
                  countdown={countdown}
                  progressRatio={progressRatio}
                  isDark={isDark}
                  textMuted={textMuted} />

                {/* Barre linéaire secondaire */}
                <div className="w-full max-w-xs">
                  <div
                    className="h-1 w-full overflow-hidden rounded-full"
                    style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, #2d7a63)` }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${progressRatio * 100}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }} />
                  </div>
                </div>
              </motion.div>

              {/* ── CTAs — deux actions (voir commande + continuer achats) ──── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="space-y-3"
              >
                {/* CTA principal — voir détails commande */}
                <Link
                  href={targetUrl}
                  className="group flex items-center justify-center gap-2.5 rounded-2xl py-4 font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_FOREST}, #2d7a63)`,
                    boxShadow: `0 10px 32px rgba(31,77,63,0.35)`,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                  Voir ma commande
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* CTA secondaire — continuer les achats */}
                <Link
                  href="/products"
                  className="group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${cardBorder}`,
                    color: textMuted,
                  }}
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.75} style={{ color: BRAND_FOREST }} />
                  Continuer mes achats
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Badge de sécurité — sous la carte (identique à wallet/success) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[12px] font-semibold"
            style={{
              background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.18)",
              color: isDark ? "rgba(52,211,153,0.85)" : "#059669",
            }}
          >
            <Shield className="h-4 w-4" />
            Transaction protégée par chiffrement 256-bit
          </motion.div>
        </motion.div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Wrapper Suspense (requis pour useSearchParams)
   ════════════════════════════════════════════════════════════════════════════ */

export default function SuccessCommandePage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
          <div className="relative z-10 w-full max-w-xl">
            <div className="h-[600px] w-full animate-pulse rounded-3xl bg-black/5 dark:bg-white/5 backdrop-blur-2xl" />
          </div>
        </div>
      }
    >
      <SuccessCommandeContent />
    </Suspense>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Sous-composants présentationnels
   ════════════════════════════════════════════════════════════════════════════ */

/* ── FloatingOrbs — identique à wallet/success ──────────────────────────── */

function FloatingOrbs({ isDark }: { isDark: boolean }) {
  return (
    <>
      <style>{`
        @keyframes orbDrift {
          0%   { opacity: 0; transform: translateY(0) scale(0.6); }
          15%  { opacity: 0.65; }
          80%  { opacity: 0.35; }
          100% { opacity: 0; transform: translateY(-180px) scale(1.2); }
        }
      `}</style>
      {FLOATING_ORBS.map((orb) => (
        <div
          key={orb.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: orb.left,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            opacity: 0,
            filter: "blur(3px)",
            animation: `orbDrift ${orb.dur}s ${orb.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}

/* ── OrderReferenceBadge ─────────────────────────────────────────────────────
 *
 * La référence de commande "s'imprime" comme un tampon officiel.
 * Spring overshoot (scale 1.3 → 0.95 → 1) + délai 0.55s après le titre.
 * Le fond sombre + texte or + police mono rappelle un bordereau de livraison.
 * Bouton de copie avec feedback AnimatePresence check/copy.
 */
function OrderReferenceBadge({
  reference,
  copied,
  onCopy,
  isDark,
}: {
  reference: string;
  copied: boolean;
  onCopy: () => void;
  isDark: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.5 }}
      className="mx-auto mt-5 inline-flex items-center gap-3 rounded-2xl px-5 py-3.5"
      style={{
        background: isDark
          ? "rgba(31,77,63,0.25)"
          : "rgba(31,77,63,0.08)",
        border: `1.5px solid ${BRAND_FOREST}35`,
        boxShadow: `0 4px 20px rgba(31,77,63,0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Puce visuelle */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ background: BRAND_GOLD_SOFT, border: `1px solid ${BRAND_GOLD}30` }}
      >
        <CheckCircle2 className="h-4 w-4" style={{ color: BRAND_GOLD }} strokeWidth={2} />
      </div>

      <div className="text-left">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
        >
          Référence commande
        </p>
        <p
          className="mt-0.5 font-mono text-[16px] font-black tracking-wider"
          style={{ color: BRAND_FOREST }}
        >
          {reference}
        </p>
      </div>

      {/* Bouton copier avec feedback animé */}
      <button
        onClick={onCopy}
        className="ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
        style={{
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
        }}
        aria-label={copied ? "Référence copiée" : "Copier la référence"}
        title={copied ? "Copié !" : "Copier la référence"}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
            >
              <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span key="copy" initial={{ scale: 1 }} exit={{ scale: 0 }}>
              <Copy
                className="h-3.5 w-3.5"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

/* ── NextStepsStrip ──────────────────────────────────────────────────────────
 *
 * Mini-timeline horizontale "Ce qui arrive ensuite" — spécifique aux commandes.
 * 3 étapes : confirmation email (faite ✓) → préparation (en cours ●) → livraison (à venir ○).
 *
 * Architecture :
 *   - Étape 1 (done) : pastille verte, texte plein
 *   - Étape 2 (active) : pastille amber pulsante, texte plein
 *   - Étape 3 (coming) : pastille muette, texte atténué
 *   - Connecteurs entre étapes avec état (plein/vide)
 */
function NextStepsStrip({
  isDark,
  cardBorder,
}: {
  isDark: boolean;
  cardBorder: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.45 }}
      className="mx-auto mt-6 w-full max-w-sm rounded-2xl p-4"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${cardBorder}`,
      }}
    >
      <p
        className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
      >
        Ce qui arrive ensuite
      </p>

      {/* Étapes en colonne (plus lisibles que horizontal sur mobile) */}
      <div className="relative space-y-4">
        {/* Fil connecteur vertical */}
        <div
          aria-hidden
          className="absolute left-[15px] top-[28px] w-px"
          style={{
            height: "calc(100% - 40px)",
            background: `linear-gradient(to bottom, #10B981, ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}, ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"})`,
          }}
        />

        {NEXT_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.35 }}
              className="flex items-start gap-3"
            >
              {/* Pastille d'état */}
              <div className="relative mt-0.5 flex-shrink-0">
                {step.done ? (
                  /* Étape faite — pastille verte avec checkmark */
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.4)" }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  </div>
                ) : step.active ? (
                  /* Étape active — pastille amber pulsante */
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: "rgba(245,158,11,0.15)", border: "1.5px solid #F59E0B" }}
                  >
                    <motion.div
                      className="absolute h-7 w-7 rounded-full"
                      style={{ border: "1.5px solid #F59E0B" }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  </div>
                ) : (
                  /* Étape à venir — pastille muette */
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${cardBorder}` }}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}
                    />
                  </div>
                )}
              </div>

              {/* Contenu textuel */}
              <div className="min-w-0 pb-1">
                <p
                  className="text-[13px] font-bold leading-tight"
                  style={{
                    color: step.done
                      ? "#10B981"
                      : step.active
                        ? isDark ? "rgba(255,255,255,0.85)" : "#1f241c"
                        : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                  }}
                >
                  {step.label}
                </p>
                <p
                  className="mt-0.5 text-[11.5px]"
                  style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}
                >
                  {step.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── CircularCountdown — identique à wallet/success ─────────────────────── */

function CircularCountdown({
  countdown,
  progressRatio,
  isDark,
  textMuted,
}: {
  countdown: number;
  progressRatio: number;
  isDark: boolean;
  textMuted: string;
}) {
  const R = 28;
  const C = 2 * Math.PI * R; // ≈ 175.9

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
          {/* Rail de fond */}
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
            strokeWidth="3.5"
          />
          {/* Arc de progression — se vide avec le temps */}
          <motion.circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke={BRAND_FOREST}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: C * progressRatio }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            transform="rotate(-90 40 40)"
          />
          {/* Point doré glissant à la pointe de l'arc */}
          <motion.circle
            cx="40" cy={40 - R} r="4"
            fill={BRAND_GOLD}
            initial={{ opacity: 0 }}
            animate={{ opacity: progressRatio < 0.95 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            transform={`rotate(${progressRatio * 360} 40 40)`}
          />
          {/* Chiffre du décompte */}
          <text
            x="40" y="45"
            textAnchor="middle"
            fontSize="22"
            fontWeight="900"
            fill={BRAND_FOREST}
            fontFamily="inherit"
          >
            {countdown}
          </text>
        </svg>
      </div>

      <p className="text-[12.5px] font-medium" style={{ color: textMuted }}>
        Accès automatique dans{" "}
        <span className="font-black" style={{ color: BRAND_FOREST }}>
          {countdown}s
        </span>
      </p>
    </div>
  );
}