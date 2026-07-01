







'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ToastProps {
  show?: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
  fixed?: boolean;
  position?: 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
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
  position = 'top-center',
}) => {


  // Auto-dismiss
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  // -- Design tokens per type --------------------------------------
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
  const bg = c.bgLight;
  const border = c.borderLight;
  const iconBg = c.iconBgLight;
  const iconColor = c.iconColorLight;
  const textColor = c.textLight;
  const glow = c.glowLight;

  const positions = {
    'top-right': 'top-26 right-6',
    'top-center': 'top-26 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-6 right-6',
  };

  const positionClass = positions[position] || positions['bottom-right'];

  const isTop = position.startsWith('top');
  const initialY = isTop ? -24 : 24;
  const exitY = isTop ? -12 : 12;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0, y: initialY, scale: 0.92, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            y: exitY,
            scale: 0.94,
            filter: 'blur(4px)',
            transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] }
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
          className={`overflow-hidden ${fixed ? `fixed ${positionClass} z-[9999]` : 'relative z-10'}`}
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
              opacity: 0.5,
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
                border: `1px solid ${'rgba(0,0,0,0.07)'}`,
                color: 'rgba(0,0,0,0.35)',
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


























// 'use client';

// import { motion, AnimatePresence } from 'framer-motion';
// import { CheckCircle, XCircle, Info, X } from 'lucide-react';
// import { useThemeStore } from '@/store/theme.store';
// import { useEffect, useRef } from 'react';

// interface ToastProps {
//   show?: boolean;
//   type: 'success' | 'error' | 'info';
//   message: string;
//   onClose: () => void;
//   duration?: number;
//   fixed?: boolean;
// }

// // Progress bar that shrinks across duration
// function ProgressBar({
//   duration,
//   color,
// }: {
//   duration: number;
//   color: string;
// }) {
//   return (
//     <motion.div
//       className="absolute bottom-0 left-0 h-[2px] rounded-full"
//       style={{ background: color, width: '100%', transformOrigin: 'left' }}
//       initial={{ scaleX: 1 }}
//       animate={{ scaleX: 0 }}
//       transition={{ duration: duration / 1000, ease: 'linear' }}
//     />
//   );
// }

// const Toast: React.FC<ToastProps> = ({
//   show = true,
//   type,
//   message,
//   onClose,
//   duration = 3000,
//   fixed = true,
// }) => {
//   const { resolvedTheme: theme } = useThemeStore();
//   const isDark = theme === 'dark';

//   // Auto-dismiss
//   useEffect(() => {
//     if (show && duration > 0) {
//       const timer = setTimeout(onClose, duration);
//       return () => clearTimeout(timer);
//     }
//   }, [show, duration, onClose]);

//   // -- Design tokens per type --------------------------------------
//   const config = {
//     success: {
//       // Background & border
//       bgLight: 'rgba(240,253,244,0.96)',
//       bgDark: 'rgba(10,28,12,0.94)',
//       borderLight: 'rgba(34,197,94,0.25)',
//       borderDark: 'rgba(35,190,49,0.18)',
//       // Icon container
//       iconBgLight: 'rgba(34,197,94,0.12)',
//       iconBgDark: 'rgba(35,190,49,0.1)',
//       iconColorLight: '#16a34a',
//       iconColorDark: '#23BE31',
//       // Text
//       textLight: '#14532d',
//       textDark: 'rgba(255,255,255,0.82)',
//       // Progress bar
//       barColor: '#23BE31',
//       // Glow
//       glowLight: '0 8px 32px -8px rgba(34,197,94,0.2)',
//       glowDark: '0 8px 32px -8px rgba(35,190,49,0.25), 0 0 0 1px rgba(35,190,49,0.08) inset',
//       // Top edge line
//       edgeColor: 'rgba(35,190,49,0.7)',
//       icon: CheckCircle,
//     },
//     error: {
//       bgLight: 'rgba(254,242,242,0.96)',
//       bgDark: 'rgba(24,8,8,0.94)',
//       borderLight: 'rgba(239,68,68,0.22)',
//       borderDark: 'rgba(239,68,68,0.16)',
//       iconBgLight: 'rgba(239,68,68,0.1)',
//       iconBgDark: 'rgba(239,68,68,0.08)',
//       iconColorLight: '#dc2626',
//       iconColorDark: '#f87171',
//       textLight: '#7f1d1d',
//       textDark: 'rgba(255,255,255,0.82)',
//       barColor: '#ef4444',
//       glowLight: '0 8px 32px -8px rgba(239,68,68,0.2)',
//       glowDark: '0 8px 32px -8px rgba(239,68,68,0.25), 0 0 0 1px rgba(239,68,68,0.08) inset',
//       edgeColor: 'rgba(239,68,68,0.7)',
//       icon: XCircle,
//     },
//     info: {
//       bgLight: 'rgba(239,246,255,0.96)',
//       bgDark: 'rgba(8,16,28,0.94)',
//       borderLight: 'rgba(59,130,246,0.22)',
//       borderDark: 'rgba(59,130,246,0.16)',
//       iconBgLight: 'rgba(59,130,246,0.1)',
//       iconBgDark: 'rgba(59,130,246,0.08)',
//       iconColorLight: '#2563eb',
//       iconColorDark: '#60a5fa',
//       textLight: '#1e3a5f',
//       textDark: 'rgba(255,255,255,0.82)',
//       barColor: '#3b82f6',
//       glowLight: '0 8px 32px -8px rgba(59,130,246,0.2)',
//       glowDark: '0 8px 32px -8px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.08) inset',
//       edgeColor: 'rgba(59,130,246,0.7)',
//       icon: Info,
//     },
//   };

