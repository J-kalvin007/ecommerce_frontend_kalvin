/**
 * Login — Page de connexion
 *
 * @module app/auth/login/page
 */

import type { Metadata } from "next";
import { LoginPageView } from "./components/LoginPageView";
// import LoginClient from "./components/LoginClient";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte L'Atelier du Terroir pour accéder à vos commandes, votre portefeuille et vos avantages fidélité.",
};

export default function LoginPage() {
  // return <LoginClient />;
  return <LoginPageView />;
}
