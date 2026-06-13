// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
// import { confirmPasswordReset } from "@/fonctions_api/auth.api";
// import { cn } from "@/lib/utils";
// import Toast from "@/components/notifications/Toast";

// export default function ResetPasswordConfirmClient() {
//   const searchParams = useSearchParams();
//   const uid = searchParams.get("uid") ?? "";
//   const token = searchParams.get("token") ?? "";

//   const [password1, setPassword1] = useState("");
//   const [password2, setPassword2] = useState("");
//   const [showPassword1, setShowPassword1] = useState(false);
//   const [showPassword2, setShowPassword2] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
//     show: false,
//     type: "info",
//     message: "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setToast({ ...toast, show: false });

//     if (password1 !== password2) {
//       setToast({ show: true, type: "error", message: "Les mots de passe ne correspondent pas." });
//       return;
//     }

//     setIsLoading(true);
//     const result = await confirmPasswordReset({
//       uid,
//       token,
//       new_password1: password1,
//       new_password2: password2,
//     });
    
//     setIsLoading(false);

//     if (!result.ok) {
//       const errorData = result.error.raw;
//       const errorMessage =
//         (Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail) ||
//         (Array.isArray(errorData?.new_password1) ? errorData.new_password1[0] : errorData?.new_password1) ||
//         result.error.message ||
//         "Impossible de reinitialiser le mot de passe.";

//       setToast({ show: true, type: "error", message: String(errorMessage) });
//       return;
//     }

//     setToast({ show: true, type: "success", message: result.data.detail || "Votre mot de passe a ete reinitialise." });
//   };

//   return (
//     <>
//       <Toast 
//         show={toast.show} 
//         type={toast.type} 
//         message={toast.message} 
//         onClose={() => setToast({ ...toast, show: false })} 
//       />
//       <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-16">
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
//         <div className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-highlight/8 blur-3xl" />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.45 }}
//         className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-xl"
//       >
//         <div className="bg-gradient-to-r from-primary to-primary-hover px-8 py-8 text-center text-white">
//           <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
//             <Lock className="h-7 w-7" />
//           </div>
//           <h1 className="font-display text-2xl font-bold">Nouveau mot de passe</h1>
//           <p className="mt-1 text-sm text-white/80">
//             Choisissez un nouveau mot de passe securise
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5 p-8">

//           <div>
//             <label htmlFor="new-password-1" className="mb-1.5 block text-sm font-medium">
//               Nouveau mot de passe
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//               <input
//                 id="new-password-1"
//                 type={showPassword1 ? "text" : "password"}
//                 value={password1}
//                 onChange={(e) => setPassword1(e.target.value)}
//                 required
//                 minLength={8}
//                 className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword1(!showPassword1)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
//               >
//                 {showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label htmlFor="new-password-2" className="mb-1.5 block text-sm font-medium">
//               Confirmer le mot de passe
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//               <input
//                 id="new-password-2"
//                 type={showPassword2 ? "text" : "password"}
//                 value={password2}
//                 onChange={(e) => setPassword2(e.target.value)}
//                 required
//                 minLength={8}
//                 className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword2(!showPassword2)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
//               >
//                 {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading || !uid || !token}
//             className={cn(
//               "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
//               isLoading
//                 ? "cursor-not-allowed bg-primary/70"
//                 : "bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow"
//             )}
//           >
//             {isLoading ? (
//               <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//             ) : (
//               <>
//                 Valider
//                 <ArrowRight className="h-4 w-4" />
//               </>
//             )}
//           </button>

//           <p className="text-center text-sm text-muted">
//             Retour a{" "}
//             <Link href="/auth/login" className="font-semibold text-primary hover:underline">
//               la connexion
//             </Link>
//           </p>
//         </form>
//       </motion.div>
//     </div>
//     </>
//   );
// }



































































"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Leaf, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { confirmPasswordReset } from "@/fonctions_api/auth.api";
import { cn } from "@/lib/utils";
import Toast from "@/components/notifications/Toast";

