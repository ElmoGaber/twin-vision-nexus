import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface SolarPanelData {
  id: string;
  status: 'normal' | 'warning' | 'critical';
  power: number;
  efficiency: number;
  temperature: number;
  position: [number, number, number];
  predictedFailure?: {
    probability: number;
    estimatedDays: number;
    reason: string;
  };
}

export interface TransformerData {
  id: string;
  status: 'normal' | 'warning' | 'critical';
  load: number;
  temperature: number;
  position: [number, number, number];
  predictedFailure?: {
    probability: number;
    estimatedDays: number;
    reason: string;
  };
}

export interface AlarmData {
  id: string;
  assetId: string;
  assetType: 'panel' | 'transformer' | 'inverter';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  position: [number, number, number];
  aiRecommendation?: string;
  autoResolution?: {
    available: boolean;
    action: string;
    estimatedTime: number;
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  cloudCover: number;
  irradiance: number;
  uvIndex: number;
  dustLevel: number;
  condition: 'clear' | 'partly_cloudy' | 'cloudy' | 'sandstorm' | 'rain';
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: Date;
  tempHigh: number;
  tempLow: number;
  cloudCover: number;
  irradiance: number;
  condition: 'clear' | 'partly_cloudy' | 'cloudy' | 'sandstorm' | 'rain';
}

export interface ProductionPrediction {
  daily: {
    date: Date;
    predicted: number;
    confidence: number;
    weatherImpact: number;
  }[];
  monthly: {
    month: string;
    predicted: number;
    confidence: number;
    factors: {
      weather: number;
      degradation: number;
      maintenance: number;
    };
  }[];
  nextDay: {
    total: number;
    hourly: { hour: number; predicted: number }[];
    confidence: number;
  };
  nextMonth: {
    total: number;
    daily: { day: number; predicted: number }[];
    confidence: number;
  };
}

export interface MaintenancePrediction {
  assetId: string;
  assetType: 'panel' | 'transformer' | 'inverter';
  failureProbability: number;
  estimatedDaysToFailure: number;
  reason: string;
  recommendedAction: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  roi: number;
}

export interface DecisionLayer {
  id: string;
  type: 'optimization' | 'maintenance' | 'emergency' | 'efficiency';
  title: string;
  description: string;
  impact: number;
  confidence: number;
  action: string;
  automated: boolean;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'rejected';
  createdAt: Date;
}

export interface LiveMetrics {
  totalPower: number;
  efficiency: number;
  temperature: number;
  activeAlarms: number;
  irradiance: number;
  cloudCover: number;
  predictedPowerNextHour: number;
  weatherImpactFactor: number;
  systemHealth: number;
  carbonOffset: number;
}

export interface VRNavigationTarget {
  assetId: string;
  assetType: string;
  position: [number, number, number];
  focus: boolean;
}

interface VRContextType {
  // Shared data
  solarPanels: SolarPanelData[];
  transformers: TransformerData[];
  alarms: AlarmData[];
  liveMetrics: LiveMetrics;
  
  // Weather
  weather: WeatherData;
  
  // Predictions
  productionPrediction: ProductionPrediction;
  maintenancePredictions: MaintenancePrediction[];
  
  // Decision Layers
  decisionLayers: DecisionLayer[];
  approveDecision: (id: string) => void;
  rejectDecision: (id: string) => void;
  executeDecision: (id: string) => void;
  
  // Alarm Management
  resolveAlarm: (id: string, action: string) => void;
  acknowledgeAlarm: (id: string) => void;
  
  // Navigation
  navigationTarget: VRNavigationTarget | null;
  navigateToAsset: (target: VRNavigationTarget) => void;
  clearNavigationTarget: () => void;
  
  // VR State
  isInVR: boolean;
  setIsInVR: (value: boolean) => void;
  cameraPosition: [number, number, number];
  setCameraPosition: (pos: [number, number, number]) => void;
  
  // Decision Support
  recommendations: string[];
  riskScore: number;
  
