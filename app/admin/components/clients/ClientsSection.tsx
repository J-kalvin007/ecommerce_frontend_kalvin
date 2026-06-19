
// app/admin/components/clients/ClientsSection.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Users, ShieldCheck, ShieldBan, Crown, Eye, Phone, Mail,
  LayoutGrid, List, ChevronDown, CheckCircle2, XCircle, User as UserIcon,
  SlidersHorizontal, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllUsers, toggleUserActive } from "@/fonctions_api/auth.api";
import type { User } from "@/modeles/user";
import { ClientCard } from "./components/ClientCard";
import { ClientDetailModal } from "./components/ClientDetailModal";
import Toast from "@/components/special/Toast";
import LoadingStyle from "@/components/special/loadingStyle";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import ErrorState from "@/components/special/ErrorState";
import EmptyState from "@/components/special/EmptyState";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_FILTERS = [
  { value: "", label: "Tous les rôles" },
  { value: "customer", label: "Clients" },
  { value: "platform_admin", label: "Administrateurs" },
];

const STATUS_FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Désactivés" },
];

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  platform_admin: { label: "Admin", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", icon: Crown },
  customer: { label: "Client", color: "text-primary bg-primary/10 border-primary/20", icon: UserIcon },
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, color, sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm p-4 shadow-sm transition-all hover:shadow-md group"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "20px 20px" }}
      />
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none transition-opacity group-hover:opacity-20", color.replace("text-", "bg-"))} />

      <div className="relative z-10">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl mb-3", color.replace("text-", "bg-").replace(/\d00/, "100"), color)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── ClientsSection ───────────────────────────────────────────────────────────

export default function ClientsSection() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({ show: false, type: "success", message: "" });

  // ─── Load Data ────────────────────────────────────────────────────────────

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getAllUsers();
    if (result.ok) {
      setUsers(result.data);
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ─── Filters ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => u.name?.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.phone_number?.toLowerCase().includes(s));
    }
    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }
    if (statusFilter === "active") {
      list = list.filter(u => u.is_active);
    } else if (statusFilter === "inactive") {
      list = list.filter(u => !u.is_active);
    }
    return list;
  }, [users, search, roleFilter, statusFilter]);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === "platform_admin").length,
    verified: users.filter(u => u.is_verified).length,
  }), [users]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    const result = await toggleUserActive(toggleTarget.id, !toggleTarget.is_active);
    if (result.ok) {
      setToast({ show: true, type: "success", message: `Compte ${result.data.is_active ? "activé" : "désactivé"} avec succès` });
      await loadUsers();
    } else {
      setToast({ show: true, type: "error", message: result.error.message });
    }
    setToggling(false);
    setToggleTarget(null);
  };

  const activeFiltersCount = [roleFilter, statusFilter].filter(Boolean).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Gestion des clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez et supervisez les utilisateurs de la plateforme</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Total utilisateurs" value={stats.total} color="text-blue-500" />
        <StatCard icon={ShieldCheck} label="Comptes actifs" value={stats.active} color="text-emerald-500" sub={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% du total`} />
        <StatCard icon={Crown} label="Administrateurs" value={stats.admins} color="text-amber-500" />
        <StatCard icon={CheckCircle2} label="Emails vérifiés" value={stats.verified} color="text-primary" sub={`${stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% du total`} />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="h-11 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white-alt text-muted-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
            showFilters || activeFiltersCount > 0
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-border bg-white text-muted-foreground hover:bg-white-alt"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFiltersCount}</span>
          )}
        </button>

        <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="font-semibold text-primary">{filtered.length}</span> résultat{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 rounded-2xl border border-border/50 bg-white-alt/30 p-4">
              <div className="flex-1 min-w-[180px]">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rôle</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {ROLE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-xl border border-border bg-white px-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-end">
                  <button onClick={() => { setRoleFilter(""); setStatusFilter(""); }} className="h-10 flex items-center gap-2 rounded-xl border border-border bg-white px-4 text-xs font-semibold text-muted-foreground hover:bg-white-alt transition-colors">
                    <X className="h-3.5 w-3.5 cursor-pointer" /> Réinitialiser
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={cn("flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all", viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-white-alt")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all", viewMode === "list" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-white-alt")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingStyle label="Chargement des utilisateurs..." size={12} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur trouvé"
          description={search || activeFiltersCount > 0 ? "Essayez de modifier vos critères de recherche ou vos filtres." : "Il n'y a encore aucun utilisateur inscrit sur la plateforme."}
        />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((user) => (
              <ClientCard
                key={user.id}
                user={user}
                onViewDetail={() => handleViewDetail(user)}
                onToggleActive={() => setToggleTarget(user)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-white-alt/30">
                  {["Utilisateur", "Contact", "Rôle", "Vérification", "Statut", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const role = ROLE_LABELS[user.role] || ROLE_LABELS.customer;
                  const RoleIcon = role.icon;
                  const resolvedImage = user.profile_image
                    ? (user.profile_image.startsWith("http")
                      ? user.profile_image
                      : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${user.profile_image.startsWith("/") ? "" : "/"}${user.profile_image}`)
                    : null;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleViewDetail(user)}
                      className="border-b border-border/30 transition-colors hover:bg-white-alt/40 cursor-pointer group"
                    >
                      {/* Utilisateur */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-border/50 shadow-sm">
                              {resolvedImage ? (
                                <Image src={resolvedImage} alt={user.name} fill className="object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-black">
                                  {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface", user.is_active ? "bg-emerald-500" : "bg-red-500")} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{user.name || "Sans nom"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone_number || "—"}
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border", role.color)}>
                          <RoleIcon className="h-3 w-3" />
                          {role.label}
                        </span>
                      </td>

                      {/* Vérification */}
                      <td className="px-5 py-4">
                        {user.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Vérifié</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600"><XCircle className="h-3.5 w-3.5" /> Non vérifié</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border",
                          user.is_active ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-red-600 bg-red-500/10 border-red-500/20"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", user.is_active ? "bg-emerald-500" : "bg-red-500")} />
                          {user.is_active ? "Actif" : "Désactivé"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetail(user); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Voir le détail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setToggleTarget(user); }}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors",
                              user.is_active ? "hover:bg-red-500/10 hover:text-red-500" : "hover:bg-emerald-500/10 hover:text-emerald-500"
                            )}
                            title={user.is_active ? "Désactiver" : "Activer"}
                          >
                            {user.is_active ? <ShieldBan className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      <ClientDetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedUser(null); }}
        user={selectedUser}
      />

      {/* Toggle Active/Inactive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onCancel={() => setToggleTarget(null)}
        onConfirm={handleToggleActive}
        isLoading={toggling}
        type={toggleTarget?.is_active ? "danger" : "success"}
        title={toggleTarget?.is_active ? "Désactiver ce compte ?" : "Réactiver ce compte ?"}
        message={
          toggleTarget?.is_active
            ? `Le compte de ${toggleTarget?.name || toggleTarget?.email} sera désactivé. L'utilisateur ne pourra plus se connecter à la plateforme.`
            : `Le compte de ${toggleTarget?.name || toggleTarget?.email} sera réactivé. L'utilisateur pourra de nouveau accéder à la plateforme.`
        }
        confirmText={toggleTarget?.is_active ? "Désactiver le compte" : "Réactiver le compte"}
        cancelText="Annuler"
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
