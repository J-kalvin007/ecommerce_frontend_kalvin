'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface SeparatorProps {
  className?: string;
  label?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'gradient' | 'ornament' | 'dashed';
  orientation?: 'horizontal' | 'vertical';
}

const Separator: React.FC<SeparatorProps> = ({
  className = '',
  label,
  icon: Icon,
  variant = 'default',
  orientation = 'horizontal'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseStyles = orientation === 'horizontal'
    ? 'flex items-center my-8'
    : 'flex flex-col items-center mx-8 h-auto';

  // Common styles
  const lineStyle = isDark ? 'border-gray-800' : 'border-gray-200';
  const textStyle = isDark ? 'text-gray-500 bg-[#071217]' : 'text-gray-400 bg-white';
  const iconBoxStyle = isDark ? 'bg-[#0f1d24] border-gray-800' : 'bg-white border-gray-100';

  if (orientation === 'vertical') {
    return (
      <div className={`relative ${baseStyles} ${className}`}>
        <div className={`flex-1 w-px bg-gradient-to-b from-transparent ${isDark ? 'via-gray-700' : 'via-gray-300'} to-transparent`} />
        {label && (
          <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 text-xs rounded-full border ${isDark ? 'bg-[#071217] border-gray-800' : 'bg-white border-gray-200'}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`relative ${baseStyles} ${className}`}>
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#23BE31] to-transparent opacity-50" />
        {label && (
          <div className="mx-4 relative group">
            <div className="absolute inset-0 bg-[#23BE31] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <span className="relative px-4 py-1.5 text-xs font-bold text-[#23BE31] uppercase tracking-wider border border-[#23BE31]/30 rounded-full bg-[#23BE31]/5">
              {label}
            </span>
          </div>
        )}
        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#23BE31] to-transparent opacity-50" />
      </div>
    );
  }

  if (variant === 'ornament') {
    return (
      <div className={`relative ${baseStyles} ${className}`}>
        <div className={`flex-grow h-px bg-gradient-to-r from-transparent ${isDark ? 'via-gray-700' : 'via-gray-300'} to-transparent`} />
        <div className="mx-4 text-[#23BE31]">
          {Icon ? <Icon className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-[#23BE31] shadow-[0_0_10px_#23BE31]" />}
        </div>
        <div className={`flex-grow h-px bg-gradient-to-r from-transparent ${isDark ? 'via-gray-700' : 'via-gray-300'} to-transparent`} />
      </div>
    );
  }

  // Default / Dashed
  return (
    <div className={`${baseStyles} ${className}`}>
      <div className={`flex-grow border-t ${variant === 'dashed' ? 'border-dashed' : ''} ${lineStyle}`} />

      {(label || Icon) && (
        <div className="mx-4 flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />}
          {label && (
            <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {label}
            </span>
          )}
        </div>
      )}

      <div className={`flex-grow border-t ${variant === 'dashed' ? 'border-dashed' : ''} ${lineStyle}`} />
    </div>
  );
};

export default Separator;