  // Real-time sync
  lastUpdate: Date;
  syncStatus: 'connected' | 'syncing' | 'disconnected';
}

const VRContext = createContext<VRContextType | undefined>(undefined);

// Generate initial solar panel data with predictions
const generatePanels = (): SolarPanelData[] => {
  const panels: SolarPanelData[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 12; col++) {
      const x = (col - 6) * 4 - 30;
      const z = (row - 4) * 5 + 20;
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      let predictedFailure: SolarPanelData['predictedFailure'] = undefined;
      
      if (row === 3 && col >= 8) {
        status = 'warning';
        predictedFailure = {
          probability: 35 + Math.random() * 20,
          estimatedDays: 14 + Math.floor(Math.random() * 10),
          reason: 'Efficiency degradation pattern detected'
        };
      }
      if (row === 5 && col === 4) {
        status = 'critical';
        predictedFailure = {
          probability: 85 + Math.random() * 10,
          estimatedDays: 2 + Math.floor(Math.random() * 3),
          reason: 'Thermal stress exceeding limits'
        };
      }
      if (row === 2 && col === 7) {
        predictedFailure = {
          probability: 25 + Math.random() * 15,
          estimatedDays: 30 + Math.floor(Math.random() * 15),
          reason: 'Early degradation indicators'
        };
      }
      
      panels.push({
        id: `SP-${String.fromCharCode(65 + row)}${col + 1}`,
        status,
        power: 25 + Math.random() * 10,
        efficiency: status === 'normal' ? 92 + Math.random() * 6 : 
                   status === 'warning' ? 75 + Math.random() * 10 : 50 + Math.random() * 15,
        temperature: status === 'critical' ? 65 + Math.random() * 10 : 35 + Math.random() * 15,
        position: [x, 0, z] as [number, number, number],
        predictedFailure,
      });
    }
  }
  return panels;
};

const initialTransformers: TransformerData[] = [
  { 
    id: 'T1', 
    status: 'critical', 
    load: 92, 
    temperature: 78, 
    position: [20, 0, -10],
    predictedFailure: {
      probability: 75,
      estimatedDays: 3,
      reason: 'Continuous overheating causing winding insulation degradation'
    }
  },
  { 
    id: 'T2', 
    status: 'normal', 
    load: 65, 
    temperature: 42, 
    position: [25, 0, -10],
    predictedFailure: undefined
  },
];

const initialAlarms: AlarmData[] = [
  { 
    id: 'ALM-001', 
    assetId: 'T1', 
    assetType: 'transformer',
    severity: 'critical', 
    message: 'Transformer T1 overheating - Temperature exceeds threshold',
    timestamp: new Date(),
    position: [20, 0, -10],
    aiRecommendation: 'Reduce load by 20% and schedule cooling system inspection within 2 hours',
    autoResolution: {
      available: true,
      action: 'Automatic load redistribution to T2',
      estimatedTime: 5
    }
  },
  { 
    id: 'ALM-002', 
    assetId: 'SP-D9', 
    assetType: 'panel',
    severity: 'warning', 
    message: 'Panel SP-D9 efficiency degradation detected',
    timestamp: new Date(Date.now() - 300000),
    position: [-22, 0, 25],
    aiRecommendation: 'Schedule cleaning operation - dust accumulation likely',
    autoResolution: {
      available: false,
      action: 'Manual inspection required',
      estimatedTime: 30
    }
  },
  { 
    id: 'ALM-003', 
    assetId: 'SP-F5', 
    assetType: 'panel',
    severity: 'critical', 
    message: 'Panel SP-F5 critical failure - Immediate inspection required',
    timestamp: new Date(Date.now() - 600000),
    position: [-14, 0, 35],
    aiRecommendation: 'Isolate panel and dispatch maintenance team - possible inverter failure',
    autoResolution: {
      available: true,
      action: 'Automatic bypass and isolation',
      estimatedTime: 2
    }
  },
];

const generateWeatherData = (): WeatherData => {
  const conditions: WeatherData['condition'][] = ['clear', 'partly_cloudy', 'cloudy'];
  const forecast: WeatherForecast[] = [];
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    forecast.push({
      date,
      tempHigh: 35 + Math.random() * 10,
      tempLow: 20 + Math.random() * 8,
      cloudCover: Math.random() * 40,
      irradiance: 750 + Math.random() * 250,
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    });
  }
  
  return {
    temperature: 32 + Math.random() * 8,
    humidity: 25 + Math.random() * 20,
    windSpeed: 5 + Math.random() * 15,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    cloudCover: 10 + Math.random() * 25,
    irradiance: 800 + Math.random() * 200,
    uvIndex: 7 + Math.random() * 4,
    dustLevel: 15 + Math.random() * 30,
    condition: conditions[Math.floor(Math.random() * 2)],
    forecast
  };
};

