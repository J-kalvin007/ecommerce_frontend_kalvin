import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Parametres du compte",
  description: "Modifiez les informations de votre compte client.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
