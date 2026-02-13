import { useLicense } from '@/contexts/LicenseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldX, Clock, AlertTriangle, Ban, RefreshCw } from 'lucide-react';

const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  const { isValid, loading, errorCode, license, remainingDays, refreshLicense } = useLicense();
  const { signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Validating license...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    const errorMessages: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
      NO_LICENSE: {
        icon: <ShieldX className="w-12 h-12 text-destructive" />,
        title: 'No License Found',
        desc: 'Your account does not have a license. Please contact the administrator.',
      },
      EXPIRED: {
        icon: <Clock className="w-12 h-12 text-destructive" />,
        title: 'License Expired',
        desc: 'Your license has expired. Please contact the administrator to renew.',
      },
      REVOKED: {
        icon: <Ban className="w-12 h-12 text-destructive" />,
        title: 'License Revoked',
        desc: 'Your license has been revoked. Please contact the administrator.',
      },
      USAGE_EXCEEDED: {
        icon: <AlertTriangle className="w-12 h-12 text-destructive" />,
        title: 'Usage Limit Exceeded',
        desc: 'You have exceeded your usage limit. Please contact the administrator.',
      },
    };

    const msg = errorMessages[errorCode || ''] || {
      icon: <ShieldX className="w-12 h-12 text-destructive" />,
      title: 'License Invalid',
      desc: 'Your license could not be validated. Please try again or contact support.',
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">{msg.icon}</div>
            <CardTitle>{msg.title}</CardTitle>
            <CardDescription>{msg.desc}</CardDescription>
            {license && (
              <Badge variant="outline" className="mx-auto">
                Status: {license.status}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={refreshLicense} variant="outline" className="w-full gap-2">
              <RefreshCw className="w-4 h-4" /> Retry Validation
            </Button>
            <Button onClick={signOut} variant="ghost" className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default LicenseGate;