const generateProductionPrediction = (weather: WeatherData): ProductionPrediction => {
  const dailyPredictions = [];
  const monthlyPredictions = [];
  
  // Daily predictions for next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const weatherImpact = weather.forecast[i] ? 
      (100 - weather.forecast[i].cloudCover) / 100 * (weather.forecast[i].irradiance / 1000) : 0.85;
    
    dailyPredictions.push({
      date,
      predicted: 45 * weatherImpact * (0.95 + Math.random() * 0.1),
      confidence: 85 + Math.random() * 10,
      weatherImpact: weatherImpact * 100
    });
  }
  
  // Monthly predictions for next 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  for (let i = 0; i < 6; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const seasonFactor = monthIndex >= 3 && monthIndex <= 8 ? 1.1 : 0.85;
    
    monthlyPredictions.push({
      month: months[monthIndex],
      predicted: 1200 * seasonFactor * (0.9 + Math.random() * 0.2),
      confidence: 75 + Math.random() * 15,
      factors: {
        weather: 85 + Math.random() * 10,
        degradation: 2 + Math.random() * 3,
        maintenance: 3 + Math.random() * 4
      }
    });
  }
  
  // Next day hourly prediction
  const hourlyPredictions = [];
  for (let h = 6; h <= 18; h++) {
    const sunFactor = 1 - Math.pow((h - 12) / 6, 2);
    hourlyPredictions.push({
      hour: h,
      predicted: 40 * sunFactor * (0.9 + Math.random() * 0.2)
    });
  }
  
  // Next month daily prediction
  const dailyMonthPredictions = [];
  for (let d = 1; d <= 30; d++) {
    dailyMonthPredictions.push({
      day: d,
      predicted: 42 * (0.85 + Math.random() * 0.3)
    });
  }
  
  return {
    daily: dailyPredictions,
    monthly: monthlyPredictions,
    nextDay: {
      total: hourlyPredictions.reduce((sum, h) => sum + h.predicted, 0),
      hourly: hourlyPredictions,
      confidence: 92
    },
    nextMonth: {
      total: dailyMonthPredictions.reduce((sum, d) => sum + d.predicted, 0),
      daily: dailyMonthPredictions,
      confidence: 78
    }
  };
};

const generateMaintenancePredictions = (panels: SolarPanelData[], transformers: TransformerData[]): MaintenancePrediction[] => {
  const predictions: MaintenancePrediction[] = [];
  
  // Check panels
  panels.forEach(panel => {
    if (panel.predictedFailure && panel.predictedFailure.probability > 20) {
      let urgency: MaintenancePrediction['urgency'] = 'low';
      if (panel.predictedFailure.probability > 70) urgency = 'critical';
      else if (panel.predictedFailure.probability > 50) urgency = 'high';
      else if (panel.predictedFailure.probability > 30) urgency = 'medium';
      
      predictions.push({
        assetId: panel.id,
        assetType: 'panel',
        failureProbability: panel.predictedFailure.probability,
        estimatedDaysToFailure: panel.predictedFailure.estimatedDays,
        reason: panel.predictedFailure.reason,
        recommendedAction: urgency === 'critical' ? 'Immediate replacement required' :
                          urgency === 'high' ? 'Schedule maintenance within 48 hours' :
                          urgency === 'medium' ? 'Plan preventive maintenance' :
                          'Monitor closely',
        urgency,
        estimatedCost: urgency === 'critical' ? 5000 : urgency === 'high' ? 2000 : 500,
        roi: urgency === 'critical' ? 450 : urgency === 'high' ? 280 : 150
      });
    }
  });
  
  // Check transformers
  transformers.forEach(transformer => {
    if (transformer.predictedFailure) {
      predictions.push({
        assetId: transformer.id,
        assetType: 'transformer',
        failureProbability: transformer.predictedFailure.probability,
        estimatedDaysToFailure: transformer.predictedFailure.estimatedDays,
        reason: transformer.predictedFailure.reason,
        recommendedAction: 'Reduce load and schedule comprehensive inspection',
        urgency: transformer.predictedFailure.probability > 70 ? 'critical' : 'high',
        estimatedCost: 15000,
        roi: 850
      });
    }
  });
  
  return predictions.sort((a, b) => b.failureProbability - a.failureProbability);
};

