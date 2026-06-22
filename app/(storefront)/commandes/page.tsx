/**
 * Commandes — Page de commande
 * @module app/commandes/page
 */

import type { Metadata } from "next";
import CommandesClient from "./components/CommandesClient";

export const metadata: Metadata = {
  title: "Commandes",
  description: "Finalisez votre commande Atelier du terroir. Paiement sécurisé, livraison mondiale.",
};

export default function CommandesPage() {
  return <CommandesClient />;
}
