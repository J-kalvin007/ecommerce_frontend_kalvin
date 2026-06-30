/**
 * DashboardClient.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Panneau de contrôle principal de l'espace client — version premium.
 *
 * Direction artistique — "private banking portal" :
 *   Le dashboard est la page que le client voit en premier après connexion.
 *   Elle doit inspirer confiance et clarté immédiate, comme l'écran d'accueil
 *   d'une application bancaire haut de gamme (Revolut Metal, N26 Black).
 *
 *   Signature visuelle — le pari esthétique de ce composant :
 *   Un "KPI Ticker" — une bande de 4 tuiles de statistiques avec des compteurs
 *   qui s'animent de 0 à leur valeur réelle au chargement des données. Emprunté
 *   aux terminaux financiers (Bloomberg, Reuters), ce moment de révélation
 *   progressive communique transparence et précision — valeurs spécifiques à une
 *   fintech, pas à un site de blogs ou une landing page générique.
 *
 * Ce qui reste strictement inchangé :
 *   - Toutes les fonctions utilitaires (formatAmount, formatDate)
 *   - Toutes les constantes (ORDER_STATUS_LABELS, ORDER_STATUS_COLORS)
 *   - Tous les états React et leurs setters
 *   - La logique de chargement fetchDashboardData (useEffect, Promise.allSettled)
 *   - Les données dérivées (greeting, displayName)
 *   - Tous les imports d'API et de modèles
 *
 * @module app/customer/dashboard_client/DashboardClient
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Wallet,
  Star,
  Heart,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Receipt,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

import { useAuthStore } from "@/store/authStore";
import { mediaUrl } from "@/lib/mediaUrl";
import LoadingStyle from "@/components/special/loadingStyle";

// APIs
import { getMyOrders } from "@/fonctions_api/commandes.api";
import { getMyWallet, getMyWalletHistory } from "@/fonctions_api/wallets-paiements.api";
import { getMyLoyaltyProfile } from "@/fonctions_api/fidelites.api";
import { getMyFavorites } from "@/fonctions_api/notes-favoris.api";

// Modèles
import type { OrderList } from "@/modeles/commandes";
import { WALLET_TRANSACTION_TYPE_LABELS } from "@/modeles/wallets-paiements";
import type { Wallet as WalletModel, WalletTransaction } from "@/modeles/wallets-paiements";
import type { LoyaltyProfile } from "@/modeles/fidelites";
import type { FavoriteProduct } from "@/modeles/notes-favoris";

/* ── Jetons de design (cohérents avec CommandesClient & LoyaltyTiersGrid) ── */

const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_SOFT = "rgba(201,168,118,0.14)";
const DARK_INK = "#1f241c";
const STONE = "#8A9080";
const WARM_PAPER = "#F7F5F0";
const WARM_BORDER = "#E8E3D8";

/* ── Variants d'animation partagés ─────────────────────────────────────── */

/** Conteneur qui orchestre l'apparition en cascade de ses enfants directs. */
const cascadeContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Chaque enfant monte avec un léger glissement. */
const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Utilitaires (identiques à la version d'origine) ───────────────────── */

function formatAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 FCFA";
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " FCFA"
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending_payment: "En attente",
  paid: "Payée",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_payment: "bg-orange-50 text-orange-700 border-orange-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-pink-50 text-pink-700 border-pink-200",
};

/**
 * Bord gauche coloré de chaque ligne de commande — encodage chromatique du
 * statut, plus lisible qu'un badge seul car il ancre toute la ligne.
 */
const ORDER_STATUS_BORDER: Record<string, string> = {
  draft: "#9CA3AF",
  pending_payment: "#F97316",
  paid: "#10B981",
  confirmed: "#3B82F6",
  processing: "#6366F1",
  shipped: "#8B5CF6",
  delivered: "#059669",
  cancelled: "#EF4444",
  refunded: "#EC4899",
};

