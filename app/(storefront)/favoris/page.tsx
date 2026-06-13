/**
 * favoris — Page de souhaits
 * @module app/favoris/page
 */

import type { Metadata } from "next";
import FavorisClient from "./FavorisClient";

export const metadata: Metadata = {
  title: "Ma liste de souhaits",
  description: "Retrouvez vos produits favoris et ajoutez-les à votre panier en un clic.",
};

export default function favorisPage() {
  return <FavorisClient />;
}
