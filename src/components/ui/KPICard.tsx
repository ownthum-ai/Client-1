"use client";
import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { CountUp } from '@/components/lightswind/count-up';
import { BorderBeam } from '@/components/lightswind/border-beam';
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
  icon?: React.ElementType;
  variant?: 'default' | 'premium';
}

export const KPICard = ({
  label,
  value,
  subtext,
  trend,
  color = 'gold',
  icon: Icon,
  variant = 'default'
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
    up: 'bg-[var(--green-lt)] text-[var(--green)]',
    down: 'bg-[var(--red-lt)] text-[var(--red)]',
    neutral: 'bg-[var(--amber-lt)] text-[var(--amber)]',
  };

  const getTargetColor = () => {
    if (typeof color === 'string' && colorMap[color]) return colorMap[color];
    return 'before:bg-white/20';
  };

  // Helper to parse numeric part for CountUp
  const parseValue = (val: any) => {
    if (typeof val === 'number') return { num: val, prefix: '', suffix: '' };
    if (typeof val !== 'string') return null;
    
    const numMatch = val.match(/([\d,]+(\.\d+)?)/);
    if (!numMatch) return { num: 0, prefix: '', suffix: val };
    const cleanNum = numMatch[0].replace(/,/g, '');
    const num = parseFloat(cleanNum);
    const prefix = val.substring(0, numMatch.index);
    const suffix = val.substring((numMatch.index ?? 0) + numMatch[0].length);
    return { num, prefix, suffix };
  };

  const parsed = parseValue(value);

  return (
    <div className={cn(
      "bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-lg)] p-[18px_20px] shadow-[var(--sh)] transition-all duration-300 ease-out cursor-default relative overflow-hidden group",
      "hover:shadow-[var(--sh-md)] hover:-translate-y-0.5",
      "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3.5px] before:rounded-[var(--r-lg)_var(--r-lg)_0_0]",
      getTargetColor()
    )}>
      <BorderBeam 
        size={100} 
        duration={4} 
        colorFrom="var(--gold-lt)" 
        colorTo="transparent" 
        className="opacity-0 group-hover:opacity-30 transition-opacity duration-500"
      />
      
      <div className="flex justify-between items-start mb-[10px] relative z-10">
        <div className="text-[10px] text-[var(--text2)] uppercase tracking-[2px] font-bold leading-none">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-[var(--text3)] opacity-40 transition-all duration-300 group-hover:opacity-70 group-hover:scale-110" />}
      </div>
      
      <div className="text-[26px] font-bold font-sans kpi-value text-[var(--text)] leading-none tracking-[-0.03em] flex items-baseline gap-0.5 relative z-10">
        {parsed ? (
          <>
            {parsed.prefix && <span className="text-[0.6em] opacity-60 font-medium">{parsed.prefix}</span>}
            <CountUp 
              value={parsed.num} 
              duration={2} 
              decimals={parsed.num % 1 !== 0 ? 2 : 0}
            />
            {parsed.suffix && <span className="text-[0.5em] opacity-60 font-medium ml-0.5">{parsed.suffix}</span>}
          </>
        ) : (
          value
        )}
      </div>

      {subtext && <div className="text-[12px] text-[var(--text3)] mt-2 font-medium relative z-10">{subtext}</div>}

      
      {trend && (
        <div className={cn(
          "inline-flex items-center gap-[4px] mt-[10px] text-[12px] font-medium p-[2px_8px] rounded-[5px] transition-all duration-200 relative z-10",
          typeof trend === 'string' ? 'bg-[var(--bg)] text-[var(--text3)]' : trendMap[trend.type]
        )}>
          {typeof trend !== 'string' && (
            <>
              {trend.type === 'up' && <ChevronUpIcon className="w-3 h-3" />}
              {trend.type === 'down' && <ChevronDownIcon className="w-2.5 h-2.5" />}
              {trend.type === 'neutral' && <MinusIcon className="w-3 h-3" />}
            </>
          )}
          {typeof trend === 'string' ? trend : trend.value}
        </div>
      )}
    </div>
  );
};

