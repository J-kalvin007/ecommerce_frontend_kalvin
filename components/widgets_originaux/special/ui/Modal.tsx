'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`
              fixed inset-0 backdrop-blur-md
              ${isDark ? 'bg-black/80' : 'bg-gray-900/60'}
            `}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              relative w-full ${sizeClasses[size]}
              ${isDark ? 'bg-[#071217]' : 'bg-white'}
              rounded-2xl shadow-2xl overflow-hidden
              border ${isDark ? 'border-[#23BE31]/20' : 'border-gray-200'}
              flex flex-col max-h-[90vh]
            `}
          >
            {/* Header */}
            <div className={`
              px-6 py-5 flex items-center justify-between shrink-0
              border-b ${isDark ? 'border-[#23BE31]/10 bg-[#23BE31]/5' : 'border-gray-100 bg-gray-50/50'}
            `}>
              <h3 className={`
                text-2xl font-bold text-uppercase tracking-[0.1em]
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h3>

              <button
                onClick={onClose}
                className={`
                  p-4 rounded-xl transition-colors
                  ${isDark
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Decorative Glow */}
            <div className={`
              absolute top-0 left-0 right-0 h-1 bg-gradient-to-r 
              from-[#23BE31] via-[#1fa92c] to-[#23BE31] opacity-50
            `} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;