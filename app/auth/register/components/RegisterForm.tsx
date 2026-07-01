"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Star,
  ShieldCheck,
  Wallet,
  PackageSearch,
  Star,
  Shield,
  ShieldCog,
} from "lucide-react";
import { register as registerApi } from "@/fonctions_api/auth.api";
import { getRegisterError } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import Toast from "@/components/special/Toast";
import { logoImage } from "@/assets/images";

/* -----------------------------------------------------------------
   Types
----------------------------------------------------------------- */
type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function getFirstMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/* -----------------------------------------------------------------
   Animation variants
----------------------------------------------------------------- */
const panelVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.075, delayChildren: 0.18 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

const leftPanelVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* -----------------------------------------------------------------
   FieldError
----------------------------------------------------------------- */
function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* -----------------------------------------------------------------
   FloatingParticle – ambient decoration
----------------------------------------------------------------- */
function FloatingParticle({
  x,
  y,
  size,
  delay,
  duration,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full bg-white/10"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [-12, 12, -12], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* -----------------------------------------------------------------
   BenefitRow
----------------------------------------------------------------- */
const benefits = [
  {
    icon: Wallet,
    title: "Wallet intégré",
    desc: "Déposez des fonds et payez progressivement.",
  },
  {
    icon: PackageSearch,
    title: "Suivi en temps réel",
    desc: "Commandes, livraisons, historiques d'achat.",
  },
  {
    icon: Star,
    title: "Fidélité & cashback",
    desc: "Statuts évolutifs, réductions exclusives.",
  },
  {
    icon: ShieldCheck,
    title: "Données protégées",
    desc: "Chiffrement bout-en-bout, zéro revente.",
  },
];

function BenefitRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3.5 group"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition group-hover:bg-[#C9963A]/20 group-hover:ring-[#C9963A]/40">
        <Icon className="h-4 w-4 text-white/80 transition group-hover:text-[#C9963A]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/95">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/55">{desc}</p>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------------
   PremiumInput – animated input with floating label feel
----------------------------------------------------------------- */
function PremiumInput({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
  suffix,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <motion.div variants={fadeUp} className="group">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#4a5568]">
        {label}
      </label>
      <div
        className={cn(
          "relative flex items-center overflow-hidden rounded-xl border bg-[#f8faf6] transition-all duration-300",
          focused
            ? "border-[#0F2D20] shadow-[0_0_0_3px_rgba(15,45,32,0.08)]"
            : "border-[#dde5d8] hover:border-[#b0c4a8]",
          error && "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.07)]"
        )}
      >
        {/* Animated left accent line */}
        <motion.div
          className="absolute left-0 top-0 h-full w-[2.5px] rounded-l-xl bg-gradient-to-b from-[#0F2D20] to-[#C9963A]"
          animate={{ scaleY: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: "top" }}
        />

        <div className="flex h-12 w-11 shrink-0 items-center justify-center pl-1">
          <Icon
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              focused || hasValue ? "text-[#0F2D20]" : "text-[#9aab94]"
            )}
          />
        </div>

        <input
          className="h-12 flex-1 bg-transparent pr-3 text-sm text-[#1a2318] placeholder-[#b0bfa9] outline-none"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
      <FieldError message={error} />
    </motion.div>
  );
}