const generateDecisionLayers = (): DecisionLayer[] => [
  {
    id: 'DEC-001',
    type: 'emergency',
    title: 'Critical Load Redistribution',
    description: 'Transformer T1 is overheating. Redistribute 20% load to T2 to prevent failure.',
    impact: 95,
    confidence: 92,
    action: 'AUTO_LOAD_BALANCE',
    automated: true,
    status: 'pending',
    createdAt: new Date()
  },
  {
    id: 'DEC-002',
    type: 'maintenance',
    title: 'Predictive Panel Cleaning',
    description: 'AI detected dust accumulation on panels D9-D12. Schedule cleaning for optimal efficiency.',
    impact: 45,
    confidence: 88,
    action: 'SCHEDULE_CLEANING',
    automated: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'DEC-003',
    type: 'optimization',
    title: 'Sun Tracking Angle Adjustment',
    description: 'Based on weather forecast, adjust panel angles by 5° for next 3 days to maximize output.',
    impact: 35,
    confidence: 85,
    action: 'ADJUST_TRACKING',
    automated: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'DEC-004',
    type: 'efficiency',
    title: 'Inverter Mode Optimization',
    description: 'Switch inverter cluster 2 to high-efficiency mode during peak hours (11:00-15:00).',
    impact: 28,
    confidence: 91,
    action: 'SWITCH_MODE',
    automated: true,
    status: 'executing',
    createdAt: new Date(Date.now() - 1800000)
  }
];

