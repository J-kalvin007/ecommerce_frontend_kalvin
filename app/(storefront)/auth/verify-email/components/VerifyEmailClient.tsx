// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import { CheckCircle2, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
// import { resendVerificationEmail, verifyEmail } from "@/fonctions_api/auth.api";
// import { cn } from "@/lib/utils";
// import Toast from "@/components/notifications/Toast";

// export default function VerifyEmailClient() {
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email") ?? "";
//   const key = searchParams.get("key") ?? "";

//   const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
//     key ? "loading" : "idle"
//   );
//   const [message, setMessage] = useState<string>(
//     key
//       ? "Verification de votre email en cours..."
//       : "Nous avons envoye un email de verification. Consultez votre boite mail."
//   );
//   const [resendLoading, setResendLoading] = useState(false);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
//     show: false,
//     type: "info",
//     message: "",
//   });

//   useEffect(() => {
//     if (!key) return;

//     const runVerification = async () => {
//       const result = await verifyEmail({ key });
      
//       if (result.ok) {
//         setStatus("success");
//         setMessage(result.data.detail || "Votre adresse email a bien ete verifiee.");
//       } else {
//         const detail = result.error.raw?.detail;
//         const firstMessage = Array.isArray(detail) ? detail[0] : detail;
//         setStatus("error");
//         setMessage(String(firstMessage || "Impossible de verifier cet email."));
//       }
//     };

//     void runVerification();
//   }, [key]);

//   const handleResend = async () => {
//     if (!email) {
//       setStatus("error");
//       setMessage("Aucune adresse email fournie pour renvoyer la verification.");
//       return;
//     }

//     setToast({ ...toast, show: false });
//     setResendLoading(true);

//     const result = await resendVerificationEmail({ email });
    
//     setResendLoading(false);

//     if (result.ok) {
//       setStatus("success");
//       setMessage(result.data.detail || "Un nouvel email de verification a ete envoye.");
//       setToast({ show: true, type: "success", message: result.data.detail || "Un nouvel email de verification a ete envoye." });
//     } else {
//       const detail = result.error.raw?.detail;
//       const firstMessage = Array.isArray(detail) ? detail[0] : detail;
//       setStatus("error");
//       setMessage(String(firstMessage || "Impossible de renvoyer l'email de verification."));
//       setToast({ show: true, type: "error", message: String(firstMessage || "Impossible de renvoyer l'email de verification.") });
//     }
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
//         className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-xl"
//       >
//         <div className="bg-gradient-to-r from-primary to-primary-hover px-8 py-8 text-center text-white">
//           <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
//             <ShieldCheck className="h-7 w-7" />
//           </div>
//           <h1 className="font-display text-2xl font-bold">Verification email</h1>
//           <p className="mt-1 text-sm text-white/80">
//             Activez votre compte pour continuer sur la plateforme
//           </p>
//         </div>

//         <div className="space-y-6 p-8">
//           <div
//             className={cn(
//               "rounded-2xl border p-5 text-sm leading-7",
//               status === "success" && "border-success/20 bg-success-light text-success",
//               status === "error" && "border-error/20 bg-error-light text-error",
//               (status === "idle" || status === "loading") &&
//                 "border-border bg-surface text-slate-700"
//             )}
//           >
//             <div className="flex items-start gap-3">
//               {status === "loading" ? (
//                 <Loader2 className="mt-0.5 h-5 w-5 animate-spin" />
//               ) : status === "success" ? (
//                 <CheckCircle2 className="mt-0.5 h-5 w-5" />
//               ) : (
//                 <Mail className="mt-0.5 h-5 w-5" />
//               )}
//               <p>{message}</p>
//             </div>
//           </div>

//           {email && (
//             <div className="rounded-2xl border border-border bg-surface p-5">
//               <p className="text-sm font-medium text-slate-900">Adresse concernee</p>
//               <p className="mt-1 text-sm text-muted">{email}</p>
//             </div>
//           )}

//           <div className="flex flex-col gap-3 sm:flex-row">
//             <button
//               type="button"
//               onClick={handleResend}
//               disabled={resendLoading}
//               className={cn(
//                 "inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all",
//                 resendLoading
//                   ? "cursor-not-allowed bg-primary/70"
//                   : "bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow"
//               )}
//             >
//               {resendLoading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <>
//                   <RefreshCw className="h-4 w-4" />
//                   Renvoyer l'email
//                 </>
//               )}
//             </button>

//             <Link
//               href="/auth/login"
//               className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary hover:text-primary"
//             >
//               Aller a la connexion
//             </Link>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//     </>
//   );
// }





































"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, KeyRound, Leaf, Mail, Shield, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Toast from "@/components/notifications/Toast";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [verificationCode, setVerificationCode] = useState("");
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
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setToast({
        show: true,
        type: "error",
        message: "Veuillez saisir un code valide à 6 chiffres.",
      });
      return;
    }

    setIsLoading(true);
    setToast({ ...toast, show: false });

    // Ici, remplacez par votre véritable appel API de vérification
    // Exemple : await verifyEmailApi({ email, code: verificationCode });
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulons un succès
      const success = true;
      if (!success) throw new Error("Code invalide");

      setToast({
        show: true,
        type: "success",
        message: "Votre adresse e-mail a été vérifiée avec succès ! Redirection...",
      });
      setTimeout(() => {
        router.push("/auth/login?verified=1");
      }, 2000);
    } catch (error) {
      setToast({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Code invalide ou expiré. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const advantages = [
    { icon: Shield, text: "Vérification en quelques secondes" },
    { icon: Sparkles, text: "Accès immédiat à votre espace" },
    { icon: CheckCircle2, text: "Sécurité renforcée de votre compte" },
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
              {/* ========== COLONNE GAUCHE – BRANDING & MESSAGES ========== */}
              <div className="relative bg-gradient-to-br from-primary/5 via-highlight/5 to-transparent p-8 md:p-10">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-highlight/20 blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
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

                  <div className="mb-6">
                    <h1 className="font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                      Vérifiez votre
                      <span className="text-primary"> e‑mail</span>
                    </h1>
                    <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
                      <div className="h-px w-8 bg-primary/50" />
                      <p className="text-sm font-medium text-muted">
                        Sécurisez votre accès
                      </p>
                    </div>
                  </div>

                  {/* Liste d'avantages */}
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
                        {email ? (
                          <>Un code a été envoyé à <span className="text-primary">{email}</span></>
                        ) : (
                          "Un code à 6 chiffres vous a été envoyé par e-mail"
                        )}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Si vous ne trouvez pas l’e-mail, pensez à vérifier vos courriers indésirables.
                    </p>
                  </div>
                </div>
              </div>

              {/* ========== COLONNE DROITE – FORMULAIRE DE VÉRIFICATION ========== */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-6 text-center md:text-left">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    <KeyRound className="h-3 w-3" />
                    Code de vérification
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Entrez votre code</h2>
                  <p className="mt-1 text-sm text-muted">
                    Nous avons envoyé un code à 6 chiffres à votre adresse e-mail.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-foreground">
                      Code de vérification
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        required
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-center text-lg font-mono tracking-widest outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      Le code est valable pendant 15 minutes.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                      isLoading || verificationCode.length !== 6
                        ? "cursor-not-allowed bg-primary/70"
                        : "bg-gradient-to-r from-primary to-primary/90 hover:shadow-glow hover:scale-[1.02]"
                    )}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Vérifier mon compte
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href="/auth/resend-code"
                      className="text-xs font-medium text-primary transition hover:underline"
                    >
                      Renvoyer le code
                    </Link>
                  </div>

                  <p className="text-center text-sm text-muted">
                    Vous avez déjà vérifié ?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-primary transition hover:underline"
                    >
                      Se connecter
                    </Link>
                  </p>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted">
                  <div className="h-px w-8 bg-border" />
                  <span>Vérification sécurisée</span>
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