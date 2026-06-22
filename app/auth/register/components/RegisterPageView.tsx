"use client";

import Link from "next/link";
import { Suspense } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ContainerFormAuth } from "../../components/ContainerFormAuth";
import { RegisterForm } from "./RegisterForm";

const benefits = [
  "Compte unique pour commander depuis mobile, tablette ou ordinateur",
  "Acces au wallet pour deposer des fonds et payer progressivement",
  "Suivi des commandes, livraisons et historiques d'achat",
  "Statuts de fidelite evolutifs avec reductions et cashback",
];

/* -------------------------------------------------------------------------- */
/*  Variantes d'animation (purement visuelles, aucune logique métier touchée)  */
/* -------------------------------------------------------------------------- */

const containerStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ------------------------------------------------------------------ */
/*  Petit bloc shimmer réutilisable pour le squelette de chargement    */
/* ------------------------------------------------------------------ */
function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{ x: ["-120%", "220%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function RegisterPageView() {
  return (
    <ContainerFormAuth
      badge="Ouverture de compte"
      sidePanel={
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative overflow-hidden rounded-[2rem] border border-[#e4d7c7] bg-white/82 p-6 shadow-[0_24px_60px_rgba(58,42,18,0.08)] backdrop-blur"
        >
          {/* Liseré signature, cohérent avec le reste du thème */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8b5e34] via-[#1f4d3f] to-[#8b5e34] opacity-80" />

          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
                  Pourquoi creer un compte
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Une experience centralisee</h2>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-[#d8c4ab] px-4 py-2 text-sm font-semibold text-[#1f4d3f] transition-colors hover:border-[#8b5e34] hover:text-[#8b5e34]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Retour connexion
                </Link>
              </motion.div>
            </motion.div>

            <div className="mt-6 grid gap-3">
              {benefits.map((item) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 rounded-[1.25rem] border border-[#efe5d8] bg-[#fbf7f1] px-4 py-4 text-sm leading-7 text-[#5a6755] transition-colors hover:bg-[#f7f1e7]"
                >
                  <span className="mt-0.5 shrink-0 rounded-full bg-[#1f4d3f]/10 p-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1f4d3f]" />
                  </span>
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>
      }
      formPanel={
        <Suspense
          fallback={
            <div className="relative h-[40rem] w-full overflow-hidden rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-[0_30px_80px_rgba(24,37,24,0.12)]">
              <div className="space-y-4">
                <ShimmerBlock className="h-16 bg-[#f3faf5]" />
                <ShimmerBlock className="h-12 bg-[#fbfcf7]" />
                <ShimmerBlock className="h-12 bg-[#fbfcf7]" />
                <ShimmerBlock className="h-12 bg-[#fbfcf7]" />
                <ShimmerBlock className="h-12 bg-[#1f4d3f]/15" />
              </div>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      }
    />
  );
}