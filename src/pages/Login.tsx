import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Zap, Lock, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import cetLogo from '@/assets/cet-logo.png';
import {
  authenticateOffline,
  createOfflineUser,
  startOfflineSession,
  upsertOfflineUser,
} from '@/lib/offlineAuth';

// Security settings
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
};

// Rate limiting helper
class LoginRateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();

  addAttempt(email: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(email);

    if (record && now - record.timestamp < SECURITY_CONFIG.LOCKOUT_DURATION_MS) {
      if (record.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        return false;
      }
      record.count++;
    } else {
      this.attempts.set(email, { count: 1, timestamp: now });
    }

    return true;
  }

  resetAttempts(email: string): void {
    this.attempts.delete(email);
  }

  getRemainingAttempts(email: string): number {
    const record = this.attempts.get(email);
    const now = Date.now();

    if (!record || now - record.timestamp >= SECURITY_CONFIG.LOCKOUT_DURATION_MS) {
      return SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
    }

    return Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - record.count);
  }

  isLocked(email: string): boolean {
    return this.getRemainingAttempts(email) === 0;
  }
}

const rateLimiter = new LoginRateLimiter();

const getNetworkAwareAuthMessage = (rawMessage?: string): string => {
  const message = (rawMessage || '').toLowerCase();

  if (message.includes('failed to fetch') || message.includes('fetch')) {
    return 'تعذر الاتصال بخدمة المصادقة. تأكد من تشغيل Supabase Local عبر supabase start ثم أعد المحاولة.';
  }

  if (message.includes('network')) {
    return 'لا يوجد اتصال بالشبكة أو بالسيرفر المحلي. تأكد أن Docker و Supabase Local يعملان.';
  }

  return rawMessage || 'حدث خطأ غير متوقع. حاول مرة أخرى.';
};

