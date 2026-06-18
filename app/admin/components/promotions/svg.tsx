// /**
//  * PromotionsSection - Gestion des reductions et ventes flash
//  * @module app/admin/components/PromotionsSection
//  */



// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Tag,
//   Zap,
//   Plus,
//   Percent,
//   Clock,
//   Loader2,
//   X,
//   Save,
// } from "lucide-react";
// import { cn, formatCurrency } from "@/lib/utils";
// import api from "@/lib/axios";
// import { X } from "lucide-react";

// interface PromoFormState {
//   code: string;
//   description: string;
//   discount_type: PromoCode["discount_type"];
//   discount_value: string;
//   min_order_amount: string;
//   max_uses: string;
//   max_uses_per_user: string;
//   starts_at: string;
//   expires_at: string;
//   is_active: boolean;
// }

// const INITIAL_FORM: PromoFormState = {
//   code: "",
//   description: "",
//   discount_type: "PERCENTAGE",
//   discount_value: "",
//   min_order_amount: "0",
//   max_uses: "0",
//   max_uses_per_user: "1",
//   starts_at: "",
//   expires_at: "",
//   is_active: true,
// };

// function readApiError(error: unknown, fallback: string) {
//   if (
//     typeof error === "object" &&
//     error !== null &&
//     "response" in error &&
//     typeof (error as { response?: unknown }).response === "object" &&
//     (error as { response?: { data?: unknown } }).response?.data
//   ) {
//     const data = (error as { response?: { data?: Record<string, unknown> } }).response?.data;
//     if (!data) return fallback;
//     const firstEntry = Object.entries(data)[0];
//     if (!firstEntry) return fallback;
//     const [, value] = firstEntry;
//     if (Array.isArray(value) && value.length > 0) return String(value[0]);
//     if (typeof value === "string") return value;
//   }

//   return fallback;
// }

// export default function PromotionsSection() {
//   const [tab, setTab] = useState<"coupons" | "flash">("coupons");
//   const [showModal, setShowModal] = useState(false);
//   const [promos, setPromos] = useState<PromoCode[]>([]);
//   const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [flashError, setFlashError] = useState<string | null>(null);
//   const [form, setForm] = useState<PromoFormState>(INITIAL_FORM);

//   const loadData = async () => {
//     setLoading(true);
//     setError(null);
//     setFlashError(null);

//     try {
//       const promosResponse = await getAdminPromoCodes(1);
//       setPromos(promosResponse.results || []);
//     } catch (err) {
//       console.error("Error fetching promo codes:", err);
//       setError(readApiError(err, "Impossible de charger les codes promo."));
//       setPromos([]);
//     }

//     try {
//       const response = await api.get("/admin/flash-sales/");
//       setFlashSales(response.data?.results || response.data || []);
//     } catch (err) {
//       console.warn("Flash sales API indisponible.", err);
//       setFlashSales([]);
//       setFlashError("Aucune API de ventes flash n'est disponible pour le moment.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void (async () => {
//       await loadData();
//     })();
//   }, []);

//   const stats = useMemo(
//     () => ({
//       activePromos: promos.filter((promo) => promo.is_active).length,
//       totalUses: promos.reduce((total, promo) => total + promo.times_used, 0),
//       activeFlash: flashSales.filter((flash) => flash.is_active).length,
//     }),
//     [flashSales, promos]
//   );

//   const closeModal = () => {
//     setShowModal(false);
//     setForm(INITIAL_FORM);
//   };

//   const handleFormChange = (field: keyof PromoFormState, value: string | boolean) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleCreatePromo = async () => {
//     setSaving(true);
//     setError(null);

//     try {
//       await createPromoCode({
//         code: form.code.trim().toUpperCase(),
//         description: form.description.trim(),
//         discount_type: form.discount_type,
//         discount_value: form.discount_value,
//         max_discount_amount: null,
//         currency: "FCFA",
//         min_order_amount: form.min_order_amount,
//         max_uses: Number(form.max_uses || 0),
//         max_uses_per_user: Number(form.max_uses_per_user || 1),
//         times_used: 0,
//         applicable_categories: [],
//         applicable_products: [],
//         starts_at: form.starts_at,
//         expires_at: form.expires_at,
//         is_active: form.is_active,
//       });

//       closeModal();
//       await loadData();
//     } catch (err) {
//       console.error("Error creating promo code:", err);
//       setError(readApiError(err, "Impossible de creer le code promo."));
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
//           <p className="text-sm text-slate-500">Gerez les codes promo et les ventes flash.</p>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-primary-hover"
//         >
//           <Plus className="h-4 w-4" /> {tab === "coupons" ? "Nouveau code" : "Nouvelle vente flash"}
//         </button>
//       </div>

