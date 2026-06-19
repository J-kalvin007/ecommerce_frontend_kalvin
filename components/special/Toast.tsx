// 'use client';

// import { motion, AnimatePresence } from 'framer-motion';
// import { CheckCircle, XCircle, Info, X } from 'lucide-react';
// import { useTheme } from '@/hooks/useTheme';
// import { useEffect } from 'react';

// interface ToastProps {
//   show?: boolean;
//   type: 'success' | 'error' | 'info';
//   message: string;
//   onClose: () => void;
//   duration?: number;
//   fixed?: boolean;
// }

// const Toast: React.FC<ToastProps> = ({ show = true, type, message, onClose, duration = 3000, fixed = true }) => {
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';

//   useEffect(() => {
//     if (show && duration > 0) {
//       const timer = setTimeout(onClose, duration);
//       return () => clearTimeout(timer);
//     }
//   }, [show, duration, onClose]);

//   const config = {
//     success: {
//       bg: isDark ? 'bg-[#23BE31]/10' : 'bg-green-50',
//       border: isDark ? 'border-[#23BE31]/20' : 'border-green-200',
//       text: isDark ? 'text-[#23BE31]' : 'text-green-800',
//       icon: CheckCircle,
//       glow: 'shadow-[0_0_20px_-5px_rgba(35,190,49,0.2)]'
//     },
//     error: {
//       bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
//       border: isDark ? 'border-red-500/20' : 'border-red-200',
//       text: isDark ? 'text-red-400' : 'text-red-800',
//       icon: XCircle,
//       glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]'
//     },
//     info: {
//       bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
//       border: isDark ? 'border-blue-500/20' : 'border-blue-200',
//       text: isDark ? 'text-blue-400' : 'text-blue-800',
//       icon: Info,
//       glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]'
//     },
//   };

//   const { bg, border, text, icon: Icon, glow } = config[type];

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           initial={{ opacity: 0, y: 50, scale: 0.9 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 20, scale: 0.9 }}
//           transition={{ type: "spring", stiffness: 400, damping: 30 }}
//           className={`
//             flex items-center p-4 rounded-xl border backdrop-blur-xl
//             ${bg} ${border} ${glow}
//             shadow-lg min-w-[300px] max-w-md
//             ${fixed ? 'fixed bottom-6 right-6 z-[100]' : 'relative z-10'}
//           `}
//         >
//           <div className={`p-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-white/50'} mr-3`}>
//             <Icon className={`h-5 w-5 ${text}`} />
//           </div>

//           <div className={`flex-1 text-sm font-semibold ${text}`}>
//             {message}
//           </div>

//           <button
//             onClick={onClose}
//             className={`
//               p-1 rounded-lg transition-colors ml-3
//               ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-gray-600'}
//             `}
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Toast;




























'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useRef } from 'react';

interface ToastProps {
  show?: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
  fixed?: boolean;
}

// Progress bar that shrinks across duration
function ProgressBar({
  duration,
  color,
}: {
  duration: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 h-[2px] rounded-full"
      style={{ background: color, width: '100%', transformOrigin: 'left' }}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: 'linear' }}
    />
  );
}

