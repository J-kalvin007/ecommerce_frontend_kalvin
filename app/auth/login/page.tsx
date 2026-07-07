import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPageView } from "./components/LoginPageView";
import { LegacyFooter } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte L'Atelier du Terroir pour accéder à vos commandes, votre portefeuille et vos avantages fidélité.",
};

export default function LoginPage() {
  return (
    <main>
      <Header />
      <Suspense>
        <LoginPageView />
      </Suspense>
      <LegacyFooter />
    </main>
  );
}
