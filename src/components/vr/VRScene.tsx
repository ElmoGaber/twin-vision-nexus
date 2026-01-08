import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Environment, 
  PerspectiveCamera,
  Html,
  useKeyboardControls
} from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '@/contexts/LanguageContext';

// Solar Panel Component
const SolarPanel: React.FC<{ 
  position: [number, number, number]; 
  rotation?: [number, number, number];
  id: string;
  onClick?: (id: string) => void;
  status?: 'normal' | 'warning' | 'critical';
}> = ({ position, rotation = [0, 0, 0], id, onClick, status = 'normal' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const statusColors = {
    normal: '#22c55e',
    warning: '#eab308',
    critical: '#ef4444',
  };
  
  return (
    <group position={position} rotation={rotation as unknown as THREE.Euler}>
      {/* Panel Frame */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick?.(id)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 0.1, 3]} />
        <meshStandardMaterial 
          color={hovered ? '#1e40af' : '#1e3a5f'} 
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
      
      {/* Status Indicator */}
      <mesh position={[0.8, 0.1, 1.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={statusColors[status]} 
          emissive={statusColors[status]}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Hover Info */}
      {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 min-w-[150px] text-center shadow-xl">
            <p className="text-xs text-muted-foreground">Panel ID</p>
            <p className="font-mono font-bold text-foreground">{id}</p>
            <p className={`text-xs mt-1 capitalize ${
              status === 'normal' ? 'text-status-normal' : 
              status === 'warning' ? 'text-status-warning' : 'text-status-critical'
            }`}>
              {status}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Control Building
const ControlBuilding: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Main Building */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[13, 1, 9]} />
        <meshStandardMaterial color="#1f2937" metalness={0.4} />
      </mesh>
      
      {/* Windows */}
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
      
      {/* Door */}
      <mesh position={[0, 1.5, 4.01]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[5, 9, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} />
      </mesh>
      
      {/* Label */}
      <Html position={[0, 8, 0]} center>
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold shadow-lg">
          Control Center
        </div>
      </Html>
    </group>
  );
};

// Transformer
const Transformer: React.FC<{ 
  position: [number, number, number]; 
  id: string;
  status?: 'normal' | 'warning' | 'critical';
}> = ({ position, id, status = 'normal' }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Main Body */}
      <mesh 
        position={[0, 1.5, 0]} 
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2, 3, 1.5]} />
        <meshStandardMaterial 
          color={status === 'critical' ? '#7f1d1d' : '#374151'} 
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
      
      {hovered && (
        <Html position={[0, 4.5, 0]} center>
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
            <p className="font-mono font-bold text-foreground">{id}</p>
            <p className={`text-xs capitalize ${
              status === 'critical' ? 'text-status-critical status-blink-critical' : 'text-status-normal'
            }`}>
              {status === 'critical' ? '⚠️ ALERT: Overheating' : 'Normal Operation'}
            </p>
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

// Power Lines
const PowerLine: React.FC<{ 
  start: [number, number, number]; 
  end: [number, number, number] 
}> = ({ start, end }) => {
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

// Camera Controller with WASD
const CameraController: React.FC = () => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  useFrame((state, delta) => {
    // Simple auto-orbit for demo
    const time = state.clock.getElapsedTime() * 0.05;
    const radius = 60;
    const x = Math.sin(time) * radius;
    const z = Math.cos(time) * radius;
    camera.position.lerp(new THREE.Vector3(x, 25, z), 0.01);
    camera.lookAt(0, 5, 0);
  });
  
  return null;
};

// HUD Overlay
const HUDOverlay: React.FC = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState({
    power: 42.5,
    efficiency: 94.2,
    temperature: 32,
    alarms: 3,
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        power: prev.power + (Math.random() - 0.5) * 2,
        efficiency: Math.min(100, Math.max(80, prev.efficiency + (Math.random() - 0.5))),
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        alarms: prev.alarms,
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-10">
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 space-y-2">
        <h3 className="font-bold text-foreground">{t('vr.title')}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Power:</span>
            <span className="ml-2 font-mono text-status-normal">{metrics.power.toFixed(1)} MW</span>
          </div>
          <div>
            <span className="text-muted-foreground">Efficiency:</span>
            <span className="ml-2 font-mono text-foreground">{metrics.efficiency.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Temp:</span>
            <span className="ml-2 font-mono text-foreground">{metrics.temperature.toFixed(1)}°C</span>
          </div>
          <div>
            <span className="text-muted-foreground">Alarms:</span>
            <span className="ml-2 font-mono text-status-critical">{metrics.alarms}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-normal status-pulse" />
          <span className="text-sm text-foreground">{t('common.live')}</span>
        </div>
      </div>
    </div>
  );
};

// Main VR Scene Component
export const VRScene: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  // Generate solar panel grid
  const panels: Array<{ 
    position: [number, number, number]; 
    id: string; 
    status: 'normal' | 'warning' | 'critical' 
  }> = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 12; col++) {
      const x = (col - 6) * 4 - 30;
      const z = (row - 4) * 5 + 20;
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      
      // Some panels with warnings/critical for demo
      if (row === 3 && col >= 8) status = 'warning';
      if (row === 5 && col === 4) status = 'critical';
      
      panels.push({
        position: [x, 0, z],
        id: `SP-${String.fromCharCode(65 + row)}${col + 1}`,
        status,
      });
    }
  }
  
  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-border">
      <HUDOverlay />
      
      <Canvas shadows className="bg-background">
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[60, 25, 60]} fov={60} />
          <CameraController />
          
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
          <Transformer position={[20, 0, -10]} id="T1" status="critical" />
          <Transformer position={[25, 0, -10]} id="T2" status="normal" />
          
          {/* Solar Panels */}
          {panels.map((panel) => (
            <SolarPanel
              key={panel.id}
              position={panel.position}
              rotation={[-0.3, 0, 0]}
              id={panel.id}
              status={panel.status}
              onClick={setSelectedAsset}
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
            minDistance={10}
            maxDistance={100}
          />
        </Suspense>
      </Canvas>
      
      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground">
          Drag to rotate • Scroll to zoom • Click assets to inspect
        </div>
      </div>
    </div>
  );
};
