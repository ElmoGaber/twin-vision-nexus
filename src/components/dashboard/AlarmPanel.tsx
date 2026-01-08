import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, XCircle, Info, Clock, ExternalLink, View } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Alarm {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  messageAr: string;
  asset: string;
  assetAr: string;
  timestamp: Date;
  acknowledged: boolean;
}

const alarms: Alarm[] = [
  {
    id: 'ALM-001',
    severity: 'critical',
    message: 'Transformer T1 overheating detected - Temperature 85°C',
    messageAr: 'تم اكتشاف ارتفاع درجة حرارة المحول T1 - درجة الحرارة 85°C',
    asset: 'Transformer T1',
    assetAr: 'المحول T1',
    timestamp: new Date(Date.now() - 5 * 60000),
    acknowledged: false,
  },
  {
    id: 'ALM-002',
    severity: 'warning',
    message: 'Solar Array Zone B - Output below threshold (87%)',
    messageAr: 'منطقة الألواح الشمسية ب - الإنتاج أقل من الحد (87%)',
    asset: 'Solar Zone B',
    assetAr: 'المنطقة الشمسية ب',
    timestamp: new Date(Date.now() - 15 * 60000),
    acknowledged: false,
  },
  {
    id: 'ALM-003',
    severity: 'warning',
    message: 'Inverter INV-12 efficiency degradation detected',
    messageAr: 'تم اكتشاف انخفاض كفاءة العاكس INV-12',
    asset: 'Inverter INV-12',
    assetAr: 'العاكس INV-12',
    timestamp: new Date(Date.now() - 45 * 60000),
    acknowledged: true,
  },
  {
    id: 'ALM-004',
    severity: 'info',
    message: 'Scheduled maintenance reminder - Cooling Unit CU-03',
    messageAr: 'تذكير بالصيانة المجدولة - وحدة التبريد CU-03',
    asset: 'Cooling Unit CU-03',
    assetAr: 'وحدة التبريد CU-03',
    timestamp: new Date(Date.now() - 120 * 60000),
    acknowledged: true,
  },
];

export const AlarmPanel: React.FC = () => {
  const { t, language } = useLanguage();
  
  const severityIcons = {
    critical: <XCircle className="w-5 h-5 text-status-critical" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
  };
  
  const severityBg = {
    critical: 'bg-status-critical/10 border-status-critical/30',
    warning: 'bg-status-warning/10 border-status-warning/30',
    info: 'bg-info/10 border-info/30',
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 1) return language === 'ar' ? 'الآن' : 'Just now';
    if (diff < 60) return language === 'ar' ? `منذ ${diff} دقيقة` : `${diff}m ago`;
    if (diff < 1440) return language === 'ar' ? `منذ ${Math.floor(diff / 60)} ساعة` : `${Math.floor(diff / 60)}h ago`;
    return language === 'ar' ? `منذ ${Math.floor(diff / 1440)} يوم` : `${Math.floor(diff / 1440)}d ago`;
  };
  
  return (
    <div className="panel-industrial h-full flex flex-col">
      <div className="panel-header">
        <h3 className="font-semibold text-foreground">{t('alarms.title')}</h3>
        <Link to="/alarms">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            {t('common.viewAll')}
            <ExternalLink className="w-3 h-3 ms-1" />
          </Button>
        </Link>
      </div>
      
      <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-industrial">
        {alarms.map((alarm) => (
          <div 
            key={alarm.id}
            className={cn(
              'p-3 rounded-lg border transition-all',
              severityBg[alarm.severity],
              alarm.severity === 'critical' && !alarm.acknowledged && 'status-blink-critical',
              alarm.acknowledged && 'opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{severityIcons[alarm.severity]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{alarm.id}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(alarm.timestamp)}
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                  {language === 'ar' ? alarm.messageAr : alarm.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? alarm.assetAr : alarm.asset}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
              {!alarm.acknowledged && (
                <Button variant="outline" size="sm" className="text-xs h-7">
                  {t('alarms.acknowledge')}
                </Button>
              )}
              <Link to="/vr" className="ms-auto">
                <Button variant="ghost" size="sm" className="text-xs h-7 text-primary">
                  <View className="w-3 h-3 me-1" />
                  {t('alarms.jumpToVR')}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
