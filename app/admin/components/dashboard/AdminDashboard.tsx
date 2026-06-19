// /**
//  * AdminDashboard - Orchestrateur principal admin
//  *
//  * @module app/admin/AdminDashboard
//  */

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";
// import { ShieldAlert } from "lucide-react";
// import { useAuthStore } from "@/store/authStore";
// import AdminShell from "./components/AdminShell";
// import OverviewSection from "./components/OverviewSection";

// const ProductsSection = dynamic(() => import("./components/ProductsSection"), { ssr: false });
// const CategoriesSection = dynamic(() => import("./components/CategoriesSection"), { ssr: false });
// const OrdersSection = dynamic(() => import("./components/OrdersSection"), { ssr: false });
// const ClientsSection = dynamic(() => import("./components/ClientsSection"), { ssr: false });
// // const PromotionsSection = dynamic(() => import("./components/PromotionsSection"), { ssr: false });
// const SettingsSection = dynamic(() => import("./components/SettingsSection"), { ssr: false });

// function AccessDeniedSection() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">Acces refuse</h1>
//         <p className="text-sm text-slate-500">
//           Votre compte est connecte, mais il n&apos;a pas les droits d&apos;administration requis.
//         </p>
//       </div>

//       <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
//         <div className="flex items-start gap-4">
//           <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
//             <ShieldAlert className="h-7 w-7" />
//           </div>
//           <div className="space-y-3">
//             <h2 className="text-lg font-semibold text-slate-900">
//               Vous n&apos;avez pas la permission d&apos;effectuer cette action
//             </h2>
//             <p className="text-sm leading-6 text-slate-600">
//               Les endpoints admin comme les categories, produits ou promotions exigent un compte
//               ayant des droits backend de type <span className="font-semibold">staff</span> ou
//               <span className="font-semibold"> admin</span>.
//             </p>
//             <ul className="space-y-1 text-sm text-slate-600">
//               <li>Connectez-vous avec un compte administrateur.</li>
//               <li>Ou demandez au backend d&apos;activer les droits admin sur ce compte.</li>
//               <li>Le frontend fonctionne, mais le serveur bloque l&apos;action avec une reponse 403.</li>
//             </ul>
//             <div className="pt-2">
//               <Link
//                 href="/admin/login"
//                 className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
//               >
//                 Aller a la connexion admin
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminDashmnboard() {
//   const searchParams = useSearchParams();
//   const initialSection = searchParams.get("section") || "overview";
//   const [section, setSection] = useState(initialSection);
//   const { user } = useAuthStore();

//   const hasAdminAccess = Boolean(user?.role === 'platform_admin');

//   const renderSection = () => {
//     if (!hasAdminAccess) {
//       return <AccessDeniedSection />;
//     }

//     switch (section) {
//       case "overview":
//         return <OverviewSection />;
//       case "products":
//         return <ProductsSection />;
//       case "categories":
//         return <CategoriesSection />;
//       case "orders":
//         return <OrdersSection />;
//       case "clients":
//         return <ClientsSection />;
//       // case "promotions":
//       //   return <PromotionsSection />;
//       case "settings":
//         return <SettingsSection />;
//       default:
//         return <OverviewSection />;
//     }
//   };

//   return (
//     <AdminShell activeSection={section} onSectionChange={setSection}>
//       {renderSection()}
//     </AdminShell>
//   );
// }

























