// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useEffect } from "react";
// import AdminShell from "./AdminShell";
// import { useAuthStore } from "@/store/authStore";
// import CategoriesSection from "../../categories/CategoriesSection";
// import LoyaltySection from "../../fidelites/LoyaltySection";
// import AnalyticsSection from "../../AnalyticsSection";
// import AuditSection from "../../AuditSection";
// import BannersSection from "../../bannieres_publicitaires/BannersSection";
// import ProductsSection from "../../produits/ProductsSection";
// import OrdersSection from "../../commandes/OrdersSection";
// import OverviewSection from "../OverviewSection";
// import SettingsSection from "../../parametres/SettingsSection";
// import WalletSection from "../../wallets/WalletSection";
// import ClientsSection from "../../clients/ClientsSection";
// import PromotionsSection from "../../promotions/PromotionsSection";

// export type AdminSectionId =
//   | "analytics"
//   | "audit"
//   | "banners"
//   | "overview"
//   | "products"
//   | "categories"
//   | "orders"
//   | "clients"
//   | "promotions"
//   | "loyalty"
//   | "wallet"
//   | "settings";

// const SECTIONS: AdminSectionId[] = [
//   "analytics",
//   "audit",
//   "banners",
//   "overview",
//   "products",
//   "categories",
//   "orders",
//   "clients",
//   "promotions",
//   "loyalty",
//   "wallet",
//   "settings",
// ];

// function isAdminSection(value: string | null): value is AdminSectionId {
//   return value !== null && SECTIONS.includes(value as AdminSectionId);
// }

// function renderSection(section: AdminSectionId) {
//   switch (section) {
//     case "analytics":
//       return <AnalyticsSection />;
//     case "audit":
//       return <AuditSection />;
//     case "banners":
//       return <BannersSection />;
//     case "products":
//       return <ProductsSection />;
//     case "categories":
//       return <CategoriesSection />;
//     case "orders":
//       return <OrdersSection />;
//     case "clients":
//       return <ClientsSection />;
//     case "promotions":
//       return <PromotionsSection />;
//     case "loyalty":
//       return <LoyaltySection />;
//     case "wallet":
//       return <WalletSection />;
//     case "settings":
//       return <SettingsSection />;
//     case "overview":
//     default:
//       return <OverviewSection />;
//   }
// }

// export default function AdminDashboard() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user, status } = useAuthStore();

//   const sectionParam = searchParams.get("section");
//   const initialSection: AdminSectionId = isAdminSection(sectionParam) ? sectionParam : "overview";
//   const [section, setSection] = useState<AdminSectionId>(initialSection);

//   useEffect(() => {
//     const currentSection = searchParams.get("section");
//     if (isAdminSection(currentSection)) {
//       setSection(currentSection);
//     } else {
//       setSection("overview");
//     }
//   }, [searchParams]);

//   const isLoading = status === "loading";
//   const isAdmin = user?.role === "platform_admin";

//   return (
//     <AdminShell activeSection={section} onSectionChange={setSection}>
//       {isLoading && (
//         <div className="mb-4 rounded-xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-slate-500">
//           Vérification du rôle administrateur...
//         </div>
//       )}

//       {!isLoading && isAdmin && (
//         <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
//           <p className="font-semibold">Session administrateur active</p>
//           <p className="mt-2 leading-6 text-emerald-900/90">
//             Rôle : <strong>Administrateur</strong>. Vous pouvez gérer toutes les sections du
//             dashboard et naviguer vers la boutique client via le menu latéral.
//           </p>
//         </div>
//       )}

//       {!isLoading && !isAdmin && (
//         <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
//           <p className="font-semibold">Accès refusé</p>
//           <p className="mt-2">Votre compte ne dispose pas des privilèges d’administration.</p>
//         </div>
//       )}

//       {!isLoading && isAdmin && renderSection(section)}
//     </AdminShell>
//   );
// }

















// app/admin/AdminDashboard.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import AccessDenied from "./AccessDenied";
import OverviewSection from "../OverviewSection";
import AdminShell from "./AdminShell";

const ProductsSection = dynamic(() => import("../../../components/produits/ProductsSection"), { ssr: false });
const CategoriesSection = dynamic(() => import("../../../components/categories/CategoriesSection"), { ssr: false });
const OrdersSection = dynamic(() => import("../../../components/commandes/OrdersSection"), { ssr: false });
const DeliveriesSection = dynamic(() => import("../../../components/livraisons/DeliveriesSection"), { ssr: false });
const ClientsSection = dynamic(() => import("../../../components/clients/ClientsSection"), { ssr: false });
const SettingsSection = dynamic(() => import("../../../components/parametres/SettingsSection"), { ssr: false });
const LoyaltySection = dynamic(() => import("../../../components/fidelites/LoyaltySection"), { ssr: false });
const WalletSection = dynamic(() => import("../../../components/wallets/WalletSection"), { ssr: false });
const PromotionsSection = dynamic(() => import("../../../components/promotions/PromotionsSection"), { ssr: false });
const BannersSection = dynamic(() => import("../../../components/bannieres_publicitaires/BannersSection"), { ssr: false });



export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section") || "overview";
  const [section, setSection] = useState(initialSection);
  const { user } = useAuthStore();

  const hasAdminAccess = user?.role === "platform_admin";

  const renderSection = () => {
    if (!hasAdminAccess) {
      return <AccessDenied />;
    }

    switch (section) {
      case "overview":
        return <OverviewSection />;
      case "products":
        return <ProductsSection />;
      case "categories":
        return <CategoriesSection />;
      case "orders":
        return <OrdersSection />;
      case "livraisons":
        return <DeliveriesSection />;
      case "clients":
        return <ClientsSection />;
      case "promotions":
        return <PromotionsSection />;
      case "fidelites":
        return <LoyaltySection />;
      case "wallets":
        return <WalletSection />;
      case "bannieres_publicitaires":
        return <BannersSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <AdminShell activeSection={section} onSectionChange={setSection}>
      {renderSection()}
    </AdminShell>
  );
}