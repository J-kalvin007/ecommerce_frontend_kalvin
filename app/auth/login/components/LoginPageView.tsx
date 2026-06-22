


"use client";

import Link from "next/link";
import { Suspense } from "react"; import LoginClient from "./LoginClient";
import { motion } from "framer-motion";
import { ArrowRight, Home, Leaf, UserPlus } from "lucide-react";
import { ContainerFormAuth } from "../../components/ContainerFormAuth";
import { LoginForm } from "./LoginForm";

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

export function LoginPageView({ redirectPath }: { redirectPath?: string }) {
  return (
    <ContainerFormAuth
      badge="Authentification"
      title="Connexion a la plateforme."
      description="Une seule connexion pour tous. Apres authentification, les admins vont sur /admin, les clients sur /dashboard."
      sidePanel={
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="flex flex-wrap gap-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-[#d8c4ab] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f4d3f] backdrop-blur transition-colors hover:border-[#8b5e34] hover:text-[#8b5e34]"
            >
              <Home className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Retour accueil
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1f4d3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(31,77,63,0.22)] transition-all hover:bg-[#173a30] hover:shadow-[0_18px_36px_rgba(31,77,63,0.28)]"
            >
              <UserPlus className="h-4 w-4" />
              Creer un compte
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      }
      formPanel={
        <Suspense
          fallback={
            <div className="relative w-full">
              <Leaf className="pointer-events-none absolute -left-6 top-8 h-10 w-10 rotate-[-24deg] text-[#1f4d3f]/10" />
              <div className="relative h-[38rem] w-full overflow-hidden rounded-[2rem] border border-black/10 bg-white/85 shadow-[0_30px_80px_rgba(24,37,24,0.12)]">
                <ShimmerBlock className="h-40 rounded-none bg-gradient-to-r from-[#1f4d3f] to-[#8b5e34]" />
                <div className="space-y-4 p-8">
                  <ShimmerBlock className="h-16 bg-[#f3faf5]" />
                  <ShimmerBlock className="h-12 bg-[#fbfcf7]" />
                  <ShimmerBlock className="h-12 bg-[#fbfcf7]" />
                  <ShimmerBlock className="h-12 bg-[#1f4d3f]/15" />
                </div>
              </div>
            </div>
          }
        >
          <LoginForm redirectPath={redirectPath} />
          {/* <LoginClient /> */}
        </Suspense>
      }
    />
  );
}