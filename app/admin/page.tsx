


// app/admin/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingStyle from "@/components/widgets_originaux/special/loadingStyle";
import AdminDashboard from "./components/dashboard/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Dashboard Administrateur - Atelier du Terroir",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingStyle label="Chargement du dashboard administrateur..." size={8} />}>
      <AdminDashboard />
    </Suspense>
  );
}