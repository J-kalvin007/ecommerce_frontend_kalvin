// "use client";

// import { FormEvent, useEffect, useState, useTransition } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { Leaf, Lock, Mail, Sparkles } from "lucide-react";
// import { logoImage } from "@/assets/images";

// function LoginFormSkeleton() {
//   return (
//     <div className="relative w-full max-w-md">
//       <div className="h-[38rem] animate-pulse overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
//         <div className="h-40 bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34]" />
//         <div className="space-y-4 p-8">
//           <div className="h-16 rounded-xl bg-[#f3faf5]" />
//           <div className="h-12 rounded-xl bg-[#fbfcf7]" />
//           <div className="h-12 rounded-xl bg-[#fbfcf7]" />
//           <div className="h-12 rounded-xl bg-[#1f4d3f]/20" />
//         </div>
//       </div>
//     </div>
//   );
// }

// export function LoginForm({
//   redirectPath,
//   embedded = false,
//   onSwitchToRegister,
//   registerHref = "/register",
// }: {
//   redirectPath?: string;
//   embedded?: boolean;
//   onSwitchToRegister?: () => void;
//   registerHref?: string;
// } = {}) {
//   const searchParams = useSearchParams();
//   const session = useAuthSession();
//   const [mounted, setMounted] = useState(false);
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isPending, startTransition] = useTransition();

//   const requestedRedirect = redirectPath ?? searchParams.get("redirect");
//   const sessionExpiredNotice = searchParams.get("reason") === "session-expired";
//   const registrationSuccess = searchParams.get("registered") === "1";

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!mounted || !session || embedded) {
//       return;
//     }

//     if (requestedRedirect) {
//       applyPostLoginRedirect(session, requestedRedirect);
//       return;
//     }

//     applyPostLoginRedirect(session, hasAdminAccess(session) ? "/admin" : "/dashboard");
//   }, [embedded, mounted, requestedRedirect, session]);

//   function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setError(null);

//     startTransition(async () => {
//       try {
//         const newSession = await login(identifier, password);

//         if (embedded) {
//           return;
//         }

//         applyPostLoginRedirect(
//           newSession,
//           requestedRedirect ??
//           (hasAdminAccess(newSession) ? "/admin" : "/dashboard")
//         );
//       } catch (submissionError) {
//         setError(
//           submissionError instanceof Error
//             ? submissionError.message
//             : "Une erreur est survenue pendant la connexion."
//         );
//       }
//     });
//   }

//   if (!mounted) {
//     return <LoginFormSkeleton />;
//   }

//   if (session) {
//     if (embedded) {
//       return null;
//     }

//     const returningToAdmin = requestedRedirect?.startsWith("/admin");

//     return (
//       <div className="relative w-full max-w-md">
//         <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white p-8 text-center shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
//           <p className="text-sm text-[#24573f]">
//             {returningToAdmin || hasAdminAccess(session)
//               ? "Redirection vers le dashboard admin..."
//               : "Redirection vers ton dashboard..."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full max-w-md">
//       <Leaf className="pointer-events-none absolute -left-6 top-8 h-10 w-10 rotate-[-24deg] text-[#1f4d3f]/20" />
//       <Leaf className="pointer-events-none absolute -right-4 bottom-16 h-12 w-12 rotate-[18deg] text-[#8b5e34]/25" />

//       <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white/95 shadow-[0_28px_80px_rgba(24,37,24,0.14)] backdrop-blur-sm">
//         <div className="relative bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34] px-8 py-8 text-center text-white">
//           <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
//           <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
//             <Image src={logoImage} alt="Atelier du Terroir" fill className="object-contain p-2" sizes="64px" />
//           </div>
//           <div className="mx-auto mb-2 flex items-center justify-center gap-2 text-sm text-white/90">
//             {/* <Sparkles className="h-4 w-4" /> */}
//             <span>Connexion securisee</span>
//           </div>
//           <h1 className="text-2xl font-bold">Connexion</h1>
//           <p className="mt-1 text-sm text-white/82">
//             Connectez-vous avec votre email et mot de passe
//           </p>
//         </div>

//         <form className="space-y-5 p-8" onSubmit={handleSubmit}>
//           {registrationSuccess ? (
//             <div className="rounded-xl border border-[#cfe0d4] bg-[#f3faf5] px-4 py-3 text-sm text-[#24573f]">
//               Compte cree avec succes. Connecte-toi avec ton email et ton mot de passe.
//             </div>
//           ) : null}

//           {sessionExpiredNotice ? (
//             <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
//               Votre session a expiré. Reconnectez-vous pour continuer votre commande.
//             </div>
//           ) : null}

//           {/* <div className="rounded-xl border border-[#cfe0d4] bg-[#f3faf5] px-4 py-3 text-sm text-[#24573f]">
//             Connecte-toi avec ton <strong>email</strong> et mot de passe. Compte admin (platform_admin) →{" "}
//             <strong>/admin</strong>. Compte client (customer) → <strong>/dashboard</strong>.
//           </div> */}

//           {error ? (
//             <div className="rounded-xl border border-[#f0b7b7] bg-[#fff4f4] px-4 py-3 text-sm text-[#9a2f2f]">
//               {error}
//             </div>
//           ) : null}

//           <label className="block space-y-2">
//             <span className="text-sm font-medium text-[#2a3528]">Email</span>
//             <div className="relative">
//               <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
//               <input
//                 className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
//                 type="email"
//                 name="email"
//                 value={identifier}
//                 onChange={(event) => setIdentifier(event.target.value)}
//                 autoComplete="email"
//                 placeholder="yan@gmail.com"
//                 required
//               />
//             </div>
//           </label>

//           <label className="block space-y-2">
//             <span className="text-sm font-medium text-[#2a3528]">Mot de passe</span>
//             <div className="relative">
//               <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
//               <input
//                 className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={password}
//                 onChange={(event) => setPassword(event.target.value)}
//                 autoComplete="current-password"
//                 placeholder="Votre mot de passe"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword((current) => !current)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#7c8978] hover:text-[#1f4d3f]"
//               >
//                 {showPassword ? "Masquer" : "Voir"}
//               </button>
//             </div>
//           </label>

//           <button
//             className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f4d3f] to-[#17392f] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.24)] transition hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
//             type="submit"
//             disabled={isPending}
//           >
//             {isPending ? "Connexion en cours..." : "Se connecter"}
//           </button>

//           {onSwitchToRegister ? (
//             <p className="text-center text-sm text-[#667260]">
//               Pas encore de compte ?{" "}
//               <button
//                 type="button"
//                 onClick={onSwitchToRegister}
//                 className="font-semibold text-[#1f4d3f] hover:underline"
//               >
//                 Creer un compte
//               </button>
//             </p>
//           ) : (
//             <p className="text-center text-sm text-[#667260]">
//               Pas encore de compte ?{" "}
//               <Link className="font-semibold text-[#1f4d3f] hover:underline" href={registerHref}>
//                 Creer un compte
//               </Link>
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }


















"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Leaf, Lock, Mail, Sparkles, Star, Truck, ShieldCheck } from "lucide-react";
import { login as loginApi } from "@/fonctions_api/auth.api";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/special/Toast";
import { logoImage } from "@/assets/images";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Squelette pendant le chargement initial                            */
/* ------------------------------------------------------------------ */
function LoginFormSkeleton() {
  return (
    <div className="relative w-full max-w-md">
      <div className="h-[38rem] animate-pulse overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white shadow-[0_28px_80px_rgba(24,37,24,0.14)]">
        <div className="h-40 bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34]" />
        <div className="space-y-4 p-8">
          <div className="h-16 rounded-xl bg-[#f3faf5]" />
          <div className="h-12 rounded-xl bg-[#fbfcf7]" />
          <div className="h-12 rounded-xl bg-[#fbfcf7]" />
          <div className="h-12 rounded-xl bg-[#1f4d3f]/20" />
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

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  // Notices URL
  const requestedRedirect = redirectPath ?? searchParams.get("redirect");
  const sessionExpiredNotice = searchParams.get("reason") === "session-expired";
  const registrationSuccess = searchParams.get("registered") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ══════════════════════════════════════════════════════════════════
  //  Soumission du formulaire (logique métier originale)
  // ══════════════════════════════════════════════════════════════════
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToast({ ...toast, show: false });
    setIsLoading(true);

    // Détermine si l'identifiant est un email ou un username
    const payload = identifier.includes("@")
      ? { email: identifier.trim(), password }
      : { username: identifier.trim(), password };

    const result = await loginApi(payload);

    setIsLoading(false);

    if (!result.ok) {
      const errorData = result.error.raw;
      const errorMessage =
        (Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail) ||
        (Array.isArray(errorData?.non_field_errors)
          ? errorData.non_field_errors[0]
          : errorData?.non_field_errors) ||
        (Array.isArray(errorData?.email) ? errorData.email[0] : errorData?.email) ||
        (Array.isArray(errorData?.username) ? errorData.username[0] : errorData?.username) ||
        result.error.message ||
        "Connexion impossible. Vérifiez vos identifiants.";

      setToast({ show: true, type: "error", message: String(errorMessage) });
      return;
    }

    // Succès : on stocke l'utilisateur et le token dans le store
    setUser(result.data.user, result.data.key);
    setToast({ show: true, type: "success", message: "Connexion réussie !" });

    // Redirection après un court délai (le temps que le toast soit visible)
    const destination =
      requestedRedirect ?? (result.data.user.role === "platform_admin" ? "/admin" : "/dashboard_client");

    setTimeout(() => {
      router.push(destination);
    }, 1000);
  };

  // Squelette avant hydratation
  if (!mounted) {
    return <LoginFormSkeleton />;
  }

  // Si embedded, on n'affiche pas le formulaire en cas de session déjà ouverte ?
  // (comportement conservé de l'original)
  // Mais nous n'avons pas de session active ici car on utilise le store.

  return (
    <>
      {/* Toast pour les notifications */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="relative w-full max-w-md">
        {/* Décorations feuilles */}
        <Leaf className="pointer-events-none absolute -left-6 top-8 h-10 w-10 rotate-[-24deg] text-[#1f4d3f]/20" />
        <Leaf className="pointer-events-none absolute -right-4 bottom-16 h-12 w-12 rotate-[18deg] text-[#8b5e34]/25" />

        <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white/95 shadow-[0_28px_80px_rgba(24,37,24,0.14)] backdrop-blur-sm">
          {/* ---- En-tête dégradé ---- */}
          <div className="relative bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34] px-8 py-8 text-center text-white">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
              <Image
                src={logoImage}
                alt="Atelier du Terroir"
                fill
                className="object-contain p-2"
                sizes="64px"
              />
            </div>
            <div className="mx-auto mb-2 flex items-center justify-center gap-2 text-sm text-white/90">
              {/* <Sparkles className="h-4 w-4" /> */}
              <span>Connexion sécurisée</span>
            </div>
            <h1 className="text-2xl font-bold">Connexion</h1>
            <p className="mt-1 text-sm text-white/82">
              Connectez-vous avec votre email ou nom d'utilisateur
            </p>
          </div>

          {/* ---- Formulaire ---- */}
          <form className="space-y-5 p-8" onSubmit={handleSubmit}>
            {/* Notice inscription réussie */}
            {registrationSuccess && (
              <div className="rounded-xl border border-[#cfe0d4] bg-[#f3faf5] px-4 py-3 text-sm text-[#24573f]">
                Compte créé avec succès. Connecte-toi avec ton email et ton mot de passe.
              </div>
            )}

            {/* Notice session expirée */}
            {sessionExpiredNotice && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Votre session a expiré. Reconnectez-vous pour continuer votre commande.
              </div>
            )}

            {/* Identifiant (email ou username) */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#2a3528]">Email ou identifiant</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
                <input
                  className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="exemple@domaine.com ou pseudo"
                  required
                />
              </div>
            </label>

            {/* Mot de passe avec affichage/masquage */}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#2a3528]">Mot de passe</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978]" />
                <input
                  className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8978] hover:text-[#1f4d3f]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.24)] transition hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)] disabled:cursor-not-allowed disabled:opacity-70",
                isLoading
                  ? "bg-gradient-to-r from-[#1f4d3f] to-[#17392f]"
                  : "bg-gradient-to-r from-[#1f4d3f] to-[#17392f]"
              )}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            {/* Lien vers l'inscription */}
            {onSwitchToRegister ? (
              <p className="text-center text-sm text-[#667260]">
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-semibold text-[#1f4d3f] hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-[#667260]">
                Pas encore de compte ?{" "}
                <Link className="font-semibold text-[#1f4d3f] hover:underline" href={registerHref}>
                  Créer un compte
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}