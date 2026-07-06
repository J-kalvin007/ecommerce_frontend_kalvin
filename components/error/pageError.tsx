"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import Lottie from 'lottie-react';
import { Home, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';

import errorAnimation from '@/public/assets/lottis/error9.json';
import { useAuthStore } from '@/store/authStore';

// ─── Animation variants ───────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
};

const orbVariants: Variants = {
  animate: (i: number) => ({
    scale: [1, 1.15, 0.93, 1.08, 1],
    x: [0, 22 * (i % 2 === 0 ? 1 : -1), -10, 16, 0],
    y: [0, -18, 25, -8, 0],
    transition: { duration: 16 + i * 5, repeat: Infinity, ease: 'easeInOut' },
  }),
};

// ─── Countdown ring ───────────────────────────────────────────────────────────
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const dashoffset = circumference * (1 - progress);

  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="url(#err-ring-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <defs>
          <linearGradient id="err-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef8219" />
            <stop offset="100%" stopColor="#f09a44" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.04em' }}>{seconds}</span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.04em', marginTop: 1 }}>SEC</span>
      </div>
    </div>
  );
}

// ─── Floating particle ────────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 4,
    duration: 8 + Math.random() * 6,
    size: 3 + Math.random() * 4,
    drift: (Math.random() - 0.5) * 60,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((l) => (
        <motion.div
          key={l.id}
          initial={{ opacity: 0, y: '110%', x: `${l.x}%`, rotate: 0 }}
          animate={{
            opacity: [0, 0.4, 0.4, 0],
            y: [' 110%', '60%', '30%', '-10%'],
            x: [`${l.x}%`, `${l.x + l.drift * 0.33}%`, `${l.x + l.drift * 0.66}%`, `${l.x + l.drift}%`],
            rotate: [0, 90, 180, 270],
          }}
          transition={{ duration: l.duration, delay: l.delay, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', bottom: 0,
            width: l.size, height: l.size,
            borderRadius: '50%',
            background: 'rgba(239, 130, 25, 0.4)',
            boxShadow: '0 0 10px rgba(239, 130, 25, 0.2)'
          }}
        />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
interface PageErreurProps {
  statusCode?: number | string;
  title?: string;
  message?: string;
  reset?: () => void;
}

const REDIRECT_TOTAL = 5;

const PageErreur: React.FC<PageErreurProps> = ({
  statusCode = "404",
  title = "Page introuvable",
  message = "La page que vous recherchez semble avoir été déplacée ou n'existe plus. Veuillez vérifier l'URL ou retourner à l'accueil.",
  reset,
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(REDIRECT_TOTAL);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDashboardUrl = () => {
    if (!user || !user.role) return '/';
    switch (user.role) {
      case 'platform_admin': return '/admin';
      case 'customer': return '/';
      default: return '/';
    }
  };

  const dashboardUrl = getDashboardUrl();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          window.location.href = dashboardUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [dashboardUrl]);

  const handleManualReturn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.location.href = dashboardUrl;
  };

  const handleGoBack = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.history.back();
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    reset?.();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        .pe-root { font-family: 'Inter', system-ui, sans-serif; }

        ::selection { background: rgba(239, 130, 25, 0.35); color: #ffffff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1f1f22; border-radius: 2px; }

        .pe-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 52px;
          padding: 0 28px;
          background: linear-gradient(135deg, #ef8219 0%, #c46f16 100%);
          color: #ffffff;
          border: 1px solid rgba(239, 130, 25, 0.4);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(239, 130, 25, 0.35), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.14);
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Inter', system-ui, sans-serif;
          white-space: nowrap;
          text-decoration: none;
        }
        .pe-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .pe-btn-primary:hover::before { opacity: 1; }
        .pe-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(239, 130, 25, 0.45), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .pe-btn-primary:active { transform: translateY(0); }

        .pe-btn-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          height: 52px;
          padding: 0 24px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Inter', system-ui, sans-serif;
          white-space: nowrap;
          text-decoration: none;
          background-color: transparent;
        }
        .pe-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .pe-btn-ghost:active { transform: translateY(0); }

        .pe-btn-text {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: 'Inter', system-ui, sans-serif;
          border-radius: 8px;
        }
        .pe-btn-text:hover { color: rgba(255,255,255,0.8); }

        .pe-card {
          background: linear-gradient(160deg, rgba(20,20,22,0.6) 0%, rgba(10,10,12,0.8) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
        }

        @media (max-width: 640px) {
          .pe-btn-row { flex-direction: column !important; }
          .pe-btn-row > * { width: 100% !important; }
          .pe-lottie { width: 180px !important; height: 180px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div
        className="pe-root"
        style={{
          minHeight: '100vh',
          background: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Ambient background orbs ─────────────────────────────────────── */}
        {[
          { size: 500, top: '-12%', left: '-8%', color: 'rgba(239, 130, 25, 0.08)', i: 0 },
          { size: 420, bottom: '-14%', right: '-10%', color: 'rgba(52, 76, 61, 0.1)', i: 1 },
          { size: 320, top: '40%', right: '5%', color: 'rgba(239, 130, 25, 0.05)', i: 2 },
          { size: 260, bottom: '20%', left: '2%', color: 'rgba(255, 255, 255, 0.03)', i: 3 },
        ].map(({ size, color, i, ...pos }) => (
          <motion.div
            key={i}
            custom={i}
            variants={orbVariants}
            animate="animate"
            style={{
              position: 'absolute', ...pos,
              width: size, height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              filter: 'blur(70px)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Grain texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }} />

        {/* Floating particles */}
        <FloatingParticles />

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 560 }}
        >

          {/* ── Top logo mark ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '8px 18px',
              borderRadius: 100,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <ShoppingBag size={13} style={{ color: '#ef8219' }} strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Boutique Premium
              </span>
            </div>
          </motion.div>

          {/* ── Main card ─────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="pe-card"
            style={{ padding: '52px 44px 44px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Top accent stripe */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, transparent, rgba(239, 130, 25, 0.6), rgba(240, 154, 68, 0.8), rgba(239, 130, 25, 0.6), transparent)',
            }} />

            {/* Soft inner radial */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 400, height: 200,
              background: 'radial-gradient(ellipse, rgba(239, 130, 25, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0, position: 'relative' }}>

              {/* ── Lottie + error code overlay ──────────────────────────── */}
              <motion.div variants={itemVariants} style={{ position: 'relative', marginBottom: 24 }}>
                <div
                  className="pe-lottie"
                  style={{ width: 220, height: 220, position: 'relative' }}
                >
                  <Lottie
                    animationData={errorAnimation}
                    loop
                    style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 16px 40px rgba(239, 130, 25, 0.2))' }}
                  />
                </div>

                {/* Floating code badge */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    position: 'absolute',
                    bottom: 8, right: -12,
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: 'linear-gradient(135deg, rgba(239, 130, 25, 0.15) 0%, rgba(240, 154, 68, 0.1) 100%)',
                    border: '1px solid rgba(239, 130, 25, 0.25)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 24px rgba(239, 130, 25, 0.15)',
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', serif",
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ef8219 0%, #f09a44 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {statusCode}
                  </span>
                </motion.div>
              </motion.div>

              {/* ── Headline ─────────────────────────────────────────────── */}
              <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
                <h1 style={{
                  fontFamily: "'Inter', Georgia, serif",
                  fontSize: 'clamp(28px, 5vw, 38px)',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}>
                  {title}
                </h1>
              </motion.div>

              {/* ── Message ──────────────────────────────────────────────── */}
              <motion.div variants={itemVariants} style={{ marginBottom: 36 }}>
                <p style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.75,
                  maxWidth: 380,
                  letterSpacing: '-0.01em',
                }}>
                  {message}
                </p>
              </motion.div>

              {/* ── Countdown strip ──────────────────────────────────────── */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 22px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  width: '100%',
                  marginBottom: 28,
                }}
              >
                <CountdownRing seconds={countdown} total={REDIRECT_TOTAL} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em', marginBottom: 3 }}>
                    Redirection automatique
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, letterSpacing: '-0.005em' }}>
                    Retour à l'accueil dans <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{countdown}s</span>
                  </p>
                </div>
                {/* Live dot */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef8219', flexShrink: 0 }}
                />
              </motion.div>

              {/* ── Action buttons ───────────────────────────────────────── */}
              <motion.div
                variants={itemVariants}
                className="pe-btn-row"
                style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 16 }}
              >
                <button className="pe-btn-primary" onClick={handleManualReturn} style={{ flex: 1 }}>
                  <Home size={15} strokeWidth={2.5} />
                  Accueil
                </button>

                {reset ? (
                  <button className="pe-btn-ghost" onClick={handleReset} style={{ flex: 1 }}>
                    <RefreshCw size={14} strokeWidth={2} />
                    Réessayer
                  </button>
                ) : (
                  <button className="pe-btn-ghost" onClick={handleGoBack} style={{ flex: 1 }}>
                    <ArrowLeft size={14} strokeWidth={2} />
                    Retour
                  </button>
                )}
              </motion.div>

              {/* Back link */}
              {reset && (
                <motion.div variants={itemVariants}>
                  <button className="pe-btn-text" onClick={handleGoBack}>
                    <ArrowLeft size={12} />
                    Page précédente
                  </button>
                </motion.div>
              )}

            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default PageErreur;