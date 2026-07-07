/**
 * Commandes — Page de commande
 * @module app/commandes/page
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import CommandesClient from "./components/CommandesClient";

export const metadata: Metadata = {
  title: "Commandes",
  description: "Finalisez votre commande Atelier du terroir. Paiement sécurisé, livraison mondiale.",
};

export default function CommandesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3f] border-t-transparent" />
        </div>
      }
    >
      <CommandesClient />
    </Suspense>
  );
}