export default function ResetPasswordConfirmClient() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ ...toast, show: false });

    if (password1 !== password2) {
      setToast({ show: true, type: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }

    setIsLoading(true);
    const result = await confirmPasswordReset({
      uid,
      token,
      new_password1: password1,
      new_password2: password2,
    });

    setIsLoading(false);

    if (!result.ok) {
      const errorData = result.error.raw;
      const errorMessage =
        (Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail) ||
        (Array.isArray(errorData?.new_password1) ? errorData.new_password1[0] : errorData?.new_password1) ||
        result.error.message ||
        "Impossible de réinitialiser le mot de passe.";

      setToast({ show: true, type: "error", message: String(errorMessage) });
      return;
    }

    setToast({
      show: true,
      type: "success",
      message: result.data.detail || "Votre mot de passe a été réinitialisé.",
    });
  };

  const advantages = [
    { icon: Shield, text: "Chiffrement des données" },
    { icon: Sparkles, text: "Mot de passe robuste recommandé" },
    { icon: CheckCircle2, text: "Accès sécurisé à votre compte" },
  ];

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 md:px-6 lg:py-16">
        {/* Décorations de fond */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-highlight/8 blur-3xl" />
          <Leaf className="absolute left-[3%] top-[12%] h-14 w-14 rotate-12 text-primary/20" />
          <Leaf className="absolute bottom-[15%] right-[5%] h-20 w-20 -rotate-45 text-highlight/15" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl"
        >
          <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl">
            <div className="grid md:grid-cols-2">
              {/* ========== COLONNE GAUCHE – BRANDING & AVANTAGES ========== */}
              <div className="relative bg-gradient-to-br from-primary/5 via-highlight/5 to-transparent p-8 md:p-10">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-highlight/20 blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                  {/* Logo + identité */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md dark:bg-surface-alt">
                      <Image
                        src="/assets/images/LOGO.png"
                        alt="L'Atelier du Terroir"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        Atelier du Terroir
                      </h2>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                        Deal & Consulting
                      </p>
                    </div>
                  </div>

                  {/* Accroche */}
                  <div className="mb-6">
                    <h1 className="font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                      Nouveau
                      <span className="text-primary"> mot de passe</span>
                    </h1>
                    <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
                      <div className="h-px w-8 bg-primary/50" />
                      <p className="text-sm font-medium text-muted">
                        Choisissez un mot de passe sécurisé
                      </p>
                    </div>
                  </div>

                  {/* Avantages */}
                  <div className="mt-4 space-y-3">
                    {advantages.map((item, idx) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80">
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Message de sécurité */}
                  <div className="mt-8 rounded-2xl border border-border/50 bg-white/30 p-4 backdrop-blur-sm dark:bg-black/20">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Utilisez au moins 8 caractères
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Mélangez lettres, chiffres et symboles pour plus de sécurité.
                    </p>
                  </div>
                </div>
              </div>

              {/* ========== COLONNE DROITE – FORMULAIRE DE RÉINITIALISATION ========== */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-6 text-center md:text-left">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Lock className="h-3 w-3" />
                    Réinitialisation
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Créez votre nouveau mot de passe</h2>
                  <p className="mt-1 text-sm text-muted">
                    Assurez-vous qu’il soit difficile à deviner.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nouveau mot de passe */}
                  <div>
                    <label htmlFor="new-password-1" className="mb-1.5 block text-sm font-medium text-foreground">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="new-password-1"
                        type={showPassword1 ? "text" : "password"}
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword1(!showPassword1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                      >
                        {showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div>
                    <label htmlFor="new-password-2" className="mb-1.5 block text-sm font-medium text-foreground">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="new-password-2"
                        type={showPassword2 ? "text" : "password"}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                      >
                        {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !uid || !token}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                      isLoading || !uid || !token
                        ? "cursor-not-allowed bg-primary/70"
                        : "bg-gradient-to-r from-primary to-primary/90 hover:shadow-glow hover:scale-[1.02]"
                    )}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Valider
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-muted">
                    Retour à{" "}
                    <Link href="/auth/login" className="font-semibold text-primary transition hover:underline">
                      la connexion
                    </Link>
                  </p>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted">
                  <div className="h-px w-8 bg-border" />
                  <span>Réinitialisation sécurisée</span>
                  <div className="h-px w-8 bg-border" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}