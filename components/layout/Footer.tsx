// "use client";

// import { useRef, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { motion, useInView } from "framer-motion";
// import {
//   ArrowUpRight,
//   Award,
//   Headphones,
//   Leaf,
//   Mail,
//   MapPin,
//   Phone,
//   Send,
//   ShieldCheck,
//   Sprout,
//   Truck,
// } from "lucide-react";
// import logoImage from "@C:\Travaux_informatiques\Next.js\site_atelier_du_terroir\public\assets\images\LOGO.png";

// const BADGES = [
//   { label: "Paiement securise", icon: ShieldCheck },
//   { label: "Livraison rapide", icon: Truck },
//   { label: "Produits certifies", icon: Award },
//   { label: "Support 7j/7", icon: Headphones },
// ] as const;

// const PAGE_LINKS = [
//   { label: "Boutique", href: "/products" },
//   { label: "Contact", href: "/contact" },
//   { label: "A propos", href: "/about" },
// ] as const;

// const SOLUTION_LINKS = [
//   { label: "Produits locaux", href: "/products?filter=local" },
//   { label: "Produits transformes", href: "/products?filter=processed" },
//   { label: "Export", href: "/products?filter=export" },
//   { label: "Agrobusiness", href: "/about" },
// ] as const;

// const PHONE_NUMBERS = ["+228 72318393", "+228 92226399", "+228 97014471"] as const;

// function FooterTitle({ children }: { children: React.ReactNode }) {
//   return (
//     <div>
//       <p className="text-sm font-black text-white">{children}</p>
//       <div className="mt-2 h-0.5 w-9 rounded-full bg-[#ef8219]" />
//     </div>
//   );
// }

// export default function Footer() {
//   const [email, setEmail] = useState("");
//   const [subscribed, setSubscribed] = useState(false);
//   const footerRef = useRef<HTMLElement | null>(null);
//   const isInView = useInView(footerRef, { once: true, margin: "-80px" });

//   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!email.trim()) return;
//     setSubscribed(true);
//     setEmail("");
//     setTimeout(() => setSubscribed(false), 2400);
//   };

//   return (
//     <footer ref={footerRef} className="relative overflow-hidden bg-[#183a1f] text-white">
//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(239,130,25,0.16),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.10),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />
//       <Leaf className="pointer-events-none absolute left-10 top-8 h-16 w-16 -rotate-12 text-white/12" />
//       <Sprout className="pointer-events-none absolute right-12 top-20 h-20 w-20 rotate-12 text-[#ef8219]/20" />

//       <motion.div
//         initial={{ opacity: 0, y: -18 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.55 }}
//         className="relative z-10 mx-auto max-w-6xl px-6 pt-5"
//       >
//         <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-[#ef8219] px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:grid-cols-4 md:px-6">
//           {BADGES.map(({ label, icon: Icon }, index) => (
//             <motion.div
//               key={label}
//               initial={{ opacity: 0, y: -8 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.35, delay: index * 0.05 }}
//               className="flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white"
//             >
//               <Icon className="h-3.5 w-3.5 shrink-0" />
//               {label}
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>

//       <div className="relative z-10 mx-auto max-w-6xl px-6">
//         <motion.div
//           initial={{ opacity: 0, y: 24 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6, delay: 0.08 }}
//           className="relative mx-auto mt-6 overflow-hidden rounded-[1.35rem] bg-[#4fad28] px-5 py-4 shadow-[0_20px_52px_rgba(0,0,0,0.16)] md:px-6"
//         >
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.18),transparent_20%)]" />
//           <Leaf className="absolute -left-3 -top-4 h-14 w-14 -rotate-12 text-white/35" />
//           <Leaf className="absolute right-10 -top-2 h-12 w-12 rotate-45 text-white/30" />

//           <div className="relative grid gap-5 md:grid-cols-[1fr_1.15fr] md:items-center">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18">
//                 <Mail className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-white/75">Soyez au courant</p>
//                 <h3 className="text-lg font-black leading-tight text-white">
//                   Restez informe
//                 </h3>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="flex gap-2 rounded-full bg-white p-1 shadow-inner">
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 placeholder="Votre email"
//                 className="min-w-0 flex-1 rounded-full px-4 text-sm font-medium text-[#183a1f] outline-none placeholder:text-[#183a1f]/45"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#ef8219] px-4 text-xs font-black text-white transition hover:bg-[#d96f13]"
//               >
//                 {subscribed ? "Inscrit !" : "S'inscrire"}
//                 <Send className="h-4 w-4" />
//               </button>
//             </form>
//           </div>
//         </motion.div>

//         <div className="grid gap-8 py-10 lg:grid-cols-[1.25fr_0.65fr_0.8fr_1fr]">
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.55, delay: 0.12 }}
//             className="space-y-5"
//           >
//             <div className="flex items-center gap-4">
//               <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
//                 <Image
//                   src={logoImage}
//                   alt="Logo L'Atelier du Terroir"
//                   width={42}
//                   height={42}
//                   className="object-contain"
//                 />
//               </div>
//               <div>
//                 <h2 className="text-xl font-black leading-tight">L&apos;Atelier du Terroir</h2>
//                 <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#ef8219]">
//                   Deal & Consulting
//                 </p>
//               </div>
//             </div>

//             <p className="max-w-sm text-sm leading-6 text-white/68">
//               Des produits du terroir d&apos;exception, selectionnes avec soin pour
//               reveler le meilleur de la gastronomie agricole locale et export.
//             </p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.55, delay: 0.16 }}
//           >
//             <FooterTitle>Navigation</FooterTitle>
//             <ul className="mt-4 space-y-2.5">
//               {PAGE_LINKS.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="group inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
//                   >
//                     {link.label}
//                     <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.55, delay: 0.2 }}
//           >
//             <FooterTitle>Solutions</FooterTitle>
//             <ul className="mt-4 space-y-2.5">
//               {SOLUTION_LINKS.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="group inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
//                   >
//                     {link.label}
//                     <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.55, delay: 0.24 }}
//           >
//             <FooterTitle>Contact</FooterTitle>
//             <ul className="mt-4 space-y-4">
//               <li className="flex gap-3">
//                 <Mail className="mt-1 h-4 w-4 shrink-0 text-[#ef8219]" />
//                 <div>
//                   <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Email</p>
//                   <a
//                     href="mailto:agrobusiness@dealandconsulting.com"
//                     className="mt-1 block text-sm text-white/70 transition hover:text-white"
//                   >
//                     agrobusiness@dealandconsulting.com
//                   </a>
//                 </div>
//               </li>

//               <li className="flex gap-3">
//                 <Phone className="mt-1 h-4 w-4 shrink-0 text-[#ef8219]" />
//                 <div>
//                   <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Telephone</p>
//                   <div className="mt-1 space-y-1">
//                     {PHONE_NUMBERS.map((phone) => (
//                       <a
//                         key={phone}
//                         href={`tel:${phone.replace(/\s+/g, "")}`}
//                         className="block text-sm text-white/70 transition hover:text-white"
//                       >
//                         {phone}
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               </li>

//               <li className="flex gap-3">
//                 <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#ef8219]" />
//                 <div>
//                   <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Adresse</p>
//                   <p className="mt-1 text-sm text-white/70">Rue 120 Agoe Minamadou, Lome</p>
//                 </div>
//               </li>
//             </ul>
//           </motion.div>
//         </div>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={isInView ? { opacity: 1 } : {}}
//           transition={{ duration: 0.5, delay: 0.32 }}
//           className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-white/45 sm:flex-row"
//         >
//           <p>&copy; 2026 Deal & Consulting. Tous droits reserves.</p>
//           <div className="flex items-center gap-3">
//             <Link href="/privacy" className="transition hover:text-white/75">
//               Confidentialite
//             </Link>
//             <span>·</span>
//             <Link href="/terms" className="transition hover:text-white/75">
//               Conditions
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </footer>
//   );
// }



















"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Headphones,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sprout,
  Truck,
} from "lucide-react";

// ✅ Utilisation d'un chemin valide (l'image doit être dans public/assets/images/LOGO.png)
const LOGO_PATH = "/assets/images/LOGO.png";

const BADGES = [
  { label: "Paiement securise", icon: ShieldCheck },
  { label: "Livraison rapide", icon: Truck },
  { label: "Produits certifies", icon: Award },
  { label: "Support 7j/7", icon: Headphones },
] as const;

const PAGE_LINKS = [
  { label: "Boutique", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "A propos", href: "/about" },
] as const;

