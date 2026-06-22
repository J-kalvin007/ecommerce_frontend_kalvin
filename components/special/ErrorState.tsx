

"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { RefreshCw } from "lucide-react";
import errorAnimation from "@/public/assets/lottis/error11.json";
import { useThemeStore } from '@/store/theme.store';

interface ErrorStateProps {
    title?: string;
    message: string;
    buttonText?: string;
    onRetry?: () => void;
}

export default function ErrorState({
    title = "Une erreur est survenue",
    message,
    buttonText = "Réessayer",
    onRetry,
}: ErrorStateProps) {
    const { resolvedTheme: theme } = useThemeStore();
    const isDark = theme === 'dark';

    const cardBg = isDark
        ? 'linear-gradient(160deg, rgba(239,68,68,0.04) 0%, rgba(8,15,11,0.65) 100%)'
        : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(254,248,248,0.97) 100%)';
    const cardBorder = isDark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.18)';
    const cardShadow = isDark
        ? '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)'
        : '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(239,68,68,0.06)';
    const titleColor = isDark ? '#e8ede9' : '#1a1f1b';
    const messageColor = isDark ? 'rgba(232,237,233,0.46)' : 'rgba(0,0,0,0.5)';

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

        .gc-err-root { font-family: 'Inter', system-ui, sans-serif; }

        .gc-err-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          height: 48px;
          padding: 0 28px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #fff;
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.13);
          transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .gc-err-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .gc-err-btn:hover::before { opacity: 1; }
        .gc-err-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 44px rgba(220,38,38,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .gc-err-btn:active { transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

            <motion.div
                className="gc-err-root"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '60px 40px',
                    borderRadius: 26,
                    overflow: 'hidden',
                    width: '100%',
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    boxShadow: cardShadow,
                    backdropFilter: isDark ? 'blur(12px)' : 'none',
                }}
            >
                {/* Top accent stripe */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), rgba(249,115,22,0.6), rgba(239,68,68,0.5), transparent)',
                }} />

                {/* Ambient orbs */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', top: '-20%', right: '-10%',
                            width: '50%', height: '50%',
                            borderRadius: '50%',
                            background: 'rgba(239,68,68,1)',
                            filter: 'blur(75px)',
                        }}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.14, 1], opacity: [0.05, 0.09, 0.05] }}
                        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        style={{
                            position: 'absolute', bottom: '-15%', left: '-8%',
                            width: '45%', height: '45%',
                            borderRadius: '50%',
                            background: 'rgba(249,115,22,1)',
                            filter: 'blur(75px)',
                        }}
                    />
                </div>

                {/* Grain */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px',
                }} />

                {/* ── Lottie + code badge ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, duration: 0.6, type: 'spring', stiffness: 120 }}
                    style={{ position: 'relative', marginBottom: 32, zIndex: 2 }}
                >
                    {/* Glow disc */}
                    <div style={{
                        position: 'absolute', inset: -20, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
                        filter: 'blur(20px)',
                        pointerEvents: 'none',
                    }} />

                    {/* Pulse ring */}
                    <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', inset: -10, borderRadius: '50%',
                            border: '1px solid rgba(239,68,68,0.3)',
                        }}
                    />

                    <div style={{ width: 160, height: 160, position: 'relative' }}>
                        <Lottie
                            animationData={errorAnimation}
                            loop
                            style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 12px 32px rgba(239,68,68,0.2))' }}
                        />
                    </div>
                </motion.div>

                {/* ── Title ────────────────────────────────────────────────────────── */}
                <motion.h3
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 'clamp(20px, 3vw, 26px)',
                        fontWeight: 700,
                        color: titleColor,
                        letterSpacing: '-0.025em',
                        lineHeight: 1.2,
                        marginBottom: 12,
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {title}
                </motion.h3>

                {/* ── Message ───────────────────────────────────────────────────────── */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    style={{
                        fontSize: 14,
                        color: messageColor,
                        lineHeight: 1.75,
                        maxWidth: 380,
                        letterSpacing: '-0.01em',
                        marginBottom: onRetry ? 36 : 0,
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {message}
                </motion.p>

                {/* ── CTA ───────────────────────────────────────────────────────────── */}
                {onRetry && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.38 }}
                        style={{ position: 'relative', zIndex: 2 }}
                    >
                        <button className="gc-err-btn" onClick={onRetry}>
                            <RefreshCw size={14} strokeWidth={2.5} />
                            {buttonText}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </>
    );
}