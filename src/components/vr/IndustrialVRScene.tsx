import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVR, SolarPanelData, TransformerData } from '@/contexts/VRContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Thermometer, 
  Gauge, 
  AlertTriangle, 
  Sun, 
  Cloud,
  Brain,
  Target,
  Navigation,
  Eye,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Building2,
  Factory
} from 'lucide-react';

// First Person Camera Controller
const FirstPersonController: React.FC<{ 
  navigationTarget: { position: [number, number, number] } | null;
  onClearTarget: () => void;
}> = ({ navigationTarget, onClearTarget }) => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  
  useEffect(() => {
    if (navigationTarget) {
      const targetVec = new THREE.Vector3(...navigationTarget.position);
      const offset = new THREE.Vector3(8, 4, 8);
      targetPosition.current = targetVec.clone().add(offset);
    }
  }, [navigationTarget]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
      if (e.key === 'Shift') keys.current.shift = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
      if (e.key === 'Shift') keys.current.shift = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((state, delta) => {
    if (targetPosition.current) {
      const distance = camera.position.distanceTo(targetPosition.current);
      if (distance > 1) {
        camera.position.lerp(targetPosition.current, 0.02);
        const targetLook = new THREE.Vector3(...(navigationTarget?.position || [0, 2, 0]));
        camera.lookAt(targetLook);
      } else {
        targetPosition.current = null;
        onClearTarget();
      }
      return;
    }
    
    const speed = keys.current.shift ? 40 : 20;
    direction.current.set(0, 0, 0);
    
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;
    
    if (direction.current.length() > 0) {
      direction.current.normalize();
      
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
      
      velocity.current.set(0, 0, 0);
      velocity.current.addScaledVector(forward, -direction.current.z);
      velocity.current.addScaledVector(right, direction.current.x);
      velocity.current.multiplyScalar(speed * delta);
      
      camera.position.add(velocity.current);
      camera.position.y = Math.max(3, Math.min(30, camera.position.y));
    }
  });
  
  return null;
};

