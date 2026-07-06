import PageError from "@/components/error/pageError";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable | Atelier du terroir",
  description: "La page que vous recherchez n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return (
    <PageError
      title="Page introuvable"
      message="L'URL que vous avez saisie est incorrecte ou la page n'est plus disponible."
      statusCode={404}
    // embedded={false}
    />
  );
}