//       {(error || flashError) && (
//         <div className="space-y-2">
//           {error && (
//             <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}
//           {flashError && tab === "flash" && (
//             <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
//               {flashError}
//             </div>
//           )}
//         </div>
//       )}

//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//           <Tag className="h-4 w-4 text-primary" />
//           <p className="mt-2 text-xl font-bold text-slate-900">{stats.activePromos}</p>
//           <p className="text-xs text-slate-500">Codes promo actifs</p>
//         </div>
//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//           <Percent className="h-4 w-4 text-primary" />
//           <p className="mt-2 text-xl font-bold text-slate-900">{stats.totalUses}</p>
//           <p className="text-xs text-slate-500">Utilisations totales</p>
//         </div>
//         <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//           <Zap className="h-4 w-4 text-primary" />
//           <p className="mt-2 text-xl font-bold text-slate-900">{stats.activeFlash}</p>
//           <p className="text-xs text-slate-500">Ventes flash actives</p>
//         </div>
//       </div>

//       <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
//         <button
//           onClick={() => setTab("coupons")}
//           className={cn(
//             "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
//             tab === "coupons" ? "bg-orange-50 text-primary" : "text-slate-500 hover:text-slate-900"
//           )}
//         >
//           <Tag className="h-4 w-4" /> Coupons de reduction
//         </button>
//         <button
//           onClick={() => setTab("flash")}
//           className={cn(
//             "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
//             tab === "flash" ? "bg-orange-50 text-primary" : "text-slate-500 hover:text-slate-900"
//           )}
//         >
//           <Zap className="h-4 w-4" /> Ventes flash
//         </button>
//       </div>

//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         {tab === "coupons" ? (
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-slate-200">
//                 {["Code", "Type", "Valeur", "Utilisations", "Validite", "Statut"].map((header) => (
//                   <th
//                     key={header}
//                     className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
//                   >
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
//                     <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
//                     Chargement...
//                   </td>
//                 </tr>
//               ) : promos.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
//                     Aucun code promo trouve.
//                   </td>
//                 </tr>
//               ) : (
//                 promos.map((promo) => (
//                   <tr key={promo.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
//                     <td className="px-4 py-3">
//                       <span className="rounded bg-orange-50 px-2 py-1 text-xs font-bold text-primary">
//                         {promo.code}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-slate-600">
//                       {promo.discount_type === "PERCENTAGE" && (
//                         <span className="flex items-center gap-1">
//                           <Percent className="h-3 w-3" /> Pourcentage
//                         </span>
//                       )}
//                       {promo.discount_type === "FIXED_AMOUNT" && (
//                         <span className="flex items-center gap-1">
//                           <Tag className="h-3 w-3" /> Fixe
//                         </span>
//                       )}
//                       {promo.discount_type === "FREE_SHIPPING" && (
//                         <span className="flex items-center gap-1">
//                           <Zap className="h-3 w-3" /> Livraison
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 text-sm font-semibold text-slate-900">
//                       {promo.discount_type === "PERCENTAGE"
//                         ? `${promo.discount_value}%`
//                         : promo.discount_type === "FIXED_AMOUNT"
//                           ? formatCurrency(promo.discount_value, "FCFA")
//                           : "Gratuite"}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-slate-600">
//                       {promo.times_used} / {promo.max_uses || "∞"}
//                     </td>
//                     <td className="px-4 py-3 text-xs text-slate-500">
//                       {new Date(promo.starts_at).toLocaleDateString("fr-FR")} -{" "}
//                       {new Date(promo.expires_at).toLocaleDateString("fr-FR")}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={cn(
//                           "rounded-full px-2.5 py-1 text-[10px] font-semibold",
//                           promo.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
//                         )}
//                       >
//                         {promo.is_active ? "Actif" : "Inactif"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         ) : (
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-slate-200">
//                 {["Produit", "Prix flash", "Vendus / Limite", "Fin", "Statut"].map((header) => (
//                   <th
//                     key={header}
//                     className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
//                   >
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                     <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
//                     Chargement...
//                   </td>
//                 </tr>
//               ) : flashSales.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
//                     Aucune vente flash disponible.
//                   </td>
//                 </tr>
//               ) : (
//                 flashSales.map((flash) => (
//                   <tr key={flash.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
//                     <td className="px-4 py-3 text-sm font-medium text-slate-900">
//                       {flash.product_detail?.name || flash.product}
//                     </td>
//                     <td className="px-4 py-3 text-sm font-bold text-primary">
//                       {formatCurrency(flash.sale_price, "FCFA")}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-slate-600">
//                       {flash.stock_sold} / {flash.stock_limit}
//                     </td>
//                     <td className="px-4 py-3 text-xs text-slate-500">
//                       <span className="flex items-center gap-1">
//                         <Clock className="h-3 w-3" />
//                         {new Date(flash.expires_at).toLocaleString("fr-FR")}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={cn(
//                           "rounded-full px-2.5 py-1 text-[10px] font-semibold",
//                           flash.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
//                         )}
//                       >
//                         {flash.is_active ? "En cours" : "Terminee"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
//           >
//             <motion.div
//               initial={{ scale: 0.95 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.95 }}
//               className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
//             >
//               <div className="mb-5 flex items-center justify-between">
//                 <h3 className="text-lg font-bold text-slate-900">
//                   {tab === "coupons" ? "Nouveau code promo" : "Nouvelle vente flash"}
//                 </h3>
//                 <button onClick={closeModal} className="text-slate-400 hover:text-slate-900">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               {tab === "flash" ? (
//                 <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
//                   La creation de ventes flash n&apos;est pas encore branchee a une API dans ce projet.
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Code *</label>
//                       <input
//                         value={form.code}
//                         onChange={(e) => handleFormChange("code", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Type *</label>
//                       <select
//                         value={form.discount_type}
//                         onChange={(e) => handleFormChange("discount_type", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       >
//                         <option value="PERCENTAGE">Pourcentage</option>
//                         <option value="FIXED_AMOUNT">Montant fixe</option>
//                         <option value="FREE_SHIPPING">Livraison gratuite</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="mb-1.5 block text-xs font-medium text-slate-500">Description</label>
//                     <textarea
//                       rows={3}
//                       value={form.description}
//                       onChange={(e) => handleFormChange("description", e.target.value)}
//                       className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
//                     />
//                   </div>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Valeur *</label>
//                       <input
//                         value={form.discount_value}
//                         onChange={(e) => handleFormChange("discount_value", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Commande min.</label>
//                       <input
//                         value={form.min_order_amount}
//                         onChange={(e) => handleFormChange("min_order_amount", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Utilisations max</label>
//                       <input
//                         value={form.max_uses}
//                         onChange={(e) => handleFormChange("max_uses", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Max / client</label>
//                       <input
//                         value={form.max_uses_per_user}
//                         onChange={(e) => handleFormChange("max_uses_per_user", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Debut *</label>
//                       <input
//                         type="datetime-local"
//                         value={form.starts_at}
//                         onChange={(e) => handleFormChange("starts_at", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-medium text-slate-500">Fin *</label>
//                       <input
//                         type="datetime-local"
//                         value={form.expires_at}
//                         onChange={(e) => handleFormChange("expires_at", e.target.value)}
//                         className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-primary"
//                       />
//                     </div>
//                   </div>

//                   <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
//                     <input
//                       type="checkbox"
//                       checked={form.is_active}
//                       onChange={(e) => handleFormChange("is_active", e.target.checked)}
//                     />
//                     Activer ce code promo
//                   </label>
//                 </div>
//               )}

//               <div className="mt-5 flex justify-end gap-3">
//                 <button
//                   onClick={closeModal}
//                   className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
//                 >
//                   Annuler
//                 </button>
//                 {tab === "coupons" && (
//                   <button
//                     onClick={handleCreatePromo}
//                     disabled={
//                       saving ||
//                       !form.code.trim() ||
//                       !form.discount_value.trim() ||
//                       !form.starts_at ||
//                       !form.expires_at
//                     }
//                     className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//                     Creer
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// const CreatePromotionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
//       <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
//         >
//           <X className="h-6 w-6" />
//         </button>
//         <h2 className="text-lg font-semibold mb-4">Créer un code promotionnel</h2>
//         <form>
//           <div className="grid gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Nom</label>
//               <input
//                 type="text"
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                 placeholder="NOEL2023"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Description</label>
//               <input
//                 type="text"
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                 placeholder="20% de réduction sur les produits de Noël"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Type</label>
//                 <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
//                   <option value="percentage">Pourcentage</option>
//                   <option value="fixed">Montant fixe</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Valeur</label>
//                 <input
//                   type="number"
//                   className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                   placeholder="20"
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Date début</label>
//                 <input
//                   type="date"
//                   className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Date fin</label>
//                 <input
//                   type="date"
//                   className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Utilisations max</label>
//               <input
//                 type="number"
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                 placeholder="100"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Utilisations max / client</label>
//               <input
//                 type="number"
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
//                 placeholder="5"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <input type="checkbox" id="is_active" className="w-4 h-4" />
//               <label htmlFor="is_active" className="text-sm">Actif</label>
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
//             >
//               Annuler
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
//             >
//               Créer
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreatePromotionModal;




