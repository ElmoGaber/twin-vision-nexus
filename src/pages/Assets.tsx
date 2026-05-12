import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Sun,
  Zap,
  Thermometer,
  Battery,
  Gauge,
  Wifi,
  ExternalLink,
  View
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface Asset {
  id: string;
  name: string;
  nameAr: string;
  type: 'solar' | 'transformer' | 'inverter' | 'battery' | 'cooling' | 'meter';
  status: 'normal' | 'warning' | 'critical' | 'offline';
  health: number;
  lastUpdate: Date;
  metrics: Record<string, string>;
}

const assets: Asset[] = [
  {
    id: 'SP-A1',
    name: 'Solar Panel Array A1',
    nameAr: 'مجموعة الألواح الشمسية A1',
    type: 'solar',
    status: 'normal',
    health: 98,
    lastUpdate: new Date(),
    metrics: { output: '45.2 kW', efficiency: '98.5%', temperature: '42°C' },
  },
  {
    id: 'SP-B5',
    name: 'Solar Panel Array B5',
    nameAr: 'مجموعة الألواح الشمسية B5',
    type: 'solar',
    status: 'warning',
    health: 87,
    lastUpdate: new Date(),
    metrics: { output: '38.1 kW', efficiency: '87.2%', temperature: '48°C' },
  },
  {
    id: 'T1',
    name: 'Main Transformer T1',
    nameAr: 'المحول الرئيسي T1',
    type: 'transformer',
    status: 'critical',
    health: 45,
    lastUpdate: new Date(),
    metrics: { load: '85%', temperature: '85°C', voltage: '22 kV' },
  },
  {
    id: 'T2',
    name: 'Transformer T2',
    nameAr: 'المحول T2',
    type: 'transformer',
    status: 'normal',
    health: 92,
    lastUpdate: new Date(),
    metrics: { load: '62%', temperature: '58°C', voltage: '22 kV' },
  },
  {
    id: 'INV-12',
    name: 'Inverter INV-12',
    nameAr: 'العاكس INV-12',
    type: 'inverter',
    status: 'warning',
    health: 76,
    lastUpdate: new Date(),
    metrics: { power: '120 kW', efficiency: '94.2%', frequency: '50 Hz' },
  },
  {
    id: 'BT-01',
    name: 'Battery Storage BS-1',
    nameAr: 'تخزين البطارية BS-1',
    type: 'battery',
    status: 'normal',
    health: 94,
    lastUpdate: new Date(),
    metrics: { charge: '78%', capacity: '500 kWh', cycles: '342' },
  },
  {
    id: 'CU-03',
    name: 'Cooling Unit CU-03',
    nameAr: 'وحدة التبريد CU-03',
    type: 'cooling',
    status: 'normal',
    health: 72,
    lastUpdate: new Date(),
    metrics: { flow: '45 L/min', inlet: '32°C', outlet: '24°C' },
  },
  {
    id: 'SM-45',
    name: 'Smart Meter SM-45',
    nameAr: 'العداد الذكي SM-45',
    type: 'meter',
    status: 'offline',
    health: 0,
    lastUpdate: new Date(Date.now() - 3600000),
    metrics: { status: 'Offline', lastReading: '2.4 MWh' },
  },
];

const typeIcons = {
  solar: <Sun className="w-5 h-5" />,
  transformer: <Zap className="w-5 h-5" />,
  inverter: <Gauge className="w-5 h-5" />,
  battery: <Battery className="w-5 h-5" />,
  cooling: <Thermometer className="w-5 h-5" />,
  meter: <Wifi className="w-5 h-5" />,
};

const statusColors = {
  normal: 'text-status-normal bg-status-normal/10 border-status-normal/30',
  warning: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  critical: 'text-status-critical bg-status-critical/10 border-status-critical/30',
  offline: 'text-status-offline bg-status-offline/10 border-status-offline/30',
};

