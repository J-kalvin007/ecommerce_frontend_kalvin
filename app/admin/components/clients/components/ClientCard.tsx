
// // components/admin/clients/ClientCard.tsx
// "use client";
// import Image from "next/image";
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Eye, ShieldBan, ShieldCheck, Mail, Phone, Crown, User as UserIcon, CheckCircle2, XCircle } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { User } from "@/modeles/user";

// const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
//   platform_admin: { label: "Admin", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", icon: Crown },
//   customer: { label: "Client", color: "text-primary bg-primary/10 border-primary/20", icon: UserIcon },
// };

// interface ClientCardProps {
//   user: User;
//   onViewDetail: () => void;
//   onToggleActive: () => void;
// }

// export function ClientCard({ user, onViewDetail, onToggleActive }: ClientCardProps) {
//   const [imgError, setImgError] = useState(false);
//   const role = ROLE_LABELS[user.role] || ROLE_LABELS.customer;
//   const RoleIcon = role.icon;

//   const resolvedImage = user.profile_image
//     ? (user.profile_image.startsWith("http")
//       ? user.profile_image
//       : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${user.profile_image.startsWith("/") ? "" : "/"}${user.profile_image}`)
//     : null;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
//       onClick={onViewDetail}
//       className="group relative flex flex-col rounded-[24px] border border-border/40 bg-surface shadow-sm hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden cursor-pointer p-5"
//     >
//       {/* Top row: Avatar + Actions */}
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3 min-w-0">
//           {/* Avatar */}
//           <div className="relative shrink-0">
//             <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-border/50 shadow-sm">
//               {resolvedImage && !imgError ? (
//                 <Image
//                   src={resolvedImage}
//                   alt={user.name}
//                   fill
//                   className="object-cover"
//                   onError={() => setImgError(true)}
//                 />
//               ) : (
//                 <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-lg font-black">
//                   {(user.name || user.email || "?").charAt(0).toUpperCase()}
//                 </div>
//               )}
//             </div>
//             <div className={cn(
//               "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface",
//               user.is_active ? "bg-emerald-500" : "bg-red-500"
//             )} />
//           </div>

//           {/* Name + email */}
//           <div className="min-w-0">
//             <h3 className="text-sm font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors duration-200">
//               {user.name || "Sans nom"}
//             </h3>
//             <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//           <button
//             onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
//             title="Voir le détail"
//             className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
//           >
//             <Eye className="h-4 w-4" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
//             title={user.is_active ? "Désactiver le compte" : "Activer le compte"}
//             className={cn(
//               "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:shadow-md",
//               user.is_active ? "hover:bg-red-500 hover:text-white" : "hover:bg-emerald-500 hover:text-white"
//             )}
//           >
//             {user.is_active ? <ShieldBan className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
//           </button>
//         </div>
//       </div>

//       {/* Info badges */}
//       <div className="flex flex-wrap items-center gap-2 mb-3">
//         <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border", role.color)}>
//           <RoleIcon className="h-3 w-3" />
//           {role.label}
//         </span>
//         {user.is_verified ? (
//           <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
//             <CheckCircle2 className="h-3 w-3" /> Vérifié
//           </span>
//         ) : (
//           <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600 border border-amber-500/20">
//             <XCircle className="h-3 w-3" /> Non vérifié
//           </span>
//         )}
//       </div>

//       {/* Footer: Phone + Status */}
//       <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
//         <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
//           <Phone className="h-3 w-3" />
//           <span className="truncate max-w-[120px]">{user.phone_number || "Non renseigné"}</span>
//         </div>
//         <div className={cn(
//           "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border",
//           user.is_active
//             ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
//             : "text-red-600 bg-red-500/10 border-red-500/20"
//         )}>
//           <div className={cn("h-1.5 w-1.5 rounded-full", user.is_active ? "bg-emerald-500" : "bg-red-500")} />
//           {user.is_active ? "Actif" : "Inactif"}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

































// components/admin/clients/ClientCard.tsx
"use client";
import Image from "next/image";
import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ShieldBan,
  ShieldCheck,
  Phone,
  Crown,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/modeles/user";

// ─── Role config ─────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  platform_admin: { label: "Admin", icon: Crown },
  customer: { label: "Client", icon: UserIcon },
};

// ─── Animated status ring (SVG arc) ─────────────────────────────────────────
function StatusRing({
  active,
  size = 64,
  stroke = 2.5,
  hovered,
}: {
  active: boolean;
  size: number;
  stroke: number;
  hovered: boolean;
}) {
  const uid = useId();
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color = active ? "#10b981" : "#f43f5e";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: "rotate(-90deg)" }}
    >
      <defs>
        <linearGradient id={`ring-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.1}
        strokeWidth={stroke}
      />
      {/* Arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#ring-${uid})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        initial={{ strokeDasharray: `${circ * 0.25} ${circ * 0.75}` }}
        animate={{
          strokeDasharray: hovered
            ? `${circ * 0.92} ${circ * 0.08}`
            : `${circ * 0.25} ${circ * 0.75}`,
        }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ClientCardProps {
  user: User;
  onViewDetail: () => void;
  onToggleActive: () => void;
}

// ═════════════════════════════════════════════════════════════════════════════
// ClientCard
// ═════════════════════════════════════════════════════════════════════════════
export function ClientCard({ user, onViewDetail, onToggleActive }: ClientCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer;
  const RoleIcon = role.icon;

  const isAdmin = user.role === "platform_admin";
  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const resolvedImage = user.profile_image
    ? user.profile_image.startsWith("http")
      ? user.profile_image
      : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${
          user.profile_image.startsWith("/") ? "" : "/"
        }${user.profile_image}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onViewDetail}
      className="group relative flex flex-col rounded-[22px] border border-border/40 bg-surface overflow-hidden cursor-pointer select-none"
      style={{
        boxShadow: hovered
          ? "0 20px 48px -12px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.04)"
          : "0 2px 12px -4px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-6px)" : "translateY(0px)",
        transition: "box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* ── Top accent bar (thin, primary color, slides in on hover) ── */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/80 to-transparent pointer-events-none z-10"
      />

      {/* ── Header section ── */}
      <div className="relative flex flex-col items-center pt-7 pb-4 px-5">
        {/* Subtle radial bg behind avatar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-28 w-28 rounded-full bg-primary/[0.04] blur-2xl pointer-events-none" />

        {/* Avatar + status ring */}
        <div className="relative mb-3" style={{ width: 64, height: 64 }}>
          <StatusRing active={user.is_active} size={64} stroke={2.5} hovered={hovered} />

          {/* Avatar circle (inset 4px from ring) */}
          <div className="absolute inset-[5px] rounded-full overflow-hidden border border-border/20 shadow-sm">
            {resolvedImage && !imgError ? (
              <Image
                src={resolvedImage}
                alt={user.name || "Avatar"}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
                sizes="54px"
              />
            ) : (
              <div
                className={cn(
                  "h-full w-full flex items-center justify-center text-sm font-black",
                  isAdmin
                    ? "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600"
                    : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                )}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Status dot */}
          <motion.div
            animate={{ scale: hovered ? 1.2 : 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface shadow-sm z-10",
              user.is_active ? "bg-emerald-500" : "bg-rose-500"
            )}
          />
        </div>

        {/* Name */}
        <h3
          className={cn(
            "text-sm font-black text-foreground text-center leading-tight transition-colors duration-200 truncate max-w-full",
            hovered && "text-primary"
          )}
        >
          {user.name || "Sans nom"}
        </h3>

        {/* Email */}
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/70 truncate max-w-full">
          <Mail className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{user.email}</span>
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-border/40" />

      {/* ── Info section ── */}
      <div className="flex flex-col gap-2.5 px-5 py-4">
        {/* Role + Verification badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold border",
              isAdmin
                ? "bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20"
                : "bg-primary/[0.07] text-primary border-primary/15"
            )}
          >
            <RoleIcon className="h-3 w-3" />
            {role.label}
          </span>

          {/* Verified */}
          {user.is_verified ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              Vérifié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20">
              <XCircle className="h-3 w-3" />
              Non vérifié
            </span>
          )}
        </div>

        {/* Phone row */}
        <div className="flex items-center gap-2 rounded-lg bg-surface-alt/60 border border-border/30 px-3 py-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface border border-border/40">
            <Phone className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-[11px] text-foreground/70 font-medium truncate">
            {user.phone_number || (
              <span className="italic text-muted-foreground/50">Non renseigné</span>
            )}
          </span>
        </div>
      </div>

      {/* ── Footer: status + actions ── */}
      <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-0 mt-auto">
        {/* Active status pill */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border",
            user.is_active
              ? "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20"
              : "bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-500/10 dark:border-rose-500/20"
          )}
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              user.is_active ? "bg-emerald-500" : "bg-rose-500"
            )}
          />
          {user.is_active ? "Actif" : "Inactif"}
        </div>

        {/* Action buttons — revealed on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-1"
            >
              {/* View detail */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
                title="Voir le détail"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15 hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" />
              </motion.button>

              {/* Toggle active */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
                title={user.is_active ? "Désactiver" : "Activer"}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200",
                  user.is_active
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/15 hover:bg-rose-500 hover:text-white"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/15 hover:bg-emerald-500 hover:text-white"
                )}
              >
                {user.is_active
                  ? <ShieldBan className="h-3.5 w-3.5" />
                  : <ShieldCheck className="h-3.5 w-3.5" />
                }
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}