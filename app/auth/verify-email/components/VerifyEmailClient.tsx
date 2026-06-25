
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVerifyEmailError } from "@/lib/auth-errors";
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
    icon: Mail,
    label: "Vérifiez votre boîte mail",
    desc: "Un code à 6 chiffres vous a été envoyé.",
  },
  {
    icon: KeyRound,
    label: "Saisissez le code",
    desc: "Entrez-le ci-contre pour valider.",
  },
  {
    icon: ShieldCheck,
    label: "Compte sécurisé",
    desc: "Accédez immédiatement à votre espace.",
  },
];

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

    try {
      // Simulation d'un appel API pour la démo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const success = true; // Remplacez par le résultat de votre API
      if (!success) throw new Error("Code invalide");

      setToast({
        show: true,
        type: "success",
        message: "Votre adresse e-mail a été vérifiée avec succès !",
      });
      setTimeout(() => {
        router.push("/auth/login?verified=1");
      }, 1500);
    } catch (error) {
      // Si l'erreur vient d'un appel API structuré, utiliser le traducteur
      const apiRaw = (error as Record<string, unknown>)?.raw ?? null;
      const apiStatus = (error as Record<string, unknown>)?.status as number | undefined;
      const message = apiRaw
        ? getVerifyEmailError(apiRaw as Record<string, unknown>, apiStatus)
        : error instanceof Error && error.message
          ? getVerifyEmailError(null)
          : "Code invalide ou expiré. Vérifiez votre boîte mail et réessayez.";

      setToast({ show: true, type: "error", message });
      setIsLoading(false);
    }
  };

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
                    <p className="text-[11px] text-white/45">Vérification de sécurité</p>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]">Dernière étape</p>
                  <h2 className="mt-2 text-[1.9rem] font-bold leading-tight tracking-tight text-white">
                    Vérifiez votre <span className="text-[#C9963A]">e-mail</span>
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                    Assurez-vous que c'est bien vous pour activer complètement votre compte.
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
                  <p className="text-xs text-white/55">Vérification instantanée · Accès sécurisé</p>
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
              <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-8">
                <motion.div variants={fadeUp} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#dde5d8] bg-[#f8faf6] px-3 py-1">
                  <ShieldCheck className="h-3 w-3 text-[#C9963A]" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8a9685]">Authentification</span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-3xl font-bold tracking-tight text-[#0F2D20]">
                  Saisissez le code
                </motion.h1>
                <motion.p variants={fadeUp} className="mt-1.5 text-sm leading-relaxed text-[#6b7a65]">
                  {email ? (
                    <>Nous avons envoyé un code à 6 chiffres à <span className="font-semibold text-[#0F2D20]">{email}</span></>
                  ) : (
                    "Nous avons envoyé un code à 6 chiffres à votre adresse e-mail."
                  )}
                </motion.p>
              </motion.div>

              <motion.form variants={stagger} initial="hidden" animate="visible" className="space-y-6" onSubmit={handleSubmit}>
                <motion.div variants={fadeUp}>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#4a5568]">
                    Code de vérification
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9aab94]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\\d{6}"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\\D/g, ""))}
                      disabled={isLoading}
                      placeholder="• • • • • •"
                      className="w-full rounded-xl border border-[#dde5d8] bg-[#f8faf6] py-3.5 pl-12 pr-4 text-center text-2xl font-mono tracking-[0.5em] text-[#0F2D20] outline-none transition-all placeholder:text-[#b0bfa9] focus:border-[#0F2D20] focus:shadow-[0_0_0_3px_rgba(15,45,32,0.08)] disabled:opacity-60"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <motion.button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    whileHover={{ scale: isLoading || verificationCode.length !== 6 ? 1 : 1.012, y: isLoading || verificationCode.length !== 6 ? 0 : -1 }}
                    whileTap={{ scale: isLoading || verificationCode.length !== 6 ? 1 : 0.988 }}
                    className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#0F2D20] py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,45,32,0.25)] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <motion.div
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Vérification…</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Confirmer mon compte</>
                    )}
                  </motion.button>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center justify-center gap-3 border-t border-[#f0f2eb] pt-6">
                  <p className="text-center text-sm text-[#8a9685]">
                    Je n'ai pas reçu le code ?{" "}
                    <button type="button" className="font-semibold text-[#0F2D20] underline-offset-2 hover:underline">
                      Renvoyer le code
                    </button>
                  </p>
                  <Link href="/auth/login" className="group mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0F2D20] underline-offset-2 hover:underline">
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                    Retour à la connexion
                  </Link>
                </motion.div>
              </motion.form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}