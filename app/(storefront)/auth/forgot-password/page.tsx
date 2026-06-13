import type { Metadata } from "next";
import ForgotPasswordClient from "./components/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Mot de passe oublie | L'Atelier du Terroir",
  description: "Demande de reinitialisation du mot de passe.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
