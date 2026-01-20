import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sun,
  Cloud,
  Satellite,
  Activity,
  Zap,
  Globe,
  Clock,
  Target,
  TrendingUp,
  Radio,
  Database,
  CheckCircle,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Gauge,
  ThermometerSun,
} from 'lucide-react';

interface IrradianceData {
  timestamp: string;
  ghi: number; // Global Horizontal Irradiance
  dni: number; // Direct Normal Irradiance
  dhi: number; // Diffuse Horizontal Irradiance
  cloudOpacity: number;
  pvPower: number;
}

interface DataSpec {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const LiveSolarDataPanel = () => {
  const { t, dir } = useLanguage();
  const [liveData, setLiveData] = useState<IrradianceData[]>([]);
  const [currentData, setCurrentData] = useState<IrradianceData>({
    timestamp: new Date().toISOString(),
    ghi: 842,
    dni: 756,
    dhi: 124,
    cloudOpacity: 12,
    pvPower: 38.5,
  });
  const [isStreaming, setIsStreaming] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data streaming (5-minute updates)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newData: IrradianceData = {
        timestamp: new Date().toISOString(),
        ghi: Math.max(0, currentData.ghi + (Math.random() - 0.5) * 50),
        dni: Math.max(0, currentData.dni + (Math.random() - 0.5) * 40),
        dhi: Math.max(0, currentData.dhi + (Math.random() - 0.5) * 15),
        cloudOpacity: Math.min(100, Math.max(0, currentData.cloudOpacity + (Math.random() - 0.5) * 8)),
        pvPower: Math.max(0, currentData.pvPower + (Math.random() - 0.5) * 2),
      };
      
