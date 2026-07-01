/**
 * WalletBalanceCard.tsx
 * -----------------------------------------------------------------------------
 * Carte principale du solde du wallet — pièce maîtresse de l'interface.
 *
 * Design ultra-premium inspiré des meilleures fintech mondiales (Revolut, N26).
 * Présente le solde avec une typographie imposante, un arrière-plan gradient
 * animé et des actions d'accès rapide (recharger, historique).
 *
 * @module app/customer/wallet/components/WalletBalanceCard
 */

"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  RefreshCw,
  Shield,
  Plus,
  ArrowDownLeft,
} from "lucide-react";
import type { Wallet as WalletModel } from "@/modeles/wallets-paiements";
import { WALLET_STATUS_LABELS } from "@/modeles/wallets-paiements";

/* -- Utilitaires ---------------------------------------------------------- */

/**
 * Formate un montant numérique en devise FCFA avec séparateurs de milliers.
 */
function formatBalance(amount: string): string {
  const num = parseFloat(amount || "0");
  if (isNaN(num)) return "0 FCFA";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Retourne la configuration visuelle (couleur, texte) selon le statut du wallet.
 */
function getStatusConfig(status: WalletModel["status"]) {
  switch (status) {
    case "active":
      return {
        dot: "#10b981",
        text: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
        label: "Actif & sécurisé",
      };
    case "suspendu":
      return {
        dot: "#f59e0b",
        text: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
        label: "Compte suspendu",
      };
    case "blocked":
      return {
        dot: "#ef4444",
        text: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
        label: "Compte bloqué",
      };
  }
}

/* -- Props ---------------------------------------------------------------- */
interface WalletBalanceCardProps {
  wallet: WalletModel;
  isRefreshing: boolean;
  onDeposit: () => void;
  onRefund: () => void;
  onRefresh: () => void;
}

/**
 * WalletBalanceCard
 *
 * Carte hero du solde du wallet avec design glassmorphisme premium,
 * gradient animé, statut temps réel et accès aux actions principales.
 */
export default function WalletBalanceCard({
  wallet,
  isRefreshing,
  onDeposit,
  onRefund,
  onRefresh,
}: WalletBalanceCardProps) {
  const statusConfig = getStatusConfig(wallet.status);
  const isActive = wallet.status === "active";
  const [integerPart, decimalPart] = formatBalance(wallet.balance).split(",");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          "linear-gradient(135deg, #0d2818 0%, #1a3d2b 35%, #0f3320 65%, #071810 100%)",
        boxShadow:
          "0 32px 80px -16px rgba(31,77,63,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* -- Particules de fond animées -- */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, #4ade80 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full opacity-8"
        style={{
          background:
            "radial-gradient(circle, #34d399 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      {/* Grain texture subtil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* -- En-tête : identité + statut -- */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo wallet */}
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Wallet className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Mon Portefeuille
              </p>
              <p className="text-[16px] font-bold text-white/80">
                Atelier du Terroir
              </p>
            </div>
          </div>

          {/* Badge statut + Bouton refresh */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${statusConfig.bg} ${statusConfig.border}`}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: statusConfig.dot }}
              />
              <span className={`text-[11px] font-semibold ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              title="Actualiser le solde"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={
                  isRefreshing
                    ? { duration: 0.8, repeat: Infinity, ease: "linear" }
                    : {}
                }
              >
                <RefreshCw className="h-3.5 w-3.5 text-white/50" />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* -- Affichage du solde principal -- */}
        <div className="mb-8">
          <p className="mb-2 text-[14px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Solde disponible
          </p>
          <div className="flex items-end gap-3">
            <motion.p
              key={wallet.balance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-black leading-none tracking-tight text-white"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                textShadow: "0 0 40px rgba(74,222,128,0.2)",
              }}
            >
              {integerPart}
            </motion.p>
            <span className="mb-2 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white/50">FCFA</span>
          </div>

          {/* Indicateur de sécurité */}
          <div className="mt-3 flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-emerald-400/70" strokeWidth={2} />
            <p className="text-[14px] text-white/35">
              Solde protégé et sécurisé
            </p>
          </div>
        </div>

        {/* -- Boutons d'action -- */}
        <div className="flex gap-3">
          {/* Recharger */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDeposit}
            disabled={!isActive}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[16px] font-bold tracking-tight transition-opacity disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow:
                "0 8px 24px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              color: "#fff",
            }}
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
            Recharger
          </motion.button>

          {/* Demander un remboursement */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRefund}
            disabled={!isActive}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[16px] font-bold tracking-tight transition-opacity disabled:opacity-40"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <ArrowDownLeft className="h-6 w-6" strokeWidth={2} />
            Remboursement
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
