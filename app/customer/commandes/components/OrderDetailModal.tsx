/**
 * OrderDetailModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modale de détail commande ultra-premium.
 *
 * Affiche toutes les informations d'une commande :
 *   - En-tête : référence, statut, dates
 *   - Section articles avec image placeholder, quantité, prix unitaire et sous-total
 *   - Section livraison : adresse, ville, pays, téléphone
 *   - Section récapitulatif financier : sous-total, livraison, remise, taxe, total
 *   - Bouton d'annulation (uniquement pour les statuts annulables)
 *   - Accès à l'historique des statuts
 *
 * Intègre :
 *   - Dialog.tsx (@/components/special/Dialog)
 *   - ConfirmDialog.tsx pour la confirmation d'annulation
 *   - Toast.tsx pour les notifications
 *   - LoadingStyle pour l'état de chargement
 *
 * @module app/customer/commnades/components/OrderDetailModal
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  MapPin,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  Truck,
  Tag,
  Calculator,
  Receipt,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/special/Dialog";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import Toast from "@/components/special/Toast";
import LoadingStyle from "@/components/special/loadingStyle";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderDetail, OrderHistory, OrderStatus } from "@/modeles/commandes";

/* ── Utilitaires locaux ─────────────────────────────────────────────────── */

function formatAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "— FCFA";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + " FCFA";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/** Statuts pour lesquels le client peut demander une annulation */
const CANCELLABLE_STATUSES: OrderStatus[] = ["pending_payment", "confirmed", "processing"];

/* ── Props ──────────────────────────────────────────────────────────────── */
interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail | null;
  history: OrderHistory[];
  isLoadingOrder: boolean;
  isLoadingHistory: boolean;
  isCancelling: boolean;
  onCancelOrder: () => void;
  onLoadHistory: () => void;
}

