'use client';

import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'outline' | 'ghost' | 'glass' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  pulse?: boolean;
  rounded?: 'default' | 'full' | 'xl';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  pulse = false,
  rounded = 'default',
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold
    relative overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    outline-none
  `;

  const sizeClasses = {
    xs: 'h-8 px-3 text-xs gap-1.5',
    sm: 'h-10 px-4 text-sm gap-2',
    md: 'h-12 px-6 text-base gap-2.5',
    lg: 'h-14 px-8 text-lg gap-3',
    xl: 'h-16 px-10 text-xl gap-3.5',
    icon: 'h-10 w-10 p-2',
  };

  const roundedClasses = {
    default: 'rounded-xl',
    full: 'rounded-full',
    xl: 'rounded-2xl',
  };

  const variantClasses = {
    default: `
      bg-gradient-to-r from-[#23BE31] to-[#1fa92c]
      text-white
      shadow-[0_0_20px_-5px_rgba(35,190,49,0.3)]
      hover:shadow-[0_0_25px_-5px_rgba(35,190,49,0.5)]
      border border-transparent
    `,
    gradient: `
      bg-gradient-to-r from-[#23BE31] via-[#1fa92c] to-[#071217]
      bg-[length:200%_auto]
      text-white
      shadow-lg
      animate-gradient
    `,
    outline: `
      bg-transparent
      border-2 border-[#23BE31]
      text-[#23BE31]
      hover:bg-[#23BE31]/10
    `,
    ghost: `
      bg-transparent
      text-[#23BE31]
      hover:bg-[#23BE31]/10
    `,
    glass: `
      bg-white/10 dark:bg-[#071217]/40
      backdrop-blur-md
      border border-white/20 dark:border-[#23BE31]/20
      text-white
      hover:bg-white/20 dark:hover:bg-[#23BE31]/10
      shadow-lg
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-600
      text-white
      shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]
      hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.5)]
    `,
    link: `
      bg-transparent
      text-[#23BE31]
      underline-offset-4
      hover:underline
      shadow-none
      border-none
    `
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props as any}
    >
      {/* Glow Effect for Primary Variants */}
      {(variant === 'default' || variant === 'gradient') && !disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%', skewX: -15 }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement...</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
              {children}
              {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
            </motion.div>
          )}
        </AnimatePresence>
      </span>

      {/* Pulse Effect */}
      {pulse && (
        <span className="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
