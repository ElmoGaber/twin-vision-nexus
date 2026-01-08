import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  lastActive: Date;
}

const users: User[] = [
  { id: '1', name: 'Ahmed Al-Hassan', email: 'ahmed@cet.sa', role: 'super_admin', status: 'active', lastActive: new Date() },
  { id: '2', name: 'Sara Mohammed', email: 'sara@cet.sa', role: 'admin', status: 'active', lastActive: new Date(Date.now() - 3600000) },
  { id: '3', name: 'Omar Ibrahim', email: 'omar@cet.sa', role: 'operator', status: 'active', lastActive: new Date(Date.now() - 7200000) },
  { id: '4', name: 'Fatima Ali', email: 'fatima@cet.sa', role: 'operator', status: 'active', lastActive: new Date(Date.now() - 86400000) },
  { id: '5', name: 'Khalid Nasser', email: 'khalid@cet.sa', role: 'viewer', status: 'inactive', lastActive: new Date(Date.now() - 604800000) },
];

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
  const { t, dir } = useLanguage();
  
  const adminSections = [
    { icon: Users, label: 'User Management', count: users.length },
    { icon: Shield, label: 'Roles & Permissions', count: 4 },
    { icon: Settings2, label: 'System Parameters', count: 12 },
    { icon: Bell, label: 'Notification Rules', count: 8 },
    { icon: FileText, label: 'Audit Logs', count: '1.2k' },
    { icon: Key, label: 'API Keys', count: 3 },
  ];
  
  const formatLastActive = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.admin')}</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and system configuration
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
              <h3 className="font-semibold text-foreground">User Management</h3>
            </div>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
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
                placeholder="Search users..."
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
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="text-end py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
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
                          <span className="text-sm capitalize text-foreground">{user.status}</span>
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 me-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 me-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-status-critical">
                              <Trash2 className="w-4 h-4 me-2" />
                              Delete
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
      </div>
    </DashboardLayout>
  );
};

export default Admin;