/* ── Sous-composant : ligne de prix ─────────────────────────────────────── */
function PriceLine({
  label,
  value,
  icon: Icon,
  highlight = false,
  negative = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${highlight
        ? "border-t border-[#1f4d3f]/10 pt-3 mt-1"
        : ""
        }`}
    >
      <span className="flex items-center gap-2 text-[13px] text-[#8A9080]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span
        className={`text-[13.5px] font-bold tracking-tight ${highlight
          ? "text-[1rem] text-[#1f4d3f]"
          : negative
            ? "text-red-500"
            : "text-[#1f241c]"
          }`}
      >
        {negative && parseFloat(value) > 0 ? "−" : ""}
        {value}
      </span>
    </div>
  );
}

/* ── Sous-composant : entrée d'historique ───────────────────────────────── */
function HistoryEntry({ entry, index }: { entry: OrderHistory; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex items-start gap-3"
    >
      {/* Dot timeline */}
      <div className="relative mt-1 shrink-0">
        <div className="h-2.5 w-2.5 rounded-full border-2 border-[#1f4d3f] bg-white" />
        {index === 0 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[#1f4d3f]/20"
            animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-3 border-b border-[#E8E3D8] last:border-0 last:pb-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[12.5px] font-semibold text-[#1f241c]">
            {entry.old_status} → {entry.new_status}
          </span>
        </div>
        {entry.comment && (
          <p className="mt-0.5 text-[11.5px] text-[#8A9080] leading-relaxed">
            {entry.comment}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1 text-[10.5px] text-[#8A9080]/70">
          <Clock className="h-2.5 w-2.5" />
          {formatDate(entry.created_at)}
          {entry.changed_by_email && (
            <span className="ml-1">• {entry.changed_by_email}</span>
          )}
        </div>
      </div>
    </motion.li>
  );
}

/**
 * OrderDetailModal
 *
 * Affiche le détail complet d'une commande dans une Dialog premium.
 * Gère l'annulation avec ConfirmDialog et affiche les notifications via Toast.
 */
export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  history,
  isLoadingOrder,
  isLoadingHistory,
  isCancelling,
  onCancelOrder,
  onLoadHistory,
}: OrderDetailModalProps) {
  /* ── État local ─────────────────────────────────────────────────────── */
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false, type: "info", message: "",
  });

  /* ── Gestionnaires ──────────────────────────────────────────────────── */
  const handleCancelClick = useCallback(() => {
    setShowCancelConfirm(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    await onCancelOrder();
    setShowCancelConfirm(false);
  }, [onCancelOrder]);

  // S'assurer que la modale de confirmation se ferme si la modale principale se ferme
  useEffect(() => {
    if (!isOpen) {
      setShowCancelConfirm(false);
    }
  }, [isOpen]);

  const handleToggleHistory = useCallback(() => {
    if (!showHistory && history.length === 0) {
      onLoadHistory();
    }
    setShowHistory((prev) => !prev);
  }, [showHistory, history.length, onLoadHistory]);

  const canCancel = order && CANCELLABLE_STATUSES.includes(order.status);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          style={{ padding: 0 }}
        >
          {/* ══ En-tête fixe ═══════════════════════════════════════════ */}
          <div className="shrink-0 border-b border-[#E8E3D8] bg-[#F7F5F0] px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogHeader className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-[15px] font-black tracking-tight text-[#1f241c]">
                    {isLoadingOrder ? "Chargement…" : order?.reference ?? "Commande"}
                  </DialogTitle>
                  {order && !isLoadingOrder && (
                    <OrderStatusBadge status={order.status} size="sm" animated />
                  )}
                </div>
                <DialogDescription>
                  {order?.created_at
                    ? `Passée le ${formatDate(order.created_at)}`
                    : "Détail de votre commande"}
                </DialogDescription>
              </DialogHeader>

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="ml-3 shrink-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#E8E3D8] bg-white text-[#8A9080] transition-colors hover:border-[#1f4d3f]/15 hover:bg-[#1f4d3f]/5 hover:text-[#1f4d3f]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ══ Corps scrollable ════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ── Chargement ── */}
            {isLoadingOrder && (
              <div className="flex justify-center py-10">
                <LoadingStyle label="Chargement de la commande…" size={10} />
              </div>
            )}

            {/* ── Contenu ── */}
            {!isLoadingOrder && order && (
              <>
                {/* Section articles */}
                <section aria-label="Articles de la commande">
                  <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A9080]">
                    <Package className="h-3.5 w-3.5" />
                    Articles ({order.items.length})
                  </h3>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-[#E8E3D8] bg-white p-3 hover:border-[#1f4d3f]/15 transition-colors"
                      >
                        {/* Icône placeholder produit */}
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-[#F7F5F0] border border-[#E8E3D8] text-[#1f4d3f]/40">
                          <Package className="h-5 w-5" strokeWidth={1.5} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-[#1f241c]">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-[#8A9080]">
                            SKU : {item.product_sku} · Qté : {item.quantity}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[13.5px] font-black text-[#1f4d3f]">
                            {formatAmount(item.subtotal)}
                          </p>
                          <p className="text-[10.5px] text-[#8A9080]">
                            {formatAmount(item.unit_price)} / unité
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Section livraison */}
                <section
                  aria-label="Informations de livraison"
                  className="rounded-xl border border-[#E8E3D8] bg-white p-4 space-y-2.5"
                >
                  <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A9080] mb-3">
                    <Truck className="h-3.5 w-3.5" />
                    Livraison
                  </h3>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {order.address_livraison && (
                      <div className="flex items-start gap-2 text-[12.5px] text-[#1f241c]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1f4d3f]" />
                        <span>{order.address_livraison.split('|')[0].trim()}</span>
                      </div>
                    )}
                    {(order.city || order.country) && (
                      <div className="flex items-center gap-2 text-[12.5px] text-[#1f241c]">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-[#1f4d3f]" />
                        <span>{[order.city, order.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {order.phone_livraison && (
                      <div className="flex items-center gap-2 text-[12.5px] text-[#1f241c]">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-[#1f4d3f]" />
                        <span>{order.phone_livraison}</span>
                      </div>
                    )}
                    {order.paid_at && (
                      <div className="flex items-center gap-2 text-[12.5px] text-[#1f241c]">
                        <CreditCard className="h-3.5 w-3.5 shrink-0 text-[#1f4d3f]" />
                        <span>Payé le {formatDate(order.paid_at)}</span>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="mt-2 rounded-lg bg-[#F7F5F0] border border-[#E8E3D8] px-3 py-2">
                      <p className="text-[11.5px] text-[#8A9080] leading-relaxed">
                        <span className="font-semibold text-[#1f241c]">Note : </span>
                        {order.notes}
                      </p>
                    </div>
                  )}
                </section>

                {/* Section récapitulatif financier */}
                <section
                  aria-label="Récapitulatif financier"
                  className="rounded-xl border border-[#E8E3D8] bg-white px-4 py-3"
                >
                  <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A9080] mb-2">
                    <Receipt className="h-3.5 w-3.5" />
                    Récapitulatif
                  </h3>
                  <PriceLine label="Sous-total articles" value={formatAmount(order.items_total)} icon={Package} />
                  <PriceLine label="Frais de livraison" value={formatAmount(order.frais_livraison)} icon={Truck} />
                  {parseFloat(order.discount_amount) > 0 && (
                    <PriceLine label="Remise appliquée" value={formatAmount(order.discount_amount)} icon={Tag} negative />
                  )}
                  {parseFloat(order.tax_amount) > 0 && (
                    <PriceLine label="Taxes" value={formatAmount(order.tax_amount)} icon={Calculator} />
                  )}
                  <PriceLine label="Total TTC" value={formatAmount(order.total_final)} icon={CreditCard} highlight />
                </section>

                {/* Section historique des statuts — accordéon */}
                <section aria-label="Historique de la commande">
                  <button
                    onClick={handleToggleHistory}
                    className="w-full flex items-center justify-between rounded-xl border border-[#E8E3D8] bg-white px-4 py-3 text-left transition-colors hover:border-[#1f4d3f]/15 hover:bg-[#1f4d3f]/5 cursor-pointer"
                    aria-expanded={showHistory}
                  >
                    <span className="flex items-center gap-2 text-[12.5px] font-semibold text-[#1f241c]">
                      <Clock className="h-3.5 w-3.5 text-[#1f4d3f]" />
                      Historique des statuts
                      {history.length > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1f4d3f]/10 px-1.5 text-[10px] font-bold text-[#1f4d3f]">
                          {history.length}
                        </span>
                      )}
                    </span>
                    {showHistory ? (
                      <ChevronUp className="h-4 w-4 text-[#8A9080]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#8A9080]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-xl border border-[#E8E3D8] bg-white px-4 py-3">
                          {isLoadingHistory ? (
                            <div className="flex justify-center py-4">
                              <LoadingStyle label="Chargement…" size={8} />
                            </div>
                          ) : history.length === 0 ? (
                            <p className="py-2 text-center text-[12px] text-[#8A9080]">
                              Aucun historique disponible.
                            </p>
                          ) : (
                            <ul className="space-y-0">
                              {history.map((entry, idx) => (
                                <HistoryEntry key={entry.id} entry={entry} index={idx} />
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </>
            )}
          </div>

          {/* ══ Footer fixe avec bouton d'annulation ════════════════════ */}
          {!isLoadingOrder && order && canCancel && (
            <div className="shrink-0 border-t border-[#E8E3D8] bg-[#F7F5F0] px-6 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[11.5px] text-[#8A9080] flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  Cette action est irréversible après confirmation.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelClick}
                  disabled={isCancelling}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <X className="h-3.5 w-3.5" />
                  {isCancelling ? "Annulation…" : "Annuler la commande"}
                </motion.button>
              </div>
            </div>
          )}

          {/* ══ Footer — commande livrée : message de satisfaction ══════ */}
          {!isLoadingOrder && order?.status === "delivered" && (
            <div className="shrink-0 border-t border-[#E8E3D8] bg-emerald-50 px-6 py-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p className="text-[12px] font-semibold">
                  Commande livrée avec succès. Merci pour votre confiance !
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ConfirmDialog d'annulation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
        title="Annuler la commande ?"
        message={`Êtes-vous sûr de vouloir annuler la commande ${order?.reference} ? Cette action est définitive et irréversible.`}
        confirmText="Oui, annuler"
        cancelText="Conserver"
        type="danger"
        isLoading={isCancelling}
      />

      {/* Toast de notification */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
        position="top-center"
      />
    </>
  );
}
