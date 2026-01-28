import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useVR } from '@/contexts/VRContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, 
  Calendar, 
  Sun, 
  AlertTriangle, 
  Wrench,
  ChevronDown,
  ChevronUp,
  Zap,
  ThermometerSun,
  Target,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PredictionPanel: React.FC = () => {
  const { productionPrediction, maintenancePredictions, navigateToAsset, weather } = useVR();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [expanded, setExpanded] = useState(true);
  
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isArabic ? 'التنبؤ بالإنتاج والأعطال' : 'Production & Fault Predictions'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'تنبؤات مدعومة بالذكاء الاصطناعي' : 'AI-powered predictions'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">
                <Sun className="w-4 h-4 mr-1" />
                {isArabic ? 'يومي' : 'Daily'}
              </TabsTrigger>
              <TabsTrigger value="monthly">
                <Calendar className="w-4 h-4 mr-1" />
                {isArabic ? 'شهري' : 'Monthly'}
              </TabsTrigger>
              <TabsTrigger value="faults">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {isArabic ? 'الأعطال' : 'Faults'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4 mt-4">
              {/* Next Day Prediction */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    {isArabic ? 'إنتاج الغد المتوقع' : 'Tomorrow\'s Predicted Output'}
                  </h4>
                  <Badge variant="outline" className="border-primary text-primary">
                    {productionPrediction.nextDay.confidence.toFixed(0)}% {isArabic ? 'ثقة' : 'confidence'}
                  </Badge>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold text-primary">
                    {productionPrediction.nextDay.total.toFixed(1)}
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">MWh</span>
                  <div className="flex items-center text-status-normal ml-auto">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+2.3%</span>
                  </div>
                </div>
                
                {/* Hourly breakdown */}
                <div className="flex gap-1 h-16 items-end">
                  {productionPrediction.nextDay.hourly.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-primary/80 rounded-t"
                        style={{ height: `${(h.predicted / 40) * 100}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground mt-1">{h.hour}</span>
                    </div>
                  ))}
                </div>
                
                {/* Weather Impact */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <ThermometerSun className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{isArabic ? 'تأثير الطقس:' : 'Weather Impact:'}</span>
                    <span className="font-medium">
                      {weather.condition === 'clear' ? (isArabic ? 'صافي - أقصى إنتاج' : 'Clear - Max Output') :
                       weather.condition === 'partly_cloudy' ? (isArabic ? 'غائم جزئياً -5%' : 'Partly Cloudy -5%') :
                       isArabic ? 'غائم -15%' : 'Cloudy -15%'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 7 Day Forecast */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  {isArabic ? 'توقعات 7 أيام' : '7-Day Forecast'}
                </h4>
                {productionPrediction.daily.slice(0, 5).map((day, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="w-20 text-sm text-muted-foreground">
                      {day.date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                    </span>
                    <div className="flex-1">
                      <Progress value={day.weatherImpact} className="h-2" />
                    </div>
                    <span className="font-mono text-sm">{day.predicted.toFixed(1)} MW</span>
                    <Badge variant="outline" className={
                      day.weatherImpact > 85 ? 'border-status-normal text-status-normal' :
                      day.weatherImpact > 70 ? 'border-status-warning text-status-warning' :
                      'border-status-critical text-status-critical'
                    }>
                      {day.weatherImpact.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4 mt-4">
              {/* Next Month Prediction */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">
                    {isArabic ? 'إنتاج الشهر القادم' : 'Next Month\'s Output'}
                  </h4>
                  <Badge variant="outline" className="border-primary text-primary">
                    {productionPrediction.nextMonth.confidence.toFixed(0)}% {isArabic ? 'ثقة' : 'confidence'}
                  </Badge>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold text-primary">
                    {(productionPrediction.nextMonth.total / 1000).toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">GWh</span>
                </div>
                
                {/* Impact Factors */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-xs text-muted-foreground">{isArabic ? 'الطقس' : 'Weather'}</div>
                    <div className="text-lg font-bold text-primary">
                      {productionPrediction.monthly[0]?.factors.weather.toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-xs text-muted-foreground">{isArabic ? 'التآكل' : 'Degradation'}</div>
                    <div className="text-lg font-bold text-status-warning">
                      -{productionPrediction.monthly[0]?.factors.degradation.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="text-xs text-muted-foreground">{isArabic ? 'الصيانة' : 'Maintenance'}</div>
                    <div className="text-lg font-bold text-status-critical">
                      -{productionPrediction.monthly[0]?.factors.maintenance.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 6 Month Forecast */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">
                  {isArabic ? 'توقعات 6 شهور' : '6-Month Forecast'}
                </h4>
                {productionPrediction.monthly.map((month, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="w-12 text-sm font-medium">{month.month}</span>
                    <div className="flex-1">
                      <Progress value={(month.predicted / 1500) * 100} className="h-2" />
                    </div>
                    <span className="font-mono text-sm">{month.predicted.toFixed(0)} MWh</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {month.confidence.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="faults" className="space-y-4 mt-4">
              {/* Critical Faults */}
              {maintenancePredictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{isArabic ? 'لا توجد أعطال متوقعة' : 'No predicted faults'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenancePredictions.slice(0, 5).map((prediction, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-lg border ${
                        prediction.urgency === 'critical' ? 'border-status-critical/50 bg-status-critical/10' :
                        prediction.urgency === 'high' ? 'border-status-warning/50 bg-status-warning/10' :
                        'border-border/50 bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wrench className={`w-4 h-4 ${
                            prediction.urgency === 'critical' ? 'text-status-critical' :
                            prediction.urgency === 'high' ? 'text-status-warning' :
                            'text-muted-foreground'
                          }`} />
                          <span className="font-mono font-bold">{prediction.assetId}</span>
                          <Badge variant="outline" className={
                            prediction.urgency === 'critical' ? 'border-status-critical text-status-critical animate-pulse' :
                            prediction.urgency === 'high' ? 'border-status-warning text-status-warning' :
                            prediction.urgency === 'medium' ? 'border-primary text-primary' :
                            'border-muted-foreground text-muted-foreground'
                          }>
                            {prediction.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigateToAsset({
                            assetId: prediction.assetId,
                            assetType: prediction.assetType,
                            position: [0, 0, 0],
                            focus: true
                          })}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{prediction.reason}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs">
                            {isArabic ? 'احتمالية العطل' : 'Failure Prob.'}
                          </span>
                          <span className={`font-bold ${
                            prediction.failureProbability > 70 ? 'text-status-critical' :
                            prediction.failureProbability > 40 ? 'text-status-warning' :
                            'text-foreground'
                          }`}>
                            {prediction.failureProbability.toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">
                            {isArabic ? 'الأيام المتبقية' : 'Days Left'}
                          </span>
                          <span className="font-bold text-foreground">
                            {prediction.estimatedDaysToFailure} {isArabic ? 'يوم' : 'days'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">
                            {isArabic ? 'عائد الاستثمار' : 'ROI'}
                          </span>
                          <span className="font-bold text-status-normal">
                            {prediction.roi}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-primary">
                          <Zap className="w-3 h-3 inline mr-1" />
                          {prediction.recommendedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Link to="/vr" className="block">
                <Button className="w-full gap-2">
                  <Target className="w-4 h-4" />
                  {isArabic ? 'عرض في VR للتفتيش' : 'View in VR for Inspection'}
                </Button>
              </Link>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};
