/**
 * CustomerShell.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interface shell complète pour l'espace client premium de l'Atelier du Terroir.
 *
 * Architecture :
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Topbar (sticky, glassmorphism, 72px)                       │
 *   ├──────────────────────┬──────────────────────────────────────┤
 *   │  Sidebar             │  Main content (children)             │
 *   │  (collapsible,       │                                      │
 *   │   268px → 78px)      │                                      │
 *   └──────────────────────┴──────────────────────────────────────┘
 *
 * Fonctionnalités :
 *   - Sidebar desktop collapsible avec animation spring
 *   - Drawer mobile avec overlay animated
 *   - Topbar avec logo, notifications, profil, thème
 *   - Lien "Retour à l'accueil" bien visible
 *   - Modale de déconnexion premium (LogoutDialog)
 *   - Avatar utilisateur dynamique
 *
 * @module app/customer/components/CustomerShell
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Star,
  Settings,
  ChevronLeft,
  X,
  LogOut,
  Bell,
  Home,
  User,
  ChevronDown,
  Sun,
  Moon,
  Crown,
  ArrowLeft,
  Menu,
  Gift,
  Heart,
  Truck,
  Notebook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { mediaUrl } from "@/lib/mediaUrl";
import LogoutDialog from "@/components/special/LogoutDialog";
import ProfileModal from "@/components/layout/ProfileModal";
import { getToken } from "@/lib/axios";

/* ──────────────────────────────────────────────────────────────────────────
   Constantes visuelles — palette Atelier du Terroir
────────────────────────────────────────────────────────────────────────── */

const LOGO_PATH = "/assets/images/LOGO.png";

/** Vert forêt profond — couleur principale de la sidebar client */
const SIDEBAR_BG = "linear-gradient(160deg, #0D2318 0%, #102A1E 45%, #0F2218 100%)";
const SIDEBAR_ACTIVE = "linear-gradient(135deg, #C9963A 0%, #E8B450 100%)";

/* ──────────────────────────────────────────────────────────────────────────
   Navigation client
────────────────────────────────────────────────────────────────────────── */

interface NavItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Mon Espace",
    sublabel: "Vue d'ensemble",
    icon: LayoutDashboard,
    href: "/customer/dashboard_client",
  },
  {
    id: "orders",
    label: "Mes Commandes",
    sublabel: "Suivi en temps réel",
    icon: ShoppingBag,
    href: "/customer/commandes",
    badge: 2,
  },
  {
    id: "deliveries",
    label: "Mes Livraisons",
    sublabel: "Suivi des expéditions",
    icon: Truck,
    href: "/customer/livraisons",
  },
  {
    id: "wallet",
    label: "Portefeuille",
    sublabel: "Solde & transactions",
    icon: Wallet,
    href: "/customer/wallet",
  },
  {
    id: "loyalty",
    label: "Fidélité",
    sublabel: "Points & avantages",
    icon: Crown,
    href: "/customer/fidelites",
  },
  // {
  //   id: "favorites",
  //   label: "Mes Favoris",
  //   sublabel: "Produits sauvegardés",
  //   icon: Heart,
  //   href: "/customer/favoris",
  // },
  {
    id: "notes",
    label: "Notes & Avis",
    sublabel: "Mes évaluations",
    icon: Star,
    href: "/customer/notes-favoris",
  },
  {
    id: "settings",
    label: "Paramètres",
    sublabel: "Mon compte",
    icon: Settings,
    href: "/customer/settings",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────────── */

interface CustomerShellProps {
  children: React.ReactNode;
  /** ID de la section active pour highlight sidebar */
  activeSection?: string;
}

/* ──────────────────────────────────────────────────────────────────────────
   Bouton de navigation sidebar
────────────────────────────────────────────────────────────────────────── */

function SidebarNavButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-[18px] font-medium transition-all duration-200",
        isActive
          ? "text-white"
          : "text-white/45 hover:text-white/80"
      )}
    >
      {/* Fond actif — dorée extravagante */}
      {isActive && (
        <motion.span
          layoutId="customer-active-pill"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-0 rounded-2xl"
          style={{
            background: SIDEBAR_ACTIVE,
            boxShadow: "0 4px 20px -6px rgba(201,150,58,0.55)",
          }}
        />
      )}

      {/* Icône */}
      <span
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          isActive
            ? "bg-white/15 text-white"
            : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/70"
        )}
      >
        <item.icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.2 : 1.8} />
      </span>

      {/* Label + sublabel */}
      {!collapsed && (
        <span className="relative z-10 flex min-w-0 flex-col items-start text-left">
          <span className="truncate text-[15px] font-bold leading-none tracking-wide">
            {item.label}
          </span>
          {item.sublabel && (
            <span className={cn(
              "mt-1 truncate text-[11px] font-medium leading-none tracking-wide",
              isActive ? "text-white/75" : "text-white/40"
            )}>
              {item.sublabel}
            </span>
          )}
        </span>
      )}

      {/* Badge notifications */}
      {!collapsed && item.badge && item.badge > 0 && (
        <span className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C9963A] px-1.5 text-[10px] font-bold text-white shadow-sm">
          {item.badge}
        </span>
      )}

      {/* Point indicateur collapsed */}
      {collapsed && item.badge && item.badge > 0 && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#C9963A] shadow-sm" />
      )}
    </motion.button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Composant CustomerShell
