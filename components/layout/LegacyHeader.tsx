




"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/pannierStore";
import { mediaUrl } from "@/lib/mediaUrl";
import ProfileModal from "@/components/layout/ProfileModal";
import LogoutDialog from "@/components/special/LogoutDialog";
import { useThemeStore } from "@/store/theme.store";

/* -------------------------------------------------------------------------- */
/*  Constantes                                                               */
/* -------------------------------------------------------------------------- */

const LOGO_PATH = "/assets/images/LOGO.png";

type NavLink = {
  label: string;
  href: string;
  adminOnly?: boolean;
  hideForAdmin?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/products" },
  // { label: "Promotions", href: "/promotions", hideForAdmin: true },
  { label: "Promotions", href: "/promotions", hideForAdmin: false },
  { label: "À propos", href: "/about" },
  // { label: "Contact", href: "/contact", hideForAdmin: true },
  { label: "Contact", href: "/contact", hideForAdmin: false },
];

const POPULAR_SEARCHES = ["Huile d'olive", "Chocolat", "Épices", "Thé vert"];

/* -------------------------------------------------------------------------- */
/*  Composant Header                                                         */
/* -------------------------------------------------------------------------- */

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  /* --- Stores ------------------------------------------------------------ */
  const { user, status, logout, updateProfile } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);

  /* --- États locaux (logique originale conservée) ------------------------ */
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  /* --- Thème partagé via Zustand (useTheme) ------------------------------ */
  const { resolvedTheme: theme, setTheme } = useThemeStore();
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  /* --- Hydratation ------------------------------------------------------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* --- Détection du scroll (seuil identique à l’original) --------------- */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* --- Fermeture des menus au clic extérieur ---------------------------- */
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

  /* --- Fermeture des menus au changement de route ----------------------- */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  /* --- Dérivés de l’état ------------------------------------------------- */
  const isAuthenticated = status === "authenticated" && user;
  const isAdmin = user?.role === "platform_admin";
  const isHomePage = pathname === "/";
  const useTransparentHeader = isHomePage && !isScrolled;
  const heroStyle = useTransparentHeader; // alias pour lisibilité

  // Filtrage des liens selon le rôle (identique à l’original)
  const filteredNavLinks = NAV_LINKS.filter((link) => {
    if (isAdmin && link.hideForAdmin) return false;
    return true;
  });

  // Nom affiché dans le bouton profil (conforme au visuel Legacy)
  const getDisplayName = () => {
    if (!user?.name) return "Mon compte";
    return user.name.split(" ")[0];
  };

  // Initiales pour l’avatar fallback
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /* --- Gestionnaires (logique originale) --------------------------------- */
  const handleLogoutClick = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
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

  /* ------------------------------------------------------------------------ */
  /*  Rendu                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <>
      {/* Header principal */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          heroStyle
            ? "bg-transparent"
            : "border-b border-[#e8d9c5] bg-white/88 shadow-[0_14px_34px_rgba(34,27,18,0.08)] backdrop-blur-xl",
          // Variante sombre pour le thème dark (adaptation fidèle au design)
          !heroStyle && "dark:border-[#3a352a] dark:bg-[#1e1b15]/90 dark:shadow-[0_14px_34px_rgba(0,0,0,0.4)]"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* ---- Logo + Titre ---- */}
          <Link
            href="/"
            className={cn(
              "flex items-center cursor-pointer gap-3 rounded-full px-3 py-2 transition-colors",
              heroStyle && "bg-white/14 backdrop-blur-md"
            )}
          >
            <div className="overflow-hidden rounded-full bg-white shadow-lg">
              <Image
                src={LOGO_PATH}
                alt="Logo L'Atelier du Terroir"
                width={52}
                height={52}
                className="h-12 w-12 object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p
                className={cn(
                  "text-lg font-semibold",
                  heroStyle ? "text-white" : "text-[#184126] dark:text-[#d1cbb7]"
                )}
              >
                Atelier du Terroir
              </p>
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.22em]",
                  heroStyle ? "text-white/75" : "text-[#5c6a59] dark:text-[#9b8e7a]"
                )}
              >
                Deal and Consulting
              </p>
            </div>
          </Link>

          {/* ---- Navigation desktop (liens filtrés) ---- */}
          <nav className="hidden items-center gap-1 lg:flex">
            {filteredNavLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full cursor-pointer px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#ef8219] text-white shadow-sm dark:bg-[#d86d14]"
                      : heroStyle
                        ? "text-white/86 hover:bg-white/12 hover:text-white"
                        : "text-[#52604e] hover:bg-[#f5ecdf]/60 hover:text-[#8b5e34] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/60 dark:hover:text-[#d6c9a8]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ---- Actions droite ---- */}
          <div className="flex items-center gap-2">
            {/* Bouton de thème (conservé et stylé comme les autres boutons) */}
            <button
              onClick={toggleTheme}
              className={cn(
                "inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full transition-colors",
                heroStyle
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60 dark:border-[#4a4032] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/60"
              )}
              aria-label="Changer de thème"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Recherche (visible sm+) */}
            <div ref={searchRef} className="relative hidden sm:block">
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className={cn(
                  "inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full transition-colors",
                  heroStyle
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60 dark:border-[#4a4032] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/60"
                )}
                aria-label="Rechercher"
              >
                <Search className="h-4 w-4" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl border border-[#eadcca] bg-white p-3 shadow-xl dark:border-[#4a4032] dark:bg-[#1e1b15]">
                  <div className="flex items-center gap-2 rounded-xl bg-[#f7f3eb] px-3 py-2 dark:bg-[#2d281d]">
                    <Search className="h-4 w-4 text-[#8b5e34] dark:text-[#b3975c]" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 cursor-pointer bg-transparent text-sm outline-none dark:text-[#d1cbb7] placeholder:text-[#9b8e7a]"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-muted cursor-pointer hover:text-foreground dark:text-[#9b8e7a]"
                        aria-label="Effacer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="px-2 text-xs font-medium uppercase tracking-wider text-[#8b5e34] dark:text-[#b3975c]">
                      Recherches populaires
                    </p>
                    {POPULAR_SEARCHES.map((term) => (
                      <Link
                        key={term}
                        href={`/products?search=${encodeURIComponent(term)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#52604e] hover:bg-[#f5ecdf] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]"
                      >
                        <Search className="h-3.5 w-3.5" />
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favoris — visible uniquement pour les utilisateurs authentifiés */}
            {mounted && isAuthenticated && (
              <Link
                href="/favoris"
                className={cn(
                  "hidden cursor-pointer h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex",
                  heroStyle
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60 dark:border-[#4a4032] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/60"
                )}
                aria-label="Mes favoris"
              >
                <Heart className="h-4 w-4" />
              </Link>
            )}

            {/* Panier */}
            <button
              onClick={() => toggleDrawer(true)}
              className={cn(
                "relative inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full transition-colors",
                heroStyle
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60 dark:border-[#4a4032] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/60"
              )}
              aria-label={`Panier (${mounted ? itemCount : 0} articles)`}
            >
              <ShoppingBag className="h-4 w-4" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef8219] px-1 text-[10px] font-bold text-white dark:bg-[#d86d14]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Profil / Connexion */}
            {mounted && isAuthenticated ? (
              <div ref={dropdownRef} className="relative hidden md:block">
                <button
                  onClick={() => setIsProfileDropdownOpen((v) => !v)}
                  className={cn(
                    "flex items-center cursor-pointer gap-2 rounded-full px-2.5 py-1.5 transition-colors",
                    heroStyle
                      ? "border border-white/25 bg-white/10 backdrop-blur-sm"
                      : "border border-[#d8c4ab] bg-white dark:border-[#4a4032] dark:bg-[#1e1b15]"
                  )}
                >
                  {/* Avatar image ou initiales */}
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#1f4d3f] text-sm font-bold text-white dark:bg-[#2d5a4b]">
                    {user?.profile_image ? (
                      <img
                        src={mediaUrl(user.profile_image) || ''}
                        alt={user.name || "Avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(user?.name || "U")
                    )}
                  </div>
                  <span
                    className={cn(
                      "max-w-[120px] truncate text-sm font-semibold",
                      heroStyle ? "text-white" : "text-[#1f4d3f] dark:text-[#d1cbb7]"
                    )}
                  >
                    {getDisplayName()}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      heroStyle ? "text-white/80" : "text-[#8b5e34] dark:text-[#b3975c]",
                      isProfileDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#eadcca] bg-white shadow-xl dark:border-[#4a4032] dark:bg-[#1e1b15]">
                    {/* En-tête du dropdown */}
                    <div className="border-b border-[#eadcca] bg-[#f7f3eb] p-4 dark:border-[#4a4032] dark:bg-[#2d281d]">
                      <p className="text-sm font-semibold text-[#1f241c] dark:text-[#d1cbb7]">
                        {user?.name || "Mon compte"}
                      </p>
                      <p className="text-xs text-[#5c6a59] dark:text-[#9b8e7a]">
                        {user?.email}
                      </p>
                    </div>

                    {/* Actions (conservées depuis l'original) */}
                    <div className="p-2">
                      <button
                        onClick={openProfileModal}
                        className="flex w- cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#52604e] hover:bg-[#f5ecdf] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]"
                      >
                        <User className="h-4 w-4 text-[#8b5e34] dark:text-[#b3975c]" />
                        Mon profil
                      </button>
                      <button
                        onClick={goToDashboard}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#52604e] hover:bg-[#f5ecdf] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]"
                      >
                        <ChevronDown className="h-4 w-4 rotate-[-90deg] text-[#8b5e34] dark:text-[#b3975c]" />
                        Tableau de bord
                      </button>
                    </div>

                    {/* Déconnexion */}
                    <div className="border-t border-[#eadcca] p-2 dark:border-[#4a4032]">
                      <button
                        onClick={handleLogoutClick}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden cursor-pointer rounded-full bg-[#ef8219] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d86d14] sm:inline-flex dark:bg-[#d86d14] dark:hover:bg-[#b85c10]"
              >
                Connexion
              </Link>
            )}

            {/* Hamburger mobile */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className={cn(
                "inline-flex cursor-pointer h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
                heroStyle
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : "border border-[#e0cfb9]/70 text-[#52604e] hover:bg-[#f5ecdf]/60 dark:border-[#4a4032] dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/60"
              )}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Espace réservé sous le header fixe (hauteur originale) */}
      {!isHomePage && <div className="h-[72px] sm:h-[84px]" aria-hidden />}

      {/* Menu mobile (design Legacy, logique originale) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <button
            className="absolute cursor-pointer inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-label="Fermer le menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Panneau */}
          <div className="absolute right-0 top-0 flex h-full w-[300px] flex-col overflow-y-auto bg-[#fffaf2] p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:bg-[#1e1b15]">
            <div className="flex shrink-0 items-center justify-between">
              <p className="text-lg font-semibold text-[#1f241c] dark:text-[#d1cbb7]">Menu de navigation</p>
              <button
                className="rounded-full cursor-pointer border border-[#e3d5c2] px-2 py-2 text-sm text-[#5c6a59] transition-colors hover:bg-black/5 dark:border-[#4a4032] dark:text-[#9b8e7a] dark:hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Liens principaux filtrés */}
            <div className="mt-8 flex-1 space-y-2">
              {filteredNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-xl cursor-pointer px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-[#1f4d3f] text-white shadow-md dark:bg-[#2d5a4b]"
                        : "bg-white text-[#4f5e4a] hover:scale-[1.02] hover:bg-[#f5ecdf] dark:bg-[#2d281d] dark:text-[#b8ad8f] dark:hover:bg-[#3a352a]"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {/* Favoris (mobile) — visible uniquement pour les utilisateurs authentifiés */}
              {mounted && isAuthenticated && (
                <Link
                  href="/favoris"
                  className="block rounded-xl cursor-pointer bg-white px-4 py-3.5 text-sm font-semibold text-[#4f5e4a] transition-all duration-200 hover:scale-[1.02] hover:bg-[#f5ecdf] dark:bg-[#2d281d] dark:text-[#b8ad8f] dark:hover:bg-[#3a352a]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mes favoris
                </Link>
              )}
            </div>

            {/* Section utilisateur (conditionnelle) */}
            <div className="mt-8 shrink-0 space-y-3 border-t border-[#eadcca] pt-6 dark:border-[#4a4032]">
              {mounted && isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openProfileModal();
                    }}
                    className="block w-full cursor-pointer rounded-xl border border-[#d8c4ab] bg-white px-4 py-3.5 text-sm font-bold text-[#1f4d3f] shadow-sm transition-all duration-200 hover:bg-[#f5ecdf] dark:border-[#4a4032] dark:bg-[#2d281d] dark:text-[#d1cbb7] dark:hover:bg-[#3a352a]"
                  >
                    Mon profil
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      goToDashboard();
                    }}
                    className="block w-full cursor-pointer rounded-xl border border-[#d8c4ab] bg-white px-4 py-3.5 text-sm font-bold text-[#1f4d3f] shadow-sm transition-all duration-200 hover:bg-[#f5ecdf] dark:border-[#4a4032] dark:bg-[#2d281d] dark:text-[#d1cbb7] dark:hover:bg-[#3a352a]"
                  >
                    Tableau de bord
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full cursor-pointer rounded-xl bg-[#ef8219] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#d86d14] dark:bg-[#d86d14] dark:hover:bg-[#b85c10]"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block cursor-pointer rounded-xl border border-[#d8c4ab] bg-white px-4 py-3.5 text-center text-sm font-bold text-[#1f4d3f] shadow-sm transition-all duration-200 hover:bg-[#f5ecdf] dark:border-[#4a4032] dark:bg-[#2d281d] dark:text-[#d1cbb7] dark:hover:bg-[#3a352a]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block cursor-pointer rounded-xl bg-[#ef8219] px-4 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#d86d14] dark:bg-[#d86d14] dark:hover:bg-[#b85c10]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de profil (identique à l’original) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={user}
        onLogout={() => {
          setIsProfileModalOpen(false);
          handleLogoutClick();
        }}
        onProfileUpdate={updateProfile}
      />

      <LogoutDialog
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}