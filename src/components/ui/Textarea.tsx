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
          v2 ? "min-h-[140px] rounded-2xl bg-white border border-gray-100 hover:border-gray-200 focus:bg-white focus:border-[var(--gold)]/30 p-6 text-[13px] font-bold leading-relaxed placeholder:text-[var(--text3)] placeholder:font-bold placeholder:uppercase placeholder:tracking-[2px] placeholder:opacity-50" : 
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
