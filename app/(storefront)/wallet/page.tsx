/**
 * Wallet — Redirect to dashboard wallet tab
 * @module app/wallet/page
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Mon Portefeuille" };

export default function WalletPage() {
  redirect("/dashboard?tab=wallet");
}
