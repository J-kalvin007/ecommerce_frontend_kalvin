// /**
//  * Admin — Page d'entrée du dashboard
//  * @module app/admin/page
//  */

// import type { Metadata } from "next";
// import { Suspense } from "react";
// import AdminDashboard from "./AdminDashboard";

// export const metadata: Metadata = { title: "Dashboard Administrateur" };

// export default function AdminPage() {
//   return (
//     <Suspense fallback={<div>Chargement du dashboard admin...</div>}>
//       <AdminDashboard />
//     </Suspense>
//   );
// }













// app/admin/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import AdminDashboard from "./AdminDashboard";
import LoadingStyle from "@/components/special/loadingStyle";

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