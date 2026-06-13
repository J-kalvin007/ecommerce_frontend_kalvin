// "use client";

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
//   Key
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import { useRouter } from "next/navigation";
// import ConfirmDialog from "@/components/special/ConfirmDialog";
// import type { User } from "@/models/user";
// import { patchUser, changePassword } from "@/fonctions_api/auth.api";
// import Toast from "@/components/notifications/Toast";

// interface ProfileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   profile: User | null;
//   onLogout: () => void;
//   onProfileUpdate: (user: Partial<User>) => void;
// }

// const containerVariants: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05, delayChildren: 0.1 }
//   }
// };

// const itemVariants: Variants = {
//   hidden: { opacity: 0, y: 15, scale: 0.98 },
//   visible: {
//     opacity: 1, y: 0, scale: 1,
//     transition: { type: "spring" as const, damping: 20, stiffness: 100 }
//   }
// };

// const DetailBlock = ({ icon: Icon, label, value, verified, mono }: any) => (
//   <motion.div
//     variants={itemVariants}
//     className="p-5 rounded-2xl border bg-gray-50/50 border-gray-100 group hover:border-[#23BE31]/30 transition-all duration-300 shadow-sm"
//   >
//     <div className="flex items-center gap-4">
//       <div className="w-10 h-10 rounded-xl bg-[#1a8f26]/10 flex items-center justify-center text-[#23BE31] group-hover:scale-110 transition-transform">
//         <Icon className="w-5 h-5" />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
//         <div className="flex items-center gap-2">
//           <p className={`text-sm font-bold truncate ${mono ? 'font-mono text-xs' : ''} text-gray-700`}>{value || 'Non renseigné'}</p>
//           {verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
//         </div>
//       </div>
//     </div>
//   </motion.div>
// );

// const ProfileModal = ({ isOpen, onClose, profile, onLogout, onProfileUpdate }: ProfileModalProps) => {
//   const router = useRouter();
  
//   // Modals state
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({ show: false, type: "info", message: "" });
  
//   // Edit mode states
//   const [isEditingProfile, setIsEditingProfile] = useState(false);
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
  
//   // Loading states
//   const [isSavingProfile, setIsSavingProfile] = useState(false);
//   const [isSavingPassword, setIsSavingPassword] = useState(false);

//   // Form states
//   const [formData, setFormData] = useState({ name: "", phone_number: "" });
//   const [passData, setPassData] = useState({ new_password1: "", new_password2: "" });

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//       if (profile) {
//         setFormData({ name: profile.name, phone_number: profile.phone_number || "" });
//       }
//     } else {
//       document.body.style.overflow = 'unset';
//       setIsEditingProfile(false);
//       setIsChangingPassword(false);
//       setPassData({ new_password1: "", new_password2: "" });
//     }
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isOpen, profile]);

//   if (!isOpen || !profile) return null;

//   const handleUpdateProfile = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSavingProfile(true);
//     const result = await patchUser(profile.id, {
//       name: formData.name,
//       phone_number: formData.phone_number
//     });
//     setIsSavingProfile(false);

//     if (result.ok) {
//       onProfileUpdate(result.data);
//       setToast({ show: true, type: "success", message: "Profil mis à jour avec succès" });
//       setIsEditingProfile(false);
//     } else {
//       setToast({ show: true, type: "error", message: result.error.message || "Erreur de mise à jour" });
//     }
//   };

//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (passData.new_password1 !== passData.new_password2) {
//       setToast({ show: true, type: "error", message: "Les mots de passe ne correspondent pas" });
//       return;
//     }
//     setIsSavingPassword(true);
//     const result = await changePassword(passData);
//     setIsSavingPassword(false);

//     if (result.ok) {
//       setToast({ show: true, type: "success", message: "Mot de passe modifié avec succès" });
//       setIsChangingPassword(false);
//       setPassData({ new_password1: "", new_password2: "" });
//     } else {
//       setToast({ show: true, type: "error", message: result.error.message || "Impossible de changer le mot de passe" });
//     }
//   };

//   const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

//   const roleLabel = profile.role === 'platform_admin' ? 'Administrateur' : 'Client';
//   const roleColor = profile.role === 'platform_admin' ? 'from-amber-500 to-yellow-600' : 'from-[#23BE31] to-[#1fa92c]';

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
//           />

//           <motion.div
//             initial={{ scale: 0.95, opacity: 0, y: 30 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.95, opacity: 0, y: 30 }}
//             transition={{ type: "spring", damping: 25, stiffness: 400 }}
//             className="relative z-10 w-full max-w-4xl xl:max-w-5xl max-h-[85vh] xl:max-h-[88vh] flex flex-col bg-white text-gray-900 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-3xl"
//           >
//             {/* Header Area */}
//             <div className="px-5 py-4 xl:px-8 xl:py-6 border-b border-gray-50 flex-shrink-0 flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="w-10 h-10 rounded-xl bg-[#23BE31]/10 flex items-center justify-center">
//                   <UserRound className="w-5 h-5 text-[#23BE31]" />
//                 </div>
//                 <div>
//                   <h2 className="text-base xl:text-xl font-bold tracking-tight">Profil Utilisateur</h2>
//                   <p className="text-[11px] font-medium text-gray-400">L'Atelier du Terroir</p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="w-9 h-9 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors group"
//               >
//                 <X className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-90" />
//               </button>
//             </div>

//             {/* Content Area */}
//             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 xl:p-8">
//               <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-8"
//               >
//                 {/* Profile Card Sidebar */}
//                 <div className="lg:col-span-4 space-y-6">
//                   <motion.div
//                     variants={itemVariants}
//                     className="p-4 xl:p-6 rounded-3xl bg-gray-50/20 border border-gray-100 flex flex-col items-center text-center shadow-sm"
//                   >
//                     <div className="relative mb-6">
//                       <div className={`w-24 h-24 xl:w-36 xl:h-36 rounded-full p-1 bg-gradient-to-br ${roleColor} shadow-lg`}>
//                         <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
//                           {profile.profile_image ? (
//                             <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
//                           ) : (
//                             <span className="text-3xl xl:text-5xl font-bold text-gray-900 opacity-80">
//                               {getInitials(profile.name)}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       {profile.is_verified && (
//                         <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#23BE31] border-4 border-white flex items-center justify-center shadow-md">
//                           <CheckCircle className="w-4 h-4 text-white" />
//                         </div>
//                       )}
//                     </div>

//                     <h3 className="text-xl xl:text-2xl font-bold mb-1 tracking-tight">{profile.name}</h3>
//                     <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${roleColor} text-white text-[9px] font-bold uppercase tracking-widest shadow-sm`}>
//                       <ShieldCheck className="w-3.5 h-3.5" />
//                       {roleLabel}
//                     </div>

//                     <p className="text-xs font-medium text-gray-500 mb-6">
//                       Membre • L'Atelier du Terroir
//                     </p>
//                   </motion.div>
//                 </div>

//                 {/* Information Grid Section */}
//                 <div className="lg:col-span-8 space-y-5 xl:space-y-8">
//                   {/* Info Blocks */}
//                   <motion.div variants={itemVariants} className="p-4 xl:p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
//                     <div className="flex items-center justify-between mb-8">
//                       <h4 className="text-xl font-bold flex items-center gap-3 tracking-tight">
//                         <UserRound className="w-5 h-5 text-[#23BE31]" />
//                         Détails Personnels
//                       </h4>
//                       {!isEditingProfile ? (
//                         <button 
//                           onClick={() => setIsEditingProfile(true)}
//                           className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold flex items-center gap-2 transition-colors"
//                         >
//                           <Edit2 className="w-3.5 h-3.5" /> Modifier
//                         </button>
//                       ) : (
//                         <button 
//                           onClick={() => {
//                             setIsEditingProfile(false);
//                             setFormData({ name: profile.name, phone_number: profile.phone_number || "" });
//                           }}
//                           className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold flex items-center gap-2 transition-colors"
//                         >
//                           <X className="w-3.5 h-3.5" /> Annuler
//                         </button>
//                       )}
//                     </div>

