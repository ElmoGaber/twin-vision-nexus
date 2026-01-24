import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedVRScene } from '@/components/vr/EnhancedVRScene';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVR } from '@/contexts/VRContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Maximize2, 
  RotateCcw, 
  Settings, 
  Camera, 
  List,
  AlertTriangle,
  Zap,
  Thermometer,
  Navigation,
  Target,
  ChevronRight
} from 'lucide-react';

const VRView = () => {
  const { t } = useLanguage();
  const { solarPanels, transformers, alarms, navigateToAsset, clearNavigationTarget } = useVR();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAssetList, setShowAssetList] = useState(true);
  
  const criticalAssets = [
    ...solarPanels.filter(p => p.status === 'critical'),
    ...transformers.filter(t => t.status === 'critical'),
  ];
  
  const warningAssets = [
    ...solarPanels.filter(p => p.status === 'warning'),
    ...transformers.filter(t => t.status === 'warning'),
  ];
  
  const handleNavigateToAsset = (asset: { id: string; position: [number, number, number]; type: string }) => {
    navigateToAsset({
      assetId: asset.id,
      assetType: asset.type,
      position: asset.position,
      focus: true,
    });
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('vr.title')}</h1>
            <p className="text-muted-foreground">
              Interactive 3D walkthrough with real-time data synchronization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAssetList(!showAssetList)}
            >
              <List className="w-4 h-4 me-2" />
              Assets
            </Button>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 me-2" />
              Screenshot
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => clearNavigationTarget()}
            >
              <RotateCcw className="w-4 h-4 me-2" />
              Reset View
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 me-2" />
              Settings
            </Button>
            <Button 
              size="sm" 
              className="bg-primary"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-4 h-4 me-2" />
              Fullscreen
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-[600px]">
          {/* VR Scene */}
          <div className={`flex-1 ${showAssetList ? '' : 'w-full'}`}>
            <EnhancedVRScene />
          </div>
          
          {/* Asset Navigation Panel */}
          {showAssetList && (
            <Card className="w-80 bg-card/80 backdrop-blur-sm border-border p-4">
              <Tabs defaultValue="alerts" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="alerts" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger value="panels">Panels</TabsTrigger>
                  <TabsTrigger value="transformers">Trans.</TabsTrigger>
                </TabsList>
                
                <TabsContent value="alerts" className="flex-1 mt-4">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {/* Critical Section */}
                      {criticalAssets.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-status-critical uppercase tracking-wide mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse" />
                            Critical ({criticalAssets.length})
                          </p>
                          <div className="space-y-2">
                            {criticalAssets.map(asset => (
                              <button
                                key={asset.id}
                                onClick={() => handleNavigateToAsset({
                                  id: asset.id,
                                  position: asset.position,
                                  type: 'status' in asset && 'power' in asset ? 'panel' : 'transformer'
                                })}
                                className="w-full p-3 rounded-lg border border-status-critical/50 bg-status-critical/10 hover:bg-status-critical/20 transition-colors text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold">{asset.id}</span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {'temperature' in asset && (
                                    <span className="flex items-center gap-1">
                                      <Thermometer className="w-3 h-3" />
                                      {asset.temperature.toFixed(0)}°C
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Navigation className="w-3 h-3" />
                                    Jump to VR
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Warning Section */}
                      {warningAssets.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-status-warning uppercase tracking-wide mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-status-warning" />
                            Warning ({warningAssets.length})
                          </p>
                          <div className="space-y-2">
                            {warningAssets.map(asset => (
                              <button
                                key={asset.id}
                                onClick={() => handleNavigateToAsset({
                                  id: asset.id,
                                  position: asset.position,
                                  type: 'power' in asset ? 'panel' : 'transformer'
                                })}
                                className="w-full p-3 rounded-lg border border-status-warning/50 bg-status-warning/10 hover:bg-status-warning/20 transition-colors text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold">{asset.id}</span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {'efficiency' in asset && (
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      {(asset as any).efficiency.toFixed(0)}% eff
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Navigation className="w-3 h-3" />
                                    Jump to VR
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {criticalAssets.length === 0 && warningAssets.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>All systems operational</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="panels" className="flex-1 mt-4">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {solarPanels.slice(0, 20).map(panel => (
                        <button
                          key={panel.id}
                          onClick={() => handleNavigateToAsset({
                            id: panel.id,
                            position: panel.position,
                            type: 'panel'
                          })}
                          className={`w-full p-3 rounded-lg border transition-colors text-left ${
                            panel.status === 'critical' 
                              ? 'border-status-critical/50 bg-status-critical/10 hover:bg-status-critical/20'
                              : panel.status === 'warning'
                              ? 'border-status-warning/50 bg-status-warning/10 hover:bg-status-warning/20'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{panel.id}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                panel.status === 'normal' ? 'border-status-normal text-status-normal' :
                                panel.status === 'warning' ? 'border-status-warning text-status-warning' :
                                'border-status-critical text-status-critical'
                              }`}
                            >
                              {panel.power.toFixed(0)} kW
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="transformers" className="flex-1 mt-4">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {transformers.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleNavigateToAsset({
                            id: t.id,
                            position: t.position,
                            type: 'transformer'
                          })}
                          className={`w-full p-3 rounded-lg border transition-colors text-left ${
                            t.status === 'critical' 
                              ? 'border-status-critical/50 bg-status-critical/10 hover:bg-status-critical/20'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold">{t.id}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                t.status === 'normal' ? 'border-status-normal text-status-normal' :
                                'border-status-critical text-status-critical'
                              }`}
                            >
                              {t.load.toFixed(0)}% load
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              {t.temperature.toFixed(0)}°C
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
        
        {/* Asset Legend */}
        <div className="panel-industrial p-4">
          <h3 className="font-semibold text-foreground mb-3">Asset Legend & Quick Stats</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-normal" />
              <span className="text-sm text-muted-foreground">
                Normal ({solarPanels.filter(p => p.status === 'normal').length + transformers.filter(t => t.status === 'normal').length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-warning" />
              <span className="text-sm text-muted-foreground">
                Warning ({solarPanels.filter(p => p.status === 'warning').length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-critical status-blink-critical" />
              <span className="text-sm text-muted-foreground">
                Critical ({criticalAssets.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">
                Total Panels: {solarPanels.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VRView;
