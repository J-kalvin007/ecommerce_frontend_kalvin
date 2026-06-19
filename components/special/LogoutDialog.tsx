// 'use client';

// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Lottie from 'lottie-react';
// import { LogOut, X } from 'lucide-react';
// import exitAnimation from '@/public/lotti/exit_01.json';

// interface LogoutDialogProps {
//   isOpen: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
//   isLoading?: boolean;
// }

// export default function LogoutDialog({
//   isOpen,
//   onConfirm,
//   onCancel,
//   isLoading = false
// }: LogoutDialogProps) {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     if (isOpen) document.body.style.overflow = 'hidden';
//     else document.body.style.overflow = 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isOpen]);

//   if (!mounted || !isOpen) return null;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 isolate">
//           {/* Backdrop with strong blur and dark overlay */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 bg-primary/80 backdrop-blur-md"
//             onClick={isLoading ? undefined : onCancel}
//           />

//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, y: 30 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 20 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="relative w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-[var(--color-border-light)]"
//           >
//             {/* Dazzling glow effects */}
//             {/* <div className="absolute inset-0 pointer-events-none overflow-hidden">
//               <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[90px] animate-pulse" style={{ background: 'var(--color-error)', opacity: 0.15 }} />
//               <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[90px] animate-pulse" style={{ background: 'var(--color-warning)', opacity: 0.1, animationDelay: '1s' }} />
//             </div> */}

//             <div className="relative p-8 flex flex-col items-center text-center">
//               {/* Close Button */}
//               <button
//                 onClick={onCancel}
//                 disabled={isLoading}
//                 className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-secondary hover:text-primary z-10"
//               >
//                 <X className="w-5 h-5" />
//               </button>

//               {/* Lottie Animation Container */}
//               <div className="relative w-40 h-40 mb-2 flex items-center justify-center">
//                 <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-[var(--color-error)] pointer-events-none" />
//                 <Lottie
//                   animationData={exitAnimation}
//                   loop={true}
//                   className="w-full h-full relative z-10 drop-shadow-2xl"
//                 />
//               </div>

//               {/* Content */}
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <h2 className="text-2xl md:text-3xl font-black mb-3 text-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
//                   Déconnexion
//                 </h2>
//                 <p className="text-secondary text-sm md:text-base leading-relaxed mb-8 max-w-[280px] mx-auto font-medium">
//                   Êtes-vous sûr de vouloir quitter votre session ? Vous devrez vous reconnecter pour accéder à l'application.
//                 </p>
//               </motion.div>

