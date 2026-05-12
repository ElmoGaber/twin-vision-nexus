import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVR } from '@/contexts/VRContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  Clock, 
  CheckCircle, 
  Search,
  Download,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Alarm {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  messageAr: string;
  asset: string;
  assetAr: string;
  assetId: string;
  assetType: 'panel' | 'transformer' | 'inverter';
  position: [number, number, number];
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
    assetId: 'T1',
    assetType: 'transformer',
    position: [10, 2, 15],
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
    assetId: 'GI-01',
    assetType: 'inverter',
    position: [-20, 1, 0],
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
    assetId: 'P-08',
    assetType: 'panel',
    position: [-6, 0, 35],
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
    assetId: 'INV-12',
    assetType: 'inverter',
    position: [5, 1, -10],
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
    assetId: 'BT-02',
    assetType: 'inverter',
    position: [15, 0.5, -20],
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
    assetId: 'CU-03',
    assetType: 'inverter',
    position: [-15, 0, 25],
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
    assetId: 'SM-45',
    assetType: 'inverter',
    position: [0, 0.5, -15],
    timestamp: new Date(Date.now() - 180 * 60000),
    acknowledged: true,
  },
];

const Alarms = () => {
  const { t, language, dir } = useLanguage();
  const { toast } = useToast();
  const { navigateToAsset, alarms: vrAlarms } = useVR();
  const navigate = useNavigate();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const mappedRuntimeAlarms: Alarm[] = vrAlarms.map((alarm) => ({
      id: alarm.id,
      severity: alarm.severity,
      message: alarm.message,
      messageAr: alarm.message,
      asset: `${alarm.assetType.toUpperCase()} ${alarm.assetId}`,
      assetAr: `${alarm.assetType.toUpperCase()} ${alarm.assetId}`,
      assetId: alarm.assetId,
      assetType: alarm.assetType,
      position: alarm.position,
      timestamp: alarm.timestamp instanceof Date ? alarm.timestamp : new Date(alarm.timestamp),
      acknowledged: false,
    }));

    setAlarms((prev) => {
      const previousAck = new Map(prev.map((a) => [a.id, a.acknowledged]));

      return mappedRuntimeAlarms
        .map((alarm) => ({
          ...alarm,
          acknowledged: previousAck.get(alarm.id) ?? false,
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 80);
    });
  }, [vrAlarms]);
  
  const filteredAlarms = alarms.filter(alarm => {
    const matchesFilter = filter === 'all' || alarm.severity === filter;
    const matchesSearch = searchTerm === '' || 
      alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const counts = {
    all: alarms.length,
    critical: alarms.filter(a => a.severity === 'critical').length,
    warning: alarms.filter(a => a.severity === 'warning').length,
    info: alarms.filter(a => a.severity === 'info').length,
  };
  
  const handleNavigateToAsset = (alarm: Alarm) => {
    // تمرير بيانات الموقع إلى VR Context
    navigateToAsset({
      assetId: alarm.assetId,
      assetType: alarm.assetType,
      position: alarm.position,
      focus: true,
    });
    
    // الانتقال إلى صفحة VR
    navigate('/vr');
  };

  const handleAcknowledge = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm =>
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ));

    if (selectedAlarm?.id === alarmId) {
      setSelectedAlarm(prev => (prev ? { ...prev, acknowledged: true } : prev));
    }

    toast({
      title: language === 'ar' ? 'تم الإقرار بالتنبيه' : 'Alarm acknowledged',
      description: language === 'ar' ? `تم تحديث حالة ${alarmId}` : `${alarmId} has been marked as acknowledged.`,
    });
  };

  const handleViewDetails = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setIsDetailsOpen(true);
  };

  const handleExport = () => {
    if (filteredAlarms.length === 0) {
      toast({
        title: language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export',
        description: language === 'ar' ? 'لا توجد إنذارات حالياً حسب الفلاتر المختارة.' : 'There are no alarms matching the current filters.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['ID', 'Severity', 'Asset', 'Asset Type', 'Message', 'Timestamp', 'Acknowledged'];
    const rows = filteredAlarms.map((alarm) => [
      alarm.id,
      alarm.severity,
      language === 'ar' ? alarm.assetAr : alarm.asset,
      alarm.assetType,
      language === 'ar' ? alarm.messageAr : alarm.message,
      alarm.timestamp.toISOString(),
      alarm.acknowledged ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `alarms_export_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: language === 'ar' ? 'تم تصدير البيانات' : 'Export completed',
      description: language === 'ar' ? `تم تنزيل ${filteredAlarms.length} تنبيه.` : `${filteredAlarms.length} alarms exported successfully.`,
    });
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
            <Button variant="outline" size="sm" onClick={handleExport}>
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
                        <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alarm.id)}>
                          {t('alarms.acknowledge')}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alarm)}>
                        {t('alarms.viewDetails')}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 gap-1"
                        onClick={() => handleNavigateToAsset(alarm)}
                      >
                        <Navigation className="w-4 h-4" />
                        {t('alarms.jumpToVR') || 'View in VR'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'ar' ? 'تفاصيل التنبيه' : 'Alarm Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedAlarm?.id} - {selectedAlarm?.severity?.toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            {selectedAlarm && (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{language === 'ar' ? 'الرسالة:' : 'Message:'}</span>
                  <p className="text-foreground mt-1">{language === 'ar' ? selectedAlarm.messageAr : selectedAlarm.message}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{language === 'ar' ? 'الأصل:' : 'Asset:'}</span>
                  <p className="text-foreground mt-1">{language === 'ar' ? selectedAlarm.assetAr : selectedAlarm.asset}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">{language === 'ar' ? 'النوع:' : 'Type:'}</span>
                    <p className="text-foreground mt-1 capitalize">{selectedAlarm.assetType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{language === 'ar' ? 'الوقت:' : 'Time:'}</span>
                    <p className="text-foreground mt-1">{formatTime(selectedAlarm.timestamp)}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                  <p className="text-foreground mt-1">
                    {selectedAlarm.acknowledged
                      ? (language === 'ar' ? 'تم الإقرار' : 'Acknowledged')
                      : (language === 'ar' ? 'غير مُقَرّ' : 'Unacknowledged')}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              {selectedAlarm && !selectedAlarm.acknowledged && (
                <Button variant="outline" onClick={() => handleAcknowledge(selectedAlarm.id)}>
                  {t('alarms.acknowledge')}
                </Button>
              )}
              {selectedAlarm && (
                <Button onClick={() => {
                  setIsDetailsOpen(false);
                  handleNavigateToAsset(selectedAlarm);
                }} className="gap-1">
                  <Navigation className="w-4 h-4" />
                  {t('alarms.jumpToVR') || 'View in VR'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Alarms;
