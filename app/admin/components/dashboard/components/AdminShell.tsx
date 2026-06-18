
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
// import AdminHeader from "@/app/admin/components/dashboard/components/AdminHeader";
// import ConfirmDialog from "@/components/special/ConfirmDialog";

// import Image from "next/image";



// const LOGO_PATH = "/assets/images/LOGO.png";

// const NAV_ITEMS = [
//   { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
//   { id: "categories", label: "Catégories", icon: FolderTree, href: "/admin?section=categories" },
//   { id: "products", label: "Produits", icon: Package, href: "/admin?section=products" },
//   { id: "orders", label: "Commandes", icon: ShoppingCart, href: "/admin?section=orders" },
//   { id: "clients", label: "Clients", icon: Users, href: "/admin?section=clients" },
//   { id: "wallets", label: "Comptes bancaires", icon: Users, href: "/admin?section=wallets" },
//   { id: "promotions", label: "Promotions", icon: Tag, href: "/admin?section=promotions" },
//   { id: "fidelites", label: "Points de fidelites", icon: Tag, href: "/admin?section=fidelites" },
//   { id: "bannieres_publicitaires", label: "Bannieres publicaires", icon: Tag, href: "/admin?section=bannieres_publicitaires" },
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
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

//   const handleLogoutClick = () => {
//     setShowLogoutConfirm(true);
//   };

//   const confirmLogout = () => {
//     logout();
//     setShowLogoutConfirm(false);
//   };

//   const getAvatar = () => {
//     if (user?.profile_image) {
//       return (
//         // eslint-disable-next-line @next/next/no-img-element
//         <img
//           src={user.profile_image}
//           alt={adminDisplayName}
//           className="h-full w-full object-cover"
//         />
//       );
//     }
//     return (
//       <span className="text-xs font-bold text-white">
//         {adminInitial}
//       </span>
//     );
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-background">
//         <AdminHeader onMenuClick={toggleSidebar} />

//         <div className="flex">
//           {/* Sidebar desktop */}
//           <aside
//             className={cn(
//               "hidden lg:flex flex-col border-r border-border transition-all duration-300",
//               "bg-surface-elevated",
//               collapsed ? "w-[72px]" : "w-[260px]"
//             )}
//           >


//             <div className="flex h-16 items-center justify-between border-b border-border px-4">
//               {!collapsed ? (
//                 <Link
//                   href="/admin"
//                   className="group relative flex items-center gap-3 overflow-hidden transition-all duration-500 hover:scale-[1.02]"
//                 >
//                   {/* Cercle de lueur animé au hover */}
//                   {/* <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" /> */}

//                   {/* Conteneur du logo avec effet glassmorphique et dégradé */}
//                   {/* <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
//                     <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-surface-elevated">
//                       <Image
//                         src={LOGO_PATH}
//                         alt="Logo Atelier du Terroir"
//                         width={26}
//                         height={26}
//                         className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-105"
//                         priority
//                       />
//                     </div>
//                   </div> */}

//                   {/* Texte avec effet de brillance */}
//                   <div className="flex flex-col">
//                     <span className="text-sm font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
//                       Navigation Admin
//                     </span>
//                     <div className="relative">
//                       <span className="text-[9px] font-medium uppercase tracking-wider text-primary/70">
//                         Espace administration
//                       </span>
//                       <div className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
//                     </div>
//                   </div>
//                 </Link>
//               ) : (
//                 /* Version collapsed : seulement le logo (plus petit) */
//                 <Link
//                   href="/admin"
//                   className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
//                 >
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
//                   <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md">
//                     <div className="flex h-full w-full items-center justify-center rounded-md bg-white dark:bg-surface-elevated">
//                       <Image
//                         src={LOGO_PATH}
//                         alt="Logo"
//                         width={20}
//                         height={20}
//                         className="h-5 w-5 object-contain"
//                       />
//                     </div>
//                   </div>
//                 </Link>
//               )}

//               {/* Bouton de collapse/expand */}
//               <button
//                 onClick={() => setCollapsed(!collapsed)}
//                 className={cn(
//                   "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary",
//                   collapsed && "mx-auto"
//                 )}
//               >
//                 {collapsed ? (
//                   <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
//                 ) : (
//                   <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
//                 )}
//               </button>
//             </div>

//             <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
//               {NAV_ITEMS.map((item) => {
//                 const isActive = activeSection === item.id;
//                 return (
//                   <button
//                     key={item.id}
//                     onClick={() => onSectionChange(item.id)}
//                     className={cn(
//                       "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
//                       isActive
//                         ? "bg-primary/10 text-primary shadow-sm"
//                         : "text-foreground/70 hover:bg-surface-alt hover:text-foreground"
//                     )}
//                   >
//                     <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
//                     {!collapsed && <span>{item.label}</span>}
//                     {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
//                   </button>
//                 );
//               })}
//             </nav>

//             {/* Zone de déconnexion en bas de sidebar avec avatar */}
//             {!collapsed && (
//               <div className="border-t border-border p-3">
//                 <button
//                   onClick={handleLogoutClick}
//                   className="flex w-full items-center gap-3 rounded-xl bg-surface p-2.5 transition-colors hover:bg-surface-alt"
//                 >
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
//                     {getAvatar()}
//                   </div>
//                   <div className="min-w-0 flex-1 text-left">
//                     <p className="truncate text-xs font-medium text-foreground">{adminDisplayName}</p>
//                     <p className="truncate text-[10px] text-muted-foreground">Déconnexion</p>
//                   </div>
//                   <LogOut className="h-4 w-4 text-muted-foreground" />
//                 </button>
//               </div>
//             )}
//           </aside>

//           {/* Sidebar mobile */}
//           <AnimatePresence>
//             {mobileOpen && (
//               <>
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
//                   onClick={() => setMobileOpen(false)}
//                 />
//                 <motion.aside
//                   initial={{ x: -280 }}
//                   animate={{ x: 0 }}
//                   exit={{ x: -280 }}
//                   className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-border bg-surface-elevated lg:hidden"
//                 >


//                   {/* <div className="flex h-16 items-center justify-between border-b border-border px-4">
//                     <span className="text-sm font-bold text-foreground">Atelier Admin</span>
//                     <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div> */}

//                   <div className="flex h-16 items-center justify-between border-b border-border px-4">
//                     {!collapsed ? (
//                       <Link
//                         href="/admin"
//                         className="group relative flex items-center gap-3 overflow-hidden rounded-xl transition-all duration-500 hover:scale-[1.02]"
//                       >
//                         {/* Cercle de lueur animé au hover */}
//                         <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

//                         {/* Conteneur du logo avec effet glassmorphique et dégradé */}
//                         <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
//                           <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-surface-elevated">
//                             <Image
//                               src={LOGO_PATH}
//                               alt="Logo Atelier du Terroir"
//                               width={26}
//                               height={26}
//                               className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-105"
//                               priority
//                             />
//                           </div>
//                         </div>

//                         {/* Texte avec effet de brillance */}
//                         <div className="flex flex-col">
//                           <span className="text-sm font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
//                             Navigation Admin
//                           </span>
//                           <div className="relative">
//                             <span className="text-[9px] font-medium uppercase tracking-wider text-primary/70">
//                               Espace administration
//                             </span>
//                             <div className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
//                           </div>
//                         </div>
//                       </Link>
//                     ) : (
//                       /* Version collapsed : seulement le logo (plus petit) */
//                       <Link
//                         href="/admin"
//                         className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
//                       >
//                         <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-highlight/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
//                         <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-highlight p-[2px] shadow-md">
//                           <div className="flex h-full w-full items-center justify-center rounded-md bg-white dark:bg-surface-elevated">
//                             <Image
//                               src={LOGO_PATH}
//                               alt="Logo"
//                               width={20}
//                               height={20}
//                               className="h-5 w-5 object-contain"
//                             />
//                           </div>
//                         </div>
//                       </Link>
//                     )}

//                     {/* Bouton de collapse/expand */}
//                     <button
//                       // onClick={() => setCollapsed(!collapsed)}
//                       onClick={() => setMobileOpen(false)}
//                       className={cn(
//                         "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary",
//                         collapsed && "mx-auto"
//                       )}
//                     >
//                       {collapsed ? (
//                         <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
//                       ) : (
//                         <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
//                       )}
//                     </button>

//                   </div>


//                   <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
//                     {NAV_ITEMS.map((item) => (
//                       <button
//                         key={item.id}
//                         onClick={() => {
//                           onSectionChange(item.id);
//                           setMobileOpen(false);
//                         }}
//                         className={cn(
//                           "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
//                           activeSection === item.id ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-surface-alt"
//                         )}
//                       >
//                         <item.icon className="h-[18px] w-[18px]" />
//                         <span>{item.label}</span>
//                       </button>
//                     ))}
//                   </nav>
//                   {/* Bouton déconnexion dans le menu mobile */}
//                   <div className="border-t border-border p-3">
//                     <button
//                       onClick={handleLogoutClick}
//                       className="flex w-full items-center gap-3 rounded-xl bg-surface p-2.5 transition-colors hover:bg-surface-alt"
//                     >
//                       <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
//                         {getAvatar()}
//                       </div>
//                       <div className="min-w-0 flex-1 text-left">
//                         <p className="truncate text-xs font-medium text-foreground">{adminDisplayName}</p>
//                         <p className="truncate text-[10px] text-muted-foreground">Déconnexion</p>
//                       </div>
//                       <LogOut className="h-4 w-4 text-muted-foreground" />
//                     </button>
//                   </div>
//                 </motion.aside>
//               </>
//             )}
//           </AnimatePresence>

//           {/* Contenu principal */}
//           <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
//         </div>
//       </div>

