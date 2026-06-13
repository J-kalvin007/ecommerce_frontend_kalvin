/**
 * PromoBanner — Bannière promotionnelle cinématique
 *
 * @module components/home/PromoBanner
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

/**
 * PromoBanner — Grande bannière promotionnelle full-width.
 */
export default function PromoBanner() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C0A09] via-[#1C1917] to-[#0C0A09] p-8 sm:p-12 lg:p-16"
        >
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-highlight/15 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
            {/* Texte */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Offre limitée
                </span>
              </div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                -20% sur votre
                <br />
                <span className="text-gradient-primary">première commande</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-white/60 lg:mx-0">
                Utilisez le code <span className="font-bold text-highlight">Atelier du terroir20</span>{" "}
                lors de votre première commande et découvrez nos saveurs du monde
                à prix réduit.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/products"
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-highlight px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-glow-strong"
                >
                  En profiter maintenant
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-4">
                  <span className="font-mono text-2xl font-bold tracking-widest text-white">
                    Atelier du terroir20
                  </span>
                </div>
              </div>
            </div>

            {/* Timer / visual element */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: "07", label: "Jours" },
                  { value: "14", label: "Heures" },
                  { value: "33", label: "Min" },
                  { value: "52", label: "Sec" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <span className="font-mono text-3xl font-bold text-white sm:text-4xl">
                      {item.value}
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
