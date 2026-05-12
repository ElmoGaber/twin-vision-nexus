import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLicensePanel } from '@/components/admin/AdminLicensePanel';
import { LicenseManagement } from '@/components/admin/LicenseManagement';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Shield, 
  Settings2, 
  FileText, 
  Bell, 
  Key,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  lastActive: Date;
}

const roleColors = {
  super_admin: 'bg-status-critical/20 text-status-critical border-status-critical/30',
  admin: 'bg-primary/20 text-primary border-primary/30',
  operator: 'bg-status-normal/20 text-status-normal border-status-normal/30',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'System Admin',
  operator: 'Operator',
  viewer: 'Viewer',
};

const Admin = () => {
  const { t, dir, language } = useLanguage();
  const { toast } = useToast();
  
  // Load users from localStorage or use default
  const loadUsersFromStorage = (): User[] => {
    try {
      const stored = localStorage.getItem('tvnx_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((u: any) => ({
          ...u,
          lastActive: new Date(u.lastActive)
        }));
      }
    } catch (e) {
      console.error('Error loading users from localStorage:', e);
    }
    
    // Default users
    return [
      { id: '1', name: 'Ahmed Al-Hassan', email: 'ahmed@solarpulse.com', role: 'super_admin', status: 'active', lastActive: new Date() },
      { id: '2', name: 'Sara Mohammed', email: 'sara@solarpulse.com', role: 'admin', status: 'active', lastActive: new Date(Date.now() - 3600000) },
      { id: '3', name: 'Omar Ibrahim', email: 'omar@solarpulse.com', role: 'operator', status: 'active', lastActive: new Date(Date.now() - 7200000) },
      { id: '4', name: 'Fatima Ali', email: 'fatima@solarpulse.com', role: 'operator', status: 'active', lastActive: new Date(Date.now() - 86400000) },
      { id: '5', name: 'Khalid Nasser', email: 'khalid@solarpulse.com', role: 'viewer', status: 'inactive', lastActive: new Date(Date.now() - 604800000) },
    ];
  };
  
  const [users, setUsers] = useState<User[]>(loadUsersFromStorage());
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as User['role'],
    status: 'active' as User['status'],
  });
  
  // Save users to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tvnx_users', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }, [users]);
  
  const adminSections = [
    { icon: Users, label: language === 'ar' ? 'إدارة المستخدمين' : 'User Management', count: users.length },
    { icon: Shield, label: language === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions', count: 4 },
    { icon: Settings2, label: language === 'ar' ? 'إعدادات النظام' : 'System Parameters', count: 12 },
    { icon: Bell, label: language === 'ar' ? 'قواعد الإشعارات' : 'Notification Rules', count: 8 },
    { icon: FileText, label: language === 'ar' ? 'سجلات التدقيق' : 'Audit Logs', count: '1.2k' },
    { icon: Key, label: language === 'ar' ? 'مفاتيح API' : 'API Keys', count: 3 },
  ];
  
  const formatLastActive = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (language === 'ar') {
      if (diff < 1) return 'الآن';
      if (diff < 60) return `منذ ${diff} دقيقة`;
      if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
      return `منذ ${Math.floor(diff / 1440)} يوم`;
    }
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };
  
  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      lastActive: new Date(),
    };
    
    setUsers([...users, newUser]);
    setIsDialogOpen(false);
    setFormData({ name: '', email: '', role: 'viewer', status: 'active' });
    
    toast({
      title: language === 'ar' ? 'تمت الإضافة' : 'User Added',
      description: language === 'ar' ? `تم إضافة ${newUser.name} بنجاح` : `${newUser.name} has been added successfully`,
    });
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: language === 'ar' ? 'تم الحذف' : 'User Deleted',
      description: language === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User has been deleted successfully',
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.admin')}</h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'إدارة المستخدمين والأدوار وتكوين النظام' : 'Manage users, roles, and system configuration'}
            </p>
          </div>
        </div>
        
        {/* Admin Sections Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {adminSections.map((section, index) => (
            <div 
              key={index}
              className="panel-industrial p-4 cursor-pointer hover:border-primary/50 transition-all"
            >
              <section.icon className="w-6 h-6 text-primary mb-3" />
              <p className="font-medium text-foreground text-sm">{section.label}</p>
              <p className="text-2xl font-bold text-foreground">{section.count}</p>
            </div>
          ))}
        </div>
        
        {/* User Management */}
        <div className="panel-industrial">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
              </h3>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة مستخدم' : 'Add User'}
            </Button>
          </div>
          
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4 max-w-md">
              <Search className={cn(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
                dir === 'rtl' ? 'right-3' : 'left-3'
              )} />
              <Input
                placeholder={language === 'ar' ? 'بحث عن المستخدمين...' : 'Search users...'}
                className={cn(
                  'bg-muted/50',
                  dir === 'rtl' ? 'pr-10' : 'pl-10'
                )}
              />
            </div>
            
            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'المستخدم' : 'User'}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'الدور' : 'Role'}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'آخر نشاط' : 'Last Active'}
                    </th>
                    <th className="text-end py-3 px-4 text-sm font-medium text-muted-foreground">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium border',
                          roleColors[user.role]
                        )}>
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            user.status === 'active' ? 'bg-status-normal' : 'bg-status-offline'
                          )} />
                          <span className="text-sm capitalize text-foreground">
                            {language === 'ar' 
                              ? (user.status === 'active' ? 'نشط' : 'غير نشط')
                              : user.status
                            }
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatLastActive(user.lastActive)}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 me-2" />
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 me-2" />
                              {language === 'ar' ? 'إرسال بريد' : 'Send Email'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-status-critical"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4 me-2" />
                              {language === 'ar' ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* License Management Panel */}
        <AdminLicensePanel />
        
        {/* License Management */}
        <LicenseManagement />
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل بيانات المستخدم الجديد. جميع الحقول مطلوبة.'
                : 'Enter the details of the new user. All fields are required.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </Label>
              <Input
                id="name"
                placeholder={language === 'ar' ? 'أحمد محمد' : 'John Doe'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@solarpulse.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">
                {language === 'ar' ? 'الدور' : 'Role'}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الدور' : 'Select role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">
                {language === 'ar' ? 'الحالة' : 'Status'}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: User['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Select status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {language === 'ar' ? 'غير نشط' : 'Inactive'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="w-4 h-4 me-2" />
              {language === 'ar' ? 'إضافة' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Admin;
