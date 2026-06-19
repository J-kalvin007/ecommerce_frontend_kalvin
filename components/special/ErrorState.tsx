"use client"

import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { AlertCircle } from "lucide-react"
import errorAnimation from "@/public/lotti/error_11.json"

interface ErrorStateProps {
    title?: string
    message: string
    buttonText?: string
    onRetry?: () => void
}

export default function ErrorState({
    title = "Une erreur est survenue",
    message,
    buttonText = "Réessayer",
    onRetry,
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl overflow-hidden glass-card w-full"
        >
            {/* Subtle Gradient Glow for Error */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[80px]" style={{ background: 'var(--color-error)', opacity: 0.1 }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[80px]" style={{ background: 'var(--color-warning)', opacity: 0.05 }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                className="relative w-40 h-40 md:w-48 md:h-48 mb-6 flex items-center justify-center"
            >
                <div className="absolute inset-0 rounded-full blur-3xl opacity-10 bg-[var(--color-error)] pointer-events-none transition-opacity" />
                <Lottie
                    animationData={errorAnimation}
                    loop={true}
                    className="w-full h-full relative z-10 drop-shadow-xl"
                />
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight text-center max-w-md leading-tight text-primary relative z-10"
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm md:text-base leading-relaxed mb-8 text-center max-w-lg font-medium text-secondary relative z-10"
            >
                {message}
            </motion.p>

            {onRetry && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative z-10"
                >
                    <button
                        onClick={onRetry}
                        className="btn btn-danger rounded-full px-8 py-3 shadow-lg shadow-[var(--color-error)]/20 hover:shadow-[var(--color-error)]/40 hover:-translate-y-1 transition-all"
                    >
                        {buttonText}
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}
