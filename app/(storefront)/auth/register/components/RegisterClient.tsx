// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { ArrowRight, Eye, EyeOff, Gift, Lock, Mail, User } from "lucide-react";
// import { register as registerApi } from "@/fonctions_api/auth.api";
// import { cn } from "@/lib/utils";
// import Toast from "@/components/notifications/Toast";

// type FieldErrors = {
//   username?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
// };

// function getFirstMessage(value: string | string[] | undefined) {
//   return Array.isArray(value) ? value[0] : value;
// }

// export default function RegisterClient() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
//     show: false,
//     type: "info",
//     message: "",
//   });
//   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

//   const updateField = (field: keyof typeof formData, value: string) =>
//     setFormData((prev) => ({ ...prev, [field]: value }));

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setToast({ ...toast, show: false });
//     setFieldErrors({});

//     if (formData.password !== formData.confirmPassword) {
//       const message = "Les mots de passe ne correspondent pas.";
//       setFieldErrors({ confirmPassword: message });
//       setToast({ show: true, type: "error", message });
//       return;
//     }

//     setIsLoading(true);

//     const result = await registerApi({
//       name: formData.username.trim(), // The backend expects 'name' based on the RegisterRequest interface
//       email: formData.email.trim(),
//       password1: formData.password,
//       password2: formData.confirmPassword,
//     });

//     setIsLoading(false);

//     if (!result.ok) {
//       const errorData = result.error.raw;
//       console.error("Registration error payload:", errorData);

//       if (errorData) {
//         const nextFieldErrors: FieldErrors = {
//           username: getFirstMessage(errorData.name) || getFirstMessage(errorData.username),
//           email: getFirstMessage(errorData.email),
//           password: getFirstMessage(errorData.password1) || getFirstMessage(errorData.password),
//         };

//         setFieldErrors(nextFieldErrors);

//         const firstError =
//           getFirstMessage(errorData.detail) ||
//           getFirstMessage(errorData.non_field_errors) ||
//           getFirstMessage(errorData.name) ||
//           getFirstMessage(errorData.username) ||
//           getFirstMessage(errorData.email) ||
//           getFirstMessage(errorData.password1) ||
//           getFirstMessage(errorData.password) ||
//           "Une erreur est survenue pendant l'inscription.";

//         setToast({ show: true, type: "error", message: String(firstError) });
//       } else {
//         setToast({
//           show: true,
//           type: "error",
//           message: result.error.message || "Une erreur est survenue pendant l'inscription.",
//         });
//       }
//       return;
//     }

//     setToast({ show: true, type: "success", message: "Inscription réussie ! Redirection..." });
//     setTimeout(() => {
//       router.push(`/auth/login?registered=1&email=${encodeURIComponent(formData.email.trim())}`);
//     }, 1500);
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
//         className="relative w-full max-w-md"
//       >
//         <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-xl">
//           <div className="bg-gradient-to-r from-primary to-highlight px-8 py-8 text-center text-white">
//             <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
//               <Gift className="h-7 w-7" />
//             </div>
//             <h1 className="font-display text-2xl font-bold">Creer un compte</h1>
//             <p className="mt-1 text-sm text-white/80">
//               Inscription conforme a l&apos;API Django
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4 p-8">

//             <div>
//               <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
//                 Username
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//                 <input
//                   id="username"
//                   type="text"
//                   value={formData.username}
//                   onChange={(e) => updateField("username", e.target.value)}
//                   placeholder="Votre username"
//                   required
//                   className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//                 />
//               </div>
//               {fieldErrors.username && (
//                 <p className="mt-1 text-xs text-error">{fieldErrors.username}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
//                 Adresse email
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//                 <input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => updateField("email", e.target.value)}
//                   placeholder="nom@email.com"
//                   required
//                   className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//                 />
//               </div>
//               {fieldErrors.email && (
//                 <p className="mt-1 text-xs text-error">{fieldErrors.email}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
//                 Mot de passe
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={(e) => updateField("password", e.target.value)}
//                   placeholder="Votre mot de passe"
//                   required
//                   minLength={8}
//                   className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </button>
//               </div>
//               {fieldErrors.password && (
//                 <p className="mt-1 text-xs text-error">{fieldErrors.password}</p>
//               )}
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
//                 Confirmer le mot de passe
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//                 <input
//                   id="confirmPassword"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.confirmPassword}
//                   onChange={(e) => updateField("confirmPassword", e.target.value)}
//                   placeholder="Retapez votre mot de passe"
//                   required
//                   minLength={8}
//                   className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
//                 />
//                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </div>
//               </div>
//               {fieldErrors.confirmPassword && (
//                 <p className="mt-1 text-xs text-error">{fieldErrors.confirmPassword}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className={cn(
//                 "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
//                 isLoading
//                   ? "cursor-not-allowed bg-primary/70"
//                   : "bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow"
//               )}
//             >
//               {isLoading ? (
//                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//               ) : (
//                 <>
//                   Creer mon compte
//                   <ArrowRight className="h-4 w-4" />
//                 </>
//               )}
//             </button>

