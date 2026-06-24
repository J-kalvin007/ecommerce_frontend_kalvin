



"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { mediaUrl } from "@/lib/mediaUrl";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  LogOut,
  X,
  Phone,
  Mail,
  Calendar,
  Globe,
  CheckCircle,
  ShieldCheck,
  Lock,
  UserRound,
  Edit2,
  Save,
  Loader2,
  Key,
  Camera,
  Upload,
  Trash2,
  AtSign,
  Sparkles,
  Clock3,
  Activity,
  Copy,
  Check,
  UserStar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PhoneInputWithCountry from "@/components/special/PhoneInputWithCountry";
import { patchUser, changePassword } from "@/fonctions_api/auth.api";
import { getToken } from "@/lib/axios";
import { useThemeStore } from '@/store/theme.store';
import ConfirmDialog from "@/components/widgets_originaux/special/ConfirmDialog";
import Toast from "@/components/notifications/Toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/widgets_originaux/special/ui/Dialog";
import type { User } from "@/modeles/user";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: User | null;
  onLogout: () => void;
  onProfileUpdate: (user: Partial<User>) => void;
}

/* -------------------------------------------------------------------------- */
/*  Variantes d'animation (purement visuelles, aucune logique métier touchée)  */
/* -------------------------------------------------------------------------- */

const containerStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
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

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onLogout,
  onProfileUpdate,
}: ProfileModalProps) {
  const router = useRouter();
  const { resolvedTheme: theme } = useThemeStore();

  // États locaux
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  // Édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passData, setPassData] = useState({
    new_password1: "",
    new_password2: "",
  });

  // Copie rapide d'une valeur (purement cosmétique / utilitaire UI)
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mise à jour des données du formulaire quand le profil change
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number || "",
      });
      setProfileImage(profile.profile_image || null);
      setImagePreview(profile.profile_image || null);
    }
  }, [profile]);

  // Nettoyer les états lors de la fermeture
  const handleClose = () => {
    setIsEditingProfile(false);
    setIsChangingPassword(false);
    setPassData({ new_password1: "", new_password2: "" });
    setImageFile(null);
    setImagePreview(profile?.profile_image || null);
    onClose();
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const roleLabel = profile?.role === "platform_admin" ? "Administrateur" : "Client";
  const roleColor =
    profile?.role === "platform_admin"
      ? "from-orange-500 to-orange-600"
      : "from-green-500 to-green-600";

  // Gestionnaire de modification de la photo
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Copie rapide d'une valeur dans le presse-papiers (ex. l'email)
  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1600);
    } catch {
      // Presse-papiers indisponible dans ce contexte : on ignore silencieusement.
    }
  };

  // Mise à jour du profil (nom, email, téléphone, photo)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    // Construction du FormData pour l'upload éventuel de la photo
    const updatePayload: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number,
    };

    // Si un fichier image a été sélectionné, on l'envoie en multipart
    if (imageFile) {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone_number", formData.phone_number);
      formDataObj.append("profile_image", imageFile);
      // Appel API spécial pour l'upload (patchUser ne gère pas le multipart)
      // On va utiliser fetch directement sur l'endpoint PATCH /api/users/{id}/
      try {
        const token = getToken(); // Utilisation du helper sécurisé qui décrypte le token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile?.id}/`, {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formDataObj,
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour");
        const updatedUser = await response.json();
        onProfileUpdate(updatedUser);
        setToast({ show: true, type: "success", message: "Profil mis à jour avec succès" });
        setIsEditingProfile(false);
        setIsSavingProfile(false);
        return;
      } catch (error) {
        setToast({
          show: true,
          type: "error",
          message: "Impossible de mettre à jour la photo",
        });
        setIsSavingProfile(false);
        return;
      }
    }

    // Pas de nouvelle photo → appel standard patchUser
    const result = await patchUser(profile!.id, updatePayload);
    setIsSavingProfile(false);

    if (result.ok) {
      onProfileUpdate(result.data);
      setToast({ show: true, type: "success", message: "Profil mis à jour avec succès" });
      setIsEditingProfile(false);
    } else {
      setToast({
        show: true,
        type: "error",
        message: result.error.message || "Erreur de mise à jour",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new_password1 !== passData.new_password2) {
      setToast({
        show: true,
        type: "error",
        message: "Les mots de passe ne correspondent pas",
      });
      return;
    }
    setIsSavingPassword(true);
    const result = await changePassword(passData);
    setIsSavingPassword(false);

    if (result.ok) {
      setToast({
        show: true,
        type: "success",
        message: "Mot de passe modifié avec succès",
      });
      setIsChangingPassword(false);
      setPassData({ new_password1: "", new_password2: "" });
    } else {
      setToast({
        show: true,
        type: "error",
        message: result.error.message || "Impossible de changer le mot de passe",
      });
    }
  };

  if (!profile) return null;

  const infoRows = [
    { icon: AtSign, label: "Email", value: profile.email, copyable: true },
    { icon: UserRound, label: "Nom complet", value: profile.name },
    {
      icon: Phone,
      label: "Téléphone",
      value: profile.phone_number || "Non renseigné",
    },
    {
      icon: Activity,
      label: "Statut",
      value: profile.is_active ? "Actif" : "Inactif",
      status: true,
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl overflow-hidden rounded-[28px] border p-0 shadow-2xl ring-1 ring-black/5 bg-white border-black/5 dark:bg-[#121212] dark:border-white/10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[90vh] flex-col"
          >
            {/* Liseré signature : dégradé animé, seul geste "fort" du design */}
            {/* <motion.div
              aria-hidden
              className={cn(
                "absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r",
                roleColor,
                "opacity-90"
              )}
              style={{ backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            /> */}

            {/* Header */}
            <div className="relative flex items-center justify-between gap-4 border-b px-6 py-5 border-black/5 bg-gradient-to-b from-black/[0.02] to-transparent dark:border-white/10 dark:from-white/[0.02]">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
                  <div className="relative rounded-2xl bg-primary/10 p-2.5 ring-1 ring-primary/15">
                    <UserRound className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-black dark:text-white">
                    MON PROFIL
                  </DialogTitle>
                  <DialogDescription className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    Gérez vos informations personnelles
                  </DialogDescription>
                </div>
              </div>


              {/* <motion.button
                onClick={handleClose}
                whileHover={{ rotate: 90, scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="rounded-full p-2 transition-colors text-neutral-500 hover:bg-black/5 hover:text-black dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button> */}

            </div>

            {/* Contenu principal avec scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]"
              >
                {/* Colonne gauche : Avatar et infos statiques */}
                <motion.div variants={fadeUp} className="flex flex-col items-center space-y-6">
                  <div className="group relative">
                    {/* Halo ambiant pulsé */}
                    <motion.div
                      aria-hidden
                      className={cn(
                        "absolute -inset-3 rounded-full bg-gradient-to-br opacity-40 blur-2xl",
                        roleColor
                      )}
                      animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Fin reflet rotatif derrière l'avatar */}
                    <motion.div
                      aria-hidden
                      className="absolute -inset-1 rounded-full"
                      style={{
                        background:
                          "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.65) 8%, transparent 18%)",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />

                    <div
                      className={cn(
                        "relative h-32 w-32 rounded-full  p-[3px] shadow-xl transition-transform duration-300 group-hover:scale-[1.02]",
                        roleColor
                      )}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-full bg-white ring-4 ring-white/80 dark:bg-[#1e1e1e] dark:ring-white/10">
                        {imagePreview ? (
                          <img
                            src={mediaUrl(imagePreview) || ''}
                            alt={profile.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-bold bg-neutral-100 text-black dark:bg-[#1e1e1e] dark:text-white">
                            {getInitials(profile.name)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Indicateur de présence */}
                    <div className="absolute -bottom-1 -left-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-white dark:border-[#121212] dark:bg-[#121212]">
                      <span className="relative flex h-3 w-3">
                        {profile.is_active && (
                          <motion.span
                            className="absolute inline-flex h-full w-full rounded-full bg-green-500/60"
                            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative inline-flex h-3 w-3 rounded-full",
                            profile.is_active ? "bg-green-500" : "bg-neutral-400"
                          )}
                        />
                      </span>
                    </div>

                    <AnimatePresence>
                      {isEditingProfile && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: 8 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute -bottom-1 -right-1 z-10 flex gap-1.5 rounded-full border p-1.5 shadow-lg backdrop-blur-md border-black/5 bg-white/90 dark:border-white/10 dark:bg-[#1e1e1e]/90"
                        >
                          <motion.button
                            onClick={() => fileInputRef.current?.click()}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.92 }}
                            title="Changer la photo"
                            className="rounded-full bg-primary p-1.5 text-white shadow-md transition hover:bg-primary/90"
                            type="button"
                          >
                            <Camera className="h-3.5 w-3.5" />
                          </motion.button>
                          {imagePreview && imagePreview !== profile.profile_image && (
                            <motion.button
                              onClick={removeImage}
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.92 }}
                              title="Retirer la photo"
                              className="rounded-full bg-error p-1.5 text-white shadow-md transition hover:bg-error/90"
                              type="button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </motion.button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">{profile.name}</h3>

                    <div className="flex items-center justify-center gap-2">

                      <div
                        className={cn(
                          "relative mt-2 inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
                          roleColor
                        )}
                      >
                        <motion.div
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/40"
                          animate={{ x: ["-150%", "350%"] }}
                          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
                        />
                        <span className="relative z-10 flex items-center gap-1.5">
                          {profile.role === "platform_admin" ? (
                            <UserStar className="h-3 w-3" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                          {roleLabel}
                        </span>

                      </div>

                      {profile.is_verified && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Compte vérifié</span>
                        </div>
                      )}


                    </div>

                  </div>

                  {/* Séparateur "cachet" */}
                  <div className="flex w-full items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <div className="h-1.5 w-1.5 rotate-45 bg-primary/40" />
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="relative w-full overflow-hidden rounded-2xl border p-4 text-center border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-[#1e1e1e]">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, currentColor 1px, transparent 1px)",
                        backgroundSize: "12px 12px",
                      }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      <div className="rounded-full bg-primary/10 p-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Membre depuis le
                      </p>
                    </div>
                    <p className="relative mt-1.5 text-sm font-semibold tabular-nums text-black dark:text-white">
                      {new Date().toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </motion.div>

                {/* Colonne droite : formulaires d'édition */}
                <div className="space-y-6 lg:col-span-1">
                  {/* Bloc Informations personnelles */}
                  <motion.div
                    variants={fadeUp}
                    className="rounded-2xl border p-5 transition-shadow hover:shadow-sm sm:p-6 border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-[#1e1e1e]"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h4 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-black dark:text-white">
                        <span className="rounded-xl bg-primary/10 p-1.5">
                          <UserRound className="h-4.5 w-4.5 text-primary" />
                        </span>
                        Informations personnelles
                      </h4>
                      {!isEditingProfile ? (
                        <motion.button
                          onClick={() => setIsEditingProfile(true)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-sm transition bg-white text-green-600 hover:bg-neutral-100 dark:bg-[#2a2a2a] dark:text-green-400 dark:hover:bg-[#333]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Modifier
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => {
                            setIsEditingProfile(false);
                            setFormData({
                              name: profile.name,
                              email: profile.email,
                              phone_number: profile.phone_number || "",
                            });
                            setImagePreview(profile.profile_image || null);
                            setImageFile(null);
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="rounded-xl px-3.5 py-1.5 text-xs font-semibold transition bg-white text-neutral-500 hover:bg-neutral-100 dark:bg-[#2a2a2a] dark:text-neutral-400 dark:hover:bg-[#333]"
                        >
                          Annuler
                        </motion.button>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {!isEditingProfile ? (
                        <motion.div
                          key="view"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
                        >
                          {infoRows.map(({ icon: Icon, label, value, copyable, status }) => (
                            <div
                              key={label}
                              className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white dark:hover:bg-[#2a2a2a]"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  {label}
                                </p>
                                {status ? (
                                  <span
                                    className={cn(
                                      "mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                                      profile.is_active
                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                        : "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        profile.is_active ? "bg-green-500" : "bg-neutral-400"
                                      )}
                                    />
                                    {value}
                                  </span>
                                ) : (
                                  <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                    {value}
                                  </p>
                                )}
                              </div>
                              {copyable && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(value, label)}
                                  title={`Copier ${label.toLowerCase()}`}
                                  className="shrink-0 rounded-md p-1.5 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-black/5 hover:text-green-600 dark:hover:bg-white/10 dark:hover:text-green-400"
                                >
                                  <AnimatePresence mode="wait" initial={false}>
                                    {copiedField === label ? (
                                      <motion.span
                                        key="check"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        className="block"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </motion.span>
                                    ) : (
                                      <motion.span
                                        key="copy"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        className="block"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </button>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.form
                          key="edit"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          onSubmit={handleUpdateProfile}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Nom complet
                              </label>
                              <div className="group relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-green-500 dark:group-focus-within:text-green-400" />
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                  className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 border-black/5 bg-white text-black dark:border-white/10 dark:bg-[#121212] dark:text-white"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Email
                              </label>
                              <div className="group relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-green-500 dark:group-focus-within:text-green-400" />
                                <input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                  }
                                  className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 border-black/5 bg-white text-black dark:border-white/10 dark:bg-[#121212] dark:text-white"
                                  required
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Téléphone
                              </label>
                              <PhoneInputWithCountry
                                value={formData.phone_number}
                                onChange={(v) => setFormData({ ...formData, phone_number: v })}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <motion.button
                              type="submit"
                              disabled={isSavingProfile}
                              whileHover={{ scale: isSavingProfile ? 1 : 1.02 }}
                              whileTap={{ scale: isSavingProfile ? 1 : 0.98 }}
                              className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-600 disabled:opacity-50"
                            >
                              {isSavingProfile ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Enregistrer
                            </motion.button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Bloc Sécurité (mot de passe) */}
                  <motion.div
                    variants={fadeUp}
                    className="rounded-2xl border p-5 transition-shadow hover:shadow-sm sm:p-6 border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-[#1e1e1e]"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-black dark:text-white">
                        <span className="rounded-xl bg-primary/10 p-1.5">
                          <Lock className="h-4.5 w-4.5 text-primary" />
                        </span>
                        Sécurité
                      </h4>
                      {!isChangingPassword && (
                        <motion.button
                          onClick={() => setIsChangingPassword(true)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-sm transition bg-white text-orange-600 hover:bg-neutral-100 dark:bg-[#2a2a2a] dark:text-orange-400 dark:hover:bg-[#333]"
                        >
                          <Key className="h-3.5 w-3.5" />
                          Changer mon mot de passe
                        </motion.button>
                      )}
                    </div>

                    {!isChangingPassword && (
                      <p className="mt-2.5 text-xs text-muted-foreground">
                        Protégez votre compte avec un mot de passe robuste et unique.
                      </p>
                    )}

                    <AnimatePresence>
                      {isChangingPassword && (
                        <motion.form
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-4 overflow-hidden"
                          onSubmit={handleChangePassword}
                        >
                          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Nouveau mot de passe
                              </label>
                              <div className="group relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400" />
                                <input
                                  type="password"
                                  value={passData.new_password1}
                                  onChange={(e) =>
                                    setPassData({ ...passData, new_password1: e.target.value })
                                  }
                                  className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 border-black/5 bg-white text-black dark:border-white/10 dark:bg-[#121212] dark:text-white"
                                  required
                                  minLength={8}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Confirmation
                              </label>
                              <div className="group relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400" />
                                <input
                                  type="password"
                                  value={passData.new_password2}
                                  onChange={(e) =>
                                    setPassData({ ...passData, new_password2: e.target.value })
                                  }
                                  className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 border-black/5 bg-white text-black dark:border-white/10 dark:bg-[#121212] dark:text-white"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-1">
                            <motion.button
                              type="button"
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPassData({ new_password1: "", new_password2: "" });
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="rounded-xl border cursor-pointer px-4 py-2 text-sm font-medium transition border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/10"
                            >
                              Annuler
                            </motion.button>
                            <motion.button
                              type="submit"
                              disabled={isSavingPassword}
                              whileHover={{ scale: isSavingPassword ? 1 : 1.02 }}
                              whileTap={{ scale: isSavingPassword ? 1 : 0.98 }}
                              className="flex items-center cursor-pointer gap-2 rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:opacity-50"
                            >
                              {isSavingPassword ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Key className="h-4 w-4" />
                              )}
                              Mettre à jour
                            </motion.button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Bouton de déconnexion */}
                  <motion.button
                    variants={fadeUp}
                    onClick={() => setShowLogoutConfirm(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-error/20 bg-error/5 py-4 text-sm font-bold text-error transition-all duration-300 hover:border-error hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    SE DÉCONNECTER
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Footer avec informations de session */}
            <div className="border-t px-6 py-4 backdrop-blur-sm border-black/5 bg-neutral-50/80 text-neutral-500 dark:border-white/10 dark:bg-[#161616]/80 dark:text-neutral-400">
              <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full bg-success/60"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  <span>Session sécurisée</span>
                  <span className="text-primary">•</span>
                  <Clock3 className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{new Date().toLocaleTimeString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-2 font-medium uppercase tracking-[0.08em] text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span>L'Atelier du Terroir – Zone client</span>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de déconnexion */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter ?"
        type="warning"
        confirmText="Se déconnecter"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}