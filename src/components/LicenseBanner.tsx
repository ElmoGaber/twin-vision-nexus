import { useLicense } from '@/contexts/LicenseContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Shield } from 'lucide-react';

export const LicenseBanner = () => {
  const { license, remainingDays, remainingUsage, isAdmin } = useLicense();

  if (!license || isAdmin) return null;

  const isTrialWarning = license.status === 'trial' && remainingDays <= 5;
  const isUsageWarning = remainingUsage <= 50;

  if (!isTrialWarning && !isUsageWarning) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2 mx-4 mt-2 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2 text-sm text-destructive">
        {isTrialWarning && (
          <>
            <Clock className="w-4 h-4" />
            <span>Trial expires in {remainingDays} day{remainingDays !== 1 ? 's' : ''}</span>
          </>
        )}
        {isUsageWarning && (
          <>
            <Zap className="w-4 h-4" />
            <span>{remainingUsage} actions remaining</span>
          </>
        )}
      </div>
      <Badge variant="outline" className="border-destructive/30 text-destructive text-xs">
        <Shield className="w-3 h-3 mr-1" />
        {license.status.toUpperCase()}
      </Badge>
    </div>
  );
};
