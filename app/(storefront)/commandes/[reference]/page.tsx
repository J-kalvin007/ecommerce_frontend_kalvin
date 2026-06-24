/**
 * Commandes — Page de détail d'une commande
 * @module app/commandes/[reference]/page
 */

import type { Metadata } from "next";
import OrderDetailClient from "./OrderDetailClient";

interface Props {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Commande ${reference}`,
    description: `Détail et suivi de votre commande ${reference} — Atelier du terroir.`,
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { reference } = await params;
  return <OrderDetailClient reference={reference} />;
}