//   const c = config[type];
//   const Icon = c.icon;
//   const bg = isDark ? c.bgDark : c.bgLight;
//   const border = isDark ? c.borderDark : c.borderLight;
//   const iconBg = isDark ? c.iconBgDark : c.iconBgLight;
//   const iconColor = isDark ? c.iconColorDark : c.iconColorLight;
//   const textColor = isDark ? c.textDark : c.textLight;
//   const glow = isDark ? c.glowDark : c.glowLight;

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           role="status"
//           aria-live="polite"
//           aria-atomic="true"
//           initial={{ opacity: 0, y: 24, scale: 0.92, filter: 'blur(6px)' }}
//           animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
//           exit={{
//             opacity: 0,
//             y: 12,
//             scale: 0.94,
//             filter: 'blur(4px)',
//             transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] }
//           }}
//           transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
//           className={`overflow-hidden ${fixed ? 'fixed bottom-6 right-6 z-[100]' : 'relative z-10'}`}
//           style={{
//             minWidth: 300,
//             maxWidth: 420,
//             borderRadius: '1.1rem',
//             background: bg,
//             border: `1px solid ${border}`,
//             boxShadow: `${glow}, 0 2px 4px rgba(0,0,0,0.06)`,
//             backdropFilter: 'blur(20px) saturate(1.6)',
//             WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
//           }}
//         >
//           {/* Top edge accent line */}
//           <div
//             aria-hidden
//             className="absolute inset-x-0 top-0 h-px"
//             style={{
//               background: `linear-gradient(90deg, transparent 10%, ${c.edgeColor} 40%, ${c.edgeColor} 60%, transparent 90%)`,
//               opacity: isDark ? 0.8 : 0.5,
//             }}
//           />

//           <div className="flex items-center gap-3 px-4 py-3.5">
//             {/* Icon */}
//             <motion.div
//               initial={{ scale: 0.5, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ delay: 0.06, type: 'spring', stiffness: 420, damping: 22 }}
//               className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
//               style={{ background: iconBg }}
//             >
//               <Icon style={{ width: 18, height: 18, color: iconColor }} strokeWidth={2} />
//             </motion.div>

//             {/* Message */}
//             <p
//               className="flex-1 text-[0.84rem] font-semibold leading-snug"
//               style={{ color: textColor }}
//             >
//               {message}
//             </p>

//             {/* Close button */}
//             <motion.button
//               onClick={onClose}
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.88 }}
//               className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
//               style={{
//                 background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
//                 border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
//                 color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
//               }}
//               aria-label="Fermer la notification"
//             >
//               <X style={{ width: 12, height: 12 }} />
//             </motion.button>
//           </div>

//           {/* Progress bar */}
//           {duration > 0 && (
//             <ProgressBar duration={duration} color={c.barColor} />
//           )}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Toast;












