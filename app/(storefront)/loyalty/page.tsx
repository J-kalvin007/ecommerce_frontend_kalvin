/**
 * Loyalty — Redirect to dashboard loyalty tab
 * @module app/loyalty/page
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Ma Fidélité" };

export default function LoyaltyPage() {
  redirect("/dashboard?tab=loyalty");
}
