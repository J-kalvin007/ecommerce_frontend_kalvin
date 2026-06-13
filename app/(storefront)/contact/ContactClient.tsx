"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email",
    value: "agrobusiness@dealandconsulting.com",
    desc: "Réponse sous 24h",
    href: "mailto:agrobusiness@dealandconsulting.com",
  },
  {
    icon: Phone,
    title: "Téléphone",
    value: "+228 72318393",
    desc: "Lun-Ven, 9h-18h",
    href: "tel:+22872318393",
  },
  {
    icon: MessageSquare,
    title: "Assistance",
    value: "Réponse personnalisée",
    desc: "Questions sur vos commandes",
    href: "#",
  },
  {
    icon: MapPin,
    title: "Adresse",
    value: "Rue 120 Agoe Minamadou",
    desc: "Lomé, Togo",
    href: "#",
  },
] as const;

const FAQ = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "Les délais varient selon la destination. Pour les livraisons locales, elles peuvent être traitées rapidement. Pour les envois à distance, le délai dépend du transporteur et du lieu de livraison.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Le site peut prendre en charge plusieurs moyens de paiement selon les options activées, notamment mobile money, carte bancaire et portefeuille électronique.",
  },
  {
    q: "Puis-je suivre ma commande ?",
    a: "Oui. Une fois la commande confirmée, son statut peut évoluer entre confirmation, traitement, expédition et livraison.",
  },
  {
    q: "Livrez-vous à l'international ?",
    a: "Oui, la plateforme est pensée pour la commercialisation locale et à l'international selon les produits disponibles et les modalités de livraison.",
  },
] as const;

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSending(false);
    setIsSent(true);
  };

  return (
    <div className="page-transition relative overflow-hidden">
      {/* Hero section */}
      <div className="border-b border-primary/10 bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center lg:py-16">
          <h1 className="font-display text-3xl font-bold text-slate-950 lg:text-4xl">
            Contactez-nous
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Notre équipe est là pour vous aider. Choisissez votre canal préféré ou
            envoyez-nous un message.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Formulaire + FAQ (en haut) */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Formulaire */}
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">
              Envoyez-nous un message
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Nous vous répondrons dans les 24 heures.
            </p>

            {isSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-primary/15 bg-white/88 p-8 text-center shadow-[0_18px_40px_-32px_rgba(52,76,61,0.18)] backdrop-blur-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Send className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Message envoyé !</h3>
                <p className="text-sm text-slate-600">
                  Nous avons bien reçu votre message et vous répondrons rapidement.
                </p>
                <button
                  onClick={() => {
                    setIsSent(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Envoyer un autre message
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4 rounded-2xl border border-primary/10 bg-white/88 p-6 shadow-[0_18px_40px_-32px_rgba(52,76,61,0.18)] backdrop-blur-sm sm:p-8"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-800">
                      Nom <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                      placeholder="Alexandre Koffi"
                      className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-800">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      placeholder="alexkoffi@email.com"
                      className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-800">
                    Sujet <span className="text-primary">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    required
                    className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="order">Ma commande</option>
                    <option value="product">Question produit</option>
                    <option value="return">Retour / Remboursement</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-800">
                    Message <span className="text-primary">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    required
                    rows={5}
                    placeholder="Décrivez votre demande..."
                    className="w-full resize-none rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                    isSending
                      ? "cursor-not-allowed bg-primary/70"
                      : "bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow",
                  )}
                >
                  {isSending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Envoyer <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">
              Questions fréquentes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Trouvez rapidement la réponse à votre question.
            </p>
            <div className="mt-6 space-y-3">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-primary/10 bg-white/88 shadow-[0_18px_40px_-32px_rgba(52,76,61,0.14)] backdrop-blur-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-primary/5"
                  >
                    {item.q}
                    <Clock
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted transition-transform",
                        openFaq === i && "rotate-180",
                      )}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      className="border-t border-primary/10 px-5 py-4 text-sm leading-relaxed text-slate-600"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Méthodes de contact (en bas) */}
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-slate-950 text-center mb-6">
            Nos coordonnées
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_METHODS.map(({ icon: Icon, title, value, desc, href }) => (
              <a
                key={title}
                href={href}
                className="group rounded-2xl border border-primary/10 bg-white/88 p-5 shadow-[0_18px_40px_-32px_rgba(52,76,61,0.18)] backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Horaires du support (tout en bas) */}
        <div className="mt-12 rounded-2xl border border-primary/10 bg-white/88 p-6 text-center shadow-[0_18px_40px_-32px_rgba(52,76,61,0.14)] backdrop-blur-sm">
          <Clock className="mx-auto h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold text-slate-950">Horaires du support</h3>
          <p className="mt-1 text-sm text-slate-600">
            Lundi - Vendredi : 9h - 18h (CET) · Chat en ligne : 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
