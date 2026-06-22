'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  icon?: LucideIcon;
  variant?: 'default' | 'gradient' | 'badge';
  size?: 'sm' | 'md' | 'lg';
}

const Label: React.FC<LabelProps> = ({
  children,
  className = '',
  required = false,
  icon: Icon,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const variantClasses = {
    default: isDark ? 'text-gray-300' : 'text-gray-700',
    gradient: 'text-transparent bg-clip-text bg-gradient-to-r from-[#23BE31] to-[#1fa92c]',
    badge: `
      inline-flex items-center px-3 py-1 rounded-full 
      ${isDark
        ? 'bg-[#23BE31]/10 text-[#82e482] border-[#23BE31]/20'
        : 'bg-[#23BE31]/5 text-[#1fa92c] border-[#23BE31]/10'
      } 
      border
    `,
  };

  return (
    <label
      className={`
        ${sizeClasses[size]} 
        font-semibold tracking-wide
        transition-colors duration-300
        ${variantClasses[variant]}
        ${variant === 'badge' ? '' : 'mb-2 block'}
        ${Icon ? 'flex items-center gap-2' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-[#23BE31]" />}
      {children}
      {required && (
        <span className={`
          ml-1 text-red-500
          ${variant === 'gradient' ? 'animate-pulse' : ''}
        `}>*</span>
      )}
    </label>
  );
};

export default Label;