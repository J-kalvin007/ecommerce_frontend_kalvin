'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = Inbox
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center text-center px-8 py-16 rounded-3xl overflow-hidden glass-card w-full"
    >
      {/* ── Ambient background glow ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-accent)', opacity: 0.1 }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-sage)', opacity: 0.1, animationDelay: '1.5s' }} />
      </div>

      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Icon block ──────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        {/* Outer ring — pulsing */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.05, 0.15] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 -m-5 rounded-full"
          style={{ background: 'var(--color-accent)' }}
        />

        {/* Mid ring */}
        <div className="absolute inset-0 -m-2 rounded-2xl" style={{ background: 'var(--color-accent-light)' }} />

        {/* Icon container */}
        <div
          className="relative w-20 h-20 md:w-24 md:h-24 rounded-[22px] flex items-center justify-center"
          style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <Icon className="w-10 h-10" style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* ── Text ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className="space-y-3 mb-8 relative z-10"
      >
        <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug text-primary">
          {title}
        </h3>
        <p className="max-w-sm mx-auto text-sm md:text-base leading-relaxed font-medium text-secondary">
          {description}
        </p>
      </motion.div>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      {actionText && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="relative z-10"
        >
          <button
            onClick={onAction}
            className="btn btn-primary rounded-full px-8 py-3 shadow-lg hover:-translate-y-1 transition-transform"
          >
            {actionText}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
