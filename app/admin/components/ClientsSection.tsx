"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, Loader2, Mail, Search, ShieldBan, ShieldCheck, TrendingUp, Trophy, Users, Wallet } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { apiPublic, apiPrivate } from "@/lib/axios";

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  points: number;
  wallet: number;
  is_active: boolean;
  is_guest: boolean;
  joined: string;
}

const TIER_BADGE: Record<string, { label: string; className: string }> = {
  BRONZE: { label: "Bronze", className: "bg-orange-500/10 text-orange-400" },
  SILVER: { label: "Argent", className: "bg-slate-300/10 text-slate-300" },
  GOLD: { label: "Or", className: "bg-yellow-500/10 text-yellow-400" },
  PLATINUM: { label: "Platine", className: "bg-indigo-400/10 text-indigo-400" },
};

export default function ClientsSection() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data } = await apiPrivate.get("/admin/users/");
        if (data && (data.results || Array.isArray(data))) {
          setClients(data.results || data);
        } else {
          setClients([]);
        }
      } catch (error) {
        console.warn("L'API /admin/users/ n'est pas disponible.", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchClients();
  }, []);

  const filtered = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((client) => client.is_active).length,
      platinum: clients.filter((client) => client.tier === "PLATINUM").length,
      wallet: clients.reduce((sum, client) => sum + Number(client.wallet || 0), 0),
    }),
    [clients]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-white/40">Comptes clients charges depuis le backend admin</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
          />
        </div>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/60">
          <Filter className="h-4 w-4" /> {filtered.length} resultat(s)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total clients", value: String(stats.total), icon: Users, color: "text-blue-400" },
          { label: "Actifs", value: String(stats.active), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Membres platine", value: String(stats.platinum), icon: Trophy, color: "text-indigo-400" },
          { label: "Wallet total", value: formatCurrency(stats.wallet, "FCFA"), icon: Wallet, color: "text-orange-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
            <p className="mt-2 text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[11px] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Client", "Contact", "Fidelite", "Wallet", "Statut", "Inscrit le", "Actions"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                    Chargement des clients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                    Aucun client backend disponible.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 font-bold text-white/50">
                          {(client.name || "?").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-sm font-medium text-white">
                            {client.name}
                            {client.is_guest ? (
                              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/50">INVITE</span>
                            ) : null}
                          </p>
                          <p className="text-[10px] text-white/30">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{client.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", TIER_BADGE[client.tier]?.className || "bg-white/10 text-white/60")}>
                          {TIER_BADGE[client.tier]?.label || client.tier || "Standard"}
                        </span>
                        <p className="mt-1 text-[10px] text-white/40">{client.points} pts</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{formatCurrency(client.wallet, "FCFA")}</td>
                    <td className="px-4 py-3">
                      {client.is_active ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400"><ShieldCheck className="h-3 w-3" /> Actif</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-red-400"><ShieldBan className="h-3 w-3" /> Inactif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{client.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 hover:bg-white/5 hover:text-white">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 hover:bg-white/5 hover:text-orange-400">
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
