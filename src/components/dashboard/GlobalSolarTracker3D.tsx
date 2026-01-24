import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Table, Map, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import * as THREE from 'three';

// Solar installation data with global coordinates
const solarInstallations = [
  // Middle East & North Africa
  { id: 1, name: 'Benban Solar Park', country: 'Egypt', lat: 24.45, lng: 32.74, capacity: 1650, status: 'operating', type: 'pv' },
  { id: 2, name: 'Noor Abu Dhabi', country: 'UAE', lat: 24.1, lng: 55.2, capacity: 1177, status: 'operating', type: 'pv' },
  { id: 3, name: 'Mohammed bin Rashid Solar Park', country: 'UAE', lat: 24.75, lng: 55.37, capacity: 5000, status: 'construction', type: 'pv' },
  { id: 4, name: 'Sakaka Solar Project', country: 'Saudi Arabia', lat: 29.97, lng: 40.21, capacity: 300, status: 'operating', type: 'pv' },
  { id: 5, name: 'Aswan Solar Plant', country: 'Egypt', lat: 24.09, lng: 32.9, capacity: 200, status: 'operating', type: 'pv' },
  { id: 6, name: 'NEOM Solar Facility', country: 'Saudi Arabia', lat: 28.0, lng: 35.0, capacity: 2500, status: 'pre-construction', type: 'pv' },
  { id: 7, name: 'Ouarzazate Solar Complex', country: 'Morocco', lat: 30.92, lng: -6.9, capacity: 580, status: 'operating', type: 'thermal' },
  { id: 8, name: 'Red Sea Solar Hub', country: 'Saudi Arabia', lat: 26.5, lng: 36.5, capacity: 1800, status: 'announced', type: 'pv' },
  // Asia
  { id: 9, name: 'Bhadla Solar Park', country: 'India', lat: 27.5, lng: 71.9, capacity: 2245, status: 'operating', type: 'pv' },
  { id: 10, name: 'Pavagada Solar Park', country: 'India', lat: 14.1, lng: 77.3, capacity: 2050, status: 'operating', type: 'pv' },
  { id: 11, name: 'Tengger Desert Solar Park', country: 'China', lat: 37.5, lng: 105.0, capacity: 1547, status: 'operating', type: 'pv' },
  { id: 12, name: 'Longyangxia Dam Solar Park', country: 'China', lat: 36.0, lng: 100.9, capacity: 850, status: 'operating', type: 'pv' },
  // Americas
  { id: 13, name: 'Solar Star', country: 'USA', lat: 34.8, lng: -118.4, capacity: 579, status: 'operating', type: 'pv' },
  { id: 14, name: 'Topaz Solar Farm', country: 'USA', lat: 35.4, lng: -120.0, capacity: 550, status: 'operating', type: 'pv' },
  { id: 15, name: 'Villanueva Solar Plant', country: 'Mexico', lat: 25.3, lng: -103.2, capacity: 828, status: 'operating', type: 'pv' },
  // Europe
  { id: 16, name: 'Cestas Solar Park', country: 'France', lat: 44.7, lng: -0.7, capacity: 300, status: 'operating', type: 'pv' },
  { id: 17, name: 'Nunez de Balboa', country: 'Spain', lat: 38.4, lng: -6.3, capacity: 500, status: 'operating', type: 'pv' },
  // Africa
  { id: 18, name: 'Jasper Solar Project', country: 'South Africa', lat: -29.0, lng: 23.5, capacity: 96, status: 'operating', type: 'pv' },
  { id: 19, name: 'De Aar Solar Power', country: 'South Africa', lat: -30.7, lng: 24.0, capacity: 175, status: 'operating', type: 'pv' },
  // Australia
  { id: 20, name: 'Sunraysia Solar Farm', country: 'Australia', lat: -34.2, lng: 142.1, capacity: 255, status: 'operating', type: 'pv' },
];

const statusConfig = {
  operating: { color: '#22c55e', label: 'Operating' },
  announced: { color: '#ef4444', label: 'Announced' },
  construction: { color: '#eab308', label: 'Construction' },
  'pre-construction': { color: '#f97316', label: 'Pre-Construction' },
  mothballed: { color: '#3b82f6', label: 'Mothballed' },
  shelved: { color: '#2563eb', label: 'Shelved' },
  cancelled: { color: '#6b7280', label: 'Cancelled' },
  retired: { color: '#4b5563', label: 'Retired' },
};

