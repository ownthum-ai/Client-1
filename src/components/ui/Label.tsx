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
          "text-[13px] font-bold text-gray-900 mb-2 block flex items-center gap-1 uppercase tracking-wider",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-600">*</span>}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };
