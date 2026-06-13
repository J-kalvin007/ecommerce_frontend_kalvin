

"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"
import Lottie from "lottie-react"
import errorAnimation from "@/public/assets/lottis/error11.json"

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
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative flex flex-col items-center justify-center p-10 md:p-16 rounded-[2.5rem] border overflow-hidden
                ${isDark
                    ? "bg-red-500/[0.03] border-red-500/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(239,68,68,0.1)]"
                    : "bg-white/40 border-red-100/50 backdrop-blur-md shadow-[0_20px_50px_rgba(239,68,68,0.05)]"
                }`}
        >
            {/* Subtle Gradient Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] pointer-events-none
                ${isDark ? "bg-red-500/10" : "bg-red-500/5"}`}
            />
            <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-[100px] pointer-events-none
                ${isDark ? "bg-red-600/10" : "bg-red-500/5"}`}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
                className="relative w-50 h-50 md:w-56 md:h-56 mb-8 flex items-center justify-center"
            >
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 bg-red-500 pointer-events-none group-hover:opacity-30 transition-opacity`} />
                <Lottie
                    animationData={errorAnimation}
                    loop={true}
                    className="w-full h-full relative z-10"
                />
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-center max-w-md leading-tight
                    ${isDark ? "text-white selection:bg-red-500/30" : "text-gray-900 selection:bg-red-100"}
                `}
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-base md:text-lg leading-relaxed mb-8 text-center max-w-lg font-medium
                    ${isDark ? "text-gray-400" : "text-gray-500"}
                `}
            >
                {message}
            </motion.p>

            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={onRetry}
                    className="group relative inline-flex items-center justify-center px-10 py-2 rounded-full
                        bg-red-500 text-white font-bold text-lg
                        shadow-[0_10px_25px_-5px_rgba(239,68,68,0.4)]
                        hover:shadow-[0_20px_35px_-10px_rgba(239,68,68,0.5)]
                        transition-all duration-300 ease-out overflow-hidden
                    "
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">{buttonText}</span>
                </motion.button>

            )}

        </motion.div>

    );

}
