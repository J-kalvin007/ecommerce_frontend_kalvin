/**
 * LogoutDialog.tsx
 * -----------------------------------------------------------------------------
 * Modale de déconnexion ultra-premium.
 * Design : flat, sombre, luxueux — palette identique au thème global de l'app :
 *   • Fond carte   → dégradé vert forêt profond (#16332b → #1f4d3f)
 *   • Accent chaud → champagne doux (#d8c4ab) + or (#C9963A)
 *   • Fond page    → crème (#F0EDE6) comme la page login
 *
 * Props :
 *   isOpen    — contrôle l'affichage
 *   onConfirm — callback async de confirmation (Promise<void>)
 *   onCancel  — callback d'annulation
 *
 * Notifications :
 *   • Succès → Toast vert  « Déconnexion réussie »  (auto-fermeture 3 s)
 *   • Erreur → Toast rouge « Échec de la déconnexion » (fermeture manuelle)
 * -----------------------------------------------------------------------------
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import exitAnimation from '@/public/assets/lottis/logout.json';
import { LogOut, Shield, X } from 'lucide-react';
import Toast from '@/components/special/Toast';

/* --------------------------------------------------------------------------
   Tokens de couleur — identiques au panneau gauche de la page login
-------------------------------------------------------------------------- */

/** Vert forêt — même gradient que le panneau login gauche */
const FOREST_DARK = '#16332b';
const FOREST = '#1f4d3f';
const FOREST_MID = '#27433a';

/** Champagne — couleur accent chaude de la marque */
const CHAMPAGNE = '#d8c4ab';

/** Or — accent fort pour le CTA principal */
const GOLD = '#C9963A';
const GOLD_LIGHT = '#e0b46a';

/* --------------------------------------------------------------------------
   Orbe ambiante flottante
-------------------------------------------------------------------------- */

