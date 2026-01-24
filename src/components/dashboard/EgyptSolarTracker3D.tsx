import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Table, Map, Search, X, ChevronDown, ChevronUp, Zap, MapPin, Sun, Factory } from 'lucide-react';
import * as THREE from 'three';

// Egypt-only solar installation data with detailed coordinates
const egyptSolarInstallations = [
  // Major Solar Parks
  { id: 1, name: 'Benban Solar Park - Phase 1', nameAr: 'محطة بنبان الشمسية - المرحلة الأولى', governorate: 'Aswan', governorateAr: 'أسوان', lat: 24.45, lng: 32.74, capacity: 400, status: 'operating', type: 'pv', commissioned: '2019' },
  { id: 2, name: 'Benban Solar Park - Phase 2', nameAr: 'محطة بنبان الشمسية - المرحلة الثانية', governorate: 'Aswan', governorateAr: 'أسوان', lat: 24.47, lng: 32.76, capacity: 450, status: 'operating', type: 'pv', commissioned: '2019' },
  { id: 3, name: 'Benban Solar Park - Phase 3', nameAr: 'محطة بنبان الشمسية - المرحلة الثالثة', governorate: 'Aswan', governorateAr: 'أسوان', lat: 24.43, lng: 32.72, capacity: 400, status: 'operating', type: 'pv', commissioned: '2020' },
  { id: 4, name: 'Benban Solar Park - Phase 4', nameAr: 'محطة بنبان الشمسية - المرحلة الرابعة', governorate: 'Aswan', governorateAr: 'أسوان', lat: 24.44, lng: 32.78, capacity: 400, status: 'operating', type: 'pv', commissioned: '2020' },
  { id: 5, name: 'Kom Ombo Solar Plant', nameAr: 'محطة كوم أمبو الشمسية', governorate: 'Aswan', governorateAr: 'أسوان', lat: 24.28, lng: 32.55, capacity: 200, status: 'operating', type: 'pv', commissioned: '2019' },
  { id: 6, name: 'Zafarana Solar-Wind Complex', nameAr: 'مجمع الزعفرانة للطاقة المتجددة', governorate: 'Red Sea', governorateAr: 'البحر الأحمر', lat: 29.1, lng: 32.6, capacity: 140, status: 'operating', type: 'pv', commissioned: '2018' },
  { id: 7, name: 'Hurghada Solar Farm', nameAr: 'محطة الغردقة الشمسية', governorate: 'Red Sea', governorateAr: 'البحر الأحمر', lat: 27.25, lng: 33.8, capacity: 50, status: 'operating', type: 'pv', commissioned: '2017' },
  { id: 8, name: 'Suez Canal Solar Project', nameAr: 'مشروع قناة السويس للطاقة الشمسية', governorate: 'Suez', governorateAr: 'السويس', lat: 30.0, lng: 32.5, capacity: 80, status: 'operating', type: 'pv', commissioned: '2021' },
  { id: 9, name: 'West Nile Solar Hub', nameAr: 'مركز غرب النيل للطاقة الشمسية', governorate: 'New Valley', governorateAr: 'الوادي الجديد', lat: 25.5, lng: 29.2, capacity: 250, status: 'construction', type: 'pv', commissioned: '2025' },
  { id: 10, name: 'Alexandria Solar Park', nameAr: 'محطة الإسكندرية الشمسية', governorate: 'Alexandria', governorateAr: 'الإسكندرية', lat: 31.2, lng: 29.95, capacity: 35, status: 'operating', type: 'pv', commissioned: '2020' },
  { id: 11, name: 'Sharm El Sheikh Solar', nameAr: 'محطة شرم الشيخ الشمسية', governorate: 'South Sinai', governorateAr: 'جنوب سيناء', lat: 27.91, lng: 34.33, capacity: 25, status: 'operating', type: 'pv', commissioned: '2022' },
  { id: 12, name: 'New Capital Solar Plant', nameAr: 'محطة العاصمة الإدارية الشمسية', governorate: 'Cairo', governorateAr: 'القاهرة', lat: 30.02, lng: 31.73, capacity: 150, status: 'construction', type: 'pv', commissioned: '2024' },
  { id: 13, name: 'Minya Solar Project', nameAr: 'مشروع المنيا للطاقة الشمسية', governorate: 'Minya', governorateAr: 'المنيا', lat: 28.1, lng: 30.75, capacity: 120, status: 'pre-construction', type: 'pv', commissioned: '2026' },
  { id: 14, name: 'Assiut CSP Station', nameAr: 'محطة أسيوط للطاقة الشمسية المركزة', governorate: 'Assiut', governorateAr: 'أسيوط', lat: 27.18, lng: 31.18, capacity: 100, status: 'announced', type: 'thermal', commissioned: '2027' },
  { id: 15, name: 'Siwa Oasis Solar', nameAr: 'محطة واحة سيوة الشمسية', governorate: 'Matrouh', governorateAr: 'مطروح', lat: 29.2, lng: 25.52, capacity: 30, status: 'pre-construction', type: 'pv', commissioned: '2025' },
  { id: 16, name: 'Luxor Solar Farm', nameAr: 'مزرعة الأقصر الشمسية', governorate: 'Luxor', governorateAr: 'الأقصر', lat: 25.69, lng: 32.64, capacity: 75, status: 'operating', type: 'pv', commissioned: '2021' },
  { id: 17, name: 'Port Said Solar', nameAr: 'محطة بورسعيد الشمسية', governorate: 'Port Said', governorateAr: 'بورسعيد', lat: 31.25, lng: 32.29, capacity: 45, status: 'operating', type: 'pv', commissioned: '2022' },
  { id: 18, name: 'Ismailia Green Energy', nameAr: 'الإسماعيلية للطاقة الخضراء', governorate: 'Ismailia', governorateAr: 'الإسماعيلية', lat: 30.6, lng: 32.27, capacity: 60, status: 'operating', type: 'pv', commissioned: '2023' },
  { id: 19, name: 'El Arish Solar', nameAr: 'محطة العريش الشمسية', governorate: 'North Sinai', governorateAr: 'شمال سيناء', lat: 31.13, lng: 33.8, capacity: 40, status: 'construction', type: 'pv', commissioned: '2024' },
  { id: 20, name: 'Fayoum Solar Plant', nameAr: 'محطة الفيوم الشمسية', governorate: 'Fayoum', governorateAr: 'الفيوم', lat: 29.3, lng: 30.84, capacity: 55, status: 'operating', type: 'pv', commissioned: '2022' },
];

