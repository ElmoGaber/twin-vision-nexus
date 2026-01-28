import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useVR } from '@/contexts/VRContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Cloud, 
  Sun, 
  Wind, 
  Droplets, 
  ThermometerSun,
  Eye,
  ChevronDown,
  ChevronUp,
  Waves,
  Gauge,
  AlertTriangle
} from 'lucide-react';

export const WeatherImpactPanel: React.FC = () => {
  const { weather, liveMetrics } = useVR();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [expanded, setExpanded] = useState(true);
  
  const weatherConditionIcon = {
    clear: <Sun className="w-8 h-8 text-yellow-400" />,
    partly_cloudy: <Cloud className="w-8 h-8 text-muted-foreground" />,
    cloudy: <Cloud className="w-8 h-8 text-muted-foreground" />,
    sandstorm: <Wind className="w-8 h-8 text-amber-600" />,
    rain: <Droplets className="w-8 h-8 text-blue-400" />
  };
  
  const weatherConditionLabel = {
    clear: isArabic ? 'صافي' : 'Clear',
    partly_cloudy: isArabic ? 'غائم جزئياً' : 'Partly Cloudy',
    cloudy: isArabic ? 'غائم' : 'Cloudy',
    sandstorm: isArabic ? 'عاصفة رملية' : 'Sandstorm',
    rain: isArabic ? 'ممطر' : 'Rainy'
  };
  
  const impactLevel = liveMetrics.weatherImpactFactor >= 0.9 ? 'optimal' :
                      liveMetrics.weatherImpactFactor >= 0.7 ? 'moderate' : 'severe';
  
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <ThermometerSun className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isArabic ? 'تأثير المناخ' : 'Climate Impact'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'تأثير الطقس على الإنتاج' : 'Weather effects on production'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              impactLevel === 'optimal' ? 'border-status-normal text-status-normal' :
              impactLevel === 'moderate' ? 'border-status-warning text-status-warning' :
              'border-status-critical text-status-critical'
            }>
              {impactLevel === 'optimal' ? (isArabic ? 'مثالي' : 'Optimal') :
               impactLevel === 'moderate' ? (isArabic ? 'معتدل' : 'Moderate') :
               isArabic ? 'شديد' : 'Severe'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Current Weather */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex-shrink-0">
              {weatherConditionIcon[weather.condition]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{weather.temperature.toFixed(1)}°C</span>
                <span className="text-muted-foreground">{weatherConditionLabel[weather.condition]}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> {weather.humidity.toFixed(0)}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3" /> {weather.windSpeed.toFixed(1)} km/h {weather.windDirection}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{isArabic ? 'تأثير الإنتاج' : 'Production Impact'}</div>
              <div className={`text-2xl font-bold ${
                liveMetrics.weatherImpactFactor >= 0.9 ? 'text-status-normal' :
                liveMetrics.weatherImpactFactor >= 0.7 ? 'text-status-warning' :
                'text-status-critical'
              }`}>
                {(liveMetrics.weatherImpactFactor * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Sun className="w-4 h-4 text-yellow-400" />
                {isArabic ? 'الإشعاع' : 'Irradiance'}
              </div>
              <div className="text-lg font-bold">{weather.irradiance.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">W/m²</div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Cloud className="w-4 h-4" />
                {isArabic ? 'الغيوم' : 'Cloud Cover'}
              </div>
              <div className="text-lg font-bold">{weather.cloudCover.toFixed(0)}%</div>
              <Progress value={weather.cloudCover} className="h-1 mt-1" />
            </div>
            
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Eye className="w-4 h-4 text-amber-500" />
                {isArabic ? 'الأشعة UV' : 'UV Index'}
              </div>
              <div className="text-lg font-bold">{weather.uvIndex.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">
                {weather.uvIndex > 8 ? (isArabic ? 'عالي جداً' : 'Very High') :
                 weather.uvIndex > 5 ? (isArabic ? 'عالي' : 'High') :
                 isArabic ? 'معتدل' : 'Moderate'}
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Waves className="w-4 h-4 text-amber-600" />
                {isArabic ? 'مستوى الغبار' : 'Dust Level'}
              </div>
              <div className="text-lg font-bold">{weather.dustLevel.toFixed(0)}%</div>
              <Progress 
                value={weather.dustLevel} 
                className={`h-1 mt-1 ${weather.dustLevel > 50 ? '[&>div]:bg-status-warning' : ''}`} 
              />
            </div>
          </div>
          
          {/* Dust Warning */}
          {weather.dustLevel > 40 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-status-warning/10 border border-status-warning/30">
              <AlertTriangle className="w-5 h-5 text-status-warning" />
              <div>
                <p className="text-sm font-medium text-status-warning">
                  {isArabic ? 'تحذير: مستوى غبار مرتفع' : 'Warning: High Dust Level'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? 'قد يقلل كفاءة الألواح بنسبة 5-15%. يُنصح بالتنظيف.' 
                    : 'May reduce panel efficiency by 5-15%. Cleaning recommended.'}
                </p>
              </div>
            </div>
          )}
          
          {/* 7-Day Weather Forecast */}
          <div>
            <h4 className="font-semibold mb-3">{isArabic ? 'توقعات 7 أيام' : '7-Day Forecast'}</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {weather.forecast.map((day, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-20 p-3 rounded-lg bg-muted/30 border border-border/30 text-center"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {day.date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex justify-center mb-1">
                    {day.condition === 'clear' && <Sun className="w-5 h-5 text-yellow-400" />}
                    {day.condition === 'partly_cloudy' && <Cloud className="w-5 h-5 text-muted-foreground" />}
                    {day.condition === 'cloudy' && <Cloud className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="text-sm font-bold">{day.tempHigh.toFixed(0)}°</div>
                  <div className="text-xs text-muted-foreground">{day.tempLow.toFixed(0)}°</div>
                  <div className="mt-1 text-xs">
                    <Gauge className="w-3 h-3 inline mr-1" />
                    {((100 - day.cloudCover) / 100 * day.irradiance / 10).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Climate Impact Summary */}
          <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
            <h4 className="font-semibold text-primary mb-2">
              {isArabic ? 'ملخص تأثير المناخ على الإنتاج' : 'Climate Impact Summary'}
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">{isArabic ? 'اليوم' : 'Today'}</div>
                <div className={`text-xl font-bold ${
                  liveMetrics.weatherImpactFactor >= 0.9 ? 'text-status-normal' : 'text-status-warning'
                }`}>
                  {(liveMetrics.weatherImpactFactor * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{isArabic ? 'هذا الأسبوع' : 'This Week'}</div>
                <div className="text-xl font-bold text-primary">
                  {(weather.forecast.slice(0, 7).reduce((sum, d) => 
                    sum + (100 - d.cloudCover) / 100 * d.irradiance / 1000, 0) / 7 * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{isArabic ? 'المفقود' : 'Lost Output'}</div>
                <div className="text-xl font-bold text-status-critical">
                  {((1 - liveMetrics.weatherImpactFactor) * liveMetrics.totalPower).toFixed(1)} MW
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
