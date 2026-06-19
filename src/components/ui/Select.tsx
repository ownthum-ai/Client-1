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

    useEffect(() => {
      const currentValue = props.value || props.defaultValue;
      const option = options.find(o => o.value === currentValue);
      if (option) {
        setSelectedLabel(option.label);
      } else if (options.length > 0) {
        const selectedChild = options.find(o => o.selected);
        if (selectedChild) {
           setSelectedLabel(selectedChild.label);
        } else {
           setSelectedLabel(options[0].label);
        }
      }
    }, [props.value, props.defaultValue, options]);

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
        <select
          ref={ref}
          className="hidden"
          {...props}
        >
          {children}
        </select>

        <div
          onClick={() => !props.disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full appearance-none transition-none outline-none cursor-pointer font-bold",
            v2 ? "h-[40px] rounded-md bg-white border border-[var(--border)] px-4 text-[13px] tracking-tight shadow-sm" :
               "h-[var(--form-h)] rounded-[var(--form-r)] border border-[var(--form-border)] bg-white px-[var(--form-px)] text-[var(--form-fs)] focus:border-gray-900",
            isOpen && "border-gray-900 bg-white shadow-sm",
            error && "bg-red-50 border-red-500",
            props.disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <span className={cn(
            "truncate",
            !selectedLabel && "text-[var(--text3)]"
          )}>
            {selectedLabel || "Select..."}
          </span>
          <ChevronDownIcon className={cn(
            "w-4 h-4 text-[var(--text3)]",
            isOpen && "rotate-180 text-gray-900"
          )} />
        </div>

        {isOpen && (
          <div className={cn(
            "absolute left-0 right-0 z-[600] mt-1 overflow-hidden bg-white rounded-md border border-gray-900 shadow-xl",
            v2 ? "py-1" : "py-0.5"
          )}>
            <div className="max-h-[220px] overflow-y-auto">
              {options.length > 0 ? (
                options.map((option: any, index: number) => {
                  const isSelected = (props.value || props.defaultValue) === option.value;
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "px-4 py-2.5 text-[13px] cursor-pointer font-bold flex items-center justify-between",
                        isSelected ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span>{option.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-2.5 text-[12px] text-[var(--text3)] italic">No options available</div>
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
