'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const variantStyles = {
    default: 'bg-[#23BE31] text-white hover:bg-[#1fa32a] active:scale-95',
    outline: 'border border-[#23BE31] text-[#23BE31] hover:bg-[#23BE31]/5 active:scale-95',
    ghost: 'text-[#23BE31] hover:bg-[#23BE31]/5 active:scale-95'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center font-bold rounded-full 
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#23BE31]/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
