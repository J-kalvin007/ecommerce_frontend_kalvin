

// components/admin/ui/SectionDivider.tsx
"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionDividerProps {
  label?: string;
  className?: string;
}

export function SectionDivider({ label, className }: SectionDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("relative my-6", className)}
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/60" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-surface-elevated px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
      )}
    </motion.div>
  );
}