/* -----------------------------------------------------------------
   RegisterForm
----------------------------------------------------------------- */
export function RegisterForm({
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
      const { toast: toastMsg, fields } = getRegisterError(
        result.error?.raw,
        result.error?.status
      );
      setFieldErrors(fields);
      setToast({ show: true, type: "error", message: toastMsg });
      return;
    }

    setToast({ show: true, type: "success", message: "Compte créé avec succès ! Redirection…" });
    setTimeout(() => {
      router.push(`/auth/acces-information?email=${encodeURIComponent(email.trim())}`);
    }, 1500);
  }

  /* Password strength meter */
  const strengthScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Faible", "Moyen", "Fort", "Excellent"][strengthScore];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#0F2D20"][strengthScore];

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/*
        ╔══════════════════════════════════════════════════════════════╗
        ║  OUTER SHELL  – full-page centered container                 ║
        ╚══════════════════════════════════════════════════════════════╝
      */}
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F0EDE6] p-4 md:p-8">
        {/*
          ╔════════════════════════════════════════════════════════════╗
          ║  CARD  – horizontal split                                  ║
          ╚════════════════════════════════════════════════════════════╝
        */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_rgba(15,45,32,0.18)]"
          style={{ minHeight: 620 }}
        >
          <div className="flex flex-col lg:flex-row">

            {/* -- LEFT PANEL ----------------------------------------- */}
            <motion.div
              variants={leftPanelVariants}
              initial="hidden"
              animate="visible"
              className="relative flex flex-col justify-between overflow-hidden bg-[#0F2D20] p-10 lg:w-[46%] lg:p-12"
            >
              {/* Background texture – subtle radial gradients */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C9963A]/10 blur-3xl" />
                <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#1f6b4f]/20 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/3 blur-2xl" />
              </div>

              {/* Floating ambient particles */}
              {[
                { x: 15, y: 20, size: 5, delay: 0, duration: 5 },
                { x: 75, y: 10, size: 3, delay: 1.5, duration: 6 },
                { x: 85, y: 55, size: 6, delay: 0.8, duration: 7 },
                { x: 20, y: 75, size: 4, delay: 2.1, duration: 5.5 },
                { x: 55, y: 88, size: 3, delay: 0.3, duration: 6.5 },
              ].map((p, i) => (
                <FloatingParticle key={i} {...p} />
              ))}

              {/* Decorative SVG botanical line */}
              <svg
                className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-5"
                viewBox="0 0 200 600"
                fill="none"
              >
                <path
                  d="M160 0 C80 100, 180 200, 100 300 C20 400, 160 500, 100 600"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle cx="100" cy="150" r="18" stroke="white" strokeWidth="1" />
                <circle cx="140" cy="320" r="12" stroke="white" strokeWidth="1" />
                <circle cx="80" cy="480" r="15" stroke="white" strokeWidth="1" />
              </svg>

              {/* Top – Logo + eyebrow */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10">
                    <Image
                      src={logoImage}
                      alt="Atelier du Terroir"
                      width={36}
                      height={36}
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]">
                      Atelier du Terroir
                    </p>
                    <p className="text-[11px] text-white/45">Espace Membre</p>
                  </div>
                </motion.div>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="my-8 h-px origin-left bg-gradient-to-r from-white/20 to-transparent"
                />

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.3 }}
                >
                  <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-white">
                    Rejoignez une{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10 text-[#C9963A]">communauté</span>
                      {/* Underline accent */}
                      <motion.span
                        className="absolute bottom-0.5 left-0 h-[2px] w-full rounded-full bg-[#C9963A]/40"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        style={{ transformOrigin: "left" }}
                      />
                    </span>{" "}
                    d'exception
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    Un seul compte pour une expérience d'achat centralisée, sécurisée et récompensée.
                  </p>
                </motion.div>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="my-7 h-px origin-left bg-gradient-to-r from-white/20 to-transparent"
                />

                {/* Benefits */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5"
                >
                  {benefits.map((b) => (
                    <BenefitRow key={b.title} {...b} />
                  ))}
                </motion.div>
              </div>

              {/* Bottom – trust badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="relative mt-10"
              >
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <ShieldCog className="h-4 w-4 text-[#C9963A]" />
                  </motion.div>
                  <p className="text-xs text-white/60">
                    Inscription sécurisée · Données chiffrées · Zéro spam
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* -- RIGHT PANEL – FORM --------------------------------- */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-1 flex-col justify-center bg-white px-8 py-10 lg:px-12 lg:py-12"
            >
              {/* Form header */}
              <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-8">
                <motion.p
                  variants={fadeUp}
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]"
                >
                  Nouveau compte
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="mt-1.5 text-3xl font-bold tracking-tight text-[#0F2D20]"
                >
                  Créer mon profil
                </motion.h1>
                <motion.p variants={fadeUp} className="mt-1.5 text-sm text-[#6b7a65]">
                  Quelques secondes suffisent pour rejoindre l'Atelier.
                </motion.p>
              </motion.div>

              {/* Form */}
              <motion.form
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                {/* Name + Email row */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <PremiumInput
                    label="Nom complet"
                    icon={UserRound}
                    value={name}
                    onChange={setName}
                    placeholder="Felix Aristide"
                    autoComplete="name"
                    required
                    error={fieldErrors.name}
                  />
                  <PremiumInput
                    label="Adresse e-mail"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="felix@email.com"
                    autoComplete="email"
                    required
                    error={fieldErrors.email}
                  />
                </div>

                {/* Password */}
                <PremiumInput
                  label="Mot de passe"
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 caractères"
                  autoComplete="new-password"
                  required
                  error={fieldErrors.password}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-[#9aab94] transition hover:text-[#0F2D20]"
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {showPassword ? (
                          <motion.span
                            key="off"
                            initial={{ opacity: 0, rotate: -60 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 60 }}
                            transition={{ duration: 0.15 }}
                            className="block"
                          >
                            <EyeOff className="h-4 w-4" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="on"
                            initial={{ opacity: 0, rotate: 60 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -60 }}
                            transition={{ duration: 0.15 }}
                            className="block"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  }
                />

                {/* Password strength bar */}
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="-mt-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1 flex-1 rounded-full"
                              animate={{
                                backgroundColor:
                                  i <= strengthScore ? strengthColor : "#e5e7eb",
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          ))}
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={strengthLabel}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="text-[11px] font-semibold"
                            style={{ color: strengthColor }}
                          >
                            {strengthLabel}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Confirm password */}
                <PremiumInput
                  label="Confirmer le mot de passe"
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Retapez votre mot de passe"
                  autoComplete="new-password"
                  required
                  error={fieldErrors.confirmPassword}
                  suffix={
                    confirmPassword.length > 0 ? (
                      <AnimatePresence mode="wait">
                        {confirmPassword === password ? (
                          <motion.span
                            key="ok"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="err"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    ) : undefined
                  }
                />

                {/* Submit button */}
                <motion.div variants={fadeUp} className="pt-1">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.012, y: isLoading ? 0 : -1 }}
                    whileTap={{ scale: isLoading ? 1 : 0.988 }}
                    className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#0F2D20] py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,45,32,0.28)] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {/* Shimmer hover effect */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ["−100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />

                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création en cours…
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Switch to login */}
                <motion.p
                  variants={fadeUp}
                  className="text-center text-sm text-[#8a9685]"
                >
                  Déjà membre ?{" "}
                  {onSwitchToLogin ? (
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="group inline-flex items-center gap-1 font-semibold text-[#0F2D20] underline-offset-2 hover:underline"
                    >
                      Se connecter
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <Link
                      href={loginHref}
                      className="group inline-flex items-center gap-1 font-semibold text-[#0F2D20] underline-offset-2 hover:underline"
                    >
                      Se connecter
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </motion.p>
              </motion.form>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center justify-center gap-3 border-t border-[#f0f2eb] pt-6">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-wide text-[#8a9685]">
                  <Link href="/auth/forgot-password" className="hover:text-[#0F2D20] hover:underline transition-colors">Mot de passe oublié</Link>
                  <span>&bull;</span>
                  <Link href="/auth/verify-email" className="hover:text-[#0F2D20] hover:underline transition-colors">Vérifier mon email</Link>
                  <span>&bull;</span>
                  <Link href="/auth/reset-password-confirm" className="hover:text-[#0F2D20] hover:underline transition-colors">Confirmer mot de passe</Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}