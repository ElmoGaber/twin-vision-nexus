import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVR, DecisionLayer } from '@/contexts/VRContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Play, 
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Settings,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DecisionLayerPanel: React.FC = () => {
  const { decisionLayers, approveDecision, rejectDecision, executeDecision, riskScore } = useVR();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [expanded, setExpanded] = useState(true);
  
  const typeIcons = {
    optimization: <Settings className="w-4 h-4" />,
    maintenance: <Shield className="w-4 h-4" />,
    emergency: <AlertTriangle className="w-4 h-4" />,
    efficiency: <Zap className="w-4 h-4" />
  };
  
  const typeColors = {
    optimization: 'text-blue-400 border-blue-400/50 bg-blue-400/10',
    maintenance: 'text-amber-400 border-amber-400/50 bg-amber-400/10',
    emergency: 'text-red-400 border-red-400/50 bg-red-400/10',
    efficiency: 'text-green-400 border-green-400/50 bg-green-400/10'
  };
  
  const statusColors = {
    pending: 'border-primary text-primary',
    approved: 'border-status-normal text-status-normal',
    executing: 'border-blue-400 text-blue-400',
    completed: 'border-muted-foreground text-muted-foreground',
    rejected: 'border-status-critical text-status-critical'
  };
  
  const pendingDecisions = decisionLayers.filter(d => d.status === 'pending');
  const activeDecisions = decisionLayers.filter(d => d.status === 'approved' || d.status === 'executing');
  
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isArabic ? 'طبقات القرار الذكية' : 'AI Decision Layers'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'قرارات مدعومة بالذكاء الاصطناعي' : 'AI-powered decisions & actions'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              riskScore < 30 ? 'border-status-normal text-status-normal' :
              riskScore < 60 ? 'border-status-warning text-status-warning' :
              'border-status-critical text-status-critical'
            }>
              {isArabic ? 'خطورة' : 'Risk'}: {riskScore}%
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Risk Score Visualization */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isArabic ? 'مؤشر المخاطر العام' : 'Overall Risk Score'}
              </span>
              <span className={`text-2xl font-bold ${
                riskScore < 30 ? 'text-status-normal' :
                riskScore < 60 ? 'text-status-warning' :
                'text-status-critical'
              }`}>
                {riskScore}%
              </span>
            </div>
            <Progress 
              value={riskScore} 
              className={`h-3 ${
                riskScore >= 60 ? '[&>div]:bg-status-critical' :
                riskScore >= 30 ? '[&>div]:bg-status-warning' :
                ''
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{isArabic ? 'منخفض' : 'Low'}</span>
              <span>{isArabic ? 'متوسط' : 'Medium'}</span>
              <span>{isArabic ? 'عالي' : 'High'}</span>
            </div>
          </div>
          
          {/* Pending Decisions */}
          {pendingDecisions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {isArabic ? 'قرارات تحتاج موافقة' : 'Pending Decisions'} 
                <Badge variant="secondary">{pendingDecisions.length}</Badge>
              </h4>
              <div className="space-y-3">
                {pendingDecisions.map(decision => (
                  <DecisionCard 
                    key={decision.id} 
                    decision={decision}
                    onApprove={() => approveDecision(decision.id)}
                    onReject={() => rejectDecision(decision.id)}
                    onExecute={() => executeDecision(decision.id)}
                    isArabic={isArabic}
                    typeIcons={typeIcons}
                    typeColors={typeColors}
                    statusColors={statusColors}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Active Decisions */}
          {activeDecisions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-status-normal" />
                {isArabic ? 'قرارات نشطة' : 'Active Decisions'}
                <Badge variant="secondary">{activeDecisions.length}</Badge>
              </h4>
              <div className="space-y-3">
                {activeDecisions.map(decision => (
                  <DecisionCard 
                    key={decision.id} 
                    decision={decision}
                    onApprove={() => approveDecision(decision.id)}
                    onReject={() => rejectDecision(decision.id)}
                    onExecute={() => executeDecision(decision.id)}
                    isArabic={isArabic}
                    typeIcons={typeIcons}
                    typeColors={typeColors}
                    statusColors={statusColors}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* All Decisions Summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-lg font-bold text-primary">
                {decisionLayers.filter(d => d.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">{isArabic ? 'معلق' : 'Pending'}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-lg font-bold text-status-normal">
                {decisionLayers.filter(d => d.status === 'approved').length}
              </div>
              <div className="text-xs text-muted-foreground">{isArabic ? 'موافق' : 'Approved'}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-lg font-bold text-blue-400">
                {decisionLayers.filter(d => d.status === 'executing').length}
              </div>
              <div className="text-xs text-muted-foreground">{isArabic ? 'جاري' : 'Executing'}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-lg font-bold text-muted-foreground">
                {decisionLayers.filter(d => d.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground">{isArabic ? 'مكتمل' : 'Done'}</div>
            </div>
          </div>
          
          <Link to="/vr" className="block">
            <Button className="w-full gap-2" variant="outline">
              <Brain className="w-4 h-4" />
              {isArabic ? 'عرض القرارات في VR' : 'View Decisions in VR'}
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
};

const DecisionCard: React.FC<{
  decision: DecisionLayer;
  onApprove: () => void;
  onReject: () => void;
  onExecute: () => void;
  isArabic: boolean;
  typeIcons: Record<string, React.ReactNode>;
  typeColors: Record<string, string>;
  statusColors: Record<string, string>;
}> = ({ decision, onApprove, onReject, onExecute, isArabic, typeIcons, typeColors, statusColors }) => {
  return (
    <div className={`p-4 rounded-lg border ${typeColors[decision.type]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {typeIcons[decision.type]}
          <span className="font-semibold text-foreground">{decision.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {decision.automated && (
            <Badge variant="outline" className="text-xs border-purple-400 text-purple-400">
              <Zap className="w-3 h-3 mr-1" />
              {isArabic ? 'تلقائي' : 'Auto'}
            </Badge>
          )}
          <Badge variant="outline" className={`text-xs ${statusColors[decision.status]}`}>
            {decision.status === 'executing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {decision.status.toUpperCase()}
          </Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{decision.description}</p>
      
      <div className="flex items-center gap-4 text-sm mb-3">
        <div>
          <span className="text-muted-foreground">{isArabic ? 'التأثير:' : 'Impact:'}</span>
          <span className="font-bold ml-1 text-primary">{decision.impact}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">{isArabic ? 'الثقة:' : 'Confidence:'}</span>
          <span className="font-bold ml-1">{decision.confidence}%</span>
        </div>
      </div>
      
      {decision.status === 'pending' && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-1" onClick={onApprove}>
            <CheckCircle className="w-4 h-4" />
            {isArabic ? 'موافقة' : 'Approve'}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={onReject}>
            <XCircle className="w-4 h-4" />
            {isArabic ? 'رفض' : 'Reject'}
          </Button>
        </div>
      )}
      
      {decision.status === 'approved' && (
        <Button size="sm" className="w-full gap-1" onClick={onExecute}>
          <Play className="w-4 h-4" />
          {isArabic ? 'تنفيذ الآن' : 'Execute Now'}
        </Button>
      )}
      
      {decision.status === 'executing' && (
        <div className="flex items-center gap-2 text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{isArabic ? 'جاري التنفيذ...' : 'Executing...'}</span>
        </div>
      )}
    </div>
  );
};
