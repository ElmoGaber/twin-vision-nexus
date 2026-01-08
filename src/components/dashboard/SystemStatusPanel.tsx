import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, AlertTriangle, XCircle, WifiOff } from 'lucide-react';

interface SystemItem {
  name: string;
  nameAr: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  value?: string;
}

const systems: SystemItem[] = [
  { name: 'Power Distribution', nameAr: 'توزيع الطاقة', status: 'normal', value: '98.5%' },
  { name: 'Solar Array Zone A', nameAr: 'منطقة الألواح الشمسية أ', status: 'normal', value: '100%' },
  { name: 'Solar Array Zone B', nameAr: 'منطقة الألواح الشمسية ب', status: 'warning', value: '87%' },
  { name: 'Cooling System', nameAr: 'نظام التبريد', status: 'normal', value: '94%' },
  { name: 'Battery Storage', nameAr: 'تخزين البطاريات', status: 'normal', value: '78%' },
  { name: 'Grid Connection', nameAr: 'اتصال الشبكة', status: 'normal', value: 'Active' },
  { name: 'Transformer T1', nameAr: 'المحول T1', status: 'critical', value: 'Alert' },
  { name: 'Weather Station', nameAr: 'محطة الطقس', status: 'offline', value: 'N/A' },
];

export const SystemStatusPanel: React.FC = () => {
  const { t, language } = useLanguage();
  
  const statusIcons = {
    normal: <CheckCircle className="w-4 h-4 text-status-normal" />,
    warning: <AlertTriangle className="w-4 h-4 text-status-warning" />,
    critical: <XCircle className="w-4 h-4 text-status-critical status-blink-critical" />,
    offline: <WifiOff className="w-4 h-4 text-status-offline" />,
  };
  
  const statusLabels = {
    normal: t('dashboard.normal'),
    warning: t('dashboard.warning'),
    critical: t('dashboard.critical'),
    offline: t('dashboard.offline'),
  };
  
  const statusBg = {
    normal: 'bg-status-normal/10',
    warning: 'bg-status-warning/10',
    critical: 'bg-status-critical/10',
    offline: 'bg-status-offline/10',
  };
  
  // Count statuses
  const counts = systems.reduce((acc, sys) => {
    acc[sys.status] = (acc[sys.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="panel-industrial h-full">
      <div className="panel-header">
        <h3 className="font-semibold text-foreground">{t('dashboard.systemStatus')}</h3>
        <div className="flex items-center gap-3">
          {(['normal', 'warning', 'critical', 'offline'] as const).map((status) => (
            <div key={status} className="flex items-center gap-1">
              {statusIcons[status]}
              <span className="text-xs font-medium text-muted-foreground">{counts[status] || 0}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto scrollbar-industrial">
        {systems.map((system, index) => (
          <div 
            key={index}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border border-border/50 transition-all hover:border-border',
              statusBg[system.status]
            )}
          >
            <div className="flex items-center gap-3">
              {statusIcons[system.status]}
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'ar' ? system.nameAr : system.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {statusLabels[system.status]}
                </p>
              </div>
            </div>
            <span className={cn(
              'text-sm font-mono font-medium',
              system.status === 'normal' && 'text-status-normal',
              system.status === 'warning' && 'text-status-warning',
              system.status === 'critical' && 'text-status-critical',
              system.status === 'offline' && 'text-status-offline',
            )}>
              {system.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
