import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { SystemStatusPanel } from '@/components/dashboard/SystemStatusPanel';
import { EnhancedAlarmPanel } from '@/components/dashboard/EnhancedAlarmPanel';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { AssetHealthPanel } from '@/components/dashboard/AssetHealthPanel';
import { LiveSolarDataPanel } from '@/components/dashboard/LiveSolarDataPanel';
import { EgyptSolarTracker3D } from '@/components/dashboard/EgyptSolarTracker3D';
import { PredictionPanel } from '@/components/dashboard/PredictionPanel';
import { WeatherImpactPanel } from '@/components/dashboard/WeatherImpactPanel';
import { DecisionLayerPanel } from '@/components/dashboard/DecisionLayerPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVR } from '@/contexts/VRContext';
import { 
  Zap, 
  Gauge, 
  HeartPulse, 
  AlertTriangle, 
  Timer,
  Leaf,
  Activity,
  Brain,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { View } from 'lucide-react';
import solarPlantHero from '@/assets/solar-plant-hero.jpg';

const Index = () => {
  const { t, dir, language } = useLanguage();
  const isArabic = language === 'ar';
  const { liveMetrics, riskScore, syncStatus, lastUpdate, decisionLayers, alarms } = useVR();
  
  const pendingDecisions = decisionLayers.filter(d => d.status === 'pending').length;
  
  return (
    <DashboardLayout>
      {/* Hero Section with VR Quick Access */}
      <div 
        className="relative rounded-xl overflow-hidden mb-6 bg-cover bg-center h-48"
        style={{ backgroundImage: `url(${solarPlantHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="relative h-full flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground max-w-md">
              {isArabic 
                ? 'مراقبة لحظية، تحليلات ذكية، تنبؤ بالإنتاج والأعطال، وبيئة VR غامرة' 
                : 'Real-time monitoring, AI predictions, fault forecasting, and immersive VR walkthrough'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className={`
                ${syncStatus === 'connected' ? 'border-status-normal text-status-normal' :
                  syncStatus === 'syncing' ? 'border-primary text-primary' :
                  'border-status-critical text-status-critical'}
              `}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  syncStatus === 'connected' ? 'bg-status-normal' :
                  syncStatus === 'syncing' ? 'bg-primary animate-pulse' :
                  'bg-status-critical'
                }`} />
                {syncStatus === 'connected' ? (isArabic ? 'متصل' : 'LIVE') :
                 syncStatus === 'syncing' ? (isArabic ? 'مزامنة' : 'SYNCING') :
                 isArabic ? 'غير متصل' : 'OFFLINE'}
              </Badge>
              {pendingDecisions > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  <Brain className="w-3 h-3 mr-1" />
                  {pendingDecisions} {isArabic ? 'قرار معلق' : 'pending decisions'}
                </Badge>
              )}
            </div>
          </div>
          <Link to="/vr">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
              <View className="w-5 h-5" />
              {isArabic ? 'دخول VR' : 'Enter VR'}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={isArabic ? 'كفاءة الطاقة' : 'Energy Efficiency'}
          value={liveMetrics.efficiency.toFixed(1)}
          unit="%"
          trend="up"
          trendValue="+2.1%"
          icon={<Zap className="w-5 h-5" />}
          status={liveMetrics.efficiency >= 90 ? 'normal' : 'warning'}
        />
        <KPICard
          title={isArabic ? 'إنتاج الطاقة' : 'Power Output'}
          value={liveMetrics.totalPower.toFixed(1)}
          unit="MW"
          trend="up"
          icon={<Activity className="w-5 h-5" />}
          status="normal"
        />
        <KPICard
          title={isArabic ? 'صحة النظام' : 'System Health'}
          value={liveMetrics.systemHealth.toFixed(0)}
          unit="%"
          trend={liveMetrics.systemHealth >= 85 ? 'up' : 'down'}
          icon={<HeartPulse className="w-5 h-5" />}
          status={liveMetrics.systemHealth >= 85 ? 'normal' : 'warning'}
        />
        <KPICard
          title={isArabic ? 'مؤشر المخاطر' : 'Risk Score'}
          value={riskScore.toFixed(0)}
          unit="%"
          trend={riskScore <= 30 ? 'down' : 'up'}
          icon={<AlertTriangle className="w-5 h-5" />}
          status={riskScore <= 30 ? 'normal' : riskScore <= 50 ? 'warning' : 'critical'}
        />
      </div>
      
      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={isArabic ? 'الإشعاع الشمسي' : 'Solar Irradiance'}
          value={liveMetrics.irradiance.toFixed(0)}
          unit="W/m²"
          icon={<TrendingUp className="w-5 h-5" />}
          status="normal"
        />
        <KPICard
          title={isArabic ? 'التنبيهات النشطة' : 'Active Alarms'}
          value={alarms.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          status={alarms.length === 0 ? 'normal' : alarms.length <= 2 ? 'warning' : 'critical'}
        />
        <KPICard
          title={isArabic ? 'توفير CO2' : 'CO2 Savings'}
          value={liveMetrics.carbonOffset.toFixed(1)}
          unit={isArabic ? 'طن' : 'tons'}
          trend="up"
          icon={<Leaf className="w-5 h-5" />}
          status="normal"
        />
        <KPICard
          title={isArabic ? 'تأثير الطقس' : 'Weather Impact'}
          value={(liveMetrics.weatherImpactFactor * 100).toFixed(0)}
          unit="%"
          icon={<Gauge className="w-5 h-5" />}
          status={liveMetrics.weatherImpactFactor >= 0.9 ? 'normal' : 'warning'}
        />
      </div>
      
      {/* AI Features Row - Predictions, Weather, Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PredictionPanel />
        <WeatherImpactPanel />
        <DecisionLayerPanel />
      </div>
      
      {/* Live Solar Data Panel - Full Width */}
      <div className="mb-6">
        <LiveSolarDataPanel />
      </div>
      
      {/* Egypt Solar Power Tracker - 3D Map */}
      <div className="mb-6">
        <EgyptSolarTracker3D />
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Chart - 2 columns */}
        <div className="lg:col-span-2">
          <EnergyChart />
        </div>
        
        {/* System Status */}
        <div className="lg:col-span-1">
          <SystemStatusPanel />
        </div>
        
        {/* Enhanced Alarm Panel with VR Integration */}
        <div className="lg:col-span-1">
          <EnhancedAlarmPanel />
        </div>
        
        {/* Asset Health */}
        <div className="lg:col-span-2">
          <AssetHealthPanel />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
