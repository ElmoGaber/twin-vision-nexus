import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface SolarPanelData {
  id: string;
  status: 'normal' | 'warning' | 'critical';
  power: number;
  efficiency: number;
  temperature: number;
  position: [number, number, number];
}

export interface TransformerData {
  id: string;
  status: 'normal' | 'warning' | 'critical';
  load: number;
  temperature: number;
  position: [number, number, number];
}

export interface AlarmData {
  id: string;
  assetId: string;
  assetType: 'panel' | 'transformer' | 'inverter';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  position: [number, number, number];
}

export interface LiveMetrics {
  totalPower: number;
  efficiency: number;
  temperature: number;
  activeAlarms: number;
  irradiance: number;
  cloudCover: number;
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
}

const VRContext = createContext<VRContextType | undefined>(undefined);

// Generate initial solar panel data
const generatePanels = (): SolarPanelData[] => {
  const panels: SolarPanelData[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 12; col++) {
      const x = (col - 6) * 4 - 30;
      const z = (row - 4) * 5 + 20;
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      
      if (row === 3 && col >= 8) status = 'warning';
      if (row === 5 && col === 4) status = 'critical';
      
      panels.push({
        id: `SP-${String.fromCharCode(65 + row)}${col + 1}`,
        status,
        power: 25 + Math.random() * 10,
        efficiency: status === 'normal' ? 92 + Math.random() * 6 : 
                   status === 'warning' ? 75 + Math.random() * 10 : 50 + Math.random() * 15,
        temperature: status === 'critical' ? 65 + Math.random() * 10 : 35 + Math.random() * 15,
        position: [x, 0, z] as [number, number, number],
      });
    }
  }
  return panels;
};

const initialTransformers: TransformerData[] = [
  { id: 'T1', status: 'critical', load: 92, temperature: 78, position: [20, 0, -10] },
  { id: 'T2', status: 'normal', load: 65, temperature: 42, position: [25, 0, -10] },
];

const initialAlarms: AlarmData[] = [
  { 
    id: 'ALM-001', 
    assetId: 'T1', 
    assetType: 'transformer',
    severity: 'critical', 
    message: 'Transformer T1 overheating - Temperature exceeds threshold',
    timestamp: new Date(),
    position: [20, 0, -10]
  },
  { 
    id: 'ALM-002', 
    assetId: 'SP-D9', 
    assetType: 'panel',
    severity: 'warning', 
    message: 'Panel SP-D9 efficiency degradation detected',
    timestamp: new Date(Date.now() - 300000),
    position: [-22, 0, 25]
  },
  { 
    id: 'ALM-003', 
    assetId: 'SP-F5', 
    assetType: 'panel',
    severity: 'critical', 
    message: 'Panel SP-F5 critical failure - Immediate inspection required',
    timestamp: new Date(Date.now() - 600000),
    position: [-14, 0, 35]
  },
];

export const VRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [solarPanels, setSolarPanels] = useState<SolarPanelData[]>(generatePanels);
  const [transformers, setTransformers] = useState<TransformerData[]>(initialTransformers);
  const [alarms] = useState<AlarmData[]>(initialAlarms);
  const [navigationTarget, setNavigationTarget] = useState<VRNavigationTarget | null>(null);
  const [isInVR, setIsInVR] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([60, 25, 60]);
  
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    totalPower: 42.5,
    efficiency: 94.2,
    temperature: 32,
    activeAlarms: 3,
    irradiance: 850,
    cloudCover: 15,
  });
  
  const [recommendations, setRecommendations] = useState<string[]>([
    'Schedule maintenance for Transformer T1 within 2 hours',
    'Inspect panels SP-D9 through SP-D12 for dust accumulation',
    'Consider load balancing to reduce T1 stress',
  ]);
  
  const [riskScore, setRiskScore] = useState(35);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update live metrics
      setLiveMetrics(prev => ({
        totalPower: Math.max(30, prev.totalPower + (Math.random() - 0.5) * 2),
        efficiency: Math.min(100, Math.max(80, prev.efficiency + (Math.random() - 0.5) * 0.5)),
        temperature: Math.max(25, Math.min(45, prev.temperature + (Math.random() - 0.5) * 0.5)),
        activeAlarms: prev.activeAlarms,
        irradiance: Math.max(600, Math.min(1000, prev.irradiance + (Math.random() - 0.5) * 20)),
        cloudCover: Math.max(0, Math.min(100, prev.cloudCover + (Math.random() - 0.5) * 5)),
      }));
      
      // Update panel data
      setSolarPanels(prev => prev.map(panel => ({
        ...panel,
        power: panel.status === 'critical' ? panel.power : 
               Math.max(20, Math.min(40, panel.power + (Math.random() - 0.5) * 2)),
        temperature: Math.max(30, Math.min(
          panel.status === 'critical' ? 80 : 55, 
          panel.temperature + (Math.random() - 0.5) * 1
        )),
      })));
      
      // Update transformer data
      setTransformers(prev => prev.map(t => ({
        ...t,
        load: Math.max(40, Math.min(100, t.load + (Math.random() - 0.5) * 2)),
        temperature: t.status === 'critical' 
          ? Math.min(85, t.temperature + Math.random() * 0.5)
          : Math.max(35, Math.min(55, t.temperature + (Math.random() - 0.5) * 1)),
      })));
      
      // Update risk score
      setRiskScore(prev => Math.max(10, Math.min(80, prev + (Math.random() - 0.5) * 3)));
      
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const navigateToAsset = useCallback((target: VRNavigationTarget) => {
    setNavigationTarget(target);
    setIsInVR(true);
  }, []);
  
  const clearNavigationTarget = useCallback(() => {
    setNavigationTarget(null);
  }, []);
  
  return (
    <VRContext.Provider value={{
      solarPanels,
      transformers,
      alarms,
      liveMetrics,
      navigationTarget,
      navigateToAsset,
      clearNavigationTarget,
      isInVR,
      setIsInVR,
      cameraPosition,
      setCameraPosition,
      recommendations,
      riskScore,
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
