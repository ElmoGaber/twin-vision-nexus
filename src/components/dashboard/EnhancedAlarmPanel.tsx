import React from 'react';
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
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const EnhancedAlarmPanel: React.FC = () => {
  const { t } = useLanguage();
  const { alarms, navigateToAsset } = useVR();
  const navigate = useNavigate();
  
  const handleJumpToVR = (alarm: typeof alarms[0]) => {
    navigateToAsset({
      assetId: alarm.assetId,
      assetType: alarm.assetType,
      position: alarm.position,
      focus: true,
    });
    navigate('/vr');
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
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1 shrink-0"
                      onClick={() => handleJumpToVR(alarm)}
                    >
                      <Eye className="w-3 h-3" />
                      {t('alarms.jumpToVR')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
