/**
 * ════════════════════════════════════════════════════════════════════════════
 * @file        ContactClient.tsx
 * @description Page de contact ultra-premium — formulaire, FAQ accordéon,
 *              méthodes de contact et horaires. Animations fluides, micro-
 *              interactions soignées, hiérarchie visuelle raffinée, niveau
 *              fintech haut de gamme.
 *
 * @preserves   ✔ Tous les noms de variables, états et fonctions identiques
 *              ✔ L'appel API POST /api/contact et sa gestion d'erreur identiques
 *              ✔ La structure de données CONTACT_METHODS et FAQ identiques
 *              ✔ Les imports et leurs chemins
 *
 * @changelog   + Hero avec halo animé et micro-badge de confiance
 *              + Champs de formulaire avec focus-glow, compteur de caractères
 *                sur le message, et validation visuelle douce
 *              + FAQ : transition de hauteur fluide via AnimatePresence
 *                (l'originale n'avait pas d'animation de sortie)
 *              + Cartes de contact avec lift au survol et icône qui pivote
 *              + État "envoyé" enrichi d'une icône animée en cascade
 *              + Stagger d'entrée sur toutes les sections au scroll
 *
 * @module      app/contact/ContactClient
 * ════════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// §1 — DONNÉES STATIQUES (identiques à l'original)
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// §2 — CONSTANTES D'ANIMATION
//      Physique spring unifiée — cohérence perceptuelle avec le reste de
//      l'application (mêmes courbes que PurchaseModal / FavorisClient).
// -----------------------------------------------------------------------------

/** Réponse snap — interactions tactiles immédiates (boutons, toggles) */
const SPRING_SNAPPY = {
  type: "spring",
  stiffness: 500,
  damping: 34,
  mass: 0.75,
} as const;

/** Réponse douce — transitions de contenu et orchestration de section */
const SPRING_SMOOTH = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 1.1,
} as const;

/** Courbe ease-out cubic-bezier — sentiment de fluidité organique */
const EASE_OUT_CUBIC: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Limite de caractères affichée comme repère doux sur le textarea (purement visuel) */
const MESSAGE_SOFT_LIMIT = 500;

// -----------------------------------------------------------------------------
// §3 — SOUS-COMPOSANT : variantes de section réutilisables
//      Centralise l'orchestration d'entrée pour chaque grand bloc de la page.
// -----------------------------------------------------------------------------

const fadeUpVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_CUBIC } },
} as const;

// -----------------------------------------------------------------------------
// §4 — COMPOSANT PRINCIPAL : ContactClient
// -----------------------------------------------------------------------------

