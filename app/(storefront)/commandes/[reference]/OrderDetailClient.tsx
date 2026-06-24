/**
 * OrderDetailClient — Page de détail de commande ultra-premium
 *
 * Design glass-morphism dark/light, animations fluides Framer Motion,
 * timeline de statuts, récapitulatif financier détaillé, articles commandés.
 *
 * @module app/commandes/[reference]/OrderDetailClient
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ShoppingBag,
  FileText,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Receipt,
  Tag,
  Star,
  ExternalLink,
  PackageCheck,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getMyOrderByReference, getOrderHistory } from "@/fonctions_api/commandes.api";
import type { OrderDetail, OrderHistory, OrderStatus } from "@/modeles/commandes";

/* ─────────────────────────────────────────────────────────────────────────────
   Configuration des statuts
   ─────────────────────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    step: number;
  }
> = {
  draft: {
    label: "Brouillon",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.25)",
    glow: "rgba(148,163,184,0.15)",
    Icon: FileText,
    step: 0,
  },
  pending_payment: {
    label: "Paiement en attente",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.15)",
    Icon: Clock,
    step: 1,
  },
  paid: {
    label: "Payée",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    glow: "rgba(16,185,129,0.15)",
    Icon: CreditCard,
    step: 2,
  },
  confirmed: {
    label: "Confirmée",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    glow: "rgba(59,130,246,0.15)",
    Icon: CheckCircle2,
    step: 3,
  },
  processing: {
    label: "En préparation",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
    glow: "rgba(249,115,22,0.15)",
    Icon: Package,
    step: 4,
  },
  shipped: {
    label: "Expédiée",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    glow: "rgba(6,182,212,0.15)",
    Icon: Truck,
    step: 5,
  },
  delivered: {
    label: "Livrée",
    color: "#1f4d3f",
    bg: "rgba(31,77,63,0.12)",
    border: "rgba(31,77,63,0.3)",
    glow: "rgba(31,77,63,0.2)",
    Icon: PackageCheck,
    step: 6,
  },
  cancelled: {
    label: "Annulée",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    glow: "rgba(239,68,68,0.15)",
    Icon: XCircle,
    step: -1,
  },
  refunded: {
    label: "Remboursée",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
    glow: "rgba(168,85,247,0.15)",
    Icon: RotateCcw,
    step: -2,
  },
};

const JOURNEY_STEPS: OrderStatus[] = [
  "pending_payment",
  "paid",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

/* ─────────────────────────────────────────────────────────────────────────────
   Animation variants
   ─────────────────────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Composant principal
   ─────────────────────────────────────────────────────────────────────────── */