const statusConfig = {
  operating: { color: '#22c55e', label: 'Operating', labelAr: 'تعمل' },
  announced: { color: '#ef4444', label: 'Announced', labelAr: 'معلن عنها' },
  construction: { color: '#eab308', label: 'Construction', labelAr: 'قيد الإنشاء' },
  'pre-construction': { color: '#f97316', label: 'Pre-Construction', labelAr: 'ما قبل الإنشاء' },
};

const typeConfig = {
  thermal: { label: 'Solar Thermal', labelAr: 'حرارية شمسية', count: 1 },
  pv: { label: 'PV', labelAr: 'كهروضوئية', count: 19 },
};

// Egypt boundaries (simplified polygon)
const egyptBoundaries = [
  [31.5, 25.0], [31.5, 29.0], [32.0, 31.0], [34.2, 31.5], [34.9, 29.5],
  [35.0, 28.0], [34.5, 27.5], [33.2, 28.5], [33.0, 22.0], [31.5, 22.0],
  [25.0, 22.0], [25.0, 31.5], [25.0, 31.5], [31.5, 25.0]
];

// Convert lat/lng to 2D map coordinates (Egypt-focused)
function latLngToMap(lat: number, lng: number): [number, number] {
  // Egypt bounds: lat 22-32, lng 25-35
  const x = ((lng - 25) / 10) * 8 - 4; // Scale to -4 to 4
  const y = ((lat - 22) / 10) * 6 - 3; // Scale to -3 to 3
  return [x, y];
}

