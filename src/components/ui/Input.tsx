import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  v2?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, v2, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full outline-none font-bold transition-none",
          v2 ? "h-[40px] rounded-md bg-white border border-[var(--border)] px-4 text-[13px] tracking-tight placeholder:text-[var(--text3)] placeholder:opacity-50" : 
               "h-[var(--form-h)] rounded-[var(--form-r)] border border-[var(--form-border)] bg-white px-[var(--form-px)] text-[var(--form-fs)]",
          "disabled:cursor-not-allowed disabled:opacity-50 focus:border-gray-900 focus:bg-white shadow-sm",
          error && "bg-red-50 border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
