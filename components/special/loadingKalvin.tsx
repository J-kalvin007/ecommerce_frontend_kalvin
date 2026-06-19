


// const LoadingKalvin = () => {
//     return (
//         <div className="flex flex-col items-center justify-center py-32 space-y-4">
//             <div className="relative">
//                 <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 rounded-full" />
//                 <div className="w-16 h-16 border-4 border-[#23BE31] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
//             </div>
//             <p className="text-gray-500 font-bold animate-pulse text-sm">Chargement des données...</p>
//         </div>
//     );
// };
// export default LoadingKalvin;
















'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface LoadingKalvinProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    /** When true, fills the immediate parent with a centred layout */
    block?: boolean;
}

/**
 * Compact inline / block loader.
 * - No external Lottie dependency — pure CSS + Framer Motion.
 * - Matches Green Challenger dark-forest palette.
 */
const LoadingKalvin = ({
    message = 'Chargement des données…',
    size = 'md',
    block = true,
}: LoadingKalvinProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const dim = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;
    const track = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
    const labelSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
    const padding = size === 'sm' ? '24px 16px' : size === 'lg' ? '56px 24px' : '40px 20px';

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
        .gc-lk-root { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes gc-lk-spin { to { transform: rotate(360deg); } }
        @keyframes gc-lk-pulse { 0%,100% { opacity:.28; transform:scale(.8); } 50% { opacity:1; transform:scale(1); } }

        .gc-lk-spinner-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gc-lk-track {
          border-radius: 50%;
          border-style: solid;
          border-color: rgba(74,120,80,0.15);
        }
        .gc-lk-arc {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border-style: solid;
          border-color: transparent;
          border-top-color: #6aaa72;
          border-right-color: rgba(106,170,114,0.35);
          animation: gc-lk-spin 1.1s linear infinite;
        }
        .gc-lk-dot {
          border-radius: 50%;
          background: #6aaa72;
        }

        @media (prefers-reduced-motion: reduce) {
          .gc-lk-arc { animation: none; }
          .gc-lk-dot { animation: none !important; }
        }
      `}</style>

            <div
                className="gc-lk-root"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                    padding: block ? padding : '0',
                    width: '100%',
                }}
            >
                {/* ── Spinner ────────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'relative', marginBottom: message ? (size === 'sm' ? 10 : 16) : 0 }}
                >
                    {/* Outer glow disc */}
                    <div style={{
                        position: 'absolute',
                        inset: -(dim * 0.3),
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(74,120,80,0.18) 0%, transparent 70%)',
                        filter: 'blur(12px)',
                        pointerEvents: 'none',
                    }} />

                    {/* Pulse ring */}
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            inset: -(dim * 0.15),
                            borderRadius: '50%',
                            border: '1px solid rgba(106,170,114,0.25)',
                        }}
                    />

                    {/* Track + arc */}
                    <div
                        className="gc-lk-spinner-wrap"
                        style={{ width: dim, height: dim }}
                    >
                        <div
                            className="gc-lk-track"
                            style={{ width: dim, height: dim, borderWidth: track }}
                        />
                        <div
                            className="gc-lk-arc"
                            style={{ borderWidth: track }}
                        />

                        {/* Centre leaf dot */}
                        <div style={{
                            position: 'absolute',
                            width: dim * 0.22,
                            height: dim * 0.22,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #6aaa72 0%, #4a7850 100%)',
                            boxShadow: '0 0 10px rgba(106,170,114,0.5)',
                        }} />
                    </div>
                </motion.div>

                {/* ── Label ─────────────────────────────────────────────────────────── */}
                {block && message && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.4 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
                    >
                        <p style={{
                            fontSize: labelSize,
                            fontWeight: 600,
                            color: isDark ? 'rgba(232,237,233,0.5)' : 'rgba(40,80,46,0.7)',
                            letterSpacing: '-0.01em',
                        }}>
                            {message}
                        </p>

                        {/* Pulsing dots */}
                        <div style={{ display: 'flex', gap: 5 }}>
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="gc-lk-dot"
                                    animate={{ opacity: [0.28, 1, 0.28], scale: [0.8, 1, 0.8] }}
                                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                                    style={{ width: 6, height: 6 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default LoadingKalvin;