// /**
//  * ModeLivraisonSelector — Sélecteur de mode de livraison premium
//  *
//  * - Standard actif et sélectionnable
//  * - Express et 24h grisés avec badge "Bientôt disponible"
//  * - Dark/light mode complet
//  * - Prêt à activer les autres options côté backend
//  *
//  * @module components/commandes/ModeLivraisonSelector
//  */

// "use client";

// import React, { memo } from "react";
// import { motion } from "framer-motion";
// import { Package, Zap, Rocket, Check, Clock } from "lucide-react";
// import { useThemeStore } from "@/store/theme.store";
// import { formatCurrency } from "@/lib/utils";

// /* ─────────────────────────────────────────────────────────────────────────────
//    Données des options
//    ─────────────────────────────────────────────────────────────────────────── */

// export const OPTIONS_LIVRAISON = [
//   {
//     id: "standard",
//     label: "Livraison Standard",
//     description: "Livraison soigneuse à domicile",
//     delai: "5 - 7 jours ouvrés",
//     prix: 2500,
//     Icon: Package,
//     actif: true,
//   },
//   {
//     id: "express",
//     label: "Livraison Express",
//     description: "Priorité de traitement",
//     delai: "2 - 3 jours ouvrés",
//     prix: 5000,
//     Icon: Zap,
//     actif: false,
//   },
//   {
//     id: "overnight",
//     label: "Livraison 24h",
//     description: "Demain avant 18h",
//     delai: "Lendemain garanti",
//     prix: 10000,
//     Icon: Rocket,
//     actif: false,
//   },
// ] as const;

// export type OptionLivraisonId = (typeof OPTIONS_LIVRAISON)[number]["id"];

// /* ─────────────────────────────────────────────────────────────────────────────
//    Props
//    ─────────────────────────────────────────────────────────────────────────── */

// interface ModeLivraisonSelectorProps {
//   value: OptionLivraisonId;
//   onChange: (id: OptionLivraisonId) => void;
//   dynamicStandardPrice?: number | null;
// }

// /* ─────────────────────────────────────────────────────────────────────────────
//    Composant
//    ─────────────────────────────────────────────────────────────────────────── */

// export default memo(function ModeLivraisonSelector({ value, onChange, dynamicStandardPrice }: ModeLivraisonSelectorProps) {
//   const { resolvedTheme } = useThemeStore();
//   const isDark = resolvedTheme === "dark";

//   const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
//   const bg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
//   const text = isDark ? "rgba(255,255,255,0.92)" : "#1f241c";
//   const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

//   return (
//     <div className="space-y-3">
//       {OPTIONS_LIVRAISON.map((opt) => {
//         const isSelected = value === opt.id;
//         const { Icon } = opt;
//         const displayPrice = opt.id === "standard" && dynamicStandardPrice != null ? dynamicStandardPrice : opt.prix;

//         return (
//           <div key={opt.id} className="relative">
//             <button
//               type="button"
//               onClick={() => opt.actif && onChange(opt.id as OptionLivraisonId)}
//               disabled={!opt.actif}
//               aria-pressed={isSelected}
//               className="flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200"
//               style={{
//                 background: isSelected
//                   ? isDark ? "rgba(31,77,63,0.15)" : "rgba(31,77,63,0.05)"
//                   : bg,
//                 border: `1.5px solid ${isSelected ? "#1f4d3f" : border}`,
//                 boxShadow: isSelected
//                   ? "0 8px 24px rgba(31,77,63,0.12)"
//                   : "none",
//                 opacity: opt.actif ? 1 : 0.5,
//                 cursor: opt.actif ? "pointer" : "not-allowed",
//                 pointerEvents: opt.actif ? "auto" : "none",
//               }}
//             >
//               {/* Icône */}
//               <div
//                 className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors"
//                 style={{
//                   background: isSelected
//                     ? "rgba(31,77,63,0.15)"
//                     : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
//                   border: `1px solid ${isSelected ? "rgba(31,77,63,0.3)" : border}`,
//                 }}
//               >
//                 <Icon
//                   className="h-5 w-5"
//                   style={{ color: isSelected ? "#1f4d3f" : muted }}
//                 />
//               </div>

//               {/* Infos */}
//               <div className="flex-1 min-w-0">
//                 <p
//                   className="font-bold"
//                   style={{ color: isSelected ? "#1f4d3f" : text }}
//                 >
//                   {opt.label}
//                 </p>
//                 <p className="mt-0.5 text-sm" style={{ color: muted }}>
//                   {opt.description}
//                 </p>
//                 <div className="mt-2 flex items-center gap-1.5">
//                   <Clock className="h-3.5 w-3.5" style={{ color: muted }} />
//                   <span className="text-xs font-medium" style={{ color: muted }}>
//                     {opt.delai}
//                   </span>
//                 </div>
//               </div>

//               {/* Section Droite : Prix, Badge et Radio */}
//               <div className="flex shrink-0 items-center gap-4">
//                 {/* Prix et Badge */}
//                 <div className="flex flex-col items-end gap-1.5">
//                   {!opt.actif && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
//                       style={{
//                         background: isDark ? "rgba(139,94,52,0.15)" : "rgba(139,94,52,0.1)",
//                         border: "1px solid rgba(139,94,52,0.25)",
//                         color: "#8b5e34",
//                       }}
//                     >
//                       <span className="inline-block h-1 w-1 rounded-full bg-[#8b5e34]" />
//                       Bientôt
//                     </motion.div>
//                   )}
//                   <span
//                     className="text-lg font-black tracking-tight"
//                     style={{ color: isSelected ? "#1f4d3f" : text }}
//                   >
//                     {formatCurrency(String(displayPrice), "FCFA")}
//                   </span>
//                 </div>

//                 {/* Radio bouton ou indicateur sélectionné */}
//                 <div
//                   className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
//                   style={{
//                     borderColor: isSelected ? "#1f4d3f" : border,
//                     background: isSelected ? "#1f4d3f" : "transparent",
//                   }}
//                 >
//                   {isSelected && <Check className="h-3 w-3 text-white" />}
//                 </div>
//               </div>
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// });