function FloatingOrb({
  delay, x, color, size,
}: { delay: number; x: string; color: string; size: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-0 rounded-full"
      style={{
        left: x,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(1px)',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [0, -160, -260], opacity: [0, 0.7, 0], scale: [0.4, 1.1, 0.2] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

/* --------------------------------------------------------------------------
   Props (interface publique — inchangée)
-------------------------------------------------------------------------- */

interface LogoutDialogProps {
  isOpen: boolean;
  /** Callback async — doit retourner une Promise (resolve = succès, reject = erreur) */
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/* --------------------------------------------------------------------------
   Variants Framer Motion
-------------------------------------------------------------------------- */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: { opacity: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.86, y: 36, filter: 'blur(16px)' },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 26, stiffness: 300, mass: 0.9 },
  },
  exit: {
    opacity: 0, scale: 0.93, y: 20, filter: 'blur(8px)',
    transition: { duration: 0.22, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

/* --------------------------------------------------------------------------
   Composant principal
-------------------------------------------------------------------------- */

export default function LogoutDialog({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutDialogProps) {

  /* — État de chargement interne — */
  const [isLoading, setIsLoading] = useState(false);

  /* — État du Toast de feedback — */
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const closeToast = useCallback(() =>
    setToast(prev => ({ ...prev, show: false })),
  []);

  /* — Handler de confirmation avec gestion succès / erreur — */
  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setToast({
        show: true,
        type: 'success',
        message: 'Déconnexion réussie. À bientôt !',
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la déconnexion.';
      setToast({
        show: true,
        type: 'error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm]);

  /* — Bloquer le scroll de la page quand la modale est ouverte — */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
        <div
          className="fixed inset-0 z-[200] isolate flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
        >

          {/* -- Backdrop — halo vert forêt sur noir profond, comme le bg login -- */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 cursor-pointer"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 38%, rgba(15,45,32,0.035) 0%, transparent 65%), rgba(5, 14, 10, 0.088)',
              backdropFilter: 'blur(22px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(22px) saturate(1.4)',
            }}
            onClick={isLoading ? undefined : onCancel}
          />

          {/* -- Carte principale — même teinte que le panneau gauche login -- */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[22rem] overflow-hidden"
            style={{
              borderRadius: '2rem',
              background: "#fff",
              border: `1px solid rgba(216, 196, 171, 0.4)`,
              boxShadow:
                `0 0 0 1px rgba(255,255,255,0.5) inset,
                 0 32px 70px -20px rgba(31,77,63,0.15),
                 0 0 50px -18px rgba(201,150,58,0.1)`,
            }}
          >

            {/* --- Liseré supérieur vert → champagne → or --- */}
            {/* <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10"
              style={{
                height: '1.5px',
                background:
                  `linear-gradient(90deg, transparent 2%, ${FOREST} 20%, ${CHAMPAGNE} 50%, ${GOLD} 75%, transparent 98%)`,
              }}
            /> */}

            {/* --- Lueur ambiante champagne derrière l'animation --- */}
            {/* <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2"
              style={{
                width: 240,
                height: 240,
                background:
                  `radial-gradient(circle, rgba(216,196,171,0.12) 0%, rgba(31,77,63,0.08) 50%, transparent 72%)`,
                borderRadius: '50%',
                filter: 'blur(10px)',
              }}
            /> */}

            {/* --- Particules flottantes vert & champagne --- */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
              {[
                { delay: 0.0, x: '20%', color: 'rgba(31,77,63,0.9)', size: 4 },
                { delay: 1.1, x: '45%', color: 'rgba(216,196,171,0.8)', size: 3.5 },
                { delay: 2.2, x: '68%', color: 'rgba(39,67,58,0.85)', size: 3 },
                { delay: 0.6, x: '35%', color: 'rgba(201,150,58,0.7)', size: 2.5 },
                { delay: 1.7, x: '76%', color: 'rgba(216,196,171,0.75)', size: 4.5 },
              ].map((p, i) => (
                <FloatingOrb key={i} {...p} />
              ))}
            </div>

            {/* -- Contenu -- */}
            <div className="relative z-10 flex flex-col items-center px-8 pb-8 pt-8 text-center">

              {/* Bouton fermer */}
              <motion.button
                onClick={onCancel}
                disabled={isLoading}
                whileHover={{ scale: 1.1, backgroundColor: `rgba(31,77,63,0.1)` }}
                whileTap={{ scale: 0.92 }}
                className="absolute right-5 top-5 cursor-pointer flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/20"
                style={{
                  background: 'rgba(31,77,63,0.04)',
                  border: '1px solid rgba(31,77,63,0.08)',
                }}
                aria-label="Fermer"
              >
                <X className="h-[14px] w-[14px] text-[#1f4d3f]" />
              </motion.button>

              {/* Animation Lottie dans un anneau champagne / vert */}
              <motion.div
                custom={0}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="relative mb-2 flex h-[136px] w-[136px] items-center justify-center"
              >
                {/* Anneau pulsant extérieur — champagne */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(216,196,171,0.15) 0%, transparent 68%)`,
                    border: '1px solid rgba(216,196,171,0.18)',
                  }}
                  animate={{ scale: [1, 1.09, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Anneau intérieur — vert tendre */}
                <motion.div
                  aria-hidden
                  className="absolute inset-5 rounded-full"
                  style={{
                    border: '1px solid rgba(31,77,63,0.45)',
                    background: 'rgba(31,77,63,0.12)',
                  }}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Lottie
                  animationData={exitAnimation}
                  loop
                  className="relative z-10 h-[96px] w-[96px]"
                />
              </motion.div>

              {/* Badge sécurité — champagne */}
              <motion.div
                custom={0.5}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mb-4 flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{
                  background: 'rgba(216,196,171,0.12)',
                  border: `1px solid rgba(216,196,171,0.22)`,
                }}
              >
                <Shield className="h-3 w-3" style={{ color: CHAMPAGNE }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: CHAMPAGNE }}
                >
                  Session sécurisée
                </span>
              </motion.div>

              {/* Titre — vert foncé vers or */}
              <motion.h2
                id="logout-title"
                custom={1}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mb-3 text-[1.65rem] font-black leading-none tracking-[-0.03em]"
                style={{
                  background: `linear-gradient(135deg, ${FOREST_DARK} 20%, ${FOREST} 65%, ${GOLD} 100%)`,
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
                className="mb-8 max-w-[260px] text-[0.83rem] font-medium leading-relaxed"
                style={{ color: 'rgba(31,77,63,0.65)' }}
              >
                Vous êtes sur le point de mettre fin à votre session. Vous devrez vous reconnecter pour accéder à votre espace.
              </motion.p>

              {/* Boutons d'action */}
              <motion.div
                custom={3}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="flex w-full gap-3"
              >
                {/* Annuler — verre clair subtil */}
                <motion.button
                  onClick={onCancel}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(31,77,63,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 cursor-pointer rounded-full py-3 text-[0.84rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3f]/20"
                  style={{
                    background: 'rgba(31,77,63,0.04)',
                    border: '1px solid rgba(31,77,63,0.1)',
                    color: FOREST,
                  }}
                >
                  Annuler
                </motion.button>

                {/* Confirmer — or / champagne — accent principal de la marque */}
                <motion.button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.03, y: -1 } : {}}
                  whileTap={!isLoading ? { scale: 0.96 } : {}}
                  className="relative flex-1 cursor-pointer overflow-hidden rounded-full py-3 text-[0.84rem] font-bold focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
                    color: FOREST_DARK,
                    boxShadow: `0 8px 28px -8px rgba(201,150,58,0.55), 0 0 0 1px rgba(255,255,255,0.15) inset`,
                  }}
                >
                  {/* Reflet diagonal au survol */}
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: 'linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.25) 50%, transparent 72%)',
                      translateX: '-110%',
                    }}
                    whileHover={{ translateX: '110%' }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                    {isLoading ? (
                      <motion.div
                        className="h-[17px] w-[17px] rounded-full"
                        style={{ border: `2px solid rgba(22,51,43,0.3)`, borderTopColor: FOREST_DARK }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
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

    {/* -- Toast de feedback déconnexion -- */}
    <Toast
      show={toast.show}
      type={toast.type}
      message={toast.message}
      onClose={closeToast}
      duration={toast.type === 'success' ? 3000 : 0}
      position="top-center"
    />
    </>
  );
}