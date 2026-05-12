import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Trash2, RefreshCw, Plus, Download } from 'lucide-react';

interface License {
  id: string;
  email: string;
  license_key: string;
  created_at: string;
  expires_at: string;
  last_accessed_at: string | null;
  status: 'active' | 'expired' | 'revoked';
  days_valid: number;
  notes: string | null;
}

interface AuditLog {
  id: string;
  email: string;
  action: string;
  status: string;
  created_at: string;
}

export const LicenseManagement = () => {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [daysValid, setDaysValid] = useState('14');
  const [notes, setNotes] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [activeTab, setActiveTab] = useState('licenses');

  useEffect(() => {
    fetchLicenses();
    fetchAuditLogs();
    const interval = setInterval(() => {
      fetchLicenses();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الترخيصات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('license_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const createLicense = async () => {
    if (!newEmail.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال بريد إلكتروني',
        variant: 'destructive',
      });
      return;
    }

    try {
      const licenseKey = `LICENSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(daysValid));

      const { data, error } = await supabase
        .from('licenses')
        .insert({
          email: newEmail.toLowerCase().trim(),
          license_key: licenseKey,
          expires_at: expiryDate.toISOString(),
          days_valid: parseInt(daysValid),
          notes,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setLicenses([data as License, ...licenses]);
      setNewEmail('');
      setNotes('');
      setDaysValid('14');
      setShowDialog(false);

      toast({
        title: 'نجح ✓',
        description: 'تم إنشاء الترخيص بنجاح',
      });
    } catch (err: any) {
      toast({
        title: 'خطأ',
        description: err.message || 'فشل إنشاء الترخيص',
        variant: 'destructive',
      });
    }
  };

  const revokeLicense = async (email: string) => {
    try {
      const { error } = await supabase
        .from('licenses')
        .update({ status: 'revoked' })
        .eq('email', email);

      if (error) throw error;

      await supabase.from('license_audit_logs').insert({
        email,
        action: 'revoked_by_admin',
        status: 'revoked',
      });

      setLicenses(
        licenses.map((l) => (l.email === email ? { ...l, status: 'revoked' } : l))
      );

      toast({
        title: 'نجح ✓',
        description: 'تم إلغاء الترخيص بنجاح',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل إلغاء الترخيص',
        variant: 'destructive',
      });
    }
  };

  const extendLicense = async (email: string, additionalDays: number) => {
    try {
      const license = licenses.find((l) => l.email === email);
      if (!license) return;

      const newExpiry = new Date(license.expires_at);
      newExpiry.setDate(newExpiry.getDate() + additionalDays);

      const { error } = await supabase
        .from('licenses')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('email', email);

      if (error) throw error;

      setLicenses(
        licenses.map((l) =>
          l.email === email ? { ...l, expires_at: newExpiry.toISOString() } : l
        )
      );

      toast({
        title: 'نجح ✓',
        description: `تم تمديد الترخيص بـ ${additionalDays} أيام`,
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل تمديد الترخيص',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: 'تم النسخ إلى الحافظة ✓',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'revoked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const exportLicenses = () => {
    const csv = [
      ['البريد الإلكتروني', 'مفتاح الترخيص', 'تاريخ الإنشاء', 'تاريخ الانتهاء', 'الحالة', 'الأيام المتبقية'],
      ...licenses.map((l) => [
        l.email,
        l.license_key,
        new Date(l.created_at).toLocaleDateString('ar-EG'),
        new Date(l.expires_at).toLocaleDateString('ar-EG'),
        l.status,
        getDaysRemaining(l.expires_at),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">إدارة الترخيصات</h2>
          <p className="text-muted-foreground">
            إدارة كاملة لترخيصات المستخدمين والوصول المؤقت
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportLicenses}>
            <Download className="h-4 w-4 mr-2" />
            تصدير CSV
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            ترخيص جديد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="licenses">
            الترخيصات ({licenses.length})
          </TabsTrigger>
          <TabsTrigger value="audit">
            سجل التدقيق ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="space-y-4">
          {licenses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا توجد ترخيصات</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>مفتاح الترخيص</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">{license.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {license.license_key.slice(0, 15)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(license.license_key)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>{license.days_valid} يوم</TableCell>
                      <TableCell>
                        {new Date(license.expires_at).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {getDaysRemaining(license.expires_at)} يوم
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(license.status)}>
                          {license.status === 'active' && '✓ نشط'}
                          {license.status === 'expired' && '⏰ منتهي'}
                          {license.status === 'revoked' && '🚫 ملغى'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {license.status === 'active' ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => extendLicense(license.email, 14)}
                              title="تمديد لـ 14 يوماً"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeLicense(license.email)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {auditLogs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">لا يوجد سجل تدقيق</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الإجراء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الوقت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.email}</TableCell>
                      <TableCell>
                        {log.action === 'access' && '🔓 وصول'}
                        {log.action === 'access_denied' && '❌ وصول مرفوض'}
                        {log.action === 'revoked' && '🚫 ملغى'}
                        {log.action === 'revoked_by_admin' && '🔨 ملغى من المسؤول'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء ترخيص جديد</DialogTitle>
            <DialogDescription>
              أنشئ ترخيصاً مؤقتاً لمستخدم جديد بوصول محدود الهدف
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium">عدد الأيام الصالحة</label>
              <Input
                type="number"
                min="1"
                max="365"
                value={daysValid}
                onChange={(e) => setDaysValid(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">ملاحظات (اختياري)</label>
              <Input
                placeholder="مثال: عميل تجريبي، مشروع خاص..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={createLicense}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
