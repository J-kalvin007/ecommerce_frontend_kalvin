"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCcw,
  LogIn,
  Mail,
} from "lucide-react";
import { verifyEmail } from "@/fonctions_api/auth.api";
import { getVerifyEmailError } from "@/lib/auth-errors";
import Toast from "@/components/special/Toast";
import { logoImage } from "@/assets/images";

// --- Types --------------------------------------------------------------------
type PageState = "verifying" | "success" | "error";

// --- Animation variants -------------------------------------------------------
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

const stateVariants: Variants = {
  enter: { opacity: 0, y: 20, scale: 0.97, filter: "blur(4px)" },
  center: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: -14, scale: 0.98, filter: "blur(4px)",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
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

// --- Composant : Icône centrale animée ---------------------------------------
function StatusIcon({ state }: { state: PageState }) {
  const isSuccess = state === "success";
  const isError = state === "error";
  const isVerifying = state === "verifying";

  /* Couleurs thématiques adaptées à Atelier du Terroir */
  const accent = isSuccess ? "#10b981" : isError ? "#ef4444" : "#C9963A";
  const accentRgb = isSuccess
    ? "16,185,129"
    : isError
      ? "239,68,68"
      : "201,150,58";

  return (
    <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 24px" }}>
      {/* -- Halo extérieur pulsant -- */}
      <motion.div
        animate={{
          scale: isSuccess ? [1, 1.35, 1] : [1, 1.15, 1],
          opacity: isSuccess ? [0.2, 0, 0.2] : [0.15, 0.05, 0.15],
        }}
        transition={{ duration: isSuccess ? 1.6 : 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${accentRgb},0.4) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* -- Anneau intermédiaire -- */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.15, 0.45] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{
          position: "absolute", inset: -6, borderRadius: "50%",
          border: `1.5px solid rgba(${accentRgb},0.3)`,
        }}
      />

      {/* -- Container de l'icône -- */}
      <motion.div
        animate={isVerifying
          ? { rotate: [0, 4, -4, 3, -3, 0] }
          : { y: [0, -5, 0] }
        }
        transition={isVerifying
          ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          width: 96, height: 96, borderRadius: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, rgba(${accentRgb},0.12) 0%, rgba(${accentRgb},0.04) 100%)`,
          border: `1px solid rgba(${accentRgb},0.3)`,
          boxShadow: `0 12px 40px rgba(${accentRgb},0.15), inset 0 1px 0 rgba(255,255,255,0.5)`,
          position: "relative", overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          {isVerifying && (
            <motion.div key="spin"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw size={42} style={{ color: accent }} strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div key="check"
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <CheckCircle2 size={44} style={{ color: accent }} strokeWidth={1.5} />
            </motion.div>
          )}

          {isError && (
            <motion.div key="warn"
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
            >
              <AlertTriangle size={42} style={{ color: accent }} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* -- Particules de confetti (état succès uniquement) -- */}
      {isSuccess && [
        { x: -36, y: -22, delay: 0.1, size: 5, color: "#10b981" },
        { x: 40, y: -28, delay: 0.28, size: 4, color: "#34d399" },
        { x: -28, y: 36, delay: 0.45, size: 3.5, color: "#059669" },
        { x: 42, y: 28, delay: 0.18, size: 4.5, color: "#6ee7b7" },
        { x: 10, y: -40, delay: 0.6, size: 3, color: "#10b981" },
      ].map((p, idx) => (
        <motion.div key={idx}
          initial={{ opacity: 0, x: 48, y: 48, scale: 0 }}
          animate={{ opacity: [0, 1, 0], x: 48 + p.x, y: 48 + p.y, scale: [0, 1, 0.5] }}
          transition={{ duration: 2, delay: p.delay, repeat: Infinity, repeatDelay: 1.8, ease: "easeOut" }}
          style={{
            position: "absolute", top: 0, left: 0,
            width: p.size, height: p.size,
            borderRadius: "50%", background: p.color,
          }}
        />
      ))}
    </div>
  );
}

// --- Composant : Barre de progression de la redirection ----------------------
function RedirectCountdown({
  countdown,
  total = 5,
  color,
  label,
}: {
  countdown: number;
  total?: number;
  color: string;
  label: string;
}) {
  return (
    <div className="mb-7 mt-4 w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8a9685] tracking-wide">
          {label}
        </span>
        <motion.span
          key={countdown}
          initial={{ scale: 1.4, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {countdown}s
        </motion.span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f2eb]">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: total, ease: "linear" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          }}
        />
      </div>
    </div>
  );
}

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenKey = searchParams.get("key"); 
  
  const [state, setState] = useState<PageState>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(5);
  const REDIRECT_DELAY = 5;

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const runVerification = useCallback(async () => {
    if (!tokenKey) {
      setState("error");
      setErrorMsg("Aucun lien de vérification fourni dans l'URL.");
      return;
    }

    setState("verifying");
    
    // Pour que l'animation de vérification soit visible un peu
    const startTime = Date.now();

    const decodedToken = decodeURIComponent(tokenKey);
    const result = await verifyEmail({ key: decodedToken });
    
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 1500) {
      await new Promise(res => setTimeout(res, 1500 - elapsedTime));
    }

    if (result.ok) {
      setState("success");
      setToast({ show: true, type: "success", message: "Email vérifié avec succès !" });
    } else {
      setState("error");
      const errorMsgFromLib = getVerifyEmailError(result.error?.raw, result.error?.status);
      setErrorMsg(errorMsgFromLib);
      setToast({ show: true, type: "error", message: "Vérification échouée." });
    }
  }, [tokenKey]);

  useEffect(() => {
    runVerification();
  }, [runVerification]);

  useEffect(() => {
    if (state === "verifying") return;

    setCountdown(REDIRECT_DELAY);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          if (state === "success") {
            router.push("/auth/login?verified=1");
          } else {
            router.push("/auth/resend-email");
          }
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, router]);

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
          <div className="flex flex-col lg:flex-row h-full min-h-[540px]">

            {/* -- LEFT PANEL -- */}
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
                  <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10">
                    <Image src={logoImage} alt="Atelier du Terroir" width={56} height={56} className="object-contain p-1" />
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
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]">Activation</p>
                  <h2 className="mt-2 text-[1.9rem] font-bold leading-tight tracking-tight text-white">
                    Authentification <span className="text-[#C9963A]">sécurisée</span>
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                    Processus de validation automatique de votre adresse e-mail.
                  </p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }} className="relative mt-10">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-[#C9963A]" />
                  <p className="text-xs text-white/55">Vérification instantanée · Accès sécurisé</p>
                </div>
              </motion.div>
            </motion.div>

            {/* -- RIGHT PANEL – SPA STATES -- */}
            <motion.div
              variants={rightIn}
              initial="hidden"
              animate="visible"
              className="flex flex-1 flex-col justify-center items-center bg-white px-8 py-10 lg:px-12 lg:py-12"
            >
              <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                  
                  {/* ------------------- ÉTAT : VÉRIFICATION EN COURS ------------------- */}
                  {state === "verifying" && (
                    <motion.div
                      key="verifying"
                      variants={stateVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col items-center text-center"
                    >
                      <StatusIcon state="verifying" />
                      <h2 className="text-2xl font-bold tracking-tight text-[#0F2D20] mb-3">
                        Vérification en cours…
                      </h2>
                      <p className="text-sm leading-relaxed text-[#6b7a65]">
                        Nous validons votre lien sécurisé auprès de notre serveur d'authentification.
                      </p>
                      
                      <div className="mt-8 flex justify-center gap-2">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i}
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.25, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                            className="h-2 w-2 rounded-full bg-[#C9963A]"
                          />
                        ))}
                      </div>
                      
                      <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-[#dde5d8] bg-[#f8faf6] px-4 py-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#8a9685]" />
                        <span className="max-w-[200px] truncate text-[11px] font-mono text-[#8a9685]">
                          {tokenKey ? `${tokenKey}` : "—"}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* ------------------- ÉTAT : SUCCÈS ----------------------------------- */}
                  {state === "success" && (
                    <motion.div
                      key="success"
                      variants={stateVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col items-center text-center w-full"
                    >
                      <StatusIcon state="success" />
                      <h2 className="text-2xl font-bold tracking-tight text-[#0F2D20] mb-3">
                        Compte activé !
                      </h2>
                      <p className="text-sm leading-relaxed text-[#6b7a65] mb-6">
                        Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant accéder à votre espace personnel.
                      </p>
                      
                      <div className="mb-6 w-full rounded-2xl border border-[#10b981]/20 bg-[#10b981]/5 p-4 text-left">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                          <span className="text-xs font-bold text-[#059669]">Authentification établie</span>
                        </div>
                        <p className="pl-6 text-[11px] text-[#059669]/70 leading-relaxed">
                          Vous allez être redirigé vers la page de connexion de l'Atelier du Terroir.
                        </p>
                      </div>

                      <RedirectCountdown countdown={countdown} total={REDIRECT_DELAY} color="#10b981" label="Redirection vers la connexion" />

                      <Link href="/auth/login" className="w-full group">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2D20] py-3.5 text-sm font-semibold text-white shadow-lg transition"
                        >
                          <LogIn className="h-4 w-4" />
                          Se connecter maintenant
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}

                  {/* ------------------- ÉTAT : ERREUR ----------------------------------- */}
                  {state === "error" && (
                    <motion.div
                      key="error"
                      variants={stateVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col items-center text-center w-full"
                    >
                      <StatusIcon state="error" />
                      <h2 className="text-2xl font-bold tracking-tight text-[#0F2D20] mb-3">
                        Vérification échouée
                      </h2>
                      <p className="text-sm leading-relaxed text-[#ef4444] font-medium mb-6">
                        {errorMsg}
                      </p>
                      
                      <div className="mb-6 w-full rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-4 text-left">
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
                          <span className="text-xs font-bold text-[#b91c1c]">Lien invalide ou expiré</span>
                        </div>
                        <p className="pl-6 text-[11px] text-[#b91c1c]/70 leading-relaxed">
                          Les liens de vérification n'ont qu'une durée de vie limitée. Veuillez demander un nouveau lien d'activation.
                        </p>
                      </div>

                      <RedirectCountdown countdown={countdown} total={REDIRECT_DELAY} color="#ef4444" label="Redirection vers le renvoi" />

                      <div className="flex w-full flex-col gap-3">
                        <Link href="/auth/resend-email" className="w-full group">
                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2D20] py-3.5 text-sm font-semibold text-white shadow-lg transition"
                          >
                            <Mail className="h-4 w-4" />
                            Demander un nouveau lien
                          </motion.button>
                        </Link>
                        <button
                          onClick={runVerification}
                          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#dde5d8] bg-white py-3.5 text-sm font-semibold text-[#6b7a65] transition hover:bg-[#f8faf6] hover:text-[#0F2D20]"
                        >
                          <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                          Réessayer
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}