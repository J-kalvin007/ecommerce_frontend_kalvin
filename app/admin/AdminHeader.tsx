



// // components/layout/AdminHeader.tsx
// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, Bell, Sun, Moon, User, ChevronDown, LogOut } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useAuthStore } from "@/store/authStore";
// import ProfileModal from "@/components/layout/ProfileModal";

// const LOGO_PATH = "/assets/images/LOGO.png";

// interface AdminHeaderProps {
//   onMenuClick: () => void;
// }

// export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
//   const { user, status, logout, updateProfile } = useAuthStore();
//   const [mounted, setMounted] = useState(false);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setMounted(true);
//     const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
//     const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//     const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
//     setTheme(initialTheme);
//     document.documentElement.classList.toggle("dark", initialTheme === "dark");
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//         setIsProfileDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === "light" ? "dark" : "light";
//     setTheme(newTheme);
//     localStorage.setItem("theme", newTheme);
//     document.documentElement.classList.toggle("dark", newTheme === "dark");
//   };

//   const isAuthenticated = status === "authenticated" && user;
//   const getInitials = (name: string) =>
//     name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);

//   const openProfileModal = () => {
//     setIsProfileDropdownOpen(false);
//     setIsProfileModalOpen(true);
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-xl dark:bg-surface-elevated/80">
//         <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//           {/* Section gauche : logo + menu */}
//           <div className="flex items-center gap-4">
//             <button
//               onClick={onMenuClick}
//               className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground"
//               aria-label="Menu"
//             >
//               <Menu className="h-5 w-5" />
//             </button>
//             <Link href="/admin" className="flex items-center gap-2">
//               <div className="relative h-8 w-8 overflow-hidden rounded-lg">
//                 <Image src={LOGO_PATH} alt="Logo" width={32} height={32} className="object-contain" />
//               </div>
//               <div className="hidden sm:block">
//                 <span className="text-sm font-bold text-foreground">Atelier du Terroir</span>
//                 <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Espace Admin</p>
//               </div>
//             </Link>
//           </div>

//           {/* Section droite : thème, notifications, profil */}
//           <div className="flex items-center gap-2">
//             {/* Thème */}
//             <button
//               onClick={toggleTheme}
//               className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground"
//               aria-label="Changer de thème"
//             >
//               {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
//             </button>

//             {/* Notifications */}
//             <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground">
//               <Bell className="h-4 w-4" />
//               <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
//                 3
//               </span>
//             </button>

//             {/* Profil */}
//             {mounted && isAuthenticated ? (
//               <div ref={dropdownRef} className="relative">
//                 <button
//                   onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
//                   className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-surface-alt"
//                 >
//                   <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
//                     {user?.profile_image ? (
//                       <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
//                     ) : (
//                       <span className="text-xs font-bold text-white">{getInitials(user?.name || "U")}</span>
//                     )}
//                   </div>
//                   <span className="hidden text-sm font-medium sm:inline-block">
//                     {user?.name?.split(" ")[0] || "Admin"}
//                   </span>
//                   <ChevronDown className="h-3.5 w-3.5 text-muted" />
//                 </button>

//                 <AnimatePresence>
//                   {isProfileDropdownOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                       className="absolute right-0 top-12 z-50 w-56 origin-top-right rounded-xl border border-border bg-surface-elevated shadow-xl"
//                     >
//                       <div className="p-2">
//                         <button
//                           onClick={openProfileModal}
//                           className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-alt"
//                         >
//                           <User className="h-4 w-4 text-primary" />
//                           Mon profil
//                         </button>
//                         <button
//                           onClick={() => {
//                             setIsProfileDropdownOpen(false);
//                             logout();
//                           }}
//                           className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error transition-colors hover:bg-error/10"
//                         >
//                           <LogOut className="h-4 w-4" />
//                           Déconnexion
//                         </button>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             ) : (
//               <Link
//                 href="/auth/login"
//                 className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
//               >
//                 Connexion
//               </Link>
//             )}
//           </div>
//         </div>
//       </header>

//       <ProfileModal
//         isOpen={isProfileModalOpen}
//         onClose={() => setIsProfileModalOpen(false)}
//         profile={user}
//         onLogout={() => {
//           setIsProfileModalOpen(false);
//           logout();
//         }}
//         onProfileUpdate={updateProfile}
//       />
//     </>
//   );
// }


















































// app/admin/AdminHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Sun, Moon, User, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import ProfileModal from "@/components/layout/ProfileModal";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import { getToken } from "@/lib/axios";

const LOGO_PATH = "/assets/images/LOGO.png";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, status, logout, updateProfile } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isAuthenticated = status === "authenticated" && user;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const openProfileModal = () => {
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  

  const affichetoken = () => {
    const token = getToken();
    console.log("💣💣💣 VOICI LE TOKEN DE L'UTILISATEUR 💣💣💣", token)
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-xl dark:bg-surface-elevated/80">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Section gauche : logo + menu (visible seulement sur mobile/tablet) */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image
                  src={LOGO_PATH}
                  alt="Logo Atelier du Terroir"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold text-foreground">Atelier du Terroir</span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Espace Admin</p>
              </div>
            </Link>
          </div>

          {/* Section droite : thème, notifications, profil */}
          <div className="flex items-center gap-2">
            {/* Thème */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground"
              aria-label="Changer de thème"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <button 
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground"
              onClick={affichetoken}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
                3
              </span>
            </button>

            {/* Profil */}
            {mounted && isAuthenticated ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-surface-alt"
                >
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
                    {user?.profile_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profile_image}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {getInitials(user?.name || "U")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-center items-center">

                    <span className="hidden text-sm font-medium sm:inline-block">
                      {user?.name?.split(" ")[0] || "Admin"}
                    </span>
                    {/* <span className="hidden text-sm font-medium sm:inline-block">
                      {user?.role || "Admin"}
                    </span> */}
                    <span className="text-[10px] font-semibold leading-tight text-primary">
                      {user?.role == "platform_admin" ? "Administrateur" : "Client"}
                    </span>

                  </div>

                  <ChevronDown className="h-3.5 w-3.5 text-muted" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-12 z-50 w-56 origin-top-right rounded-xl border border-border bg-surface-elevated shadow-xl"
                    >
                      <div className="p-2">
                        <button
                          onClick={openProfileModal}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-alt"
                        >
                          <User className="h-4 w-4 text-primary" />
                          Mon profil
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error transition-colors hover:bg-error/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Modale de profil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={user}
        onLogout={() => {
          setIsProfileModalOpen(false);
          logout();
        }}
        onProfileUpdate={updateProfile}
      />

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