//             <p className="text-center text-sm text-muted">
//               Deja un compte ?{" "}
//               <Link href="/auth/login" className="font-semibold text-primary hover:underline">
//                 Se connecter
//               </Link>
//             </p>
//           </form>
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
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  User,
  Leaf,
  Heart,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { register as registerApi } from "@/fonctions_api/auth.api";
import { cn } from "@/lib/utils";
import Toast from "@/components/notifications/Toast";

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function getFirstMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function RegisterClient() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const updateField = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ ...toast, show: false });
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      const message = "Les mots de passe ne correspondent pas.";
      setFieldErrors({ confirmPassword: message });
      setToast({ show: true, type: "error", message });
      return;
    }

    setIsLoading(true);

    const result = await registerApi({
      name: formData.username.trim(),
      email: formData.email.trim(),
      password1: formData.password,
      password2: formData.confirmPassword,
    });

    setIsLoading(false);

    if (!result.ok) {
      const errorData = result.error.raw;
      console.error("Registration error payload:", errorData);

      if (errorData) {
        const nextFieldErrors: FieldErrors = {
          username: getFirstMessage(errorData.name) || getFirstMessage(errorData.username),
          email: getFirstMessage(errorData.email),
          password: getFirstMessage(errorData.password1) || getFirstMessage(errorData.password),
        };

        setFieldErrors(nextFieldErrors);

        const firstError =
          getFirstMessage(errorData.detail) ||
          getFirstMessage(errorData.non_field_errors) ||
          getFirstMessage(errorData.name) ||
          getFirstMessage(errorData.username) ||
          getFirstMessage(errorData.email) ||
          getFirstMessage(errorData.password1) ||
          getFirstMessage(errorData.password) ||
          "Une erreur est survenue pendant l'inscription.";

        setToast({ show: true, type: "error", message: String(firstError) });
      } else {
        setToast({
          show: true,
          type: "error",
          message: result.error.message || "Une erreur est survenue pendant l'inscription.",
        });
      }
      return;
    }

    setToast({ show: true, type: "success", message: "Inscription réussie ! Redirection..." });
    setTimeout(() => {
      router.push(`/auth/login?registered=1&email=${encodeURIComponent(formData.email.trim())}`);
    }, 1500);
  };

  const advantages = [
    { icon: Leaf, text: "Accès à des produits locaux et durables" },
    { icon: Heart, text: "Programme de fidélité exclusif" },
    { icon: CheckCircle2, text: "Livraison offerte dès 50 000 FCFA" },
    { icon: Sparkles, text: "Offres personnalisées selon vos goûts" },
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
          <Leaf className="absolute left-[3%] top-[8%] h-14 w-14 rotate-12 text-primary/20" />
          <Leaf className="absolute bottom-[12%] right-[5%] h-20 w-20 -rotate-45 text-highlight/15" />
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
                  {/* Logo + titre */}
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
                      Rejoignez la
                      <span className="text-primary"> communauté</span>
                    </h1>
                    <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
                      <div className="h-px w-8 bg-primary/50" />
                      <p className="text-sm font-medium text-muted">
                        Créez votre compte en quelques secondes
                      </p>
                    </div>
                  </div>

                  {/* Liste d'avantages premium */}
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

                  {/* Encart de confiance */}
                  <div className="mt-8 rounded-2xl border border-border/50 bg-white/30 p-4 backdrop-blur-sm dark:bg-black/20">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {["/assets/images/avatar1.jpg", "/assets/images/avatar2.jpg", "/assets/images/avatar3.jpg"].map(
                          (src, i) => (
                            <div
                              key={i}
                              className="h-7 w-7 overflow-hidden rounded-full border-2 border-white dark:border-surface-elevated"
                            >
                              <Image
                                src={src}
                                alt="avatar"
                                width={28}
                                height={28}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">+1 200</span> membres actifs
                      </p>
                    </div>
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      “Des produits d’une qualité exceptionnelle et un service client
                      irréprochable.”
                    </p>
                  </div>
                </div>
              </div>

              {/* ========== COLONNE DROITE – FORMULAIRE D'INSCRIPTION ========== */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-6 text-center md:text-left">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Gift className="h-3 w-3" />
                    Nouveau membre ?
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Inscription</h2>
                  <p className="mt-1 text-sm text-muted">
                    Remplissez le formulaire pour créer votre espace personnel
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground">
                      Nom d’utilisateur
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => updateField("username", e.target.value)}
                        placeholder="ex: jean_du_terroir"
                        required
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="mt-1 text-xs text-error">{fieldErrors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="contact@exemple.com"
                        required
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-error">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-error">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-error">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Bouton d'inscription */}
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
                        Créer mon compte
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-muted">
                    Vous avez déjà un compte ?{" "}
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
                  <span>Données sécurisées</span>
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