/* ── Dashboard Aggregator ────────────────────────────────────────────────── */

export default function DashboardClient() {
  const { user } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();

  /* ── États (identiques à l'original) ─────────────────────────────────── */
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [wallet, setWallet] = useState<WalletModel | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  /* ── Chargement de toutes les données en parallèle (identique) ──────── */
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);

      const [ordersRes, walletRes, historyRes, loyaltyRes, favsRes] =
        await Promise.allSettled([
          getMyOrders(),
          getMyWallet(),
          getMyWalletHistory(),
          getMyLoyaltyProfile(),
          getMyFavorites(),
        ]);

      if (ordersRes.status === "fulfilled" && ordersRes.value.ok)
        setOrders(ordersRes.value.data.slice(0, 3));

      if (walletRes.status === "fulfilled" && walletRes.value.ok)
        setWallet(walletRes.value.data);

      if (historyRes.status === "fulfilled" && historyRes.value.ok)
        setTransactions(historyRes.value.data.slice(0, 4));

      if (loyaltyRes.status === "fulfilled" && loyaltyRes.value.ok)
        setLoyalty(loyaltyRes.value.data);

      if (favsRes.status === "fulfilled" && favsRes.value.ok)
        setFavorites(favsRes.value.data.slice(0, 4));

      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  /* ── État de chargement ──────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex min-h-[90vh] flex-col items-center justify-center">
        <LoadingStyle label="Préparation de votre espace…" size={18} />
      </div>
    );
  }

  /* ── Données dérivées (identiques à l'original) ─────────────────────── */
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Client";

  /* ═══════════════════════════════════════════════════════════════════════
     Rendu Principal
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative mx-auto max-w-8xl space-y-8 px-20 py-8 sm:px-6 lg:px-20">

      {/* ─────────────────────────────────────────────────────────────────────
       *  Halo ambiant — cohérent avec le tunnel de commande
       * ─────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 0%, rgba(31,77,63,0.07), transparent 70%), " +
            "radial-gradient(35% 30% at 92% 8%, rgba(201,168,118,0.06), transparent 70%)",
        }}
      />

      {/* ═════════════════════════════════════════════════════════════════════
       *  BLOC 1 — Carte de bienvenue "membre premium"
       *
       *  Conserve le fond forest dark de l'original.
       *  Enrichissements :
       *    - Liseré doré en bas (porte la même couleur que le fil du stepper)
       *    - Grain de papier en couverture via un filtre SVG
       *    - Deux colonnes sur md+ : nom à gauche, badges à droite
       * ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background:
            "linear-gradient(140deg, #0d1a0f 0%, #1a2e1c 45%, #0f2012 100%)",
          boxShadow:
            "0 28px 64px -16px rgba(31,77,63,0.38), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Texture de grain — subtile, perceptible sans être bruyante */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* SVG décoratif — identique à l'original (blob en arrière-plan) */}
        <div className="pointer-events-none absolute right-0 top-0 opacity-[0.07]">
          <svg width="380" height="380" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill={BRAND_GOLD}
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,80.7,-46.3C89.6,-33.5,94.4,-18,94.2,-2.7C94,-12.6,88.8,-25.2,79.9,-36.8C71,-48.4,58.4,-59,44.7,-67.2C31,-75.4,15.5,-81.2,-0.2,-80.9C-15.9,-80.6,-31.8,-74.2,-45.5,-65.4C-59.2,-56.6,-70.7,-45.4,-78.9,-31.6C-87.1,-17.8,-92,-1.4,-89.6,13.8C-87.2,29,-77.5,43,-64.7,52.9C-51.9,62.8,-36,68.6,-20.9,72.6C-5.8,76.6,8.5,78.8,22.6,76.1C36.7,73.4,50.6,65.8,61.9,55.3C73.2,44.8,81.9,31.4,85.2,16.5C88.5,1.6,86.4,-14.8,80.4,-29.4C74.4,-44,64.5,-56.8,52.2,-66.2C39.9,-75.6,25.2,-81.6,9.8,-83.4C-5.6,-85.2,-21.7,-82.8,-35.8,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        {/* Contenu */}
        <div className="relative z-10 flex flex-col gap-6 p-8 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          {/* Identité */}
          <div>
            <p
              className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {greeting},
            </p>
            <h1
              className="text-4xl font-black tracking-tight text-white sm:text-5xl"
              style={{ lineHeight: 1.08 }}
            >
              {displayName}
            </h1>

            {/* Badges de statut */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Compte sécurisé
              </span>

              {loyalty && (
                <span
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold backdrop-blur-sm"
                  style={{
                    background: BRAND_GOLD_SOFT,
                    borderColor: `${BRAND_GOLD}35`,
                    color: BRAND_GOLD,
                  }}
                >
                  <Crown className="h-3.5 w-3.5" />
                  Client {loyalty.tier_name}
                </span>
              )}
            </div>
          </div>

          {/* Résumé solde — visible uniquement sur les écrans md+ */}
          {wallet && (
            <div className="hidden sm:block shrink-0 text-right">
              <p
                className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Solde disponible
              </p>
              <p className="text-3xl font-black text-white tabular-nums tracking-tight">
                {formatAmount(wallet.balance)}
              </p>
            </div>
          )}
        </div>

        {/* Liseré doré inférieur — signature fil d'or du design system Kalvin */}
        <div
          aria-hidden
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}80, ${BRAND_GOLD}, ${BRAND_GOLD}80, transparent)`,
          }}
        />
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
       *  BLOC 2 — KPI Ticker
       *
       *  SIGNATURE VISUELLE : une bande de 4 statistiques-clés avec compteurs
       *  animés. Inspiré des terminaux financiers (Bloomberg) — spécifique à
       *  une fintech, impossible de retrouver ce traitement sur un site générique.
       *
       *  Les 4 compteurs s'animent de 0 à leur valeur réelle pendant 1.2 s.
       *  useReducedMotion court-circuite l'animation si l'utilisateur le
       *  préfère — accessibilité garantie.
       * ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cascadeContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <KpiTile
          label="Solde portefeuille"
          rawValue={wallet ? parseFloat(wallet.balance) : 0}
          unit="FCFA"
          icon={Wallet}
          color="#10B981"
          href="/customer/wallet"
          prefersReducedMotion={!!prefersReducedMotion}
          formatFn={(v) => new Intl.NumberFormat("fr-FR").format(Math.round(v))}
        />
        <KpiTile
          label="Points fidélité"
          rawValue={loyalty ? loyalty.points_balance : 0}
          unit="pts"
          icon={Star}
          color={BRAND_GOLD}
          href="/customer/fidelites"
          prefersReducedMotion={!!prefersReducedMotion}
          formatFn={(v) => new Intl.NumberFormat("fr-FR").format(Math.round(v))}
        />
        <KpiTile
          label="Commandes passées"
          rawValue={orders.length}
          unit="récentes"
          icon={Package}
          color="#6366F1"
          href="/customer/dashboard_client?tab=orders"
          prefersReducedMotion={!!prefersReducedMotion}
          formatFn={(v) => String(Math.round(v))}
        />
        <KpiTile
          label="Produits favoris"
          rawValue={favorites.length}
          unit="enregistrés"
          icon={Heart}
          color="#EC4899"
          href="/customer/notes-favoris"
          prefersReducedMotion={!!prefersReducedMotion}
          formatFn={(v) => String(Math.round(v))}
        />
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
       *  BLOC 3 — Grille principale : portefeuille + fidélité | commandes + rest
       * ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cascadeContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* ── Colonne gauche : Portefeuille & Fidélité ────────────────────── */}
        <div className="space-y-6 lg:col-span-1">

          {/* Carte Portefeuille — traitement "carte bancaire physique" */}
          <motion.div variants={cascadeItem}>
            <WalletPhysicalCard wallet={wallet} formatAmount={formatAmount} />
          </motion.div>

          {/* Carte Fidélité */}
          <motion.div variants={cascadeItem}>
            <LoyaltyCard loyalty={loyalty} />
          </motion.div>
        </div>

        {/* ── Colonne droite : Commandes récentes + Transactions + Favoris ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Commandes récentes */}
          <motion.div
            variants={cascadeItem}
            className="overflow-hidden rounded-3xl border bg-white shadow-sm"
            style={{ borderColor: WARM_BORDER }}
          >
            {/* En-tête de section */}
            <div
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: WARM_BORDER }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <Package className="h-4.5 w-4.5 text-indigo-600" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-[16px] font-black tracking-tight" style={{ color: DARK_INK }}>
                    Commandes récentes
                  </h2>
                  <p className="text-[12px]" style={{ color: STONE }}>
                    Vos 3 derniers achats
                  </p>
                </div>
              </div>
              <Link
                href="/customer/dashboard_client?tab=orders"
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[12px] font-bold transition-colors hover:bg-[#F7F5F0]"
                style={{ color: BRAND_FOREST }}
              >
                Tout voir <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Liste */}
            <div className="divide-y" style={{ borderColor: WARM_BORDER }}>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    formatAmount={formatAmount}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Package}
                  title="Aucune commande"
                  description="Vous n'avez pas encore passé de commande."
                  href="/products"
                  cta="Découvrir la boutique"
                />
              )}
            </div>
          </motion.div>

          {/* Grille secondaire — Transactions & Favoris côte à côte */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* Transactions récentes */}
            <motion.div
              variants={cascadeItem}
              className="overflow-hidden rounded-3xl border bg-white shadow-sm"
              style={{ borderColor: WARM_BORDER }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: WARM_BORDER }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
                  >
                    <Receipt className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[14px] font-black tracking-tight" style={{ color: DARK_INK }}>
                    Transactions
                  </h3>
                </div>
                <Link
                  href="/customer/wallet"
                  className="text-[12px] font-bold transition-colors hover:opacity-70"
                  style={{ color: STONE }}
                >
                  Voir tout
                </Link>
              </div>

              <div className="divide-y px-5" style={{ borderColor: WARM_BORDER }}>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      formatAmount={formatAmount}
                      formatDate={formatDate}
                    />
                  ))
                ) : (
                  <p
                    className="py-8 text-center text-[13px]"
                    style={{ color: STONE }}
                  >
                    Aucune transaction récente.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Favoris récents */}
            <motion.div
              variants={cascadeItem}
              className="overflow-hidden rounded-3xl border bg-white shadow-sm"
              style={{ borderColor: WARM_BORDER }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: WARM_BORDER }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)" }}
                  >
                    <Heart className="h-4 w-4 text-pink-500" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[14px] font-black tracking-tight" style={{ color: DARK_INK }}>
                    Favoris
                  </h3>
                </div>
                <Link
                  href="/customer/notes-favoris"
                  className="text-[12px] font-bold transition-colors hover:opacity-70"
                  style={{ color: STONE }}
                >
                  Voir tout
                </Link>
              </div>

              <div className="p-4">
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {favorites.map((product) => {
                      const imgUrl = mediaUrl(product.image);
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          className="group block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          style={{ borderColor: WARM_BORDER }}
                        >
                          {/* Image */}
                          <div
                            className="relative h-[72px] w-full overflow-hidden"
                            style={{ background: WARM_PAPER }}
                          >
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="100px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Heart className="h-5 w-5" style={{ color: "#C4BFB6" }} />
                              </div>
                            )}
                          </div>
                          {/* Infos */}
                          <div className="p-2">
                            <p className="truncate text-[11.5px] font-bold" style={{ color: DARK_INK }}>
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-[11px] font-black" style={{ color: BRAND_FOREST }}>
                              {formatAmount(product.price)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Heart className="mb-2 h-8 w-8" style={{ color: "#C4BFB6" }} />
                    <p className="text-[13px]" style={{ color: STONE }}>
                      Aucun favori enregistré.
                    </p>
                    <Link
                      href="/products"
                      className="mt-3 text-[12px] font-bold transition-opacity hover:opacity-70"
                      style={{ color: BRAND_FOREST }}
                    >
                      Parcourir les produits →
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Sous-composant KpiTile ─────────────────────────────────────────────── */

/**
 * KpiTile — une tuile de la bande KPI Ticker.
 *
 * Le compteur anime la valeur de 0 → rawValue en 1.2 s (easeOut).
 * L'animation est implémentée avec requestAnimationFrame pour fluidité
 * maximale, sans librairie externe supplémentaire.
 *
 * @param formatFn  Fonction de formatage appliquée à la valeur animée
 *                  (permet d'afficher des entiers, des montants, etc.)
 */
function KpiTile({
  label,
  rawValue,
  unit,
  icon: Icon,
  color,
  href,
  prefersReducedMotion,
  formatFn,
}: {
  label: string;
  rawValue: number;
  unit: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  color: string;
  href: string;
  prefersReducedMotion: boolean;
  formatFn: (v: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(
    prefersReducedMotion ? rawValue : 0
  );
  const rafRef = useRef<number | null>(null);

  /** Démarre le compteur animé au montage et à chaque changement de rawValue. */
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(rawValue);
      return;
    }

    const DURATION = 1200; // ms
    const startTime = performance.now();
    const startValue = 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out cubique : décélération douce à l'approche de la valeur finale
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (rawValue - startValue) * eased;
      setDisplayValue(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [rawValue, prefersReducedMotion]);

  return (
    <motion.div variants={cascadeItem}>
      <Link
        href={href}
        className="group flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        style={{ borderColor: WARM_BORDER }}
      >
        {/* Icône colorée */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `${color}14`,
            border: `1px solid ${color}22`,
          }}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} style={{ color }} />
        </div>

        {/* Valeur animée */}
        <div>
          <p
            className="text-[22px] font-black tabular-nums tracking-tight leading-none"
            style={{ color: DARK_INK }}
          >
            {formatFn(displayValue)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold" style={{ color }}>
            {unit}
          </p>
        </div>

        {/* Label */}
        <p className="text-[11.5px] leading-tight" style={{ color: STONE }}>
          {label}
        </p>
      </Link>
    </motion.div>
  );
}

/* ── Sous-composant WalletPhysicalCard ──────────────────────────────────── */

/**
 * WalletPhysicalCard — carte portefeuille au format "carte de crédit".
 *
 * La métaphore de la carte physique est spécifique au domaine payment/wallet
 * et n'aurait aucun sens sur un autre composant. Ici, elle ancre
 * immédiatement le propos et distingue ce bloc de tous les autres.
 */
function WalletPhysicalCard({
  wallet,
  formatAmount,
}: {
  wallet: WalletModel | null;
  formatAmount: (v: string | number) => string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-6 shadow-lg"
      style={{
        background:
          "linear-gradient(140deg, #0d1a0f 0%, #1a2e1c 50%, #0f2012 100%)",
        boxShadow:
          "0 20px 48px -12px rgba(31,77,63,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Grain de texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}
      />

      {/* En-tête carte */}
      <div className="relative z-10 mb-8 flex items-start justify-between">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Portefeuille
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">Kalvin Pay</p>
        </div>

        {/* Puce EMV stylisée */}
        <div
          className="h-8 w-10 rounded-md"
          style={{
            background:
              "linear-gradient(135deg, #c9a876 0%, #e8c87a 40%, #a07840 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        />
      </div>

      {/* Solde */}
      <div className="relative z-10 mb-6">
        <p
          className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Solde disponible
        </p>
        <p className="text-[28px] font-black text-white tabular-nums tracking-tight">
          {wallet ? formatAmount(wallet.balance) : "—"}
        </p>
      </div>

      {/* Liseré doré — signature du design system */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[2.5px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}80, ${BRAND_GOLD}, ${BRAND_GOLD}80, transparent)`,
        }}
      />

      {/* CTA Recharger */}
      <Link
        href="/customer/wallet"
        className="relative z-10 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all duration-300 hover:brightness-110"
        style={{
          background: BRAND_GOLD_SOFT,
          border: `1px solid ${BRAND_GOLD}40`,
          color: BRAND_GOLD,
        }}
      >
        <Wallet className="h-4 w-4" strokeWidth={1.75} />
        Gérer mon portefeuille
      </Link>
    </div>
  );
}

