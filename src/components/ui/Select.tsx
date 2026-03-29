"use client";
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  v2?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, v2, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedLabel, setSelectedLabel] = useState<string>("");
    
    // Extract options from children
    const options = React.useMemo(() => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          return {
            value: child.props.value || child.props.children,
            label: child.props.children,
            ...child.props
          };
        }
        return null;
      })?.filter(Boolean) || [];
    }, [children]);

    // Update selected label when value or children change
    useEffect(() => {
      const currentValue = props.value || props.defaultValue;
      const option = options.find(o => o.value === currentValue);
      if (option) {
        setSelectedLabel(option.label);
      } else if (options.length > 0) {
        // Find if any option is marked as selected in props
        const selectedChild = options.find(o => o.selected);
        if (selectedChild) {
           setSelectedLabel(selectedChild.label);
        } else {
           setSelectedLabel(options[0].label);
        }
      }
    }, [props.value, props.defaultValue, options]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: any) => {
      setSelectedLabel(option.label);
      setIsOpen(false);
      
      // Manually trigger onChange if present
      if (props.onChange) {
        const event = {
          target: {
            name: props.name,
            value: option.value
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {/* Hidden native select for form integration */}
        <select
          ref={ref}
          className="hidden"
          {...props}
        >
          {children}
        </select>

        {/* Custom Trigger */}
        <div
          onClick={() => !props.disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full appearance-none transition-all outline-none cursor-pointer form-control",
            v2 ? "h-14 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 focus:border-[var(--gold)]/30 px-6 text-[13px] font-bold uppercase tracking-tight" :
               "h-[var(--form-h)] rounded-[var(--form-r)] border border-[var(--form-border)] bg-gray-50/50 px-[var(--form-px)] text-[var(--form-fs)] font-medium focus:border-[var(--form-border-focus)] focus:ring-4 focus:ring-[var(--form-ring)]",
            isOpen && v2 && "bg-white border-[var(--gold)]/50 shadow-[0_0_15px_rgba(0,0,0,0.05)]",
            error && "bg-[var(--form-error-bg)] border-[var(--form-error-border)]",
            className
          )}
        >
          <span className={cn(
            "truncate text-[15px] tracking-tight",
            !selectedLabel && "text-[var(--text3)]"
          )}>
            {selectedLabel || "Select..."}
          </span>
          <ChevronDownIcon className={cn(
            "w-4 h-4 transition-transform duration-200 text-[var(--text3)]",
            isOpen && "rotate-180 text-[var(--gold)]"
          )} />
        </div>

        {/* Custom Dropdown Popover */}
        {isOpen && (
          <div className={cn(
            "absolute left-0 right-0 z-[600] mt-2 overflow-hidden bg-white rounded-xl border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in-95 duration-200",
            v2 ? "py-2" : "py-1"
          )}>
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              {options.length > 0 ? (
                options.map((option: any, index: number) => {
                  const isSelected = (props.value || props.defaultValue) === option.value || (!props.value && !props.defaultValue && index === 0);
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "px-5 py-3 text-[14px] cursor-pointer transition-colors flex items-center justify-between group",
                        isSelected ? "bg-[var(--gold-lt)] text-[var(--gold-dk)] font-medium" : "text-[var(--text2)] hover:bg-[var(--bg)] hover:text-[var(--gold)]"
                      )}
                    >
                      <span className="tracking-tight">{option.label}</span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold)]"></div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-3 text-[12px] text-[var(--text3)] italic">No options available</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
