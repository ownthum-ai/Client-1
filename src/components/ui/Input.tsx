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
          "flex w-full transition-all duration-250 ease-out outline-none form-control",
          v2 ? "h-14 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 focus:bg-white focus:border-[var(--gold)]/30 focus:shadow-[0_0_0_4px_rgba(201,150,59,0.08)] px-6 text-[13px] font-bold tracking-tight placeholder:text-[var(--text3)] placeholder:font-bold placeholder:uppercase placeholder:tracking-[2px] placeholder:opacity-50" : 
               "h-[var(--form-h)] rounded-[var(--form-r)] border border-[var(--form-border)] bg-white px-[var(--form-px)] text-[var(--form-fs)] font-medium placeholder:text-[var(--text3)] placeholder:font-normal focus:border-[var(--form-border-focus)] focus:ring-4 focus:ring-[var(--form-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "bg-[var(--form-error-bg)] border-[var(--form-error-border)] focus:ring-[var(--form-error-border)]/10",
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
