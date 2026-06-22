/**
 * WalletCard — Carte de paiement via Wallet
 *
 * - Affiche le solde du wallet
 * - Détecte si le solde est suffisant ou non
 * - Affiche un bouton de rechargement si insuffisant
 *
 * @module components/commandes/WalletCard
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, AlertCircle, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useThemeStore } from "@/store/theme.store";
import { Wallet } from "@/modeles/wallets-paiements";

interface WalletCardProps {
  wallet: Wallet | null;
  totalAPayer: number;
  onOpenRecharge: () => void;
}

export default function WalletCard({ wallet, totalAPayer, onOpenRecharge }: WalletCardProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  if (!wallet) return null;

  const solde = parseFloat(wallet.balance);
  const soldeSuffisant = solde >= totalAPayer;

  const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f4d3f]/10">
            <WalletIcon className="h-6 w-6 text-[#1f4d3f]" />
          </div>
          <div>
            <h4 className="font-bold" style={{ color: text }}>
              Mon Portefeuille
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-black text-[#1f4d3f] tracking-tight">
                {formatCurrency(String(solde), "FCFA")}
              </span>
            </div>
          </div>
        </div>

        {!soldeSuffisant && (
          <button
            onClick={onOpenRecharge}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#1f4d3f]/10 px-4 py-2 text-sm font-bold text-[#1f4d3f] transition-all hover:bg-[#1f4d3f]/20"
          >
            <PlusCircle className="h-4 w-4" /> Recharger
          </button>
        )}
      </div>

      {!soldeSuffisant ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-red-600 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">
            Votre solde est insuffisant pour régler cette commande. Il vous manque{" "}
            <strong>{formatCurrency(String(totalAPayer - solde), "FCFA")}</strong>.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-sm font-medium">Solde suffisant pour le paiement</p>
        </div>
      )}
    </motion.div>
  );
}
