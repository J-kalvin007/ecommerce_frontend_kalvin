/**
 * CategoriesGrid — Grille de catégories visuelles
 *
 * @module components/home/CategoriesGrid
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Catégories avec emojis et gradients pour le design premium */
const CATEGORIES = [
  {
    name: "Épices & Herbes",
    slug: "epices-herbes",
    emoji: "🌶️",
    description: "Curry, safran, paprika...",
    gradient: "from-red-500/10 to-orange-500/10",
    borderColor: "hover:border-red-400/30",
  },
  {
    name: "Huiles & Vinaigres",
    slug: "huiles-vinaigres",
    emoji: "🫒",
    description: "Olive, truffe, balsamique...",
    gradient: "from-green-500/10 to-emerald-500/10",
    borderColor: "hover:border-green-400/30",
  },
  {
    name: "Chocolats & Confiseries",
    slug: "chocolats-confiseries",
    emoji: "🍫",
    description: "Grand cru, pralinés...",
    gradient: "from-amber-500/10 to-yellow-10/10",
    borderColor: "hover:border-amber-400/30",
  },
  {
    name: "Thés & Infusions",
    slug: "thes-infusions",
    emoji: "🍵",
    description: "Matcha, oolong, rooibos...",
    gradient: "from-emerald-500/10 to-teal-500/10",
    borderColor: "hover:border-emerald-400/30",
  },
  {
    name: "Pâtes & Céréales",
    slug: "pates-cereales",
    emoji: "🍝",
    description: "Artisanales, quinoa...",
    gradient: "from-yellow-500/10 to-amber-500/10",
    borderColor: "hover:border-yellow-400/30",
  },
  {
    name: "Conserves & Tartinables",
    slug: "conserves-tartinables",
    emoji: "🫙",
    description: "Confitures, tapenades...",
    gradient: "from-purple-500/10 to-pink-500/10",
    borderColor: "hover:border-purple-400/30",
  },
  {
    name: "Boissons",
    slug: "boissons",
    emoji: "🥤",
    description: "Jus, sirops, kombucha...",
    gradient: "from-blue-500/10 to-cyan-500/10",
    borderColor: "hover:border-blue-400/30",
  },
  {
    name: "Produits Bio",
    slug: "produits-bio",
    emoji: "🌿",
    description: "Certifiés biologiques",
    gradient: "from-lime-500/10 to-green-500/10",
    borderColor: "hover:border-lime-400/30",
  },
] as const;

/**
 * CategoriesGrid — Grille de catégories avec design premium.
 */
export default function CategoriesGrid() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)]">
        {/* Titre section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Explorer par catégorie
          </p>
          <h2 className="font-display text-3xl font-bold lg:text-4xl">
            Des Saveurs Pour Tous les Goûts
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Parcourez nos collections soigneusement sélectionnées parmi les meilleurs
            producteurs du monde.
          </p>
        </motion.div>

        {/* Grille */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${cat.borderColor}`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />

                {/* Emoji icon */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {cat.emoji}
                </div>

                {/* Text */}
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {cat.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="relative z-10 h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
