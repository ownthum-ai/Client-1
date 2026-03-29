import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/outline';

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
    return 'before:bg-white/20'; // Default fallback for custom string colors
  };

  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-lg)] p-[18px_20px] shadow-[var(--sh)] transition-all duration-200 cursor-default relative overflow-hidden hover:shadow-[var(--sh-md)] hover:-translate-y-px before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3.5px] before:rounded-[var(--r-lg)_var(--r-lg)_0_0] ${getTargetColor()}`}>
      <div className="flex justify-between items-start mb-[10px]">
        <div className="text-[10px] text-[var(--text2)] uppercase tracking-[2px] font-bold leading-none">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-[var(--text3)] opacity-40" />}
      </div>
      <div className="text-[26px] font-bold font-sans kpi-value text-[var(--text)] leading-none tracking-[-0.03em]">{value}</div>
      {subtext && <div className="text-[12px] text-[var(--text3)] mt-2 font-medium">{subtext}</div>}
      {trend && (
        <div className={`inline-flex items-center gap-[4px] mt-[10px] text-[12px] font-medium p-[2px_8px] rounded-[5px] ${typeof trend === 'string' ? 'bg-[var(--bg)] text-[var(--text3)]' : trendMap[trend.type]
          }`}>
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