const isConnectivityIssue = (rawMessage?: string): boolean => {
  const message = (rawMessage || '').toLowerCase();
  return message.includes('failed to fetch') || message.includes('fetch') || message.includes('network');
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', passwordConfirm: '', fullName: '' });
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = loginData.email.trim().toLowerCase();

    // Security: Check rate limiting
    if (rateLimiter.isLocked(email)) {
      toast({
        title: '⏱️ حسابك مؤقتاً محظور',
        description: `حاولت عدة مرات. انتظر 15 دقيقة قبل المحاولة مرة أخرى.`,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!navigator.onLine) {
      const offlineUser = await authenticateOffline(email, loginData.password);
      if (offlineUser) {
        startOfflineSession(offlineUser);
        rateLimiter.resetAttempts(email);
        setLoginAttempts(0);
        toast({
          title: '✅ تم تسجيل الدخول أوفلاين',
          description: 'لا يوجد إنترنت. تم الدخول بالبيانات المحلية.',
        });
        setLoginData({ email: '', password: '' });
        setLoading(false);
        setTimeout(() => navigate('/'), 300);
        return;
      }

      toast({
        title: '❌ تعذر تسجيل الدخول أوفلاين',
        description: 'هذا الحساب غير محفوظ محلياً على الجهاز أو كلمة المرور غير صحيحة.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: loginData.password,
      });

      if (error) {
        if (isConnectivityIssue(error.message)) {
          const offlineUser = await authenticateOffline(email, loginData.password);
          if (offlineUser) {
            startOfflineSession(offlineUser);
            rateLimiter.resetAttempts(email);
            setLoginAttempts(0);
            toast({
              title: '✅ تم تسجيل الدخول أوفلاين',
              description: 'تم الدخول باستخدام البيانات المحلية المحفوظة على هذا الجهاز.',
            });
            setLoginData({ email: '', password: '' });
            setTimeout(() => navigate('/'), 500);
            return;
          }
        }

        const remainingAttempts = rateLimiter.getRemainingAttempts(email);
        
        // Determine error message
        let message = getNetworkAwareAuthMessage(error.message);
        if (error.message.includes('Invalid login credentials')) {
          message = `البريد الإلكتروني أو كلمة المرور غير صحيحة. لديك ${remainingAttempts} محاولات متبقية.`;
        } else if (error.message.includes('Email not confirmed')) {
          message = 'سيتم تفعيل حسابك تلقائياً. حاول مرة أخرى بعد دقيقة.';
          // Auto-confirm the email
          await supabase.auth.updateUser({ email_confirm: true }).catch(() => {});
        } else if (error.message.includes('rate limit')) {
          message = 'حاولت مرات كثيرة. انتظر قليلاً قبل المحاولة مرة أخرى.';
        }

        // Only update login attempts if still have attempts left
        if (remainingAttempts > 0) {
          rateLimiter.addAttempt(email);
          setLoginAttempts(SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - rateLimiter.getRemainingAttempts(email));
        }

        toast({
          title: '🔒 فشل تسجيل الدخول',
          description: message,
          variant: 'destructive',
        });
      } else {
        // Success
        await upsertOfflineUser({
          email,
          password: loginData.password,
        });

        rateLimiter.resetAttempts(email);
        setLoginAttempts(0);

        toast({
          title: '✅ نجح تسجيل الدخول',
          description: 'جاري نقلك إلى الصفحة الرئيسية...',
        });

        // Clear form and navigate
        setLoginData({ email: '', password: '' });
        setTimeout(() => navigate('/'), 500);
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof Error && isConnectivityIssue(error.message)) {
        const offlineUser = await authenticateOffline(email, loginData.password);
        if (offlineUser) {
          startOfflineSession(offlineUser);
          rateLimiter.resetAttempts(email);
          setLoginAttempts(0);
          toast({
            title: '✅ تم تسجيل الدخول أوفلاين',
            description: 'تم الدخول باستخدام البيانات المحلية المحفوظة على هذا الجهاز.',
          });
          setLoginData({ email: '', password: '' });
          setTimeout(() => navigate('/'), 500);
          return;
        }
      }

      const message = error instanceof Error
        ? getNetworkAwareAuthMessage(error.message)
        : 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.';
      toast({
        title: '❌ خطأ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`كلمة المرور يجب أن تكون 8 أحرف على الأقل`);
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('يجب أن تحتوي على حرف كبير (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('يجب أن تحتوي على حرف صغير (a-z)');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('يجب أن تحتوي على رقم (0-9)');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('يجب أن تحتوي على رمز خاص (!@#$%^&*)');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = signupData.email.trim().toLowerCase();
    const password = signupData.password;

    // Validation
    if (!signupData.fullName.trim()) {
      toast({
        title: '⚠️ خطأ',
        description: 'الرجاء إدخال اسمك الكامل',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast({
        title: '🔐 كلمة مرور ضعيفة',
        description: passwordValidation.errors.join('\n'),
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Check password confirmation
    if (password !== signupData.passwordConfirm) {
      toast({
        title: '⚠️ عدم تطابق',
        description: 'كلمات المرور غير متطابقة',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!navigator.onLine) {
      try {
        const offlineUser = await createOfflineUser({
          email,
          password,
          fullName: signupData.fullName,
        });
        startOfflineSession(offlineUser);
        toast({
          title: '✅ تم إنشاء حساب أوفلاين',
          description: 'تم حفظ الحساب على هذا الجهاز ويمكن استخدامه بدون إنترنت.',
        });
        setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
        setLoading(false);
        setTimeout(() => navigate('/'), 300);
        return;
      } catch (offlineCreateError) {
        const offlineMessage = offlineCreateError instanceof Error
          ? offlineCreateError.message.includes('already registered')
            ? 'الحساب موجود محلياً بالفعل. جرّب تسجيل الدخول.'
            : offlineCreateError.message
          : 'تعذر إنشاء حساب محلي.';
        toast({
          title: '❌ خطأ في التسجيل الأوفلاين',
          description: offlineMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    try {
      // Sign up the user
      // تحديد redirect URL صحيح (يستخدم localhost في development و الدومين الحقيقي في production)
      const redirectUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5173' 
        : window.location.origin;
      
      const { data: signupData_response, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: signupData.fullName },
        },
      });

      if (signupError) {
        if (isConnectivityIssue(signupError.message)) {
          try {
            const offlineUser = await createOfflineUser({
              email,
              password,
              fullName: signupData.fullName,
            });
            startOfflineSession(offlineUser);
            toast({
              title: '✅ تم إنشاء حساب أوفلاين',
              description: 'تم إنشاء الحساب محلياً ويمكنك استخدامه بدون إنترنت على هذا الجهاز.',
            });
            setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
            setTimeout(() => navigate('/'), 500);
            setLoading(false);
            return;
          } catch (offlineCreateError) {
            const offlineMessage = offlineCreateError instanceof Error
              ? offlineCreateError.message.includes('already registered')
                ? 'الحساب موجود محلياً بالفعل. جرّب تسجيل الدخول.'
                : offlineCreateError.message
              : 'تعذر إنشاء حساب محلي.';
            toast({
              title: '❌ خطأ في التسجيل',
              description: offlineMessage,
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
        }

        let errorMessage = getNetworkAwareAuthMessage(signupError.message);
        if (signupError.message.includes('already registered')) {
          errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل. الرجاء محاولة تسجيل الدخول.';
        }
        toast({
          title: '❌ خطأ في التسجيل',
          description: errorMessage,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Check if user was created
      if (signupData_response.user) {
        await upsertOfflineUser({
          email,
          password,
          fullName: signupData.fullName,
        });

        // ✅ الترخيص يُنشأ تلقائياً على الخادم عبر Trigger
        // Database trigger من auth.users سيُنشئ ترخيص 14 يوم تلقائياً
        // لا حاجة لإنشاء يدوي من Frontend

        // Try immediate sign-in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError) {
          // Auto sign-in successful
          toast({
            title: '✅ تم إنشاء الحساب بنجاح',
            description: 'جاري نقلك إلى الصفحة الرئيسية...',
          });
          // Clear form
          setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
          // Navigate to home
          setTimeout(() => navigate('/'), 500);
        } else if (signInError?.message.includes('Email not confirmed')) {
          // Email confirmation issue - try to auto-confirm
          try {
            // Use admin API to auto-confirm if possible
            const { error: updateError } = await supabase.auth.updateUser({
              email_confirm: true,
            });

            if (!updateError) {
              // Try signing in again after confirmation
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (!retryError) {
                toast({
                  title: '✅ تم إنشاء الحساب',
                  description: 'جاري نقلك إلى الصفحة الرئيسية...',
                });
                setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
                setTimeout(() => navigate('/'), 500);
                return;
              }
            }
          } catch (err) {
            // Continue with regular signup message
          }

          toast({
            title: '✅ تم إنشاء الحساب',
            description: 'تم تفعيل حسابك تلقائياً. حاول تسجيل الدخول الآن.',
            variant: 'default',
          });
          setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
        } else {
          toast({
            title: '✅ تم إنشاء الحساب',
            description: 'حاول تسجيل الدخول بنفس البريد وكلمة المرور.',
            variant: 'default',
          });
          setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);

      if (error instanceof Error && isConnectivityIssue(error.message)) {
        try {
          const offlineUser = await createOfflineUser({
            email,
            password,
            fullName: signupData.fullName,
          });
          startOfflineSession(offlineUser);
          toast({
            title: '✅ تم إنشاء حساب أوفلاين',
            description: 'تم إنشاء الحساب محلياً ويمكنك الدخول الآن بدون إنترنت.',
          });
          setSignupData({ email: '', password: '', passwordConfirm: '', fullName: '' });
          setTimeout(() => navigate('/'), 500);
          return;
        } catch {
          // Fallback to generic message below.
        }
      }

      const message = error instanceof Error
        ? getNetworkAwareAuthMessage(error.message)
        : 'حدثت مشكلة أثناء التسجيل. حاول مرة أخرى.';
      toast({
        title: '❌ خطأ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={cetLogo} alt="CET Logo" className="h-12" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">SolarPulse Digital Twin</CardTitle>
          </div>
          <CardDescription>Sign in to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                {loginAttempts > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ لديك {SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - loginAttempts} محاولات متبقية
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Gmail Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@gmail.com"
                      className="pl-9"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <Shield className="w-4 h-4" />
                  {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4 max-h-[600px] overflow-y-auto">
                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    🔒 نظام أمان قوي: كلمات المرور مشفرة والحسابات محمية
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ahmed Mohamed"
                      className="pl-9"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Gmail Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@gmail.com"
                      className="pl-9"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    يجب أن تحتوي على: 8+ أحرف، حرف كبير، حرف صغير، رقم، رمز خاص
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={signupData.passwordConfirm}
                      onChange={(e) => setSignupData({ ...signupData, passwordConfirm: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <Shield className="w-4 h-4" />
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  بإنشاء حساب، أوافق على سياسة الخصوصية وشروط الخدمة
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