────────────────────────────────────────────────────────────────────────── */

export default function CustomerShell({ children, activeSection = "dashboard" }: CustomerShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const { user, logout, setUser } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* — Dériver le nom et les initiales de l'utilisateur — */
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Client";
  const initials = displayName.slice(0, 2).toUpperCase();

  /* — Thème — */
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const init = stored || (sysDark ? "dark" : "light");
    setTheme(init);
    document.documentElement.classList.toggle("dark", init === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  /* — Fermer le dropdown profil au clic extérieur — */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* — Gestionnaires de déconnexion — */
  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push("/auth/login");
  };

  /* — Avatar utilisateur — */
  const getAvatar = (size: "sm" | "md" = "md") => {
    const cls = size === "sm" ? "h-full w-full object-cover" : "h-full w-full object-cover";
    if (user?.profile_image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(user.profile_image) || ""} alt={displayName} className={cls} />
      );
    }
    return (
      <span className={cn("font-bold text-white", size === "sm" ? "text-[10px]" : "text-xs")}>
        {initials}
      </span>
    );
  };

  /* — Déterminer la section active depuis l'URL — */
  const currentSection = NAV_ITEMS.find((item) =>
    item.href === pathname || pathname.startsWith(item.href.split("?")[0])
  )?.id ?? activeSection;

  /* ─────────────────────────────────────────────────────────────────────────
     RENDU
  ───────────────────────────────────────────────────────────────────────── */

  return (
    <>
      <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0E0E0E]">

        {/* ════════════════════════════════════════════════════════════════
            TOPBAR
        ════════════════════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-40 border-b border-[#E8E3D8] bg-white/88 shadow-[0_1px_0_0_rgba(15,23,42,0.04),0_8px_28px_-18px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/8 dark:bg-[#0E0E0E]/88">
          <div className="flex h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* ── Gauche : hamburger + logo + retour accueil ── */}
            <div className="flex items-center gap-3">

              {/* Bouton menu mobile */}
              <motion.button
                onClick={() => setMobileOpen(true)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E5E0D6] bg-white text-[#5A6755] shadow-sm transition-colors hover:border-[#1f4d3f]/25 hover:text-[#1f4d3f] lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-[18px] w-[18px]" />
              </motion.button>

              {/* Logo */}
              <Link href="/customer/dashboard_client" className="group flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E5DCC8] bg-gradient-to-br from-[#1f4d3f] to-[#2d7a4f] p-[2px] shadow-[0_4px_14px_-4px_rgba(31,77,63,0.4)] transition-transform duration-300 group-hover:scale-105">
                  <div className="flex h-full w-full items-center justify-center rounded-[13px] bg-white">
                    <Image
                      src={LOGO_PATH}
                      alt="Atelier du Terroir"
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] object-contain"
                      priority
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="block text-[13.5px] font-bold leading-none tracking-tight text-[#1f241c] dark:text-white">
                    ATELIER DU TERROIR
                  </span>
                  <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1f4d3f]/70">
                    Espace Client
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Droite : thème + notifications + profil ── */}
            <div className="flex items-center gap-2">

              {/* Bouton retour accueil (icône seule) */}
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[#E5E0D6] bg-white text-[#5A6755] shadow-sm transition-colors hover:border-[#1f4d3f]/25 hover:text-[#1f4d3f] dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                  aria-label="Retour à l'accueil"
                >
                  <Home className="h-[17px] w-[17px]" />
                </motion.button>
              </Link>

              {/* Toggle thème */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[#E5E0D6] bg-white text-[#5A6755] shadow-sm transition-colors hover:border-[#1f4d3f]/25 hover:text-[#1f4d3f] dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                aria-label="Changer le thème"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center justify-center"
                  >
                    {theme === "light" ? (
                      <Moon className="h-[17px] w-[17px]" />
                    ) : (
                      <Sun className="h-[17px] w-[17px]" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {/* Cloche notifications */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E5E0D6] bg-white text-[#5A6755] shadow-sm transition-colors hover:border-[#1f4d3f]/25 hover:text-[#1f4d3f] dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                aria-label="Notifications"
              >
                <Bell className="h-[17px] w-[17px]" />
                {/* Indicateur pulse */}
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9963A] opacity-55" />
                  <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#C9963A] to-[#E8B450] text-[9px] font-bold text-white shadow-sm">
                    2
                  </span>
                </span>
              </motion.button>

              {/* Profil dropdown */}
              {mounted && (
                <div ref={dropdownRef} className="relative ml-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#E5E0D6] bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-colors hover:border-[#1f4d3f]/25 dark:border-white/10 dark:bg-white/5"
                  >
                    {/* Avatar */}
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1f4d3f] to-[#C9963A] ring-2 ring-white shadow-sm dark:ring-white/10">
                      {getAvatar("sm")}
                    </div>
                    {/* Nom */}
                    <div className="hidden flex-col items-start leading-tight sm:flex">
                      <span className="text-[13px] font-semibold text-[#1f241c] dark:text-white">
                        {displayName.split(" ")[0]}
                      </span>
                      <span className="text-[10px] font-medium text-[#1f4d3f]/70 dark:text-white/50">
                        Client
                      </span>
                    </div>
                    <motion.span animate={{ rotate: isProfileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-3.5 w-3.5 text-[#8A9080]" />
                    </motion.span>
                  </motion.button>

                  {/* Dropdown profil */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute right-0 top-[52px] z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#1A1A1A]"
                      >
                        {/* Header dropdown */}
                        <div className="border-b border-[#F0EBE0] px-4 py-3 dark:border-white/8">
                          <p className="truncate text-sm font-bold text-[#1f241c] dark:text-white">
                            {user?.name || displayName}
                          </p>
                          <p className="truncate text-xs text-[#8A9080]">{user?.email}</p>
                        </div>
                        {/* Actions */}
                        <div className="p-1.5">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#3A4A35] transition-colors hover:bg-[#F2EFE8] dark:text-white/70 dark:hover:bg-white/8"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1f4d3f]/10 text-[#1f4d3f]">
                              <User className="h-3.5 w-3.5" />
                            </span>
                            Mon profil
                          </button>
                          <Link
                            href="/"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#3A4A35] transition-colors hover:bg-[#F2EFE8] dark:text-white/70 dark:hover:bg-white/8"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C9963A]/10 text-[#C9963A]">
                              <Home className="h-3.5 w-3.5" />
                            </span>
                            Retour à l'accueil
                          </Link>
                          <div className="my-1 mx-2 h-px bg-[#F0EBE0] dark:bg-white/8" />
                          <button
                            onClick={handleLogoutClick}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10">
                              <LogOut className="h-3.5 w-3.5" />
                            </span>
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </header>





        {/* ════════════════════════════════════════════════════════════════
            BODY : Sidebar + Main
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex">

          {/* ══ Sidebar desktop ══════════════════════════════════════════ */}
          <aside
            className={cn(
              "relative hidden lg:flex flex-col transition-[width] duration-300 ease-out",
              "shadow-[1px_0_0_0_rgba(0,0,0,0.06),12px_0_32px_-16px_rgba(0,0,0,0.12)]",
              collapsed ? "w-[78px]" : "w-[268px]"
            )}
            style={{ background: SIDEBAR_BG }}
          >

            {/* Bouton collapse flottant */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -right-3 top-16 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#1a3d25] text-white/60 shadow-lg transition-colors hover:border-[#C9963A]/40 hover:text-[#C9963A]"
              aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </motion.button>

            {/* Marque / Logo sidebar */}
            <div className="relative flex h-[72px] items-center px-4">
              {!collapsed ? (
                <Link href="/customer/dashboard_client" className="group flex items-center gap-3 overflow-hidden">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10 transition-all duration-200 group-hover:bg-white/18">
                    <Image src={LOGO_PATH} alt="Logo" width={24} height={24} className="h-6 w-6 object-contain" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[12.5px] font-bold leading-none tracking-tight text-white">
                      MON ESPACE
                    </span>
                    <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C9963A]/80">
                      Client Premium
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/customer/dashboard_client"
                  className="mx-auto flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10 transition-all hover:bg-white/18"
                >
                  <Image src={LOGO_PATH} alt="Logo" width={24} height={24} className="h-6 w-6 object-contain" />
                </Link>
              )}
            </div>

            {/* Séparateur */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            {/* Navigation principale */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
              {!collapsed && (
                <p className="px-3 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Navigation
                </p>
              )}
              {NAV_ITEMS.map((item) => (
                <SidebarNavButton
                  key={item.id}
                  item={item}
                  isActive={currentSection === item.id}
                  collapsed={collapsed}
                  onClick={() => {
                    router.push(item.href);
                  }}
                />
              ))}
            </nav>

            {/* Séparateur bas */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

            {/* Footer sidebar : profil + retour accueil + déconnexion */}
            <div className="p-3 space-y-2">

              {/* Bouton retour accueil */}
              {!collapsed && (
                <Link
                  href="/"
                  className="group flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition-all duration-200 hover:border-[#C9963A]/30 hover:bg-[#C9963A]/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/50 transition-colors group-hover:text-[#C9963A]">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[12px] font-semibold text-white/50 transition-colors group-hover:text-[#C9963A]">
                    Retour à l'accueil
                  </span>
                </Link>
              )}

              {/* Carte utilisateur / déconnexion */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogoutClick}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1f4d3f] to-[#C9963A] ring-2 ring-white/20 shadow-sm">
                  {getAvatar()}
                </div>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[12.5px] font-semibold text-white/80">{displayName}</p>
                      <p className="truncate text-[10px] text-white/35 transition-colors group-hover:text-red-400">
                        Déconnexion
                      </p>
                    </div>
                    <LogOut className="h-4 w-4 shrink-0 text-white/25 transition-colors group-hover:text-red-400" />
                  </>
                )}
              </motion.button>
            </div>
          </aside>

          {/* ══ Sidebar mobile (drawer) ════════════════════════════════ */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />

                {/* Drawer */}
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 340, damping: 36 }}
                  className="fixed left-0 top-0 z-50 flex h-full w-[290px] flex-col shadow-2xl lg:hidden"
                  style={{ background: SIDEBAR_BG }}
                >
                  {/* Header drawer */}
                  <div className="flex h-[72px] items-center justify-between px-4">
                    <Link href="/customer/dashboard_client" className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10">
                        <Image src={LOGO_PATH} alt="Logo" width={24} height={24} className="h-6 w-6 object-contain" />
                      </div>
                      <div>
                        <span className="block text-[12.5px] font-bold text-white">MON ESPACE</span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C9963A]/80">
                          Client Premium
                        </span>
                      </div>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setMobileOpen(false)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-red-400/30 hover:text-red-400"
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                  {/* Nav mobile */}
                  <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    <p className="px-3 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/25">
                      Navigation
                    </p>
                    {NAV_ITEMS.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.28, ease: "easeOut" }}
                      >
                        <SidebarNavButton
                          item={item}
                          isActive={currentSection === item.id}
                          collapsed={false}
                          onClick={() => {
                            router.push(item.href);
                            setMobileOpen(false);
                          }}
                        />
                      </motion.div>
                    ))}
                  </nav>

                  <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                  {/* Footer mobile */}
                  <div className="p-3 space-y-2">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="group flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:border-[#C9963A]/30 hover:bg-[#C9963A]/10"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/45 group-hover:text-[#C9963A]">
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[12px] font-semibold text-white/45 group-hover:text-[#C9963A]">
                        Retour à l'accueil
                      </span>
                    </Link>

                    <button
                      onClick={handleLogoutClick}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-all hover:border-red-500/20 hover:bg-red-500/10"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1f4d3f] to-[#C9963A] ring-2 ring-white/20">
                        {getAvatar()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-[12.5px] font-semibold text-white/80">{displayName}</p>
                        <p className="text-[10px] text-white/35 group-hover:text-red-400">Déconnexion</p>
                      </div>
                      <LogOut className="h-4 w-4 text-white/25 group-hover:text-red-400" />
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ══ Contenu principal ════════════════════════════════════════ */}
          <main className="flex-1 min-h-[calc(100vh-68px)] overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Modale de déconnexion premium
      ════════════════════════════════════════════════════════════════ */}
      <LogoutDialog
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* ════════════════════════════════════════════════════════════════
          Modale de Profil
      ════════════════════════════════════════════════════════════════ */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={user}
        onLogout={handleLogoutClick}
        onProfileUpdate={(updatedData) => {
          if (user) {
            setUser({ ...user, ...updatedData } as any, getToken() || "");
          }
        }}
      />
    </>
  );
}
