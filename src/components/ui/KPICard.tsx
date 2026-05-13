"use client";
import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  trend?: string | {
    value: string;
    type: 'up' | 'down' | 'neutral';
  };
  color?: string | 'gold' | 'green' | 'red' | 'blue' | 'amber' | 'purple';
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'premium';
  onClick?: () => void;
  isCurrency?: boolean;
}

export const KPICard = ({
  label,
  value,
  subtext,
  trend,
  color = 'gold',
  icon: Icon,
  variant = 'default',
  onClick,
  isCurrency = false
}: KPICardProps) => {
  const colorMap: Record<string, string> = {
    gold: 'before:bg-[var(--gold)]',
    green: 'before:bg-[var(--green)]',
    red: 'before:bg-[var(--red)]',
    blue: 'before:bg-[var(--blue)]',
    amber: 'before:bg-[var(--amber)]',
    purple: 'before:bg-[var(--purple)]',
  };

  const trendMap = {
    up: 'bg-green-50 text-green-600 border-green-100',
    down: 'bg-red-50 text-red-600 border-red-100',
    neutral: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const getTargetColor = () => {
    if (typeof color === 'string' && colorMap[color]) return colorMap[color];
    return 'before:bg-gray-200';
  };

  const formatValue = (val: any) => {
    if (typeof val === 'number') {
      if (isCurrency) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(val);
      }
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
      "bg-white border border-[var(--border)] rounded-[var(--r-lg)] p-[18px_20px] shadow-sm relative overflow-hidden text-left",
      onClick ? "cursor-pointer hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]" : "cursor-default",
      "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3.5px]",
      getTargetColor()
    )}>
      
      <div className="flex justify-between items-start mb-2 relative z-10 text-left">
        <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-gray-300" />}
      </div>
      
      <div className="text-[24px] font-bold text-[var(--text)] leading-none tracking-tight flex items-baseline gap-1 relative z-10 font-price">
        {formatValue(value)}
      </div>

      {subtext && <div className="text-[11px] text-[var(--text3)] mt-2 font-bold relative z-10 uppercase tracking-wider">{subtext}</div>}

      {trend && (
        <div className={cn(
          "inline-flex items-center gap-1 mt-3 text-[10px] font-bold px-2 py-1 rounded-md border relative z-10 uppercase tracking-wider",
          typeof trend === 'string' ? 'bg-gray-50 text-gray-500 border-gray-100' : trendMap[trend.type]
        )}>
          {typeof trend !== 'string' && (
            <>
              {trend.type === 'up' && <ChevronUpIcon className="w-2.5 h-2.5" />}
              {trend.type === 'down' && <ChevronDownIcon className="w-2.5 h-2.5" />}
              {trend.type === 'neutral' && <MinusIcon className="w-2.5 h-2.5" />}
            </>
          )}
          {typeof trend === 'string' ? trend : trend.value}
        </div>
      )}
    </div>
  );
};
