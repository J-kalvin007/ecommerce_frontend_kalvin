/**
 * Storefront Layout
 * @module app/(storefront)/layout
 */

"use client";

import { usePathname } from "next/navigation";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
import { LegacyFooter } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import CartDrawer from "./commandes/components/PannierProduits";




export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname === "/contact";

  return (
    <>
      {/* <Header /> */}

      <Header />

      <main className="storefront-content min-h-[calc(100vh-var(--navbar-height))] bg-gradient-to-br from-primary/10 via-white to-primary/5">
        {children}
      </main>

      <LegacyFooter />

      {/* {!hideFooter && <Footer />} */}

      <CartDrawer />
    </>
  );
}
