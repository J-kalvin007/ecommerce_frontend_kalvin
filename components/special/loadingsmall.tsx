import { motion } from "framer-motion";

interface LoadingSmallProps {
    message?: string;
    className?: string;
    size?: 'xs' | 'sm' | 'md';
    variant?: 'light' | 'dark' | 'white';
}

const LoadingSmall = ({
    message,
    className = "",
    size = 'sm',
    variant = 'white'
}: LoadingSmallProps) => {

    const sizeClasses = {
        xs: { container: 'h-4 w-4', border: 'border-2' },
        sm: { container: 'h-5 w-5', border: 'border-2' },
        md: { container: 'h-7 w-7', border: 'border-[3px]' },
    };

    const currentSize = sizeClasses[size];

    const variantClasses = {
        light: 'border-gray-200 border-t-blue-600',
        dark: 'border-white/10 border-t-white/80',
        white: 'border-white/30 border-t-white',
    };

    const textVariantClasses = {
        light: 'text-gray-600',
        dark: 'text-gray-300',
        white: 'text-white',
    };

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`rounded-full ${currentSize.container} ${currentSize.border} ${variantClasses[variant]}`}
            />
            {message && (
                <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-[13px] font-bold tracking-tight ${textVariantClasses[variant]}`}
                >
                    {message}
                </motion.span>
            )}
        </div>
    );
};

export default LoadingSmall;

