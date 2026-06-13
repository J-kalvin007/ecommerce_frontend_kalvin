'use client';

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', onFocus, onBlur, ...props }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <motion.label
            initial={false}
            animate={{
              color: error
                ? '#ef4444'
                : isFocused
                  ? '#23BE31'
                  : isDark ? '#9ca3af' : '#4b5563'
            }}
            className="block text-lg font-semibold ml-1"
          >
            {label}
          </motion.label>
        )}

        <div className="relative group">
          {icon && (
            <div className={`
              absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10
              ${isFocused
                ? 'text-[#23BE31]'
                : isDark ? 'text-gray-500' : 'text-gray-400'
              }
            `}>
              {icon}
            </div>
          )}

          <motion.div
            animate={{
              boxShadow: isFocused
                ? '0 0 0 2px rgba(35, 190, 49, 0.2)'
                : '0 0 0 1px rgba(0, 0, 0, 0)',
              borderColor: error
                ? '#ef4444'
                : isFocused
                  ? '#23BE31'
                  : isDark ? 'rgba(35, 190, 49, 0.2)' : '#e5e7eb'
            }}
            className={`
              relative rounded-xl overflow-hidden
              ${isDark ? 'bg-[#0f1d24]' : 'bg-white'}
              border
              ${isDark ? 'border-[#23BE31]/20' : 'border-gray-200'}
            `}
          >
            <input
              ref={ref}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={`
                w-full px-4 py-3.5
                bg-transparent
                border-none outline-none
                transition-all duration-300
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                ${isDark ? 'text-white' : 'text-gray-900'}
                ${icon ? 'pl-11' : ''}
                ${className}
              `}
              {...props}
            />
          </motion.div>

          {/* Animated bottom border line on focus */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              absolute bottom-0 left-0 right-0 h-[2px] 
              ${error ? 'bg-red-500' : 'bg-[#23BE31]'}
            `}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-red-500 ml-1 font-medium flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
