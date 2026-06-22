
/**
 * A Propos — Page de A propos premium
 * @module app/Propos/page
 */

import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "A Propos",
  description: "A Proposez l'équipe Atelier du terroir. Vue d'ensemble sur nos actibites.",
};

export default function AboutPage() {
  return <AboutClient />;
}