      setCurrentData(newData);
      setLiveData(prev => [...prev.slice(-12), newData]);
      setLastUpdate(new Date());
    }, 5000); // Simulate 5-minute updates compressed to 5 seconds for demo

    return () => clearInterval(interval);
  }, [isStreaming, currentData]);

  const dataSpecs: DataSpec[] = [
    {
      label: t('solcast.geographic') || 'Geographic Coverage',
      value: t('solcast.global') || 'Global (90m resolution)',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      label: t('solcast.temporal') || 'Temporal Coverage',
      value: '-7 days → Now',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: t('solcast.resolution') || 'Spatial Resolution',
      value: '90m (continental) / 27km (polar)',
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: t('solcast.updateFreq') || 'Update Frequency',
      value: t('solcast.every5min') || 'Every 5 minutes',
      icon: <RefreshCw className="w-4 h-4" />,
    },
  ];

  const accuracyMetrics = [
    { label: 'Bias', value: '+0.05%', status: 'excellent' },
    { label: 'Std Dev', value: '±2.05%', status: 'excellent' },
    { label: 'API Uptime', value: '>99.99%', status: 'excellent' },
    { label: 'Latency', value: '<100ms', status: 'excellent' },
  ];

  const irradianceParams = [
    { name: 'GHI', desc: t('solcast.ghiDesc') || 'Global Horizontal Irradiance', value: currentData.ghi, unit: 'W/m²', max: 1200 },
    { name: 'DNI', desc: t('solcast.dniDesc') || 'Direct Normal Irradiance', value: currentData.dni, unit: 'W/m²', max: 1000 },
    { name: 'DHI', desc: t('solcast.dhiDesc') || 'Diffuse Horizontal Irradiance', value: currentData.dhi, unit: 'W/m²', max: 400 },
  ];

  return (
    <Card className="panel-industrial">
      <CardHeader className="panel-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/20">
            <Sun className="w-5 h-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {t('solcast.title') || 'Live Solar Data & Cloud Tracking'}
              <Badge variant="outline" className="bg-success/20 text-success border-success/30 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                {t('common.live') || 'LIVE'}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('solcast.subtitle') || 'High-frequency satellite-based irradiance monitoring'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('solcast.lastUpdate') || 'Last update'}: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStreaming(!isStreaming)}
            className={isStreaming ? 'border-success/50' : 'border-destructive/50'}
          >
            {isStreaming ? (
              <>
                <Activity className="w-3 h-3 mr-1 text-success" />
                {t('solcast.streaming') || 'Streaming'}
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                {t('solcast.paused') || 'Paused'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="live" className="text-xs">
              <Satellite className="w-3 h-3 mr-1" />
              {t('solcast.liveData') || 'Live Data'}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs">
              <Cloud className="w-3 h-3 mr-1" />
              {t('solcast.cloudTracking') || 'Cloud Tracking'}
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs">
              <Database className="w-3 h-3 mr-1" />
              {t('solcast.specs') || 'Data Specs'}
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('solcast.accuracy') || 'Accuracy'}
            </TabsTrigger>
          </TabsList>
          
          {/* Live Data Tab */}
          <TabsContent value="live" className="space-y-4">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-4 h-4 text-warning" />
                  <span className="text-xs text-muted-foreground">PV Power</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentData.pvPower.toFixed(1)} <span className="text-sm font-normal">MW</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-success mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.3% vs forecast
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <ThermometerSun className="w-4 h-4 text-info" />
                  <span className="text-xs text-muted-foreground">GHI</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentData.ghi.toFixed(0)} <span className="text-sm font-normal">W/m²</span>
                </div>
                <Progress value={(currentData.ghi / 1200) * 100} className="h-1 mt-2" />
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground">{t('solcast.cloudOpacity') || 'Cloud Opacity'}</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentData.cloudOpacity.toFixed(0)}<span className="text-sm font-normal">%</span>
                </div>
                <Progress value={currentData.cloudOpacity} className="h-1 mt-2" />
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{t('solcast.efficiency') || 'Efficiency'}</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {(100 - currentData.cloudOpacity * 0.7).toFixed(1)}<span className="text-sm font-normal">%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('solcast.vsOptimal') || 'vs optimal conditions'}
                </div>
              </div>
            </div>
            
            {/* Irradiance Parameters */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                {t('solcast.irradianceParams') || 'Irradiance Parameters'}
              </h4>
              {irradianceParams.map((param) => (
                <div key={param.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{param.name} - {param.desc}</span>
                    <span className="font-medium text-foreground">{param.value.toFixed(0)} {param.unit}</span>
                  </div>
                  <Progress value={(param.value / param.max) * 100} className="h-2" />
                </div>
              ))}
            </div>
            
            {/* Estimated Actuals Banner */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-3">
                <Satellite className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">
                    {t('solcast.estimatedActuals') || 'Estimated Actuals Streaming'}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('solcast.estimatedActualsDesc') || 'High-resolution satellite imagery processed within minutes, tracking cloud movements into actionable solar data. Coverage spans the last 7 days with 5-minute update intervals.'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Cloud Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-secondary/20">
                  <Cloud className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    {t('solcast.liveCloudTracking') || 'Live Cloud & Irradiance Tracking'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t('solcast.trackingSubtitle') || 'Tracking the world\'s clouds in finest detail'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {t('solcast.feature1') || 'Real cloud tracking at 1-2km resolution and 5-minute intervals'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {t('solcast.feature2') || 'Irradiance and PV power data updated every 5-15 minutes'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {t('solcast.feature3') || 'Downscaled to 90-meter resolution for precise measurements'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {t('solcast.feature4') || 'Aerosol and albedo effects explicitly treated'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Grid Operator Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                <h5 className="text-sm font-medium text-foreground">{t('solcast.gridOps') || 'Grid Operators'}</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('solcast.gridOpsDesc') || 'Adjust dispatch in real-time'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <Activity className="w-6 h-6 text-secondary mx-auto mb-2" />
                <h5 className="text-sm font-medium text-foreground">{t('solcast.emsProviders') || 'EMS Providers'}</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('solcast.emsDesc') || 'Refine state-of-charge targets'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
                <h5 className="text-sm font-medium text-foreground">{t('solcast.vpps') || 'VPPs'}</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('solcast.vppsDesc') || 'Avoid last-minute surprises'}
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Data Specifications Tab */}
          <TabsContent value="specs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataSpecs.map((spec, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    {spec.icon}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{spec.label}</span>
                    <p className="text-sm font-medium text-foreground">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Temporal Resolutions */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t('solcast.temporalRes') || 'Temporal Resolution Options'}
              </h5>
              <div className="flex flex-wrap gap-2">
                {['5 min', '10 min', '15 min', '30 min', '60 min'].map((res) => (
                  <Badge key={res} variant="outline" className="text-xs">
                    {res}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('solcast.periodMean') || 'Period-mean values for accurate energy calculations'}
              </p>
            </div>
            
            {/* Data Parameters */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <h5 className="text-sm font-medium text-foreground mb-3">{t('solcast.dataParams') || 'Available Data Parameters'}</h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-primary font-medium">{t('solcast.irradiance') || 'Irradiance'}</span>
                  <ul className="text-muted-foreground mt-1 space-y-0.5">
                    <li>• GHI, DNI, DHI</li>
                    <li>• GTI (tilted)</li>
                    <li>• Albedo</li>
                  </ul>
                </div>
                <div>
                  <span className="text-secondary font-medium">{t('solcast.solar') || 'Solar'}</span>
                  <ul className="text-muted-foreground mt-1 space-y-0.5">
                    <li>• Azimuth</li>
                    <li>• Zenith</li>
                    <li>• Air Mass</li>
                  </ul>
                </div>
                <div>
                  <span className="text-success font-medium">{t('solcast.weather') || 'Weather'}</span>
                  <ul className="text-muted-foreground mt-1 space-y-0.5">
                    <li>• Temperature</li>
                    <li>• Humidity</li>
                    <li>• Wind Speed</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Data Access */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">{t('solcast.dataAccess') || 'Data Access'}</span>
                  <p className="text-xs text-muted-foreground">API (JSON/CSV) • PVsyst • SAM • TMY3</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {t('solcast.apiDocs') || 'API Docs'}
              </Button>
            </div>
          </TabsContent>
          
          {/* Accuracy Tab */}
          <TabsContent value="accuracy" className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <h4 className="font-medium text-foreground">{t('solcast.provenAccuracy') || 'Proven, Replicable Accuracy'}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t('solcast.validatedAgainst') || 'Validated against high-quality irradiance site measurements'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {accuracyMetrics.map((metric) => (
                  <div key={metric.label} className="p-3 rounded-lg bg-background/50 text-center">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    <p className="text-lg font-bold text-success">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Eye className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-foreground">{t('solcast.satelliteObs') || 'Satellite Observations'}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('solcast.satelliteObsDesc') || 'Processed every 5-15 minutes for real-time accuracy'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Target className="w-4 h-4 text-secondary mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-foreground">{t('solcast.cloudModeling') || 'Cloud Movement Modeling'}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('solcast.cloudModelingDesc') || '1-2km resolution tracks real cloud movements accurately'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Activity className="w-4 h-4 text-success mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-foreground">{t('solcast.reliableData') || 'Reliable Real-Time Data'}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('solcast.reliableDataDesc') || 'Keeps your control room ahead of changing conditions'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-3 rounded-lg bg-muted/30 border border-border">
              <span className="text-xs text-muted-foreground text-center">
                {t('solcast.trustedBy') || 'Trusted by 350+ solar companies and power system operators on four continents'}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
