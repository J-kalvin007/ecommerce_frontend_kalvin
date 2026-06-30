

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