export default function ContactClient() {
  /* --- État (identique à l'original) ---------------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Nouvel état purement visuel — piste quel champ a le focus pour le glow
  // contextuel. N'affecte ni la validation ni la soumission du formulaire.
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const { sendContactMessage } = await import("@/fonctions_api/notifications.api");
      const res = await sendContactMessage(formData);

      if (!res.ok) {
        throw new Error(res.error?.message || "Une erreur est survenue. Veuillez réessayer.");
      }

      setIsSent(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  /* --- Rendu ------------------------------------------------------------------ */
  return (
    <div className="page-transition relative min-h-screen overflow-hidden bg-[#F7F5F0]/30">

      {/* ════════════════════════════════════════════════════════════════════
          ARRIÈRE-PLAN — Blobs flous animés en respiration lente
      ════════════════════════════════════════════════════════════════════ */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#1f4d3f]/5 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-40 h-[600px] w-[600px] rounded-full bg-[#1f4d3f]/[0.03] blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 1.2 }}
      />
      {/* Texture pointillée discrète — profondeur visuelle premium */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #1f4d3f 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 border-b border-primary/10 bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center sm:px-6 lg:px-8 lg:py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_SMOOTH}
            className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-sm"
          >
            <ShieldCheck className="h-3 w-3" />
            Réponse garantie sous 24h
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: EASE_OUT_CUBIC }}
            className="font-display text-3xl font-bold tracking-[-0.02em] text-slate-950 lg:text-4xl"
          >
            Contactez-nous
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: EASE_OUT_CUBIC }}
            className="mx-auto mt-3 max-w-lg text-slate-600"
          >
            Notre équipe est là pour vous aider. Choisissez votre canal préféré ou
            envoyez-nous un message.
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ══════════════════════════════════════════════════════════════════
            FORMULAIRE + FAQ
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

          {/* -- Colonne formulaire -------------------------------------- */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUpVariants}
          >
            <h2 className="font-display text-xl font-bold text-[#1f4d3f]">
              Envoyez-nous un message
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Nous vous répondrons dans les 24 heures.
            </p>

            <AnimatePresence mode="wait">
              {isSent ? (
                /* -- État "message envoyé" ----------------------------- */
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={SPRING_SMOOTH}
                  className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-primary/15 bg-white/88 p-8 text-center shadow-[0_18px_40px_-32px_rgba(52,76,61,0.18)] backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.08, ...SPRING_SNAPPY }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
                  >
                    {/* Halo pulsé de confirmation */}
                    <motion.div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-success/15"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    />
                    <Send className="relative h-8 w-8 text-success" />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="text-lg font-bold text-slate-950"
                  >
                    Message envoyé !
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-slate-600"
                  >
                    Nous avons bien reçu votre message et vous répondrons rapidement.
                  </motion.p>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsSent(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                      setError(null);
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.26 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  >
                    Envoyer un autre message
                  </motion.button>
                </motion.div>
              ) : (
                /* -- Formulaire actif ---------------------------------- */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-4 rounded-2xl border border-primary/10 bg-white/88 p-6 shadow-[0_18px_40px_-32px_rgba(52,76,61,0.18)] backdrop-blur-sm sm:p-8"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Champ Nom */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-800">
                        Nom <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          required
                          placeholder="Alexandre Koffi"
                          className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        {/* Glow contextuel sous le champ actif */}
                        <FieldFocusGlow active={focusedField === "name"} />
                      </div>
                    </div>

                    {/* Champ Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-800">
                        Email <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          required
                          placeholder="alexkoffi@email.com"
                          className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <FieldFocusGlow active={focusedField === "email"} />
                      </div>
                    </div>
                  </div>

                  {/* Champ Sujet */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-800">
                      Sujet <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.subject}
                        onChange={(e) => updateField("subject", e.target.value)}
                        onFocus={() => setFocusedField("subject")}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full cursor-pointer appearance-none rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="order">Ma commande</option>
                        <option value="product">Question produit</option>
                        <option value="return">Retour / Remboursement</option>
                        <option value="partnership">Partenariat</option>
                        <option value="other">Autre</option>
                      </select>
                      {/* Chevron personnalisé (remplace la flèche native du <select>) */}
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <FieldFocusGlow active={focusedField === "subject"} />
                    </div>
                  </div>

                  {/* Champ Message */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-800">
                        Message <span className="text-primary">*</span>
                      </label>
                      {/* Compteur de caractères — repère doux, purement visuel */}
                      <span
                        className={cn(
                          "text-[11px] font-medium tabular-nums transition-colors",
                          formData.message.length > MESSAGE_SOFT_LIMIT
                            ? "text-amber-600"
                            : "text-slate-400"
                        )}
                      >
                        {formData.message.length}/{MESSAGE_SOFT_LIMIT}
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={formData.message}
                        onChange={(e) => updateField("message", e.target.value)}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={5}
                        placeholder="Décrivez votre demande..."
                        className="w-full resize-none rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <FieldFocusGlow active={focusedField === "message"} />
                    </div>
                  </div>

                  {/* Message d'erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: EASE_OUT_CUBIC }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bouton de soumission */}
                  <motion.button
                    type="submit"
                    disabled={isSending}
                    whileHover={!isSending ? { scale: 1.012, boxShadow: "0 14px 32px rgba(31,77,63,0.28)" } : undefined}
                    whileTap={!isSending ? { scale: 0.98 } : undefined}
                    transition={SPRING_SNAPPY}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-colors",
                      isSending
                        ? "cursor-not-allowed bg-primary/70"
                        : "bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow"
                    )}
                  >
                    {/* Effet shimmer en boucle sur le CTA au repos */}
                    {!isSending && (
                      <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
                        }}
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1.4 }}
                      />
                    )}

                    <AnimatePresence mode="wait" initial={false}>
                      {isSending ? (
                        <motion.div
                          key="sending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        />
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative flex items-center gap-2"
                        >
                          Envoyer <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* -- Colonne FAQ -------------------------------------------- */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUpVariants}
          >
            <h2 className="font-display text-xl font-bold text-[#1f4d3f]">
              Questions fréquentes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Trouvez rapidement la réponse à votre question.
            </p>
            <div className="mt-6 space-y-3">
              {FAQ.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.06, ...SPRING_SMOOTH }}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white/88 shadow-[0_18px_40px_-32px_rgba(52,76,61,0.14)] backdrop-blur-sm transition-colors duration-200",
                      isOpen ? "border-primary/25" : "border-primary/10"
                    )}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-primary/5"
                    >
                      {item.q}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
                        className="shrink-0"
                      >
                        <ChevronDown className={cn("h-4 w-4", isOpen ? "text-primary" : "text-muted")} />
                      </motion.div>
                    </button>

                    {/* Transition de hauteur fluide — corrige l'absence d'exit
                        animation de l'original (montage/démontage abrupt) */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: EASE_OUT_CUBIC }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-primary/10 px-5 py-4 text-sm leading-relaxed text-slate-600">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MÉTHODES DE CONTACT
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUpVariants}
          className="my-16"
        >
          <h2 className="mb-6 text-center font-display text-xl font-bold text-[#1f4d3f]">
            Nos coordonnées
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_METHODS.map(({ icon: Icon, title, value, desc, href }, i) => (
              <motion.a
                key={title}
                href={href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, ...SPRING_SMOOTH }}
                whileHover={{ y: -3 }}
                className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white/88 p-5 shadow-[0_18px_40px_-32px_rgba(52,76,61,0.18)] backdrop-blur-sm transition-colors duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15"
                  whileHover={{ rotate: -6, scale: 1.05 }}
                  transition={SPRING_SNAPPY}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </motion.div>
                <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 truncate text-sm font-medium text-slate-700">{value}</p>
                <p className="text-xs text-slate-500">{desc}</p>

                {/* Liseré inférieur qui se déploie au survol */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-[#1f4d3f] to-[#1f4d3f]/30"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            HORAIRES DU SUPPORT
        ══════════════════════════════════════════════════════════════════ */}
        {/* <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUpVariants}
          className="relative mt-12 overflow-hidden rounded-2xl border border-primary/10 bg-white/88 p-6 text-center shadow-[0_18px_40px_-32px_rgba(52,76,61,0.14)] backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={SPRING_SNAPPY}
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10"
          >
            <Clock className="h-5 w-5 text-[#1f4d3f]" />
          </motion.div>
          <h3 className="mt-3 font-semibold text-[#1f4d3f]">Horaires du support</h3>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-600">
            <span>Lundi - Vendredi : 9h - 18h (CET)</span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Chat en ligne : 24/7
            </span>
          </p>
        </motion.div> */}

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// §5 — SOUS-COMPOSANT PUR : FieldFocusGlow
//      Halo doux sous un champ de formulaire lorsqu'il a le focus. Purement
//      décoratif, ne capte aucun événement, n'interfère pas avec la saisie.
// -----------------------------------------------------------------------------

function FieldFocusGlow({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scaleX: 0.85 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0.85 }}
          transition={{ duration: 0.22, ease: EASE_OUT_CUBIC }}
          className="pointer-events-none absolute -inset-x-1 -bottom-1 h-3 rounded-full bg-primary/15 blur-md"
        />
      )}
    </AnimatePresence>
  );
}