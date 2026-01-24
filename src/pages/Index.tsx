import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { SystemStatusPanel } from '@/components/dashboard/SystemStatusPanel';
import { EnhancedAlarmPanel } from '@/components/dashboard/EnhancedAlarmPanel';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { AssetHealthPanel } from '@/components/dashboard/AssetHealthPanel';
import { LiveSolarDataPanel } from '@/components/dashboard/LiveSolarDataPanel';
import { EgyptSolarTracker3D } from '@/components/dashboard/EgyptSolarTracker3D';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVR } from '@/contexts/VRContext';
import { 
  Zap, 
  Gauge, 
  HeartPulse, 
  AlertTriangle, 
  BatteryCharging,
  Timer,
  Leaf,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { View } from 'lucide-react';
import solarPlantHero from '@/assets/solar-plant-hero.jpg';

const Index = () => {
  const { t, dir } = useLanguage();
  const [kpis, setKpis] = useState({
    energyEfficiency: 94.2,
    loadPercentage: 78,
    assetHealth: 87,
    downtimeRisk: 12,
    powerOutput: 42.5,
    activeAlarms: 3,
    co2Savings: 156.8,
    uptime: 99.7,
  });
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => ({
        energyEfficiency: Math.min(100, Math.max(85, prev.energyEfficiency + (Math.random() - 0.5) * 0.5)),
        loadPercentage: Math.min(100, Math.max(60, prev.loadPercentage + (Math.random() - 0.5) * 2)),
        assetHealth: Math.min(100, Math.max(80, prev.assetHealth + (Math.random() - 0.5) * 0.3)),
        downtimeRisk: Math.min(30, Math.max(5, prev.downtimeRisk + (Math.random() - 0.5) * 0.5)),
        powerOutput: Math.max(30, prev.powerOutput + (Math.random() - 0.5) * 1),
        activeAlarms: prev.activeAlarms,
        co2Savings: prev.co2Savings + Math.random() * 0.02,
        uptime: prev.uptime,
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
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
              {t('dashboard.subtitle')} - Real-time monitoring, AI-driven insights, and immersive 3D visualization.
            </p>
          </div>
          <Link to="/vr">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
              <View className="w-5 h-5" />
              {t('vr.enterVR')}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={t('kpi.energyEfficiency')}
          value={kpis.energyEfficiency.toFixed(1)}
          unit="%"
          trend="up"
          trendValue="+2.1%"
          icon={<Zap className="w-5 h-5" />}
          status={kpis.energyEfficiency >= 90 ? 'normal' : 'warning'}
        />
        <KPICard
          title={t('kpi.loadPercentage')}
          value={kpis.loadPercentage.toFixed(0)}
          unit="%"
          trend="stable"
          icon={<Gauge className="w-5 h-5" />}
          status="normal"
        />
        <KPICard
          title={t('kpi.assetHealth')}
          value={kpis.assetHealth.toFixed(0)}
          unit="%"
          trend="down"
          trendValue="-1.2%"
          icon={<HeartPulse className="w-5 h-5" />}
          status={kpis.assetHealth >= 85 ? 'normal' : 'warning'}
        />
        <KPICard
          title={t('kpi.downtimeRisk')}
          value={kpis.downtimeRisk.toFixed(0)}
          unit="%"
          trend="up"
          trendValue="+3%"
          icon={<AlertTriangle className="w-5 h-5" />}
          status={kpis.downtimeRisk <= 15 ? 'normal' : kpis.downtimeRisk <= 25 ? 'warning' : 'critical'}
        />
      </div>
      
      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={t('kpi.powerOutput')}
          value={kpis.powerOutput.toFixed(1)}
          unit="MW"
          icon={<Activity className="w-5 h-5" />}
          status="normal"
        />
        <KPICard
          title={t('kpi.activeAlarms')}
          value={kpis.activeAlarms}
          icon={<AlertTriangle className="w-5 h-5" />}
          status={kpis.activeAlarms === 0 ? 'normal' : kpis.activeAlarms <= 2 ? 'warning' : 'critical'}
        />
        <KPICard
          title={t('kpi.co2Savings')}
          value={kpis.co2Savings.toFixed(1)}
          unit="tons"
          trend="up"
          icon={<Leaf className="w-5 h-5" />}
          status="normal"
        />
        <KPICard
          title={t('kpi.uptime')}
          value={kpis.uptime.toFixed(1)}
          unit="%"
          icon={<Timer className="w-5 h-5" />}
          status="normal"
        />
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