//                     <AnimatePresence mode="wait">
//                       {!isEditingProfile ? (
//                         <motion.div 
//                           key="view"
//                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
//                           className="grid grid-cols-1 md:grid-cols-2 gap-5"
//                         >
//                           <DetailBlock icon={Mail} label="Email" value={profile.email} verified={profile.is_verified} />
//                           <DetailBlock icon={UserRound} label="Nom complet" value={profile.name} />
//                           <DetailBlock icon={Phone} label="Téléphone" value={profile.phone_number} />
//                           <DetailBlock icon={Calendar} label="Statut" value={profile.is_active ? "Actif" : "Inactif"} />
//                         </motion.div>
//                       ) : (
//                         <motion.form 
//                           key="edit"
//                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
//                           onSubmit={handleUpdateProfile}
//                           className="space-y-4"
//                         >
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                             <div className="space-y-1.5">
//                               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nom complet</label>
//                               <input 
//                                 type="text" 
//                                 value={formData.name}
//                                 onChange={(e) => setFormData({...formData, name: e.target.value})}
//                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#23BE31] focus:ring-2 focus:ring-[#23BE31]/20 transition-all"
//                                 required
//                               />
//                             </div>
//                             <div className="space-y-1.5">
//                               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Téléphone</label>
//                               <input 
//                                 type="tel" 
//                                 value={formData.phone_number}
//                                 onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
//                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#23BE31] focus:ring-2 focus:ring-[#23BE31]/20 transition-all"
//                               />
//                             </div>
//                           </div>
//                           <div className="flex justify-end pt-2">
//                             <button 
//                               type="submit" 
//                               disabled={isSavingProfile}
//                               className="px-6 py-3 rounded-xl bg-[#23BE31] text-white text-sm font-bold shadow-lg shadow-[#23BE31]/20 hover:bg-[#1fa92c] transition-all flex items-center gap-2 disabled:opacity-50"
//                             >
//                               {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                               Enregistrer les modifications
//                             </button>
//                           </div>
//                         </motion.form>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>

//                   {/* Security Actions */}
//                   <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
//                     <motion.div variants={itemVariants} className="md:col-span-12">
//                       <div className="p-4 xl:p-6 rounded-3xl bg-rose-50/30 border border-rose-100 flex flex-col items-start gap-4 xl:gap-6 shadow-sm">
//                         <div className="flex flex-col sm:flex-row w-full items-center justify-between gap-4">
//                           <div className="flex items-center gap-5">
//                             <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/10">
//                               <Lock className="w-7 h-7" />
//                             </div>
//                             <div className="text-center sm:text-left">
//                               <h5 className="font-bold text-lg tracking-tight">Sécurité du compte</h5>
//                               <p className="text-xs font-medium text-gray-500/80">Protégez votre espace avec un mot de passe robuste.</p>
//                             </div>
//                           </div>
//                           {!isChangingPassword ? (
//                             <button
//                               onClick={() => setIsChangingPassword(true)}
//                               className="px-6 py-3 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20 active:scale-95 whitespace-nowrap"
//                             >
//                               Changer le Pass
//                             </button>
//                           ) : (
//                             <button
//                               onClick={() => {
//                                 setIsChangingPassword(false);
//                                 setPassData({ new_password1: "", new_password2: "" });
//                               }}
//                               className="px-6 py-3 rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold text-xs uppercase tracking-widest transition-all"
//                             >
//                               Annuler
//                             </button>
//                           )}
//                         </div>