export default function OrderDetailClient({ reference }: { reference: string }) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const bg = isDark ? "#0a0f0b" : "#f8faf8";
  const card = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.95)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#0f1a0f";
  const muted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const subtle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [orderRes, historyRes] = await Promise.all([
      getMyOrderByReference(reference),
      getOrderHistory(reference),
    ]);
    if (orderRes.ok) {
      setOrder(orderRes.data);
    } else {
      setError(orderRes.error?.message || "Commande introuvable.");
    }
    if (historyRes.ok) setHistory(historyRes.data);
    setLoading(false);
  }, [reference]);

  useEffect(() => {
    load();
  }, [load]);

  const copyReference = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: bg }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div
              className="h-16 w-16 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #1f4d3f, #2d7a63)",
                boxShadow: "0 8px 32px rgba(31,77,63,0.4)",
              }}
            />
            <Loader2
              className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white"
            />
          </div>
          <p className="text-sm font-medium" style={{ color: muted }}>
            Chargement de votre commande…
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !order) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-6 px-4"
        style={{ background: bg }}
      >
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-5 text-center"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: text }}>
              Commande introuvable
            </h1>
            <p className="mt-2 text-sm" style={{ color: muted }}>
              {error || "Cette commande n'existe pas ou vous n'y avez pas accès."}
            </p>
          </div>
          <Link
            href="/dashboard?tab=orders"
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #1f4d3f, #2d7a63)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Mes commandes
          </Link>
        </motion.div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.draft;
  const { Icon: StatusIcon } = statusCfg;
  const currentStep = statusCfg.step;
  const isFailed = order.status === "cancelled" || order.status === "refunded";

  const subtotal = parseFloat(order.items_total);
  const shipping = parseFloat(order.frais_livraison);
  const discount = parseFloat(order.discount_amount);
  const tax = parseFloat(order.tax_amount);
  const total = parseFloat(order.total_final);

  return (
    <div className="min-h-screen pb-24" style={{ background: bg }}>
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(10,20,13,0.98) 0%, rgba(15,30,20,0.98) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f0f7f3 100%)",
          borderBottom: `1px solid ${cardBorder}`,
        }}
      >
        {/* Decorative orbs */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: statusCfg.color }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "#1f4d3f" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
            <Link
              href="/dashboard?tab=orders"
              className="mb-8 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-105"
              style={{
                background: subtle,
                border: `1px solid ${cardBorder}`,
                color: muted,
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Mes commandes
            </Link>
          </motion.div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Title + Reference */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    background: statusCfg.bg,
                    border: `1px solid ${statusCfg.border}`,
                    boxShadow: `0 4px 20px ${statusCfg.glow}`,
                  }}
                >
                  <StatusIcon className="h-5 w-5" style={{ color: statusCfg.color }} />
                </div>
                <h1
                  className="font-display text-2xl font-black lg:text-3xl"
                  style={{ color: text }}
                >
                  Détail de commande
                </h1>
              </div>

              {/* Reference badge */}
              <button
                onClick={copyReference}
                className="group flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all hover:scale-105"
                style={{
                  background: subtle,
                  border: `1px solid ${cardBorder}`,
                }}
                title="Copier la référence"
              >
                <span
                  className="font-mono text-sm font-bold tracking-wide"
                  style={{ color: "#1f4d3f" }}
                >
                  {reference}
                </span>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: muted }} />
                )}
              </button>
            </motion.div>

            {/* Status badge + date */}
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-start gap-2 sm:items-end"
            >
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2"
                style={{
                  background: statusCfg.bg,
                  border: `1.5px solid ${statusCfg.border}`,
                  boxShadow: `0 4px 24px ${statusCfg.glow}`,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: statusCfg.color }}
                />
                <span className="text-sm font-bold" style={{ color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5" style={{ color: muted }}>
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">
                  Passée le {formatDate(order.created_at, "fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {order.paid_at && (
                <div className="flex items-center gap-1.5" style={{ color: "#10b981" }}>
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    Payée le {formatDate(order.paid_at)}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ══ Left Column ══ */}
          <div className="space-y-8 lg:col-span-7 xl:col-span-8">

            {/* Journey Timeline */}
            {!isFailed && (
              <motion.div
                variants={fadeUp}
                custom={3}
                initial="hidden"
                animate="visible"
              >
                <SectionCard title="Suivi de commande" icon={Truck} isDark={isDark} card={card} cardBorder={cardBorder} text={text} muted={muted}>
                  <OrderJourney
                    steps={JOURNEY_STEPS}
                    currentStatus={order.status}
                    statusConfig={STATUS_CONFIG}
                    currentStep={currentStep}
                    isDark={isDark}
                    muted={muted}
                  />
                </SectionCard>
              </motion.div>
            )}

            {/* Articles */}
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
              <SectionCard
                title={`Articles commandés (${order.items.length})`}
                icon={ShoppingBag}
                isDark={isDark}
                card={card}
                cardBorder={cardBorder}
                text={text}
                muted={muted}
              >
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      variants={fadeUp}
                      custom={i * 0.5}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01]"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${cardBorder}`,
                      }}
                    >
                      {/* Article Icon placeholder */}
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(31,77,63,0.15), rgba(31,77,63,0.05))",
                          border: `1px solid rgba(31,77,63,0.2)`,
                        }}
                      >
                        <Package className="h-6 w-6" style={{ color: "#1f4d3f" }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold" style={{ color: text }}>
                          {item.product_name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {item.product_sku && (
                            <span
                              className="rounded-md px-2 py-0.5 font-mono text-[11px]"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                color: muted,
                              }}
                            >
                              {item.product_sku}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: muted }}>
                            {formatCurrency(item.unit_price, "FCFA")} × {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-bold text-base" style={{ color: "#1f4d3f" }}>
                          {formatCurrency(item.subtotal, "FCFA")}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: muted }}>
                          {item.quantity} article{item.quantity > 1 ? "s" : ""}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>
            </motion.div>

            {/* Historique des statuts */}
            {history.length > 0 && (
              <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
                <SectionCard
                  title="Historique des événements"
                  icon={Clock}
                  isDark={isDark}
                  card={card}
                  cardBorder={cardBorder}
                  text={text}
                  muted={muted}
                >
                  <div className="relative">
                    <div
                      className="absolute left-4 top-0 bottom-0 w-px"
                      style={{ background: `linear-gradient(to bottom, ${cardBorder}, transparent)` }}
                    />
                    <div className="space-y-5 pl-10">
                      {history.map((evt, i) => {
                        const cfg = STATUS_CONFIG[evt.new_status as OrderStatus];
                        const EvtIcon = cfg?.Icon ?? CheckCircle2;
                        return (
                          <motion.div
                            key={evt.id}
                            variants={fadeUp}
                            custom={i * 0.4}
                            initial="hidden"
                            animate="visible"
                            className="relative"
                          >
                            <div
                              className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full"
                              style={{
                                background: cfg?.bg || subtle,
                                border: `1.5px solid ${cfg?.border || cardBorder}`,
                                boxShadow: `0 0 12px ${cfg?.glow || "transparent"}`,
                              }}
                            >
                              <EvtIcon className="h-3.5 w-3.5" style={{ color: cfg?.color || muted }} />
                            </div>

                            <div
                              className="rounded-2xl p-4"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                border: `1px solid ${cardBorder}`,
                              }}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {evt.old_status && (
                                    <>
                                      <span
                                        className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
                                        style={{
                                          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                          color: muted,
                                        }}
                                      >
                                        {STATUS_CONFIG[evt.old_status as OrderStatus]?.label || evt.old_status}
                                      </span>
                                      <span style={{ color: muted }}>→</span>
                                    </>
                                  )}
                                  <span
                                    className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
                                    style={{
                                      background: cfg?.bg || subtle,
                                      color: cfg?.color || muted,
                                      border: `1px solid ${cfg?.border || cardBorder}`,
                                    }}
                                  >
                                    {cfg?.label || evt.new_status}
                                  </span>
                                </div>
                                <span className="text-[11px]" style={{ color: muted }}>
                                  {formatDate(evt.created_at, "fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {evt.comment && (
                                <p className="mt-2 text-xs leading-relaxed" style={{ color: muted }}>
                                  {evt.comment}
                                </p>
                              )}
                              {evt.changed_by_email && (
                                <p className="mt-1 text-[11px]" style={{ color: muted }}>
                                  Par : {evt.changed_by_email}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </div>

          {/* ══ Right Column ══ */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            {/* Récapitulatif financier */}
            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
              <SectionCard
                title="Récapitulatif"
                icon={Receipt}
                isDark={isDark}
                card={card}
                cardBorder={cardBorder}
                text={text}
                muted={muted}
              >
                <div className="space-y-3">
                  <FinancialRow label="Sous-total articles" value={formatCurrency(String(subtotal), "FCFA")} muted={muted} text={text} />
                  <FinancialRow label="Frais de livraison" value={formatCurrency(String(shipping), "FCFA")} muted={muted} text={text} icon={<Truck className="h-3.5 w-3.5" />} />
                  {discount > 0 && (
                    <FinancialRow
                      label="Réduction appliquée"
                      value={`− ${formatCurrency(String(discount), "FCFA")}`}
                      muted={muted}
                      text="#10b981"
                      highlight
                      icon={<Tag className="h-3.5 w-3.5" />}
                    />
                  )}
                  {tax > 0 && (
                    <FinancialRow label="Taxes" value={formatCurrency(String(tax), "FCFA")} muted={muted} text={text} />
                  )}

                  <div
                    className="my-1 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${cardBorder}, transparent)` }}
                  />

                  {/* Total */}
                  <div
                    className="flex items-center justify-between rounded-2xl px-4 py-4"
                    style={{
                      background: "linear-gradient(135deg, rgba(31,77,63,0.12), rgba(31,77,63,0.06))",
                      border: "1.5px solid rgba(31,77,63,0.25)",
                      boxShadow: "0 4px 20px rgba(31,77,63,0.08)",
                    }}
                  >
                    <span className="font-bold text-base" style={{ color: "#1f4d3f" }}>
                      Total payé
                    </span>
                    <span className="text-xl font-black" style={{ color: "#1f4d3f" }}>
                      {formatCurrency(String(total), "FCFA")}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Informations de livraison */}
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
              <SectionCard
                title="Livraison"
                icon={MapPin}
                isDark={isDark}
                card={card}
                cardBorder={cardBorder}
                text={text}
                muted={muted}
              >
                <div className="space-y-4">
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Adresse"
                    value={order.address_livraison.split("|")[0] || order.address_livraison}
                    muted={muted}
                    text={text}
                    isDark={isDark}
                    cardBorder={cardBorder}
                  />
                  {order.city && (
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Ville / Pays"
                      value={`${order.city}${order.country ? ` — ${order.country}` : ""}`}
                      muted={muted}
                      text={text}
                      isDark={isDark}
                      cardBorder={cardBorder}
                    />
                  )}
                  {order.phone_livraison && (
                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Téléphone"
                      value={order.phone_livraison}
                      muted={muted}
                      text={text}
                      isDark={isDark}
                      cardBorder={cardBorder}
                    />
                  )}
                  {order.notes && (
                    <InfoRow
                      icon={<FileText className="h-4 w-4" />}
                      label="Notes"
                      value={order.notes}
                      muted={muted}
                      text={text}
                      isDark={isDark}
                      cardBorder={cardBorder}
                    />
                  )}
                </div>
              </SectionCard>
            </motion.div>

            {/* CTA Actions */}
            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="space-y-3">
              <Link
                href="/dashboard?tab=orders"
                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #1f4d3f, #2d7a63)",
                  boxShadow: "0 8px 24px rgba(31,77,63,0.3)",
                  color: "#fff",
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                Toutes mes commandes
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${cardBorder}`,
                  color: text,
                }}
              >
                <Star className="h-4 w-4" style={{ color: "#1f4d3f" }} />
                Continuer mes achats
                <ExternalLink className="h-3.5 w-3.5" style={{ color: muted }} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sous-composant : SectionCard
   ─────────────────────────────────────────────────────────────────────────── */

function SectionCard({
  title,
  icon: Icon,
  children,
  isDark,
  card,
  cardBorder,
  text,
  muted,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
  isDark: boolean;
  card: string;
  cardBorder: string;
  text: string;
  muted: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        background: card,
        border: `1px solid ${cardBorder}`,
        backdropFilter: "blur(16px)",
        boxShadow: isDark
          ? "0 4px 32px rgba(0,0,0,0.3)"
          : "0 4px 32px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-6 py-4"
        style={{ borderColor: cardBorder }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: "rgba(31,77,63,0.12)" }}
        >
          <Icon className="h-4 w-4" style={{ color: "#1f4d3f" }} />
        </div>
        <h2 className="font-bold text-sm tracking-tight" style={{ color: text }}>
          {title}
        </h2>
      </div>

      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sous-composant : OrderJourney (stepper horizontal)
   ─────────────────────────────────────────────────────────────────────────── */

function OrderJourney({
  steps,
  currentStatus,
  statusConfig,
  currentStep,
  isDark,
  muted,
}: {
  steps: OrderStatus[];
  currentStatus: OrderStatus;
  statusConfig: typeof STATUS_CONFIG;
  currentStep: number;
  isDark: boolean;
  muted: string;
}) {
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div
          className="absolute top-4 left-0 right-0 h-0.5 z-0"
          style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
        />
        {/* Filled progress */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 z-0"
          style={{ background: "linear-gradient(to right, #1f4d3f, #2d7a63)" }}
          initial={{ width: "0%" }}
          animate={{
            width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}%`,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />

        {steps.map((stepStatus, i) => {
          const cfg = statusConfig[stepStatus];
          const StepIcon = cfg.Icon;
          const isDone = currentStep > cfg.step;
          const isCurrent = currentStatus === stepStatus;

          return (
            <div key={stepStatus} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: isDone || isCurrent
                    ? "linear-gradient(135deg, #1f4d3f, #2d7a63)"
                    : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  border: isCurrent
                    ? "2px solid #1f4d3f"
                    : isDone
                    ? "2px solid #1f4d3f"
                    : `2px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                  boxShadow: isCurrent ? "0 0 16px rgba(31,77,63,0.5)" : "none",
                }}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <StepIcon
                    className="h-3.5 w-3.5"
                    style={{ color: isCurrent ? "#fff" : muted }}
                  />
                )}
              </motion.div>

              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="text-center text-[10px] font-semibold leading-tight max-w-[60px]"
                style={{
                  color: isDone || isCurrent ? "#1f4d3f" : muted,
                }}
              >
                {cfg.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sous-composant : FinancialRow
   ─────────────────────────────────────────────────────────────────────────── */

function FinancialRow({
  label,
  value,
  muted,
  text,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  muted: string;
  text: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        {icon && (
          <span style={{ color: highlight ? "#10b981" : muted }}>{icon}</span>
        )}
        <span className="text-sm" style={{ color: muted }}>
          {label}
        </span>
      </div>
      <span
        className="text-sm font-semibold"
        style={{ color: highlight ? "#10b981" : text }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sous-composant : InfoRow
   ─────────────────────────────────────────────────────────────────────────── */

function InfoRow({
  icon,
  label,
  value,
  muted,
  text,
  isDark,
  cardBorder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted: string;
  text: string;
  isDark: boolean;
  cardBorder: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-3"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${cardBorder}`,
      }}
    >
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(31,77,63,0.1)" }}
      >
        <span style={{ color: "#1f4d3f" }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: muted }}>
          {label}
        </p>
        <p className="text-sm font-medium leading-relaxed break-words" style={{ color: text }}>
          {value}
        </p>
      </div>
    </div>
  );
}
