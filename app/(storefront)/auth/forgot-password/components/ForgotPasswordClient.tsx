// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { ArrowRight, Mail, RefreshCw } from "lucide-react";
// import { requestPasswordReset } from "@/fonctions_api/auth.api";
// import { cn } from "@/lib/utils";
// import Toast from "@/components/notifications/Toast";

// export default function ForgotPasswordClient() {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
//     show: false,
//     type: "info",
//     message: "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setToast({ ...toast, show: false });
//     setIsLoading(true);

//     const result = await requestPasswordReset({ email });
    
//     setIsLoading(false);

//     if (!result.ok) {
//       const errorData = result.error.raw;
//       const errorMessage =
//         (Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail) ||
//         (Array.isArray(errorData?.email) ? errorData.email[0] : errorData?.email) ||
//         result.error.message ||
//         "Impossible d'envoyer l'email.";

//       setToast({ show: true, type: "error", message: String(errorMessage) });
//       return;
//     }

//     setToast({ show: true, type: "success", message: result.data.detail || "Un email de reinitialisation a ete envoye." });
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
//             <RefreshCw className="h-7 w-7" />
//           </div>
//           <h1 className="font-display text-2xl font-bold">Mot de passe oublie</h1>
//           <p className="mt-1 text-sm text-white/80">
//             Recevez un lien pour reinitialiser votre mot de passe
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5 p-8">

//           <div>
//             <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium">
//               Adresse email
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//               <input
//                 id="forgot-email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="nom@email.com"
//                 required
//                 className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
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
//                 Envoyer le lien
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
import { motion } from "framer-motion";
import { ArrowRight, Mail, RefreshCw, Leaf, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/fonctions_api/auth.api";
import { cn } from "@/lib/utils";
import Toast from "@/components/notifications/Toast";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
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
    setIsLoading(true);

    const result = await requestPasswordReset({ email });

    setIsLoading(false);

    if (!result.ok) {
      const errorData = result.error.raw;
      const errorMessage =
        (Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail) ||
        (Array.isArray(errorData?.email) ? errorData.email[0] : errorData?.email) ||
        result.error.message ||
        "Impossible d'envoyer l'email.";

      setToast({ show: true, type: "error", message: String(errorMessage) });
      return;
    }

    setToast({
      show: true,
      type: "success",
      message: result.data.detail || "Un email de réinitialisation a été envoyé.",
    });
  };

  const advantages = [
    { icon: Shield, text: "Réinitialisation sécurisée" },
    { icon: Sparkles, text: "Lien valable 1 heure" },
    { icon: CheckCircle2, text: "Retrouvez l'accès à votre compte" },
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
        {/* Décorations de fond premium */}
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
              {/* ========== COLONNE GAUCHE – BRANDING & MESSAGES ========== */}
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

                  {/* Accroche principale */}
                  <div className="mb-6">
                    <h1 className="font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                      Mot de passe
                      <span className="text-primary"> oublié ?</span>
                    </h1>
                    <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
                      <div className="h-px w-8 bg-primary/50" />
                      <p className="text-sm font-medium text-muted">
                        Réinitialisez-le en toute sécurité
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

                  {/* Encart informatif */}
                  <div className="mt-8 rounded-2xl border border-border/50 bg-white/30 p-4 backdrop-blur-sm dark:bg-black/20">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Un lien vous sera envoyé par e-mail
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pensez à vérifier vos spams si vous ne recevez rien dans les minutes qui suivent.
                    </p>
                  </div>
                </div>
              </div>

              {/* ========== COLONNE DROITE – FORMULAIRE ========== */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-6 text-center md:text-left">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    <RefreshCw className="h-3 w-3" />
                    Réinitialisation
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Entrez votre email</h2>
                  <p className="mt-1 text-sm text-muted">
                    Nous vous enverrons un lien pour créer un nouveau mot de passe.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        required
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                      isLoading
                        ? "cursor-not-allowed bg-primary/70"
                        : "bg-gradient-to-r from-primary to-primary/90 hover:shadow-glow hover:scale-[1.02]"
                    )}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Envoyer le lien
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
                  <span>Procédure sécurisée</span>
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