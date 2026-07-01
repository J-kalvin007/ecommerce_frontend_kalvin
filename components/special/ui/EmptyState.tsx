'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { LucideIcon, Inbox } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

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
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex flex-col items-center justify-center text-center
        px-10 py-16 rounded-3xl overflow-hidden isolate
        ${isDark
          ? 'bg-[#0a1628]/80 border border-white/[0.06]'
          : 'bg-white border border-gray-100/80 shadow-[0_4px_40px_-8px_rgba(0,0,0,0.06)]'
        }
      `}
    >

      {/* -- Ambient background glow ------------------------------- */}
      <div
        aria-hidden
        className={`
          pointer-events-none absolute inset-0 -z-10
          ${isDark
            ? 'bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(35,190,49,0.07),transparent)]'
            : 'bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(35,190,49,0.06),transparent)]'
          }
        `}
      />

      {/* Subtle grid texture */}
      <div
        aria-hidden
        className={`
          pointer-events-none absolute inset-0 -z-10 opacity-[0.03]
          [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
          [background-size:28px_28px]
        `}
      />

      {/* -- Icon block -------------------------------------------- */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        {/* Outer ring — pulsing */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.04, 0.15] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 -m-5 rounded-full bg-[#23BE31]"
        />

        {/* Mid ring */}
        <div
          className={`
            absolute inset-0 -m-2 rounded-2xl
            ${isDark ? 'bg-[#23BE31]/8' : 'bg-[#23BE31]/5'}
          `}
        />

        {/* Icon container */}
        <div
          className={`
            relative w-24 h-24 rounded-[22px] flex items-center justify-center
            shadow-[0_8px_32px_-4px_rgba(35,190,49,0.25)]
            ${isDark
              ? 'bg-gradient-to-br from-[#0f2a18] to-[#0f1d24] border border-[#23BE31]/20'
              : 'bg-gradient-to-br from-white to-green-50/60 border border-[#23BE31]/15'
            }
          `}
        >
          <Icon className="w-11 h-11 text-[#23BE31]" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* -- Text -------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className="space-y-3 mb-8"
      >
        <h3 className={`
          text-[1.35rem] font-black tracking-tight leading-snug
          ${isDark ? 'text-white' : 'text-gray-900'}
        `}>
          {title}
        </h3>
        <p className={`
          max-w-sm mx-auto text-sm leading-relaxed font-medium
          ${isDark ? 'text-gray-400' : 'text-gray-500'}
        `}>
          {description}
        </p>
      </motion.div>

      {/* -- CTA --------------------------------------------------- */}
      {actionText && onAction && (

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45, ease: 'easeOut' }}
          className='rounded-full'
        >
          <Button
            onClick={onAction}
            variant="default"
            size="md"
            className="shadow-xl shadow-[#23BE31]/20 rounded-full px-8"
          >
            {actionText}
          </Button>

        </motion.div>

      )}

    </motion.div>

  );

};

export default EmptyState;