export const VRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [solarPanels, setSolarPanels] = useState<SolarPanelData[]>(generatePanels);
  const [transformers, setTransformers] = useState<TransformerData[]>(initialTransformers);
  const [alarms, setAlarms] = useState<AlarmData[]>(initialAlarms);
  const [navigationTarget, setNavigationTarget] = useState<VRNavigationTarget | null>(null);
  const [isInVR, setIsInVR] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([60, 25, 60]);
  const [weather, setWeather] = useState<WeatherData>(generateWeatherData);
  const [decisionLayers, setDecisionLayers] = useState<DecisionLayer[]>(generateDecisionLayers);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');
  
  const [productionPrediction, setProductionPrediction] = useState<ProductionPrediction>(() => 
    generateProductionPrediction(generateWeatherData())
  );
  
  const [maintenancePredictions, setMaintenancePredictions] = useState<MaintenancePrediction[]>(() =>
    generateMaintenancePredictions(generatePanels(), initialTransformers)
  );
  
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    totalPower: 42.5,
    efficiency: 94.2,
    temperature: 32,
    activeAlarms: 3,
    irradiance: 850,
    cloudCover: 15,
    predictedPowerNextHour: 44.2,
    weatherImpactFactor: 0.95,
    systemHealth: 87,
    carbonOffset: 156.8
  });
  
  const [recommendations, setRecommendations] = useState<string[]>([
    'Schedule maintenance for Transformer T1 within 2 hours',
    'Inspect panels SP-D9 through SP-D12 for dust accumulation',
    'Consider load balancing to reduce T1 stress',
    'Weather forecast: Clear skies next 3 days - optimal production expected',
    'AI detected 3 panels with early degradation signs - preventive action recommended'
  ]);
  
  const [riskScore, setRiskScore] = useState(35);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing');
      
      // Calculate weather impact
      const weatherImpact = (100 - weather.cloudCover) / 100 * (weather.irradiance / 1000);
      
      // Update live metrics with weather consideration
      setLiveMetrics(prev => ({
        totalPower: Math.max(20, Math.min(50, prev.totalPower + (Math.random() - 0.5) * 2 * weatherImpact)),
        efficiency: Math.min(100, Math.max(80, prev.efficiency + (Math.random() - 0.5) * 0.5)),
        temperature: Math.max(25, Math.min(45, prev.temperature + (Math.random() - 0.5) * 0.5)),
        activeAlarms: alarms.length,
        irradiance: Math.max(600, Math.min(1000, prev.irradiance + (Math.random() - 0.5) * 20)),
        cloudCover: Math.max(0, Math.min(100, prev.cloudCover + (Math.random() - 0.5) * 5)),
        predictedPowerNextHour: prev.totalPower * 1.02 * weatherImpact,
        weatherImpactFactor: weatherImpact,
        systemHealth: Math.min(100, Math.max(70, prev.systemHealth + (Math.random() - 0.5) * 0.5)),
        carbonOffset: prev.carbonOffset + Math.random() * 0.02
      }));
      
      // Update panel data with weather effects
      setSolarPanels(prev => prev.map(panel => ({
        ...panel,
        power: panel.status === 'critical' ? panel.power : 
               Math.max(15, Math.min(40, panel.power + (Math.random() - 0.5) * 2 * weatherImpact)),
        temperature: Math.max(25, Math.min(
          panel.status === 'critical' ? 80 : 55, 
          panel.temperature + (Math.random() - 0.5) * 1 + (weather.temperature - 30) * 0.1
        )),
        efficiency: panel.status === 'critical' ? panel.efficiency :
                   Math.max(60, Math.min(98, panel.efficiency + (Math.random() - 0.5) * 0.3 * weatherImpact)),
      })));
      
      // Update transformer data
      setTransformers(prev => prev.map(t => ({
        ...t,
        load: Math.max(40, Math.min(100, t.load + (Math.random() - 0.5) * 2)),
        temperature: t.status === 'critical' 
          ? Math.min(85, t.temperature + Math.random() * 0.5)
          : Math.max(35, Math.min(55, t.temperature + (Math.random() - 0.5) * 1)),
      })));
      
      // Update weather
      setWeather(prev => ({
        ...prev,
        temperature: Math.max(25, Math.min(45, prev.temperature + (Math.random() - 0.5) * 0.5)),
        cloudCover: Math.max(0, Math.min(60, prev.cloudCover + (Math.random() - 0.5) * 3)),
        irradiance: Math.max(600, Math.min(1000, prev.irradiance + (Math.random() - 0.5) * 10)),
        dustLevel: Math.max(0, Math.min(100, prev.dustLevel + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, Math.min(30, prev.windSpeed + (Math.random() - 0.5) * 2)),
      }));
      
      // Update risk score
      setRiskScore(prev => Math.max(10, Math.min(80, prev + (Math.random() - 0.5) * 3)));
      
      setLastUpdate(new Date());
      setSyncStatus('connected');
      
    }, 2000);
    
    return () => clearInterval(interval);
  }, [weather, alarms.length]);
  
  // Update predictions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProductionPrediction(generateProductionPrediction(weather));
      setMaintenancePredictions(generateMaintenancePredictions(solarPanels, transformers));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [weather, solarPanels, transformers]);
  
  const navigateToAsset = useCallback((target: VRNavigationTarget) => {
    setNavigationTarget(target);
    setIsInVR(true);
  }, []);
  
  const clearNavigationTarget = useCallback(() => {
    setNavigationTarget(null);
  }, []);
  
  const resolveAlarm = useCallback((id: string, action: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
    // Update related asset status
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
      if (alarm.assetType === 'panel') {
        setSolarPanels(prev => prev.map(p => 
          p.id === alarm.assetId ? { ...p, status: 'normal' as const } : p
        ));
      } else if (alarm.assetType === 'transformer') {
        setTransformers(prev => prev.map(t => 
          t.id === alarm.assetId ? { ...t, status: 'normal' as const } : t
        ));
      }
    }
  }, [alarms]);
  
  const acknowledgeAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.map(a => 
      a.id === id ? { ...a, severity: 'warning' as const } : a
    ));
  }, []);
  
  const approveDecision = useCallback((id: string) => {
    setDecisionLayers(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'approved' as const } : d
    ));
  }, []);
  
  const rejectDecision = useCallback((id: string) => {
    setDecisionLayers(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'rejected' as const } : d
    ));
  }, []);
  
  const executeDecision = useCallback((id: string) => {
    setDecisionLayers(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'executing' as const } : d
    ));
    
    // Simulate execution completion
    setTimeout(() => {
      setDecisionLayers(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'completed' as const } : d
      ));
    }, 5000);
  }, []);
  
  return (
    <VRContext.Provider value={{
      solarPanels,
      transformers,
      alarms,
      liveMetrics,
      weather,
      productionPrediction,
      maintenancePredictions,
      decisionLayers,
      approveDecision,
      rejectDecision,
      executeDecision,
      resolveAlarm,
      acknowledgeAlarm,
      navigationTarget,
      navigateToAsset,
      clearNavigationTarget,
      isInVR,
      setIsInVR,
      cameraPosition,
      setCameraPosition,
      recommendations,
      riskScore,
      lastUpdate,
      syncStatus
    }}>
      {children}
    </VRContext.Provider>
  );
};

export const useVR = () => {
  const context = useContext(VRContext);
  if (!context) {
    throw new Error('useVR must be used within a VRProvider');
  }
  return context;
};
