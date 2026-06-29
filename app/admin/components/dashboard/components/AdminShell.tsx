// app/admin/components/dashboard/components/AdminShell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  ChevronLeft,
  X,
  LogOut,
  FolderTree,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { mediaUrl } from "@/lib/mediaUrl";
import AdminHeader from "./AdminHeader";
import LogoutDialog from "@/components/special/LogoutDialog";
import { Home } from "lucide-react";

const LOGO_PATH = "/assets/images/LOGO.png";

const SIDEBAR_BG = "linear-gradient(160deg, #0D2318 0%, #102A1E 45%, #0F2218 100%)";
const SIDEBAR_ACTIVE = "linear-gradient(135deg, #C9963A 0%, #E8B450 100%)";

/* ------------------------------------------------------------------ */
/*  Types & Constantes                                                */
/* ------------------------------------------------------------------ */

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "categories", label: "Catégories", icon: FolderTree, href: "/admin?section=categories" },
  { id: "products", label: "Produits", icon: Package, href: "/admin?section=products" },
  { id: "orders", label: "Commandes", icon: ShoppingCart, href: "/admin?section=orders" },
  { id: "clients", label: "Clients", icon: Users, href: "/admin?section=clients" },
  { id: "wallets", label: "Comptes bancaires", icon: Users, href: "/admin?section=wallets" },
  { id: "promotions", label: "Promotions", icon: Tag, href: "/admin?section=promotions" },
  { id: "fidelites", label: "Points de fidélité", icon: Tag, href: "/admin?section=fidelites" },
  { id: "bannieres_publicitaires", label: "Bannières publicitaires", icon: Tag, href: "/admin?section=bannieres_publicitaires" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/admin?section=settings" },
];

interface AdminShellProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Bouton de navigation animé                                        */
/* ------------------------------------------------------------------ */
function NavButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  layoutId?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200",
        isActive
          ? "text-white"
          : "text-white/80 hover:text-white"
      )}
    >
      {isActive && (
        <motion.span
          layoutId="admin-active-pill"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-0 rounded-2xl"
          style={{
            background: SIDEBAR_ACTIVE,
            boxShadow: "0 4px 20px -6px rgba(201,150,58,0.55)",
          }}
        />
      )}
      <span
        className={cn(
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          isActive
            ? "bg-white/20 text-white shadow-sm"
            : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
        )}
      >
        <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
      </span>
      {!collapsed && <span className="relative z-10 truncate flex-1 text-left">{item.label}</span>}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant AdminShell                                              */