// Egypt Map with boundaries
function EgyptMap() {
  // Create boundary points
  const boundaryPoints = egyptBoundaries.map(([lat, lng]) => {
    const [x, y] = latLngToMap(lat, lng);
    return new THREE.Vector3(x, 0.01, -y);
  });

  // Nile River path (simplified)
  const nilePoints = [
    [30.0, 31.2], [29.5, 31.3], [28.5, 30.8], [27.5, 31.0], [26.5, 32.0],
    [25.5, 32.5], [24.0, 32.9], [23.0, 32.9], [22.0, 32.8]
  ].map(([lat, lng]) => {
    const [x, y] = latLngToMap(lat, lng);
    return new THREE.Vector3(x, 0.02, -y);
  });

  return (
    <group>
      {/* Egypt land */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#1a1f2e" />
      </mesh>

      {/* Egypt boundary outline */}
      <Line
        points={boundaryPoints}
        color="#4ade80"
        lineWidth={2}
      />

      {/* Nile River */}
      <Line
        points={nilePoints}
        color="#3b82f6"
        lineWidth={3}
      />

      {/* Mediterranean Sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -3.5]}>
        <planeGeometry args={[10, 1]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.6} />
      </mesh>

      {/* Red Sea */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[4.5, -0.01, 1]}>
        <planeGeometry args={[2, 4]} />
        <meshStandardMaterial color="#1e3a5f" transparent opacity={0.6} />
      </mesh>

      {/* Major cities labels */}
      <Html position={[latLngToMap(30.05, 31.25)[0], 0.1, -latLngToMap(30.05, 31.25)[1]]} center>
        <div className="text-[10px] text-primary font-bold bg-background/80 px-1 rounded">Cairo القاهرة</div>
      </Html>
      <Html position={[latLngToMap(31.2, 29.95)[0], 0.1, -latLngToMap(31.2, 29.95)[1]]} center>
        <div className="text-[10px] text-primary font-bold bg-background/80 px-1 rounded">Alexandria الإسكندرية</div>
      </Html>
      <Html position={[latLngToMap(24.09, 32.9)[0], 0.1, -latLngToMap(24.09, 32.9)[1]]} center>
        <div className="text-[10px] text-primary font-bold bg-background/80 px-1 rounded">Aswan أسوان</div>
      </Html>
    </group>
  );
}

// Solar installation marker
function InstallationMarker({ 
  installation, 
  isSelected,
  onClick,
  filters,
  isArabic
}: { 
  installation: typeof egyptSolarInstallations[0];
  isSelected: boolean;
  onClick: () => void;
  filters: { status: string[]; type: string[] };
  isArabic: boolean;
}) {
  const [x, y] = latLngToMap(installation.lat, installation.lng);
  const position: [number, number, number] = [x, 0.15, -y];
  const meshRef = useRef<THREE.Mesh>(null);
  
  const isVisible = filters.status.includes(installation.status) && 
                    filters.type.includes(installation.type);
  
  const size = Math.min(0.25, Math.max(0.08, installation.capacity / 500));
  const color = statusConfig[installation.status as keyof typeof statusConfig]?.color || '#22c55e';
  
  useFrame(() => {
    if (meshRef.current && isSelected && isVisible) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.3);
    }
  });
  
  if (!isVisible) return null;
  
  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={onClick}>
        <cylinderGeometry args={[size, size * 0.8, 0.1, 6]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isSelected ? 1 : 0.5}
        />
      </mesh>
      
      {/* Capacity indicator beam */}
      <mesh position={[0, installation.capacity / 300, 0]}>
        <cylinderGeometry args={[0.02, 0.02, installation.capacity / 150, 8]} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {isSelected && (
        <Html distanceFactor={10} center>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl min-w-[280px] pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-primary" />
              <p className="font-bold text-foreground">
                {isArabic ? installation.nameAr : installation.name}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              <span>{isArabic ? installation.governorateAr : installation.governorate}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Status</span>
                <Badge 
                  variant="outline" 
                  style={{ borderColor: color, color }}
                  className="text-xs mt-1"
                >
                  {isArabic 
                    ? statusConfig[installation.status as keyof typeof statusConfig]?.labelAr
                    : statusConfig[installation.status as keyof typeof statusConfig]?.label
                  }
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Capacity</span>
                <span className="text-foreground font-bold text-lg">{installation.capacity} MW</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Type</span>
                <span className="text-foreground">{installation.type.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Commissioned</span>
                <span className="text-foreground">{installation.commissioned}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 3D Scene
function EgyptMapScene({ 
  installations, 
  selectedId, 
  onSelect,
  filters,
  isArabic
}: { 
  installations: typeof egyptSolarInstallations;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  filters: { status: string[]; type: string[] };
  isArabic: boolean;
}) {
  return (
    <Canvas 
      camera={{ position: [0, 8, 0], fov: 50 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <EgyptMap />
      
      {installations.map((installation) => (
        <InstallationMarker
          key={installation.id}
          installation={installation}
          isSelected={selectedId === installation.id}
          onClick={() => onSelect(selectedId === installation.id ? null : installation.id)}
          filters={filters}
          isArabic={isArabic}
        />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

export const EgyptSolarTracker3D: React.FC = () => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [showFilters, setShowFilters] = useState(true);
  
  const [statusFilters, setStatusFilters] = useState<string[]>(Object.keys(statusConfig));
  const [typeFilters, setTypeFilters] = useState<string[]>(Object.keys(typeConfig));
  
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(statusConfig).forEach(status => {
      counts[status] = egyptSolarInstallations.filter(i => i.status === status).length;
    });
    return counts;
  }, []);
  
  const totalCapacity = useMemo(() => {
    return egyptSolarInstallations
      .filter(i => statusFilters.includes(i.status) && typeFilters.includes(i.type))
      .reduce((sum, i) => sum + i.capacity, 0);
  }, [statusFilters, typeFilters]);
  
  const filteredCount = useMemo(() => {
    return egyptSolarInstallations
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

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Factory className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isArabic ? 'متتبع الطاقة الشمسية - مصر' : 'Egypt Solar Power Tracker'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'محطات الطاقة الشمسية في جمهورية مصر العربية' : 'Solar power stations across Egypt'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary text-primary">
              <Zap className="w-3 h-3 mr-1" />
              {totalCapacity.toLocaleString()} MW
            </Badge>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Filter Panel */}
          <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/30">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer lg:cursor-default"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isArabic ? 'المحطات المختارة' : 'Selected Stations'}
                </p>
                <p className="text-2xl font-bold text-foreground">{filteredCount}</p>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden">
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
            
            <ScrollArea className={`${showFilters ? 'max-h-[350px]' : 'max-h-0 lg:max-h-[350px]'} transition-all overflow-hidden`}>
              <div className="p-4 pt-0 space-y-4">
                {/* Status Filters */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {isArabic ? 'الحالة' : 'Status'}
                  </p>
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
                          />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                          <span className="text-sm">{isArabic ? config.labelAr : config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{statusCounts[key] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="bg-border/50" />
                
                {/* Type Filters */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {isArabic ? 'نوع التقنية' : 'Technology Type'}
                  </p>
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
                          />
                          <span className="text-sm">{isArabic ? config.labelAr : config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{config.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
          
          {/* Map/Table View */}
          <div className="flex-1 relative">
            {viewMode === 'map' ? (
              <div className="h-[450px] bg-gradient-to-b from-background via-muted/20 to-background">
                <EgyptMapScene 
                  installations={egyptSolarInstallations}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  filters={{ status: statusFilters, type: typeFilters }}
                  isArabic={isArabic}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={isArabic ? 'البحث عن محطة...' : 'Search stations...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-muted/50"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[380px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-left text-xs text-muted-foreground uppercase border-b border-border/50">
                        <th className="pb-2">{isArabic ? 'الاسم' : 'Name'}</th>
                        <th className="pb-2">{isArabic ? 'المحافظة' : 'Governorate'}</th>
                        <th className="pb-2">{isArabic ? 'الحالة' : 'Status'}</th>
                        <th className="pb-2 text-right">{isArabic ? 'السعة' : 'Capacity'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {egyptSolarInstallations
                        .filter(i => 
                          statusFilters.includes(i.status) && 
                          typeFilters.includes(i.type) &&
                          (searchTerm === '' || 
                            i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            i.nameAr.includes(searchTerm) ||
                            i.governorate.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((installation) => (
                          <tr 
                            key={installation.id}
                            className="border-b border-border/30 hover:bg-muted/30 cursor-pointer"
                            onClick={() => {
                              setSelectedId(installation.id);
                              setViewMode('map');
                            }}
                          >
                            <td className="py-2.5 font-medium">
                              {isArabic ? installation.nameAr : installation.name}
                            </td>
                            <td className="py-2.5 text-muted-foreground">
                              {isArabic ? installation.governorateAr : installation.governorate}
                            </td>
                            <td className="py-2.5">
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: statusConfig[installation.status as keyof typeof statusConfig]?.color,
                                  color: statusConfig[installation.status as keyof typeof statusConfig]?.color
                                }}
                                className="text-[10px]"
                              >
                                {isArabic 
                                  ? statusConfig[installation.status as keyof typeof statusConfig]?.labelAr
                                  : statusConfig[installation.status as keyof typeof statusConfig]?.label
                                }
                              </Badge>
                            </td>
                            <td className="py-2.5 text-right font-bold">{installation.capacity} MW</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
