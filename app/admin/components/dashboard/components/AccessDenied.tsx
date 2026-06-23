

// // app/admin/components/AccessDenied.tsx
// "use client";

// import Link from "next/link";
// import { motion } from "framer-motion";
// import Lottie from "lottie-react";
// import { ShieldAlert, ArrowRight, Lock, AlertTriangle } from "lucide-react";
// import errorAnimation from "@/public/assets/lottis/error6.json";
// import { useThemeStore } from '@/store/theme.store';

// export default function AccessDenied() {
//   const { resolvedTheme: theme } = useThemeStore();
//   const isDark = theme === "dark";

//   return (
//     <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12 md:px-6 lg:py-16">
//       {/* Décorations de fond */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
//         <div className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-highlight/8 blur-3xl" />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//         className="relative w-full max-w-5xl"
//       >
//         <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl">
//           <div className="grid md:grid-cols-2">
//             {/* Colonne gauche : illustration Lottie et message */}
//             <div className="relative bg-gradient-to-br from-primary/5 via-highlight/5 to-transparent p-8 md:p-10 flex flex-col items-center justify-center">
//               <div className="absolute inset-0 opacity-20">
//                 <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
//                 <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-highlight/20 blur-3xl" />
//               </div>
//               <div className="relative z-10 text-center">
//                 <div className="mb-6 flex justify-center">
//                   <div className="w-64 h-64">
//                     <Lottie animationData={errorAnimation} loop={true} className="w-full h-full" />
//                   </div>
//                 </div>
//                 <h2 className="text-2xl font-bold text-foreground">Accès restreint</h2>
//                 <p className="mt-2 text-muted-foreground">
//                   Zone réservée aux administrateurs
//                 </p>
//               </div>
//             </div>

//             {/* Colonne droite : explications et actions */}
//             <div className="flex flex-col justify-center p-8 md:p-10">
//               <div className="mb-6">
//                 <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-error">
//                   <ShieldAlert className="h-3 w-3" />
//                   Permission refusée
//                 </div>
//                 <h1 className="text-3xl font-bold text-foreground">Vous n&apos;avez pas accès</h1>
//                 <p className="mt-2 text-muted-foreground">
//                   Cette section nécessite des droits d&apos;administration.
//                 </p>
//               </div>

//               <div className="space-y-4 rounded-2xl bg-surface-alt p-5">
//                 <div className="flex items-start gap-3">
//                   <div className="mt-0.5 rounded-full bg-error/10 p-1.5">
//                     <Lock className="h-4 w-4 text-error" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-foreground">Compte non autorisé</p>
//                     <p className="text-sm text-muted-foreground">
//                       Votre compte n&apos;a pas les privilèges d&apos;administration requis.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
//                     <AlertTriangle className="h-4 w-4 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-foreground">Actions bloquées</p>
//                     <p className="text-sm text-muted-foreground">
//                       Vous ne pouvez pas accéder aux produits, commandes, ou paramètres.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//                 <Link
//                   href="/auth/login"
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
//                 >
//                   Se connecter avec un compte admin
//                   <ArrowRight className="h-4 w-4" />
//                 </Link>
//                 <Link
//                   href="/"
//                   className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-surface-alt"
//                 >
//                   Retour à l&apos;accueil
//                 </Link>
//               </div>

//               <div className="mt-6 text-center text-xs text-muted-foreground">
//                 <p>Contactez le support si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }













































// app/admin/components/dashboard/components/AccessDenied.tsx
"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Lottie from "lottie-react";
import { ShieldAlert, ArrowRight, Lock, AlertTriangle, Mail } from "lucide-react";
import errorAnimation from "@/public/assets/lottis/error6.json";
import { useThemeStore } from '@/store/theme.store';

/* -------------------------------------------------------------------------- */
/*  Variantes d'animation (purement visuelles, aucune logique métier touchée)  */
/* -------------------------------------------------------------------------- */

const containerStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AccessDenied() {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12 md:px-6 lg:py-16">
      {/* Décorations de fond, légère dérive ambiante */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-highlight/8 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl ring-1 ring-black/5">
          {/* Liseré signature : dégradé animé, cohérent avec le reste de l'app */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-error/70 via-primary to-error/70 opacity-90"
            style={{ backgroundSize: "200% 100%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="grid md:grid-cols-2">
            {/* Colonne gauche : illustration Lottie et message */}
            <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-highlight/5 to-transparent p-8 md:p-10">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-highlight/20 blur-3xl" />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 text-center"
              >
                <div className="relative mb-6 flex justify-center">
                  {/* Halo ambiant pulsé derrière l'animation */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-6 rounded-full bg-gradient-to-br from-error/25 to-primary/25 blur-2xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative h-64 w-64">
                    <Lottie animationData={errorAnimation} loop className="h-full w-full" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Accès restreint
                </h2>
                <p className="mt-2 text-muted-foreground">Zone réservée aux administrateurs</p>
              </motion.div>
            </div>

            {/* Colonne droite : explications et actions */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col justify-center p-8 md:p-10"
            >
              <motion.div variants={fadeUp} className="mb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-error">
                  <span className="relative flex h-2 w-2">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full bg-error/60"
                      animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
                  </span>
                  <ShieldAlert className="h-3 w-3" />
                  Permission refusée
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Vous n&apos;avez pas accès
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Cette section nécessite des droits d&apos;administration.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="relative space-y-1.5 overflow-hidden rounded-2xl border border-border bg-surface-alt p-5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                />
                <div className="relative flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface/60">
                  <div className="mt-0.5 shrink-0 rounded-full bg-error/10 p-1.5">
                    <Lock className="h-4 w-4 text-error" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Compte non autorisé</p>
                    <p className="text-sm text-muted-foreground">
                      Votre compte n&apos;a pas les privilèges d&apos;administration requis.
                    </p>
                  </div>
                </div>
                <div className="relative flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface/60">
                  <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1.5">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Actions bloquées</p>
                    <p className="text-sm text-muted-foreground">
                      Vous ne pouvez pas accéder aux produits, commandes, ou paramètres.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/auth/login"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 sm:w-auto"
                  >
                    Se connecter avec un compte admin
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-surface-alt sm:w-auto"
                  >
                    Retour à l&apos;accueil
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                <p>Contactez le support si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}