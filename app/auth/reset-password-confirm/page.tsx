import type { Metadata } from "next";
import ResetPasswordConfirmClient from "./components/ResetPasswordConfirmClient";
import { ContainerFormAuth } from "@/app/auth/components/ContainerFormAuth";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | L'Atelier du Terroir",
  description: "Confirmation de reinitialisation du mot de passe.",
};

export default function ResetPasswordConfirmPage() {
  return (
    <ContainerFormAuth>
      <ResetPasswordConfirmClient />
    </ContainerFormAuth>
  );
}
