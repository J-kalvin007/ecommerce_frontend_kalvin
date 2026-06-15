

// app/admin/components/AccessDenied.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { ShieldAlert, ArrowRight, Lock, AlertTriangle } from "lucide-react";
import errorAnimation from "@/public/assets/lottis/error6.json";
import { useTheme } from "@/hooks/useTheme";

export default function AccessDenied() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12 md:px-6 lg:py-16">
      {/* Décorations de fond */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-highlight/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl"
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl">
          <div className="grid md:grid-cols-2">
            {/* Colonne gauche : illustration Lottie et message */}
            <div className="relative bg-gradient-to-br from-primary/5 via-highlight/5 to-transparent p-8 md:p-10 flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-highlight/20 blur-3xl" />
              </div>
              <div className="relative z-10 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-64 h-64">
                    <Lottie animationData={errorAnimation} loop={true} className="w-full h-full" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Accès restreint</h2>
                <p className="mt-2 text-muted-foreground">
                  Zone réservée aux administrateurs
                </p>
              </div>
            </div>

            {/* Colonne droite : explications et actions */}
            <div className="flex flex-col justify-center p-8 md:p-10">
              <div className="mb-6">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-error">
                  <ShieldAlert className="h-3 w-3" />
                  Permission refusée
                </div>
                <h1 className="text-3xl font-bold text-foreground">Vous n&apos;avez pas accès</h1>
                <p className="mt-2 text-muted-foreground">
                  Cette section nécessite des droits d&apos;administration.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl bg-surface-alt p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-error/10 p-1.5">
                    <Lock className="h-4 w-4 text-error" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Compte non autorisé</p>
                    <p className="text-sm text-muted-foreground">
                      Votre compte n&apos;a pas les privilèges d&apos;administration requis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Actions bloquées</p>
                    <p className="text-sm text-muted-foreground">
                      Vous ne pouvez pas accéder aux produits, commandes, ou paramètres.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                >
                  Se connecter avec un compte admin
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-surface-alt"
                >
                  Retour à l&apos;accueil
                </Link>
              </div>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>Contactez le support si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}