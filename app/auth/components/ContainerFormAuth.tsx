"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import type { ReactNode } from "react";
import {
  authHeroImage,
  authProduceImage,
  authVegetablesImage,
  authVeganImage,
  orangeImage,
  pimentHeroImage,
  tomateCardImage,
} from "@/assets/images";

/* ─────────────────────────────────────────────────────────────────
   Floating leaves — positioned at screen margins so they're
   always visible alongside the centered form card.
───────────────────────────────────────────────────────────────── */
const FLOATING_LEAVES = [
  { className: "left-[1.5%] top-[9%]   h-10 w-10", rotate: -22, delay: 0.10, duration: 5.4 },
  { className: "left-[5%]  bottom-[20%] h-12 w-12", rotate:  24, delay: 0.45, duration: 6.1 },
  { className: "right-[3%] top-[18%]   h-9  w-9",  rotate:  16, delay: 0.80, duration: 5.8 },
  { className: "right-[6%] bottom-[16%] h-14 w-14", rotate: -30, delay: 0.25, duration: 6.4 },
  { className: "left-[0.5%] top-[46%]  h-8  w-8",  rotate:  12, delay: 1.10, duration: 5.2 },
  { className: "right-[1.5%] top-[52%] h-7  w-7",  rotate: -15, delay: 0.60, duration: 7.1 },
  { className: "left-[3.5%] bottom-[9%] h-9 w-9",  rotate:  35, delay: 0.90, duration: 6.8 },
  { className: "right-[8%]  top-[5%]   h-7  w-7",  rotate: -10, delay: 1.30, duration: 5.9 },
] as const;

/* ─────────────────────────────────────────────────────────────────
   Floating produce — anchored near screen edges to stay visible
   at all breakpoints regardless of the card's max-width.
───────────────────────────────────────────────────────────────── */
const FLOATING_PRODUCE = [
  {
    src: authVegetablesImage,
    alt: "Légumes frais",
    className: "absolute left-0 bottom-[5%] h-44 w-44 sm:h-52 sm:w-52",
    delay: 0.20, duration: 8.0, opacity: 0.20,
  },
  {
    src: tomateCardImage,
    alt: "Tomates",
    className: "absolute right-0 top-[10%] h-32 w-32 sm:h-40 sm:w-40",
    delay: 0.50, duration: 7.0, opacity: 0.20,
  },
  {
    src: pimentHeroImage,
    alt: "Piments",
    className: "absolute right-[1%] bottom-[4%] h-28 w-28 sm:h-34 sm:w-34",
    delay: 0.75, duration: 9.0, opacity: 0.17,
  },
  {
    src: orangeImage,
    alt: "Oranges",
    className: "absolute left-[2%] top-[13%] h-24 w-24 sm:h-30 sm:w-30",
    delay: 0.35, duration: 7.5, opacity: 0.17,
  },
  {
    src: authVeganImage,
    alt: "Produits naturels",
    className: "absolute left-[22%] bottom-0 hidden h-32 w-32 lg:block",
    delay: 0.90, duration: 8.5, opacity: 0.13,
  },
] as const;

/* ─────────────────────────────────────────────────────────────────
   ContainerFormAuth
   ─────────────────────────────────────────────────────────────────
   A full-screen atmosphere wrapper for every auth page.
   Accepts any self-contained auth form as `children` and layers:

     Layer 0 (z-0)  — static background images + gradient overlays
     Layer 1 (z-10) — your page content (children)
     Layer 2 (z-20) — floating produce images  (pointer-events-none)
     Layer 3 (z-30) — floating Leaf icons      (pointer-events-none)

   Layers 2 and 3 sit above the form so that the decorations are
   always visible across the full viewport — including over the
   form card — at very low opacity so they never obscure content.
───────────────────────────────────────────────────────────────── */
type ContainerFormAuthProps = {
  children: ReactNode;
};

export function ContainerFormAuth({ children }: ContainerFormAuthProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ── Layer 0 — Static background ────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Hero texture */}
        <Image
          src={authHeroImage}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.18]"
          sizes="100vw"
        />
        {/* Secondary produce texture */}
        <Image
          src={authProduceImage}
          alt=""
          fill
          className="object-cover opacity-[0.07] mix-blend-multiply"
          sizes="100vw"
        />
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,94,52,0.22),_transparent_30%),radial-gradient(circle_at_80%_12%,_rgba(31,77,63,0.18),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.78),_rgba(240,237,230,0.96))]" />
        {/* Ambient blobs */}
        <div className="absolute -left-32 top-16   h-80 w-80 rounded-full bg-[#dcb98e]/30 blur-3xl" />
        <div className="absolute -right-28 top-36  h-96 w-96 rounded-full bg-[#83a07a]/22 blur-3xl" />
        <div className="absolute -bottom-16 left-[38%] h-64 w-64 rounded-full bg-[#c9963a]/14 blur-3xl" />
      </div>

      {/* ── Layer 1 — Page content ─────────────────────────────── */}
      <div className="relative z-10">{children}</div>

      {/* ── Layer 2 — Floating produce (atmospheric, edges) ─────── */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {FLOATING_PRODUCE.map((item) => (
          <motion.div
            key={item.alt}
            className={`${item.className}`}
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{
              opacity: item.opacity,
              scale: 1,
              y: [0, -14, 5, 0],
            }}
            transition={{
              opacity: { duration: 1.3, delay: item.delay, ease: "easeOut" },
              scale:   { duration: 1.3, delay: item.delay, ease: [0.16, 1, 0.3, 1] },
              y: {
                duration: item.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay + 1.2,
              },
            }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-contain drop-shadow-2xl"
              sizes="240px"
            />
          </motion.div>
        ))}
      </div>

      {/* ── Layer 3 — Floating leaves (margin atmosphere) ───────── */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {FLOATING_LEAVES.map((leaf) => (
          <motion.div
            key={leaf.className}
            className={`absolute text-[#1f4d3f]/40 drop-shadow ${leaf.className}`}
            initial={{ opacity: 0, y: 18, rotate: leaf.rotate }}
            animate={{
              opacity: 1,
              y:       [0, -16, 6, 0],
              x:       [0,   9, -5, 0],
              rotate:  leaf.rotate,
            }}
            transition={{
              opacity: { duration: 0.7, delay: leaf.delay },
              y: {
                duration: leaf.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: leaf.delay,
              },
              x: {
                duration: leaf.duration + 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: leaf.delay,
              },
            }}
          >
            <Leaf className="h-full w-full fill-current" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