const Assets = () => {
  const { t, language, dir } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Filter assets based on search and type
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.nameAr.includes(searchQuery) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || asset.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // Export to Excel function
  const handleExportToExcel = () => {
    const csvContent = [
      ['ID', 'Name', 'Type', 'Status', 'Health', 'Last Update', ...Object.keys(filteredAssets[0]?.metrics || {})],
      ...filteredAssets.map(asset => [
        asset.id,
        asset.name,
        asset.type,
        asset.status,
        asset.health,
        asset.lastUpdate.toLocaleString(),
        ...Object.values(asset.metrics || {})
      ])
    ];
    
    const csvText = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `assets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.assets')}</h1>
            <p className="text-muted-foreground">
              Manage and monitor all infrastructure assets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
            >
              Download
            </Button>
          </div>
        </div>
        
        {/* Search & Filter */}
        <div className="panel-industrial p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={cn(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
                dir === 'rtl' ? 'right-3' : 'left-3'
              )} />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'bg-muted/50',
                  dir === 'rtl' ? 'pr-10' : 'pl-10'
                )}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setFilterType(filterType ? null : 'solar')}
            >
              <Filter className="w-4 h-4 me-2" />
              {filterType ? `Filter: ${filterType}` : t('common.filter')}
            </Button>
          </div>
        </div>
        
        {/* Assets Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id}
                className={cn(
                  'panel-industrial p-4 border transition-all hover:shadow-lg cursor-pointer',
                  statusColors[asset.status],
                  asset.status === 'critical' && 'status-blink-critical'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    asset.status === 'normal' && 'bg-status-normal/20 text-status-normal',
                    asset.status === 'warning' && 'bg-status-warning/20 text-status-warning',
                    asset.status === 'critical' && 'bg-status-critical/20 text-status-critical',
                    asset.status === 'offline' && 'bg-status-offline/20 text-status-offline',
                  )}>
                    {typeIcons[asset.type]}
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium capitalize',
                    statusColors[asset.status]
                  )}>
                    {asset.status}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">
                  {language === 'ar' ? asset.nameAr : asset.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mb-3">{asset.id}</p>
                
                {/* Health Bar */}
                {asset.status !== 'offline' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Health</span>
                      <span className={cn(
                        'font-medium',
                        asset.health >= 80 && 'text-status-normal',
                        asset.health >= 60 && asset.health < 80 && 'text-status-warning',
                        asset.health < 60 && 'text-status-critical',
                      )}>{asset.health}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all',
                          asset.health >= 80 && 'bg-status-normal',
                          asset.health >= 60 && asset.health < 80 && 'bg-status-warning',
                          asset.health < 60 && 'bg-status-critical',
                        )}
                        style={{ width: `${asset.health}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Metrics */}
                <div className="space-y-1 mb-4">
                  {Object.entries(asset.metrics).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-mono text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs">
                    <ExternalLink className="w-3 h-3 me-1" />
                    Details
                  </Button>
                  <Link to="/vr" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-primary">
                      <View className="w-3 h-3 me-1" />
                      View in 3D
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="panel-industrial overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-start py-3 px-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-start py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-start py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-start py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-start py-3 px-4 font-medium text-muted-foreground">Health</th>
                  <th className="text-start py-3 px-4 font-medium text-muted-foreground">Update</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono text-foreground">{asset.id}</td>
                    <td className="py-3 px-4 text-foreground">{language === 'ar' ? asset.nameAr : asset.name}</td>
                    <td className="py-3 px-4 capitalize text-muted-foreground">{asset.type}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium capitalize',
                        statusColors[asset.status]
                      )}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all',
                              asset.health >= 80 && 'bg-status-normal',
                              asset.health >= 60 && asset.health < 80 && 'bg-status-warning',
                              asset.health < 60 && 'bg-status-critical',
                            )}
                            style={{ width: `${asset.health}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{asset.health}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {asset.lastUpdate.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <Link to="/vr">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assets;
