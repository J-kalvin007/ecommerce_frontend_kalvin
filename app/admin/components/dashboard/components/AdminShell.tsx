
// app/admin/components/AdminShell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import AdminHeader from "@/app/admin/components/dashboard/components/AdminHeader";
import ConfirmDialog from "@/components/special/ConfirmDialog";

import Image from "next/image";



const LOGO_PATH = "/assets/images/LOGO.png";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "categories", label: "Catégories", icon: FolderTree, href: "/admin?section=categories" },
  { id: "products", label: "Produits", icon: Package, href: "/admin?section=products" },
  { id: "orders", label: "Commandes", icon: ShoppingCart, href: "/admin?section=orders" },
  { id: "clients", label: "Clients", icon: Users, href: "/admin?section=clients" },
  { id: "promotions", label: "Promotions", icon: Tag, href: "/admin?section=promotions" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/admin?section=settings" },
];

interface AdminShellProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

export default function AdminShell({ activeSection, onSectionChange, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuthStore();

  const adminDisplayName = user?.name || user?.email?.split("@")[0] || "Admin";
  const adminInitial = adminDisplayName.charAt(0).toUpperCase() || "A";

  const toggleSidebar = () => {
    // Sur desktop, on collapse/expand ; sur mobile, on ouvre le tiroir
    if (window.innerWidth >= 1024) {
      setCollapsed(!collapsed);
    } else {
      setMobileOpen(true);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const getAvatar = () => {
    if (user?.profile_image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.profile_image}
          alt={adminDisplayName}
          className="h-full w-full object-cover"
        />
      );
    }
    return (
      <span className="text-xs font-bold text-white">
        {adminInitial}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <AdminHeader onMenuClick={toggleSidebar} />

        <div className="flex">
          {/* Sidebar desktop */}
          <aside
            className={cn(
              "hidden lg:flex flex-col border-r border-border transition-all duration-300",
              "bg-surface-elevated",
              collapsed ? "w-[72px]" : "w-[260px]"
            )}
          >

            
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              {!collapsed ? (
                <Link
                  href="/admin"
                  className="group relative flex items-center gap-3 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                >
                  {/* Cercle de lueur animé au hover */}
                  {/* <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" /> */}

                  {/* Conteneur du logo avec effet glassmorphique et dégradé */}
                  {/* <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-surface-elevated">
                      <Image
                        src={LOGO_PATH}
                        alt="Logo Atelier du Terroir"
                        width={26}
                        height={26}
                        className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-105"
                        priority
                      />
                    </div>
                  </div> */}

                  {/* Texte avec effet de brillance */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                      Navigation Admin
                    </span>
                    <div className="relative">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-primary/70">
                        Espace administration
                      </span>
                      <div className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                    </div>
                  </div>
                </Link>
              ) : (
                /* Version collapsed : seulement le logo (plus petit) */
                <Link
                  href="/admin"
                  className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md">
                    <div className="flex h-full w-full items-center justify-center rounded-md bg-white dark:bg-surface-elevated">
                      <Image
                        src={LOGO_PATH}
                        alt="Logo"
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                  </div>
                </Link>
              )}

              {/* Bouton de collapse/expand */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary",
                  collapsed && "mx-auto"
                )}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                ) : (
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                )}
              </button>
            </div>

            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-foreground/70 hover:bg-surface-alt hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </nav>

            {/* Zone de déconnexion en bas de sidebar avec avatar */}
            {!collapsed && (
              <div className="border-t border-border p-3">
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-3 rounded-xl bg-surface p-2.5 transition-colors hover:bg-surface-alt"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
                    {getAvatar()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs font-medium text-foreground">{adminDisplayName}</p>
                    <p className="truncate text-[10px] text-muted-foreground">Déconnexion</p>
                  </div>
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </aside>

          {/* Sidebar mobile */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-border bg-surface-elevated lg:hidden"
                >


                  {/* <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    <span className="text-sm font-bold text-foreground">Atelier Admin</span>
                    <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                      <X className="h-5 w-5" />
                    </button>
                  </div> */}
      
                  <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    {!collapsed ? (
                      <Link
                        href="/admin"
                        className="group relative flex items-center gap-3 overflow-hidden rounded-xl transition-all duration-500 hover:scale-[1.02]"
                      >
                        {/* Cercle de lueur animé au hover */}
                        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                        {/* Conteneur du logo avec effet glassmorphique et dégradé */}
                        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-surface-elevated">
                            <Image
                              src={LOGO_PATH}
                              alt="Logo Atelier du Terroir"
                              width={26}
                              height={26}
                              className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-105"
                              priority
                            />
                          </div>
                        </div>

                        {/* Texte avec effet de brillance */}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                            Navigation Admin
                          </span>
                          <div className="relative">
                            <span className="text-[9px] font-medium uppercase tracking-wider text-primary/70">
                              Espace administration
                            </span>
                            <div className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      /* Version collapsed : seulement le logo (plus petit) */
                      <Link
                        href="/admin"
                        className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md">
                          <div className="flex h-full w-full items-center justify-center rounded-md bg-white dark:bg-surface-elevated">
                            <Image
                              src={LOGO_PATH}
                              alt="Logo"
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain"
                            />
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* Bouton de collapse/expand */}
                    <button
                      // onClick={() => setCollapsed(!collapsed)}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary",
                        collapsed && "mx-auto"
                      )}
                    >
                      {collapsed ? (
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      ) : (
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      )}
                    </button>

                  </div>


                  <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          activeSection === item.id ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-surface-alt"
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px]" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                  {/* Bouton déconnexion dans le menu mobile */}
                  <div className="border-t border-border p-3">
                    <button
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-3 rounded-xl bg-surface p-2.5 transition-colors hover:bg-surface-alt"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
                        {getAvatar()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-medium text-foreground">{adminDisplayName}</p>
                        <p className="truncate text-[10px] text-muted-foreground">Déconnexion</p>
                      </div>
                      <LogOut className="h-4 w-4 text-muted-foreground" />
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

      {/* Dialogue de confirmation de déconnexion */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter de votre compte administrateur ?"
        type="warning"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}