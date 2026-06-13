



// // app/admin/components/AdminShell.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   Tag,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   LogOut,
//   FolderTree,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuthStore } from "@/store/authStore";
// import AdminHeader from "../AdminHeader";

// const NAV_ITEMS = [
//   { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
//   { id: "products", label: "Produits", icon: Package, href: "/admin?section=products" },
//   { id: "categories", label: "Catégories", icon: FolderTree, href: "/admin?section=categories" },
//   { id: "orders", label: "Commandes", icon: ShoppingCart, href: "/admin?section=orders" },
//   { id: "clients", label: "Clients", icon: Users, href: "/admin?section=clients" },
//   { id: "promotions", label: "Promotions", icon: Tag, href: "/admin?section=promotions" },
//   { id: "settings", label: "Paramètres", icon: Settings, href: "/admin?section=settings" },
// ];

// interface AdminShellProps {
//   activeSection: string;
//   onSectionChange: (section: string) => void;
//   children: React.ReactNode;
// }

// export default function AdminShell({ activeSection, onSectionChange, children }: AdminShellProps) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const { user, logout } = useAuthStore();

//   const adminDisplayName = user?.name || user?.email?.split("@")[0] || "Admin";
//   const adminInitial = adminDisplayName.charAt(0).toUpperCase() || "A";

//   const toggleSidebar = () => {
//     // Sur desktop, on collapse/expand ; sur mobile, on ouvre le tiroir
//     if (window.innerWidth >= 1024) {
//       setCollapsed(!collapsed);
//     } else {
//       setMobileOpen(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <AdminHeader onMenuClick={toggleSidebar} />

//       <div className="flex">
//         {/* Sidebar desktop */}
//         <aside
//           className={cn(
//             "hidden lg:flex flex-col border-r border-border transition-all duration-300",
//             "bg-surface-elevated",
//             collapsed ? "w-[72px]" : "w-[260px]"
//           )}
//         >
//           <div className="flex h-16 items-center justify-between border-b border-border px-4">
//             {!collapsed && (
//               <Link href="/admin" className="flex items-center gap-2">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg">
//                   <span className="text-sm font-bold text-white">A</span>
//                 </div>
//                 <span className="text-sm font-bold text-foreground">Atelier Admin</span>
//               </Link>
//             )}
//             <button
//               onClick={() => setCollapsed(!collapsed)}
//               className={cn(
//                 "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary",
//                 collapsed && "mx-auto"
//               )}
//             >
//               {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
//             </button>
//           </div>

//           <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
//             {NAV_ITEMS.map((item) => {
//               const isActive = activeSection === item.id;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => onSectionChange(item.id)}
//                   className={cn(
//                     "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
//                     isActive
//                       ? "bg-primary/10 text-primary shadow-sm"
//                       : "text-foreground/70 hover:bg-surface-alt hover:text-foreground"
//                   )}
//                 >
//                   <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
//                   {!collapsed && <span>{item.label}</span>}
//                   {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
//                 </button>
//               );
//             })}
//           </nav>

//           {!collapsed && (
//             <div className="border-t border-border p-3">
//               <div className="flex items-center gap-3 rounded-xl bg-surface p-2.5">
//                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-highlight text-xs font-bold text-white">
//                   {adminInitial}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-xs font-medium text-foreground">{adminDisplayName}</p>
//                   <p className="truncate text-[10px] text-muted-foreground">Administrateur</p>
//                 </div>
//                 <button onClick={logout} className="text-muted-foreground hover:text-error">
//                   <LogOut className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </aside>

//         {/* Sidebar mobile */}
//         <AnimatePresence>
//           {mobileOpen && (
//             <>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
//                 onClick={() => setMobileOpen(false)}
//               />
//               <motion.aside
//                 initial={{ x: -280 }}
//                 animate={{ x: 0 }}
//                 exit={{ x: -280 }}
//                 className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-border bg-surface-elevated lg:hidden"
//               >
//                 <div className="flex h-16 items-center justify-between border-b border-border px-4">
//                   <span className="text-sm font-bold text-foreground">Atelier Admin</span>
//                   <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//                 <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
//                   {NAV_ITEMS.map((item) => (
//                     <button
//                       key={item.id}
//                       onClick={() => {
//                         onSectionChange(item.id);
//                         setMobileOpen(false);
//                       }}
//                       className={cn(
//                         "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
//                         activeSection === item.id ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-surface-alt"
//                       )}
//                     >
//                       <item.icon className="h-[18px] w-[18px]" />
//                       <span>{item.label}</span>
//                     </button>
//                   ))}
//                 </nav>
//               </motion.aside>
//             </>
//           )}
//         </AnimatePresence>

//         {/* Contenu principal */}
//         <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
//       </div>
//     </div>
//   );
// }































































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
import AdminHeader from "@/app/admin/AdminHeader";
import ConfirmDialog from "@/components/special/ConfirmDialog";

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
              {!collapsed && (
                <Link href="/admin" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg">
                    <span className="text-sm font-bold text-white">A</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">Atelier Admin</span>
                </Link>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  collapsed && "mx-auto"
                )}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
                  <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    <span className="text-sm font-bold text-foreground">Atelier Admin</span>
                    <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                      <X className="h-5 w-5" />
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