// Enhanced Solar Panel with expandable info
const EnhancedSolarPanel: React.FC<{ 
  panel: SolarPanelData;
  isSelected: boolean;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ panel, isSelected, onClick, isExpanded }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const statusColors = {
    normal: '#22c55e',
    warning: '#eab308',
    critical: '#ef4444',
  };
  
  useFrame(() => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
      } else if (panel.status === 'critical') {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });
  
  return (
    <group position={panel.position} rotation={[-0.3, 0, 0]}>
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 0.1, 3]} />
        <meshStandardMaterial 
          color={hovered || isSelected ? '#1e40af' : '#1e3a5f'} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.9, 0.02, 2.9]} />
        <meshStandardMaterial color="#0a1628" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} />
      </mesh>
      
      <mesh position={[0.8, 0.1, 1.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={statusColors[panel.status]} 
          emissive={statusColors[panel.status]}
          emissiveIntensity={panel.status === 'critical' ? 1 : 0.5}
        />
      </mesh>
      
      {(hovered || isSelected) && (
        <Html position={[0, 2.5, 0]} center distanceFactor={15}>
          <div className={`bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl pointer-events-none transition-all duration-300 ${isExpanded ? 'p-4 min-w-[280px]' : 'p-2 min-w-[150px]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-foreground">{panel.id}</span>
              <Badge 
                variant="outline"
                className={`text-xs ${
                  panel.status === 'normal' ? 'border-status-normal text-status-normal' :
                  panel.status === 'warning' ? 'border-status-warning text-status-warning' :
                  'border-status-critical text-status-critical animate-pulse'
                }`}
              >
                {panel.status.toUpperCase()}
              </Badge>
            </div>
            
            {isExpanded && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="w-3 h-3" /> Power
                  </span>
                  <span className="font-mono text-foreground">{panel.power.toFixed(1)} kW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Gauge className="w-3 h-3" /> Efficiency
                  </span>
                  <span className="font-mono text-foreground">{panel.efficiency.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Thermometer className="w-3 h-3" /> Temperature
                  </span>
                  <span className={`font-mono ${panel.temperature > 55 ? 'text-status-critical' : 'text-foreground'}`}>
                    {panel.temperature.toFixed(1)}°C
                  </span>
                </div>
                
                {panel.status !== 'normal' && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-status-warning">
                      {panel.status === 'warning' && '⚠️ Efficiency degradation'}
                      {panel.status === 'critical' && '🚨 Immediate inspection required'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Enhanced Transformer
const EnhancedTransformer: React.FC<{ 
  transformer: TransformerData;
  isSelected: boolean;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ transformer, isSelected, onClick, isExpanded }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && transformer.status === 'critical') {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.03);
    }
  });
  
  return (
    <group position={transformer.position}>
      <mesh 
        ref={meshRef}
        position={[0, 1.5, 0]} 
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[2, 3, 1.5]} />
        <meshStandardMaterial 
          color={transformer.status === 'critical' ? '#7f1d1d' : '#374151'} 
          metalness={0.5} 
        />
      </mesh>
      
      {[-0.6, 0, 0.6].map((z, i) => (
        <mesh key={i} position={[1.05, 1.5, z]}>
          <boxGeometry args={[0.1, 2.5, 0.3]} />
          <meshStandardMaterial color="#4b5563" metalness={0.6} />
        </mesh>
      ))}
      
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
      ))}
      
      {transformer.status === 'critical' && (
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={1 + Math.sin(Date.now() * 0.01) * 0.5}
          />
        </mesh>
      )}
      
      {(hovered || isSelected) && (
        <Html position={[0, 5.5, 0]} center distanceFactor={15}>
          <div className={`bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl pointer-events-none transition-all duration-300 ${isExpanded ? 'p-4 min-w-[240px]' : 'p-2 min-w-[150px]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-foreground">{transformer.id}</span>
              <Badge 
                variant="outline"
                className={transformer.status === 'critical' 
                  ? 'border-status-critical text-status-critical animate-pulse' 
                  : 'border-status-normal text-status-normal'}
              >
                {transformer.status.toUpperCase()}
              </Badge>
            </div>
            
            {isExpanded && (
              <div className="space-y-2 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Load</span>
                    <span className="font-mono">{transformer.load.toFixed(0)}%</span>
                  </div>
                  <Progress value={transformer.load} className="h-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className={`font-mono ${transformer.temperature > 70 ? 'text-status-critical' : 'text-foreground'}`}>
                    {transformer.temperature.toFixed(1)}°C
                  </span>
                </div>
                
                {transformer.status === 'critical' && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-status-critical animate-pulse">
                      🚨 OVERHEATING - Schedule maintenance
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Industrial Building Component
const IndustrialBuilding: React.FC<{ 
  position: [number, number, number];
  size: [number, number, number];
  type: 'warehouse' | 'office' | 'control' | 'storage';
  label?: string;
}> = ({ position, size, type, label }) => {
  const colors = {
    warehouse: '#4b5563',
    office: '#374151',
    control: '#1f2937',
    storage: '#6b7280'
  };
  
  return (
    <group position={position}>
      {/* Main structure */}
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={colors[type]} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Roof */}
      {type === 'warehouse' ? (
        <mesh position={[0, size[1] + 1.5, 0]} castShadow>
          <coneGeometry args={[size[0] * 0.7, 3, 4]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.4} />
        </mesh>
      ) : (
        <mesh position={[0, size[1] + 0.5, 0]} castShadow>
          <boxGeometry args={[size[0] + 0.5, 1, size[2] + 0.5]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.4} />
        </mesh>
      )}
      
      {/* Windows */}
      {type === 'office' && (
        <>
          {[-size[0]/3, 0, size[0]/3].map((x, i) => (
            <mesh key={i} position={[x, size[1]/2, size[2]/2 + 0.01]}>
              <boxGeometry args={[1.5, 2, 0.1]} />
              <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.3} transparent opacity={0.8} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Control room windows */}
      {type === 'control' && (
        <>
          {[-size[0]/4, size[0]/4].map((x, i) => (
            <mesh key={i} position={[x, size[1] * 0.6, size[2]/2 + 0.01]}>
              <boxGeometry args={[2, 1.5, 0.1]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.8} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Door */}
      <mesh position={[0, 1.5, size[2]/2 + 0.01]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Html position={[0, size[1] + 3, 0]} center>
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold shadow-lg whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

// Tank/Silo Component
const StorageTank: React.FC<{ position: [number, number, number]; height: number; radius: number }> = ({ position, height, radius }) => {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 24]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, height + 0.5, 0]} castShadow>
        <sphereGeometry args={[radius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} />
      </mesh>
    </group>
  );
};

// Ground with road
const IndustrialGround: React.FC = () => {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[250, 250]} />
        <meshStandardMaterial color="#c4a574" roughness={1} />
      </mesh>
      
      {/* Roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 200]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -60]} receiveShadow>
        <planeGeometry args={[150, 8]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      
      {/* Road markings */}
      {[-80, -40, 0, 40, 80].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]} receiveShadow>
          <planeGeometry args={[0.3, 5]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      ))}
      
      {/* Concrete areas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-30, 0.02, -40]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.02, -40]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Fence
const Fence: React.FC<{ start: [number, number, number]; end: [number, number, number] }> = ({ start, end }) => {
  const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2));
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  
  return (
    <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
      {/* Posts */}
      {Array.from({ length: Math.ceil(length / 5) }).map((_, i) => (
        <mesh key={i} position={[i * 5 - length / 2, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.5} />
        </mesh>
      ))}
      {/* Wire mesh */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[length, 2.5, 0.05]} />
        <meshStandardMaterial color="#9ca3af" transparent opacity={0.5} wireframe />
      </mesh>
    </group>
  );
};

// Expandable HUD Panel
const ExpandablePanel: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: React.ReactNode;
}> = ({ title, icon, children, defaultExpanded = true, badge }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-foreground">{title}</span>
          {badge}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </Card>
  );
};

// Enhanced HUD
const EnhancedHUD: React.FC<{ 
  isInfoExpanded: boolean; 
  setIsInfoExpanded: (v: boolean) => void 
}> = ({ isInfoExpanded, setIsInfoExpanded }) => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const { liveMetrics, recommendations, riskScore, alarms } = useVR();
  
  return (
    <>
      {/* Top Left - Expandable Panels */}
      <div className="absolute top-4 left-4 z-10 space-y-2 max-w-[320px]">
        <ExpandablePanel 
          title={isArabic ? 'البيانات الحية' : 'Live Metrics'}
          icon={<Eye className="w-4 h-4 text-primary" />}
          badge={
            <Badge variant="outline" className="border-status-normal text-status-normal text-xs">
              <span className="w-2 h-2 rounded-full bg-status-normal mr-1 animate-pulse" />
              LIVE
            </Badge>
          }
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3" /> {isArabic ? 'الطاقة' : 'Power'}
              </span>
              <span className="text-xl font-mono font-bold text-status-normal">
                {liveMetrics.totalPower.toFixed(1)} MW
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Gauge className="w-3 h-3" /> {isArabic ? 'الكفاءة' : 'Efficiency'}
              </span>
              <span className="text-xl font-mono font-bold text-foreground">
                {liveMetrics.efficiency.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Sun className="w-3 h-3" /> {isArabic ? 'الإشعاع' : 'Irradiance'}
              </span>
              <span className="text-lg font-mono text-foreground">
                {liveMetrics.irradiance.toFixed(0)} W/m²
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Cloud className="w-3 h-3" /> {isArabic ? 'السحب' : 'Cloud'}
              </span>
              <span className="text-lg font-mono text-foreground">
                {liveMetrics.cloudCover.toFixed(0)}%
              </span>
            </div>
          </div>
        </ExpandablePanel>
        
        <ExpandablePanel 
          title={isArabic ? 'التنبيهات' : 'Active Alarms'}
          icon={<AlertTriangle className="w-4 h-4 text-status-critical" />}
          defaultExpanded={false}
          badge={<Badge variant="destructive" className="text-xs">{alarms.length}</Badge>}
        >
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {alarms.slice(0, 5).map(alarm => (
              <div 
                key={alarm.id} 
                className={`text-xs p-2 rounded border ${
                  alarm.severity === 'critical' 
                    ? 'border-status-critical/50 bg-status-critical/10' 
                    : 'border-status-warning/50 bg-status-warning/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    alarm.severity === 'critical' ? 'bg-status-critical animate-pulse' : 'bg-status-warning'
                  }`} />
                  <span className="font-mono">{alarm.assetId}</span>
                </div>
                <p className="text-muted-foreground mt-1 truncate">{alarm.message}</p>
              </div>
            ))}
          </div>
        </ExpandablePanel>
      </div>
      
      {/* Top Right - AI Panel */}
      <div className="absolute top-4 right-4 z-10 max-w-[320px]">
        <ExpandablePanel 
          title={isArabic ? 'دعم القرار بالذكاء الاصطناعي' : 'AI Decision Support'}
          icon={<Brain className="w-4 h-4 text-primary" />}
          defaultExpanded={false}
          badge={
            <Badge 
              variant="outline" 
              className={`text-xs ${
                riskScore < 30 ? 'border-status-normal text-status-normal' :
                riskScore < 60 ? 'border-status-warning text-status-warning' :
                'border-status-critical text-status-critical'
              }`}
            >
              {isArabic ? 'المخاطر' : 'Risk'}: {riskScore.toFixed(0)}%
            </Badge>
          }
        >
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {isArabic ? 'التوصيات' : 'Recommendations'}
            </p>
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Target className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </ExpandablePanel>
      </div>
      
      {/* Expand/Shrink Button */}
      <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="bg-card/90 backdrop-blur-sm"
        >
          {isInfoExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Bottom - Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Card className="bg-card/90 backdrop-blur-sm border-border px-6 py-3">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>WASD</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span>{isArabic ? 'اسحب للنظر' : 'Drag to look'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{isArabic ? 'انقر للفحص' : 'Click to inspect'}</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

// Main Industrial VR Scene
export const IndustrialVRScene: React.FC = () => {
  const { solarPanels, transformers, navigationTarget, clearNavigationTarget } = useVR();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  
  return (
    <div className="relative w-full h-full min-h-[600px] rounded-lg overflow-hidden border border-border">
      <EnhancedHUD isInfoExpanded={isInfoExpanded} setIsInfoExpanded={setIsInfoExpanded} />
      
      <Canvas shadows className="bg-background">
        <Suspense fallback={null}>
          <FirstPersonController 
            navigationTarget={navigationTarget}
            onClearTarget={clearNavigationTarget}
          />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={200}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
          
          <Sky 
            distance={450000}
            sunPosition={[50, 25, 50]}
            inclination={0.6}
            azimuth={0.25}
          />
          
          <IndustrialGround />
          
          {/* Industrial Buildings */}
          <IndustrialBuilding 
            position={[-35, 0, -40]} 
            size={[20, 12, 15]} 
            type="control" 
            label="Control Center" 
          />
          <IndustrialBuilding 
            position={[-35, 0, -65]} 
            size={[25, 10, 18]} 
            type="warehouse" 
            label="Equipment Storage" 
          />
          <IndustrialBuilding 
            position={[40, 0, -35]} 
            size={[18, 8, 12]} 
            type="office" 
            label="Admin Building" 
          />
          <IndustrialBuilding 
            position={[40, 0, -55]} 
            size={[15, 6, 10]} 
            type="storage" 
            label="Maintenance" 
          />
          <IndustrialBuilding 
            position={[-60, 0, -50]} 
            size={[12, 8, 10]} 
            type="office" 
            label="Security" 
          />
          
          {/* Storage Tanks */}
          <StorageTank position={[55, 0, -70]} height={10} radius={4} />
          <StorageTank position={[65, 0, -70]} height={8} radius={3} />
          <StorageTank position={[55, 0, -85]} height={12} radius={5} />
          
          {/* Fences */}
          <Fence start={[-80, 0, -100]} end={[80, 0, -100]} />
          <Fence start={[-80, 0, 50]} end={[80, 0, 50]} />
          <Fence start={[-80, 0, -100]} end={[-80, 0, 50]} />
          <Fence start={[80, 0, -100]} end={[80, 0, 50]} />
          
          {/* Transformers */}
          {transformers.map(t => (
            <EnhancedTransformer
              key={t.id}
              transformer={t}
              isSelected={selectedAsset === t.id}
              onClick={() => setSelectedAsset(prev => prev === t.id ? null : t.id)}
              isExpanded={isInfoExpanded}
            />
          ))}
          
          {/* Solar Panels */}
          {solarPanels.map(panel => (
            <EnhancedSolarPanel
              key={panel.id}
              panel={panel}
              isSelected={selectedAsset === panel.id}
              onClick={() => setSelectedAsset(prev => prev === panel.id ? null : panel.id)}
              isExpanded={isInfoExpanded}
            />
          ))}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={150}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
