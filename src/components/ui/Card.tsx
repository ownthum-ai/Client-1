"use client";
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
  const defaultClasses = "rounded-md p-5 shadow-sm border border-[var(--border)] bg-white";

  return (
    <div
      onClick={onClick}
      className={`${defaultClasses} ${
        onClick ? 'cursor-pointer' : ''
      } ${className} transition-none`}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-6 gap-2 text-left">
          <div className="text-left">
            {title && <h3 className="text-[14px] font-bold text-[var(--text)] uppercase tracking-wider">{title}</h3>}
            {subtitle && <p className="text-[11px] text-[var(--text3)] mt-1 font-bold uppercase tracking-[1px] opacity-60">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-1.5 items-center shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