/* ── Sous-composant LoyaltyCard ─────────────────────────────────────────── */

/**
 * LoyaltyCard — aperçu fidélité avec barre de progression vers le prochain palier.
 */
function LoyaltyCard({ loyalty }: { loyalty: LoyaltyProfile | null }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border bg-white shadow-sm"
      style={{ borderColor: WARM_BORDER }}
    >
      {/* En-tête */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: WARM_BORDER }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: BRAND_GOLD_SOFT,
              border: `1px solid ${BRAND_GOLD}30`,
            }}
          >
            <Star className="h-4.5 w-4.5" style={{ color: BRAND_GOLD }} strokeWidth={1.75} />
          </div>
          <h2 className="text-[15px] font-black tracking-tight" style={{ color: DARK_INK }}>
            Fidélité
          </h2>
        </div>
        <Link
          href="/customer/fidelites"
          className="flex items-center gap-1 text-[12px] font-bold transition-opacity hover:opacity-70"
          style={{ color: BRAND_GOLD }}
        >
          Détails <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Corps */}
      <div className="p-5">
        {loyalty ? (
          <>
            {/* Grade actuel + points */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: STONE }}>
                  Grade actuel
                </p>
                <p className="mt-0.5 text-[17px] font-black" style={{ color: DARK_INK }}>
                  {loyalty.tier_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: STONE }}>
                  Points
                </p>
                <p className="mt-0.5 text-[17px] font-black tabular-nums" style={{ color: BRAND_FOREST }}>
                  {new Intl.NumberFormat("fr-FR").format(loyalty.points_balance)}
                  <span className="ml-1 text-[12px] font-semibold" style={{ color: STONE }}>pts</span>
                </p>
              </div>
            </div>

            {/* Barre de progression si palier suivant connu */}
            {loyalty.next_tier && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-medium" style={{ color: STONE }}>
                    {loyalty.tier_name}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: BRAND_GOLD }}>
                    {loyalty.next_tier.name}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: WARM_PAPER }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD})`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px]" style={{ color: STONE }}>
                  Continuez vos achats pour atteindre le grade{" "}
                  <strong style={{ color: DARK_INK }}>{loyalty.next_tier.name}</strong>
                </p>
              </div>
            )}

            {/* CTA */}
            <Link
              href="/customer/fidelites"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-[12.5px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor: WARM_BORDER,
                color: DARK_INK,
              }}
            >
              <TrendingUp className="h-4 w-4" style={{ color: BRAND_FOREST }} />
              Voir mon parcours
            </Link>
          </>
        ) : (
          <div className="py-4 text-center">
            <Sparkles className="mx-auto mb-2 h-8 w-8" style={{ color: "#C4BFB6" }} />
            <p className="text-[13px]" style={{ color: STONE }}>
              Profil fidélité non disponible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sous-composant OrderRow ─────────────────────────────────────────────── */

/**
 * OrderRow — ligne de commande avec bordure gauche colorée par statut.
 *
 * Le bord gauche coloré encode le statut chromatiquement sur toute la hauteur
 * de la ligne — plus expressif qu'un simple badge, car le signal visuel est
 * perceptible d'un coup d'œil sans lire le texte.
 */
function OrderRow({
  order,
  formatAmount,
  formatDate,
}: {
  order: OrderList;
  formatAmount: (v: string | number) => string;
  formatDate: (d: string) => string;
}) {
  const statusBorderColor =
    ORDER_STATUS_BORDER[order.status] || ORDER_STATUS_BORDER.draft;
  const statusPillClass =
    ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.draft;

  return (
    <Link
      href="/customer/dashboard_client?tab=orders"
      className="group flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-[#FAFAF8]"
      style={{
        borderLeft: `3px solid ${statusBorderColor}`,
      }}
    >
      {/* Icône */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-sm"
        style={{ background: WARM_PAPER }}
      >
        <Package
          className="h-5 w-5 transition-colors duration-300 group-hover:text-indigo-600"
          style={{ color: STONE }}
          strokeWidth={1.75}
        />
      </div>

      {/* Référence & date */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-black tracking-tight" style={{ color: DARK_INK }}>
          {order.reference}
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: STONE }}>
          {formatDate(order.created_at)} · {order.items_total} article(s)
        </p>
      </div>

      {/* Statut + montant */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10.5px] font-bold ${statusPillClass}`}
        >
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
        <p className="text-[14px] font-black tabular-nums" style={{ color: BRAND_FOREST }}>
          {formatAmount(order.total_final)}
        </p>
      </div>
    </Link>
  );
}

