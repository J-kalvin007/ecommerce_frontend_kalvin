'use client';

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className={`
          block text-sm font-semibold ml-1 transition-colors
          ${error
            ? 'text-red-500'
            : isFocused
              ? 'text-[#23BE31]'
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }
        `}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 2px rgba(35, 190, 49, 0.2)'
            : '0 0 0 0px rgba(0, 0, 0, 0)',
          borderColor: error
            ? '#ef4444'
            : isFocused
              ? '#23BE31'
              : isDark ? 'rgba(35, 190, 49, 0.2)' : '#e5e7eb'
        }}
        className={`
          relative rounded-xl overflow-hidden border transition-colors
          ${isDark ? 'bg-[#0f1d24]' : 'bg-white'}
        `}
      >
        <textarea
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 bg-transparent
            border-none outline-none resize-y min-h-[100px]
            placeholder:text-gray-400
            ${isDark ? 'text-white' : 'text-gray-900'}
            ${className}
          `}
          {...props}
        />
      </motion.div>

      <div className="flex justify-between px-1">
        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-red-500 font-medium"
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {helperText}
            </p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;