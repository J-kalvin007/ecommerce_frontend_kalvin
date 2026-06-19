/**
 * Login — Page de connexion
 *
 * @module app/auth/login/page
 */

import type { Metadata } from "next";
import { LoginPageView } from "./components/LoginPageView";
import Header from "@/components/layout/LegacyHeader";
import { LegacyFooter } from "@/components/layout/LegacyFooter";
// import LoginClient from "./components/LoginClient";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte L'Atelier du Terroir pour accéder à vos commandes, votre portefeuille et vos avantages fidélité.",
};

export default function LoginPage() {
  // return <LoginClient />;
  // return <LoginPageView />;

  return (
    <main>
      <Header />;
      <LoginPageView />;
      <LegacyFooter />;
    </main>
  )
}
