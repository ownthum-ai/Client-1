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
  const baseStyles = "inline-flex items-center justify-center gap-[6px] transition-all duration-250 ease-out whitespace-nowrap font-bold antialiased active:scale-[0.97] hover:shadow-md";

  const variantStyles = {
    primary: "bg-[#C9963B] text-white border-none hover:bg-[#B8872F] hover:shadow-lg hover:shadow-gold-500/20 shadow-sm",
    secondary: "bg-white text-[#1A5FA8] border border-[#BFDBFE] hover:bg-[#F0F7FF] hover:border-[#93C5FD] hover:shadow-md",
    danger: "bg-white text-[#C42B2B] border border-[#FCA5A5] hover:bg-[#FFF5F5] hover:border-[#F87171] hover:shadow-md",
    success: "bg-[#E2F4EC] text-[#1A7A45] border border-[#BBF7D0] hover:bg-[#D4F0E2] hover:border-[#86EFAC] hover:shadow-md",
    ghost: "bg-[#F4F4F2] text-[#555] border border-[#D4D4D8] hover:bg-[#E8E8E6] hover:border-[#C4C4C8] hover:shadow-sm",
    pin: "bg-[#EEE9FC] text-[#5B34C4] border border-[#DDD6FE] hover:bg-[#E5DEFA] hover:border-[#C4B5FD] hover:shadow-md"
  };

  const sizeStyles = {
    lg: "h-[40px] px-5 text-[14px] rounded-[8px]",
    default: "h-[36px] px-4 text-[13px] rounded-[7px]",
    sm: "h-[32px] px-3.5 text-[12px] rounded-[6px]",
    inline: "h-[28px] px-2.5 text-[11px] rounded-[5px]",
    icon: "w-[36px] h-[36px] p-0 rounded-[8px]"
  };

  const fontStyles = "font-sans";

  return (
    <button
      className={`${baseStyles} ${fontStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>}
      {children}
    </button>
  );
};
