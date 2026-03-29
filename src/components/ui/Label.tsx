import { cn } from "@/lib/utils";
import React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-[var(--form-label-fs)] font-[var(--form-label-fw)] text-[var(--text)] mb-[6px] block flex items-center gap-1",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-[var(--form-error-border)]">*</span>}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };
