import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Globe, Search, User, RefreshCw, LogIn, AlertTriangle, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useVR } from '@/contexts/VRContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const Header: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { alarms } = useVR();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const activeAlarms = alarms.filter(a => a.severity === 'critical' || a.severity === 'warning');
  const criticalAlarms = alarms.filter(a => a.severity === 'critical');
  const warningAlarms = alarms.filter(a => a.severity === 'warning');
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAlarmTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return language === 'ar' ? 'الآن' : 'Just now';
    if (minutes < 60) return language === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return language === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <header className={cn(
      'h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6',
    )}>
      {/* Left Section - Title & Live Status */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <h1 className="text-lg font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-normal/10 border border-status-normal/30">
          <span className="w-2 h-2 rounded-full bg-status-normal status-pulse" />
          <span className="text-xs font-semibold text-status-normal tracking-wider">
            {t('common.live')}
          </span>
        </div>
      </div>
      
      {/* Center Section - Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
            dir === 'rtl' ? 'right-3' : 'left-3'
          )} />
          <Input 
            placeholder={t('common.search')}
            className={cn(
              'bg-muted/50 border-border/50 focus:border-primary',
              dir === 'rtl' ? 'pr-10' : 'pl-10'
            )}
          />
        </div>
      </div>
      
      {/* Right Section - Actions & Time */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Time Display */}
        <div className="hidden md:flex flex-col items-end text-sm">
          <span className="font-mono font-bold text-foreground tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(currentTime)}
          </span>
        </div>
        
        <div className="w-px h-8 bg-border hidden md:block" />
        
        {/* Refresh */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
        </Button>
        
        {/* Alarms Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              {activeAlarms.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-critical text-[10px] font-bold flex items-center justify-center text-primary-foreground status-blink-critical">
                  {activeAlarms.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align={dir === 'rtl' ? 'start' : 'end'}>
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">
                  {language === 'ar' ? 'التنبيهات' : 'Alerts'}
                </h4>
                <div className="flex gap-2">
                  {criticalAlarms.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {criticalAlarms.length} {language === 'ar' ? 'حرجة' : 'Critical'}
                    </Badge>
                  )}
                  {warningAlarms.length > 0 && (
                    <Badge variant="outline" className="text-xs border-status-warning text-status-warning">
                      {warningAlarms.length} {language === 'ar' ? 'تحذير' : 'Warning'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <ScrollArea className="h-[300px]">
              {activeAlarms.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-10 h-10 mx-auto text-status-normal mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'لا توجد تنبيهات نشطة' : 'No active alerts'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeAlarms.map((alarm) => (
                    <div 
                      key={alarm.id} 
                      className={cn(
                        'p-3 hover:bg-muted/50 transition-colors cursor-pointer',
                        alarm.severity === 'critical' && 'border-l-2 border-l-status-critical',
                        alarm.severity === 'warning' && 'border-l-2 border-l-status-warning'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {alarm.severity === 'critical' ? (
                          <AlertCircle className="w-5 h-5 text-status-critical flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {alarm.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {alarm.assetType === 'panel' ? (language === 'ar' ? 'لوحة' : 'Panel') :
                               alarm.assetType === 'transformer' ? (language === 'ar' ? 'محول' : 'Transformer') :
                               (language === 'ar' ? 'عاكس' : 'Inverter')}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatAlarmTime(alarm.timestamp)}
                            </span>
                          </div>
                          {alarm.aiRecommendation && (
                            <div className="mt-2 p-2 bg-primary/10 rounded text-xs text-primary">
                              <Zap className="w-3 h-3 inline mr-1" />
                              {alarm.aiRecommendation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-2 border-t border-border">
              <Button variant="ghost" className="w-full text-sm" size="sm">
                {language === 'ar' ? 'عرض جميع التنبيهات' : 'View All Alerts'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Globe className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
            <DropdownMenuItem 
              onClick={() => setLanguage('en')}
              className={cn(language === 'en' && 'bg-accent')}
            >
              🇺🇸 English
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('ar')}
              className={cn(language === 'ar' && 'bg-accent')}
            >
              🇸🇦 العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'} className="w-56">
            <DropdownMenuLabel>
              {language === 'ar' ? 'الحساب' : 'Account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {isLoggedIn ? (
              <>
                <div className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@solarpulse.com</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {language === 'ar' ? 'الإعدادات' : 'Settings'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsLoggedIn(false)} className="text-destructive">
                  {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <div className="px-2 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {language === 'ar' ? 'لم تقم بتسجيل الدخول' : 'Not logged in'}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full mb-2"
                    onClick={() => setIsLoggedIn(true)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsLoggedIn(true)}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {language === 'ar' ? 'الدخول بـ Google' : 'Sign in with Google'}
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