const Toast: React.FC<ToastProps> = ({
  show = true,
  type,
  message,
  onClose,
  duration = 3000,
  fixed = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Auto-dismiss
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  // ── Design tokens per type ──────────────────────────────────────
  const config = {
    success: {
      // Background & border
      bgLight: 'rgba(240,253,244,0.96)',
      bgDark: 'rgba(10,28,12,0.94)',
      borderLight: 'rgba(34,197,94,0.25)',
      borderDark: 'rgba(35,190,49,0.18)',
      // Icon container
      iconBgLight: 'rgba(34,197,94,0.12)',
      iconBgDark: 'rgba(35,190,49,0.1)',
      iconColorLight: '#16a34a',
      iconColorDark: '#23BE31',
      // Text
      textLight: '#14532d',
      textDark: 'rgba(255,255,255,0.82)',
      // Progress bar
      barColor: '#23BE31',
      // Glow
      glowLight: '0 8px 32px -8px rgba(34,197,94,0.2)',
      glowDark: '0 8px 32px -8px rgba(35,190,49,0.25), 0 0 0 1px rgba(35,190,49,0.08) inset',
      // Top edge line
      edgeColor: 'rgba(35,190,49,0.7)',
      icon: CheckCircle,
    },
    error: {
      bgLight: 'rgba(254,242,242,0.96)',
      bgDark: 'rgba(24,8,8,0.94)',
      borderLight: 'rgba(239,68,68,0.22)',
      borderDark: 'rgba(239,68,68,0.16)',
      iconBgLight: 'rgba(239,68,68,0.1)',
      iconBgDark: 'rgba(239,68,68,0.08)',
      iconColorLight: '#dc2626',
      iconColorDark: '#f87171',
      textLight: '#7f1d1d',
      textDark: 'rgba(255,255,255,0.82)',
      barColor: '#ef4444',
      glowLight: '0 8px 32px -8px rgba(239,68,68,0.2)',
      glowDark: '0 8px 32px -8px rgba(239,68,68,0.25), 0 0 0 1px rgba(239,68,68,0.08) inset',
      edgeColor: 'rgba(239,68,68,0.7)',
      icon: XCircle,
    },
    info: {
      bgLight: 'rgba(239,246,255,0.96)',
      bgDark: 'rgba(8,16,28,0.94)',
      borderLight: 'rgba(59,130,246,0.22)',
      borderDark: 'rgba(59,130,246,0.16)',
      iconBgLight: 'rgba(59,130,246,0.1)',
      iconBgDark: 'rgba(59,130,246,0.08)',
      iconColorLight: '#2563eb',
      iconColorDark: '#60a5fa',
      textLight: '#1e3a5f',
      textDark: 'rgba(255,255,255,0.82)',
      barColor: '#3b82f6',
      glowLight: '0 8px 32px -8px rgba(59,130,246,0.2)',
      glowDark: '0 8px 32px -8px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.08) inset',
      edgeColor: 'rgba(59,130,246,0.7)',
      icon: Info,
    },
  };

  const c = config[type];
  const Icon = c.icon;
  const bg = isDark ? c.bgDark : c.bgLight;
  const border = isDark ? c.borderDark : c.borderLight;
  const iconBg = isDark ? c.iconBgDark : c.iconBgLight;
  const iconColor = isDark ? c.iconColorDark : c.iconColorLight;
  const textColor = isDark ? c.textDark : c.textLight;
  const glow = isDark ? c.glowDark : c.glowLight;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0, y: 24, scale: 0.92, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            y: 12,
            scale: 0.94,
            filter: 'blur(4px)',
            transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] }
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
          className={`relative overflow-hidden ${fixed ? 'fixed bottom-6 right-6 z-[100]' : 'relative z-10'}`}
          style={{
            minWidth: 300,
            maxWidth: 420,
            borderRadius: '1.1rem',
            background: bg,
            border: `1px solid ${border}`,
            boxShadow: `${glow}, 0 2px 4px rgba(0,0,0,0.06)`,
            backdropFilter: 'blur(20px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
          }}
        >
          {/* Top edge accent line */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 10%, ${c.edgeColor} 40%, ${c.edgeColor} 60%, transparent 90%)`,
              opacity: isDark ? 0.8 : 0.5,
            }}
          />

          <div className="flex items-center gap-3 px-4 py-3.5">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.06, type: 'spring', stiffness: 420, damping: 22 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: iconBg }}
            >
              <Icon style={{ width: 18, height: 18, color: iconColor }} strokeWidth={2} />
            </motion.div>

            {/* Message */}
            <p
              className="flex-1 text-[0.84rem] font-semibold leading-snug"
              style={{ color: textColor }}
            >
              {message}
            </p>

            {/* Close button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
              }}
              aria-label="Fermer la notification"
            >
              <X style={{ width: 12, height: 12 }} />
            </motion.button>
          </div>

          {/* Progress bar */}
          {duration > 0 && (
            <ProgressBar duration={duration} color={c.barColor} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;