//                         <AnimatePresence>
//                           {isChangingPassword && (
//                             <motion.form 
//                               initial={{ height: 0, opacity: 0 }} 
//                               animate={{ height: "auto", opacity: 1 }} 
//                               exit={{ height: 0, opacity: 0 }}
//                               className="w-full overflow-hidden border-t border-rose-100/50 mt-2 pt-6 space-y-4"
//                               onSubmit={handleChangePassword}
//                             >
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                                 <div className="space-y-1.5">
//                                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
//                                     <Key className="w-3 h-3" /> Nouveau mot de passe
//                                   </label>
//                                   <input 
//                                     type="password" 
//                                     value={passData.new_password1}
//                                     onChange={(e) => setPassData({...passData, new_password1: e.target.value})}
//                                     className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
//                                     required
//                                     minLength={8}
//                                   />
//                                 </div>
//                                 <div className="space-y-1.5">
//                                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
//                                     <Key className="w-3 h-3" /> Confirmer le mot de passe
//                                   </label>
//                                   <input 
//                                     type="password" 
//                                     value={passData.new_password2}
//                                     onChange={(e) => setPassData({...passData, new_password2: e.target.value})}
//                                     className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
//                                     required
//                                     minLength={8}
//                                   />
//                                 </div>
//                               </div>
//                               <div className="flex justify-end pt-2">
//                                 <button 
//                                   type="submit" 
//                                   disabled={isSavingPassword || !passData.new_password1}
//                                   className="px-6 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center gap-2 disabled:opacity-50"
//                                 >
//                                   {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                                   Mettre à jour la sécurité
//                                 </button>
//                               </div>
//                             </motion.form>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </motion.div>

//                     {/* Prominent Logout */}
//                     <motion.div variants={itemVariants} className="md:col-span-12 pt-4">
//                       <button
//                         onClick={() => setShowLogoutConfirm(true)}
//                         className="w-full py-4 xl:py-5 rounded-3xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold text-[12px] tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 xl:gap-6 group"
//                       >
//                         <LogOut className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
//                         DECONNEXION DU COMPTE
//                       </button>
//                     </motion.div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Subtle Footer Status */}
//             <div className="px-5 xl:px-10 py-4 xl:py-6 border-t border-gray-50 bg-gray-50/50 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 xl:gap-6 flex-shrink-0">
//               <div className="flex items-center gap-5">
//                 <div className="flex flex-col">
//                   <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Session Sécurisée</p>
//                   <p className="text-[10px] font-bold text-[#23BE31]">{new Date().toLocaleTimeString('fr-FR')} • L'Atelier du Terroir</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-6">
//                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 opacity-50">
//                   <Globe className="w-3.5 h-3.5" /> Zone Client
//                 </span>
//                 <div className="h-5 w-px bg-gray-200" />
//                 <button
//                   onClick={onClose}
//                   className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-emerald-700 transition-all"
//                 >
//                   Fermer
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Confirmation Modals */}
//       <ConfirmDialog
//         isOpen={showLogoutConfirm}
//         title="Session"
//         message="Voulez-vous vraiment vous déconnecter ?"
//         type="warning"
//         confirmText="Déconnexion"
//         onConfirm={() => { setShowLogoutConfirm(false); onLogout(); }}
//         onCancel={() => setShowLogoutConfirm(false)}
//       />

//       <Toast 
//         show={toast.show} 
//         type={toast.type} 
//         message={toast.message} 
//         onClose={() => setToast({ ...toast, show: false })} 
//       />

//     </AnimatePresence>
//   );
// };

