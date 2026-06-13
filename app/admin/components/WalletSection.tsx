/**
 * WalletSection — Gestion du portefeuille numérique admin
 * @module app/admin/components/WalletSection
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw, Search,
  Download, Plus, CheckCircle2, XCircle, Clock, Loader2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/axios";
import { useEffect } from "react";

interface Transaction {
  id: string; client: string; type: string; amount: number; status: string; date: string; method: string;
}

const MOCK_TRANSACTIONS = [
  { id: "TX-1001", client: "Alice Dupont", type: "DEPOSIT", amount: 50.00, status: "COMPLETED", date: "2026-04-27 10:30", method: "Stripe" },
  { id: "TX-1002", client: "Charlie Martin", type: "PURCHASE", amount: -24.90, status: "COMPLETED", date: "2026-04-26 14:15", method: "Wallet" },
  { id: "TX-1003", client: "Diana Prince", type: "REFUND", amount: 15.00, status: "PENDING", date: "2026-04-26 09:00", method: "System" },
  { id: "TX-1004", client: "Eve Polastri", type: "DEPOSIT", amount: 100.00, status: "FAILED", date: "2026-04-25 18:45", method: "PayPal" },
];

export default function WalletSection() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { data } = await api.get("/admin/wallet/transactions/");
        if (data && (data.results || Array.isArray(data))) {
          setTransactions(data.results || data);
        }
      } catch (error) {
        console.warn("API /admin/wallet/transactions/ non disponible. Utilisation mock.");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) =>
    t.client.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet & Transactions</h1>
          <p className="text-sm text-white/40">Suivez les flux financiers internes et les recharges.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
            <Download className="h-4 w-4" /> Exporter
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
            <Plus className="h-4 w-4" /> Créditer un compte
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400"><Wallet className="h-5 w-5" /></div>
            <p className="text-sm text-white/40">Solde Global en circulation</p>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(14590, "FCFA")}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400"><ArrowDownRight className="h-5 w-5" /></div>
            <p className="text-sm text-white/40">Recharges (30j)</p>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(4200, "FCFA")}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400"><RefreshCcw className="h-5 w-5" /></div>
            <p className="text-sm text-white/40">Remboursements (30j)</p>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(350, "FCFA")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher ID ou client..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/50" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {["Transaction", "Client", "Type", "Montant", "Statut", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement des transactions...
                  </td>
                </tr>
              ) : filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs font-mono text-white/50">{tx.id}</td>
                  <td className="px-4 py-3 text-sm text-white">{tx.client}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-white/70">
                      {tx.type === "DEPOSIT" && <ArrowDownRight className="h-3 w-3 text-emerald-400" />}
                      {tx.type === "PURCHASE" && <ArrowUpRight className="h-3 w-3 text-blue-400" />}
                      {tx.type === "REFUND" && <RefreshCcw className="h-3 w-3 text-orange-400" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className={cn("px-4 py-3 text-sm font-bold", tx.amount > 0 ? "text-emerald-400" : "text-white")}>
                    {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount, "FCFA")}
                  </td>
                  <td className="px-4 py-3">
                    {tx.status === "COMPLETED" && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Terminé</span>}
                    {tx.status === "PENDING" && <span className="flex items-center gap-1 text-xs text-amber-400"><Clock className="h-3 w-3" /> En attente</span>}
                    {tx.status === "FAILED" && <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3 w-3" /> Échoué</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
