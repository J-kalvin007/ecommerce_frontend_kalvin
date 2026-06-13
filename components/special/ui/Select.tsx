'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  icon?: LucideIcon;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className={`
          block text-sm font-semibold ml-1
          ${error
            ? 'text-red-500'
            : isDark ? 'text-gray-300' : 'text-gray-700'
          }
        `}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {Icon && (
          <div className={`
            absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none
            ${isDark ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className={`
          absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10
          ${isDark ? 'text-gray-500' : 'text-gray-400'}
        `}>
          <ChevronDown className="w-4 h-4" />
        </div>

        <select
          ref={ref}
          className={`
            w-full appearance-none
            px-4 py-3.5 rounded-xl
            bg-transparent
            border transition-all duration-300
            focus:outline-none focus:ring-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : ''}
            ${error
              ? 'border-red-500'
              : isDark
                ? 'bg-[#0f1d24] border-[#23BE31]/20 text-white focus:border-[#23BE31] shadow-[0_4px_20px_-4px_rgba(35,190,49,0.1)]'
                : 'bg-white border-gray-200 text-gray-900 focus:border-[#23BE31] shadow-sm'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className={isDark ? 'bg-[#0f1d24] text-white' : 'bg-white text-gray-900'}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Animated bottom line */}
        <motion.div
          className={`
             absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden pointer-events-none
           `}
        >
          <div className={`
             h-full w-full transform origin-left scale-x-0 transition-transform duration-300 group-focus-within:scale-x-100
             ${error ? 'bg-red-500' : 'bg-[#23BE31]'}
           `} />
        </motion.div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 ml-1 font-medium flex items-center gap-1"
        >
          <span className="w-1 h-1 rounded-full bg-red-500" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;