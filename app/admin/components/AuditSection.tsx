/**
 * AuditSection — Journal de sécurité et traçabilité
 * @module app/admin/components/AuditSection
 */

"use client";

import { useState } from "react";
import { Shield, Search, Filter, AlertTriangle, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_LOGS = [
  { id: "LOG-001", user: "Admin principal", action: "WALLET_ADJUST", resource: "User (Eve P.)", desc: "Crédit manuel suite réclamation", ip: "192.168.1.42", date: "2026-04-27 15:30" },
  { id: "LOG-002", user: "Gestionnaire", action: "UPDATE", resource: "Product (Safran)", desc: "Modification du prix (12.50 -> 13.00)", ip: "10.0.0.5", date: "2026-04-27 14:15" },
  { id: "LOG-003", user: "Support", action: "USER_UNBLOCK", resource: "User (Charlie M.)", desc: "Déblocage après vérif identité", ip: "192.168.1.100", date: "2026-04-26 09:00" },
  { id: "LOG-004", user: "Admin principal", action: "LOGIN", resource: "System", desc: "Connexion réussie", ip: "192.168.1.42", date: "2026-04-26 08:30" },
  { id: "LOG-005", user: "Système", action: "STATUS_CHANGE", resource: "Order (ORD-789)", desc: "Passage auto en FAILED (Paiement refusé)", ip: "127.0.0.1", date: "2026-04-25 23:59" },
];

const ACTION_COLOR: Record<string, string> = {
  WALLET_ADJUST: "text-orange-400 bg-orange-500/10",
  UPDATE: "text-blue-400 bg-blue-500/10",
  USER_UNBLOCK: "text-emerald-400 bg-emerald-500/10",
  LOGIN: "text-slate-300 bg-slate-300/10",
  STATUS_CHANGE: "text-purple-400 bg-purple-500/10",
};

export default function AuditSection() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_LOGS.filter(l => 
    l.user.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="h-6 w-6 text-orange-400" /> Audit Logs</h1>
          <p className="text-sm text-white/40">Journal de sécurité — Traçabilité des actions sensibles.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher utilisateur, action, ressource..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/50" />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/60 hover:bg-white/10">
          <Filter className="h-4 w-4" /> Types
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {["Date", "Utilisateur", "Action", "Ressource", "Détails", "IP", "Voir"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white/50 whitespace-nowrap"><Clock className="inline h-3 w-3 mr-1" />{log.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded px-2 py-1 text-[10px] font-bold", ACTION_COLOR[log.action] || "text-white/50 bg-white/5")}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/70">{log.resource}</td>
                  <td className="px-4 py-3 text-xs text-white/50 max-w-[200px] truncate">{log.desc}</td>
                  <td className="px-4 py-3 text-xs font-mono text-white/30">{log.ip}</td>
                  <td className="px-4 py-3">
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 hover:bg-white/5 hover:text-white"><Eye className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
