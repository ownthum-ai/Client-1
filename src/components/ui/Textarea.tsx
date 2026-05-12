import { cn } from "@/lib/utils";
import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  v2?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, v2, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full transition-all outline-none resize-none form-control",
          v2 ? "min-h-[140px] rounded-2xl bg-white border-2 border-[var(--border)] focus:bg-white focus:border-gray-900 p-6 text-[15px] font-bold leading-relaxed tracking-tight placeholder:text-[var(--text3)] placeholder:font-bold placeholder:opacity-50 shadow-md" : 
               "min-h-[80px] rounded-[var(--form-r)] border border-[var(--form-border)] bg-white px-[var(--form-px)] py-3 text-[var(--form-fs)] font-medium placeholder:text-[var(--text3)] placeholder:font-normal focus:border-[var(--form-border-focus)] focus:ring-4 focus:ring-[var(--form-ring)]",
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
Textarea.displayName = "Textarea";

export { Textarea };
