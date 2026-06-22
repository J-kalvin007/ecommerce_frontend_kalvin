

'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Optional label shown below the spinner */
  label?: string;
  /** Show a single minimal ring (for inline use) or full luxury version */
  variant?: 'default' | 'luxury';
}

const sizeMap = {
  sm: { outer: 36, ring: 2, inner: 10, gap: 6 },
  md: { outer: 56, ring: 2.5, inner: 16, gap: 9 },
  lg: { outer: 88, ring: 3, inner: 24, gap: 14 },
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label,
  variant = 'default',
}) => {
  const { outer, ring, inner, gap } = sizeMap[size];

  // ── Minimal inline variant ──────────────────────────────────────
  if (variant === 'default') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="relative" style={{ width: outer, height: outer }}>
          {/* Track ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `${ring}px solid rgba(35,190,49,0.1)`,
            }}
          />
          {/* Spinning arc */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `${ring}px solid transparent`,
              borderTopColor: '#23BE31',
              borderRightColor: 'rgba(35,190,49,0.4)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
          />
          {/* Centre dot */}
          <div
            className="absolute rounded-full"
            style={{
              width: inner,
              height: inner,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, rgba(35,190,49,0.4) 0%, transparent 70%)',
            }}
          />
        </div>
        {label && (
          <p
            className="text-[0.78rem] font-semibold tracking-wider"
            style={{ color: 'rgba(35,190,49,0.6)', letterSpacing: '0.1em' }}
          >
            {label}
          </p>
        )}
      </div>
    );
  }

  // ── Luxury variant ──────────────────────────────────────────────
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className="relative"
        style={{ width: outer + gap * 2, height: outer + gap * 2 }}
      >
        {/* Outermost ambient halo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(35,190,49,0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Outer slow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 0,
            border: `${ring}px solid rgba(35,190,49,0.1)`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main spinning arc */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: gap,
            border: `${ring}px solid transparent`,
            borderTopColor: '#23BE31',
            borderRightColor: 'rgba(35,190,49,0.5)',
            borderBottomColor: 'rgba(35,190,49,0.15)',
            filter: 'drop-shadow(0 0 4px rgba(35,190,49,0.5))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner counter-spin ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: gap * 2.5,
            border: `${ring * 0.7}px solid transparent`,
            borderTopColor: 'rgba(35,190,49,0.35)',
            borderLeftColor: 'rgba(35,190,49,0.2)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Centre pulse orb */}
        <div
          className="absolute"
          style={{
            inset: '50%',
            transform: 'translate(-50%,-50%)',
            width: inner,
            height: inner,
            marginTop: -(inner / 2),
            marginLeft: -(inner / 2),
          }}
        >
          <motion.div
            className="h-full w-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(35,190,49,0.9) 0%, rgba(35,190,49,0.3) 60%, transparent 100%)',
            }}
            animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {label && (
        <motion.p
          className="text-[0.78rem] font-semibold"
          style={{
            color: 'rgba(35,190,49,0.55)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;