//               {/* Action Buttons */}
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="w-full flex gap-3"
//               >
//                 <button
//                   onClick={onCancel}
//                   disabled={isLoading}
//                   className="flex-1 btn btn-outline rounded-2xl py-3.5 text-sm font-bold border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)]"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   onClick={onConfirm}
//                   disabled={isLoading}
//                   className="flex-1 btn rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-error)]/25 hover:shadow-[var(--color-error)]/40 hover:-translate-y-1 transition-all overflow-hidden relative group"
//                   style={{ background: 'linear-gradient(135deg, var(--color-error), #dc2626)' }}
//                 >
//                   <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
//                   <span className="relative z-10 flex items-center justify-center gap-2">
//                     {isLoading ? (
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     ) : (
//                       <>
//                         <LogOut className="w-4 h-4" />
//                         Confirmer
//                       </>
//                     )}
//                   </span>
//                 </button>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }





























'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { LogOut, X } from 'lucide-react';
import exitAnimation from '@/public/assets/lottis/exit_01.json';
import { useTheme } from '@/hooks/useTheme';

interface LogoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Ambient particle — tiny drifting orb
function Particle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-0 rounded-full"
      style={{
        left: x,
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(35,190,49,0.6) 0%, transparent 70%)',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -120, -200],
        opacity: [0, 0.5, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 3.5,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

export default function LogoutDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: LogoutDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme tokens
  const backdropBg = isDark
    ? 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(35,190,49,0.07) 0%, transparent 60%), rgba(4,10,5,0.82)'
    : 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(35,190,49,0.05) 0%, transparent 60%), rgba(255,255,255,0.72)';
  const cardBg = isDark
    ? 'linear-gradient(160deg, rgba(18,38,21,0.97) 0%, rgba(10,24,13,0.98) 60%, rgba(7,18,9,0.99) 100%)'
    : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const cardShadow = isDark
    ? '0 50px 100px -20px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.07) inset, 0 0 60px -20px rgba(35,190,49,0.12)'
    : '0 20px 50px -10px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)';
  const titleGradient = isDark
    ? 'linear-gradient(145deg, #ffffff 30%, rgba(255,255,255,0.55) 100%)'
    : 'linear-gradient(145deg, #1a2e1c 30%, rgba(40,80,46,0.85) 100%)';
  const descColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.45)';
  const closeBtnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const closeBtnBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const cancelBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const cancelBorder = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
  const cancelColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Spring config constants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 32, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, damping: 28, stiffness: 320, mass: 0.8 },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      y: 16,
      filter: 'blur(6px)',
      transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] },
    },
  };

  const stagger = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.18 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] isolate flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
        >
          {/* ── Backdrop ── */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 cursor-pointer"
            style={{
              background: backdropBg,
              backdropFilter: 'blur(18px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
            }}
            onClick={isLoading ? undefined : onCancel}
          />

          {/* ── Card ── */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[22rem] overflow-hidden"
            style={{
              borderRadius: '2.5rem',
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: cardShadow,
            }}
          >
            {/* — Top edge green shimmer — */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
              style={{
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent 5%, rgba(35,190,49,0.6) 30%, rgba(110,230,120,0.9) 50%, rgba(35,190,49,0.6) 70%, transparent 95%)',
              }}
            />

            {/* — Ambient green orb behind lottie — */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2"
              style={{
                width: 220,
                height: 220,
                background:
                  'radial-gradient(circle, rgba(35,190,49,0.13) 0%, rgba(35,190,49,0.04) 50%, transparent 75%)',
                borderRadius: '50%',
                filter: 'blur(8px)',
              }}
            />

            {/* — Floating particles — */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
              {[
                { delay: 0, x: '25%', size: 3 },
                { delay: 1.2, x: '50%', size: 4 },
                { delay: 2.3, x: '72%', size: 2.5 },
                { delay: 0.6, x: '38%', size: 2 },
                { delay: 1.8, x: '62%', size: 3.5 },
              ].map((p, i) => (
                <Particle key={i} {...p} />
              ))}
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center px-8 pb-8 pt-8 text-center">

              {/* Close button */}
              <motion.button
                onClick={onCancel}
                disabled={isLoading}
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.93 }}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#23BE31]/60"
                style={{
                  background: closeBtnBg,
                  border: `1px solid ${closeBtnBorder}`,
                }}
                aria-label="Fermer"
              >
                <X className="h-[15px] w-[15px] text-white/40" />
              </motion.button>

              {/* Lottie ring */}
              <motion.div
                custom={0}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="relative mb-1 flex h-[140px] w-[140px] items-center justify-center"
              >
                {/* Outer pulsing ring */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(35,190,49,0.18) 0%, transparent 70%)',
                    border: '1px solid rgba(35,190,49,0.12)',
                  }}
                  animate={{ scale: [1, 1.07, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Inner ring */}
                <motion.div
                  aria-hidden
                  className="absolute inset-4 rounded-full"
                  style={{
                    border: '1px solid rgba(35,190,49,0.2)',
                    background: 'rgba(35,190,49,0.04)',
                  }}
                  animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2.8, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Lottie
                  animationData={exitAnimation}
                  loop
                  className="relative z-10 h-[100px] w-[100px]"
                />
              </motion.div>

              {/* Title */}
              <motion.h2
                id="logout-title"
                custom={1}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mb-2.5 mt-4 text-[1.6rem] font-black leading-tight tracking-[-0.03em]"
                style={{
                  background: titleGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Déconnexion
              </motion.h2>

              {/* Description */}
              <motion.p
                id="logout-desc"
                custom={2}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mb-8 max-w-[260px] text-[0.85rem] font-medium leading-relaxed"
                style={{ color: descColor }}
              >
                Êtes-vous sûr de vouloir quitter votre session ? Vous devrez vous reconnecter pour accéder à l'application.
              </motion.p>

              {/* Action buttons */}
              <motion.div
                custom={3}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="flex w-full gap-3"
              >
                {/* Cancel */}
                <motion.button
                  onClick={onCancel}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.07)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-[1rem] py-3.5 text-[0.85rem] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/30"
                  style={{
                    background: cancelBg,
                    border: `1px solid ${cancelBorder}`,
                    color: cancelColor,
                  }}
                >
                  Annuler
                </motion.button>

                {/* Confirm */}
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.03, y: -1 } : {}}
                  whileTap={!isLoading ? { scale: 0.96 } : {}}
                  className="relative flex-1 overflow-hidden rounded-[1rem] py-3.5 text-[0.85rem] font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400/60 disabled:opacity-60"
                  style={{
                    background:
                      'linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%)',
                    boxShadow:
                      '0 8px 24px -8px rgba(220,50,50,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset',
                  }}
                >
                  {/* Shimmer sweep on hover */}
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                      translateX: '-110%',
                    }}
                    whileHover={{ translateX: '110%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <motion.div
                        className="h-[18px] w-[18px] rounded-full"
                        style={{
                          border: '2px solid rgba(255,255,255,0.25)',
                          borderTopColor: '#fff',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Confirmer
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}