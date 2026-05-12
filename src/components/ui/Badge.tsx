import React from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'special' | 'neutral' | 'gold' | 'outline' | 'destructive';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-green-600 border-green-100',
  danger: 'bg-red-50 text-red-600 border-red-100',
  destructive: 'bg-red-50 text-red-600 border-red-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
  special: 'bg-purple-50 text-purple-600 border-purple-100',
  neutral: 'bg-gray-50 text-gray-600 border-gray-100',
  gold: 'bg-amber-50 text-amber-700 border-amber-100',
  outline: 'bg-transparent border border-gray-200 text-gray-500',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider transition-none ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
};