/* ------------------------------------------------------------------ */
export default function AdminShell({ activeSection, onSectionChange, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const adminDisplayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const adminInitial = adminDisplayName.charAt(0).toUpperCase() || "A";

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed(!collapsed);
    } else {
      setMobileOpen(true);
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    router.push("/auth/login");
  };

  const getAvatar = () => {
    if (user?.profile_image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(user.profile_image) || ''} alt={adminDisplayName} className="h-full w-full object-cover" />
      );
    }
    return <span className="text-xs font-bold text-white">{adminInitial}</span>;
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#121212]">
        <AdminHeader onMenuClick={toggleSidebar} />

        <div className="flex">
          {/* --- Sidebar desktop --- */}
          <aside
            className={cn(
              "relative hidden lg:flex flex-col transition-[width] duration-300 ease-out z-20",
              collapsed ? "w-[88px]" : "w-[280px]"
            )}
            style={{ background: SIDEBAR_BG }}
          >
            {/* Bouton collapse/expand flottant */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="absolute -right-3 top-[72px] z-20 cursor-pointer flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#16332b] text-white/50 shadow-md transition-colors hover:border-[#C9963A]/50 hover:text-[#C9963A]"
              aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </motion.button>

            {/* Logo / marque */}
            <div className="relative flex h-[72px] items-center px-4">
              {!collapsed ? (
                <Link href="/admin" className="group flex items-center gap-3 cursor-pointer overflow-hidden">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-105">
                    {/* <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                      <Image
                        // src={LOGO_PATH}
                        src={mediaUrl(user.profile_image) || ''}
                        alt="Logo Atelier du Terroir"
                        width={22}
                        height={22}
                        className="h-[22px] w-[22px] object-contain"
                        priority
                      />
                    </div> */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight ring-2 ring-white shadow-sm">
                      {getAvatar()}
                    </div>



                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13.5px] font-bold leading-none tracking-tight text-white">
                      TABLEAU DE BORD
                    </span>
                    <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C9963A]">
                      Espace administration
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="group mx-auto cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-105"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                    <Image src={LOGO_PATH} alt="Logo" width={20} height={20} className="h-5 w-5 object-contain" />
                  </div>
                </Link>
              )}
            </div>
            <div className="mx-4 h-px bg-white/10" />

            {/* Navigation principale */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                  Menu principal
                </p>
              )}
              {NAV_ITEMS.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  collapsed={collapsed}
                  onClick={() => onSectionChange(item.id)}
                  layoutId="desktop-active-pill"
                />
              ))}
            </nav>

            {/* Zone bas de sidebar (desktop) */}
            <div className="p-4 flex flex-col gap-2">
              <div className="mb-2 h-px bg-white/10" />
              
              {!collapsed && (
                <Link
                  href="/"
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-all duration-200 hover:border-[#C9963A]/20 hover:bg-[#C9963A]/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/50 transition-colors group-hover:text-[#C9963A]">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[12px] font-semibold text-white/50 transition-colors group-hover:text-[#C9963A]">
                    Retour à l'accueil
                  </span>
                </Link>
              )}

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
                      <p className="truncate text-xs font-semibold text-white/90">{adminDisplayName}</p>
                      <p className="truncate text-[10px] text-white/40 transition-colors group-hover:text-red-400">
                        Déconnexion
                      </p>
                    </div>
                    <LogOut className="h-4 w-4 shrink-0 text-white/30 transition-colors duration-200 group-hover:text-red-400" />
                  </>
                )}
              </motion.button>
            </div>
          </aside>

          {/* --- Sidebar mobile --- */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 340, damping: 36 }}
                  className="fixed left-0 top-0 z-50 flex h-full w-[284px] flex-col shadow-2xl lg:hidden"
                  style={{ background: SIDEBAR_BG }}
                >
                  <div className="flex h-[72px] items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)]">
                        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                          <Image
                            src={LOGO_PATH}
                            alt="Logo Atelier du Terroir"
                            width={22}
                            height={22}
                            className="h-[22px] w-[22px] object-contain"
                            priority
                          />
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[13.5px] font-bold leading-none tracking-tight text-white">
                          TABLEAU DE BORD
                        </span>
                        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C9963A]">
                          ATELIER DU TERROIR
                        </span>
                      </div>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setMobileOpen(false)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#16332b] text-white/50 shadow-md transition-colors hover:border-[#C9963A]/50 hover:text-[#C9963A]"
                      aria-label="Fermer le menu"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="mx-4 h-px bg-white/10" />

                  <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
                    {NAV_ITEMS.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.25, ease: "easeOut" }}
                      >
                        <NavButton
                          item={item}
                          isActive={activeSection === item.id}
                          collapsed={false}
                          onClick={() => {
                            onSectionChange(item.id);
                            setMobileOpen(false);
                          }}
                          layoutId="mobile-active-pill"
                        />
                      </motion.div>
                    ))}
                  </nav>

                  {/* Zone bas de sidebar (mobile) */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="mb-2 h-px bg-white/10" />

                    <Link
                      href="/"
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-all duration-200 hover:border-[#C9963A]/20 hover:bg-[#C9963A]/10"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/50 transition-colors group-hover:text-[#C9963A]">
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[12px] font-semibold text-white/50 transition-colors group-hover:text-[#C9963A]">
                        Retour à l'accueil
                      </span>
                    </Link>

                    <button
                      onClick={handleLogoutClick}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1f4d3f] to-[#C9963A] ring-2 ring-white/20 shadow-sm">
                        {getAvatar()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-semibold text-white/90">{adminDisplayName}</p>
                        <p className="truncate text-[10px] text-white/40 transition-colors group-hover:text-red-400">
                          Déconnexion
                        </p>
                      </div>
                      <LogOut className="h-4 w-4 shrink-0 text-white/30 transition-colors duration-200 group-hover:text-red-400" />
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Contenu principal */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>

      {/* Modale de déconnexion premium */}
      <LogoutDialog
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}