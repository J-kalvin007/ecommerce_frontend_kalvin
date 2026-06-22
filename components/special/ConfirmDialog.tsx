
'use client';

import { AlertTriangle, Info, CheckCircle, X, HelpCircle, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingKalvin from './loadingKalvin';
import { useThemeStore } from '@/store/theme.store';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success' | 'question';
  isLoading?: boolean;
  children?: React.ReactNode;
}

// ─── Per-type tokens ──────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  warning: {
    Icon: AlertTriangle,
    accentRgb: '234,179,8',
    accent: '#eab308',
    accentDark: '#a16207',
    stripe: 'linear-gradient(90deg, transparent, rgba(234,179,8,0.55), rgba(249,115,22,0.65), rgba(234,179,8,0.55), transparent)',
    iconBg: 'rgba(234,179,8,0.12)',
    iconBorder: 'rgba(234,179,8,0.22)',
    iconColor: '#facc15',
    btnGrad: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    btnShadow: 'rgba(217,119,6,0.4)',
    cardBorder: 'rgba(234,179,8,0.16)',
    cardGlow: 'rgba(234,179,8,0.06)',
  },
  danger: {
    Icon: Trash2,
    accentRgb: '239,68,68',
    accent: '#ef4444',
    accentDark: '#b91c1c',
    stripe: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.55), rgba(249,115,22,0.55), rgba(239,68,68,0.55), transparent)',
    iconBg: 'rgba(239,68,68,0.12)',
    iconBorder: 'rgba(239,68,68,0.22)',
    iconColor: '#f87171',
    btnGrad: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    btnShadow: 'rgba(239,68,68,0.45)',
    cardBorder: 'rgba(239,68,68,0.16)',
    cardGlow: 'rgba(239,68,68,0.06)',
  },
  info: {
    Icon: Info,
    accentRgb: '59,130,246',
    accent: '#3b82f6',
    accentDark: '#1d4ed8',
    stripe: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(99,102,241,0.6), rgba(59,130,246,0.5), transparent)',
    iconBg: 'rgba(59,130,246,0.12)',
    iconBorder: 'rgba(59,130,246,0.22)',
    iconColor: '#60a5fa',
    btnGrad: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    btnShadow: 'rgba(59,130,246,0.4)',
    cardBorder: 'rgba(59,130,246,0.16)',
    cardGlow: 'rgba(59,130,246,0.05)',
  },
  success: {
    Icon: CheckCircle,
    accentRgb: '74,120,80',
    accent: '#4a7850',
    accentDark: '#3a5e40',
    stripe: 'linear-gradient(90deg, transparent, rgba(74,120,80,0.55), rgba(106,170,114,0.65), rgba(74,120,80,0.55), transparent)',
    iconBg: 'rgba(74,120,80,0.14)',
    iconBorder: 'rgba(74,120,80,0.25)',
    iconColor: '#6aaa72',
    btnGrad: 'linear-gradient(135deg, #4a7850 0%, #3a5e40 100%)',
    btnShadow: 'rgba(74,120,80,0.45)',
    cardBorder: 'rgba(74,120,80,0.16)',
    cardGlow: 'rgba(74,120,80,0.06)',
  },
  question: {
    Icon: HelpCircle,
    accentRgb: '168,85,247',
    accent: '#a855f7',
    accentDark: '#7e22ce',
    stripe: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), rgba(139,92,246,0.6), rgba(168,85,247,0.5), transparent)',
    iconBg: 'rgba(168,85,247,0.12)',
    iconBorder: 'rgba(168,85,247,0.22)',
    iconColor: '#c084fc',
    btnGrad: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    btnShadow: 'rgba(168,85,247,0.4)',
    cardBorder: 'rgba(168,85,247,0.16)',
    cardGlow: 'rgba(168,85,247,0.05)',
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────
const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning',
  isLoading = false,
  children,
}: ConfirmDialogProps) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => { setMounted(true); }, []);

  // Keyboard escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) onCancel();
  }, [isLoading, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  if (!mounted) return null;

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.warning;
  const { Icon } = cfg;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        .gc-cd-root { font-family: 'Inter', system-ui, sans-serif; }

        .gc-cd-cancel {
          height: 48px;
          padding: 0 24px;
          min-width: 130px;
          border-radius: 13px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--cd-cancel-color);
          background: var(--cd-cancel-bg);
          border: 1px solid var(--cd-cancel-border);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .gc-cd-cancel:hover:not(:disabled) {
          background: var(--cd-cancel-bg-hover);
          border-color: var(--cd-cancel-border-hover);
          color: var(--cd-cancel-color-hover);
          transform: translateY(-1px);
        }
        .gc-cd-cancel:disabled { opacity: 0.45; cursor: not-allowed; }

        .gc-cd-confirm {
          height: 48px;
          padding: 0 28px;
          min-width: 148px;
          border-radius: 13px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #f0f5f1;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gc-cd-confirm::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .gc-cd-confirm:hover:not(:disabled)::before { opacity: 1; }
        .gc-cd-confirm:hover:not(:disabled) { transform: translateY(-2px); }
        .gc-cd-confirm:active:not(:disabled) { transform: translateY(0); }
        .gc-cd-confirm:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.3); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <div
            className="gc-cd-root"
            style={{
              position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
              '--cd-cancel-color': isDark ? 'rgba(232,237,233,0.52)' : 'rgba(17,24,18,0.6)',
              '--cd-cancel-bg': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              '--cd-cancel-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              '--cd-cancel-bg-hover': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              '--cd-cancel-border-hover': isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.1)',
              '--cd-cancel-color-hover': isDark ? 'rgba(232,237,233,0.82)' : 'rgba(17,24,18,0.9)',
            } as React.CSSProperties}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={isLoading ? undefined : onCancel}
              style={{
                position: 'absolute', inset: 0,
                background: isDark ? 'rgba(4,8,6,0.82)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="gc-cd-title"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 468,
                background: isDark
                  ? `linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(8,15,11,0.97) 100%)`
                  : `linear-gradient(160deg, #ffffff 0%, #f4f7f5 100%)`,
                border: isDark
                  ? `1px solid ${cfg.cardBorder}`
                  : `1px solid rgba(0,0,0,0.06)`,
                borderRadius: 26,
                overflow: 'hidden',
                boxShadow: isDark
                  ? `0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${cfg.cardGlow}`
                  : `0 40px 100px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8), 0 0 40px rgba(${cfg.accentRgb},0.08)`,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Top accent stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cfg.stripe }} />

              {/* Inner ambient glow */}
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 220, height: 220,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(${cfg.accentRgb},0.12) 0%, transparent 70%)`,
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }} />

              {/* Close button */}
              <button
                onClick={isLoading ? undefined : onCancel}
                disabled={isLoading}
                aria-label="Fermer"
                style={{
                  position: 'absolute', top: 18, right: 18,
                  width: 32, height: 32, borderRadius: 10,
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  color: isDark ? 'rgba(232,237,233,0.35)' : 'rgba(17,24,18,0.4)',
                  transition: 'all 0.18s',
                  zIndex: 10,
                }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = isDark ? 'rgba(232,237,233,0.75)' : 'rgba(17,24,18,0.8)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = isDark ? 'rgba(232,237,233,0.35)' : 'rgba(17,24,18,0.4)'; }}
              >
                <X size={15} strokeWidth={2.5} />
              </button>

              {/* ── Body ─────────────────────────────────────────────────────── */}
              <div style={{ padding: '52px 40px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0 }}>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 18 }}
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: isDark ? cfg.iconBg : '#ffffff',
                    border: `1.5px solid ${isDark ? cfg.iconBorder : 'rgba(0,0,0,0.05)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    marginBottom: 28,
                    boxShadow: isDark
                      ? `0 0 0 10px rgba(${cfg.accentRgb},0.05), 0 0 0 20px rgba(${cfg.accentRgb},0.025)`
                      : `0 0 0 10px rgba(${cfg.accentRgb},0.04), 0 0 0 20px rgba(${cfg.accentRgb},0.02)`,
                  }}
                >
                  {/* Pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', inset: -8, borderRadius: '50%',
                      border: `1px solid rgba(${cfg.accentRgb},0.25)`,
                    }}
                  />
                  <Icon size={30} style={{ color: cfg.iconColor }} strokeWidth={1.75} />
                </motion.div>

                {/* Title */}
                <h3
                  id="gc-cd-title"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: isDark ? '#e8ede9' : '#111812',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                    marginBottom: 12,
                  }}
                >
                  {title}
                </h3>

                {/* Message */}
                <p style={{
                  fontSize: 14,
                  color: isDark ? 'rgba(232,237,233,0.52)' : 'rgba(17,24,18,0.6)',
                  lineHeight: 1.72,
                  maxWidth: 340,
                  letterSpacing: '-0.01em',
                  marginBottom: children ? 20 : 0,
                }}>
                  {message}
                </p>

                {/* Children slot */}
                {children && (
                  <div style={{ width: '100%', textAlign: 'left', marginTop: 4 }}>
                    {children}
                  </div>
                )}
              </div>

              {/* ── Divider ───────────────────────────────────────────────── */}
              <div style={{ height: 1, background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)', margin: '0 40px' }} />

              {/* ── Footer ───────────────────────────────────────────────── */}
              <div style={{
                padding: '24px 40px 32px',
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <button
                  className="gc-cd-cancel"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>

                <button
                  className="gc-cd-confirm"
                  onClick={onConfirm}
                  disabled={isLoading}
                  style={{
                    background: cfg.btnGrad,
                    boxShadow: `0 8px 28px ${cfg.btnShadow}, inset 0 1px 0 rgba(255,255,255,0.13)`,
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.boxShadow = `0 14px 40px ${cfg.btnShadow}, inset 0 1px 0 rgba(255,255,255,0.18)`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${cfg.btnShadow}, inset 0 1px 0 rgba(255,255,255,0.13)`; }}
                >
                  {isLoading ? (
                    <LoadingKalvin />
                  ) : (
                    <>
                      <span>{confirmText}</span>
                      <Icon size={14} style={{ opacity: 0.8 }} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConfirmDialog;