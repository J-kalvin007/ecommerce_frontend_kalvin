'use client';

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/lotti/load5.json";

interface LoadingStyleProps {
    label?: string;
    size?: string | number;
    fullScreen?: boolean;
}

const LoadingStyle = ({ label, size = 15, fullScreen = false }: LoadingStyleProps) => {
    // Convert size to a valid number if it's a string
    const numericSize = typeof size === 'string' ? parseFloat(size) : size;
    // Base scale factor for the Lottie animation
    const scaleFactor = numericSize / 10;

    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl overflow-hidden glass-card"
        >
            {/* Eblouissant Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-accent)', opacity: 0.15 }} />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] animate-pulse" style={{ background: 'var(--color-sage)', opacity: 0.15, animationDelay: '1s' }} />
            </div>

            {/* Inner Ring Glow */}
            <div className="relative flex items-center justify-center rounded-full transition-all duration-700"
                style={{
                    padding: `${1.5 * scaleFactor}rem`,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-light)',
                    boxShadow: 'var(--shadow-glass)'
                }}
            >
                {/* Lottie Animation Container */}
                <div
                    className="relative z-10 drop-shadow-2xl"
                    style={{
                        width: `${numericSize * 0.8}rem`,
                        height: `${numericSize * 0.8}rem`,
                        maxWidth: '100vw'
                    }}
                >
                    <Lottie
                        animationData={loadingAnimation}
                        loop={true}
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* Label Section */}
            {label && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8 flex flex-col items-center relative z-10"
                >
                    <p className="text-lg md:text-xl font-bold tracking-tight text-center text-primary bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">
                        {label}
                    </p>
                    <div className="flex gap-1 mt-3">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: 'var(--color-accent)' }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingStyle;