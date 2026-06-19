'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'pulse' | 'dots' | 'spiral';
  className?: string;
  label?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  label
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const LoaderContent = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-[#23BE31] to-[#1fa92c] animate-pulse shadow-lg shadow-[#23BE31]/30`} />
            <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-[#23BE31] to-[#1fa92c] animate-ping opacity-20`} />
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-[#23BE31]"
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case 'spiral':
      case 'default':
      default:
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-[#23BE31]/20"
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#23BE31] border-r-[#1fa92c]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LoaderContent />
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;