"use client";
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'pin';
  size?: 'lg' | 'default' | 'sm' | 'inline' | 'icon';
  icon?: React.ReactNode;
  v2?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  icon,
  v2 = false,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-[8px] whitespace-nowrap font-bold antialiased transition-none active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-gray-900 text-white border-2 border-gray-900 shadow-md hover:bg-black",
    secondary: "bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:bg-gray-50",
    danger: "bg-red-600 text-white border-2 border-red-600 shadow-md",
    success: "bg-green-600 text-white border-2 border-green-600 shadow-md",
    ghost: "bg-gray-50 text-gray-600 border-2 border-gray-100 shadow-sm",
    pin: "bg-amber-500 text-white border-2 border-amber-500 shadow-md"
  };

  const sizeStyles = {
    lg: "h-[60px] px-8 text-[16px] rounded-[14px]",
    default: "h-[52px] px-6 text-[15px] rounded-[12px]",
    sm: "h-[44px] px-5 text-[14px] rounded-[10px]",
    inline: "h-[36px] px-4 text-[12px] rounded-[8px]",
    icon: "w-[52px] h-[52px] p-0 rounded-[12px]"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
