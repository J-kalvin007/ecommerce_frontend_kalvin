// 'use client';

// import { motion } from "framer-motion";
// import Lottie from "lottie-react";
// import loadingAnimation from "@/public/lotti/load5.json";

// interface LoadingStyleProps {
//     label?: string;
//     size?: string | number;
//     fullScreen?: boolean;
// }

// const LoadingStyle = ({ label, size = 15, fullScreen = false }: LoadingStyleProps) => {
//     // Convert size to a valid number if it's a string
//     const numericSize = typeof size === 'string' ? parseFloat(size) : size;
//     // Base scale factor for the Lottie animation
//     const scaleFactor = numericSize / 10;

//     const content = (
//         <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//             className="relative flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl overflow-hidden glass-card"
//         >
//             {/* Eblouissant Background Effects */}
//             <div className="absolute inset-0 pointer-events-none">
//                 <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-accent)', opacity: 0.15 }} />
//                 <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-sage)', opacity: 0.15, animationDelay: '1s' }} />
//             </div>

//             {/* Inner Ring Glow */}
//             <div className="relative flex items-center justify-center rounded-full transition-all duration-700"
//                 style={{
//                     padding: `${1.5 * scaleFactor}rem`,
//                     background: 'var(--color-bg-elevated)',
//                     border: '1px solid var(--color-border-light)',
//                     boxShadow: 'var(--shadow-glass)'
//                 }}
//             >
//                 {/* Lottie Animation Container */}
//                 <div
//                     className="relative z-10 drop-shadow-2xl"
//                     style={{
//                         width: `${numericSize * 0.8}rem`,
//                         height: `${numericSize * 0.8}rem`,
//                         maxWidth: '100vw'
//                     }}
//                 >
//                     <Lottie
//                         animationData={loadingAnimation}
//                         loop={true}
//                         className="w-full h-full"
//                     />
//                 </div>
//             </div>

//             {/* Label Section */}
//             {label && (
//                 <motion.div
//                     initial={{ opacity: 0, y: 15 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.3, duration: 0.5 }}
//                     className="mt-8 flex flex-col items-center relative z-10"
//                 >
//                     <p className="text-lg md:text-xl font-bold tracking-tight text-center text-primary bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">
//                         {label}
//                     </p>
//                     <div className="flex gap-1 mt-3">
//                         {[0, 1, 2].map((i) => (
//                             <motion.div
//                                 key={i}
//                                 animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
//                                 transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
//                                 className="w-1.5 h-1.5 rounded-full"
//                                 style={{ background: 'var(--color-accent)' }}
//                             />
//                         ))}
//                     </div>
//                 </motion.div>
//             )}
//         </motion.div>
//     );

//     if (fullScreen) {
//         return (
//             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/80 backdrop-blur-sm">
//                 {content}
//             </div>
//         );
//     }

//     return content;
// };

// export default LoadingStyle;























'use client';

import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from '@/public/assets/lottis/loading.json';
import { useTheme } from '@/hooks/useTheme';

interface LoadingStyleProps {
    label?: string;
    size?: string | number;
    fullScreen?: boolean;
}

const LoadingStyle = ({ label, size = 15, fullScreen = false }: LoadingStyleProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const numericSize = typeof size === 'string' ? parseFloat(size) : size;
    const lottieSize = numericSize * 0.8;
    const padScale = numericSize / 10;

    const content = (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .gc-ls-root { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes gc-ls-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

            <motion.div
                className="gc-ls-root"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${3.5 * padScale}rem ${4 * padScale}rem`,
                    borderRadius: 28,
                    overflow: 'hidden',
                    background: isDark
                        ? 'linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(8,15,11,0.85) 100%)'
                        : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(245,250,246,0.97) 100%)',
                    border: isDark ? '1px solid rgba(74,120,80,0.15)' : '1px solid rgba(74,120,80,0.12)',
                    boxShadow: isDark
                        ? '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : '0 12px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(74,120,80,0.08)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* ── Ambient orbs ────────────────────────────────────────────────── */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.2, 0.12] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', top: '-30%', left: '-20%',
                            width: '65%', height: '65%',
                            borderRadius: '50%',
                            background: 'rgba(74,120,80,1)',
                            filter: 'blur(80px)',
                        }}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.13, 0.08] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                        style={{
                            position: 'absolute', bottom: '-25%', right: '-15%',
                            width: '55%', height: '55%',
                            borderRadius: '50%',
                            background: 'rgba(163,177,138,1)',
                            filter: 'blur(80px)',
                        }}
                    />
                </div>

                {/* Grain */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.022,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px',
                }} />

                {/* ── Spinner ring wrapping Lottie ─────────────────────────────────── */}
                <motion.div
                    style={{ position: 'relative', marginBottom: label ? 28 : 0, zIndex: 2 }}
                >
                    {/* Outer pulse ring */}
                    <motion.div
                        animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            inset: -(numericSize * 2),
                            borderRadius: '50%',
                            border: '1px solid rgba(74,120,80,0.3)',
                        }}
                    />

                    {/* Rotating arc */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            inset: -(numericSize * 1.2),
                            borderRadius: '50%',
                            border: `2px solid transparent`,
                            borderTopColor: 'rgba(106,170,114,0.6)',
                            borderRightColor: 'rgba(106,170,114,0.2)',
                        }}
                    />

                    {/* Inner housing */}
                    <div style={{
                        position: 'relative',
                        padding: `${1.4 * padScale}rem`,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(74,120,80,0.18)',
                        boxShadow: '0 0 30px rgba(74,120,80,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: `${lottieSize}rem`,
                            height: `${lottieSize}rem`,
                            maxWidth: '80vw',
                            maxHeight: '80vw',
                            position: 'relative',
                            zIndex: 10,
                        }}>
                            <Lottie
                                animationData={loadingAnimation}
                                loop
                                style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 24px rgba(74,120,80,0.3))' }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* ── Label ────────────────────────────────────────────────────────── */}
                {label && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}
                    >
                        <p style={{
                            fontSize: 'clamp(14px, 1.5vw, 17px)',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            background: isDark
                                ? 'linear-gradient(90deg, rgba(232,237,233,0.5) 0%, rgba(106,170,114,0.9) 35%, rgba(163,177,138,0.9) 65%, rgba(232,237,233,0.5) 100%)'
                                : 'linear-gradient(90deg, rgba(40,80,46,0.6) 0%, rgba(74,120,80,1) 35%, rgba(60,100,66,1) 65%, rgba(40,80,46,0.6) 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'gc-ls-shimmer 3s linear infinite',
                        }}>
                            {label}
                        </p>

                        {/* Dots */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.25, 1, 0.25], scale: [0.75, 1, 0.75] }}
                                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                                    style={{ width: 7, height: 7, borderRadius: '50%', background: '#6aaa72' }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? 'rgba(8,15,11,0.85)' : 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(14px)',
            }}>
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingStyle;