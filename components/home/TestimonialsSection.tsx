/**
 * TestimonialsSection — Témoignages clients
 *
 * @module components/home/TestimonialsSection
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Marie Dupont",
    location: "Paris, France",
    avatar: "MD",
    rating: 5,
    comment:
      "La qualité des épices est incomparable. Le safran de la Mancha a transformé mes paellas. Le programme de fidélité est un vrai plus — j'ai déjà atteint le palier Or !",
    tier: "GOLD",
  },
  {
    id: 2,
    name: "Amadou Diallo",
    location: "Dakar, Sénégal",
    avatar: "AD",
    rating: 5,
    comment:
      "Enfin une plateforme qui accepte le Mobile Money ! La recharge du wallet est instantanée et la livraison au Sénégal est rapide. Je recommande à 100%.",
    tier: "SILVER",
  },
  {
    id: 3,
    name: "Sophie Chen",
    location: "Montréal, Canada",
    avatar: "SC",
    rating: 5,
    comment:
      "Le matcha cérémoniel d'Uji est le meilleur que j'ai trouvé en ligne. L'emballage est soigné et la livraison au Canada s'est faite en 5 jours.",
    tier: "PLATINUM",
  },
  {
    id: 4,
    name: "Luca Rossi",
    location: "Milan, Italie",
    avatar: "LR",
    rating: 4,
    comment:
      "En tant qu'italien, je suis très exigeant sur l'huile d'olive. Celle de Toscane IGP est authentique et de qualité premium. Le vinaigre balsamique aussi est excellent.",
    tier: "BRONZE",
  },
] as const;

/**
 * TestimonialsSection — Carrousel de témoignages premium.
 */
export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () =>
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () =>
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="bg-surface/30 py-16 lg:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Témoignages
          </p>
          <h2 className="font-display text-3xl font-bold lg:text-4xl">
            Ce Que Disent Nos Clients
          </h2>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 shadow-lg sm:p-12"
            >
              {/* Quote icon */}
              <Quote className="absolute right-8 top-8 h-12 w-12 text-primary/10" />

              {/* Stars */}
              <div className="mb-6 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= TESTIMONIALS[activeIndex].rating
                        ? "fill-highlight text-highlight"
                        : "fill-border text-border"
                    )}
                  />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-lg leading-relaxed text-foreground sm:text-xl">
                &ldquo;{TESTIMONIALS[activeIndex].comment}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-8 flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white",
                    TESTIMONIALS[activeIndex].tier === "PLATINUM"
                      ? "bg-gradient-to-br from-gray-300 to-gray-500"
                      : TESTIMONIALS[activeIndex].tier === "GOLD"
                      ? "bg-gradient-to-br from-yellow-400 to-amber-600"
                      : TESTIMONIALS[activeIndex].tier === "SILVER"
                      ? "bg-gradient-to-br from-gray-300 to-gray-400"
                      : "bg-gradient-to-br from-amber-600 to-amber-800"
                  )}
                >
                  {TESTIMONIALS[activeIndex].avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {TESTIMONIALS[activeIndex].name}
                  </p>
                  <p className="text-sm text-muted">
                    {TESTIMONIALS[activeIndex].location}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-3 py-1 text-xs font-semibold",
                    `tier-${TESTIMONIALS[activeIndex].tier.toLowerCase()}`
                  )}
                  style={{
                    background: "var(--tier-gradient)",
                    color: "white",
                  }}
                >
                  {TESTIMONIALS[activeIndex].tier}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all hover:border-primary/30 hover:bg-surface-alt"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === activeIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-primary/30"
                  )}
                  aria-label={`Témoignage ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all hover:border-primary/30 hover:bg-surface-alt"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