//       {/* Dialogue de confirmation de déconnexion */}
//       <ConfirmDialog
//         isOpen={showLogoutConfirm}
//         title="Déconnexion"
//         message="Voulez-vous vraiment vous déconnecter de votre compte administrateur ?"
//         type="warning"
//         confirmText="Se déconnecter"
//         cancelText="Annuler"
//         onConfirm={confirmLogout}
//         onCancel={() => setShowLogoutConfirm(false)}
//       />
//     </>
//   );
// }




















































// app/admin/components/AdminShell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import AdminHeader from "@/app/admin/components/dashboard/components/AdminHeader";
import ConfirmDialog from "@/components/special/ConfirmDialog";

const LOGO_PATH = "/assets/images/LOGO.png";

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
  { id: "fidelites", label: "Points de fidelites", icon: Tag, href: "/admin?section=fidelites" },
  { id: "bannieres_publicitaires", label: "Bannieres publicaires", icon: Tag, href: "/admin?section=bannieres_publicitaires" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/admin?section=settings" },
];

interface AdminShellProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

/* ----------------------------------------------------------------------- */
/* Bouton de navigation — pastille active animée + icône élevée            */
/* ----------------------------------------------------------------------- */
function NavButton({
  item,
  isActive,
  collapsed,
  onClick,
  layoutId,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  layoutId: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-200",
        isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
      )}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/[0.08] via-primary/[0.05] to-transparent ring-1 ring-primary/15"
        />
      )}
      <span
        className={cn(
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          isActive
            ? "bg-white text-primary shadow-[0_2px_10px_-2px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04]"
            : "text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600"
        )}
      >
        <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
      </span>
      {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
      {isActive && !collapsed && (
        <span className="relative z-10 ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </motion.button>
  );
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
        <img src={user.profile_image} alt={adminDisplayName} className="h-full w-full object-cover" />
      );
    }
    return <span className="text-xs font-bold text-white">{adminInitial}</span>;
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <AdminHeader onMenuClick={toggleSidebar} />

        <div className="flex">
          {/* ----------------------------- Sidebar desktop ----------------------------- */}
          <aside
            className={cn(
              "relative hidden lg:flex flex-col bg-white transition-[width] duration-300 ease-out",
              "shadow-[1px_0_0_0_rgba(15,23,42,0.06),10px_0_28px_-16px_rgba(15,23,42,0.08)]",
              collapsed ? "w-[78px]" : "w-[268px]"
            )}
          >
            {/* Bouton flottant de collapse/expand */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="absolute -right-3 top-[72px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.18)] transition-colors hover:border-primary/30 hover:text-primary"
              aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </motion.button>

            {/* En-tête / marque */}
            <div className="relative flex h-[72px] items-center px-4">
              {!collapsed ? (
                <Link href="/admin" className="group flex items-center gap-3 overflow-hidden">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-105">
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
                    <span className="truncate text-[13.5px] font-bold leading-none tracking-tight text-slate-900">
                      Navigation Admin
                    </span>
                    <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                      Espace administration
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="group mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-105"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                    <Image src={LOGO_PATH} alt="Logo" width={20} height={20} className="h-5 w-5 object-contain" />
                  </div>
                </Link>
              )}
            </div>
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
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

            {/* Zone de déconnexion en bas de sidebar avec avatar */}
            {!collapsed && (
              <div className="p-3">
                <div className="mb-3 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogoutClick}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 shadow-sm transition-colors duration-200 hover:border-red-100 hover:bg-red-50/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight ring-2 ring-white shadow-sm">
                    {getAvatar()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs font-semibold text-slate-800">{adminDisplayName}</p>
                    <p className="truncate text-[10px] text-slate-400 transition-colors group-hover:text-red-400">
                      Déconnexion
                    </p>
                  </div>
                  <LogOut className="h-4 w-4 shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-red-400" />
                </motion.button>
              </div>
            )}
          </aside>

          {/* ------------------------------ Sidebar mobile ------------------------------ */}
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
                  className="fixed left-0 top-0 z-50 flex h-full w-[284px] flex-col bg-white shadow-2xl lg:hidden"
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
                        <span className="truncate text-[13.5px] font-bold leading-none tracking-tight text-slate-900">
                          Navigation Admin
                        </span>
                        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                          Espace administration
                        </span>
                      </div>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setMobileOpen(false)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-red-100 hover:text-red-400"
                      aria-label="Fermer le menu"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

                  <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
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

                  {/* Bouton déconnexion dans le menu mobile */}
                  <div className="p-3">
                    <div className="mb-3 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                    <button
                      onClick={handleLogoutClick}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 shadow-sm transition-colors duration-200 hover:border-red-100 hover:bg-red-50/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight ring-2 ring-white shadow-sm">
                        {getAvatar()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-semibold text-slate-800">{adminDisplayName}</p>
                        <p className="truncate text-[10px] text-slate-400 transition-colors group-hover:text-red-400">
                          Déconnexion
                        </p>
                      </div>
                      <LogOut className="h-4 w-4 shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-red-400" />
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