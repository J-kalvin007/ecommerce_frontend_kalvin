




"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import SendEmailReset from "./send-email-reset";
import { confirmPasswordReset } from "@/fonctions_api/auth.api";
import { getResetPasswordError } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import Toast from "@/components/special/Toast";
import { logoImage } from "@/assets/images";

/* ─────────────────────────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────────────────────────── */
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

const leftIn: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const rightIn: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

function FloatingParticle({
  x, y, size, delay, duration,
}: {
  x: number; y: number; size: number; delay: number; duration: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full bg-white/10"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [-10, 10, -10], opacity: [0.25, 0.65, 0.25] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const steps = [
  {
    icon: Lock,
    label: "Choisissez un mot de passe",
    desc: "Il doit faire au moins 8 caractères.",
  },
  {
    icon: ShieldCheck,
    label: "Sécurité renforcée",
    desc: "Mélangez lettres, chiffres et symboles.",
  },
  {
    icon: CheckCircle2,
    label: "Accès rétabli",
    desc: "Connectez-vous avec vos nouveaux identifiants.",
  },
];

/* ─────────────────────────────────────────────────────────────────
   Success state panel
───────────────────────────────────────────────────────────────── */
function SuccessPanel() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-4 text-center"
    >
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-50"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full bg-emerald-100"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <CheckCircle2 className="relative z-10 h-9 w-9 text-emerald-500" />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-bold text-[#0F2D20]"
      >
        Mot de passe mis à jour !
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-2 max-w-xs text-sm leading-relaxed text-[#6b7a65]"
      >
        Votre mot de passe a été réinitialisé avec succès. Vous pouvez désormais vous connecter.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-7"
      >
        <Link
          href="/auth/login"
          className="group inline-flex items-center gap-2 rounded-xl bg-[#0F2D20] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(15,45,32,0.22)] transition hover:shadow-[0_14px_32px_rgba(15,45,32,0.3)]"
        >
          Se connecter
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordConfirmClient() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendError, setResendError] = useState("");

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

    if (!uid || !token) {
      setResendError("Le lien de réinitialisation est manquant, invalide ou expiré.");
      setShowResend(true);
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
      const errorMessage = getResetPasswordError(
        result.error?.raw,
        result.error?.status
      );

      // Si l'erreur concerne le token/uid, on redirige vers l'écran de demande
      if (
        errorMessage.toLowerCase().includes("expiré") ||
        errorMessage.toLowerCase().includes("invalide") ||
        errorMessage.toLowerCase().includes("incorrect") ||
        errorMessage.toLowerCase().includes("uid") ||
        errorMessage.toLowerCase().includes("expire")
      ) {
        setResendError(errorMessage);
        setShowResend(true);
        return;
      }

      setToast({ show: true, type: "error", message: errorMessage });
      return;
    }

    setSuccess(true);
  };

  if (!uid || !token || showResend) {
    return <SendEmailReset errorInitial={resendError || "Lien de réinitialisation invalide ou expiré."} />;
  }

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="flex min-h-screen w-full items-center justify-center bg-[#F0EDE6] p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_rgba(15,45,32,0.16)]"
          style={{ minHeight: 540 }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* ── LEFT PANEL ── */}
            <motion.div
              variants={leftIn}
              initial="hidden"
              animate="visible"
              className="relative flex flex-col justify-between overflow-hidden bg-[#0F2D20] p-10 lg:w-[44%] lg:p-12"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#C9963A]/10 blur-3xl" />
                <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-[#1f6b4f]/18 blur-3xl" />
              </div>

              {[
                { x: 12, y: 18, size: 5, delay: 0, duration: 5.5 },
                { x: 78, y: 8, size: 3, delay: 1.2, duration: 6 },
                { x: 88, y: 60, size: 5, delay: 0.6, duration: 7 },
                { x: 18, y: 80, size: 4, delay: 2, duration: 5 },
                { x: 50, y: 92, size: 3, delay: 0.4, duration: 6.5 },
              ].map((p, i) => (
                <FloatingParticle key={i} {...p} />
              ))}

              <svg
                className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.04]"
                viewBox="0 0 180 560"
                fill="none"
              >
                <path d="M140 0 C60 90, 170 200, 90 280 C10 360, 150 460, 90 560" stroke="white" strokeWidth="1.5" />
                <circle cx="90" cy="140" r="16" stroke="white" strokeWidth="1" />
                <circle cx="130" cy="300" r="10" stroke="white" strokeWidth="1" />
                <circle cx="70" cy="450" r="13" stroke="white" strokeWidth="1" />
              </svg>

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10">
                    <Image src={logoImage} alt="Atelier du Terroir" width={36} height={36} className="object-contain p-1" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]">Atelier du Terroir</p>
                    <p className="text-[11px] text-white/45">Sécurité de compte</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="my-7 h-px origin-left bg-gradient-to-r from-white/20 to-transparent"
                />

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.3 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]">Réinitialisation</p>
                  <h2 className="mt-2 text-[1.9rem] font-bold leading-tight tracking-tight text-white">
                    Nouveau <span className="text-[#C9963A]">mot de passe</span>
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                    Sécurisez à nouveau votre compte avec un mot de passe robuste.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="my-7 h-px origin-left bg-gradient-to-r from-white/20 to-transparent"
                />

                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
                  {steps.map((step, i) => (
                    <motion.div key={step.label} variants={fadeUp} className="group flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                          <step.icon className="h-4 w-4 text-white/75" />
                        </div>
                        {i < steps.length - 1 && <div className="absolute left-[17px] top-9 h-5 w-px bg-white/12" />}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-white/95">{step.label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/50">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }} className="relative mt-10">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-[#C9963A]" />
                  <p className="text-xs text-white/55">Mise à jour chiffrée · Aucune donnée stockée en clair</p>
                </div>
              </motion.div>
            </motion.div>

            {/* ── RIGHT PANEL – FORM ── */}
            <motion.div
              variants={rightIn}
              initial="hidden"
              animate="visible"
              className="flex flex-1 flex-col justify-center bg-white px-8 py-10 lg:px-12 lg:py-12"
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <SuccessPanel key="success" />
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-8">
                      <motion.div variants={fadeUp} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#dde5d8] bg-[#f8faf6] px-3 py-1">
                        <KeyRound className="h-3 w-3 text-[#C9963A]" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8a9685]">Authentification</span>
                      </motion.div>

                      <motion.h1 variants={fadeUp} className="text-3xl font-bold tracking-tight text-[#0F2D20]">
                        Nouveau mot de passe
                      </motion.h1>
                      <motion.p variants={fadeUp} className="mt-1.5 text-sm leading-relaxed text-[#6b7a65]">
                        Saisissez un mot de passe sécurisé et confirmez-le.
                      </motion.p>
                    </motion.div>

                    <motion.form variants={stagger} initial="hidden" animate="visible" className="space-y-5" onSubmit={handleSubmit}>
                      <motion.div variants={fadeUp}>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#4a5568]">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aab94]" />
                          <input
                            type={showPassword1 ? "text" : "password"}
                            value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                            disabled={isLoading}
                            placeholder="Au moins 8 caractères"
                            className="w-full rounded-xl border border-[#dde5d8] bg-[#f8faf6] py-3.5 pl-12 pr-12 text-sm text-[#0F2D20] outline-none transition-all placeholder:text-[#b0bfa9] focus:border-[#0F2D20] focus:shadow-[0_0_0_3px_rgba(15,45,32,0.08)] disabled:opacity-60"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword1(!showPassword1)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aab94] transition hover:text-[#0F2D20]"
                          >
                            {showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#4a5568]">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aab94]" />
                          <input
                            type={showPassword2 ? "text" : "password"}
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            disabled={isLoading}
                            placeholder="Retapez le mot de passe"
                            className="w-full rounded-xl border border-[#dde5d8] bg-[#f8faf6] py-3.5 pl-12 pr-12 text-sm text-[#0F2D20] outline-none transition-all placeholder:text-[#b0bfa9] focus:border-[#0F2D20] focus:shadow-[0_0_0_3px_rgba(15,45,32,0.08)] disabled:opacity-60"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword2(!showPassword2)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aab94] transition hover:text-[#0F2D20]"
                          >
                            {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div variants={fadeUp} className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={isLoading || !password1 || password1 !== password2}
                          whileHover={{ scale: isLoading || !password1 || password1 !== password2 ? 1 : 1.012, y: isLoading || !password1 || password1 !== password2 ? 0 : -1 }}
                          whileTap={{ scale: isLoading || !password1 || password1 !== password2 ? 1 : 0.988 }}
                          className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#0F2D20] py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,45,32,0.25)] transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <motion.div
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                          />
                          {isLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Mise à jour…</>
                          ) : (
                            <><CheckCircle2 className="h-4 w-4" /> Enregistrer le mot de passe</>
                          )}
                        </motion.button>
                      </motion.div>

                      <motion.p variants={fadeUp} className="mt-4 text-center text-sm text-[#8a9685]">
                        <Link href="/auth/login" className="group inline-flex items-center gap-1 font-semibold text-[#0F2D20] underline-offset-2 hover:underline">
                          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                          Retour à la connexion
                        </Link>
                      </motion.p>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}