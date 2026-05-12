import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVR } from '@/contexts/VRContext';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Eye,
  CheckCircle,
  Zap,
  X,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlarmDetailsModalProps {
  alarm: any;
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const AlarmDetailsModal: React.FC<AlarmDetailsModalProps> = ({ alarm, isOpen, onClose, language }) => {
  if (!isOpen || !alarm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle>
            {language === 'ar' ? 'تفاصيل التنبيه' : 'Alarm Details'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'معرف التنبيه' : 'Alarm ID'}</p>
              <p className="font-mono font-bold text-foreground">{alarm.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الخطورة' : 'Severity'}</p>
              <Badge className={alarm.severity === 'critical' ? 'bg-status-critical' : 'bg-status-warning'}>
                {alarm.severity.toUpperCase()}
              </Badge>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الرسالة' : 'Message'}</p>
              <p className="text-foreground">{alarm.message}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الأصل' : 'Asset'}</p>
              <p className="text-foreground">{alarm.assetId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الموقع' : 'Position'}</p>
              <p className="text-foreground font-mono">[{alarm.position.map((p: number) => p.toFixed(1)).join(', ')}]</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الوقت' : 'Time'}</p>
              <p className="text-foreground">{formatDistanceToNow(alarm.timestamp, { addSuffix: true })}</p>
            </div>
            {alarm.aiRecommendation && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'التوصية' : 'AI Recommendation'}</p>
                <p className="text-foreground bg-primary/5 border border-primary/20 rounded p-2">{alarm.aiRecommendation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EnhancedAlarmPanel: React.FC = () => {
  const { t, language } = useLanguage();
  const { alarms, navigateToAsset, acknowledgeAlarm } = useVR();
  const navigate = useNavigate();
  const [selectedAlarm, setSelectedAlarm] = useState<any>(null);
  
  const handleJumpToVR = (alarm: typeof alarms[0]) => {
    navigateToAsset({
      assetId: alarm.assetId,
      assetType: alarm.assetType,
      position: alarm.position,
      focus: true,
    });
    navigate('/vr');
  };
  
  const handleAcknowledge = (alarmId: string) => {
    acknowledgeAlarm(alarmId);
  };
  
  const criticalAlarms = alarms.filter(a => a.severity === 'critical');
  const warningAlarms = alarms.filter(a => a.severity === 'warning');
  
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-critical/20">
              <AlertTriangle className="w-5 h-5 text-status-critical" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('alarms.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {alarms.length} active alerts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="destructive" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-background animate-pulse" />
              {criticalAlarms.length} Critical
            </Badge>
            <Badge variant="outline" className="border-status-warning text-status-warning">
              {warningAlarms.length} Warning
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {alarms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="w-12 h-12 text-status-normal mb-3" />
                <p className="text-foreground font-medium">All systems operational</p>
                <p className="text-sm text-muted-foreground">No active alarms</p>
              </div>
            ) : (
              alarms.map(alarm => (
                <div 
                  key={alarm.id}
                  className={`
                    p-4 rounded-lg border transition-all hover:shadow-md
                    ${alarm.severity === 'critical' 
                      ? 'border-status-critical/50 bg-status-critical/5 hover:bg-status-critical/10' 
                      : 'border-status-warning/50 bg-status-warning/5 hover:bg-status-warning/10'}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-full mt-0.5
                        ${alarm.severity === 'critical' 
                          ? 'bg-status-critical/20' 
                          : 'bg-status-warning/20'}
                      `}>
                        {alarm.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-status-critical" />
                        ) : (
                          <Zap className="w-4 h-4 text-status-warning" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {alarm.assetId}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alarm.severity === 'critical' 
                                ? 'border-status-critical text-status-critical' 
                                : 'border-status-warning text-status-warning'
                            }`}
                          >
                            {alarm.severity.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-foreground">
                          {alarm.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(alarm.timestamp, { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            [{alarm.position.map(p => p.toFixed(0)).join(', ')}]
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => handleAcknowledge(alarm.id)}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {language === 'ar' ? 'تأكيد' : 'Ack'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => setSelectedAlarm(alarm)}
                      >
                        <Info className="w-3 h-3" />
                        {language === 'ar' ? 'التفاصيل' : 'Details'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleJumpToVR(alarm)}
                      >
                        <Eye className="w-3 h-3" />
                        {t('alarms.jumpToVR')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <AlarmDetailsModal 
          alarm={selectedAlarm}
          isOpen={!!selectedAlarm}
          onClose={() => setSelectedAlarm(null)}
          language={language}
        />
      </CardContent>
    </Card>
  );
};
