import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  BarChart3, 
  Bell, 
  View, 
  Settings, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import cetLogo from '@/assets/cet-logo.png';

interface NavItem {
  key: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'nav.dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'nav.assets', icon: Box, path: '/assets' },
  { key: 'nav.analytics', icon: BarChart3, path: '/analytics' },
  { key: 'nav.alarms', icon: Bell, path: '/alarms' },
  { key: 'nav.vrView', icon: View, path: '/vr' },
  { key: 'nav.admin', icon: Shield, path: '/admin' },
  { key: 'nav.settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t, dir } = useLanguage();
  const location = useLocation();
  
  const isRTL = dir === 'rtl';
  
  return (
    <aside 
      className={cn(
        'bg-sidebar-background border-sidebar-border flex flex-col transition-all duration-300 relative',
        isRTL ? 'border-l' : 'border-r',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <img 
            src={cetLogo} 
            alt="CET Logo" 
            className="w-10 h-10 object-contain"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sidebar-foreground font-bold text-lg">CET</span>
              <span className="text-sidebar-foreground/60 text-xs">Digital Twin</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-industrial">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg glow-primary' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive && 'drop-shadow-lg'
              )} />
              {!collapsed && (
                <span className="font-medium truncate">{t(item.key)}</span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* System Status Indicator */}
      <div className={cn(
        'border-t border-sidebar-border p-4',
        collapsed && 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-2',
          collapsed && 'justify-center'
        )}>
          <div className="relative">
            <Zap className="w-5 h-5 text-status-normal" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-status-normal rounded-full status-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs text-sidebar-foreground/60">System</span>
              <span className="text-sm font-medium text-status-normal">Online</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute top-20 -right-3 w-6 h-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10',
          isRTL && '-left-3 right-auto'
        )}
      >
        {collapsed ? (
          isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};
