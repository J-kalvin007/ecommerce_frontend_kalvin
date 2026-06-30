



"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  Star,
  Truck,
  UserCheck,
} from "lucide-react";
import { login as loginApi } from "@/fonctions_api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { getLoginError } from "@/lib/auth-errors";
import Toast from "@/components/special/Toast";
import { VerifyEmailModal } from "@/app/auth/components/VerifyEmailModal";
import { logoImage } from "@/assets/images";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Signature visuelle — un rameau d'olivier tracé à l'ouverture       */
/*  C'est l'unique geste graphique fort de la page : tout le reste     */
/*  reste sobre pour le laisser respirer.                              */
/* ------------------------------------------------------------------ */
function OliveBranchMark() {
  const leaves = [
    { d: "M118 236 Q 100 220 72 224 Q 96 240 118 236 Z", delay: 0.55 },
    { d: "M116 214 Q 136 199 162 206 Q 140 219 116 214 Z", delay: 0.65 },
    { d: "M113 188 Q 95 174 68 180 Q 92 193 113 188 Z", delay: 0.75 },
    { d: "M111 162 Q 131 149 156 156 Q 134 167 111 162 Z", delay: 0.85 },
    { d: "M108 136 Q 90 123 64 129 Q 87 141 108 136 Z", delay: 0.95 },
    { d: "M106 110 Q 126 98 150 104 Q 128 114 106 110 Z", delay: 1.05 },
    { d: "M101 86 Q 84 75 60 81 Q 82 92 101 86 Z", delay: 1.15 },
  ];

  return (
    <svg
      viewBox="0 0 220 260"
      className="h-full w-full"
      aria-hidden="true"
    >
      <motion.path
        d="M120 256 C114 200 122 150 112 98 C105 66 86 44 58 30"
        stroke="#d8c4ab"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{ duration: 1.5, ease: EASE }}
      />
      {leaves.map((leaf, i) => (
        <motion.path
          key={i}
          d={leaf.d}
          fill="#d8c4ab"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ duration: 0.5, delay: leaf.delay, ease: EASE }}
          style={{ transformOrigin: "center" }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Squelette pendant le chargement initial                            */
/* ------------------------------------------------------------------ */
function LoginFormSkeleton() {
  return (
    <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#e3e0d4] bg-white shadow-[0_30px_90px_rgba(24,37,24,0.12)]">
      <div className="grid md:grid-cols-[1fr_1.2fr]">
        <div className="hidden animate-pulse bg-[#1f4d3f]/90 md:block" />
        <div className="space-y-4 p-10">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[#eef1e9]" />
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[#eef1e9]" />
          <div className="h-11 animate-pulse rounded-lg bg-[#f6f7f2]" />
          <div className="h-11 animate-pulse rounded-lg bg-[#f6f7f2]" />
          <div className="h-12 animate-pulse rounded-full bg-[#1f4d3f]/20" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                               */
/* ------------------------------------------------------------------ */
export function LoginForm({
  redirectPath,
  embedded = false,
  onSwitchToRegister,
  registerHref = "/auth/register",
}: {
  redirectPath?: string;
  embedded?: boolean;
  onSwitchToRegister?: () => void;
  registerHref?: string;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const [mounted, setMounted] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"identifier" | "password" | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const [verifyModal, setVerifyModal] = useState<{ show: boolean; email: string }>({ show: false, email: "" });

  // Notices URL
  const requestedRedirect = redirectPath ?? searchParams.get("redirect");
  const sessionExpiredNotice = searchParams.get("reason") === "session-expired";
  const registrationSuccess = searchParams.get("registered") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ══════════════════════════════════════════════════════════════════
  //  Soumission du formulaire (logique métier originale, inchangée)
  // ══════════════════════════════════════════════════════════════════
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToast({ ...toast, show: false });
    setIsLoading(true);

    const payload = identifier.includes("@")
      ? { email: identifier.trim(), password }
      : { username: identifier.trim(), password };

    const result = await loginApi(payload);

    setIsLoading(false);

    if (!result.ok) {
      const finalMessage = getLoginError(
        result.error?.raw,
        result.error?.status
      );
      setToast({ show: true, type: "error", message: finalMessage });
      return;
    }

    if (result.data.user && result.data.user.is_verified === false) {
      setVerifyModal({ show: true, email: result.data.user.email });
      return;
    }

    setUser(result.data.user, result.data.key);
    setToast({ show: true, type: "success", message: "Connexion réussie !" });

    const destination =
      requestedRedirect ?? (result.data.user.role === "platform_admin" ? "/admin" : "/products");

    setTimeout(() => {
      router.push(destination);
    }, 1000);
  };

  if (!mounted) {
    return <LoginFormSkeleton />;
  }

  const atouts = [
    { icon: Leaf, text: "Produits 100% naturels et locaux" },
    { icon: Star, text: "Qualité premium sélectionnée avec soin" },
    { icon: Truck, text: "Livraison rapide et traçabilité" },
  ];

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <VerifyEmailModal
        isOpen={verifyModal.show}
        email={verifyModal.email}
        onClose={() => setVerifyModal({ show: false, email: "" })}
      />

      <div className="flex min-h-screen w-full items-center justify-center bg-[#F0EDE6] p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_rgba(15,45,32,0.18)]"
          style={{ minHeight: 540 }}
        >
          <div className="grid overflow-hidden md:grid-cols-[1fr_1.2fr]">
            {/* ============================================================ */}
            {/*  PANNEAU GAUCHE — identité & promesse de marque                */}
            {/* ============================================================ */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#16332b] via-[#1f4d3f] to-[#27433a] p-10 text-white md:flex md:flex-col md:justify-between">
              {/* lueurs ambiantes */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#d8c4ab]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

              {/* signature botanique, ancrée en bas-droite, discrète */}
              <div className="pointer-events-none absolute -bottom-6 right-0 h-72 w-56 opacity-90">
                <OliveBranchMark />
              </div>

              {/* en-tête : marque */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                  className="flex items-center gap-3"
                >
                  <div className="relative flex h-18 w-18 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10">
                    <Image src={logoImage} alt="Atelier du Terroir" fill className="object-contain p-2" sizes="44px" />
                  </div>
                  <div>
                    <p className="font-display text-base text-[20px] font-semibold leading-tight">Atelier du Terroir</p>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                      Épicerie fine &amp; terroir
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
                  className="mt-14"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d8c4ab]">Bon retour</p>
                  <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.12] text-white">
                    Retrouvez le goût
                    <br />
                    de <span className="text-[#d8c4ab]">l&rsquo;authentique.</span>
                  </h1>
                  <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-white/65">
                    Connectez-vous pour suivre vos commandes, retrouver vos produits favoris et
                    profiter d&rsquo;une expérience pensée pour les amateurs de belles choses.
                  </p>
                </motion.div>
              </div>

              {/* atouts */}
              <div className="relative z-10 mt-12 space-y-4">
                {atouts.map((item, idx) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 + idx * 0.1, ease: EASE }}
                    className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-none"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-[#d8c4ab]" strokeWidth={1.6} />
                    <span className="text-[13px] font-medium text-white/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* témoignage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="relative z-10 mt-10 border-l-2 border-[#d8c4ab]/40 pl-4"
              >
                <p className="font-display text-[15px] italic leading-relaxed text-white/85">
                  « Une connexion simple, sécurisée, pour retrouver mes produits préférés en
                  quelques secondes. »
                </p>
                {/* <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-white/45">
                  Mariam K. — cliente fidèle
                </p> */}
              </motion.div>
            </div>

            {/* ============================================================ */}
            {/*  PANNEAU DROIT — formulaire                                    */}
            {/* ============================================================ */}
            <div className="flex flex-col justify-center bg-[#fdfcf8] px-8 py-10 sm:px-12 md:px-14">
              {/* logo mobile uniquement */}
              <div className="mb-6 flex items-center gap-3 md:hidden">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#1f4d3f]/10">
                  <Image src={logoImage} alt="Atelier du Terroir" fill className="object-contain p-2" sizes="40px" />
                </div>
                <p className="font-display text-sm font-semibold text-[#1f4d3f]">Atelier du Terroir</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f4d3f]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1f4d3f]">
                  <UserCheck className="h-3 w-3" />
                  Accès membre
                </span>
                <h2 className="mt-3 font-display text-[1.9rem] font-semibold text-[#1c241b]">Bienvenue...</h2>
                <p className="mt-1 text-sm text-[#7c8978]">
                  Connectez-vous avec votre email ou nom d&rsquo;utilisateur
                </p>
              </motion.div>

              {/* Notices */}
              {registrationSuccess && (
                <div className="mb-5 rounded-xl border border-[#cfe0d4] bg-[#f3faf5] px-4 py-3 text-sm text-[#24573f]">
                  Compte créé avec succès. Connecte-toi avec ton email et ton mot de passe.
                </div>
              )}
              {sessionExpiredNotice && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Votre session a expiré. Reconnectez-vous pour continuer votre commande.
                </div>
              )}

              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
                className="space-y-7"
                onSubmit={handleSubmit}
              >
                {/* Identifiant */}
                <label className="block">
                  <span
                    className={cn(
                      "mb-2 block text-xs font-semibold uppercase tracking-wider transition-colors",
                      focusedField === "identifier" ? "text-[#1f4d3f]" : "text-[#9aa493]"
                    )}
                  >
                    Email ou identifiant
                  </span>
                  <div className="group relative flex items-center gap-3 border-b border-[#d7ddcf] pb-2.5 transition-colors focus-within:border-[#1f4d3f]">
                    <Mail
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        focusedField === "identifier" ? "text-[#1f4d3f]" : "text-[#a8b29f]"
                      )}
                    />
                    <input
                      className="w-full bg-transparent text-[15px] text-[#1c241b] outline-none placeholder:text-[#b6bdae]"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onFocus={() => setFocusedField("identifier")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="votre-email@gmail.com ou pseudo"
                      required
                    />
                  </div>
                </label>

                {/* Mot de passe */}
                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider transition-colors",
                        focusedField === "password" ? "text-[#1f4d3f]" : "text-[#9aa493]"
                      )}
                    >
                      Mot de passe
                    </span>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-[#8b5e34] transition hover:text-[#1f4d3f] hover:underline"
                    >
                      Mot de passe oublié&nbsp;?
                    </Link>
                  </div>
                  <div className="group relative flex items-center gap-3 border-b border-[#d7ddcf] pb-2.5 transition-colors focus-within:border-[#1f4d3f]">
                    <Lock
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        focusedField === "password" ? "text-[#1f4d3f]" : "text-[#a8b29f]"
                      )}
                    />
                    <input
                      className="w-full bg-transparent text-[15px] text-[#1c241b] outline-none placeholder:text-[#b6bdae]"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-[#a8b29f] transition cursor-pointer hover:text-[#1f4d3f]"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {/* Bouton de connexion */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.015 } : undefined}
                  whileTap={!isLoading ? { scale: 0.98 } : undefined}
                  className={cn(
                    "flex w-full items-center cursor-pointer justify-center gap-2 rounded-full bg-[#1f4d3f] py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.26)] transition-shadow",
                    isLoading
                      ? "cursor-not-allowed opacity-70"
                      : "hover:bg-[#173a30] hover:shadow-[0_20px_42px_rgba(31,77,63,0.32)]"
                  )}
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Connexion en cours…
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                {/* Lien vers l'inscription */}
                {onSwitchToRegister ? (
                  <p className="text-center text-sm text-[#7c8978]">
                    Pas encore de compte&nbsp;?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="font-semibold cursor-pointer text-[#1f4d3f] hover:underline"
                    >
                      Créer un compte
                    </button>
                  </p>
                ) : (
                  <p className="text-center text-sm text-[#7c8978]">
                    Pas encore de compte&nbsp;?{" "}
                    <Link className="font-semibold text-[#1f4d3f] cursor-pointer hover:underline" href={registerHref}>
                      Créer un compte
                    </Link>
                  </p>
                )}
              </motion.form>

              <div className="mt-8 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-xs text-[#9aa493]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Connexion sécurisée</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-wide text-[#8a9685]">
                  <Link href="/auth/forgot-password" className="hover:text-[#1f4d3f] cursor-pointer hover:underline transition-colors">Mot de passe oublié</Link>
                  <span>&bull;</span>
                  <Link href="/auth/verify-email" className="hover:text-[#1f4d3f] cursor-pointer hover:underline transition-colors">Vérifier mon email</Link>
                  <span>&bull;</span>
                  <Link href="/auth/reset-password-confirm" className="hover:text-[#1f4d3f] cursor-pointer hover:underline transition-colors">Confirmer mot de passe</Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}