'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import { useThemeStore } from '@/store/theme.store';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Chargement...'
}) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md
            ${isDark ? 'bg-black/60' : 'bg-white/60'}
          `}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`
              p-8 rounded-2xl flex flex-col items-center shadow-2xl
              ${isDark ? 'bg-[#0f1d24]/90 border border-[#23BE31]/20' : 'bg-white/90 border border-gray-100'}
            `}
          >
            <Loader size="lg" variant="spiral" />

            <h3 className={`mt-6 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {message}
            </h3>

            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Veuillez patienter...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;