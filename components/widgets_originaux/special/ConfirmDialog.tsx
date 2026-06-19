'use client';

import { useTheme } from '@/hooks/useTheme';
import { AlertTriangle, Info, CheckCircle, X, HelpCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/widgets_originaux/special/ui/LoadingSpinner';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info" | "success" | "question";
  isLoading?: boolean;
  children?: React.ReactNode;
}

const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning",
  isLoading = false,
  children
}: ConfirmDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      color: 'amber',
      gradient: isDark ? 'from-amber-500 to-orange-600' : 'from-amber-400 to-orange-500',
      iconBg: isDark ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-600',
      button: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/25',
      border: isDark ? 'border-amber-500/30' : 'border-amber-200'
    },
    danger: {
      icon: Trash2,
      color: 'red',
      gradient: isDark ? 'from-red-500 to-rose-600' : 'from-red-500 to-rose-600',
      iconBg: isDark ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-600',
      button: 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/25',
      border: isDark ? 'border-red-500/30' : 'border-red-200'
    },
    info: {
      icon: Info,
      color: 'blue',
      gradient: isDark ? 'from-blue-500 to-indigo-600' : 'from-blue-400 to-indigo-500',
      iconBg: isDark ? 'bg-blue-500/20 text-blue-500' : 'bg-blue-100 text-blue-600',
      button: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/25',
      border: isDark ? 'border-blue-500/30' : 'border-blue-200'
    },
    success: {
      icon: CheckCircle,
      color: 'green',
      gradient: isDark ? 'from-[#23BE31] to-[#1fa92c]' : 'from-[#23BE31] to-[#1fa92c]',
      iconBg: isDark ? 'bg-[#23BE31]/20 text-[#23BE31]' : 'bg-[#23BE31]/10 text-[#1a8f26]',
      button: 'bg-gradient-to-r from-[#23BE31] to-[#1fa92c] hover:shadow-[#23BE31]/25',
      border: isDark ? 'border-[#23BE31]/30' : 'border-green-200'
    },
    question: {
      icon: HelpCircle,
      color: 'purple',
      gradient: isDark ? 'from-purple-500 to-violet-600' : 'from-purple-400 to-violet-500',
      iconBg: isDark ? 'bg-purple-500/20 text-purple-500' : 'bg-purple-100 text-purple-600',
      button: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:shadow-purple-500/25',
      border: isDark ? 'border-purple-500/30' : 'border-purple-200'
    }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop avec flou progressif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-gray-900/60'} backdrop-blur-md`}
            onClick={onCancel}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className={`
              relative w-full max-w-lg overflow-hidden
              ${isDark ? 'bg-[#0f1d24]/90' : 'bg-white/95'}
              backdrop-blur-xl
              rounded-2xl shadow-2xl
              border ${config.border}
            `}
          >
            {/* Effet de lueur d'ambiance en haut */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

            {/* Halo décoratif derrière l'icône */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${config.gradient} opacity-[0.07] rounded-full blur-3xl pointer-events-none`} />

            {/* Header Content */}
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">

              {/* Icone animée */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg relative ${config.iconBg}`}
              >
                <div className={`absolute inset-0 rounded-full bg-current opacity-20 animate-ping`} />
                <Icon className="w-8 h-8 relative z-10" />
              </motion.div>

              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>

              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-xs sm:max-w-sm mx-auto`}>
                {message}
              </p>
              {children && (
                <div className="mt-4 w-full text-left">
                  {children}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className={`
              p-6 sm:p-8 pt-0 
              flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 
              justify-center items-center
            `}>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className={`
                  w-full sm:w-auto min-w-[140px] py-3 px-6 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${isDark
                    ? 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/10'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`
                  w-full sm:w-auto min-w-[140px] py-3 px-6 rounded-xl font-bold text-sm text-white shadow-lg
                  ${config.button}
                  transition-all duration-200
                  hover:scale-[1.02] hover:shadow-xl
                  disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                  relative overflow-hidden
                `}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="border-t-white border-r-white" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span>{confirmText}</span>
                    <Icon className="w-4 h-4 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;