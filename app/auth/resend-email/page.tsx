import type { Metadata } from "next";
import ResendEmailForm from "./components/ResendEmailForm";
import { ContainerFormAuth } from "@/app/auth/components/ContainerFormAuth";

export const metadata: Metadata = {
  title: "Nouvel envoi d'email | L'Atelier du Terroir",
  description: "Nouvel envoi d'email pour l'activation du compte.",
};

export default function ResendEmailPage() {
  return (
    <ContainerFormAuth>
      <ResendEmailForm />
    </ContainerFormAuth>
  );
}
