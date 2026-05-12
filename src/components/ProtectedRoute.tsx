import { useAuth } from '@/contexts/AuthContext';
import { useLicense } from '@/contexts/LicenseContext';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isValid: licenseValid, loading: licenseLoading, remainingDays, errorCode } = useLicense();

  if (authLoading || licenseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // No authenticated user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // License expired or revoked
  if (!licenseValid) {
    const errorMessages: Record<string, { title: string; description: string }> = {
      'EXPIRED': {
        title: '⏰ انتهت صلاحية الترخيص',
        description: 'للأسف، انتهت صلاحية الترخيص الخاص بك. يرجى التواصل مع المسؤول للحصول على ترخيص جديد.'
      },
      'REVOKED': {
        title: '🚫 تم إلغاء الترخيص',
        description: 'تم إلغاء الترخيص الخاص بك. يرجى التواصل مع فريق المسؤولين إذا كان لديك أي استفسارات.'
      },
      'NO_LICENSE': {
        title: '⚠️ لا يوجد ترخيص',
        description: 'لم يتم العثور على ترخيص لحسابك. يرجى التواصل مع المسؤول.'
      },
      'ERROR': {
        title: '❌ خطأ في التحقق من الترخيص',
        description: 'حدث خطأ أثناء التحقق من صحة الترخيص. يرجى إعادة المحاولة.'
      },
    };

    const error = errorMessages[errorCode || 'ERROR'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <h2 className="text-lg font-semibold mb-2">{error.title}</h2>
              <p className="text-sm mb-4">{error.description}</p>
              <div className="text-xs opacity-75">
                البريد الإلكتروني: {user.email}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // License about to expire (warning)
  if (remainingDays <= 3 && remainingDays > 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  ⚠️ الترخيص ينتهي قريباً!
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  يتبقى {remainingDays} أيام فقط. يرجى تجديد الترخيص قريباً.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-yellow-900 border-yellow-300 hover:bg-yellow-100"
            >
              تجديد الآن
            </Button>
          </div>
        </div>
        <div className="pt-24">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
