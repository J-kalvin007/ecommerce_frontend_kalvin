

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { logoImage } from "@/assets/images";

const pageLinks = [
  { label: "Boutique", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "A propos", href: "/about" },
];

const solutionLinks = [
  { label: "Produits locaux", href: "/products?filter=local" },
  { label: "Produits transformes", href: "/products?filter=processed" },
  { label: "Export", href: "/products?filter=export" },
  { label: "Agrobusiness", href: "/about" },
];

const phoneNumbers = ["+228 72318393", "+228 92226399", "+228 97014471"];

/* ─── Toast de notification newsletter ─── */
type ToastType = "success" | "error" | null;

function NewsletterToast({
  type,
  onClose,
}: {
  type: ToastType;
  onClose: () => void;
}) {
  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          key="newsletter-toast"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="fixed bottom-24 right-5 z-[200] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 shadow-2xl"
          style={{
            background: isSuccess
              ? "linear-gradient(135deg, #1a5c27 0%, #2e7d32 100%)"
              : "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
            border: isSuccess
              ? "1px solid rgba(134,239,172,0.30)"
              : "1px solid rgba(252,165,165,0.30)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Icône animée */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.08 }}
            className="mt-0.5 shrink-0"
          >
            {isSuccess ? (
              <CheckCircle2 className="h-6 w-6 text-green-300" />
            ) : (
              <XCircle className="h-6 w-6 text-red-300" />
            )}
          </motion.div>

          {/* Texte */}
          <div className="flex-1">
            <p
              className="text-sm font-black text-white"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
            >
              {isSuccess ? "🎉 Inscription réussie !" : "⚠️ Echec de l'inscription"}
            </p>
            <p className="mt-0.5 text-xs font-medium text-white/75">
              {isSuccess
                ? "Vous recevrez nos offres exclusives et actualités."
                : "Votre email est peut-être déjà inscrit ou invalide. Réessayez."}
            </p>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            aria-label="Fermer la notification"
            className="shrink-0 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Barre de progression auto-dismiss */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            onAnimationComplete={onClose}
            className="absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-b-2xl"
            style={{
              background: isSuccess
                ? "rgba(134,239,172,0.55)"
                : "rgba(252,165,165,0.55)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<ToastType>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribed || sending) return;

    setSending(true);
    try {
      const { subscribeToNewsletter } = await import("@/fonctions_api/notifications.api");
      const res = await subscribeToNewsletter({ email });
      if (res.ok) {
        setSubscribed(true);
        setToast("success");
      } else {
        setToast("error");
      }
    } catch (err) {
      setToast("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Toast de notification */}
      <NewsletterToast type={toast} onClose={() => setToast(null)} />

      <footer className="relative overflow-hidden bg-[#183a1f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(239,130,25,0.16),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.10),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-5">
          <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-[#ef8219] px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:grid-cols-4 md:px-6">
            {["Paiement securise", "Livraison rapide", "Produits certifies", "Support 7j/7"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white"
                >
                  <span>•</span>
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="relative mx-auto mt-6 overflow-hidden rounded-[1.35rem] bg-[#4fad28] px-5 py-4 shadow-[0_20px_52px_rgba(0,0,0,0.16)] md:px-6">
            <div className="relative grid gap-5 md:grid-cols-[1fr_1.15fr] md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18">✉</div>
                <div>
                  <p className="text-xs font-semibold text-white/75">Soyez au courant</p>
                  <h3 className="text-lg font-black leading-tight text-white">Restez informe</h3>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success-inline"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex items-center justify-center gap-3 rounded-full bg-white/20 px-5 py-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                    <span className="text-sm font-black text-white">
                      Vous êtes bien inscrit à la newsletter !
                    </span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="newsletter-form"
                    onSubmit={handleSubscribe}
                    className="flex gap-2 rounded-full bg-white p-1 shadow-inner"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre email"
                      required
                      className="min-w-0 flex-1 rounded-full px-4 text-sm font-medium text-[#183a1f] outline-none placeholder:text-[#183a1f]/45"
                      disabled={subscribed}
                    />
                    <button
                      type="submit"
                      disabled={subscribed || sending}
                      className="inline-flex cursor-pointer h-9 shrink-0 items-center gap-2 rounded-full bg-[#ef8219] px-4 text-xs font-black text-white hover:bg-[#d96f13] disabled:opacity-70"
                    >
                      {sending ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                          />
                          Envoi...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Grille principale – centrage mobile */}
          <div className="grid gap-8 py-10 text-center lg:grid-cols-[1.25fr_0.65fr_0.8fr_1fr] lg:text-left">
            {/* Colonne Marque */}
            <div className="flex flex-col items-center space-y-5 lg:items-start">
              <div className="flex flex-col items-center gap-4 lg:flex-row">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
                  <Image
                    src={logoImage}
                    alt="Logo L'Atelier du Terroir"
                    width={42}
                    height={42}
                    className="object-contain"
                  />
                </div>
                <div className="text-center lg:text-left">
                  <h2 className="text-xl font-black leading-tight">L&apos;Atelier du Terroir</h2>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#ef8219]">
                    Deal &amp; Consulting
                  </p>
                </div>
              </div>

              <p className="max-w-sm text-center text-sm leading-6 text-white/68 lg:text-left">
                Des produits du terroir d&apos;exception, selectionnes avec soin pour reveler le meilleur de la gastronomie agricole locale et export.
              </p>
            </div>

            <FooterColumn title="Navigation" links={pageLinks} />
            <FooterColumn title="Solutions" links={solutionLinks} />

            <div className="flex flex-col items-center lg:items-start">
              <FooterTitle>Contact</FooterTitle>
              <div className="mt-4 space-y-4 text-center text-sm text-white/70 lg:text-left">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Email</p>
                  <p className="mt-1">agrobusiness@dealandconsulting.com</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                    Telephone
                  </p>
                  <div className="mt-1 space-y-1">
                    {phoneNumbers.map((phone) => (
                      <p key={phone}>{phone}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Adresse</p>
                  <p className="mt-1">Rue 120 Agoe Minamadou, Lome</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-white/45 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Deal &amp; Consulting. Tous droits reserves.</p>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="transition cursor-pointer hover:text-white/75">
                Confidentialite
              </Link>
              <span>·</span>
              <Link href="/terms" className="transition cursor-pointer hover:text-white/75">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-black text-white">{children}</p>
      <div className="mt-2 h-0.5 w-9 rounded-full bg-[#ef8219]" />
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <FooterTitle>{title}</FooterTitle>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/62 transition hover:text-white"
            >
              {link.label}
              <span className="opacity-0 transition group-hover:opacity-100">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}