import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";
import ChatBot from "@/components/ai/ChatBot";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atelier du terroir - Epicerie Fine Mondiale",
    template: "%s | Atelier du terroir",
  },
  description:
    "Decouvrez les meilleurs produits alimentaires du monde entier. Livraison internationale, paiement securise, programme de fidelite exclusif.",
  keywords: [
    "epicerie fine",
    "produits alimentaires",
    "livraison internationale",
    "e-commerce alimentaire",
    "bio",
    "gourmet",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Atelier du terroir",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={poppins.variable}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          {children}
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