const typeConfig = {
  thermal: { label: 'Solar Thermal', count: 257 },
  pv: { label: 'PV', count: 61520 },
  'assumed-pv': { label: 'Assumed PV', count: 13912 },
};

// Convert lat/lng to 3D sphere coordinates
function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// Rotating Earth Globe
function EarthGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ocean sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#1a365d" 
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Simplified continents overlay */}
      <Sphere args={[2.01, 64, 64]}>
        <meshStandardMaterial 
          color="#2d4a3e"
          roughness={0.9}
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[2.15, 32, 32]}>
        <meshBasicMaterial 
          color="#60a5fa"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}

// Solar installation marker
function InstallationMarker({ 
  installation, 
  isSelected,
  onClick,
  filters
}: { 
  installation: typeof solarInstallations[0];
  isSelected: boolean;
  onClick: () => void;
  filters: { status: string[]; type: string[] };
}) {
  const position = latLngToVector3(installation.lat, installation.lng, 2.05);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Check if this installation passes the filters
  const isVisible = filters.status.includes(installation.status) && 
                    filters.type.includes(installation.type);
  
  // Size based on capacity
  const size = Math.min(0.15, Math.max(0.04, installation.capacity / 10000));
  const color = statusConfig[installation.status as keyof typeof statusConfig]?.color || '#22c55e';
  
  // useFrame hook MUST be called unconditionally (before any return)
  useFrame(() => {
    if (meshRef.current && isSelected && isVisible) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
    }
  });
  
  // Conditional return AFTER all hooks
  if (!isVisible) return null;
  
  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
        />
      </mesh>
      {isSelected && (
        <Html distanceFactor={8}>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[200px] pointer-events-none">
            <p className="font-semibold text-sm text-foreground">{installation.name}</p>
            <p className="text-xs text-muted-foreground">{installation.country}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                style={{ borderColor: color, color }}
                className="text-[10px]"
              >
                {statusConfig[installation.status as keyof typeof statusConfig]?.label}
              </Badge>
              <span className="text-xs font-medium text-foreground">{installation.capacity} MW</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 3D Scene
function GlobeScene({ 
  installations, 
  selectedId, 
  onSelect,
  filters
}: { 
  installations: typeof solarInstallations;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  filters: { status: string[]; type: string[] };
}) {
  return (
    <Canvas 
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      <EarthGlobe />
      
      {installations.map((installation) => (
        <InstallationMarker
          key={installation.id}
          installation={installation}
          isSelected={selectedId === installation.id}
          onClick={() => onSelect(selectedId === installation.id ? null : installation.id)}
          filters={filters}
        />
      ))}
      
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}

export const GlobalSolarTracker3D: React.FC = () => {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'globe' | 'table'>('globe');
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [statusFilters, setStatusFilters] = useState<string[]>(Object.keys(statusConfig));
  const [typeFilters, setTypeFilters] = useState<string[]>(Object.keys(typeConfig));
  
  // Calculate counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(statusConfig).forEach(status => {
      counts[status] = solarInstallations.filter(i => i.status === status).length;
    });
    return counts;
  }, []);
  
  const totalCapacity = useMemo(() => {
    return solarInstallations
      .filter(i => statusFilters.includes(i.status) && typeFilters.includes(i.type))
      .reduce((sum, i) => sum + i.capacity, 0);
  }, [statusFilters, typeFilters]);
  
  const filteredCount = useMemo(() => {
    return solarInstallations
      .filter(i => statusFilters.includes(i.status) && typeFilters.includes(i.type))
      .length;
  }, [statusFilters, typeFilters]);
  
  const toggleStatus = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  const toggleType = (type: string) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const selectAll = (category: 'status' | 'type') => {
    if (category === 'status') {
      setStatusFilters(Object.keys(statusConfig));
    } else {
      setTypeFilters(Object.keys(typeConfig));
    }
  };
  
  const clearAll = (category: 'status' | 'type') => {
    if (category === 'status') {
      setStatusFilters([]);
    } else {
      setTypeFilters([]);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('globalTracker.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('globalTracker.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'globe' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('globe')}
              className="gap-1"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">{t('globalTracker.map')}</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-1"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">{t('globalTracker.tableView')}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Filter Panel */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/30">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer lg:cursor-default"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('globalTracker.totalSelected')}
                </p>
                <p className="text-2xl font-bold text-foreground">{filteredCount.toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden">
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
            
            <ScrollArea className={`${showFilters ? 'max-h-[400px]' : 'max-h-0 lg:max-h-[400px]'} transition-all overflow-hidden`}>
              <div className="p-4 pt-0 space-y-4">
                {/* Status Filters */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('globalTracker.status')}
                    </p>
                    <div className="flex gap-1 text-xs">
                      <button 
                        onClick={() => selectAll('status')}
                        className="text-primary hover:underline"
                      >
                        {t('globalTracker.selectAll')}
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button 
                        onClick={() => clearAll('status')}
                        className="text-primary hover:underline"
                      >
                        {t('globalTracker.clearAll')}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <div 
                        key={key}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={statusFilters.includes(key)}
                            onCheckedChange={() => toggleStatus(key)}
                            className="border-muted-foreground"
                          />
                          <span 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {statusCounts[key] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                {/* Technology Type Filters */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('globalTracker.techType')}
                    </p>
                    <div className="flex gap-1 text-xs">
                      <button 
                        onClick={() => selectAll('type')}
                        className="text-primary hover:underline"
                      >
                        {t('globalTracker.selectAll')}
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button 
                        onClick={() => clearAll('type')}
                        className="text-primary hover:underline"
                      >
                        {t('globalTracker.clearAll')}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <div 
                        key={key}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={typeFilters.includes(key)}
                            onCheckedChange={() => toggleType(key)}
                            className="border-muted-foreground"
                          />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {config.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                {/* Capacity Range */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {t('globalTracker.capacity')}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('globalTracker.maximum')}</span>
                    <span className="font-medium">{totalCapacity.toLocaleString()} MW</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">{t('globalTracker.minimum')}</span>
                    <span className="font-medium">1 MW</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
          
          {/* Map/Globe View */}
          <div className="flex-1 relative">
            {viewMode === 'globe' ? (
              <div className="h-[450px] bg-gradient-to-b from-background via-muted/20 to-background">
                <GlobeScene 
                  installations={solarInstallations}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  filters={{ status: statusFilters, type: typeFilters }}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('globalTracker.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-muted/50"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[380px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50">
                        <th className="pb-2 font-medium">{t('globalTracker.name')}</th>
                        <th className="pb-2 font-medium">{t('globalTracker.country')}</th>
                        <th className="pb-2 font-medium">{t('globalTracker.status')}</th>
                        <th className="pb-2 font-medium text-right">{t('globalTracker.capacityMW')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {solarInstallations
                        .filter(i => 
                          statusFilters.includes(i.status) && 
                          typeFilters.includes(i.type) &&
                          (searchTerm === '' || 
                            i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            i.country.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((installation) => (
                          <tr 
                            key={installation.id}
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedId(installation.id);
                              setViewMode('globe');
                            }}
                          >
                            <td className="py-2.5 font-medium">{installation.name}</td>
                            <td className="py-2.5 text-muted-foreground">{installation.country}</td>
                            <td className="py-2.5">
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: statusConfig[installation.status as keyof typeof statusConfig]?.color,
                                  color: statusConfig[installation.status as keyof typeof statusConfig]?.color
                                }}
                                className="text-[10px]"
                              >
                                {statusConfig[installation.status as keyof typeof statusConfig]?.label}
                              </Badge>
                            </td>
                            <td className="py-2.5 text-right font-medium">{installation.capacity.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            )}
            
            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">{t('globalTracker.region')}: </span>
                  <span className="font-medium">{t('globalTracker.all')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('globalTracker.searchBy')}: </span>
                  <span className="font-medium">{t('globalTracker.all')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                  <Globe className="w-3 h-3" />
                  {t('globalTracker.projection')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
