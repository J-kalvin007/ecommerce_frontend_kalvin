/**
 * Contact — Page de contact premium
 * @module app/contact/page
 */

import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe Atelier du terroir. Support client disponible 24/7 par email, chat et téléphone.",
};

export default function ContactPage() {
  return <ContactClient />;
}
