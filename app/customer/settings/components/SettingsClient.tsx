/**
 * SettingsClient.tsx — Paramètres du compte client
 * ─────────────────────────────────────────────────────────────────────────────
 * Page de gestion du profil et de la sécurité du compte.
 *
 * Sections :
 *   1. Informations personnelles (nom, email, téléphone)
 *   2. Sécurité (changement de mot de passe)
 *   3. Panneau latéral : résumé du compte avec badges
 *
 * @module app/customer/settings/SettingsClient
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  Save,
  Settings,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import CustomerShell from "@/app/customer/components/CustomerShell";
import { getCurrentUser, patchUser, changePassword } from "@/fonctions_api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { mediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import LoadingStyle from "@/components/special/loadingStyle";

/* ── Types locaux ──────────────────────────────────────────────────────────── */

type ProfileForm = {
  name: string;
  email: string;
  phone_number: string;
};

type PasswordForm = {
  new_password1: string;
  new_password2: string;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

/* ── Sous-composants ───────────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "rgba(31,77,63,0.08)",
          border: "1.5px solid rgba(31,77,63,0.15)",
        }}
      >
        <Icon className="h-5 w-5 text-[#1f4d3f]" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-[16px] font-bold text-[#1f241c]">{title}</h2>
        <p className="mt-0.5 text-[14px] text-[#8A9080]">{subtitle}</p>
      </div>
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-4 py-3 text-[14px] font-medium",
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FieldWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8A9080]">
        {label}
      </label>
      {children}
    </div>
  );
}

function StyledInput({
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightSlot,
  disabled,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ElementType;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9080]">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border border-[#E8E3D8] bg-white py-2.5 pl-10 pr-4 text-[15px] text-[#1f241c] outline-none transition-all",
          "placeholder:text-[#C4BFB6]",
          "focus:border-[#1f4d3f]/40 focus:ring-2 focus:ring-[#1f4d3f]/10",
          "disabled:cursor-not-allowed disabled:bg-[#F7F5F0] disabled:text-[#8A9080]",
          rightSlot && "pr-11"
        )}
      />
      {rightSlot && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightSlot}
        </span>
      )}
    </div>
  );
}

function SaveButton({
  isLoading,
  label = "Enregistrer les modifications",
}: {
  isLoading: boolean;
  label?: string;
}) {
  return (
    <motion.button
      type="submit"
      disabled={isLoading}
      whileHover={{ scale: isLoading ? 1 : 1.01 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      className={cn(
        "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all cursor-pointer",
        isLoading
          ? "cursor-not-allowed bg-[#1f4d3f]/60"
          : "bg-[#1f4d3f] hover:bg-[#17392f] hover:shadow-md"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isLoading ? "Enregistrement…" : label}
    </motion.button>
  );
}

/* ── Composant principal ───────────────────────────────────────────────────── */

export default function SettingsClient() {
  const { user, updateProfile: updateAuthStore } = useAuthStore();

  /* --- Profil ---------------------------------------------------------------- */
  const [profile, setProfile] = useState<ProfileForm>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone_number: user?.phone_number ?? "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);

  /* --- Mot de passe ---------------------------------------------------------- */
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    new_password1: "",
    new_password2: "",
  });
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [isSavingPwd, setIsSavingPwd] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<FeedbackState>(null);

  /* --- Chargement du profil depuis l'API ------------------------------------ */
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await getCurrentUser();
        if (!mounted) return;
        if (!res.ok) throw new Error(res.error.message);
        updateAuthStore(res.data);
        setProfile({
          name: res.data.name ?? "",
          email: res.data.email ?? "",
          phone_number: res.data.phone_number ?? "",
        });
      } catch (err) {
        // On garde les données du store si l'API échoue
      } finally {
        if (mounted) setIsLoadingProfile(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [updateAuthStore]);

  /* --- Auto-dismiss feedback après 4s --------------------------------------- */
  const showProfileFeedback = useCallback((fb: FeedbackState) => {
    setProfileFeedback(fb);
    if (fb?.type === "success") {
      window.setTimeout(() => setProfileFeedback(null), 4000);
    }
  }, []);

  const showPwdFeedback = useCallback((fb: FeedbackState) => {
    setPwdFeedback(fb);
    if (fb?.type === "success") {
      window.setTimeout(() => setPwdFeedback(null), 4000);
    }
  }, []);

  /* --- Soumission profil ----------------------------------------------------- */
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    showProfileFeedback(null);

    try {
      const res = await patchUser((user as any)?.id ?? 0, {
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number,
      });

      if (!res.ok) throw new Error(res.error.message);

      updateAuthStore(res.data);
      setProfile({
        name: res.data.name ?? "",
        email: res.data.email ?? "",
        phone_number: res.data.phone_number ?? "",
      });
      showProfileFeedback({ type: "success", message: "Profil mis à jour avec succès !" });
    } catch (err) {
      showProfileFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "La mise à jour a échoué.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  /* --- Soumission mot de passe ----------------------------------------------- */
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSavingPwd) return;

    if (passwordForm.new_password1.length < 8) {
      showPwdFeedback({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (passwordForm.new_password1 !== passwordForm.new_password2) {
      showPwdFeedback({ type: "error", message: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setIsSavingPwd(true);
    showPwdFeedback(null);

    try {
      const res = await changePassword({
        new_password1: passwordForm.new_password1,
        new_password2: passwordForm.new_password2,
      });

      if (!res.ok) throw new Error(res.error.message);

      setPasswordForm({ new_password1: "", new_password2: "" });
      showPwdFeedback({ type: "success", message: "Mot de passe modifié avec succès !" });
    } catch (err) {
      showPwdFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "La modification a échoué.",
      });
    } finally {
      setIsSavingPwd(false);
    }
  }

  /* --- Avatar initiales ------------------------------------------------------- */
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarSrc = user?.profile_image ? mediaUrl(user.profile_image) : null;

  /* ── Rendu ─────────────────────────────────────────────────────────────────── */
  return (
    <CustomerShell activeSection="settings">
      <div className="mx-auto max-w-8xl px-20 py-8 sm:px-6 lg:px-20 space-y-10">

        {/* ── En-tête avec effet premium ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <div className="relative inline-block group">
            <h2
              className="relative text-2xl uppercase font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-4xl premium-title-shine flex items-center gap-3"
              style={{
                letterSpacing: "-0.025em",
                backgroundImage:
                  "linear-gradient(110deg, #0D2E1E 0%, #1F4D34 45%, #0D2E1E 90%)",
                backgroundSize: "220% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <Settings className="h-10 w-10 text-amber-500 shrink-0" style={{ fill: "url(#gold-gradient)" }} />
              Paramètres du compte
            </h2>

            {/* Kicker discret en lettres espacées doré, signature premium */}
            <span
              className="block text-[11px] font-semibold uppercase tracking-[0.35em] mt-2 mb-2"
              style={{ color: "#B8924A", opacity: 0.85 }}
            >
              Gérez vos informations personnelles et la sécurité de votre compte.
            </span>

            {/* Gradient SVG caché pour l'icône */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>

            {/* Animations scoppées, avec respect du prefers-reduced-motion */}
            <style>{`
              @keyframes premium-title-shine-anim {
                0%, 100% { background-position: 0% center; }
                50% { background-position: 100% center; }
              }
              .premium-title-shine {
                animation: premium-title-shine-anim 6s ease-in-out infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .premium-title-shine {
                  animation: none;
                }
              }
            `}</style>
          </div>
        </motion.div>

        {/* ── Grille principale ── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_300px]">

          {/* ── Colonne gauche ── */}
          <div className="space-y-6">

            {/* ── Section Profil ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[#E8E3D8] bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]"
            >
              <SectionHeader
                icon={UserIcon}
                title="Informations personnelles"
                subtitle="Mettez à jour votre nom, votre email et votre numéro de téléphone."
              />

              {isLoadingProfile ? (

                <div className="flex min-h-48 items-center justify-center">
                  <LoadingStyle label="Chargement du profil…" />
                </div>

              ) : (

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldWrapper label="Nom complet">
                      <StyledInput
                        value={profile.name}
                        onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
                        placeholder="Jonas Eméga"
                        icon={UserIcon}
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Adresse e-mail">
                      <StyledInput
                        type="email"
                        value={profile.email}
                        onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
                        placeholder="shaun@example.com"
                        icon={Mail}
                      />
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label="Téléphone">
                    <StyledInput
                      type="tel"
                      value={profile.phone_number}
                      onChange={(v) => setProfile((p) => ({ ...p, phone_number: v }))}
                      placeholder="+228 98 45 23 67"
                      icon={Phone}
                    />
                  </FieldWrapper>

                  <FeedbackBanner feedback={profileFeedback} />

                  <div className="flex justify-end pt-1">
                    <SaveButton isLoading={isSavingProfile} />
                  </div>
                </form>
              )}
            </motion.div>

            {/* ── Section Sécurité ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[#E8E3D8] bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]"
            >
              <SectionHeader
                icon={Lock}
                title="Sécurité"
                subtitle="Choisissez un nouveau mot de passe fort pour protéger votre compte."
              />

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrapper label="Nouveau mot de passe">
                    <StyledInput
                      type={showPwd1 ? "text" : "password"}
                      value={passwordForm.new_password1}
                      onChange={(v) => setPasswordForm((p) => ({ ...p, new_password1: v }))}
                      placeholder="••••••••"
                      icon={Lock}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPwd1((s) => !s)}
                          className="text-[#8A9080] transition-colors hover:text-[#1f4d3f] cursor-pointer"
                        >
                          {showPwd1 ? (
                            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                          ) : (
                            <Eye className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </button>
                      }
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Confirmer le mot de passe">
                    <StyledInput
                      type={showPwd2 ? "text" : "password"}
                      value={passwordForm.new_password2}
                      onChange={(v) => setPasswordForm((p) => ({ ...p, new_password2: v }))}
                      placeholder="••••••••"
                      icon={Lock}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPwd2((s) => !s)}
                          className="text-[#8A9080] transition-colors hover:text-[#1f4d3f] cursor-pointer"
                        >
                          {showPwd2 ? (
                            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                          ) : (
                            <Eye className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </button>
                      }
                    />
                  </FieldWrapper>
                </div>

                {/* Indicateur de correspondance */}
                <AnimatePresence>
                  {passwordForm.new_password1 && passwordForm.new_password2 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-medium",
                          passwordForm.new_password1 === passwordForm.new_password2
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        )}
                      >
                        {passwordForm.new_password1 === passwordForm.new_password2 ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {passwordForm.new_password1 === passwordForm.new_password2
                          ? "Les mots de passe correspondent"
                          : "Les mots de passe ne correspondent pas"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <FeedbackBanner feedback={pwdFeedback} />

                <div className="flex justify-end pt-1">
                  <SaveButton isLoading={isSavingPwd} label="Modifier le mot de passe" />
                </div>
              </form>
            </motion.div>
          </div>

          {/* ── Colonne droite : résumé du compte ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Carte profil */}
            <div className="rounded-2xl border border-[#E8E3D8] bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
              <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8A9080]">
                Votre compte
              </p>

              {/* Avatar */}
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name ?? "Avatar"}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-2xl text-lg font-black text-white"
                      style={{ background: "linear-gradient(135deg, #1f4d3f, #2d6e58)" }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-bold text-[#1f241c]">
                    {user?.name || "—"}
                  </p>
                  <p className="truncate text-[14px] text-[#8A9080]">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium",
                    user?.is_verified
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  {user?.is_verified ? (
                    <BadgeCheck className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {user?.is_verified ? "Email vérifié" : "Email non vérifié"}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium",
                    user?.is_active
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {user?.is_active ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0" />
                  )}
                  {user?.is_active ? "Compte actif" : "Compte désactivé"}
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#E8E3D8] bg-[#F7F5F0] px-3 py-2.5 text-[14px] font-medium text-[#8A9080]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#1f4d3f]" />
                  {user?.role === "platform_admin" ? "Administrateur" : "Client"}
                </div>
              </div>
            </div>

            {/* Note de sécurité */}
            <div className="rounded-2xl border border-[#E8E3D8] bg-[#F7F5F0] p-4">
              <p className="mb-1.5 flex items-center gap-2 text-[14px] font-semibold text-[#1f241c]">
                <Lock className="h-3.5 w-3.5 text-[#1f4d3f]" strokeWidth={2} />
                Conseils de sécurité
              </p>
              <ul className="space-y-1 text-[13px] leading-5 text-[#8A9080]">
                <li>• Utilisez au moins 8 caractères</li>
                <li>• Mélangez lettres, chiffres et symboles</li>
                <li>• Ne réutilisez pas un ancien mot de passe</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </CustomerShell>
  );
}
