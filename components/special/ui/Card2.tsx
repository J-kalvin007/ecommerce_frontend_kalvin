

'use client';

import { useTheme } from "@/hooks/useTheme";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`p-6 rounded-xl border ${theme === 'dark'
          ? 'border-gray-800 bg-gray-900/50'
          : 'border-gray-200 bg-white'
        } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card