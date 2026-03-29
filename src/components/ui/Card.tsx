import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'premium';
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, actions, onClick, variant = 'default' }) => {
  const premiumClasses = "rounded-[32px] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-[var(--border)] bg-white";
  const defaultClasses = "rounded-[var(--r-lg)] p-5 shadow-[var(--sh)] border-[var(--border)] bg-[var(--card)] hover:shadow-[var(--sh-md)]";

  return (
    <div
      onClick={onClick}
      className={`${variant === 'premium' ? premiumClasses : defaultClasses} transition-all duration-300 mb-3.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            {title && <h3 className="text-[13.5px] font-semibold text-[var(--text)] leading-none">{title}</h3>}
            {subtitle && <p className="text-[11.5px] text-[var(--text3)] mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-1.5 items-center shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
