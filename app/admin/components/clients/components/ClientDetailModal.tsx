
// components/admin/clients/ClientDetailModal.tsx
"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Shield, ShieldCheck, ShieldBan, CheckCircle2, XCircle, User as UserIcon, Calendar, Crown } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { User } from "@/modeles/user";
import { mediaUrl } from "@/lib/mediaUrl";

interface ClientDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  platform_admin: { label: "Administrateur", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Crown },
  customer: { label: "Client", color: "text-primary bg-primary/10 border-primary/20", icon: UserIcon },
};

export function ClientDetailModal({ open, onClose, user }: ClientDetailModalProps) {
  if (!open || !user) return null;

  const role = ROLE_LABELS[user.role] || ROLE_LABELS.customer;
  const RoleIcon = role.icon;

  const resolvedImage = mediaUrl(user.profile_image);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-lg mx-4 rounded-3xl border border-border/50 bg-white shadow-2xl overflow-hidden"
          >
            {/* Top gradient accent */}
            {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-amber-500" /> */}

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 cursor-pointer top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white-alt/80 text-muted-foreground transition-colors hover:bg-white-alt hover:text-foreground backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with avatar */}
            <div className="relative px-8 pt-10 pb-6 flex flex-col items-center text-center">
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Avatar */}
              <div className="relative mb-5">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-surface shadow-xl">
                  {resolvedImage ? (
                    <Image src={resolvedImage} alt={user.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-3xl font-black">
                      {(user.name || user.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Status indicator */}
                <div className={cn(
                  "absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-surface shadow-sm",
                  user.is_active ? "bg-emerald-500" : "bg-red-500"
                )} />
              </div>

              <h2 className="text-xl font-black text-foreground tracking-tight">{user.name || "Sans nom"}</h2>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>

              {/* Role badge */}
              <div className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border", role.color)}>
                <RoleIcon className="h-3.5 w-3.5" />
                {role.label}
              </div>
            </div>

            {/* Info grid */}
            <div className="px-8 pb-8 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div className="rounded-2xl border border-border/50 bg-white-alt/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Téléphone</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{user.phone_number || "Non renseigné"}</p>
                </div>

                {/* ID */}
                <div className="rounded-2xl border border-border/50 bg-white-alt/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ajouter le </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground font-mono"> {formatDate(user.created_at, "fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", })}</p>
                </div>

                {/* Statut Actif */}
                <div className="rounded-2xl border border-border/50 bg-white-alt/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {user.is_active
                      ? <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      : <ShieldBan className="h-4 w-4 text-red-500" />
                    }
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statut du compte</span>
                  </div>
                  <p className={cn("text-sm font-bold", user.is_active ? "text-emerald-600" : "text-red-600")}>
                    {user.is_active ? "Actif" : "Désactivé"}
                  </p>
                </div>

                {/* Vérification email */}
                <div className="rounded-2xl border border-border/50 bg-white-alt/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {user.is_verified
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <XCircle className="h-4 w-4 text-amber-500" />
                    }
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email vérifié</span>
                  </div>
                  <p className={cn("text-sm font-bold", user.is_verified ? "text-emerald-600" : "text-amber-600")}>
                    {user.is_verified ? "Vérifié" : "Non vérifié"}
                  </p>
                </div>
              </div>

              {/* Footer action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl cursor-pointer bg-white-alt border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white-alt/80"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
