"use client";
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CustomToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  activeColor?: string;
}

export function CustomToggle({ enabled, onChange, label, description, icon, iconBg, activeColor }: CustomToggleProps) {
  return (
    <div className="flex items-center justify-between p-[12px_14px] bg-[var(--bg)] border border-[var(--border)] rounded-xl transition-all hover:border-[var(--border2)] group">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn("w-[38px] h-[38px] rounded-full flex items-center justify-center text-[18px] shrink-0 shadow-sm transition-transform group-hover:scale-110", iconBg || "bg-white")}>
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          {label && <span className="text-[13.5px] font-bold text-[var(--text)] leading-tight">{label}</span>}
          {description && <span className="text-[11.5px] text-[var(--text3)] mt-[2px]">{description}</span>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
          enabled ? (activeColor || "bg-[#3b82f6]") : "bg-[#E5E4E0]"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
