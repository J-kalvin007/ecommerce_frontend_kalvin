"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  UserRound,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { register as registerApi } from "@/fonctions_api/auth.api";
import { cn } from "@/lib/utils";
import Toast from "@/components/special/Toast";
import { logoImage } from "@/assets/images";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function getFirstMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/* -------------------------------------------------------------------------- */
/*  Variantes d'animation (purement visuelles, aucune logique métier touchée)  */
/* -------------------------------------------------------------------------- */

const containerStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ------------------------------------------------------------------ */
/*  Petit composant pour les erreurs de champ, avec icône + fade-in    */
/* ------------------------------------------------------------------ */
function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 flex items-center gap-1.5 text-xs text-error"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function RegisterForm({
  redirectPath, // conservé pour compatibilité, non utilisé
  onSwitchToLogin,
  loginHref = "/auth/login",
}: {
  redirectPath?: string;
  onSwitchToLogin?: () => void;
  loginHref?: string;
} = {}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast({ ...toast, show: false });
    setFieldErrors({});

    // Vérification locale
    if (password !== confirmPassword) {
      const message = "Les mots de passe ne correspondent pas.";
      setFieldErrors({ confirmPassword: message });
      setToast({ show: true, type: "error", message });
      return;
    }

    setIsLoading(true);

    const result = await registerApi({
      name: name.trim(),
      email: email.trim(),
      password1: password,
      password2: confirmPassword,
    });

    setIsLoading(false);

    if (!result.ok) {
      const errorData = result.error?.raw || {};
      console.error("Registration error payload:", errorData);

      let nextFieldErrors: FieldErrors = {};
      let rawMessage = result.error?.message || "";

      if (errorData && typeof errorData === "object") {
        nextFieldErrors = {
          name: getFirstMessage(errorData.name) || getFirstMessage(errorData.username),
          email: getFirstMessage(errorData.email),
          password: getFirstMessage(errorData.password1) || getFirstMessage(errorData.password),
        };
        setFieldErrors(nextFieldErrors);

        rawMessage =
          getFirstMessage(errorData.detail) ||
          getFirstMessage(errorData.non_field_errors) ||
          nextFieldErrors.email ||
          nextFieldErrors.name ||
          nextFieldErrors.password ||
          rawMessage;
      }

      let finalMessage = "Une erreur est survenue pendant l'inscription.";

      if (typeof rawMessage === "string") {
        const lowerMsg = rawMessage.toLowerCase();
        if (lowerMsg.includes("already exists") || lowerMsg.includes("already taken") || lowerMsg.includes("unique") || lowerMsg.includes("existe déjà")) {
          finalMessage = "Un compte existe déjà avec cette adresse email ou ce nom.";
        } else if (lowerMsg.includes("password") || lowerMsg.includes("mot de passe")) {
          finalMessage = "Le mot de passe ne respecte pas les critères de sécurité.";
        } else if (lowerMsg.includes("network") || lowerMsg.includes("fetch") || lowerMsg.includes("failed to fetch")) {
          finalMessage = "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet.";
        } else if (rawMessage.trim() !== "") {
          finalMessage = rawMessage;
        }
      }

      setToast({ show: true, type: "error", message: finalMessage });
      return;
    }

    // Succès – redirection vers la page de connexion avec notification
    setToast({ show: true, type: "success", message: "Inscription réussie ! Redirection..." });
    setTimeout(() => {
      router.push(`/auth/login?registered=1&email=${encodeURIComponent(email.trim())}`);
    }, 1500);
  }

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="relative w-full max-w-md"
      >
        {/* Décorations feuilles, légère oscillation */}
        <motion.div
          className="pointer-events-none absolute -left-5 top-10 text-[#8b5e34]/25"
          animate={{ rotate: [-18, -9, -18] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="h-9 w-9" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute -right-6 bottom-20 text-[#1f4d3f]/20"
          animate={{ rotate: [22, 31, 22] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <Leaf className="h-11 w-11" />
        </motion.div>

        <div className="overflow-hidden rounded-[2rem] border border-[#d6dfd2] bg-white/95 shadow-[0_28px_80px_rgba(24,37,24,0.14)] backdrop-blur-sm">
          {/* ---- En-tête dégradé ---- */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34] px-8 py-8 text-center text-white">
            <motion.div
              className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 mx-auto mb-3 flex h-16 w-16 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/25 blur-md"
                animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
                <Image
                  src={logoImage}
                  alt="Atelier du Terroir"
                  fill
                  className="object-contain p-2"
                  sizes="64px"
                />
              </div>
            </div>

            <div className="relative z-10 mx-auto mb-2 flex items-center justify-center gap-2 text-sm text-white/90">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.span>
              <span>Inscription rapide &amp; sécurisée</span>
            </div>
            <h1 className="relative z-10 text-2xl font-bold">Créer un compte</h1>
            <div className="relative z-10 mx-auto mt-2 h-[2px] w-10 rounded-full bg-white/40" />
            <p className="relative z-10 mt-3 text-sm text-white/82">
              Rejoignez la communauté Atelier du Terroir
            </p>
          </div>

          {/* ---- Formulaire ---- */}
          <motion.form
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="space-y-4 p-8"
            onSubmit={handleSubmit}
          >
            {/* Nom */}
            <motion.label variants={fadeUp} className="block space-y-2">
              <span className="text-sm font-medium text-[#2a3528]">Nom</span>
              <div className="group relative">
                <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978] transition-colors group-focus-within:text-[#1f4d3f]" />
                <input
                  className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Votre nom"
                  required
                />
              </div>
              <FieldError message={fieldErrors.name} />
            </motion.label>

            {/* Email */}
            <motion.label variants={fadeUp} className="block space-y-2">
              <span className="text-sm font-medium text-[#2a3528]">Adresse email</span>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978] transition-colors group-focus-within:text-[#1f4d3f]" />
                <input
                  className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-4 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="nom@email.com"
                  required
                />
              </div>
              <FieldError message={fieldErrors.email} />
            </motion.label>

            {/* Mot de passe */}
            <motion.label variants={fadeUp} className="block space-y-2">
              <span className="text-sm font-medium text-[#2a3528]">Mot de passe</span>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978] transition-colors group-focus-within:text-[#1f4d3f]" />
                <input
                  className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8978] transition-colors hover:text-[#1f4d3f]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.span
                        key="eyeoff"
                        initial={{ opacity: 0, rotate: -60 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 60 }}
                        transition={{ duration: 0.18 }}
                        className="block"
                      >
                        <EyeOff className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="eye"
                        initial={{ opacity: 0, rotate: 60 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -60 }}
                        transition={{ duration: 0.18 }}
                        className="block"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
              <FieldError message={fieldErrors.password} />
              <p className="rounded-lg bg-[#f8f5ef] px-3 py-2 text-xs leading-5 text-[#667260]">
                Minimum 8 caractères. Évitez les mots courants comme Max12345. Préférez lettres +
                chiffres + symbole, ex. <strong className="text-[#2a3528]">Max@Terroir2026!</strong>
              </p>
            </motion.label>

            {/* Confirmation mot de passe */}
            <motion.label variants={fadeUp} className="block space-y-2">
              <span className="text-sm font-medium text-[#2a3528]">
                Confirmer le mot de passe
              </span>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8978] transition-colors group-focus-within:text-[#1f4d3f]" />
                <input
                  className="w-full rounded-xl border border-[#d7ddcf] bg-[#fbfcf7] py-3 pl-11 pr-12 text-sm text-[#1c241b] outline-none transition focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#dce8d8]"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Retapez votre mot de passe"
                  required
                />
              </div>
              <FieldError message={fieldErrors.confirmPassword} />
            </motion.label>

            {/* Bouton de soumission */}
            <motion.div variants={fadeUp}>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.015 }}
                whileTap={{ scale: isLoading ? 1 : 0.985 }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f4d3f] to-[#17392f] py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(31,77,63,0.24)] transition hover:shadow-[0_20px_40px_rgba(31,77,63,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Lien vers la connexion */}
            {onSwitchToLogin ? (
              <motion.p variants={fadeUp} className="text-center text-sm text-[#667260]">
                Déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="group inline-flex items-center gap-1 font-semibold text-[#1f4d3f] hover:underline"
                >
                  Se connecter
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </motion.p>
            ) : (
              <motion.p variants={fadeUp} className="text-center text-sm text-[#667260]">
                Déjà un compte ?{" "}
                <Link
                  className="group inline-flex items-center gap-1 font-semibold text-[#1f4d3f] hover:underline"
                  href={loginHref}
                >
                  Se connecter
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.p>
            )}
          </motion.form>

          {/* ---- Bandeau de confiance ---- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 divide-x divide-[#eef2ea] border-t border-[#eef2ea] px-6 py-4"
          >
            <div className="flex flex-col items-center gap-1 px-2 text-center">
              <Lock className="h-4 w-4 text-[#1f4d3f]" />
              <span className="text-[10.5px] leading-tight text-[#7c8978]">Inscription sécurisée</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 text-center">
              <ShieldCheck className="h-4 w-4 text-[#8b5e34]" />
              <span className="text-[10.5px] leading-tight text-[#7c8978]">Données protégées</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 text-center">
              <Sparkles className="h-4 w-4 text-[#1f4d3f]" />
              <span className="text-[10.5px] leading-tight text-[#7c8978]">Avantages fidélité</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}