// export default ProfileModal;






































































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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { patchUser, changePassword } from "@/fonctions_api/auth.api";
import ConfirmDialog from "@/components/special/ConfirmDialog";
import Toast from "@/components/notifications/Toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/special/ui/Dialog";
import type { User } from "@/modeles/user";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: User | null;
  onLogout: () => void;
  onProfileUpdate: (user: Partial<User>) => void;
}

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
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-2xl">
          <div className="relative flex flex-col max-h-[90vh]">
            {/* Header avec titre et bouton fermeture */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Mon profil</DialogTitle>
                  <DialogDescription className="text-xs text-muted">
                    Gérez vos informations personnelles
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenu principal avec scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Colonne gauche : Avatar et infos statiques */}
                <div className="flex flex-col items-center space-y-5">
                  <div className="relative">
                    <div
                      className={cn(
                        "h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br p-1 shadow-xl",
                        roleColor
                      )}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
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

                    {isEditingProfile && (
                      <div className="absolute -bottom-2 -right-2 flex gap-1">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-full bg-primary p-1.5 text-white shadow-md transition hover:bg-primary/80"
                          type="button"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                        {imagePreview && imagePreview !== profile.profile_image && (
                          <button
                            onClick={removeImage}
                            className="rounded-full bg-error p-1.5 text-white shadow-md transition hover:bg-error/80"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <div
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
                        roleColor
                      )}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {roleLabel}
                    </div>
                    {profile.is_verified && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Compte vérifié</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full rounded-2xl border border-border bg-surface p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      Membre depuis le
                    </p>
                    <p className="text-sm font-semibold">
                      {new Date().toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Colonne droite : formulaires d'édition */}
                <div className="md:col-span-2 space-y-6">
                  {/* Bloc Informations personnelles */}
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-lg font-semibold">
                        <UserRound className="h-5 w-5 text-primary" />
                        Informations personnelles
                      </h4>
                      {!isEditingProfile ? (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="flex items-center gap-1 rounded-xl bg-surface-alt px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                      ) : (
                        <button
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
                          className="rounded-xl bg-surface-alt px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-surface"
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {!isEditingProfile ? (
                        <motion.div
                          key="view"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                              <AtSign className="mt-0.5 h-4 w-4 text-muted" />
                              <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                  Email
                                </p>
                                <p className="text-sm font-medium">{profile.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <UserRound className="mt-0.5 h-4 w-4 text-muted" />
                              <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                  Nom complet
                                </p>
                                <p className="text-sm font-medium">{profile.name}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Phone className="mt-0.5 h-4 w-4 text-muted" />
                              <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                  Téléphone
                                </p>
                                <p className="text-sm font-medium">
                                  {profile.phone_number || "Non renseigné"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Calendar className="mt-0.5 h-4 w-4 text-muted" />
                              <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                  Statut
                                </p>
                                <p className="text-sm font-medium">
                                  {profile.is_active ? "Actif" : "Inactif"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="edit"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onSubmit={handleUpdateProfile}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Nom complet
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Email
                              </label>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Téléphone
                              </label>
                              <input
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) =>
                                  setFormData({ ...formData, phone_number: e.target.value })
                                }
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={isSavingProfile}
                              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
                            >
                              {isSavingProfile ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Enregistrer
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bloc Sécurité (mot de passe) */}
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-lg font-semibold">
                        <Lock className="h-5 w-5 text-primary" />
                        Sécurité
                      </h4>
                      {!isChangingPassword && (
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="rounded-xl bg-surface-alt px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                        >
                          Changer mon mot de passe
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {isChangingPassword && (
                        <motion.form
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden"
                          onSubmit={handleChangePassword}
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Nouveau mot de passe
                              </label>
                              <input
                                type="password"
                                value={passData.new_password1}
                                onChange={(e) =>
                                  setPassData({ ...passData, new_password1: e.target.value })
                                }
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                                minLength={8}
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Confirmation
                              </label>
                              <input
                                type="password"
                                value={passData.new_password2}
                                onChange={(e) =>
                                  setPassData({ ...passData, new_password2: e.target.value })
                                }
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPassData({ new_password1: "", new_password2: "" });
                              }}
                              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-alt"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingPassword}
                              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
                            >
                              {isSavingPassword ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Key className="h-4 w-4" />
                              )}
                              Mettre à jour
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bouton de déconnexion */}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex w-full items-center justify-center gap-3 cursor-pointer rounded-2xl border border-error/20 bg-error/5 py-4 text-sm font-bold text-error transition hover:bg-error/10"
                  >
                    <LogOut className="h-5 w-5" />
                    SE DÉCONNECTER
                  </button>
                </div>
              </div>
            </div>

            {/* Footer avec informations de session */}
            <div className="border-t border-border bg-surface-alt px-6 py-4">
              <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Session sécurisée</span>
                  <span className="text-primary">•</span>
                  <span>{new Date().toLocaleTimeString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
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