/* ── Sous-composant TransactionRow ──────────────────────────────────────── */

/**
 * TransactionRow — ligne de transaction au format "grand livre" (ledger).
 *
 * Les montants sont en police tabular-nums, alignés à droite — traitement
 * typographique spécifique aux relevés financiers.
 */
function TransactionRow({
  tx,
  formatAmount,
  formatDate,
}: {
  tx: WalletTransaction;
  formatAmount: (v: string | number) => string;
  formatDate: (d: string) => string;
}) {
  const isCredit =
    tx.transaction_type === "deposit" ||
    tx.transaction_type === "refund" ||
    tx.transaction_type === "cashback";

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Indicateur crédit/débit */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: isCredit
            ? "rgba(16,185,129,0.08)"
            : "rgba(239,68,68,0.08)",
          border: isCredit
            ? "1px solid rgba(16,185,129,0.18)"
            : "1px solid rgba(239,68,68,0.18)",
        }}
      >
        {isCredit ? (
          <ArrowDownLeft className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-red-500" strokeWidth={1.75} />
        )}
      </div>

      {/* Libellé + date */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold" style={{ color: DARK_INK }}>
          {WALLET_TRANSACTION_TYPE_LABELS[tx.transaction_type]}
        </p>
        <p className="text-[11px]" style={{ color: STONE }}>
          {formatDate(tx.created_at)}
        </p>
      </div>

      {/* Montant — tabular-nums pour l'alignement vertical */}
      <p
        className="shrink-0 text-[13px] font-black tabular-nums"
        style={{ color: isCredit ? "#10B981" : DARK_INK }}
      >
        {isCredit ? "+" : "−"}{formatAmount(tx.amount)}
      </p>
    </div>
  );
}

/* ── Sous-composant EmptyState ───────────────────────────────────────────── */

/**
 * EmptyState — état vide avec invitation à agir.
 * Suit le principe "treat failure and emptiness as moments for direction,
 * not mood" du guide de design.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: WARM_PAPER }}
      >
        <Icon className="h-6 w-6" strokeWidth={1.5} style={{ color: "#C4BFB6" }} />
      </div>
      <div>
        <p className="text-[15px] font-black" style={{ color: DARK_INK }}>
          {title}
        </p>
        <p className="mt-1 text-[13px]" style={{ color: STONE }}>
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="mt-1 flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          background: BRAND_FOREST,
          boxShadow: `0 8px 20px -6px ${BRAND_FOREST}50`,
        }}
      >
        {cta} <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}