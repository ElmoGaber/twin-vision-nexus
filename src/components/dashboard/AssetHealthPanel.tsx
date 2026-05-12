import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Wrench } from 'lucide-react';

interface Asset {
  name: string;
  nameAr: string;
  health: number;
  predictedFailure?: string;
  lastMaintenance: string;
  status?: string;
  efficiency?: number;
  temperature?: number;
}

const assets: Asset[] = [
  { 
    name: 'Solar Panel Array A1', 
    nameAr: 'مجموعة الألواح الشمسية A1', 
    health: 98,
    status: 'Normal',
    efficiency: 94.2,
    temperature: 32,
    lastMaintenance: '2025-12-15' 
  },
  { 
    name: 'Transformer T1', 
    nameAr: 'المحول T1', 
    health: 45, 
    status: 'Warning',
    efficiency: 87.5,
    temperature: 78,
    predictedFailure: '15 days',
    lastMaintenance: '2025-09-20' 
  },
  { 
    name: 'Inverter Bank INV-1', 
    nameAr: 'مجموعة العواكس INV-1', 
    health: 87,
    status: 'Normal',
    efficiency: 91.3,
    temperature: 45,
    lastMaintenance: '2025-11-28' 
  },
  { 
    name: 'Cooling Unit CU-03', 
    nameAr: 'وحدة التبريد CU-03', 
    health: 72,
    status: 'Warning',
    efficiency: 78.9,
    temperature: 52,
    predictedFailure: '45 days',
    lastMaintenance: '2025-10-05' 
  },
  { 
    name: 'Battery Storage BS-1', 
    nameAr: 'تخزين البطارية BS-1', 
    health: 92,
    status: 'Normal',
    efficiency: 96.1,
    temperature: 28,
    lastMaintenance: '2025-12-01' 
  },
];

interface AssetDetailsModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ asset, isOpen, onClose, language }) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle>
            {language === 'ar' ? 'تفاصيل الأصل' : 'Asset Details'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الاسم' : 'Name'}</p>
              <p className="text-lg font-bold text-foreground">
                {language === 'ar' ? asset.nameAr : asset.name}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</p>
              <Badge className={
                asset.health >= 80 ? 'bg-status-normal' : 
                asset.health >= 60 ? 'bg-status-warning' : 
                'bg-status-critical'
              }>
                {asset.status || (asset.health >= 80 ? 'Normal' : asset.health >= 60 ? 'Warning' : 'Critical')}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الصحة' : 'Health'}</p>
              <p className="text-2xl font-bold text-foreground">{asset.health}%</p>
            </div>
            
            {asset.efficiency && (
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الكفاءة' : 'Efficiency'}</p>
                <p className="text-lg font-bold text-foreground">{asset.efficiency}%</p>
              </div>
            )}
            
            {asset.temperature && (
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'درجة الحرارة' : 'Temperature'}</p>
                <p className="text-lg font-bold text-foreground">{asset.temperature}°C</p>
              </div>
            )}
            
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground mb-2">{language === 'ar' ? 'مؤشر الصحة' : 'Health Status'}</p>
              <Progress 
                value={asset.health}
                className={`h-3 ${
                  asset.health >= 80 ? '[&>div]:bg-status-normal' :
                  asset.health >= 60 ? '[&>div]:bg-status-warning' :
                  '[&>div]:bg-status-critical'
                }`}
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'آخر صيانة' : 'Last Maintenance'}</p>
              <p className="text-foreground">{asset.lastMaintenance}</p>
            </div>
            
            {asset.predictedFailure && (
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'التنبؤ بالفشل' : 'Predicted Failure'}</p>
                <p className="text-foreground text-status-warning font-semibold">{asset.predictedFailure}</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-border/50 pt-4 flex gap-2">
            <Button className="gap-2">
              <Wrench className="w-4 h-4" />
              {language === 'ar' ? 'جدولة الصيانة' : 'Schedule Maintenance'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  return (
    <div className="panel-industrial h-full flex flex-col">
      <div className="panel-header">
        <h3 className="font-semibold text-foreground">{t('kpi.assetHealth')}</h3>
        <span className="text-xs text-muted-foreground">AI Predictive Analysis</span>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-industrial">
        {assets.map((asset, index) => (
          <div key={index} className="space-y-2 pb-3 border-b border-border/30 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {language === 'ar' ? asset.nameAr : asset.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  'text-lg font-bold tabular-nums',
                  getHealthTextColor(asset.health)
                )}>
                  {asset.health}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {language === 'ar' ? 'التفاصيل' : 'Details'}
                </Button>
              </div>
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
      
      <AssetDetailsModal
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        language={language}
      />
    </div>
  );
};
