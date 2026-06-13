/**
 * Checkout — Page de commande
 * @module app/checkout/page
 */

import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalisez votre commande Atelier du terroir. Paiement sécurisé, livraison mondiale.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
