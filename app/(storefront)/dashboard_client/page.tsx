/**
 * Dashboard — Espace client
 * @module app/dashboard/page
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Mon Dashboard",
  description: "Gérez vos commandes, votre portefeuille et vos points de fidélité.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Chargement du tableau de bord...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
