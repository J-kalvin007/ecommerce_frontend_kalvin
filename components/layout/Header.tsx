

/**
 * Header — Barre de navigation principale ultra-premium
 *
 * Fonctionnalités :
 * 1. Logo + navigation principale (filtrée par rôle)
 * 2. Barre de recherche avec autocomplétion
 * 3. Icônes : favoris, panier (badge quantité)
 * 4. Menu mobile responsive (slide-over)
 * 5. Sticky avec glassmorphism au scroll
 * 6. Dropdown profil élégant (au lieu d'ouverture directe de la modale)
 * 7. Bouton de changement de thème (clair/sombre)
 *
 * @module components/layout/Header
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Wallet,
  LogOut,
  Settings,
  Package,
  Star,
  LayoutDashboard,
  UserCircle,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import ProfileModal from "@/components/layout/ProfileModal";
import { mediaUrl } from "@/lib/mediaUrl";

// Chemin statique de l'image (doit être placée dans public/assets/images/LOGO.png)
const LOGO_PATH = "/assets/images/LOGO.png";

/** Liens de navigation principaux */
type NavLink = {
  label: string;
  href: string;
  hasSubmenu?: boolean;
  adminOnly?: boolean;   // réservé aux admins
  hideForAdmin?: boolean; // caché pour les admins
};

const NAV_LINKS: NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/products" },
  { label: "Promotions", href: "/promotions", hideForAdmin: true },
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact", hideForAdmin: true },
];

