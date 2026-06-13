import type { Metadata } from "next";
import VerifyEmailClient from "./components/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verification email | L'Atelier du Terroir",
  description: "Verification et renvoi de l'email d'activation du compte.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
