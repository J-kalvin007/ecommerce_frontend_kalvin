/**
 * Dashboard Client — Espace client
 *
 * Wrap le contenu dans CustomerShell qui fournit :
 *   - La topbar premium avec logo, notifications et profil
 *   - La sidebar collapsible (vert forêt / or) avec navigation client
 *   - La modale de déconnexion premium
 *
 * @module app/customer/dashboard_client/page
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import CustomerShell from "@/app/customer/components/CustomerShell";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Mon Dashboard | Atelier du Terroir",
  description: "Gérez vos commandes, votre portefeuille et vos points de fidélité.",
};

export default function DashboardPage() {
  return (
    <CustomerShell activeSection="dashboard">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1f4d3f]/20 border-t-[#1f4d3f]" />
          </div>
        }
      >
        <DashboardClient />
      </Suspense>
    </CustomerShell>
  );
}
