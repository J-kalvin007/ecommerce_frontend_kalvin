'use client';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-10 w-10 border-2',
    md: 'h-15 w-15 border-2',
    lg: 'h-24 w-24 border-3',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={`rounded-full border-transparent border-t-[#23BE31] border-r-[#23BE31] ${sizeClasses[size]} ${className}`}
      />
    </div>
  );
};

export default LoadingSpinner;