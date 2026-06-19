




// // app/admin/components/AdminShell.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   Tag,
//   Settings,
//   ChevronLeft,
//   X,
//   LogOut,
//   FolderTree,
// } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuthStore } from "@/store/authStore";
// import AdminHeader from "@/app/admin/components/dashboard/components/AdminHeader";
// import ConfirmDialog from "@/components/widgets_originaux/special/ConfirmDialog";

// const LOGO_PATH = "/assets/images/LOGO.png";

// interface NavItem {
//   id: string;
//   label: string;
//   icon: LucideIcon;
//   href: string;
// }

// const NAV_ITEMS: NavItem[] = [
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

// /* ----------------------------------------------------------------------- */
// /* Bouton de navigation — pastille active animée + icône élevée            */
// /* ----------------------------------------------------------------------- */
// function NavButton({
//   item,
//   isActive,
//   collapsed,
//   onClick,
//   layoutId,
// }: {
//   item: NavItem;
//   isActive: boolean;
//   collapsed: boolean;
//   onClick: () => void;
//   layoutId: string;
// }) {
//   return (
//     <motion.button
//       onClick={onClick}
//       whileTap={{ scale: 0.97 }}
//       className={cn(
//         "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-200",
//         isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
//       )}
//     >
//       {isActive && (
//         <motion.span
//           layoutId={layoutId}
//           transition={{ type: "spring", stiffness: 420, damping: 34 }}
//           className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/[0.08] via-primary/[0.05] to-transparent ring-1 ring-primary/15"
//         />
//       )}
//       <span
//         className={cn(
//           "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
//           isActive
//             ? "bg-white text-primary shadow-[0_2px_10px_-2px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04]"
//             : "text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600"
//         )}
//       >
//         <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
//       </span>
//       {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
//       {isActive && !collapsed && (
//         <span className="relative z-10 ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
//       )}
//     </motion.button>
//   );
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
//         <img src={user.profile_image} alt={adminDisplayName} className="h-full w-full object-cover" />
//       );
//     }
//     return <span className="text-xs font-bold text-white">{adminInitial}</span>;
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-background">
//         <AdminHeader onMenuClick={toggleSidebar} />

//         <div className="flex">
//           {/* ----------------------------- Sidebar desktop ----------------------------- */}
//           <aside
//             className={cn(
//               "relative hidden lg:flex flex-col bg-white transition-[width] duration-300 ease-out",
//               "shadow-[1px_0_0_0_rgba(15,23,42,0.06),10px_0_28px_-16px_rgba(15,23,42,0.08)]",
//               collapsed ? "w-[78px]" : "w-[268px]"
//             )}
//           >
//             {/* Bouton flottant de collapse/expand */}
//             <motion.button
//               onClick={() => setCollapsed(!collapsed)}
//               animate={{ rotate: collapsed ? 180 : 0 }}
//               transition={{ type: "spring", stiffness: 300, damping: 22 }}
//               whileHover={{ scale: 1.12 }}
//               whileTap={{ scale: 0.92 }}
//               className="absolute -right-3 top-[72px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.18)] transition-colors hover:border-primary/30 hover:text-primary"
//               aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
//             >
//               <ChevronLeft className="h-3.5 w-3.5" />
//             </motion.button>

//             {/* En-tête / marque */}
//             <div className="relative flex h-[72px] items-center px-4">
//               {!collapsed ? (
//                 <Link href="/admin" className="group flex items-center gap-3 overflow-hidden">
//                   <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-105">
//                     <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
//                       <Image
//                         src={LOGO_PATH}
//                         alt="Logo Atelier du Terroir"
//                         width={22}
//                         height={22}
//                         className="h-[22px] w-[22px] object-contain"
//                         priority
//                       />
//                     </div>
//                   </div>
//                   <div className="flex min-w-0 flex-col">
//                     <span className="truncate text-[13.5px] font-bold leading-none tracking-tight text-slate-900">
//                       Navigation Admin
//                     </span>
//                     <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70">
//                       Espace administration
//                     </span>
//                   </div>
//                 </Link>
//               ) : (
//                 <Link
//                   href="/admin"
//                   className="group mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-105"
//                 >
//                   <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
//                     <Image src={LOGO_PATH} alt="Logo" width={20} height={20} className="h-5 w-5 object-contain" />
//                   </div>
//                 </Link>
//               )}
//             </div>
//             <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

//             {/* Navigation */}
//             <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
//               {!collapsed && (
//                 <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
//                   Menu principal
//                 </p>
//               )}
//               {NAV_ITEMS.map((item) => (
//                 <NavButton
//                   key={item.id}
//                   item={item}
//                   isActive={activeSection === item.id}
//                   collapsed={collapsed}
//                   onClick={() => onSectionChange(item.id)}
//                   layoutId="desktop-active-pill"
//                 />
//               ))}
//             </nav>

//             {/* Zone de déconnexion en bas de sidebar avec avatar */}
//             {!collapsed && (
//               <div className="p-3">
//                 <div className="mb-3 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
//                 <motion.button
//                   whileHover={{ y: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleLogoutClick}
//                   className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 shadow-sm transition-colors duration-200 hover:border-red-100 hover:bg-red-50/50"
//                 >
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight ring-2 ring-white shadow-sm">
//                     {getAvatar()}
//                   </div>
//                   <div className="min-w-0 flex-1 text-left">
//                     <p className="truncate text-xs font-semibold text-slate-800">{adminDisplayName}</p>
//                     <p className="truncate text-[10px] text-slate-400 transition-colors group-hover:text-red-400">
//                       Déconnexion
//                     </p>
//                   </div>
//                   <LogOut className="h-4 w-4 shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-red-400" />
//                 </motion.button>
//               </div>
//             )}
//           </aside>

//           {/* ------------------------------ Sidebar mobile ------------------------------ */}
//           <AnimatePresence>
//             {mobileOpen && (
//               <>
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
//                   onClick={() => setMobileOpen(false)}
//                 />
//                 <motion.aside
//                   initial={{ x: "-100%" }}
//                   animate={{ x: 0 }}
//                   exit={{ x: "-100%" }}
//                   transition={{ type: "spring", stiffness: 340, damping: 36 }}
//                   className="fixed left-0 top-0 z-50 flex h-full w-[284px] flex-col bg-white shadow-2xl lg:hidden"
//                 >
//                   <div className="flex h-[72px] items-center justify-between px-4">
//                     <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
//                       <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-highlight p-[1.5px] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.35)]">
//                         <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
//                           <Image
//                             src={LOGO_PATH}
//                             alt="Logo Atelier du Terroir"
//                             width={22}
//                             height={22}
//                             className="h-[22px] w-[22px] object-contain"
//                             priority
//                           />
//                         </div>
//                       </div>
//                       <div className="flex min-w-0 flex-col">
//                         <span className="truncate text-[13.5px] font-bold leading-none tracking-tight text-slate-900">
//                           Navigation Admin
//                         </span>
//                         <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70">
//                           Espace administration
//                         </span>
//                       </div>
//                     </Link>
//                     <motion.button
//                       whileHover={{ scale: 1.08 }}
//                       whileTap={{ scale: 0.92 }}
//                       onClick={() => setMobileOpen(false)}
//                       className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-red-100 hover:text-red-400"
//                       aria-label="Fermer le menu"
//                     >
//                       <X className="h-4 w-4" />
//                     </motion.button>
//                   </div>
//                   <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

//                   <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
//                     {NAV_ITEMS.map((item, index) => (
//                       <motion.div
//                         key={item.id}
//                         initial={{ opacity: 0, x: -12 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: index * 0.03, duration: 0.25, ease: "easeOut" }}
//                       >
//                         <NavButton
//                           item={item}
//                           isActive={activeSection === item.id}
//                           collapsed={false}
//                           onClick={() => {
//                             onSectionChange(item.id);
//                             setMobileOpen(false);
//                           }}
//                           layoutId="mobile-active-pill"
//                         />
//                       </motion.div>
//                     ))}
//                   </nav>

//                   {/* Bouton déconnexion dans le menu mobile */}
//                   <div className="p-3">
//                     <div className="mb-3 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
//                     <button
//                       onClick={handleLogoutClick}
//                       className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 shadow-sm transition-colors duration-200 hover:border-red-100 hover:bg-red-50/50"
//                     >
//                       <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight ring-2 ring-white shadow-sm">
//                         {getAvatar()}
//                       </div>
//                       <div className="min-w-0 flex-1 text-left">
//                         <p className="truncate text-xs font-semibold text-slate-800">{adminDisplayName}</p>
//                         <p className="truncate text-[10px] text-slate-400 transition-colors group-hover:text-red-400">
//                           Déconnexion
//                         </p>
//                       </div>
//                       <LogOut className="h-4 w-4 shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-red-400" />
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














































"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthSession } from "@/components/auth/useAuthSession";
import { buildAdminReturnPath, hasAdminAccess, logout } from "@/lib/auth";
import { AdminSectionId } from "./AdminDashboard";

const CLIENT_LINKS = [
  { label: "Boutique accueil", href: "/" },
  { label: "Catalogue produits", href: "/products" },
  { label: "Mon compte client", href: "/account" },
  { label: "Panier / checkout", href: "/checkout" },
];

