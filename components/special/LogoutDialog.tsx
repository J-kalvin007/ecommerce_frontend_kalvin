'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { LogOut, X } from 'lucide-react';
import exitAnimation from '@/public/lotti/exit_01.json';

interface LogoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LogoutDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}: LogoutDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 isolate">
          {/* Backdrop with strong blur and dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/80 backdrop-blur-md"
            onClick={isLoading ? undefined : onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-[var(--color-border-light)]"
          >
            {/* Dazzling glow effects */}
            {/* <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[90px] animate-pulse" style={{ background: 'var(--color-error)', opacity: 0.15 }} />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[90px] animate-pulse" style={{ background: 'var(--color-warning)', opacity: 0.1, animationDelay: '1s' }} />
            </div> */}

            <div className="relative p-8 flex flex-col items-center text-center">
              {/* Close Button */}
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-secondary hover:text-primary z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lottie Animation Container */}
              <div className="relative w-40 h-40 mb-2 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-[var(--color-error)] pointer-events-none" />
                <Lottie
                  animationData={exitAnimation}
                  loop={true}
                  className="w-full h-full relative z-10 drop-shadow-2xl"
                />
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-black mb-3 text-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
                  Déconnexion
                </h2>
                <p className="text-secondary text-sm md:text-base leading-relaxed mb-8 max-w-[280px] mx-auto font-medium">
                  Êtes-vous sûr de vouloir quitter votre session ? Vous devrez vous reconnecter pour accéder à l'application.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex gap-3"
              >
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 btn btn-outline rounded-2xl py-3.5 text-sm font-bold border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)]"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 btn rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-error)]/25 hover:shadow-[var(--color-error)]/40 hover:-translate-y-1 transition-all overflow-hidden relative group"
                  style={{ background: 'linear-gradient(135deg, var(--color-error), #dc2626)' }}
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Confirmer
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
