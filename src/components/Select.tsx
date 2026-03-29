"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ options, value, onChange, label, placeholder, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[1.5px] px-1 opacity-70">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 bg-[#f8fafc] border-2 border-transparent rounded-xl transition-all outline-none text-[13px] font-semibold text-[#0f172a] hover:bg-[#f1f5f9] ${
          isOpen ? 'ring-[#3b82f6]/10 border-[#3b82f6]/30 bg-white shadow-lg' : ''
        }`}
      >
        <span className={!value ? "text-[#94a3b8]/40" : ""}>
          {selectedOption ? selectedOption.label : (placeholder || "Select option...")}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-[#64748b] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#3b82f6]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[110] left-0 right-0 mt-2 bg-white border border-[#f1f5f9] rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-bold transition-all ${
                  value === option.value 
                    ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-600/20' 
                    : 'text-[#0f172a] hover:bg-blue-50 hover:text-[#3b82f6] font-bold'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