const NAV_ITEMS: Array<{ id: AdminSectionId; label: string; icon: string; href: string }> = [
  { id: "overview", label: "Dashboard", icon: "D", href: "/admin" },
  { id: "products", label: "Produits", icon: "P", href: "/admin?section=products" },
  { id: "categories", label: "Categories", icon: "C", href: "/admin?section=categories" },
  { id: "orders", label: "Commandes", icon: "O", href: "/admin?section=orders" },
  { id: "clients", label: "Clients", icon: "U", href: "/admin?section=clients" },
  { id: "promotions", label: "Promotions", icon: "%", href: "/admin?section=promotions" },
  { id: "settings", label: "Parametres", icon: "S", href: "/admin?section=settings" },
];

export default function AdminShell({
  activeSection,
  onSectionChange,
  adminReturnPath,
  onLogout,
  children,
}: {
  activeSection: AdminSectionId;
  onSectionChange: (section: AdminSectionId) => void;
  adminReturnPath?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useAuthSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const returnPath = adminReturnPath ?? buildAdminReturnPath(activeSection);



  function openSection(item: (typeof NAV_ITEMS)[number]) {
    onSectionChange(item.id);
    setMobileOpen(false);
    router.replace(item.href, { scroll: false });
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }



    void logout(session).then(() => {
      router.replace(returnPath);
    });
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f4efe6] text-slate-900">
      <aside
        className={cx(
          "hidden flex-col border-r border-[#eadfce] bg-white shadow-[18px_0_40px_-34px_rgba(139,94,52,0.22)] transition-all duration-300 lg:flex",
          collapsed ? "w-[78px]" : "w-[270px]"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#eadfce] px-4">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5e34] text-sm font-bold text-white">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Atelier Admin</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Administration
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5e34] text-sm font-bold text-white">
              A
            </div>
          )}

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#f7f1e8] hover:text-[#8b5e34]"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#f8ecdf] text-[#8b5e34] shadow-sm"
                    : "text-slate-600 hover:bg-[#fcf7f1] hover:text-slate-900"
                )}
                type="button"
                onClick={() => openSection(item)}
              >
                <span
                  className={cx(
                    "flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                    isActive ? "bg-[#8b5e34] text-white" : "bg-[#f2e8db] text-[#8b5e34]"
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );
          })}
        </nav>

        {!collapsed ? (
          <div className="border-t border-[#eadfce] px-2 py-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Espace client
            </p>
            <div className="space-y-1">
              {CLIENT_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#fcf7f1] hover:text-[#8b5e34]"
                >
                  <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md bg-[#eef6f1] text-[10px] font-bold text-[#1f4d3f]">
                    B
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {!collapsed ? (
          <div className="border-t border-[#eadfce] p-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#fcfaf7] p-3 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f4d3f] text-xs font-bold text-white">
                {"Kalvin".charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-900">{"Kalvin"}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {hasAdminAccess(session) ? "Administrateur" : "Compte connecte"}
                </p>
              </div>
              <button
                className="rounded-lg p-2 text-slate-400 transition hover:bg-[#fff4ea] hover:text-[#8b5e34]"
                type="button"
                onClick={handleLogout}
                title="Se deconnecter"
              >
                Out
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/45"
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-[#eadfce] bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[#eadfce] px-4">
              <span className="text-sm font-bold text-slate-900">Atelier Admin</span>
              <button
                className="rounded-lg p-2 text-slate-500 transition hover:bg-[#f7f1e8]"
                type="button"
                onClick={() => setMobileOpen(false)}
              >
                X
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    activeSection === item.id
                      ? "bg-[#f8ecdf] text-[#8b5e34]"
                      : "text-slate-600 hover:bg-[#fcf7f1]"
                  )}
                  type="button"
                  onClick={() => openSection(item)}
                >
                  <span className="flex h-[20px] w-[20px] items-center justify-center rounded-md bg-[#f2e8db] text-[11px] font-bold text-[#8b5e34]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="border-t border-[#eadfce] px-2 py-3">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Espace client
              </p>
              <div className="space-y-1">
                {CLIENT_LINKS.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#fcf7f1] hover:text-[#8b5e34]"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#eadfce] bg-white/85 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-500 transition hover:bg-[#f7f1e8] lg:hidden"
              type="button"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
            <div className="relative hidden sm:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                Rechercher
              </span>
              <input
                className="h-9 w-64 rounded-lg border border-[#e6d9c6] bg-[#fffdfa] pl-24 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#8b5e34]"
                placeholder="Produits, clients..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6d9c6] bg-white text-slate-500 transition hover:bg-[#f8ecdf]"
              type="button"
            >
              N
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1f4d3f] text-[9px] font-bold text-white">
                3
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
