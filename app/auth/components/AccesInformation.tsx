"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  Mail,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Star,
} from "lucide-react";
import { logoImage } from "@/assets/images";

/* -----------------------------------------------------------------
   Animation variants
----------------------------------------------------------------- */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const leftIn: Variants = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const rightIn: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

function FloatingParticle({ x, y, size, delay, duration }: {
  x: number; y: number; size: number; delay: number; duration: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full bg-white/10"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const steps = [
  {
    icon: Mail,
    label: "Vérifiez votre boîte mail",
    desc: "Cherchez l'e-mail de L'Atelier du Terroir.",
    done: false,
  },
  {
    icon: CheckCircle2,
    label: "Cliquez sur le lien",
    desc: "Lien valable 72 h — vérifiez aussi vos spams.",
    done: false,
  },
  {
    icon: ShieldCheck,
    label: "Accès activé",
    desc: "Votre compte sera immédiatement opérationnel.",
    done: false,
  },
];

/* -----------------------------------------------------------------
   Animated envelope icon
----------------------------------------------------------------- */
function EnvelopeAnimation() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {/* Outer pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[#C9963A]/20"
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-[#C9963A]/30"
        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2.8, delay: 0.35, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Icon container */}
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F2D20] to-[#1a4a30] shadow-[0_8px_32px_rgba(15,45,32,0.35)]"
        initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        {/* Gold accent corner */}
        <div className="absolute right-0 top-0 h-5 w-5 rounded-bl-xl rounded-tr-2xl bg-[#C9963A]/20" />
        <Mail className="relative z-10 h-7 w-7 text-white" />
        {/* Notification dot */}
        <motion.div
          className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-2 border-white bg-[#C9963A]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-[#C9963A]"
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -----------------------------------------------------------------
   AccesInformation
----------------------------------------------------------------- */
export default function AccesInformation() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F0EDE6] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_rgba(15,45,32,0.18)]"
        style={{ minHeight: 560 }}
      >
        <div className="flex flex-col lg:flex-row">

          {/* -- LEFT PANEL -- */}
          <motion.div
            variants={leftIn}
            initial="hidden"
            animate="visible"
            className="relative flex flex-col justify-between overflow-hidden bg-[#0F2D20] p-10 lg:w-[44%] lg:p-12"
          >
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#C9963A]/10 blur-3xl" />
              <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-[#1f6b4f]/18 blur-3xl" />
            </div>

            {/* Particles */}
            {[
              { x: 10, y: 15, size: 5, delay: 0, duration: 5.5 },
              { x: 80, y: 8, size: 3, delay: 1.2, duration: 6 },
              { x: 88, y: 58, size: 5, delay: 0.6, duration: 7 },
              { x: 15, y: 80, size: 4, delay: 2, duration: 5 },
              { x: 52, y: 92, size: 3, delay: 0.4, duration: 6.5 },
            ].map((p, i) => <FloatingParticle key={i} {...p} />)}

            {/* Decorative SVG */}
            <svg className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.04]" viewBox="0 0 180 560" fill="none">
              <path d="M140 0 C60 90, 170 200, 90 280 C10 360, 150 460, 90 560" stroke="white" strokeWidth="1.5" />
              <circle cx="90" cy="140" r="16" stroke="white" strokeWidth="1" />
              <circle cx="130" cy="300" r="10" stroke="white" strokeWidth="1" />
              <circle cx="70" cy="450" r="13" stroke="white" strokeWidth="1" />
            </svg>

            {/* Top — Logo */}
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
                  <p className="text-[11px] text-white/45">Espace Membre</p>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="my-7 h-px origin-left bg-gradient-to-r from-white/20 to-transparent"
              />

              {/* Headline */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3 }}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9963A]">Inscription reçue</p>
                <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-white">
                  Presque là,{" "}
                  <span className="text-[#C9963A]">confirmez</span>
                  {" "}votre adresse
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                  Un e-mail de confirmation vient d&rsquo;être envoyé. Suivez les étapes pour activer votre compte.
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="my-7 h-px origin-left bg-gradient-to-r from-white/20 to-transparent"
              />

              {/* Steps */}
              <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
                {steps.map((step, i) => (
                  <motion.div key={step.label} variants={fadeUp} className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                        <step.icon className="h-4 w-4 text-white/75" />
                      </div>
                      {/* Step number */}
                      <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9963A] text-[9px] font-bold text-white">
                        {i + 1}
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

            {/* Bottom trust badge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }} className="relative mt-10">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Star className="h-4 w-4 text-[#C9963A]" />
                <p className="text-xs text-white/55">Lien chiffré · Valable 72 h · Aucun spam</p>
              </div>
            </motion.div>
          </motion.div>

          {/* -- RIGHT PANEL -- */}
          <motion.div
            variants={rightIn}
            initial="hidden"
            animate="visible"
            className="flex flex-1 flex-col items-center justify-center bg-white px-8 py-12 text-center lg:px-12"
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex w-full max-w-sm flex-col items-center gap-0"
            >
              {/* Animated envelope */}
              <motion.div variants={fadeUp} className="mb-8">
                <EnvelopeAnimation />
              </motion.div>

              {/* Badge */}
              <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#dde5d8] bg-[#f8faf6] px-3 py-1">
                <Mail className="h-3 w-3 text-[#C9963A]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8a9685]">Vérification e-mail</span>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeUp} className="text-2xl font-bold tracking-tight text-[#0F2D20]">
                Confirmez votre adresse e-mail
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="mt-3 text-sm leading-relaxed text-[#6b7a65]">
                Nous avons envoyé un lien de confirmation à{" "}
                {email ? (
                  <span className="font-semibold text-[#0F2D20]">{email}</span>
                ) : (
                  "votre adresse e-mail"
                )}
                . Cliquez sur ce lien pour activer votre compte.
              </motion.p>

              {/* Expiry notice */}
              <motion.div variants={fadeUp} className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-amber-700">
                  Le lien expire dans <strong>72 heures</strong>. Pensez à vérifier vos spams.
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div variants={fadeUp} className="my-7 h-px w-full bg-gradient-to-r from-transparent via-[#dde5d8] to-transparent" />

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
                {/* Primary CTA — resend */}
                <Link
                  href={`/auth/resend-email${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#dde5d8] bg-[#f8faf6] px-5 py-3 text-sm font-semibold text-[#0F2D20] transition hover:border-[#0F2D20] hover:bg-[#f0f5ef] hover:shadow-[0_4px_16px_rgba(15,45,32,0.1)]"
                >
                  <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                  Renvoyer l&rsquo;e-mail de confirmation
                </Link>

                {/* Secondary CTA — login */}
                <Link
                  href="/auth/login"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2D20] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,45,32,0.22)] transition hover:shadow-[0_12px_32px_rgba(15,45,32,0.3)]"
                >
                  Se connecter
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* Footer note */}
              <motion.p variants={fadeUp} className="mt-6 text-xs text-[#9aab94]">
                Vous avez un problème ?{" "}
                <a href="mailto:support@atelierduterroir.com" className="font-semibold text-[#0F2D20] underline-offset-2 hover:underline">
                  Contactez le support technique
                </a>
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
