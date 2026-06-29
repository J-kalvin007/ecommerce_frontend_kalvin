import type { Metadata } from "next";
import { Suspense } from "react";
import AccesInformation from "../components/AccesInformation";
import { ContainerFormAuth } from "@/app/auth/components/ContainerFormAuth";

export const metadata: Metadata = {
  title: "Confirmez votre adresse e-mail | L'Atelier du Terroir",
  description: "Vérifiez votre boîte mail pour activer votre compte Atelier du Terroir.",
};

export default function AccesInformationPage() {
  return (
    <ContainerFormAuth>
      <Suspense>
        <AccesInformation />
      </Suspense>
    </ContainerFormAuth>
  );
}
