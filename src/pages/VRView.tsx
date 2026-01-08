import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VRScene } from '@/components/vr/VRScene';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Maximize2, RotateCcw, Settings, Camera } from 'lucide-react';

const VRView = () => {
  const { t } = useLanguage();
  
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('vr.title')}</h1>
            <p className="text-muted-foreground">
              Interactive 3D walkthrough of your solar power plant
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 me-2" />
              Screenshot
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 me-2" />
              Reset View
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 me-2" />
              Settings
            </Button>
            <Button size="sm" className="bg-primary">
              <Maximize2 className="w-4 h-4 me-2" />
              Fullscreen
            </Button>
          </div>
        </div>
        
        {/* VR Scene */}
        <div className="flex-1 min-h-[600px]">
          <VRScene />
        </div>
        
        {/* Asset Legend */}
        <div className="panel-industrial p-4">
          <h3 className="font-semibold text-foreground mb-3">Asset Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-normal" />
              <span className="text-sm text-muted-foreground">Normal Operation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-warning" />
              <span className="text-sm text-muted-foreground">Warning - Degraded Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-critical status-blink-critical" />
              <span className="text-sm text-muted-foreground">Critical - Immediate Attention</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-offline" />
              <span className="text-sm text-muted-foreground">Offline</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VRView;
