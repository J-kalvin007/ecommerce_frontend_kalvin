

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LogOut,
//   X,
//   Phone,
//   Mail,
//   Calendar,
//   Globe,
//   CheckCircle,
//   ShieldCheck,
//   Lock,
//   UserRound,
//   Edit2,
//   Save,
//   Loader2,
//   Key,
//   Camera,
//   Upload,
//   Trash2,
//   AtSign,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { patchUser, changePassword } from "@/fonctions_api/auth.api";
// import ConfirmDialog from "@/components/special/ConfirmDialog";
// import Toast from "@/components/notifications/Toast";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/special/ui/Dialog";
// import type { User } from "@/modeles/user";

// interface ProfileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   profile: User | null;
//   onLogout: () => void;
//   onProfileUpdate: (user: Partial<User>) => void;
// }

// export default function ProfileModal({
//   isOpen,
//   onClose,
//   profile,
//   onLogout,
//   onProfileUpdate,
// }: ProfileModalProps) {
//   const router = useRouter();

//   // États locaux
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [toast, setToast] = useState<{
//     show: boolean;
//     type: "success" | "error" | "info";
//     message: string;
//   }>({ show: false, type: "info", message: "" });

//   // Édition du profil
//   const [isEditingProfile, setIsEditingProfile] = useState(false);
//   const [isSavingProfile, setIsSavingProfile] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone_number: "",
//   });
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Changement de mot de passe
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
//   const [isSavingPassword, setIsSavingPassword] = useState(false);
//   const [passData, setPassData] = useState({
//     new_password1: "",
//     new_password2: "",
//   });

//   // Mise à jour des données du formulaire quand le profil change
//   useEffect(() => {
//     if (profile) {
//       setFormData({
//         name: profile.name,
//         email: profile.email,
//         phone_number: profile.phone_number || "",
//       });
//       setProfileImage(profile.profile_image || null);
//       setImagePreview(profile.profile_image || null);
//     }
//   }, [profile]);

//   // Nettoyer les états lors de la fermeture
//   const handleClose = () => {
//     setIsEditingProfile(false);
//     setIsChangingPassword(false);
//     setPassData({ new_password1: "", new_password2: "" });
//     setImageFile(null);
//     setImagePreview(profile?.profile_image || null);
//     onClose();
//   };

//   const getInitials = (name: string) =>
//     name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);

//   const roleLabel = profile?.role === "platform_admin" ? "Administrateur" : "Client";
//   const roleColor =
//     profile?.role === "platform_admin"
//       ? "from-amber-500 to-yellow-600"
//       : "from-primary to-primary/80";

//   // Gestionnaire de modification de la photo
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setImageFile(file);
//     const previewUrl = URL.createObjectURL(file);
//     setImagePreview(previewUrl);
//   };

//   const removeImage = () => {
//     setImageFile(null);
//     setImagePreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   // Mise à jour du profil (nom, email, téléphone, photo)
//   const handleUpdateProfile = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSavingProfile(true);

//     // Construction du FormData pour l'upload éventuel de la photo
//     const updatePayload: Partial<User> = {
//       name: formData.name,
//       email: formData.email,
//       phone_number: formData.phone_number,
//     };

//     // Si un fichier image a été sélectionné, on l'envoie en multipart
//     if (imageFile) {
//       const formDataObj = new FormData();
//       formDataObj.append("name", formData.name);
//       formDataObj.append("email", formData.email);
//       formDataObj.append("phone_number", formData.phone_number);
//       formDataObj.append("profile_image", imageFile);
//       // Appel API spécial pour l'upload (patchUser ne gère pas le multipart)
//       // On va utiliser fetch directement sur l'endpoint PATCH /api/users/{id}/
//       try {
//         const token = localStorage.getItem("authToken"); // à adapter selon votre stockage
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile?.id}/`, {
//           method: "PATCH",
//           headers: {
//             Authorization: `Token ${token}`,
//           },
//           body: formDataObj,
//         });
//         if (!response.ok) throw new Error("Erreur lors de la mise à jour");
//         const updatedUser = await response.json();
//         onProfileUpdate(updatedUser);
//         setToast({ show: true, type: "success", message: "Profil mis à jour avec succès" });
//         setIsEditingProfile(false);
//         setIsSavingProfile(false);
//         return;
//       } catch (error) {
//         setToast({
//           show: true,
//           type: "error",
//           message: "Impossible de mettre à jour la photo",
//         });
//         setIsSavingProfile(false);
//         return;
//       }
//     }

//     // Pas de nouvelle photo → appel standard patchUser
//     const result = await patchUser(profile!.id, updatePayload);
//     setIsSavingProfile(false);

//     if (result.ok) {
//       onProfileUpdate(result.data);
//       setToast({ show: true, type: "success", message: "Profil mis à jour avec succès" });
//       setIsEditingProfile(false);
//     } else {
//       setToast({
//         show: true,
//         type: "error",
//         message: result.error.message || "Erreur de mise à jour",
//       });
//     }
//   };

//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (passData.new_password1 !== passData.new_password2) {
//       setToast({
//         show: true,
//         type: "error",
//         message: "Les mots de passe ne correspondent pas",
//       });
//       return;
//     }
//     setIsSavingPassword(true);
//     const result = await changePassword(passData);
//     setIsSavingPassword(false);

//     if (result.ok) {
//       setToast({
//         show: true,
//         type: "success",
//         message: "Mot de passe modifié avec succès",
//       });
//       setIsChangingPassword(false);
//       setPassData({ new_password1: "", new_password2: "" });
//     } else {
//       setToast({
//         show: true,
//         type: "error",
//         message: result.error.message || "Impossible de changer le mot de passe",
//       });
//     }
//   };

//   if (!profile) return null;

//   return (
//     <>
//       <Dialog open={isOpen} onOpenChange={handleClose}>
//         <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl">
//           <div className="relative flex flex-col max-h-[90vh]">
//             {/* Header avec titre et bouton fermeture */}
//             <div className="flex items-center justify-between border-b border-border p-5">
//               <div className="flex items-center gap-3">
//                 <div className="rounded-xl bg-primary/10 p-2">
//                   <UserRound className="h-5 w-5 text-primary" />
//                 </div>
//                 <div>
//                   <DialogTitle className="text-xl font-bold">Mon profil</DialogTitle>
//                   <DialogDescription className="text-xs text-muted">
//                     Gérez vos informations personnelles
//                   </DialogDescription>
//                 </div>
//               </div>
//               <button
//                 onClick={handleClose}
//                 className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             {/* Contenu principal avec scroll */}
//             <div className="flex-1 overflow-y-auto p-6">
//               <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//                 {/* Colonne gauche : Avatar et infos statiques */}
//                 <div className="flex flex-col items-center space-y-5">
//                   <div className="relative">
//                     <div
//                       className={cn(
//                         "h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br p-1 shadow-xl",
//                         roleColor
//                       )}
//                     >
//                       <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
//                         {imagePreview ? (
//                           // eslint-disable-next-line @next/next/no-img-element
//                           <img
//                             src={imagePreview}
//                             alt="Avatar"
//                             className="h-full w-full object-cover"
//                           />
//                         ) : (
//                           <div className="flex h-full w-full items-center justify-center bg-surface text-3xl font-bold text-foreground">
//                             {getInitials(profile.name)}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {isEditingProfile && (
//                       <div className="absolute -bottom-2 -right-2 flex gap-1">
//                         <button
//                           onClick={() => fileInputRef.current?.click()}
//                           className="rounded-full bg-primary p-1.5 text-white shadow-md transition hover:bg-primary/80"
//                           type="button"
//                         >
//                           <Camera className="h-4 w-4" />
//                         </button>
//                         {imagePreview && imagePreview !== profile.profile_image && (
//                           <button
//                             onClick={removeImage}
//                             className="rounded-full bg-error p-1.5 text-white shadow-md transition hover:bg-error/80"
//                             type="button"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         )}
//                         <input
//                           ref={fileInputRef}
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           onChange={handleImageChange}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   <div className="text-center">
//                     <h3 className="text-xl font-bold">{profile.name}</h3>
//                     <div
//                       className={cn(
//                         "mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
//                         roleColor
//                       )}
//                     >
//                       <ShieldCheck className="h-3 w-3" />
//                       {roleLabel}
//                     </div>
//                     {profile.is_verified && (
//                       <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
//                         <CheckCircle className="h-3.5 w-3.5" />
//                         <span>Compte vérifié</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="w-full rounded-2xl border border-border bg-surface p-4 text-center">
//                     <p className="text-xs font-medium text-muted-foreground">
//                       Membre depuis le
//                     </p>
//                     <p className="text-sm font-semibold">
//                       {new Date().toLocaleDateString("fr-FR")}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Colonne droite : formulaires d'édition */}
//                 <div className="md:col-span-2 space-y-6">
//                   {/* Bloc Informations personnelles */}
//                   <div className="rounded-2xl border border-border bg-surface p-5">
//                     <div className="mb-4 flex items-center justify-between">
//                       <h4 className="flex items-center gap-2 text-lg font-semibold">
//                         <UserRound className="h-5 w-5 text-primary" />
//                         Informations personnelles
//                       </h4>
//                       {!isEditingProfile ? (
//                         <button
//                           onClick={() => setIsEditingProfile(true)}
//                           className="flex items-center gap-1 rounded-xl bg-surface-alt px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
//                         >
//                           <Edit2 className="h-3.5 w-3.5" />
//                           Modifier
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             setIsEditingProfile(false);
//                             setFormData({
//                               name: profile.name,
//                               email: profile.email,
//                               phone_number: profile.phone_number || "",
//                             });
//                             setImagePreview(profile.profile_image || null);
//                             setImageFile(null);
//                           }}
//                           className="rounded-xl bg-surface-alt px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-surface"
//                         >
//                           Annuler
//                         </button>
//                       )}
//                     </div>

//                     <AnimatePresence mode="wait">
//                       {!isEditingProfile ? (
//                         <motion.div
//                           key="view"
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -10 }}
//                           className="space-y-4"
//                         >
//                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                             <div className="flex items-start gap-3">
//                               <AtSign className="mt-0.5 h-4 w-4 text-muted" />
//                               <div>
//                                 <p className="text-xs font-medium uppercase text-muted-foreground">
//                                   Email
//                                 </p>
//                                 <p className="text-sm font-medium">{profile.email}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-start gap-3">
//                               <UserRound className="mt-0.5 h-4 w-4 text-muted" />
//                               <div>
//                                 <p className="text-xs font-medium uppercase text-muted-foreground">
//                                   Nom complet
//                                 </p>
//                                 <p className="text-sm font-medium">{profile.name}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-start gap-3">
//                               <Phone className="mt-0.5 h-4 w-4 text-muted" />
//                               <div>
//                                 <p className="text-xs font-medium uppercase text-muted-foreground">
//                                   Téléphone
//                                 </p>
//                                 <p className="text-sm font-medium">
//                                   {profile.phone_number || "Non renseigné"}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex items-start gap-3">
//                               <Calendar className="mt-0.5 h-4 w-4 text-muted" />
//                               <div>
//                                 <p className="text-xs font-medium uppercase text-muted-foreground">
//                                   Statut
//                                 </p>
//                                 <p className="text-sm font-medium">
//                                   {profile.is_active ? "Actif" : "Inactif"}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         </motion.div>
//                       ) : (
//                         <motion.form
//                           key="edit"
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -10 }}
//                           onSubmit={handleUpdateProfile}
//                           className="space-y-4"
//                         >
//                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                             <div>
//                               <label className="mb-1 block text-xs font-medium text-muted-foreground">
//                                 Nom complet
//                               </label>
//                               <input
//                                 type="text"
//                                 value={formData.name}
//                                 onChange={(e) =>
//                                   setFormData({ ...formData, name: e.target.value })
//                                 }
//                                 className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
//                                 required
//                               />
//                             </div>
//                             <div>
//                               <label className="mb-1 block text-xs font-medium text-muted-foreground">
//                                 Email
//                               </label>
//                               <input
//                                 type="email"
//                                 value={formData.email}
//                                 onChange={(e) =>
//                                   setFormData({ ...formData, email: e.target.value })
//                                 }
//                                 className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
//                                 required
//                               />
//                             </div>
//                             <div className="sm:col-span-2">
//                               <label className="mb-1 block text-xs font-medium text-muted-foreground">
//                                 Téléphone
//                               </label>
//                               <input
//                                 type="tel"
//                                 value={formData.phone_number}
//                                 onChange={(e) =>
//                                   setFormData({ ...formData, phone_number: e.target.value })
//                                 }
//                                 className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
//                               />
//                             </div>
//                           </div>
//                           <div className="flex justify-end">
//                             <button
//                               type="submit"
//                               disabled={isSavingProfile}
//                               className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
//                             >
//                               {isSavingProfile ? (
//                                 <Loader2 className="h-4 w-4 animate-spin" />
//                               ) : (
//                                 <Save className="h-4 w-4" />
//                               )}
//                               Enregistrer
//                             </button>
//                           </div>
//                         </motion.form>
//                       )}
//                     </AnimatePresence>
//                   </div>

//                   {/* Bloc Sécurité (mot de passe) */}
//                   <div className="rounded-2xl border border-border bg-surface p-5">
//                     <div className="mb-4 flex items-center justify-between">
//                       <h4 className="flex items-center gap-2 text-lg font-semibold">
//                         <Lock className="h-5 w-5 text-primary" />
//                         Sécurité
//                       </h4>
//                       {!isChangingPassword && (
//                         <button
//                           onClick={() => setIsChangingPassword(true)}
//                           className="rounded-xl bg-surface-alt px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
//                         >
//                           Changer mon mot de passe
//                         </button>
//                       )}
//                     </div>

//                     <AnimatePresence>
//                       {isChangingPassword && (
//                         <motion.form
//                           initial={{ height: 0, opacity: 0 }}
//                           animate={{ height: "auto", opacity: 1 }}
//                           exit={{ height: 0, opacity: 0 }}
//                           className="space-y-4 overflow-hidden"
//                           onSubmit={handleChangePassword}
//                         >
//                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                             <div>
//                               <label className="mb-1 block text-xs font-medium text-muted-foreground">
//                                 Nouveau mot de passe
//                               </label>
//                               <input
//                                 type="password"
//                                 value={passData.new_password1}
//                                 onChange={(e) =>
//                                   setPassData({ ...passData, new_password1: e.target.value })
//                                 }
//                                 className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
//                                 required
//                                 minLength={8}
//                               />
//                             </div>
//                             <div>
//                               <label className="mb-1 block text-xs font-medium text-muted-foreground">
//                                 Confirmation
//                               </label>
//                               <input
//                                 type="password"
//                                 value={passData.new_password2}
//                                 onChange={(e) =>
//                                   setPassData({ ...passData, new_password2: e.target.value })
//                                 }
//                                 className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
//                                 required
//                               />
//                             </div>
//                           </div>
//                           <div className="flex justify-end gap-3">
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setIsChangingPassword(false);
//                                 setPassData({ new_password1: "", new_password2: "" });
//                               }}
//                               className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-alt"
//                             >
//                               Annuler
//                             </button>
//                             <button
//                               type="submit"
//                               disabled={isSavingPassword}
//                               className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
//                             >
//                               {isSavingPassword ? (
//                                 <Loader2 className="h-4 w-4 animate-spin" />
//                               ) : (
//                                 <Key className="h-4 w-4" />
//                               )}
//                               Mettre à jour
//                             </button>
//                           </div>
//                         </motion.form>
//                       )}
//                     </AnimatePresence>
//                   </div>

//                   {/* Bouton de déconnexion */}
//                   <button
//                     onClick={() => setShowLogoutConfirm(true)}
//                     className="flex w-full items-center justify-center gap-3 cursor-pointer rounded-2xl border border-error/20 bg-error/5 py-4 text-sm font-bold text-error transition hover:bg-error/10"
//                   >
//                     <LogOut className="h-5 w-5" />
//                     SE DÉCONNECTER
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Footer avec informations de session */}
//             <div className="border-t border-border bg-surface-alt px-6 py-4">
//               <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
//                 <div className="flex items-center gap-2">
//                   <Globe className="h-3.5 w-3.5" />
//                   <span>Session sécurisée</span>
//                   <span className="text-primary">•</span>
//                   <span>{new Date().toLocaleTimeString("fr-FR")}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <ShieldCheck className="h-3.5 w-3.5" />
//                   <span>L'Atelier du Terroir – Zone client</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Confirmation de déconnexion */}
//       <ConfirmDialog
//         isOpen={showLogoutConfirm}
//         title="Déconnexion"
//         message="Voulez-vous vraiment vous déconnecter ?"
//         type="warning"
//         confirmText="Se déconnecter"
//         onConfirm={() => {
//           setShowLogoutConfirm(false);
//           onLogout();
//         }}
//         onCancel={() => setShowLogoutConfirm(false)}
//       />

//       {/* Toast */}
//       <Toast
//         show={toast.show}
//         type={toast.type}
//         message={toast.message}
//         onClose={() => setToast({ ...toast, show: false })}
//       />
//     </>
//   );
// }







































"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { patchUser, changePassword } from "@/fonctions_api/auth.api";
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

const containerStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const fadeUp = {
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
      ? "from-amber-500 to-yellow-600"
      : "from-primary to-primary/80";

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
        const token = localStorage.getItem("authToken"); // à adapter selon votre stockage
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl overflow-hidden rounded-[28px] border border-border bg-surface-elevated p-0 shadow-2xl ring-1 ring-black/5">
          <div className="relative flex max-h-[90vh] flex-col">
            {/* Liseré signature : dégradé animé, seul geste "fort" du design */}
            <motion.div
              aria-hidden
              className={cn(
                "absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r",
                roleColor,
                "opacity-90"
              )}
              style={{ backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between gap-4 border-b border-border bg-gradient-to-b from-surface-alt/60 to-transparent px-6 py-5">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
                  <div className="relative rounded-2xl bg-primary/10 p-2.5 ring-1 ring-primary/15">
                    <UserRound className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    Mon profil
                  </DialogTitle>
                  <DialogDescription className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                    Gérez vos informations personnelles
                  </DialogDescription>
                </div>
              </div>
              <motion.button
                onClick={handleClose}
                whileHover={{ rotate: 90, scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </motion.button>
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
                  <div className="relative">
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

                    <div
                      className={cn(
                        "relative h-32 w-32 rounded-full bg-gradient-to-br p-[3px] shadow-xl",
                        roleColor
                      )}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-full bg-white ring-4 ring-white/80">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreview}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-surface text-3xl font-bold text-foreground">
                            {getInitials(profile.name)}
                          </div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isEditingProfile && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: 8 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute -bottom-1 -right-1 flex gap-1.5 rounded-full border border-border bg-surface-elevated/90 p-1.5 shadow-lg backdrop-blur-md"
                        >
                          <motion.button
                            onClick={() => fileInputRef.current?.click()}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.92 }}
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
                    <h3 className="text-xl font-bold tracking-tight">{profile.name}</h3>
                    <div
                      className={cn(
                        "mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
                        roleColor
                      )}
                    >
                      {profile.role === "platform_admin" ? (
                        <Sparkles className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      {roleLabel}
                    </div>
                    {profile.is_verified && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Compte vérifié</span>
                      </div>
                    )}
                  </div>

                  {/* Séparateur "cachet" */}
                  <div className="flex w-full items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <div className="h-1.5 w-1.5 rotate-45 bg-primary/40" />
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface p-4 text-center">
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
                    <p className="relative mt-1.5 text-sm font-semibold tabular-nums">
                      {new Date().toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </motion.div>

                {/* Colonne droite : formulaires d'édition */}
                <div className="space-y-6 lg:col-span-1">
                  {/* Bloc Informations personnelles */}
                  <motion.div
                    variants={fadeUp}
                    className="rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm sm:p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h4 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
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
                          className="flex items-center gap-1.5 rounded-xl bg-surface-alt px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:bg-primary/10"
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
                          className="rounded-xl bg-surface-alt px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-surface"
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
                          {[
                            { icon: AtSign, label: "Email", value: profile.email },
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
                            },
                          ].map(({ icon: Icon, label, value }) => (
                            <div
                              key={label}
                              className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-alt/70"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  {label}
                                </p>
                                <p className="truncate text-sm font-medium">{value}</p>
                              </div>
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
                              <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Email
                              </label>
                              <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                  }
                                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Téléphone
                              </label>
                              <div className="relative">
                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                  type="tel"
                                  value={formData.phone_number}
                                  onChange={(e) =>
                                    setFormData({ ...formData, phone_number: e.target.value })
                                  }
                                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <motion.button
                              type="submit"
                              disabled={isSavingProfile}
                              whileHover={{ scale: isSavingProfile ? 1 : 1.02 }}
                              whileTap={{ scale: isSavingProfile ? 1 : 0.98 }}
                              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
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
                    className="rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
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
                          className="flex items-center gap-1.5 rounded-xl bg-surface-alt px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:bg-primary/10"
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
                              <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                  type="password"
                                  value={passData.new_password1}
                                  onChange={(e) =>
                                    setPassData({ ...passData, new_password1: e.target.value })
                                  }
                                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  required
                                  minLength={8}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Confirmation
                              </label>
                              <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                  type="password"
                                  value={passData.new_password2}
                                  onChange={(e) =>
                                    setPassData({ ...passData, new_password2: e.target.value })
                                  }
                                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-alt"
                            >
                              Annuler
                            </motion.button>
                            <motion.button
                              type="submit"
                              disabled={isSavingPassword}
                              whileHover={{ scale: isSavingPassword ? 1 : 1.02 }}
                              whileTap={{ scale: isSavingPassword ? 1 : 0.98 }}
                              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
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
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-error/20 bg-error/5 py-4 text-sm font-bold text-error transition-all duration-300 hover:border-error hover:bg-error hover:text-white"
                  >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    SE DÉCONNECTER
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Footer avec informations de session */}
            <div className="border-t border-border bg-surface-alt/80 px-6 py-4 backdrop-blur-sm">
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
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>L'Atelier du Terroir – Zone client</span>
                </div>
              </div>
            </div>
          </div>
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



































































































