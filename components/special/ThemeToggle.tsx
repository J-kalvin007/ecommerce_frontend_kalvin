'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-light)] bg-white/10 text-[#52604e] shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 dark:border-[#4a4032] dark:bg-[#1e1b15]/60 dark:text-[#b8ad8f] dark:hover:bg-[#2d281d]/80"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="dark"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}