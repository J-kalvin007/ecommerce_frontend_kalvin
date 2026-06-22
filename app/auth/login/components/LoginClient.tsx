





"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  User,
  Leaf,
  Star,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { login as loginApi } from "@/fonctions_api/auth.api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/special/Toast";


export default function LoginClient() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    setToast({ ...toast, show: false });
    setIsLoading(true);

    const result = await loginApi({
      username: username.includes("@") ? undefined : username,
      email: username.includes("@") ? username : undefined,
      password,
    });

    setIsLoading(false);

    if (!result.ok) {
      const errorData = result.error.raw;
      const errorMessage =
        (Array.isArray(errorData?.detail) ? errorData.detail[0] : errorData?.detail) ||
        (Array.isArray(errorData?.non_field_errors)
          ? errorData.non_field_errors[0]
          : errorData?.non_field_errors) ||
        (Array.isArray(errorData?.email) ? errorData.email[0] : errorData?.email) ||
        (Array.isArray(errorData?.username) ? errorData.username[0] : errorData?.username) ||
        result.error.message ||
        "Connexion impossible. Vérifiez vos identifiants.";

      setToast({ show: true, type: "error", message: String(errorMessage) });
      return;
    }

    setToast({ show: true, type: "success", message: "Connexion réussie !" });

    setUser(result.data.user, result.data.key);

    setTimeout(() => {
      router.push(result.data.user.role === "platform_admin" ? "/admin" : "/dashboard_client");
    }, 1000);
  };

  return (
    <>
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="relative flex min-h-[90vh] items-center justify-center px-4 py-12 md:px-6 lg:py-16">
        {/* Décorations de fond premium */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-highlight/8 blur-3xl" />
          <Leaf className="absolute left-[5%] top-[12%] h-12 w-12 text-primary/20 rotate-12" />
          <Leaf className="absolute right-[8%] bottom-[15%] h-16 w-16 text-highlight/15 -rotate-45" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative w-full max-w-6xl"
        >
          <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl">
            <div className="grid md:grid-cols-2">
              {/* ========== COLONNE GAUCHE – BRANDING & MESSAGES ========== */}
              <div className="relative bg-gradient-to-br from-primary/5 via-highlight/5 to-transparent p-8 md:p-10">
                {/* Motif ornemental en arrière-plan */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-highlight/20 blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                  {/* Logo + titre */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md dark:bg-surface-alt">
                      <Image
                        src="/assets/images/LOGO.png"
                        alt="L'Atelier du Terroir"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        Atelier du Terroir
                      </h2>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                        Deal & Consulting
                      </p>
                    </div>
                  </div>

                  {/* Accroche principale */}
                  <div className="mb-6">
                    <h1 className="font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                      Retrouvez votre
                      <span className="text-primary"> authenticité</span>
                    </h1>
                    <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
                      <div className="h-px w-8 bg-primary/50" />
                      <p className="text-sm font-medium text-muted">
                        Le goût du terroir, livré chez vous
                      </p>
                    </div>
                  </div>

                  {/* Liste d'avantages premium */}
                  <div className="mt-4 space-y-3">
                    {[
                      { icon: Leaf, text: "Produits 100% naturels et locaux" },
                      { icon: Star, text: "Qualité premium sélectionnée avec soin" },
                      { icon: Truck, text: "Livraison rapide et traçabilité" },
                      { icon: ShieldCheck, text: "Paiement sécurisé et support dédié" },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80">
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Témoignage / citation */}
                  <div className="mt-8 rounded-2xl border border-border/50 bg-white/30 p-4 backdrop-blur-sm dark:bg-black/20">
                    <p className="text-sm italic text-muted-foreground">
                      “Une connexion simple et sécurisée pour accéder à mes produits
                      préférés. L’équipe est réactive et la qualité toujours au rendez-vous.”
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20" />
                      <span className="text-xs font-semibold text-foreground">
                        – Mariam K.
                      </span>
                      <div className="flex text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== COLONNE DROITE – FORMULAIRE DE CONNEXION ========== */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-6 text-center md:text-left">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3 w-3" />
                    Accès membre
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Bienvenue</h2>
                  <p className="mt-1 text-sm text-muted">
                    Connectez-vous avec votre email ou nom d’utilisateur
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email ou identifiant
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="exemple@domaine.com ou pseudonyme"
                        required
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground"
                      >
                        Mot de passe
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-medium text-primary transition hover:underline"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Votre mot de passe"
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                      isLoading
                        ? "cursor-not-allowed bg-primary/70"
                        : "bg-gradient-to-r from-primary to-primary/90 hover:shadow-glow hover:scale-[1.02]"
                    )}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-muted">
                    Pas encore de compte ?{" "}
                    <Link
                      href="/auth/register"
                      className="font-semibold text-primary transition hover:underline"
                    >
                      Créer un compte
                    </Link>
                  </p>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted">
                  <div className="h-px w-8 bg-border" />
                  <span>Connexion sécurisée</span>
                  <div className="h-px w-8 bg-border" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

















