import { useLicense } from '@/contexts/LicenseContext';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate = ({ feature, children, fallback }: FeatureGateProps) => {
  const { hasFeature } = useLicense();

  if (!hasFeature(feature)) {
    return fallback ?? (
      <div className="flex items-center justify-center p-8 rounded-lg border border-border bg-muted/30">
        <div className="text-center space-y-2">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            This feature requires an upgraded license
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
