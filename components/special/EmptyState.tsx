// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import { LucideIcon, Inbox } from 'lucide-react';

// interface EmptyStateProps {
//   title: string;
//   description: string;
//   actionText?: string;
//   onAction?: () => void;
//   icon?: LucideIcon;
// }

// const EmptyState: React.FC<EmptyStateProps> = ({
//   title,
//   description,
//   actionText,
//   onAction,
//   icon: Icon = Inbox
// }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24, scale: 0.98 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//       className="relative flex flex-col items-center justify-center text-center px-8 py-16 rounded-3xl overflow-hidden glass-card w-full"
//     >
//       {/* ── Ambient background glow ─────────────────────────────── */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-accent)', opacity: 0.1 }} />
//         <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-sage)', opacity: 0.1, animationDelay: '1.5s' }} />
//       </div>

//       {/* Subtle grid texture */}
//       <div
//         aria-hidden
//         className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
//         style={{
//           backgroundImage: 'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)',
//           backgroundSize: '24px 24px'
//         }}
//       />

//       {/* ── Icon block ──────────────────────────────────────────── */}
//       <motion.div
//         initial={{ scale: 0.75, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//         className="relative mb-8"
//       >
//         {/* Outer ring — pulsing */}
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.05, 0.15] }}
//           transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
//           className="absolute inset-0 -m-5 rounded-full"
//           style={{ background: 'var(--color-accent)' }}
//         />

//         {/* Mid ring */}
//         <div className="absolute inset-0 -m-2 rounded-2xl" style={{ background: 'var(--color-accent-light)' }} />

//         {/* Icon container */}
//         <div
//           className="relative w-20 h-20 md:w-24 md:h-24 rounded-[22px] flex items-center justify-center"
//           style={{
//             background: 'var(--color-bg-primary)',
//             border: '1px solid var(--color-border)',
//             boxShadow: 'var(--shadow-lg)'
//           }}
//         >
//           <Icon className="w-10 h-10" style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
//         </div>
//       </motion.div>

//       {/* ── Text ────────────────────────────────────────────────── */}
//       <motion.div
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
//         className="space-y-3 mb-8 relative z-10"
//       >
//         <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-snug text-primary">
//           {title}
//         </h3>
//         <p className="max-w-sm mx-auto text-sm md:text-base leading-relaxed font-medium text-secondary">
//           {description}
//         </p>
//       </motion.div>

//       {/* ── CTA ─────────────────────────────────────────────────── */}
//       {actionText && onAction && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
//           className="relative z-10"
//         >
//           <button
//             onClick={onAction}
//             className="btn btn-primary rounded-full px-8 py-3 shadow-lg hover:-translate-y-1 transition-transform"
//           >
//             {actionText}
//           </button>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// export default EmptyState;




























'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Inbox } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

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
  icon: Icon = Inbox,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

        .gc-es-root { font-family: 'Inter', system-ui, sans-serif; }

        .gc-es-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 48px;
          padding: 0 28px;
          background: linear-gradient(135deg, #4a7850 0%, #3a5e40 100%);
          color: #f0f5f1;
          border: 1px solid rgba(163,177,138,0.28);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(74,120,80,0.35), inset 0 1px 0 rgba(255,255,255,0.13);
          transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .gc-es-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(163,177,138,0.18) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .gc-es-btn:hover::before { opacity: 1; }
        .gc-es-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 44px rgba(74,120,80,0.5), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .gc-es-btn:active { transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <motion.div
        className="gc-es-root"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '64px 40px',
          borderRadius: 26,
          overflow: 'hidden',
          width: '100%',
          background: isDark
            ? 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(8,15,11,0.6) 100%)'
            : 'linear-gradient(160deg, #ffffff 0%, #f4f7f5 100%)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.07)'
            : '1px solid rgba(0,0,0,0.04)',
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 20px 60px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* ── Ambient orbs ────────────────────────────────────────────────── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '-20%', left: '-5%',
              width: '55%', height: '55%',
              borderRadius: '50%',
              background: 'rgba(74,120,80,1)',
              filter: 'blur(70px)',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{
              position: 'absolute', bottom: '-15%', right: '-5%',
              width: '45%', height: '45%',
              borderRadius: '50%',
              background: 'rgba(163,177,138,1)',
              filter: 'blur(70px)',
            }}
          />
        </div>

        {/* Grain texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: isDark ? 0.025 : 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }} />

        {/* ── Icon block ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', marginBottom: 36 }}
        >
          {/* Double pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.28, 1], opacity: [0.18, 0, 0.18] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -18, borderRadius: '50%',
              border: '1px solid rgba(74,120,80,0.35)',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{
              position: 'absolute', inset: -32, borderRadius: '50%',
              border: '1px solid rgba(74,120,80,0.18)',
            }}
          />

          {/* Icon container */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 88, height: 88,
              borderRadius: 26,
              background: isDark ? 'rgba(74,120,80,0.1)' : '#ffffff',
              border: isDark ? '1.5px solid rgba(74,120,80,0.22)' : '1px solid rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isDark
                ? '0 0 0 12px rgba(74,120,80,0.04), 0 12px 40px rgba(0,0,0,0.3)'
                : '0 0 0 12px rgba(74,120,80,0.04), 0 12px 30px rgba(0,0,0,0.06)',
              position: 'relative',
            }}
          >
            {/* Inner glow */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 26,
              background: isDark
                ? 'radial-gradient(ellipse at 35% 35%, rgba(106,170,114,0.15) 0%, transparent 65%)'
                : 'radial-gradient(ellipse at 35% 35%, rgba(106,170,114,0.08) 0%, transparent 65%)',
            }} />
            <Icon size={36} style={{ color: '#6aaa72' }} strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* ── Text ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55, ease: 'easeOut' }}
          style={{ marginBottom: actionText ? 36 : 0, position: 'relative', zIndex: 2 }}
        >
          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 700,
            color: isDark ? '#e8ede9' : '#111812',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: 12,
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: 14,
            color: isDark ? 'rgba(232,237,233,0.48)' : 'rgba(17,24,18,0.55)',
            lineHeight: 1.75,
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
            letterSpacing: '-0.01em',
          }}>
            {description}
          </p>
        </motion.div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        {actionText && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <button className="gc-es-btn" onClick={onAction}>
              {actionText}
            </button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default EmptyState;