import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  status = 'normal',
  className,
}) => {
  const statusColors = {
    normal: 'border-status-normal/30 bg-status-normal/5',
    warning: 'border-status-warning/30 bg-status-warning/5',
    critical: 'border-status-critical/30 bg-status-critical/5',
  };
  
  const statusIndicator = {
    normal: 'bg-status-normal',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical status-blink-critical',
  };
  
  const trendIcons = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    stable: <Minus className="w-4 h-4" />,
  };
  
  const trendColors = {
    up: 'text-status-normal',
    down: 'text-status-critical',
    stable: 'text-muted-foreground',
  };
  
  return (
    <div className={cn(
      'panel-industrial p-4 transition-all duration-200 hover:shadow-lg',
      statusColors[status],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', statusIndicator[status])} />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground tabular-nums">{value}</span>
          {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
        </div>
        
        {trend && (
          <div className={cn('flex items-center gap-1', trendColors[trend])}>
            {trendIcons[trend]}
            {trendValue && <span className="text-sm font-medium">{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
