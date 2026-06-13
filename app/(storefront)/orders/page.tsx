/**
 * Orders — Redirect to dashboard orders tab
 * @module app/orders/page
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Mes Commandes" };

export default function OrdersPage() {
  redirect("/dashboard?tab=orders");
}
