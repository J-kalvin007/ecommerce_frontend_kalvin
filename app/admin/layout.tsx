/**
 * Admin Layout — Layout dédié à l'espace administration
 *
 * Structure : Sidebar fixe + zone de contenu avec topbar
 * Glassmorphisme + gradient luxueux
 *
 * @module app/admin/layout
 */

import type { Metadata } from "next";
import "./admin-theme.css";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Admin Atelier du terroir" },
  description: "Tableau de bord administrateur Atelier du terroir",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-theme">{children}</div>;
}
