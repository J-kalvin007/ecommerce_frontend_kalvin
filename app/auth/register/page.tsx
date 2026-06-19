/**
 * Register — Page d'inscription
 *
 * @module app/auth/register/page
 */

import type { Metadata } from "next";
import { RegisterPageView } from "./components/RegisterPageView";
// import RegisterClient from "./components/RegisterClient";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Atelier du terroir et profitez de notre programme de fidélité, portefeuille intégré et livraison mondiale.",
};

export default function RegisterPage() {
  // return <RegisterClient />;
  return <RegisterPageView />;
}
