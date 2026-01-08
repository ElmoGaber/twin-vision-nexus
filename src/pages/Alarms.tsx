import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  Clock, 
  CheckCircle, 
  Filter,
  Search,
  Download,
  View
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

const allAlarms: Alarm[] = [
  {
    id: 'ALM-001',
    severity: 'critical',
    message: 'Transformer T1 overheating detected - Temperature 85°C exceeds threshold',
    messageAr: 'تم اكتشاف ارتفاع درجة حرارة المحول T1 - درجة الحرارة 85°C تتجاوز الحد',
    asset: 'Transformer T1',
    assetAr: 'المحول T1',
    timestamp: new Date(Date.now() - 5 * 60000),
    acknowledged: false,
  },
  {
    id: 'ALM-002',
    severity: 'critical',
    message: 'Grid synchronization fault detected - Phase angle mismatch',
    messageAr: 'تم اكتشاف خطأ في مزامنة الشبكة - عدم تطابق زاوية الطور',
    asset: 'Grid Interface GI-01',
    assetAr: 'واجهة الشبكة GI-01',
    timestamp: new Date(Date.now() - 8 * 60000),
    acknowledged: false,
  },
  {
    id: 'ALM-003',
    severity: 'warning',
    message: 'Solar Array Zone B - Output below threshold (87% efficiency)',
    messageAr: 'منطقة الألواح الشمسية ب - الإنتاج أقل من الحد (كفاءة 87%)',
    asset: 'Solar Zone B',
    assetAr: 'المنطقة الشمسية ب',
    timestamp: new Date(Date.now() - 15 * 60000),
    acknowledged: false,
  },
  {
    id: 'ALM-004',
    severity: 'warning',
    message: 'Inverter INV-12 efficiency degradation detected - 3% below baseline',
    messageAr: 'تم اكتشاف انخفاض كفاءة العاكس INV-12 - 3% أقل من المستوى المرجعي',
    asset: 'Inverter INV-12',
    assetAr: 'العاكس INV-12',
    timestamp: new Date(Date.now() - 45 * 60000),
    acknowledged: true,
  },
  {
    id: 'ALM-005',
    severity: 'warning',
    message: 'Battery bank BT-02 approaching low charge level (25%)',
    messageAr: 'بنك البطاريات BT-02 يقترب من مستوى الشحن المنخفض (25%)',
    asset: 'Battery Bank BT-02',
    assetAr: 'بنك البطاريات BT-02',
    timestamp: new Date(Date.now() - 60 * 60000),
    acknowledged: true,
  },
  {
    id: 'ALM-006',
    severity: 'info',
    message: 'Scheduled maintenance reminder - Cooling Unit CU-03 due in 7 days',
    messageAr: 'تذكير بالصيانة المجدولة - وحدة التبريد CU-03 مستحقة خلال 7 أيام',
    asset: 'Cooling Unit CU-03',
    assetAr: 'وحدة التبريد CU-03',
    timestamp: new Date(Date.now() - 120 * 60000),
    acknowledged: true,
  },
  {
    id: 'ALM-007',
    severity: 'info',
    message: 'Firmware update available for Smart Meter SM-45',
    messageAr: 'تحديث البرنامج الثابت متاح للعداد الذكي SM-45',
    asset: 'Smart Meter SM-45',
    assetAr: 'العداد الذكي SM-45',
    timestamp: new Date(Date.now() - 180 * 60000),
    acknowledged: true,
  },
];

const Alarms = () => {
  const { t, language, dir } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAlarms = allAlarms.filter(alarm => {
    const matchesFilter = filter === 'all' || alarm.severity === filter;
    const matchesSearch = searchTerm === '' || 
      alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const counts = {
    all: allAlarms.length,
    critical: allAlarms.filter(a => a.severity === 'critical').length,
    warning: allAlarms.filter(a => a.severity === 'warning').length,
    info: allAlarms.filter(a => a.severity === 'info').length,
  };
  
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
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('alarms.title')}</h1>
            <p className="text-muted-foreground">
              Monitor and manage system alerts and notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 me-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="panel-industrial p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className={cn(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
                dir === 'rtl' ? 'right-3' : 'left-3'
              )} />
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'bg-muted/50',
                  dir === 'rtl' ? 'pr-10' : 'pl-10'
                )}
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn(
                    filter === f && f === 'critical' && 'bg-status-critical hover:bg-status-critical/90',
                    filter === f && f === 'warning' && 'bg-status-warning hover:bg-status-warning/90 text-foreground',
                    filter === f && f === 'info' && 'bg-info hover:bg-info/90',
                  )}
                >
                  {f === 'critical' && <XCircle className="w-4 h-4 me-1" />}
                  {f === 'warning' && <AlertTriangle className="w-4 h-4 me-1" />}
                  {f === 'info' && <Info className="w-4 h-4 me-1" />}
                  <span className="capitalize">{f}</span>
                  <span className="ms-1 text-xs opacity-70">({counts[f]})</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Alarms List */}
        <div className="space-y-3">
          {filteredAlarms.map((alarm) => (
            <div 
              key={alarm.id}
              className={cn(
                'panel-industrial p-4 border transition-all',
                severityBg[alarm.severity],
                alarm.severity === 'critical' && !alarm.acknowledged && 'status-blink-critical'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{severityIcons[alarm.severity]}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-foreground">{alarm.id}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium capitalize',
                        alarm.severity === 'critical' && 'bg-status-critical/20 text-status-critical',
                        alarm.severity === 'warning' && 'bg-status-warning/20 text-status-warning',
                        alarm.severity === 'info' && 'bg-info/20 text-info',
                      )}>
                        {alarm.severity}
                      </span>
                      {alarm.acknowledged && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatTime(alarm.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-foreground mb-2">
                    {language === 'ar' ? alarm.messageAr : alarm.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Asset: {language === 'ar' ? alarm.assetAr : alarm.asset}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {!alarm.acknowledged && (
                        <Button variant="outline" size="sm">
                          {t('alarms.acknowledge')}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        {t('alarms.viewDetails')}
                      </Button>
                      <Link to="/vr">
                        <Button variant="ghost" size="sm" className="text-primary">
                          <View className="w-4 h-4 me-1" />
                          {t('alarms.jumpToVR')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alarms;
