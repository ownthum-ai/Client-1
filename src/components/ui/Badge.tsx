import React from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'special' | 'neutral' | 'gold' | 'outline' | 'destructive';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-[var(--green-lt)] text-[var(--green)] before:bg-[var(--green)]',
  danger: 'bg-[var(--red-lt)] text-[var(--red)] before:bg-[var(--red)]',
  destructive: 'bg-[var(--red-lt)] text-[var(--red)] before:bg-[var(--red)]',
  warning: 'bg-[var(--amber-lt)] text-[var(--amber)] before:bg-[var(--amber)]',
  info: 'bg-[var(--blue-lt)] text-[var(--blue)] before:bg-[var(--blue)]',
  special: 'bg-[var(--purple-lt)] text-[var(--purple)] before:bg-[var(--purple)]',
  neutral: 'bg-[#F4F4F2] text-[#666] before:bg-[#AAA]',
  gold: 'bg-[var(--gold-lt)] text-[var(--gold-dk)] before:bg-[var(--gold)]',
  outline: 'bg-transparent border border-white/10 text-white/40 before:hidden',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 p-[3px_9px] rounded-[5px] text-[11px] font-medium whitespace-nowrap before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:shrink-0 ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
};
