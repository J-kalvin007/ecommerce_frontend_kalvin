'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outline' | 'gradient';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variants = {
    default: isDark
      ? 'bg-[#0f1d24] border border-[#23BE31]/10 shadow-xl'
      : 'bg-white border border-gray-100 shadow-xl',
    glass: `
      backdrop-blur-xl border
      ${isDark
        ? 'bg-[#0f1d24]/60 border-[#23BE31]/10'
        : 'bg-white/70 border-white/40'
      }
    `,
    outline: `
      bg-transparent border-2
      ${isDark ? 'border-[#23BE31]/20' : 'border-gray-200'}
    `,
    gradient: `
      bg-gradient-to-br
      ${isDark
        ? 'from-[#0f1d24] to-[#071217] border border-[#23BE31]/10'
        : 'from-white to-gray-50 border border-gray-100'
      }
    `
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, scale: 1.01 } : undefined}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-2xl
        ${variants[variant]}
        ${className}
      `}
      {...props as any}
    >
      {/* Decorative gradient blob for glass/dark mode */}
      {isDark && (variant === 'default' || variant === 'glass') && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#23BE31]/5 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mb-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <h2 className={`
      text-2xl font-bold
      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
      ${className}
    `} {...props}>
      {children}
    </h2>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <p className={`
      mt-2 text-sm
      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
      ${className}
    `} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mt-6 pt-6 border-t ${className.includes('border-') ? '' : 'dark:border-[#23BE31]/10 border-gray-100'} ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