const SOLUTION_LINKS = [
  { label: "Produits locaux", href: "/products?filter=local" },
  { label: "Produits transformes", href: "/products?filter=processed" },
  { label: "Export", href: "/products?filter=export" },
  { label: "Agrobusiness", href: "/about" },
] as const;

const PHONE_NUMBERS = ["+228 72318393", "+228 92226399", "+228 97014471"] as const;

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-black text-white">{children}</p>
      <div className="mt-2 h-0.5 w-9 rounded-full bg-[#ef8219]" />
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-80px" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 2400);
  };

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-[#183a1f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(239,130,25,0.16),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.10),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />
      <Leaf className="pointer-events-none absolute left-10 top-8 h-16 w-16 -rotate-12 text-white/12" />
      <Sprout className="pointer-events-none absolute right-12 top-20 h-20 w-20 rotate-12 text-[#ef8219]/20" />

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto max-w-6xl px-6 pt-5"
      >
        <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-[#ef8219] px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:grid-cols-4 md:px-6">
          {BADGES.map(({ label, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: -8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="relative mx-auto mt-6 overflow-hidden rounded-[1.35rem] bg-[#4fad28] px-5 py-4 shadow-[0_20px_52px_rgba(0,0,0,0.16)] md:px-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.18),transparent_20%)]" />
          <Leaf className="absolute -left-3 -top-4 h-14 w-14 -rotate-12 text-white/35" />
          <Leaf className="absolute right-10 -top-2 h-12 w-12 rotate-45 text-white/30" />

          <div className="relative grid gap-5 md:grid-cols-[1fr_1.15fr] md:items-center">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/75">Soyez au courant</p>
                <h3 className="text-lg font-black leading-tight text-white">
                  Restez informé
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 rounded-full bg-white p-1 shadow-inner">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Votre email"
                className="min-w-0 flex-1 rounded-full px-4 text-sm font-medium text-[#183a1f] outline-none placeholder:text-[#183a1f]/45"
                required
              />
              <button
                type="submit"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#ef8219] px-4 text-xs font-black text-white transition hover:bg-[#d96f13]"
              >
                {subscribed ? "Inscrit !" : "S'inscrire"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Colonnes principales - Centrage sur mobile */}
        <div className="grid gap-8 py-10 lg:grid-cols-[1.25fr_0.65fr_0.8fr_1fr] md:grid-cols-2 sm:grid-cols-1">
          {/* À propos */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="space-y-5 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <div className="flex items-center gap-4 flex-col md:flex-row">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
                <Image
                  src={LOGO_PATH}
                  alt="Logo L'Atelier du Terroir"
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-black leading-tight">L&apos;Atelier du Terroir</h2>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#ef8219]">
                  Deal & Consulting
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/68">
              Des produits du terroir d&apos;exception, selectionnes avec soin pour
              reveler le meilleur de la gastronomie agricole locale et export.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <FooterTitle>Navigation</FooterTitle>
            <ul className="mt-4 space-y-2.5">
              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <FooterTitle>Solutions</FooterTitle>
            <ul className="mt-4 space-y-2.5">
              {SOLUTION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <FooterTitle>Contact</FooterTitle>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3 flex-col items-center md:flex-row md:items-start">
                <Mail className="h-4 w-4 shrink-0 text-[#ef8219]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Email</p>
                  <a
                    href="mailto:agrobusiness@dealandconsulting.com"
                    className="mt-1 block text-sm text-white/70 transition hover:text-white"
                  >
                    agrobusiness@dealandconsulting.com
                  </a>
                </div>
              </li>

              <li className="flex gap-3 flex-col items-center md:flex-row md:items-start">
                <Phone className="h-4 w-4 shrink-0 text-[#ef8219]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Telephone</p>
                  <div className="mt-1 space-y-1">
                    {PHONE_NUMBERS.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="block text-sm text-white/70 transition hover:text-white"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </li>

              <li className="flex gap-3 flex-col items-center md:flex-row md:items-start">
                <MapPin className="h-4 w-4 shrink-0 text-[#ef8219]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Adresse</p>
                  <p className="mt-1 text-sm text-white/70">Rue 120 Agoe Minamadou, Lome</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Footer bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-white/45 sm:flex-row"
        >
          <p className="text-center sm:text-left">&copy; 2026 Deal & Consulting. Tous droits reserves.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="transition hover:text-white/75">
              Confidentialite
            </Link>
            <span>·</span>
            <Link href="/terms" className="transition hover:text-white/75">
              Conditions
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}