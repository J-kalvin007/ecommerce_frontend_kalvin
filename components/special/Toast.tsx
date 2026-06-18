'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';

interface ToastProps {
  show?: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
  fixed?: boolean;
}

const Toast: React.FC<ToastProps> = ({ show = true, type, message, onClose, duration = 3000, fixed = true }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const config = {
    success: {
      bg: isDark ? 'bg-[#23BE31]/10' : 'bg-green-50',
      border: isDark ? 'border-[#23BE31]/20' : 'border-green-200',
      text: isDark ? 'text-[#23BE31]' : 'text-green-800',
      icon: CheckCircle,
      glow: 'shadow-[0_0_20px_-5px_rgba(35,190,49,0.2)]'
    },
    error: {
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      border: isDark ? 'border-red-500/20' : 'border-red-200',
      text: isDark ? 'text-red-400' : 'text-red-800',
      icon: XCircle,
      glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]'
    },
    info: {
      bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDark ? 'border-blue-500/20' : 'border-blue-200',
      text: isDark ? 'text-blue-400' : 'text-blue-800',
      icon: Info,
      glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]'
    },
  };

  const { bg, border, text, icon: Icon, glow } = config[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`
            flex items-center p-4 rounded-xl border backdrop-blur-xl
            ${bg} ${border} ${glow}
            shadow-lg min-w-[300px] max-w-md
            ${fixed ? 'fixed bottom-6 right-6 z-[100]' : 'relative z-10'}
          `}
        >
          <div className={`p-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-white/50'} mr-3`}>
            <Icon className={`h-5 w-5 ${text}`} />
          </div>

          <div className={`flex-1 text-sm font-semibold ${text}`}>
            {message}
          </div>

          <button
            onClick={onClose}
            className={`
              p-1 rounded-lg transition-colors ml-3
              ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-gray-600'}
            `}
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;