/**
 * Header — Composant de navigation principal.
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, logout, updateProfile } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  /* --- Hydration & thème --- */
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  /* --- Détection du scroll --- */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* --- Fermer les menus au clic extérieur --- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --- Fermer les menus au changement de route --- */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const isAuthenticated = status === "authenticated" && user;
  const isAdmin = user?.role === "platform_admin";
  const isHomePage = pathname === "/";
  const useTransparentHeader = isHomePage && !isScrolled;

  // Filtrage des liens selon le rôle
  const filteredNavLinks = NAV_LINKS.filter((link) => {
    if (isAdmin && link.hideForAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
    router.push("/");
  };

  const openProfileModal = () => {
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  const goToDashboard = () => {
    setIsProfileDropdownOpen(false);
    const dashboardPath = isAdmin ? "/admin" : "/dashboard_client";
    router.push(dashboardPath);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          useTransparentHeader
            ? "bg-transparent"
            : "border-b border-border/50 bg-white shadow-lg dark:bg-surface-elevated dark:border-border"
        )}
      >
        <nav className="mx-auto flex w-full items-center justify-between px-4 py-2 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Logo + titre */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform hover:scale-105"
            aria-label="L'Atelier du Terroir — Accueil"
          >
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl duration-300 sm:h-18 sm:w-18",
                isScrolled ? "shadow-lg" : "shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
              )}
            >
              <Image
                src={LOGO_PATH}
                alt="Logo L'Atelier du Terroir"
                width={52}
                height={52}
                className="h-full w-full rounded-2xl object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1
                className={cn(
                  "font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl",
                  useTransparentHeader ? "text-white" : "text-[#1f6b3a] dark:text-white"
                )}
              >
                Atelier du Terroir
              </h1>
              <p
                className={cn(
                  "text-[10px] font-medium uppercase tracking-widest",
                  useTransparentHeader ? "text-white/80" : "text-muted"
                )}
              >
                Deal and consulting agribusiness
              </p>
            </div>
          </Link>

          {/* Navigation desktop (filtrée) */}
          <ul className="hidden items-center gap-1 lg:flex">
            {filteredNavLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "group relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-primary"
                        : useTransparentHeader
                          ? "text-white/90 hover:bg-white/10 hover:text-white"
                          : "text-foreground/80 hover:bg-surface-alt hover:text-foreground"
                    )}
                  >
                    {link.label}
                    {link.hasSubmenu && (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions droite */}
          <div className="flex items-center gap-1.5">
            {/* Bouton de thème */}
            <button
              onClick={toggleTheme}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                useTransparentHeader
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/70 hover:bg-surface-alt hover:text-foreground"
              )}
              aria-label="Changer de thème"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Recherche */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                  useTransparentHeader
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : "text-foreground/70 hover:bg-surface-alt hover:text-foreground"
                )}
                aria-label="Rechercher"
              >
                <Search className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-border bg-surface-elevated p-2 shadow-xl sm:w-96"
                  >
                    <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
                      <Search className="h-4 w-4 text-muted" />
                      <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-muted hover:text-foreground"
                          aria-label="Effacer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 px-1">
                      <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted">
                        Recherches populaires
                      </p>
                      {["Huile d'olive", "Chocolat", "Épices", "Thé vert"].map((term) => (
                        <Link
                          key={term}
                          href={`/products?search=${encodeURIComponent(term)}`}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-surface-alt"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <Search className="h-3.5 w-3.5 text-muted" />
                          {term}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favoris */}
            <Link
              href="/favoris"
              className={cn(
                "hidden h-10 w-10 items-center justify-center rounded-xl transition-all sm:flex",
                useTransparentHeader
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/70 hover:bg-surface-alt hover:text-primary"
              )}
              aria-label="Mes favoris"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Panier */}
            <button
              onClick={() => toggleDrawer(true)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                useTransparentHeader
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/70 hover:bg-surface-alt hover:text-primary"
              )}
              aria-label={`Panier (${mounted ? itemCount : 0} articles)`}
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </button>

            {/* Profil / Connexion avec DROPDOWN */}
            {mounted && isAuthenticated ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5 transition-all hover:border-primary/30 hover:bg-surface-alt"
                  aria-label="Menu compte"
                >
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-highlight">
                    {user?.profile_image ? (
                      <img
                        src={mediaUrl(user.profile_image) || ''}
                        alt={user.name || "Avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {getInitials(user?.name || "U")}
                      </span>
                    )}
                  </div>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-xs font-medium leading-tight">
                      {user?.name?.split(" ")[0] || "Mon compte"}
                    </span>
                    <span className="text-[10px] font-semibold leading-tight text-primary">
                      {isAdmin ? "Administrateur" : "Client"}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "hidden h-3.5 w-3.5 text-muted transition-transform md:block",
                      isProfileDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown premium */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-12 z-50 w-72 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl backdrop-blur-md"
                    >
                      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-highlight/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-highlight">
                            {user?.profile_image ? (
                              <img
                                src={mediaUrl(user.profile_image) || ''}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-bold text-white">
                                {getInitials(user?.name || "U")}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {user?.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user?.email}
                            </p>
                            <span
                              className={cn(
                                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                isAdmin
                                  ? "bg-primary/10 text-primary"
                                  : "bg-highlight/10 text-highlight"
                              )}
                            >
                              {isAdmin ? "Administrateur" : "Client"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={openProfileModal}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-alt"
                        >
                          <UserCircle className="h-4 w-4 text-primary" />
                          Mon profil
                        </button>
                        <button
                          onClick={goToDashboard}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-alt"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          Tableau de bord
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
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
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                aria-label="Se connecter"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}

            {/* Hamburger mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all lg:hidden",
                useTransparentHeader
                  ? "text-white/85 hover:bg-white/10"
                  : "text-foreground/70 hover:bg-surface-alt"
              )}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Espace réservé pour le contenu sous le header fixe */}
      {!isHomePage && <div className="h-[72px] sm:h-[84px]" aria-hidden />}

      {/* Menu mobile slide-over (avec les mêmes liens filtrés) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-80 overflow-y-auto bg-surface-elevated shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu mobile"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <span className="font-display text-lg font-bold">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-alt"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4">
                <ul className="space-y-1">
                  {filteredNavLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          pathname === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-surface-alt"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-border pt-4">
                  <Link
                    href="/favoris"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-alt"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Mes favoris
                  </Link>
                </div>

                {mounted && !isAuthenticated && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    <Link
                      href="/auth/login"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Créer un compte
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de profil */}
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
    </>
  );
}