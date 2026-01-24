import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Html,
  PointerLockControls,
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
  Keyboard
} from 'lucide-react';

// First Person Camera Controller with WASD + Mouse
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
      // Calculate camera position to view the target
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
    // Auto-navigate to target if set
    if (targetPosition.current) {
      const distance = camera.position.distanceTo(targetPosition.current);
      if (distance > 1) {
        camera.position.lerp(targetPosition.current, 0.02);
        const targetLook = new THREE.Vector3(...(navigationTarget?.position || [0, 2, 0]));
        const currentLook = new THREE.Vector3();
        camera.getWorldDirection(currentLook);
        camera.lookAt(targetLook);
      } else {
        targetPosition.current = null;
        onClearTarget();
      }
      return;
    }
    
    // Manual WASD movement
    const speed = keys.current.shift ? 40 : 20;
    
    direction.current.set(0, 0, 0);
    
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;
    
    if (direction.current.length() > 0) {
      direction.current.normalize();
      
      // Get camera's forward and right vectors
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
      
      // Keep camera at walking height
      camera.position.y = Math.max(3, Math.min(30, camera.position.y));
    }
  });
  
  return null;
};

// Enhanced Solar Panel with detailed info
const EnhancedSolarPanel: React.FC<{ 
  panel: SolarPanelData;
  isSelected: boolean;
  onClick: () => void;
}> = ({ panel, isSelected, onClick }) => {
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
      {/* Panel Frame */}
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
      
      {/* Solar Cells */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.9, 0.02, 2.9]} />
        <meshStandardMaterial 
          color="#0a1628" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Support Pole */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} />
      </mesh>
      
      {/* Status Indicator - pulsing for critical */}
      <mesh position={[0.8, 0.1, 1.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={statusColors[panel.status]} 
          emissive={statusColors[panel.status]}
          emissiveIntensity={panel.status === 'critical' ? 1 : 0.5}
        />
      </mesh>
      
      {/* Detailed Info Panel */}
      {(hovered || isSelected) && (
        <Html position={[0, 2.5, 0]} center distanceFactor={15}>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 min-w-[220px] shadow-xl pointer-events-none">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-foreground text-lg">{panel.id}</span>
              <Badge 
                variant="outline"
                className={`
                  ${panel.status === 'normal' ? 'border-status-normal text-status-normal' : ''}
                  ${panel.status === 'warning' ? 'border-status-warning text-status-warning' : ''}
                  ${panel.status === 'critical' ? 'border-status-critical text-status-critical animate-pulse' : ''}
                `}
              >
                {panel.status.toUpperCase()}
              </Badge>
            </div>
            
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
            </div>
            
            {panel.status !== 'normal' && (
              <div className="mt-3 pt-2 border-t border-border">
                <p className="text-xs text-status-warning">
                  {panel.status === 'warning' && '⚠️ Efficiency degradation detected'}
                  {panel.status === 'critical' && '🚨 Immediate inspection required'}
                </p>
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
}> = ({ transformer, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && transformer.status === 'critical') {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.03);
    }
  });
  
  return (
    <group position={transformer.position}>
      {/* Main Body */}
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
      
      {/* Cooling Fins */}
      {[-0.6, 0, 0.6].map((z, i) => (
        <mesh key={i} position={[1.05, 1.5, z]}>
          <boxGeometry args={[0.1, 2.5, 0.3]} />
          <meshStandardMaterial color="#4b5563" metalness={0.6} />
        </mesh>
      ))}
      
      {/* Insulators */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 3.5, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
      ))}
      
      {/* Warning beacon for critical */}
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
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 min-w-[200px] shadow-xl pointer-events-none">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-foreground text-lg">{transformer.id}</span>
              <Badge 
                variant="outline"
                className={transformer.status === 'critical' 
                  ? 'border-status-critical text-status-critical animate-pulse' 
                  : 'border-status-normal text-status-normal'}
              >
                {transformer.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Load</span>
                  <span className="font-mono">{transformer.load.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={transformer.load} 
                  className="h-2"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature</span>
                <span className={`font-mono ${transformer.temperature > 70 ? 'text-status-critical' : 'text-foreground'}`}>
                  {transformer.temperature.toFixed(1)}°C
                </span>
              </div>
            </div>
            
            {transformer.status === 'critical' && (
              <div className="mt-3 pt-2 border-t border-border">
                <p className="text-xs text-status-critical animate-pulse">
                  🚨 OVERHEATING - Schedule immediate maintenance
                </p>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Ground
const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#d4a574" roughness={1} />
    </mesh>
  );
};

// Control Building
const ControlBuilding: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>
      
      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[13, 1, 9]} />
        <meshStandardMaterial color="#1f2937" metalness={0.4} />
      </mesh>
      
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={i} position={[x, 3, 4.01]}>
          <boxGeometry args={[1.2, 2, 0.1]} />
          <meshStandardMaterial 
            color="#60a5fa" 
            emissive="#60a5fa"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      <mesh position={[0, 1.5, 4.01]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      
      <mesh position={[5, 9, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} />
      </mesh>
      
      <Html position={[0, 8, 0]} center>
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold shadow-lg">
          Control Center
        </div>
      </Html>
    </group>
  );
};

// Power Lines
const PowerLine: React.FC<{ start: [number, number, number]; end: [number, number, number] }> = ({ start, end }) => {
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3((start[0] + end[0]) / 2, Math.max(start[1], end[1]) - 1, (start[2] + end[2]) / 2),
    new THREE.Vector3(...end),
  ];
  
  const curve = new THREE.CatmullRomCurve3(points);
  
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
  );
};

// Enhanced HUD with Decision Support
const EnhancedHUD: React.FC = () => {
  const { t } = useLanguage();
  const { liveMetrics, recommendations, riskScore, alarms } = useVR();
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  return (
    <>
      {/* Top Left - Live Metrics */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        <Card className="bg-card/90 backdrop-blur-sm border-border p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {t('vr.title')}
            </h3>
            <Badge variant="outline" className="border-status-normal text-status-normal">
              <span className="w-2 h-2 rounded-full bg-status-normal mr-1 animate-pulse" />
              LIVE
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" /> Power
              </span>
              <span className="text-xl font-mono font-bold text-status-normal">
                {liveMetrics.totalPower.toFixed(1)} MW
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Efficiency
              </span>
              <span className="text-xl font-mono font-bold text-foreground">
                {liveMetrics.efficiency.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Sun className="w-3 h-3" /> Irradiance
              </span>
              <span className="text-lg font-mono text-foreground">
                {liveMetrics.irradiance.toFixed(0)} W/m²
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Cloud Cover
              </span>
              <span className="text-lg font-mono text-foreground">
                {liveMetrics.cloudCover.toFixed(0)}%
              </span>
            </div>
          </div>
        </Card>
        
        {/* Active Alarms in VR */}
        <Card className="bg-card/90 backdrop-blur-sm border-border p-4 min-w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-status-critical" />
            <span className="font-semibold text-foreground">Active Alarms</span>
            <Badge variant="destructive" className="ml-auto">{alarms.length}</Badge>
          </div>
          <div className="space-y-2 max-h-[120px] overflow-y-auto">
            {alarms.slice(0, 3).map(alarm => (
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
        </Card>
      </div>
      
      {/* Top Right - Decision Support */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="bg-card/90 backdrop-blur-sm border-border p-4 min-w-[300px]">
          <button 
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center justify-between w-full mb-2"
          >
            <span className="font-bold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              AI Decision Support
            </span>
            <Badge 
              variant="outline" 
              className={`$
                riskScore < 30 ? 'border-status-normal text-status-normal' :
                riskScore < 60 ? 'border-status-warning text-status-warning' :
                'border-status-critical text-status-critical'
              }`}
            >
              Risk: {riskScore.toFixed(0)}%
            </Badge>
          </button>
          
          {showRecommendations && (
            <div className="space-y-2 mt-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Recommendations
              </p>
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Target className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                  <span className="text-foreground">{rec}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      
      {/* Bottom - Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Card className="bg-card/90 backdrop-blur-sm border-border px-6 py-3">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>WASD to move</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span>Drag to look</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Scroll to zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Click assets to inspect</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

// Main Enhanced VR Scene
export const EnhancedVRScene: React.FC = () => {
  const { 
    solarPanels, 
    transformers, 
    navigationTarget,
    clearNavigationTarget 
  } = useVR();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  return (
    <div className="relative w-full h-full min-h-[600px] rounded-lg overflow-hidden border border-border">
      <EnhancedHUD />
      
      <Canvas shadows className="bg-background">
        <Suspense fallback={null}>
          <FirstPersonController 
            navigationTarget={navigationTarget}
            onClearTarget={clearNavigationTarget}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={150}
            shadow-camera-left={-75}
            shadow-camera-right={75}
            shadow-camera-top={75}
            shadow-camera-bottom={-75}
          />
          
          {/* Sky */}
          <Sky 
            distance={450000}
            sunPosition={[50, 25, 50]}
            inclination={0.6}
            azimuth={0.25}
          />
          
          {/* Ground */}
          <Ground />
          
          {/* Control Building */}
          <ControlBuilding position={[0, 0, -20]} />
          
          {/* Transformers */}
          {transformers.map(t => (
            <EnhancedTransformer
              key={t.id}
              transformer={t}
              isSelected={selectedAsset === t.id}
              onClick={() => setSelectedAsset(prev => prev === t.id ? null : t.id)}
            />
          ))}
          
          {/* Solar Panels */}
          {solarPanels.map(panel => (
            <EnhancedSolarPanel
              key={panel.id}
              panel={panel}
              isSelected={selectedAsset === panel.id}
              onClick={() => setSelectedAsset(prev => prev === panel.id ? null : panel.id)}
            />
          ))}
          
          {/* Power Lines */}
          <PowerLine start={[20, 4, -10]} end={[6, 7, -16]} />
          <PowerLine start={[25, 4, -10]} end={[6, 7, -16]} />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={120}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
