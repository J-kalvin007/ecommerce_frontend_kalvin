'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled }) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <label className={`
      flex items-center gap-3 relative cursor-pointer group
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />

        <motion.div
          animate={{
            backgroundColor: checked ? '#23BE31' : 'transparent',
            borderColor: checked ? '#23BE31' : isDark ? '#4b5563' : '#d1d5db',
            scale: checked ? 1 : 1
          }}
          transition={{ duration: 0.2 }}
          className={`
            w-5 h-5 rounded-md border-2
            flex items-center justify-center
            ${!checked && (isDark ? 'group-hover:border-[#23BE31]/50' : 'group-hover:border-[#23BE31]/50')}
            transition-colors
          `}
        >
          <motion.div
            initial={false}
            animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Check strokeWidth={3} className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>

        {/* Glow effect on checked */}
        {checked && (
          <motion.div
            layoutId="checkbox-glow"
            className="absolute inset-0 -m-1 bg-[#23BE31]/20 rounded-lg blur-sm -z-10"
          />
        )}
      </div>

      {label && (
        <span className={`
          text-sm font-medium select-none transition-colors
          ${isDark ? 'text-gray-300' : 'text-gray-700'}
          ${checked ? (isDark ? 'text-white' : 'text-gray-900') : ''}
        `}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;