import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Asset {
  name: string;
  nameAr: string;
  health: number;
  predictedFailure?: string;
  lastMaintenance: string;
}

const assets: Asset[] = [
  { 
    name: 'Solar Panel Array A1', 
    nameAr: 'مجموعة الألواح الشمسية A1', 
    health: 98, 
    lastMaintenance: '2025-12-15' 
  },
  { 
    name: 'Transformer T1', 
    nameAr: 'المحول T1', 
    health: 45, 
    predictedFailure: '15 days',
    lastMaintenance: '2025-09-20' 
  },
  { 
    name: 'Inverter Bank INV-1', 
    nameAr: 'مجموعة العواكس INV-1', 
    health: 87, 
    lastMaintenance: '2025-11-28' 
  },
  { 
    name: 'Cooling Unit CU-03', 
    nameAr: 'وحدة التبريد CU-03', 
    health: 72, 
    predictedFailure: '45 days',
    lastMaintenance: '2025-10-05' 
  },
  { 
    name: 'Battery Storage BS-1', 
    nameAr: 'تخزين البطارية BS-1', 
    health: 92, 
    lastMaintenance: '2025-12-01' 
  },
];

const getHealthColor = (health: number) => {
  if (health >= 80) return 'bg-status-normal';
  if (health >= 60) return 'bg-status-warning';
  return 'bg-status-critical';
};

const getHealthTextColor = (health: number) => {
  if (health >= 80) return 'text-status-normal';
  if (health >= 60) return 'text-status-warning';
  return 'text-status-critical';
};

export const AssetHealthPanel: React.FC = () => {
  const { t, language } = useLanguage();
  
  return (
    <div className="panel-industrial h-full flex flex-col">
      <div className="panel-header">
        <h3 className="font-semibold text-foreground">{t('kpi.assetHealth')}</h3>
        <span className="text-xs text-muted-foreground">AI Predictive Analysis</span>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-industrial">
        {assets.map((asset, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {language === 'ar' ? asset.nameAr : asset.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    Last: {asset.lastMaintenance}
                  </span>
                  {asset.predictedFailure && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      asset.health < 60 
                        ? 'bg-status-critical/20 text-status-critical' 
                        : 'bg-status-warning/20 text-status-warning'
                    )}>
                      ⚠️ Failure in ~{asset.predictedFailure}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn(
                'text-lg font-bold tabular-nums',
                getHealthTextColor(asset.health)
              )}>
                {asset.health}%
              </span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all', getHealthColor(asset.health))}
                style={{ width: `${asset.health}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
